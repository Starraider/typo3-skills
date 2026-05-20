---
name: typo3-menu-dataprocessor
description: Create navigation menus in TYPO3 v13+ using the `menu` and `language-menu` data processors with PAGEVIEW/FLUIDTEMPLATE. Use this skill when building or modifying any kind of page navigation — main menus, breadcrumbs, language switchers, directory listings, sitemaps, or category-based menus — inside a TYPO3 site package. Covers TypoScript data processor configuration, all `special` menu types, available options, Fluid template rendering of menu items, and nested/multi-level menus.
---

# TYPO3 Menu via Data Processors

## Architecture

Menus in modern TYPO3 (v13+) are created through **data processors** configured in TypoScript, then rendered in **Fluid templates**. The data processor produces an array of menu items available as a Fluid variable.

Two data processors handle menus:

| Alias           | FQCN                                                  | Purpose                      |
|-----------------|--------------------------------------------------------|------------------------------|
| `menu`          | `\TYPO3\CMS\Frontend\DataProcessing\MenuProcessor`    | Page tree menus, breadcrumbs |
| `language-menu` | `\TYPO3\CMS\Frontend\DataProcessing\LanguageMenuProcessor` | Language switcher       |

> [!NOTE]
> The legacy `HMENU` cObject still works but data processors are the recommended approach for Fluid-based templates.

---

## 1. The `menu` Data Processor

### Minimal Setup (inside PAGEVIEW or FLUIDTEMPLATE)

```typoscript
dataProcessing {
    10 = menu
    10.as = mainMenu
}
```

This creates a single-level menu of direct child pages of the site root, accessible in Fluid as `{mainMenu}`.

### All Options

| Option              | Type    | Description                                                                 |
|---------------------|---------|-----------------------------------------------------------------------------|
| `as`                | string  | Variable name in Fluid template                                             |
| `levels`            | int     | Max depth of submenus to include (default `1`)                              |
| `expandAll`         | bool    | `1` = include all submenus; `0` = only active branch                        |
| `entryLevel`        | int     | Root level to start from (`0` = site root, negative counts from current)    |
| `excludeUidList`    | string  | Comma-separated page UIDs to exclude; supports `current`                    |
| `excludeDoktypes`   | string  | Comma-separated doktypes to exclude (default: `6,254`)                      |
| `includeNotInMenu`  | bool    | Include pages with "Page enabled in menus" unchecked                        |
| `includeSpacer`     | bool    | Include spacer-type pages                                                   |
| `titleField`        | string  | Field(s) for title with fallback, e.g. `nav_title // title`                 |
| `special`           | string  | Activates a special menu type (see below)                                   |
| `special.value`     | string  | Value for the special type (page UIDs, etc.)                                |
| `alwaysActivePIDlist`| string | Page UIDs always marked as active                                           |
| `protectLvar`       | bool    | Falls back to default language if no translation exists                     |
| `dataProcessing`    | array   | Nested data processors applied per menu item                                |

### Special Menu Types

Set `special` to one of:

| Value        | Purpose                                  | Key extra options                    |
|--------------|------------------------------------------|--------------------------------------|
| `rootline`   | Breadcrumb / rootline path               | `special.range`, `special.reverseOrder` |
| `directory`  | Children of specific page(s)             | `special.value` = parent page UIDs   |
| `list`       | Explicit list of pages                   | `special.value` = page UIDs          |
| `categories` | Pages assigned to certain categories     | `special.value` = category UIDs      |
| `browse`     | Previous / next navigation               | various sub-properties               |
| `keywords`   | Pages sharing keywords with current page | `special.value`, `special.keywordsField` |
| `updated`    | Recently updated pages                   | `special.value`, `special.depth`     |

---

## 2. The `language-menu` Data Processor

```typoscript
dataProcessing {
    20 = language-menu
    20 {
        languages = auto
        as = languageMenu
    }
}
```

### Options

| Option                  | Type   | Description                                           |
|-------------------------|--------|-------------------------------------------------------|
| `languages`             | string | Comma-separated language IDs or `auto` (from site config) |
| `as`                    | string | Variable name in Fluid                                |
| `addQueryString.exclude`| string | Parameters to strip from language URLs                |
| `if`                    | if     | Condition to enable/disable the processor             |

