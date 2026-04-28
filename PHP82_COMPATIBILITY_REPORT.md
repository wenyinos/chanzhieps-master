# PHP 8.2 兼容性评估报告

**评估日期：** 2026-04-29
**项目：** chanzhiEPS 5.2
**目标版本：** PHP 8.2+

---

## 结论

项目**已修复** PHP 8.2 兼容性问题。所有最高优先级、高优先级和中优先级问题均已修复。

---

## 问题清单

### 🔴 最高优先级：动态属性 (Dynamic Properties)

PHP 8.2 废弃了隐式动态属性。未声明的属性通过 `$this->prop = val` 赋值时会触发 `Deprecated` 警告。

**受影响的框架基类：**

| 文件 | 类名 | 说明 |
|------|------|------|
| `system/framework/router.class.php` | `router`, `config`, `language`, `super` | 路由器核心类 |
| `system/framework/control.class.php` | `control` | 控制器基类，45个模块继承 |
| `system/framework/model.class.php` | `model` | 模型基类 |
| `system/framework/helper.class.php` | `helper` | 辅助类 |
| `system/framework/seo.class.php` | `seo`, `uri` | SEO类 |
| `system/framework/parser.smarty.class.php` | `smartyParser` | 模板解析器 |
| `system/lib/dao/dao.class.php` | `dao` | 数据库访问层 |

**修复方案：** 在每个类声明前添加 `#[AllowDynamicProperties]` 属性。

---

### 🔴 高优先级：第三方库版本过旧

#### Smarty 3.1.19 → 3.1.47

| 问题 | 文件 | 状态 |
|------|------|------|
| `strftime()` 已废弃 | `plugins/modifier.date_format.php` | ✅ 已修复 |
| `strftime()` 已废弃 | `plugins/function.html_select_date.php` | ✅ 已修复 |
| `mbstring.func_overload` 已废弃 | `sysplugins/smarty_internal_smartytemplatecompiler.php` | ⚠️ 已有保护 |
| `mbstring.func_overload` 已废弃 | `sysplugins/smarty_internal_config_file_compiler.php` | ⚠️ 已有保护 |

#### HTML Purifier 4.6.0 → 4.17.0

| 问题 | 文件 | 状态 |
|------|------|------|
| `utf8_encode()` 已废弃 | `purifier.class.php` | ✅ 已修复 |
| `utf8_decode()` 已废弃 | `purifier.class.php` | ✅ 已修复 |

---

### 🟡 中优先级：废弃语法

#### `${var}` 字符串插值 (PHP 8.2 废弃，PHP 9.0 移除)

| 文件 | 行号 | 修改 |
|------|------|------|
| `system/lib/lessc/lessc.class.php` | 1242 | `"${name}..."` → `"{$name}..."` |
| `system/lib/lessc/lessc.class.php` | 1587 | `"op_${ltype}_${rtype}"` → `"op_{$ltype}_{$rtype}"` |
| `system/framework/helper.class.php` | 41 | `"\$${objName}..."` → `"\${$objName}..."` |

---

### 🟢 已有保护机制（无需修改）

| 问题 | 说明 |
|------|------|
| `get_magic_quotes_gpc()` | 全部用 `version_compare(phpversion(), '5.4', '<')` 和 `function_exists()` 保护 |
| `ereg()` | pclzip 中已注释掉 |
| `set_magic_quotes_runtime()` / `get_magic_quotes_runtime()` | pclzip 用 `function_exists()` 检查保护 |
| `mbstring.func_overload` | Smarty 用 `ini_get()` 检查，PHP 8.2 下返回 0 不会执行 |

---

## 修复状态

| 优先级 | 问题 | 状态 |
|--------|------|------|
| 最高 | 动态属性 - 框架基类 | ✅ 已修复 |
| 高 | 升级 Smarty 3.1.19 → 3.1.47 | ✅ 已修复 |
| 高 | 升级 HTML Purifier 4.6.0 → 4.17.0 | ✅ 已修复 |
| 高 | Smarty strftime() 废弃调用 | ✅ 已修复 |
| 中 | `${var}` 语法 - lessc | ✅ 已修复 |
| 中 | `${var}` 语法 - helper | ✅ 已修复 |
