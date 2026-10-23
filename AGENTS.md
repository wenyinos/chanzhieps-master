# AGENTS.md — chanzhiEPS 开发指南

本文件面向在本仓库工作的开发者与 AI Agent。内容以当前代码为准，涉及路径、类名、配置项时请先核对源码。

## 1. 项目概览

- **产品**：chanzhiEPS（蝉知），企业门户 CMS，包含文章、产品/商城、论坛、博客、手册、企业信息等模块。
- **版本**：`5.2.1`（`system/config/config.php` 中的 `$config->version`）。
- **许可**：ZPL 1.2。
- **技术栈**：PHP + 自研 MVC 框架（ZenTaoPHP 风格）+ MySQL + 原生 PHP 视图；前端基于 ZUI，主题样式使用 LESS。
- **代码规模**：约 1200 个 PHP 文件，`system/module/` 下 44 个功能模块。
- **文档**：`README.md`（英文）、`README.zh-CN.md`（中文）、`AGENTS.md`（开发指南）、`system/doc/CHANGELOG`（变更记录）。

## 2. 环境与依赖

- **PHP >= 8.4**（`composer.json` 的 `require`），已在 **PHP 8.5.12** 验证。必需扩展：`pdo`、`mbstring`、`json`、`gd`；可选：`iconv`、`curl`、`zip`、`xml`、`session`。
- **MySQL**：通过 PDO 访问，库编码 `UTF8`，表前缀 `eps_`，关闭严格模式；已在 MySQL 5.7.44 验证。
- **Web 服务器**：Nginx 或 Apache（需 URL 重写），站点根目录指向 `www/`。
- **Composer**：仓库没有 `autoload` 配置，也没有 `vendor/`；框架与第三方库（Smarty、lessc、PHPMailer、pclzip 等）位于 `system/lib/` 并手动 include。不要假设 `composer install` 后类可自动加载。
- **测试**：没有 PHPUnit 或其它自动化测试套件，验证以语法检查、CLI 路由和手工页面验证为主。已覆盖安装、前后台页面、CLI 路由、 `check.php` 与 5.2_php8 → 5.2.1 升级流程。
- **PHP 8.4+ 兼容约束**：不要重新引入 `E_STRICT`、`trigger_error(..., E_USER_ERROR)`、将 `header()` 返回值传给 `die()`、隐式 nullable 参数、无 `#[AllowDynamicProperties]` 的动态属性类；新增模块类名不得与 PHP 内置类冲突（如 `Error`）。

## 3. 目录结构

```text
system/
  framework/        # 框架核心：router / control / model / helper / seo / parser.smarty
  module/           # 44 个模块，每个模块含 control.php、model.php、config.php、lang/、view/
  config/           # 配置：config.php、my.php（安装生成）、front.php、admin.php、route.php 等
  db/               # chanzhi.sql、demo.sql、upgrade*.sql
  lib/              # 第三方库与基础设施：dao、filter、smarty、lessc、mobile、zfile 等
  bin/              # CLI：check.php、xrcli、syncext.php、cn2tw.php
  tmp/              # 运行时可写：cache/、log/、model/、package/、theme/
www/
  index.php         # 前台入口（RUN_MODE=front）
  admin.php         # 后台入口（RUN_MODE=admin）
  install.php       # 安装入口（RUN_MODE=install）
  upgrade.php       # 升级入口（RUN_MODE=upgrade）
  loader.php        # 定义 $systemRoot 并加载框架类
  template/         # 前台视图：{default,mobile}/<module>/<method>.html.php
  theme/            # 主题包：{default,mobile}/<theme>/style.less
  data/             # 上传文件与生成资源（可写）
  zui/              # ZUI 前端库
```

## 4. 请求生命周期

1. 入口文件定义 `RUN_MODE`（`front` / `admin` / `install` / `upgrade` / `shell`），然后 `include 'loader.php'`。
2. `router::createApp('chanzhi', $systemRoot)` 创建应用并加载配置。
3. 入口执行初始化：
   - 前台：`loadCommon()->checkDomain()`，检查站点是否暂停，然后 `parseRequest()`、`checkPriv()`、`loadModule()`。
   - 后台：`checkAdminEntry()` → 强制 `requestType=GET`、默认模块 `admin`、默认方法 `index`，再 `parseRequest()`、`checkPriv()`、`loadModule()`。
