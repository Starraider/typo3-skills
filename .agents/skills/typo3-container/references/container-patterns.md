# TYPO3 Container (b13/container) — Patterns

Concrete copy-paste examples for the patterns referenced in `SKILL.md`. All examples assume:

- Target extension key: `site_package`
- Vendor prefix for TCA/DB fields: `tx_acme_`
- CType identifiers: `acme_container_two_columns`, `acme_container_three_columns`
- Child column `colPos` values: 200/201 for the two-column container; 210/211/212 for the three-column container.

Rename the vendor prefix and identifiers to the project's own before pasting.

## 1. Installation Detection

### Composer check

```bash
composer show b13/container >/dev/null 2>&1 && echo "installed" || echo "missing"
```

### Vendor directory check

```bash
test -d vendor/b13/container && echo "installed" || echo "missing"
```

### Install if missing

```bash
composer require b13/container
vendor/bin/typo3 extension:setup
vendor/bin/typo3 cache:flush -g system
```

Use the project's DDEV or Make wrappers when present (`ddev composer require b13/container`, etc.).

## 2. Registration — `Configuration/TCA/Overrides/tt_content.php`

```php
<?php
declare(strict_types=1);

defined('TYPO3') || die();

// --- Two-column container --------------------------------------------------
\TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance(
    \B13\Container\Tca\Registry::class
)->configureContainer(
    (new \B13\Container\Tca\ContainerConfiguration(
        'acme_container_two_columns',
        'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.two_columns.label',
        'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.two_columns.description',
        [
            [
                ['name' => 'Left',  'colPos' => 200],
                ['name' => 'Right', 'colPos' => 201],
            ],
        ]
    ))
        ->setIcon('EXT:site_package/Resources/Public/Icons/acme_container_two_columns.svg')
        ->setGroup('container')
        ->setSaveAndCloseInNewContentElementWizard(false)
        ->setDefaultValues([
            'tx_acme_bgcolor'      => 'none',
            'tx_acme_full_width'   => 'default',
            'tx_acme_max_width'    => 'none',
            'tx_acme_space_before' => 'none',
            'tx_acme_space_after'  => 'none',
            'tx_acme_stack_order'  => 'default',
        ])
);

// --- Three-column container ------------------------------------------------
\TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance(
    \B13\Container\Tca\Registry::class
)->configureContainer(
    (new \B13\Container\Tca\ContainerConfiguration(
        'acme_container_three_columns',
        'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.three_columns.label',
        'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.three_columns.description',
        [
            [
                ['name' => 'Left',   'colPos' => 210],
                ['name' => 'Center', 'colPos' => 211],
                ['name' => 'Right',  'colPos' => 212],
            ],
        ]
    ))
        ->setIcon('EXT:site_package/Resources/Public/Icons/acme_container_three_columns.svg')
        ->setGroup('container')
        ->setSaveAndCloseInNewContentElementWizard(false)
        ->setDefaultValues([
            'tx_acme_bgcolor'      => 'none',
            'tx_acme_full_width'   => 'default',
            'tx_acme_max_width'    => 'none',
            'tx_acme_space_before' => 'none',
            'tx_acme_space_after'  => 'none',
            'tx_acme_stack_order'  => 'default',
        ])
);

// --- Styling TCA fields (added to tt_content) -----------------------------
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTCAcolumns('tt_content', [
    'tx_acme_bgcolor' => [
        'label'  => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.bgcolor.label',
        'config' => [
            'type'       => 'select',
            'renderType' => 'selectSingle',
            'default'    => 'none',
            'items'      => [
                ['label' => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.bgcolor.option.none',    'value' => 'none'],
                ['label' => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.bgcolor.option.light',   'value' => 'light'],
                ['label' => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.bgcolor.option.dark',    'value' => 'dark'],
                ['label' => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.bgcolor.option.primary', 'value' => 'primary'],
                ['label' => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.bgcolor.option.accent',  'value' => 'accent'],
            ],
        ],
    ],
    'tx_acme_full_width' => [
        'label'       => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.full_width.label',
        'description' => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.full_width.description',
        'config' => [
            'type'       => 'select',
            'renderType' => 'selectSingle',
            'default'    => 'default',
            'items'      => [
                ['label' => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.full_width.option.default', 'value' => 'default'],
                ['label' => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.full_width.option.full',    'value' => 'full'],
            ],
        ],
    ],
    'tx_acme_max_width' => [
        'label'  => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.max_width.label',
        'config' => [
            'type'       => 'select',
            'renderType' => 'selectSingle',
            'default'    => 'none',
            'items'      => [
                ['label' => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.max_width.option.none', 'value' => 'none'],
                ['label' => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.max_width.option.sm',   'value' => 'sm'],
                ['label' => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.max_width.option.md',   'value' => 'md'],
                ['label' => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.max_width.option.lg',   'value' => 'lg'],
                ['label' => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.max_width.option.xl',   'value' => 'xl'],
                ['label' => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.max_width.option.full', 'value' => 'full'],
            ],
        ],
    ],
    'tx_acme_space_before' => [
        'label'  => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.space_before.label',
        'config' => [
            'type'       => 'select',
            'renderType' => 'selectSingle',
            'default'    => 'none',
            'items'      => [
                ['label' => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.space.option.none', 'value' => 'none'],
                ['label' => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.space.option.sm',   'value' => 'sm'],
                ['label' => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.space.option.md',   'value' => 'md'],
                ['label' => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.space.option.lg',   'value' => 'lg'],
                ['label' => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.space.option.xl',   'value' => 'xl'],
            ],
        ],
    ],
    'tx_acme_space_after' => [
        'label'  => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.space_after.label',
        'config' => [
            'type'       => 'select',
            'renderType' => 'selectSingle',
            'default'    => 'none',
            'items'      => [
                ['label' => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.space.option.none', 'value' => 'none'],
                ['label' => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.space.option.sm',   'value' => 'sm'],
                ['label' => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.space.option.md',   'value' => 'md'],
                ['label' => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.space.option.lg',   'value' => 'lg'],
                ['label' => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.space.option.xl',   'value' => 'xl'],
            ],
        ],
    ],
    'tx_acme_stack_order' => [
        'label'       => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.stack_order.label',
        'description' => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.stack_order.description',
        'config' => [
            'type'       => 'select',
            'renderType' => 'selectSingle',
            'default'    => 'default',
            'items'      => [
                ['label' => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.stack_order.option.default', 'value' => 'default'],
                ['label' => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.stack_order.option.reverse', 'value' => 'reverse'],
            ],
        ],
    ],
]);

// --- Style palette shown on every container CType -------------------------
$GLOBALS['TCA']['tt_content']['palettes']['acme_container_style'] = [
    'label'    => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.palette.style',
    'showitem' => 'tx_acme_bgcolor, tx_acme_max_width, --linebreak--, tx_acme_full_width, --linebreak--, tx_acme_space_before, tx_acme_space_after, --linebreak--, tx_acme_stack_order',
];

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addToAllTCAtypes(
    'tt_content',
    '--palette--;LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.palette.style;acme_container_style',
    'acme_container_two_columns,acme_container_three_columns',
    'after:header'
);
```