> For a full language menu implementation with browser-language auto-detection and cookie-based language persistence, use the **`typo3-language-menu`** skill.

---

## 3. Complete TypoScript Examples

### Main Menu (two levels, all expanded)

```typoscript
lib.fluidPage = PAGEVIEW
lib.fluidPage {
    paths {
        10 = EXT:my_sitepackage/Resources/Private/Templates/
        20 = EXT:my_sitepackage/Resources/Private/
    }
    dataProcessing {
        10 = menu
        10 {
            as = mainMenu
            levels = 2
            expandAll = 1
        }
    }
}
```

### Breadcrumb

```typoscript
dataProcessing {
    20 = menu
    20 {
        special = rootline
        as = breadcrumb
        # Use record-transformation for structured data
        dataProcessing.10 = record-transformation
    }
}
```

### Language Switcher

```typoscript
dataProcessing {
    30 = language-menu
    30 {
        languages = auto
        as = languageMenu
    }
}
```

### Directory Menu (children of a specific page)

```typoscript
dataProcessing {
    40 = menu
    40 {
        special = directory
        special.value = 42
        as = categoryMenu
        levels = 1
    }
}
```

### Explicit Page List

```typoscript
dataProcessing {
    50 = menu
    50 {
        special = list
        special.value = 10,20,30
        as = footerMenu
    }
}
```

### Combined Real-World Setup

```typoscript
lib.fluidPage = PAGEVIEW
lib.fluidPage {
    paths {
        10 = EXT:my_site_package/Resources/Private/Templates/
        20 = EXT:my_site_package/Resources/Private/
    }

    dataProcessing {
        # Main navigation (2 levels, fully expanded)
        10 = menu
        10 {
            as = mainMenu
            levels = 2
            expandAll = 1
        }

        # Breadcrumb
        20 = menu
        20 {
            special = rootline
            as = breadcrumb
            dataProcessing.10 = record-transformation
        }

        # Language switcher
        30 = language-menu
        30 {
            languages = auto
            as = languageMenu
        }

        # Site data
        40 = site
        40.as = site
    }
}
```

---

## 4. Fluid Template Rendering

### Menu Item Properties

Each item in the menu array exposes:

| Property       | Type   | Description                      |
|----------------|--------|----------------------------------|
| `title`        | string | Page title (respects `titleField`)|
| `link`         | string | URL to the page                  |
| `target`       | string | Link target attribute            |
| `active`       | bool   | Currently in rootline            |
| `current`      | bool   | Is the current page              |
| `spacer`       | bool   | Is a spacer page                 |
| `hasSubpages`  | bool   | Has child items                  |
| `children`     | array  | Sub-menu items (if multi-level)  |
| `data`         | array  | Full page record (`data.uid`, etc.) |

### Single-Level Menu

```html
<nav>
    <ul>
        <f:for each="{mainMenu}" as="item">
            <li class="{f:if(condition: item.active, then: 'active')}">
                <a href="{item.link}" title="{item.title}">{item.title}</a>
            </li>
        </f:for>
    </ul>
</nav>
```

### Two-Level Dropdown Menu

```html
<nav>
    <ul>
        <f:for each="{mainMenu}" as="item">
            <li class="{f:if(condition: item.active, then: 'active')}">
                <a href="{item.link}">{item.title}</a>
                <f:if condition="{item.hasSubpages}">
                    <ul class="submenu">
                        <f:for each="{item.children}" as="child">
                            <li class="{f:if(condition: child.active, then: 'active')}">
                                <a href="{child.link}">{child.title}</a>
                            </li>
                        </f:for>
                    </ul>
                </f:if>
            </li>
        </f:for>
    </ul>
</nav>
```

### Breadcrumb

```html
<f:if condition="{breadcrumb}">
    <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
            <f:for each="{breadcrumb}" as="item">
                <f:if condition="{item.current}">
                    <f:then>
                        <li class="breadcrumb-item active" aria-current="page">
                            {item.title}
                        </li>
                    </f:then>
                    <f:else>
                        <li class="breadcrumb-item">
                            <a href="{item.link}">{item.title}</a>
                        </li>
                    </f:else>
                </f:if>
            </f:for>
        </ol>
    </nav>
</f:if>
```