4. `parseRequest()` 默认使用 `PATH_INFO`（`-` 分隔，如 `/article-browse-1.html`）；通过 `index.php?m=...&f=...` 访问时自动切换为 GET 模式（参数名 `m`、`f`、`t`、`l`）。
5. `loadModule()` 实例化 `<module>` 控制器（`class article extends control`），调用对应方法。
6. 控制器给 `$this->view` 赋值并调用 `$this->display()`；视图文件按第 6.4 节规则定位。

## 5. 配置系统

主配置为 `system/config/config.php`，随后按以下顺序覆盖（不存在则跳过）：

1. `guarder.php`（安全/IP/验证码）
2. `my.php`（安装时生成，保存数据库连接与 `$config->installed`；**不在仓库中**）
3. `route.php`（SEO 别名）
4. `domain.php`（多域名绑定）
5. `[RUN_MODE].php`：前台为 `front.php`（guest/member 权限），后台为 `admin.php`（管理员可访问 action）
6. `shop.php`（商城）
7. `sensitive.php`（敏感词）

后台模式额外加载 `menu.php`。

注意：

- **不要提交 `system/config/my.php`**，也不要在 `config.php` 中硬编码站点数据库密码。
- 站点运行时设置（站点名、主题、语言、开关等）保存在数据库 `eps_config` 表，由后台 `setting` 模块读写；修改默认值才改 `config.php`。
- 模块默认配置放在 `system/module/<module>/config.php`，形如 `$config->article->recPerPage = 5;`。

## 6. 模块开发

### 6.1 标准文件构成

```text
system/module/<module>/
  control.php     # class <module> extends control
  model.php       # class <module>Model extends model
  config.php      # 模块默认配置
  lang/           # zh-cn.php、zh-tw.php、en.php
  view/           # 后台视图：<method>.html.php（前台视图在 www/template）
  js/ css/        # 模块资源
  ext/            # 扩展覆盖（见 6.7）
```

模块级 PHP 文件（control/model/config/lang/view）首行必须加：

```php
<?php if(!defined("RUN_MODE")) die();?>
```

### 6.2 控制器

- 公共方法即路由 action，方法名使用 camelCase。
- 通过 `$this->loadModel('article')` 调用其他模块模型；`$this->article->xxx()` 访问当前模块模型。
- 生成链接一律用 `inlink('method', 'param=value')`、`$this->createLink()` 或 `commonModel::printLink()`，不要手写 URL。
- AJAX 返回使用 `$this->send(array('result' => 'success', 'message' => ..., 'locate' => ...))`。
- 跳转使用 `$this->locate($url)`。
- 新增后台 action 需要同时在 `system/module/group/lang/resource.php` 登记，否则无法在权限界面分配。

### 6.3 模型与数据库

- 模型继承 `model`，通过 `$this->dao` 访问数据库。
- 查询使用链式 DAO：

```php
$article = $this->dao->select('*')->from(TABLE_ARTICLE)
    ->where('id')->eq($id)
    ->fetch();

$this->dao->insert(TABLE_ARTICLE)->data($article)->exec();
$this->dao->update(TABLE_ARTICLE)->data($article)->where('id')->eq($id)->exec();
```

- 表名必须使用 `TABLE_*` 常量（定义在 `system/config/config.php`），不要硬编码 `eps_` 表名。
- 不要手工拼接 SQL；需要排序/分页时使用 `->orderBy()`、`->limit()` 和 `pager` 类。
- 常用表：`eps_article`、`eps_product`、`eps_category`、`eps_relation`、`eps_user`、`eps_group`、`eps_grouppriv`、`eps_config`、`eps_file`、`eps_order` 等。

### 6.4 视图与模板

