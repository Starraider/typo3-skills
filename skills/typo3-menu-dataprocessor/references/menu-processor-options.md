# Menu Data Processor Reference

## MenuProcessor Options

| Option | Type | Description |
|--------|------|-------------|
| `as` | string | Variable name in Fluid template |
| `levels` | int | Max depth of submenus (default `1`) |
| `expandAll` | bool | `1` = include all submenus; `0` = only active branch |
| `entryLevel` | int | Root level to start from (`0` = site root) |
| `excludeUidList` | string | Comma-separated page UIDs to exclude |
| `excludeDoktypes` | string | Comma-separated doktypes to exclude (default: `6,254`) |
| `includeNotInMenu` | bool | Include pages with "Hide in menus" checked |
| `includeSpacer` | bool | Include spacer-type pages |
| `titleField` | string | Field for title with fallback, e.g. `nav_title // title` |
| `special` | string | Activates a special menu type |
| `special.value` | string | Value for the special type |
| `alwaysActivePIDlist` | string | Page UIDs always marked as active |
| `protectLvar` | bool | Fall back to default language if no translation |
| `dataProcessing` | array | Nested data processors per menu item |

## Special Menu Types

| Value | Purpose | Key options |
|-------|---------|--------------|
| `rootline` | Breadcrumb / rootline path | `special.range`, `special.reverseOrder` |
| `directory` | Children of specific page(s) | `special.value` = parent page UIDs |
| `list` | Explicit list of pages | `special.value` = page UIDs |
| `categories` | Pages in categories | `special.value` = category UIDs |
| `browse` | Previous / next navigation | various sub-properties |
| `keywords` | Pages sharing keywords | `special.value`, `special.keywordsField` |
| `updated` | Recently updated pages | `special.value`, `special.depth` |

## MenuItem Properties

| Property | Type | Description |
|----------|------|-------------|
| `title` | string | Page title |
| `link` | string | URL to the page |
| `target` | string | Link target attribute |
| `active` | bool | Currently in rootline |
| `current` | bool | Is current page |
| `spacer` | bool | Is a spacer page |
| `hasSubpages` | bool | Has child items |
| `children` | array | Sub-menu items |
| `data` | array | Full page record |

## LanguageMenuProcessor Options

| Option | Type | Description |
|--------|------|-------------|
| `languages` | string | Comma-separated language IDs or `auto` |
| `as` | string | Variable name in Fluid |
| `addQueryString.exclude` | string | Parameters to strip from URLs |
| `if` | if | Condition to enable/disable |

## LanguageMenuItem Properties

| Property | Type | Description |
|----------|------|-------------|
| `link` | string | Language URL |
| `hreflang` | string | Language code (e.g., `en-US`) |
| `navigationTitle` | string | Display title |
| `active` | bool | Is active language |
| `available` | bool | Has a translation |