### Language Menu

```html
<f:if condition="{languageMenu}">
    <ul class="language-menu">
        <f:for each="{languageMenu}" as="lang">
            <li class="{f:if(condition: lang.active, then: 'active')}
                        {f:if(condition: lang.available, else: 'disabled')}">
                <f:if condition="{lang.available}">
                    <f:then>
                        <a href="{lang.link}" hreflang="{lang.hreflang}">
                            {lang.navigationTitle}
                        </a>
                    </f:then>
                    <f:else>
                        <span>{lang.navigationTitle}</span>
                    </f:else>
                </f:if>
            </li>
        </f:for>
    </ul>
</f:if>
```

---

## 5. Key Patterns

### Unique processor keys

Use Unix timestamps or otherwise unique integers as processor keys to avoid collisions when multiple sets or extensions add processors:

```typoscript
dataProcessing {
    1763411533130 = menu
    1763411533130.as = mainMenu
}
```

### Nested data processing

Apply additional processors per menu item (e.g., `files` to attach media):

```typoscript
dataProcessing.10 = menu
dataProcessing.10 {
    levels = 2
    as = mainMenu
    dataProcessing {
        10 = files
        10.references.fieldName = media
    }
}
```

### Breadcrumb with record-transformation

Chain `record-transformation` inside the breadcrumb processor for structured data:

```typoscript
dataProcessing.20 = menu
dataProcessing.20 {
    special = rootline
    as = breadcrumb
    dataProcessing.10 = record-transformation
}
```

### Excluding pages

```typoscript
dataProcessing.10 = menu
dataProcessing.10 {
    as = mainMenu
    excludeUidList = 42,99,current
}
```

---

## 6. Best Practices & Common Pitfalls

### Breadcrumbs and Hidden Pages (`nav_hide`)
When building breadcrumbs with `special = rootline`, the `MenuProcessor` will natively ignore any pages marked as "Hide in menu" (`nav_hide = 1`). Detail pages or structural folders are frequently hidden from the main navigation, causing broken or incomplete rootlines.

**Agent Instruction:** When you are asked to implement or fix a breadcrumb menu, **always ask the user explicitly** if hidden pages should be included in the breadcrumb path. If the user says yes, you must add `includeNotInMenu = 1` to the TypoScript configuration.

### Never Build Navigation in Extbase
Do not attempt to construct breadcrumbs or menus inside Extbase Controllers (e.g., by looping through `$GLOBALS['TSFE']->rootLine`). This is a fragile legacy approach that breaks TYPO3 caching mechanisms.
* **Always** use a TypoScript `MenuProcessor` (e.g., `lib.breadcrumb`).
* Call it from the Fluid template using the `f:cObject` viewhelper (e.g., `<f:cObject typoscriptObjectPath="lib.breadcrumb" data="{activeRecordTitle: record.name}" />`) to seamlessly bridge dynamic plugin data into the global TypoScript object.

---

## Load References As Needed

- Complete options reference: [references/menu-processor-options.md](references/menu-processor-options.md)
- Fluid template patterns: [references/fluid-templates.md](references/fluid-templates.md)

## References

- [Menu Guide](https://docs.typo3.org/m/typo3/reference-typoscript/main/en-us/Guide/Menu/Index.html)
- [MenuProcessor Reference](https://docs.typo3.org/m/typo3/reference-typoscript/main/en-us/DataProcessing/MenuProcessor/Index.html)
- [LanguageMenuProcessor Reference](https://docs.typo3.org/m/typo3/reference-typoscript/main/en-us/DataProcessing/LanguageMenuProcessor.html)
- [Rootline / Breadcrumb](https://docs.typo3.org/m/typo3/reference-typoscript/main/en-us/DataProcessing/MenuProcessor/Rootline.html)
- [Site Package Tutorial – Main Menu](https://docs.typo3.org/m/typo3/tutorial-sitepackage/main/en-us/Menu/Index.html)