## 3. `ext_tables.sql`

```sql
CREATE TABLE tt_content (
    tx_acme_bgcolor      VARCHAR(32) DEFAULT '' NOT NULL,
    tx_acme_full_width   VARCHAR(16) DEFAULT '' NOT NULL,
    tx_acme_max_width    VARCHAR(16) DEFAULT '' NOT NULL,
    tx_acme_space_before VARCHAR(16) DEFAULT '' NOT NULL,
    tx_acme_space_after  VARCHAR(16) DEFAULT '' NOT NULL,
    tx_acme_stack_order  VARCHAR(16) DEFAULT '' NOT NULL
);
```

## 4. `Resources/Private/Language/locallang_db.xlf`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xliff version="1.0">
    <file source-language="en" datatype="plaintext" original="EXT:site_package/Resources/Private/Language/locallang_db.xlf" product-name="site_package">
        <header/>
        <body>
            <trans-unit id="container.two_columns.label"><source>Container: Two Columns</source></trans-unit>
            <trans-unit id="container.two_columns.description"><source>Two-column grid container.</source></trans-unit>
            <trans-unit id="container.three_columns.label"><source>Container: Three Columns</source></trans-unit>
            <trans-unit id="container.three_columns.description"><source>Three-column grid container.</source></trans-unit>

            <trans-unit id="container.palette.style"><source>Appearance</source></trans-unit>

            <trans-unit id="container.bgcolor.label"><source>Background</source></trans-unit>
            <trans-unit id="container.bgcolor.option.none"><source>None</source></trans-unit>
            <trans-unit id="container.bgcolor.option.light"><source>Light</source></trans-unit>
            <trans-unit id="container.bgcolor.option.dark"><source>Dark</source></trans-unit>
            <trans-unit id="container.bgcolor.option.primary"><source>Primary</source></trans-unit>
            <trans-unit id="container.bgcolor.option.accent"><source>Accent</source></trans-unit>

            <trans-unit id="container.full_width.label"><source>Full width</source></trans-unit>
            <trans-unit id="container.full_width.description"><source>Contained: the container has horizontal padding on both left and right. Full width: the container spans the full width edge-to-edge, with no side margins.</source></trans-unit>
            <trans-unit id="container.full_width.option.default"><source>Contained (with side margins)</source></trans-unit>
            <trans-unit id="container.full_width.option.full"><source>Full width (no side margins)</source></trans-unit>

            <trans-unit id="container.max_width.label"><source>Maximum width</source></trans-unit>
            <trans-unit id="container.max_width.option.none"><source>None (full bleed)</source></trans-unit>
            <trans-unit id="container.max_width.option.sm"><source>Small</source></trans-unit>
            <trans-unit id="container.max_width.option.md"><source>Medium</source></trans-unit>
            <trans-unit id="container.max_width.option.lg"><source>Large</source></trans-unit>
            <trans-unit id="container.max_width.option.xl"><source>Extra large</source></trans-unit>
            <trans-unit id="container.max_width.option.full"<source>Full</source></trans-unit>

            <trans-unit id="container.space_before.label"><source>Space before</source></trans-unit>
            <trans-unit id="container.space_after.label"><source>Space after</source></trans-unit>
            <trans-unit id="container.space.option.none"><source>None</source></trans-unit>
            <trans-unit id="container.space.option.sm"><source>Small</source></trans-unit>
            <trans-unit id="container.space.option.md"><source>Medium</source></trans-unit>
            <trans-unit id="container.space.option.lg"><source>Large</source></trans-unit>
            <trans-unit id="container.space.option.xl"><source>Extra large</source></trans-unit>

            <trans-unit id="container.stack_order.label"><source>Mobile stacking order</source></trans-unit>
            <trans-unit id="container.stack_order.description"><source>Order in which columns stack below the site-wide stacking breakpoint. The breakpoint itself is set globally in site settings.</source></trans-unit>
            <trans-unit id="container.stack_order.option.default"><source>Default (1, 2 / 1, 2, 3)</source></trans-unit>
            <trans-unit id="container.stack_order.option.reverse"><source>Reverse (2, 1 / 3, 2, 1)</source></trans-unit>
        </body>
    </file>
