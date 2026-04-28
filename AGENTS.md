# AGENTS.md - chanzhiEPS 开发指南

## 项目概述
chanzhiEPS（蝉知EPS）是一个基于PHP的CMS/ERP系统，版本5.2。使用自定义MVC框架（基于ZenTaoPHP）。

## 架构要点

### 目录结构
- `system/` - 核心代码
  - `framework/` - 框架核心类（router, control, model, helper, seo）
  - `module/` - 45个功能模块（article, product, user, forum等）
  - `config/` - 配置文件
  - `db/` - 数据库SQL文件（包括升级脚本）
  - `lib/` - 第三方库
  - `bin/` - CLI工具
- `www/` - Web入口
  - `index.php` - 前台入口（RUN_MODE='front'）
  - `admin.php` - 后台入口（RUN_MODE='admin'）
  - `loader.php` - 框架加载器

### 入口点
- **前台访问**：`www/index.php` → `router::createApp('chanzhi', $systemRoot)`
- **后台访问**：`www/admin.php` → 设置RUN_MODE='admin'后创建应用
- **CLI访问**：`system/bin/xrcli` → 命令行路由器

## 关键配置

### 主配置文件
- `system/config/config.php` - 主配置（数据库、模块、语言等）
- `system/config/my.php` - 用户配置（持久化存储中，安装后生成）
- `system/config/domain.php` - 域名配置
- `system/config/guarder.php` - 安全配置

### 数据库配置
- 驱动：MySQL
- 表前缀：`eps_`
- 字符集：UTF8
- 配置位置：`system/config/config.php` → `$config->db`

### 语言支持
- 简体中文（zh-cn）、繁体中文（zh-tw）、英文（en）
- 语言文件：`system/module/[模块]/lang/[语言].php`

## 开发工作流

### 常用命令
```bash
# 检查语言项和动作（开发辅助）
php system/bin/check.php

# CLI路由器（测试路由）
php system/bin/xrcli "http://www.chanzhi.org/article-browse.html"
```

### 模块开发
每个模块位于 `system/module/[模块名]/`，包含：
- `control.php` - 控制器
- `model.php` - 模型
- `lang/` - 语言文件
- `view/` - 视图模板
- `ext/` - 扩展文件

### 配置加载顺序
1. `system/config/config.php`（主配置）
2. `system/config/guarder.php`（安全配置）
3. `system/config/my.php`（用户配置）
4. `system/config/domain.php`（域名配置）
5. `system/config/[RUN_MODE].php`（模式配置）
6. `system/config/shop.php`（商城配置）
7. `system/config/sensitive.php`（敏感词配置）

## 部署注意事项

### Heroku部署
- 使用 `Procfile` 启动：`web: /bin/bash run.sh`
- 持久化存储目录：`/data`
- 应用目录：`/app`
- Web服务器：`vendor/bin/heroku-php-nginx www/`

### 目录权限
以下目录需要可写权限：
- `system/config/`（配置文件）
- `system/tmp/`（临时文件）
- `www/data/`（上传数据）
- `www/template/`（模板缓存）

### 安装流程
1. 访问 `www/install.php` 进行安装
2. 安装完成后生成 `system/config/my.php`
3. 安装完成后删除 `install.php` 和 `upgrade.php`

## 代码规范

### 命名约定
- 类名：小写（如 `router`, `control`, `model`）
- 方法名：驼峰式（如 `loadCommon`, `parseRequest`）
- 常量：大写下划线（如 `RUN_MODE`, `TABLE_CONFIG`）

### 数据库查询
- 使用PDO扩展
- 表名使用常量定义（如 `TABLE_ARTICLE`, `TABLE_PRODUCT`）
- 查询使用预处理语句

### 安全实践
- 用户输入过滤：`helper::removeUTF8Bom()`
- XSS防护：`$config->allowedTags` 定义允许的标签
- 文件上传：检查扩展名和大小限制

## 调试技巧

### 开启调试模式
在 `run.sh` 中设置 `DEBUG=1` 开启bash调试。

### 日志查看
- 错误日志：`system/tmp/` 目录
- 访问日志：数据库 `eps_statlog` 表

### 常见问题
- 如果页面空白，检查 `system/config/my.php` 是否存在
- 如果404错误，检查URL重写规则（`.htaccess`）
- 如果样式丢失，检查 `www/data/` 目录权限

## 扩展开发

### 插件机制
- 扩展文件位于 `system/module/[模块]/ext/`
- 扩展配置：`system/config/ext/*.php`
- 扩展语言：`system/module/[模块]/ext/lang/[语言]/`

### 主题开发
- 主题目录：`www/template/`
- 主题配置：`system/config/config.php` → `$config->template`
- 支持LESS编译（`system/lib/lessc/`）

## 测试和验证

### 代码检查
```bash
# 检查语言项一致性
php system/bin/check.php

# 检查PHP语法
php -l system/module/[模块]/control.php
```

### 数据库升级
升级SQL文件位于 `system/db/`，按版本号命名（如 `upgrade5.1.sql`）。

## 重要提醒

1. **不要修改框架核心文件**：`system/framework/` 下的文件
2. **备份配置文件**：修改前备份 `system/config/` 下的文件
3. **数据库前缀**：所有表名都使用 `eps_` 前缀
4. **字符编码**：统一使用UTF-8编码
5. **时区设置**：默认为 `Asia/Shanghai`
