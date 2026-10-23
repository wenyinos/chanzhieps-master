# 蝉知EPS

[English](README.md) | **简体中文**

蝉知EPS是一个开源的CMS/ERP系统，基于PHP开发，适用于企业门户、内容管理、电子商务和社区论坛。

**版本：** 5.2.2 | **协议：** ZPL 1.2 | **PHP：** 8.4+

## 下载

源码包发布在 [Releases](https://github.com/wenyinos/chanzhieps-master/releases) 页面。

## 功能特性

- 文章、博客、产品和论坛管理
- 多语言支持（简体中文、繁体中文、英文）
- 可视化页面编辑器，支持拖拽布局
- 内置电子商务，包含购物车和订单管理
- 微信公众号集成
- 主题/模板系统，支持LESS编译
- SEO优化和站点地图生成
- 基于角色的用户权限管理
- 移动端自适应模板

## 模板与主题

- 内置前台模板：`default`、`mobile`、`wenyinos`（玟茵紫，参考 wenyinos.com 的紫色内容主题，顶部导航采用紫色渐变风格，不使用全屏 banner）。
- 模板视图位于 `www/template/<模板>/`，元数据在 `_doc/*.yaml`；主题样式位于 `www/theme/<模板>/<主题>/style.less`。
- 已移除在线主题市场；本地主题仍可在后台“外观/主题管理”中选择、自定义、上传、安装、导出和删除。

## 环境要求

### PHP

- PHP 8.4+（已在 PHP 8.5.12 验证）

### 必需扩展

| 扩展 | 用途 |
|---|---|
| `pdo` | 数据库连接 |
| `mbstring` | 多字节字符串处理 |
| `json` | JSON编码/解码 |
| `gd` | 图像处理 |

### 可选扩展

| 扩展 | 用途 |
|---|---|
| `iconv` | 字符编码转换 |
| `curl` | HTTP请求和OAuth |
| `zip` | 主题和插件导入/导出 |
| `xml` | XML解析和站点地图生成 |
| `session` | 用户会话管理 |

### 其他

- MySQL
- Web服务器（Nginx或启用`mod_rewrite`的Apache）

## 安装

1. 克隆仓库，将Web服务器根目录指向 `www/`
2. 确保以下目录可写：
   - `system/config/`
   - `system/tmp/`
   - `www/data/`
   - `www/template/`
3. 创建MySQL数据库（UTF-8字符集）
4. 访问 `http://你的域名/install.php` 按向导完成安装
5. 安装完成后自动生成 `system/config/my.php`，安装程序会自动删除 `install.php` 和 `upgrade.php`

## 配置说明

| 文件 | 用途 |
|---|---|
| `system/config/config.php` | 主配置（数据库、模块、语言、模板） |
| `system/config/my.php` | 站点配置（安装后生成，不在仓库中） |
| `system/config/domain.php` | 域名绑定 |
| `system/config/guarder.php` | 安全配置（IP过滤、验证码、防灌水） |
| `system/config/shop.php` | 商城配置 |
| `system/config/sensitive.php` | 敏感词过滤 |

## 开发

### 常用命令

```bash
# 检查语言项一致性
php system/bin/check.php

# CLI路由测试
php system/bin/xrcli "http://www.chanzhi.org/article-browse.html"

# 同步扩展文件（需要安装inotify-tools）
system/bin/syncext.sh <源目录> <目标目录>
```

### 命名规范

- **类名：** 小写（`router`, `control`, `model`）
- **方法名：** 驼峰式（`loadCommon`, `parseRequest`）
- **常量：** 大写下划线（`RUN_MODE`, `TABLE_ARTICLE`）
- **数据库表：** 使用 `eps_` 前缀（如 `eps_article`, `eps_user`）

## 部署

### Heroku

项目包含 `Procfile` 和 `run.sh`，支持Heroku部署。启动脚本会自动创建持久化存储目录、建立符号链接，并通过 `heroku-php-nginx www/` 启动服务。

### 标准部署

将Web服务器根目录指向 `www/`，确保URL重写已启用（Apache规则见 `www/.htaccess`）。默认请求类型为 `PATH_INFO`，参数分隔符为 `-`。

## 调试

- 在 `system/config/my.php` 中设置 `$config->debug = true;` 开启PHP错误报告和日志记录
- 设置 `$config->debug = 2;` 可在页面上直接显示警告和通知（仅限开发环境）
- 错误日志记录在 `system/tmp/log/php.YYYYMMDD.php`
- SQL日志记录在 `system/tmp/log/sql.YYYYMMDD.php`（debug开启时）
- 在 `run.sh` 中设置 `DEBUG=1` 开启bash调试

## 伪静态配置

### Apache

`www/.htaccess` 已包含重写规则，确保已启用 `mod_rewrite` 并设置 `AllowOverride All`。

### Nginx

```
location / {
    try_files $uri $uri/ /index.php?$query_string;
    
    # 或者使用 PATH_INFO 模式
    if (!-e $request_filename) {
        rewrite ^/(.*)$ /index.php/$1 last;
    }
}
```

## PHP 8.4+ 兼容性修复

以下修复已应用以支持 PHP 8.4+（已在 PHP 8.5.12 + MySQL 5.7.44 环境验证）：

| 文件 | 问题 | 修复方式 |
|------|------|----------|
| `system/lib/ip/ip.class.php:64` | 花括号字符串偏移 `$string{0}` 在 PHP 8 中移除 | 改为 `$string[0]` |
| `system/lib/filter/filter.class.php:651` | `FILTER_SANITIZE_MAGIC_QUOTES` 常量在 PHP 8.1 中移除 | 改为 `addslashes()` |
| `system/lib/dao/dao.class.php:583` | `$this->method` 已被 reset；`$this->slaveDBH` 为 false 时误调用 | 改用 `$method` 和 `$this->dbh` |
| `system/framework/helper.class.php:90` | `call_user_func_array` 命名参数不匹配（`'param'` vs `'params'`） | 改为位置参数 |
| `system/framework/helper.class.php:1152` | HTTPS 检测不支持反向代理头 | 新增 `isHTTPS()` 函数，支持 `X-Forwarded-Proto` |
| `system/config/admin.php:3` | `$config->rights` 未初始化 | 添加 `if(!isset(...))` 检查 |
| `system/module/setting/model.php:181` | `$config[$record->owner]` 未初始化 | 添加 `stdclass()` 初始化 |
| `system/module/site/control.php:196` | `join()` 后对字符串使用 `count()` | 改为 `count($locations)` |
| `system/module/user/model.php:1175,1195` | 同上 `count()` 字符串 bug | 改为 `count($locations)` |
| `system/module/common/model.php:300,310` | scheme 不匹配导致 HTTPS 重定向循环 | 请求为 HTTPS 时自动升级 scheme |
| `system/lib/smarty/sysplugins/*.php` | PHP 8.4 弃用隐式 nullable 参数 | 添加 `?` 前缀 |
| `system/lib/mobile/mobile.class.php:646` | 隐式 nullable `array` 参数 | 改为 `?array` |
| `system/module/error/control.php` | 控制器类名 `error` 与 PHP 内置 `Error` 类冲突 | 重命名为 `errorControl`，路由支持 `<module>Control` |
| `system/framework/router.class.php` | PHP 8.4 弃用 `trigger_error(E_USER_ERROR)`；`DS` 重复定义 | 显式退出；`DS` 定义前加检查 |
| `system/framework/helper.class.php` | `die(header(...))` 向 `exit()` 传入 `null`（PHP 8.5 弃用） | 拆分为 `header()` + `die()` |
| `system/lib/pager/pager.class.php`、`system/lib/lessc/lessc.class.php` | PHP 8.2 弃用动态属性 | 添加 `#[AllowDynamicProperties]` |
| `system/lib/lessc/lessc.class.php` | 颜色索引错误、浮点取模、`preg_match` null flags | 修正索引、显式类型转换、flags 改为 0 |
| `CHANGELOG` 中列出的模块模型 | 可选参数位于必选参数之前 | 移除无效默认值，与实际调用一致 |
| `system/module/mail/model.php` | PHP 8.5 弃用反引号运算符 | 改为 `shell_exec()` |
| `system/lib/purifier/**` | PHP 8.4 弃用 `trigger_error(E_USER_ERROR)` | 内置 HTMLPurifier 错误级别改为 `E_USER_WARNING` |
| `system/module/common/lang/*.php` | 多语言文件重复定义 `DT_*` 常量 | 使用 `defined()` 保护 |
| `system/db/chanzhi.sql`、`system/db/upgrade5.2.1.sql` | `password char(32)` 截断 bcrypt 哈希 | 改为 `varchar(255)`，新增 5.2.1 升级脚本 |
| `system/bin/xrcli`、`system/bin/check.php` | PHP 8.4 移除 `E_STRICT`；CLI 启动问题 | 更新 CLI 引导与检查逻辑 |
| `www/template/mobile/common/header.lite.html.php` | 未加括号的嵌套三元表达式（PHP 8 起致命错误） | 添加括号 |
| `system/module/tree/model.php`、`system/module/page/control.php` | `trim(null)` 与空 `ORDER BY` | 显式字符串转换与排序 |

## 第三方库

| 库 | 版本 | 用途 |
|---|---|---|
| Smarty | 3.1.47 | 模板引擎 |
| HTML Purifier | 4.17.0 | HTML过滤和XSS防护 |
| PHPMailer | 5.x | 邮件发送 |
| lessc | 0.x | LESS CSS编译 |
| Snoopy | 1.2.4 | HTTP客户端 |
| pclzip | 2.x | ZIP压缩处理 |
| PHP QR Code | 1.1.4 | 二维码生成 |

## 许可协议

蝉知EPS遵循 [Z公共许可证 1.2](system/doc/LICENSE)。