</xliff>
```

Note: fix the last `<trans-unit>` closing bracket if you paste — this note is intentional: double-check XLF well-formedness with `xmllint` before committing.

## 5. Global Stacking Breakpoint (Site Settings)

**Reuse before you create.** Most site packages already expose a global mobile/navigation breakpoint (the point where the main navigation collapses into a hamburger button). Use that same value — the grid and the navigation should *always* flip at the same viewport width.

### 5.1 Look for an existing breakpoint

```bash
grep -rniE 'breakpoint|mobile|navigation.*(collapse|hamburger)' \
  config/sites \
  packages/*/Configuration/Sets \
  public/typo3conf/sites
```

Common existing keys:

- `navigation.mobileBreakpoint`
- `mainNavigation.collapseBreakpoint`
- `layout.mobileBreakpoint`
- `theme.breakpoint.navigation`
- `styles.breakpoints.mobileMenu`
- `bootstrapPackage.settings.navigation.mobileBreakpoint` (EXT:bootstrap_package)

If you find one whose value is a framework-valid token (`sm`/`md`/`lg`/`xl`/`xxl` for Bootstrap, `sm`/`md`/`lg`/`xl`/`2xl` for Tailwind), **bind `{bp}` directly to that path** in `Partials/Container/Utilities.html`:

```html
<f:variable name="bp" value="{settings.navigation.mobileBreakpoint}" />
```

No new site setting. No new `settings.definitions.yaml` entry. Skip the rest of this section.

### 5.2 Only if no suitable breakpoint exists, define `container.stackBreakpoint`

Place the definition in the site package's set (so the file is shipped with the extension, not only in `config/sites/…`):

`Configuration/Sets/SitePackage/settings.definitions.yaml`:

```yaml
settings:
  container.stackBreakpoint:
    type: string
    default: md
    label: 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:settings.container.stackBreakpoint.label'
    description: 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:settings.container.stackBreakpoint.description'
    enum:
      sm: Small
      md: Medium
      lg: Large
      xl: Extra Large
```

`Configuration/Sets/SitePackage/settings.yaml` (seed value; integrators may override per site):

```yaml
container:
  stackBreakpoint: md
```

Bind the partial to it:

```html
<f:variable name="bp" value="{settings.container.stackBreakpoint}" />
```

Whichever source wins, Fluid consumes the value as the local `{bp}` variable in container templates. Never duplicate the binding; editors who need a different breakpoint for one page adjust the site-settings value, not a container.

## 6. TypoScript — `Configuration/Sets/SitePackage/setup.typoscript`

```typoscript
tt_content.acme_container_two_columns < lib.contentElement
tt_content.acme_container_two_columns {
    templateName = ContainerTwoColumns
    templateRootPaths {
        20 = EXT:site_package/Resources/Private/Templates/Container/
    }
    partialRootPaths {
        20 = EXT:site_package/Resources/Private/Partials/Container/
    }
    layoutRootPaths {
        20 = EXT:site_package/Resources/Private/Layouts/
    }
    dataProcessing {
        10 = B13\Container\DataProcessing\ContainerProcessor
        10 {
            colPos = 200
            as = children_left
        }
        20 = B13\Container\DataProcessing\ContainerProcessor
        20 {
            colPos = 201
            as = children_right
        }
    }
}

tt_content.acme_container_three_columns < lib.contentElement
tt_content.acme_container_three_columns {
    templateName = ContainerThreeColumns
    templateRootPaths {
        20 = EXT:site_package/Resources/Private/Templates/Container/
    }
    partialRootPaths {
        20 = EXT:site_package/Resources/Private/Partials/Container/
    }
    layoutRootPaths {
        20 = EXT:site_package/Resources/Private/Layouts/
    }
    dataProcessing {
        10 = B13\Container\DataProcessing\ContainerProcessor
        10 {
            colPos = 210
            as = children_left
        }
        20 = B13\Container\DataProcessing\ContainerProcessor
        20 {
            colPos = 211
            as = children_center
        }
        30 = B13\Container\DataProcessing\ContainerProcessor
        30 {
            colPos = 212
            as = children_right
        }
    }
}
```

## 7. Fluid Templates

Both examples assume a **shared partial** at `Partials/Container/Utilities.html` that defines the utility-class maps once per project (Bootstrap or Tailwind), reads the global stacking breakpoint from site settings, and computes `wrapperClasses` + `stackClasses`. Each container template renders that partial and then indexes into the maps.

### `Partials/Container/Utilities.html` — Bootstrap 5 variant

```html
<html xmlns:f="http://typo3.org/ns/TYPO3/CMS/Fluid/ViewHelpers" data-namespace-typo3-fluid="true">

<!-- Prefer an existing project-wide breakpoint (e.g. {settings.navigation.mobileBreakpoint}). Bind to {settings.container.stackBreakpoint} only if none exists. -->
<f:variable name="bp"       value="{settings.container.stackBreakpoint}" />
<f:variable name="bgMap"    value="{none: '', light: 'bg-body-secondary', dark: 'bg-dark text-bg-dark', primary: 'bg-primary text-bg-primary', accent: 'bg-warning text-bg-warning'}" />
<f:variable name="fwMap"    value="{default: 'px-3', full: 'px-0'}" />
<f:variable name="mwMap"    value="{none: '', sm: 'container-sm', md: 'container-md', lg: 'container-lg', xl: 'container-xl', full: 'container-fluid'}" />
<f:variable name="mtMap"    value="{none: '', sm: 'mt-2', md: 'mt-3', lg: 'mt-4', xl: 'mt-5'}" />
<f:variable name="mbMap"    value="{none: '', sm: 'mb-2', md: 'mb-3', lg: 'mb-4', xl: 'mb-5'}" />
<f:variable name="stackMap" value="{default: 'flex-column flex-{bp}-row', reverse: 'flex-column-reverse flex-{bp}-row'}" />

<f:variable name="wrapperClasses" value="{mwMap.{data.tx_acme_max_width}} {bgMap.{data.tx_acme_bgcolor}} {fwMap.{data.tx_acme_full_width}} {mtMap.{data.tx_acme_space_before}} {mbMap.{data.tx_acme_space_after}}" />
<f:variable name="stackClasses" value="{stackMap.{data.tx_acme_stack_order}}" />

</html>
```

### `Partials/Container/Utilities.html` — Tailwind variant

```html
<html xmlns:f="http://typo3.org/ns/TYPO3/CMS/Fluid/ViewHelpers" data-namespace-typo3-fluid="true">

<!-- Prefer an existing project-wide breakpoint (e.g. {settings.navigation.mobileBreakpoint}). Bind to {settings.container.stackBreakpoint} only if none exists. -->
<f:variable name="bp"       value="{settings.container.stackBreakpoint}" />
<f:variable name="bgMap"    value="{none: '', light: 'bg-gray-50', dark: 'bg-gray-900 text-white', primary: 'bg-blue-600 text-white', accent: 'bg-amber-500 text-white'}" />
<f:variable name="fwMap"    value="{default: 'px-4', full: 'px-0'}" />
<f:variable name="mwMap"    value="{none: '', sm: 'max-w-screen-sm mx-auto', md: 'max-w-screen-md mx-auto', lg: 'max-w-screen-lg mx-auto', xl: 'max-w-screen-xl mx-auto', full: 'max-w-full'}" />
<f:variable name="mtMap"    value="{none: '', sm: 'mt-4', md: 'mt-8', lg: 'mt-16', xl: 'mt-24'}" />
<f:variable name="mbMap"    value="{none: '', sm: 'mb-4', md: 'mb-8', lg: 'mb-16', xl: 'mb-24'}" />
<f:variable name="stackTwoMap"   value="{default: 'flex flex-col {bp}:grid {bp}:grid-cols-2 gap-6', reverse: 'flex flex-col-reverse {bp}:grid {bp}:grid-cols-2 gap-6'}" />
<f:variable name="stackThreeMap" value="{default: 'flex flex-col {bp}:grid {bp}:grid-cols-3 gap-6', reverse: 'flex flex-col-reverse {bp}:grid {bp}:grid-cols-3 gap-6'}" />

<f:variable name="wrapperClasses" value="{mwMap.{data.tx_acme_max_width}} {bgMap.{data.tx_acme_bgcolor}} {fwMap.{data.tx_acme_full_width}} {mtMap.{data.tx_acme_space_before}} {mbMap.{data.tx_acme_space_after}}" />

</html>
```

Ship **exactly one** of these files — the one that matches the framework detected in "First Checks". Never mix both. Tailwind splits the stack map by column count because the grid track count is part of the same class string; Bootstrap does not, because column counts are expressed through `col-{bp}-6` / `col-{bp}-4` on the children.

### `Templates/Container/ContainerTwoColumns.html` — Bootstrap 5

```html
<html xmlns:f="http://typo3.org/ns/TYPO3/CMS/Fluid/ViewHelpers" data-namespace-typo3-fluid="true">

<f:render partial="Container/Utilities" arguments="{_all}" />

<section class="{wrapperClasses}">
    <div class="row {stackClasses}">
        <div class="col-12 col-{bp}-6">
            <f:for each="{children_left}" as="child">
                <f:format.raw>{child.renderedContent}</f:format.raw>
            </f:for>
        </div>
        <div class="col-12 col-{bp}-6">
            <f:for each="{children_right}" as="child">
                <f:format.raw>{child.renderedContent}</f:format.raw>
            </f:for>
        </div>
    </div>
</section>

</html>
```

### `Templates/Container/ContainerTwoColumns.html` — Tailwind

```html
<html xmlns:f="http://typo3.org/ns/TYPO3/CMS/Fluid/ViewHelpers" data-namespace-typo3-fluid="true">

<f:render partial="Container/Utilities" arguments="{_all}" />

<section class="{wrapperClasses}">
    <div class="{stackTwoMap.{data.tx_acme_stack_order}}">
        <div>
            <f:for each="{children_left}" as="child"><f:format.raw>{child.renderedContent}</f:format.raw></f:for>
        </div>
        <div>
            <f:for each="{children_right}" as="child"><f:format.raw>{child.renderedContent}</f:format.raw></f:for>
        </div>
    </div>
</section>

</html>
```

### `Templates/Container/ContainerThreeColumns.html` — Bootstrap 5

```html
<html xmlns:f="http://typo3.org/ns/TYPO3/CMS/Fluid/ViewHelpers" data-namespace-typo3-fluid="true">

<f:render partial="Container/Utilities" arguments="{_all}" />

<section class="{wrapperClasses}">
    <div class="row {stackClasses}">
        <div class="col-12 col-{bp}-4">
            <f:for each="{children_left}" as="child"><f:format.raw>{child.renderedContent}</f:format.raw></f:for>
        </div>
        <div class="col-12 col-{bp}-4">
            <f:for each="{children_center}" as="child"><f:format.raw>{child.renderedContent}</f:format.raw></f:for>
        </div>
        <div class="col-12 col-{bp}-4">
            <f:for each="{children_right}" as="child"><f:format.raw>{child.renderedContent}</f:format.raw></f:for>
        </div>
    </div>
</section>

</html>
```

### `Templates/Container/ContainerThreeColumns.html` — Tailwind

```html
<html xmlns:f="http://typo3.org/ns/TYPO3/CMS/Fluid/ViewHelpers" data-namespace-typo3-fluid="true">

<f:render partial="Container/Utilities" arguments="{_all}" />

<section class="{wrapperClasses}">
    <div class="{stackThreeMap.{data.tx_acme_stack_order}}">
        <div><f:for each="{children_left}" as="child"><f:format.raw>{child.renderedContent}</f:format.raw></f:for></div>
        <div><f:for each="{children_center}" as="child"><f:format.raw>{child.renderedContent}</f:format.raw></f:for></div>
        <div><f:for each="{children_right}" as="child"><f:format.raw>{child.renderedContent}</f:format.raw></f:for></div>
    </div>
</section>

</html>
```

Note on Fluid dynamic access: `{mapName.{data.field}}` requires the referenced map key to exist. Every map therefore defines an explicit `default`/`none` entry so that when a row was saved before these fields existed, the template still outputs valid class names.

## 8. Backend Preview Template (Optional)

Wire it per container via `->setBackendTemplate('EXT:site_package/Resources/Private/Backend/Container/TwoColumnsPreview.html')` and hint the editor about the selected styling:

```html
<html xmlns:f="http://typo3.org/ns/TYPO3/CMS/Fluid/ViewHelpers" data-namespace-typo3-fluid="true">

<div class="t3-preview-container t3-preview-container--bg-{record.tx_acme_bgcolor} t3-preview-container--mw-{record.tx_acme_max_width}">
    <strong>{record.header}</strong>
    <f:debug inline="1" title="Container row">{record}</f:debug>
    <div class="t3-preview-container__grid">
        <div class="t3-preview-container__col">
            <f:render partial="Backend/ContainerGridColumn" arguments="{children: children_left, label: 'Left'}" />
        </div>
        <div class="t3-preview-container__col">
            <f:render partial="Backend/ContainerGridColumn" arguments="{children: children_right, label: 'Right'}" />
        </div>
    </div>
</div>

</html>
```

Use `f:debug` (not HTML comments) when inspecting values during backend preview development — HTML comments are stripped by the preview renderer.

## 9. PSR-14 Event Listener Example

Register in `Configuration/Services.yaml`:

```yaml
services:
  Acme\SitePackage\EventListener\AdjustContainerPreview:
    tags:
      - name: event.listener
        identifier: 'acme-container-preview'
        event: B13\Container\Events\BeforeContainerPreviewIsRendered
```

`Classes/EventListener/AdjustContainerPreview.php`:

```php
<?php
declare(strict_types=1);

namespace Acme\SitePackage\EventListener;

use B13\Container\Events\BeforeContainerPreviewIsRendered;

final class AdjustContainerPreview
{
    public function __invoke(BeforeContainerPreviewIsRendered $event): void
    {
        $event->getView()->assign('siteAccent', 'acme');
    }
}
```

## 10. End-To-End Checklist (Adding A New Container Type)

1. Resolve the global stacking breakpoint. First grep `config/sites`, site package sets, and any installed theme for an existing mobile/navigation breakpoint key (e.g. `navigation.mobileBreakpoint`, `mainNavigation.collapseBreakpoint`, `layout.mobileBreakpoint`, `theme.breakpoint.navigation`). If one exists and holds a framework-valid token, bind `{bp}` in `Partials/Container/Utilities.html` directly to that path and skip creating a new setting. Only if nothing suitable is found, add `container.stackBreakpoint` to the site package's `settings.definitions.yaml` and `settings.yaml`. Either way, add it/bind it the first time a container is introduced — never duplicate it per container.
2. Pick a unique CType (`acme_container_<shape>`) and unique child `colPos` integers.
3. Add an SVG icon to `Resources/Public/Icons/<CType>.svg` or reuse a bundled default.
4. Append the `configureContainer()` call in `Configuration/TCA/Overrides/tt_content.php`, including `setDefaultValues(['tx_acme_stack_order' => 'default', …])`.
5. Add the CType to the third argument of `addToAllTCAtypes()` for the style palette so the container inherits the bgcolor/full-width/max-width/space-before/space-after/stack-order fields.
6. Add the new labels to `locallang_db.xlf`, including `container.stack_order.*`.
7. Add a TypoScript block under `tt_content.<CType>` with `templateName`, template paths, and one `ContainerProcessor` per column.
8. Create the Fluid template matching `templateName` (case-sensitive). It must render the shared `Container/Utilities` partial and emit classes only from the framework's built-in utility set.
9. Run cache flush and database analyzer.
10. Verify in the backend: the New Content Element wizard lists the container, the CType select shows it, styling fields (Appearance palette: bgcolor, full-width toggle, max-width, space before/after, mobile stacking order) appear, and the frontend emits the expected wrapper + stack classes (e.g. Bootstrap `row flex-column-reverse flex-md-row`, Tailwind `flex flex-col-reverse md:grid md:grid-cols-2 gap-6`).