- **后台/RUN_MODE != front**：视图在 `system/module/<module>/view/<method>.<type>.php`，如 `admin.html.php`。
- **前台**：视图在 `www/template/<template>/<module>/<method>.html.php`，如 `www/template/default/article/browse.html.php`。
- 移动端视图使用 `m.` 前缀（如 `m.browse.html.php`）；找不到时回退桌面视图。
- 视图类型由 `$config->views` 支持：`html`、`mhtml`、`json`、`xml`。
- 在视图中可直接使用 `$this->view` 上赋的值、全局 `$lang`、`$config`，以及 `html::`、`js::`、`css::` 等 helper。
- 前台视图默认是原生 PHP 模板；`$config->template->parser` 设为其它值时才启用对应解析器（`system/framework/parser.smarty.class.php`）。
- 主题样式位于 `www/theme/<template>/<theme>/style.less`，由 `ui` 模块调用 `system/lib/lessc` 编译；默认桌面模板 `default/default`，移动模板 `mobile/colorful`。不要直接改 `www/data/` 下的编译产物。

### 6.5 多语言

- 支持 `zh-cn`、`zh-tw`、`en`，默认 `zh-cn`。
- 文案通过 `$lang-><module>-><key>` 输出，禁止在控制器/视图中硬编码界面文案。
- 新增语言键时必须同步补齐三个语言文件；`zh-cn` 是基准，`en.php` 的行序通常与之一致。
- 语言文件加载顺序：模块 `lang/<lang>.php` → 模板 `_lang/<module>/<lang>.php` → 模块 `ext/lang/<lang>/*.php`。

### 6.6 权限

- 前台权限在 `system/config/front.php`：`$config->rights->guest[...]` 与 `$config->rights->member[...]`。
- 后台权限在 `system/config/admin.php`：`$config->rights->admin[...]`，只有管理员可访问。
- 更细的后台角色权限存于 `eps_group` / `eps_grouppriv`，通过 `group` 模块维护。
- 权限入口为 `commonModel::checkPriv()` / `isOpenMethod()`；新增 action 后要确认它属于 guest、member 还是后台权限集合。

### 6.7 扩展机制

扩展放在模块内，没有 `system/config/ext/` 目录：

```text
system/module/<module>/ext/
  control/<method>.php          # 覆盖指定 action
  model/<method>.php            # 覆盖模型方法
  view/                         # 覆盖视图（后台）
  lang/<lang>/*.php             # 追加语言项
  config/                       # 追加配置
```

- 站点级覆盖优先：`ext/_<siteCode>/...` 优先于 `ext/...`。
- 主题/插件包由 `package` 模块安装；`system/bin/syncext.php` 只是开发期文件同步工具，不是运行时加载机制。

## 7. 数据库与升级

- 表前缀 `eps_`，默认引擎 MyISAM，字符集 utf8；SQL 方言为 MySQL。
- 全新安装结构：`system/db/chanzhi.sql`；演示数据：`system/db/demo.sql`。
- 结构变更需要同时处理：
  1. 更新 `system/db/chanzhi.sql`（新安装）；
  2. 新增 `system/db/upgrade<version>.sql`（已有站点升级，命名参照现有文件）；
  3. 如涉及版本号，更新 `system/config/config.php` 的 `$config->version`。
- 当前版本为 `5.2.1`，`system/db/` 中最新的升级脚本是 `upgrade5.2.1.sql`。
- `eps_user.password` 为 `varchar(255)`，用于完整存储 bcrypt 哈希（60 字符）；`upgrade5.2.1.sql` 会放宽旧库的 `char(32)` 字段。
- 安装：访问 `www/install.php`，成功后生成 `system/config/my.php`。
- 升级：访问 `www/upgrade.php`；`run.sh` 在检测到 `my.php` 后会删除 `install.php` 与 `upgrade.php`。
- 不要直接修改已安装站点的 `eps_config` 数据来改站点设置，应通过后台 `setting` 模块。

## 8. 常用命令与验证

