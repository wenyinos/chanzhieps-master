# ChanzhiEPS

**English** | [简体中文](README.zh-CN.md)

ChanzhiEPS is an open-source CMS/ERP system built with PHP, designed for enterprise portals, content management, e-commerce, and community forums.

**Version:** 5.2.2 | **License:** ZPL 1.2 | **PHP:** 8.4+

## Download

Source packages are published on the [Releases](https://github.com/wenyinos/chanzhieps-master/releases) page.

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

## Templates and Themes

- Built-in front-end templates: `default`, `mobile`, and `wenyinos` (purple content theme inspired by wenyinos.com; the header uses a Wenyinos-inspired purple navigation bar and there is no full-screen banner).
- Template views live in `www/template/<name>/`; metadata in `_doc/*.yaml`; theme styles in `www/theme/<template>/<theme>/style.less`.
- The online theme store has been removed. Local themes can still be selected, customized, uploaded, installed, exported, and deleted from Admin → Appearance.

## Requirements

### PHP

- PHP 8.4+ (verified on PHP 8.5.12)

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

```
location / {
    try_files $uri $uri/ /index.php?$query_string;
    
    # Or use PATH_INFO mode
    if (!-e $request_filename) {
        rewrite ^/(.*)$ /index.php/$1 last;
    }
}
```

## PHP 8.4+ Compatibility Fixes

The following fixes were applied to support PHP 8.4+ (verified on PHP 8.5.12 with MySQL 5.7.44):

| File | Issue | Fix |
|------|-------|-----|
| `system/lib/ip/ip.class.php:64` | Curly brace string offset `$string{0}` removed in PHP 8 | Changed to `$string[0]` |
| `system/lib/filter/filter.class.php:651` | `FILTER_SANITIZE_MAGIC_QUOTES` removed in PHP 8.1 | Changed to `addslashes()` |
| `system/lib/dao/dao.class.php:583` | `$this->method` was reset before use; `$this->slaveDBH` called when false | Fixed to use `$method` and `$this->dbh` |
| `system/framework/helper.class.php:90` | `call_user_func_array` with named params (`'param'` vs `'params'`) | Changed to positional arguments |
| `system/framework/helper.class.php:1152` | HTTPS detection missing proxy headers | Added `isHTTPS()` with `X-Forwarded-Proto` support |
| `system/config/admin.php:3` | `$config->rights` not initialized | Added `if(!isset($config->rights))` check |
| `system/module/setting/model.php:181` | `$config[$record->owner]` not initialized | Added `stdclass()` initialization |
| `system/module/site/control.php:196` | `count()` on string after `join()` | Changed to `count($locations)` |
| `system/module/user/model.php:1175,1195` | Same `count()` on string bug | Changed to `count($locations)` |
| `system/module/common/model.php:300,310` | HTTPS redirect loop when scheme mismatch | Auto-upgrade scheme if request is HTTPS |
| `system/lib/smarty/sysplugins/*.php` | Implicit nullable params deprecated in PHP 8.4 | Added `?` prefix to typed params |
| `system/lib/mobile/mobile.class.php:646` | Implicit nullable `array` param | Changed to `?array` |
| `system/module/error/control.php` | Controller class `error` conflicts with PHP's built-in `Error` class | Renamed to `errorControl`; router resolves `<module>Control` |
| `system/framework/router.class.php` | `trigger_error(E_USER_ERROR)` deprecated in PHP 8.4; duplicate `DS` definition | Explicit exit; guarded `DS` definition |
| `system/framework/helper.class.php` | `die(header(...))` passes `null` to `exit()` (deprecated in PHP 8.5) | Split into `header()` + `die()` |
| `system/lib/pager/pager.class.php`, `system/lib/lessc/lessc.class.php` | Dynamic property creation deprecated in PHP 8.2 | Added `#[AllowDynamicProperties]` |
| `system/lib/lessc/lessc.class.php` | Wrong color indices, float-to-int modulo, `preg_match` null flags | Corrected indices, explicit casts, `0` flags |
| Module models listed in `CHANGELOG` | Optional parameters before required parameters deprecated | Removed impossible defaults to match call sites |
| `system/module/mail/model.php` | Backtick operator deprecated in PHP 8.5 | Replaced with `shell_exec()` |
| `system/lib/purifier/**` | `trigger_error(E_USER_ERROR)` deprecated in PHP 8.4 | Switched bundled HTMLPurifier error level to `E_USER_WARNING` |
| `system/module/common/lang/*.php` | Duplicate `DT_*` constants when multiple language files load | Guarded with `defined()` |
| `system/db/chanzhi.sql`, `system/db/upgrade5.2.1.sql` | `password char(32)` truncates bcrypt hashes | Changed to `varchar(255)`; added 5.2.1 upgrade script |
| `system/bin/xrcli`, `system/bin/check.php` | `E_STRICT` removed in PHP 8.4; CLI bootstrap issues | Updated CLI bootstrap and checks |
| `www/template/mobile/common/header.lite.html.php` | Unparenthesized nested ternary (fatal since PHP 8) | Added parentheses |
| `system/module/tree/model.php`, `system/module/page/control.php` | `trim(null)` and empty `ORDER BY` | Explicit string cast and order |

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
