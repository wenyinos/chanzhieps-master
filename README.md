# ChanzhiEPS

ChanzhiEPS is an open-source CMS/ERP system built with PHP, designed for enterprise portals, content management, e-commerce, and community forums.

**Version:** 5.2_php8 | **License:** ZPL 1.2 | **PHP:** 8.0 ~ 8.5

---

## Features

- Article, blog, product, and forum management
- Multi-language support (Simplified Chinese, Traditional Chinese, English)
- Visual page builder with drag-and-drop layout editing
- Built-in e-commerce with shopping cart and order management
- WeChat public account integration
- Theme/template system with LESS compilation
- SEO optimization and sitemap generation
- User management with role-based access control
- Mobile-responsive templates

## Requirements

### PHP

- PHP 8.0 ~ 8.5

### Required Extensions

| Extension | Purpose |
|---|---|
| `pdo` | Database connectivity |
| `mbstring` | Multi-byte string handling |
| `json` | JSON encoding/decoding |
| `gd` | Image processing |

### Optional Extensions

| Extension | Purpose |
|---|---|
| `iconv` | Character encoding conversion |
| `curl` | HTTP requests and OAuth |
| `zip` | Theme and plugin import/export |
| `xml` | XML parsing and sitemap generation |
| `session` | User session management |

### Other

- MySQL
- Web server (Nginx or Apache with `mod_rewrite`)

## Directory Structure

```
├── system/                  # Core application code
│   ├── framework/           # MVC framework (router, control, model, helper, seo)
│   ├── module/              # 45 functional modules (article, product, user, forum, etc.)
│   ├── config/              # Configuration files
│   ├── db/                  # Database schema and upgrade scripts
│   ├── lib/                 # Third-party libraries
│   └── bin/                 # CLI utilities
├── www/                     # Web root
│   ├── index.php            # Front-end entry point
│   ├── admin.php            # Admin panel entry point
│   ├── loader.php           # Framework loader
│   ├── data/                # Uploaded files
│   └── template/            # Compiled templates
├── composer.json
├── Procfile                 # Heroku deployment
└── run.sh                   # Startup script
```

## Installation

1. Clone the repository and configure your web server to point to the `www/` directory.
2. Ensure the following directories are writable:
   - `system/config/`
   - `system/tmp/`
   - `www/data/`
   - `www/template/`
3. Create a MySQL database (UTF-8 charset).
4. Visit `http://your-domain/install.php` and follow the wizard.
5. After installation, `system/config/my.php` will be generated. The installer will remove `install.php` and `upgrade.php` automatically if `my.php` exists.

## Configuration

| File | Purpose |
|---|---|
| `system/config/config.php` | Main config (database, modules, languages, templates) |
| `system/config/my.php` | Site-specific settings (generated on install, not in repo) |
| `system/config/domain.php` | Domain bindings |
| `system/config/guarder.php` | Security settings (IP filtering, CAPTCHA, anti-spam) |
| `system/config/shop.php` | E-commerce settings |
| `system/config/sensitive.php` | Sensitive word filter |

Config files are loaded in order: `config.php` -> `guarder.php` -> `my.php` -> `domain.php` -> `[RUN_MODE].php` -> `shop.php` -> `sensitive.php`.

## Development

### CLI Tools

```bash
# Check language key consistency across modules
php system/bin/check.php

# Route testing via CLI (simulates a web request)
php system/bin/xrcli "http://www.chanzhi.org/article-browse.html"

# Sync extensions with file watching (requires inotify-tools)
system/bin/syncext.sh <src> <dest>
```

### Module Structure

Each module lives in `system/module/<name>/` and contains:

| File/Dir | Description |
|---|---|
| `control.php` | Controller (extends `control` base class) |
| `model.php` | Model (extends `model` base class) |
| `lang/` | Language files (`zh-cn.php`, `zh-tw.php`, `en.php`) |
| `view/` | View templates |
| `ext/` | Extensions (controller overrides, extra language files) |

### Naming Conventions

- **Classes:** lowercase (`router`, `control`, `model`)
- **Methods:** camelCase (`loadCommon`, `parseRequest`)
- **Constants:** UPPER_SNAKE_CASE (`RUN_MODE`, `TABLE_ARTICLE`)
- **Database tables:** prefixed with `eps_` (e.g., `eps_article`, `eps_user`)

### Database

The system uses PDO with MySQL. Table constants are defined in `system/config/config.php` (e.g., `TABLE_ARTICLE`, `TABLE_PRODUCT`). Upgrade scripts are located in `system/db/` and named by version (e.g., `upgrade5.1.sql`).

## Deployment

### Heroku

The project includes a `Procfile` and `run.sh` for Heroku deployment. The startup script:

1. Creates persistent storage directories under `/data`
2. Symlinks them into the app at `/app`
3. Cleans up `install.php`/`upgrade.php` if already installed
4. Starts Nginx via `heroku-php-nginx www/`

### Standard Server

Point your web server document root to `www/`. Ensure URL rewriting is enabled (see `www/.htaccess` for Apache rules). The default request type is `PATH_INFO` with `-` as the parameter divider.

## Debugging

- Set `$config->debug = true;` in `system/config/my.php` to enable PHP error reporting and logging.
- Set `$config->debug = 2;` to display warnings/notices directly on page (development only).
- Error logs are written to `system/tmp/log/php.YYYYMMDD.php`.
- SQL logs are written to `system/tmp/log/sql.YYYYMMDD.php` (when debug is on).
- Set `DEBUG=1` in `run.sh` to enable bash debug tracing.

## URL Rewriting

### Apache

The `www/.htaccess` file contains the rewrite rules. Ensure `mod_rewrite` is enabled and `AllowOverride All` is set for the `www/` directory.

### Nginx

```nginx
location / {
    try_files $uri $uri/ /index.php/$uri;
}
```

## Third-party Libraries

| Library | Version | Purpose |
|---|---|---|
| Smarty | 3.1.47 | Template engine |
| HTML Purifier | 4.17.0 | HTML filtering and XSS prevention |
| PHPMailer | 5.x | Email sending |
| lessc | 0.x | LESS CSS compilation |
| Snoopy | 1.2.4 | HTTP client |
| pclzip | 2.x | ZIP archive handling |
| PHP QR Code | 1.1.4 | QR code generation |

## License

ChanzhiEPS is licensed under the [Z Public License 1.2](system/doc/LICENSE).

---

# 蝉知EPS

蝉知EPS是一个开源的CMS/ERP系统，基于PHP开发，适用于企业门户、内容管理、电子商务和社区论坛。

**版本：** 5.2_php8 | **协议：** ZPL 1.2 | **PHP：** 8.0 ~ 8.5

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

## 环境要求

### PHP

- PHP 8.0 ~ 8.5

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

```nginx
location / {
    try_files $uri $uri/ /index.php/$uri;
}
```

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