```bash
# PHP 语法检查
php -l system/module/article/control.php

# 语言键一致性检查（脚本内部使用 ../module 相对路径，必须在 system/bin 下运行）
cd system/bin && php check.php

# 用 CLI 模拟一次前台路由（需要已安装：my.php 存在且数据库可连）
php system/bin/xrcli "http://www.chanzhi.org/article-browse.html"

# 本地临时调试（PATH_INFO 重写仍需 Nginx/Apache；用 GET 参数访问）
php -S 127.0.0.1:8080 -t www
# http://127.0.0.1:8080/index.php?m=index&f=index
```

- 修改语言或 action 后优先运行 `check.php`。
- 涉及路由/前台页面时，用 `xrcli` 或实际页面验证，并查看 `system/tmp/log/`。
- 不要声称存在 `composer test`、`npm test` 等命令；本仓库没有这些脚本。

## 9. 调试

- 在 `system/config/my.php` 中设置 `$config->debug = true;` 开启日志；设为 `2` 可直接在页面显示警告/通知（仅开发环境）。
- 日志目录：`system/tmp/log/`（PHP 错误、SQL 日志按日期生成）。
- 前台入口当前为 `error_reporting(0)`；后台入口 `www/admin.php` 开启 `E_ALL` 并注册了致命错误输出，便于定位后台白屏。
- 页面空白时依次检查：`system/config/my.php` 是否存在、数据库是否可连、`system/tmp/` 权限、Web 服务器重写规则。
- `run.sh` 中设置 `DEBUG=1` 可开启 Bash 调试。

## 10. 部署

- Web 根目录必须是 `www/`，不要把项目根目录暴露给 Web。
- 需要可写权限：`system/config/`、`system/tmp/`、`www/data/`、`www/template/`（`run.sh` 还会软链 `system/module/`）。
- Apache：`www/.htaccess` 提供重写规则，需启用 `mod_rewrite` 且允许 `AllowOverride`。
- Nginx：将不存在的路径重写到 `index.php`，或使用 PATH_INFO 重写。
- Heroku：`Procfile` 执行 `run.sh`；脚本把上述目录迁移/软链到持久化目录 `/data`，安装完成后删除 `install.php`、`upgrade.php`，最后启动 `vendor/bin/heroku-php-nginx www/`。
- 线上部署与服务器操作由用户手动完成；本仓库的工作只做到本地修改、提交与推送。

## 11. 编码约定

- 缩进 4 空格；文件使用 UTF-8 无 BOM；纯 PHP 文件不写结束标签 `?>`。
- 类名小写（`article`、`articleModel`）；方法 camelCase（`getByID`、`loadCommon`）；常量 UPPER_SNAKE（`RUN_MODE`、`TABLE_ARTICLE`）。
- 文件命名：控制器 `control.php`、模型 `model.php`、配置 `config.php`、视图 `<method>.<type>.php`。
- 保留现有版权头与 `if(!defined("RUN_MODE")) die();` 防护。
- 输出 HTML 时使用 `html::` helper 或 `htmlspecialchars()`；富文本按 `$config->allowedTags`（前台/后台两套）过滤。
- 输入通过 `$this->post`、`$this->get`、`$this->server` 等 `super` 对象读取；路由层已对超全局执行 `processArrayEvils`，但仍需按业务校验类型与范围。
- 错误处理使用 `$this->app->triggerError($message, __FILE__, __LINE__)`，不要静默吞掉异常。
- 只改任务范围内的文件，匹配周围代码风格，不顺手重构无关模块。

## 12. 高风险与禁止事项

- 未经明确授权，不修改：数据库结构/ORM 相关定义、认证与权限逻辑、支付/订单/财务代码、核心业务算法。
- 不修改 `system/framework/` 下的框架核心（全站依赖）；确需修改时先说明影响面并做全量验证。
- 不提交 `system/config/my.php`、数据库密码、API 密钥、上传文件或 `system/tmp/` 内容。
- 不直接编辑 `eps_config` 表或 `www/data/` 下的生成文件。
- 不新增 Composer 依赖或前端构建链，除非任务明确要求。
- 不通过 SSH 登录或操作服务器；部署由用户手动执行。
