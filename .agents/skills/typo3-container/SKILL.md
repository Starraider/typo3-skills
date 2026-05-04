---
name: typo3-container
description: "Install, configure, and build custom grid/container content elements in TYPO3 using the b13/container extension. Use this skill whenever the user asks for TYPO3 containers, nested content elements, two-column or three-column content grids, `B13\\Container\\Tca\\Registry`, `ContainerConfiguration`, `ContainerProcessor`, `b13/container`, EXT:container, or wants to add configurable background colors, optional left/right margins, or a maximum width option to grid content elements."
---

# TYPO3 Container (b13/container)

Use this skill to add nested grid content elements to a TYPO3 site package or theme extension using the `b13/container` extension. The extension ships no ready-made containers — every grid is a project-specific CType built from one PHP registration, one TypoScript block, one Fluid template, and (optionally) a few TCA fields for styling options.

This skill covers:

1. Detecting and installing `b13/container`.
2. Detecting which CSS framework the project uses (Bootstrap, Tailwind, or custom).
3. Registering custom container CTypes (two-column, three-column, and variants).
4. Adding configurable **background color**, **full-width toggle** (contained with side margins vs. edge-to-edge full width), **maximum width**, **space before/after**, and **mobile stacking order** options per container via TCA overrides.
5. Defining a **single project-wide stacking breakpoint** in site settings so the switch from stacked-on-mobile to side-by-side happens at one place, not per container.
6. Rendering containers in the frontend with `ContainerProcessor` and Fluid using **only the detected framework's built-in utility classes** — no project-specific BEM classes.
7. Backend preview and troubleshooting.

For full working snippets (registration, locallang XLF, TCA overrides, SQL, Fluid templates per framework, backend preview), read [references/container-patterns.md](references/container-patterns.md).

## First Checks

Before writing new container code, confirm the extension is available and decide where registrations belong.

1. Identify the target site package or theme extension (the one that already owns the site's TypoScript and Fluid templates).
2. Check whether `b13/container` is installed:
   - `composer.json` root `require` contains `"b13/container"`, or it is listed in `composer.lock`.
   - `vendor/b13/container/` exists on disk.
   - In the TYPO3 backend, Extension Manager lists the extension as active.
3. If the extension is missing, install and activate it before writing any container code:

   ```bash
   composer require b13/container
   vendor/bin/typo3 extension:setup
   vendor/bin/typo3 cache:flush -g system
   ```

   If the project uses DDEV or a Makefile wrapper (e.g. `ddev composer`, `ddev typo3`, `bin/typo3`), use those instead of the bare commands.
4. Check whether container CTypes already exist in the site package's `Configuration/TCA/Overrides/tt_content.php`. Reuse the existing registration style (icon paths, group name, label conventions) before introducing new patterns.
5. Check for an existing `EXT:<site_package>/Resources/Public/Icons/` folder with SVG icons. Reuse the bundled default icons (`container-2col`, `container-3col`, `container-2col-left`, `container-2col-right`, `container-4col`, `container-1col`) if the project has no custom SVGs yet.
6. **Detect the CSS framework used by the project** — this decides which utility classes the Fluid templates will emit. See the next section.

## CSS Framework Detection

Before writing any Fluid template, figure out which CSS framework the project uses, then emit only that framework's built-in utility classes. Do not introduce custom `container--*` BEM classes; the Fluid template must be self-sufficient against the framework's published utility set.

### Detection Checklist

Run through these signals in order — the first positive match wins:

1. `package.json` — look for dependencies:
   - `"bootstrap"` (or `"bootstrap-icons"`, `"@popperjs/core"`) → **Bootstrap**.
   - `"tailwindcss"` (or `"@tailwindcss/forms"`, `"@tailwindcss/typography"`) → **Tailwind**.
2. SCSS/CSS entry points under `packages/*/Resources/Private/Scss/`, `Build/Scss/`, or similar:
   - `@import "bootstrap/..."`, `@use "bootstrap" ...` → Bootstrap.
   - `@tailwind base;` / `@tailwind components;` / `@tailwind utilities;` → Tailwind.
3. Built CSS under `public/_assets/` or `packages/*/Resources/Public/Css/`:
   - Selectors like `.container`, `.col-6`, `.d-flex`, `.bg-primary` → Bootstrap.
   - Utility atoms like `.max-w-screen-lg`, `.bg-gray-50`, `.ml-8`, `.grid-cols-3` → Tailwind.
4. `tailwind.config.*`, `postcss.config.*`, or `vite.config.*` configuring `tailwindcss` → Tailwind.
5. If none match, ask the user. Do not silently invent classes.

Run these commands to automate the check (adjust paths):

```bash
grep -E '"(bootstrap|tailwindcss)"' package.json
grep -RE '@tailwind |@import ["\x27]bootstrap' packages/*/Resources/Private/Scss/ 2>/dev/null
test -f tailwind.config.js && echo tailwind
test -f tailwind.config.ts && echo tailwind
```

### Framework → Utility Class Mapping

The TCA fields (`tx_acme_bgcolor`, `tx_acme_full_width`, `tx_acme_max_width`, `tx_acme_space_before`, `tx_acme_space_after`, `tx_acme_stack_order`) stay identical across frameworks. Only the mapping from their values to CSS classes changes. Keep the table in sync with the framework version actually on disk (check `package.json`).

#### Bootstrap 5 (built-in utilities)

| Option / value                | Class (Bootstrap 5)               |
| ----------------------------- | --------------------------------- |
| `tx_acme_bgcolor=light`       | `bg-body-secondary`               |
| `tx_acme_bgcolor=dark`        | `bg-dark text-bg-dark`            |
| `tx_acme_bgcolor=primary`     | `bg-primary text-bg-primary`      |
| `tx_acme_bgcolor=accent`      | `bg-warning text-bg-warning`      |
| `tx_acme_bgcolor=none`        | *(no class)*                      |
| `tx_acme_full_width=default`  | `px-3`                            |
| `tx_acme_full_width=full`     | `px-0`                            |
| `tx_acme_max_width=sm`        | `container-sm`                    |
| `tx_acme_max_width=md`        | `container-md`                    |
| `tx_acme_max_width=lg`        | `container-lg`                    |
| `tx_acme_max_width=xl`        | `container-xl`                    |
| `tx_acme_max_width=full`      | `container-fluid`                 |
| `tx_acme_max_width=none`      | *(no class)*                      |
| `tx_acme_space_before=sm`     | `mt-2`                            |
| `tx_acme_space_before=md`     | `mt-3`                            |
| `tx_acme_space_before=lg`     | `mt-4`                            |
| `tx_acme_space_before=xl`     | `mt-5`                            |
| `tx_acme_space_after=sm`      | `mb-2`                            |
| `tx_acme_space_after=md`      | `mb-3`                            |
| `tx_acme_space_after=lg`      | `mb-4`                            |
| `tx_acme_space_after=xl`      | `mb-5`                            |
| `tx_acme_stack_order=default` | `flex-column flex-{bp}-row`       |
| `tx_acme_stack_order=reverse` | `flex-column-reverse flex-{bp}-row` |

Use `row` + `col` / `col-md-6` for the two-column grid and `col-md-4` for the three-column grid. No custom class names are introduced; everything comes from the Bootstrap utility set shipped with the project's `bootstrap` dependency. `{bp}` is the single global breakpoint token (e.g. `md`) defined once in site settings; never hardcode it per container.

#### Tailwind CSS (built-in utilities)

| Option / value                | Class (Tailwind)                  |
| ----------------------------- | --------------------------------- |
| `tx_acme_bgcolor=light`       | `bg-gray-50`                      |
| `tx_acme_bgcolor=dark`        | `bg-gray-900 text-white`          |
| `tx_acme_bgcolor=primary`     | `bg-blue-600 text-white`          |
| `tx_acme_bgcolor=accent`      | `bg-amber-500 text-white`         |
| `tx_acme_bgcolor=none`        | *(no class)*                      |
| `tx_acme_full_width=default`  | `px-4`                            |
| `tx_acme_full_width=full`     | `px-0`                            |
| `tx_acme_max_width=sm`        | `max-w-screen-sm mx-auto`         |
| `tx_acme_max_width=md`        | `max-w-screen-md mx-auto`         |
| `tx_acme_max_width=lg`        | `max-w-screen-lg mx-auto`         |
| `tx_acme_max_width=xl`        | `max-w-screen-xl mx-auto`         |
| `tx_acme_max_width=full`      | `max-w-full`                      |
| `tx_acme_max_width=none`      | *(no class)*                      |
| `tx_acme_space_before=sm`     | `mt-4`                            |
| `tx_acme_space_before=md`     | `mt-8`                            |
| `tx_acme_space_before=lg`     | `mt-16`                           |
| `tx_acme_space_before=xl`     | `mt-24`                           |
| `tx_acme_space_after=sm`      | `mb-4`                            |
| `tx_acme_space_after=md`      | `mb-8`                            |
| `tx_acme_space_after=lg`      | `mb-16`                           |
| `tx_acme_space_after=xl`      | `mb-24`                           |
| `tx_acme_stack_order=default` | `flex flex-col {bp}:grid`         |
| `tx_acme_stack_order=reverse` | `flex flex-col-reverse {bp}:grid` |

Use `grid grid-cols-1 md:grid-cols-2 gap-6` for the two-column grid and `md:grid-cols-3` for the three-column grid — all Tailwind defaults. `{bp}` is the single global breakpoint prefix (e.g. `md`) declared once in site settings; every container template reads it from the same source so the entire site flips at one breakpoint.

If the project uses a theme with custom tokens (e.g. `bg-primary` defined in `tailwind.config.js`), swap the `bg-blue-600` / `bg-amber-500` entries for the project tokens. Never invent names that are not in the project's Tailwind config.

#### Adjusting the skill output to match the detected framework

Pick the matching table and use it for every Fluid template generated in this task. Do not mix Bootstrap and Tailwind utilities in the same template. Before editing the Fluid templates, record the decision in the task notes (e.g. "Framework detected: Bootstrap 5.3").

### Tailwind Safelist

Tailwind strips unused classes. Because these utility names are only materialized through Fluid at runtime, add them to `tailwind.config.js` safelist (or to a `safelist.txt` consumed by the JIT scanner):

```js
// tailwind.config.js
module.exports = {
  // …
  safelist: [
    'bg-gray-50','bg-gray-900','bg-blue-600','bg-amber-500','text-white',
    'px-0','px-4',
    'max-w-screen-sm','max-w-screen-md','max-w-screen-lg','max-w-screen-xl','max-w-full','mx-auto',
    'mt-4','mt-8','mt-16','mt-24','mb-4','mb-8','mb-16','mb-24',
    'grid','grid-cols-1','md:grid-cols-2','md:grid-cols-3','gap-6',
  ],
};
```

Bootstrap does not need a safelist — its utility classes are emitted in the compiled bundle regardless of usage.

## Global Stacking Breakpoint

The mobile stacking order (`tx_acme_stack_order`) flips a container's column sequence below a breakpoint. That breakpoint is **not configurable per container** — it is a single project-wide value used by every container template. This prevents editors from creating visually inconsistent break points across the site.

### Where to declare the breakpoint

Most CSS-framework-aware site packages **already** define a project-wide mobile breakpoint — typically the point where the main navigation collapses into a hamburger menu. **Reuse that value; do not introduce a second breakpoint.** Adding a container-specific breakpoint is almost always a mistake: it lets the grid flip at a different point than the navigation, which looks broken on the exact viewports where breakpoint coherence matters most.

#### 1. Look for an existing breakpoint first

Search the site package's site settings before writing anything. Common keys shipped by site packages and the most-used site sets:

```bash
# Search every site settings file for a breakpoint-ish key.
grep -rniE 'breakpoint|mobile|navigation.*(collapse|hamburger)' \
  config/sites \
  packages/*/Configuration/Sets \
  public/typo3conf/sites
```

Typical existing keys seen in the wild:

- `navigation.mobileBreakpoint`
- `mainNavigation.collapseBreakpoint`
- `layout.mobileBreakpoint`
- `theme.breakpoint.navigation`
- `styles.breakpoints.mobileMenu`
- `bootstrapPackage.settings.navigation.mobileBreakpoint` (EXT:bootstrap_package)

If one of these (or a close equivalent) exists, **use it directly**. In `Partials/Container/Utilities.html`, bind the local `bp` variable to that existing path — no new site setting is added:

```html
<!-- Reuse the site-wide navigation breakpoint -->
<f:variable name="bp" value="{settings.navigation.mobileBreakpoint}" />
```

Confirm the value is a token the chosen framework understands (Bootstrap: `sm/md/lg/xl/xxl`, Tailwind: `sm/md/lg/xl/2xl`). If the existing key holds a pixel value (e.g. `992px`) instead of a token, either add a mapping `<f:variable name="bp" value="{…pixelToToken mapping…}" />` or fall back to defining `container.stackBreakpoint` as described below and document the deliberate mismatch.

#### 2. Only if no site-wide breakpoint exists, define one

Declare `container.stackBreakpoint` once in the site package's site settings definitions. Both frameworks use the same identifier; the value is the framework-specific breakpoint token (`md`, `lg`, …).

`Configuration/Sets/SitePackage/settings.definitions.yaml`:

```yaml
settings:
  container.stackBreakpoint:
    type: string
    default: md
    label: 'Breakpoint at which containers switch from stacked (mobile) to side-by-side (desktop).'
    description: 'Bootstrap: sm/md/lg/xl/xxl. Tailwind: sm/md/lg/xl/2xl. Prefer reusing a project-wide breakpoint (e.g. navigation.mobileBreakpoint) if one already exists.'
    enum:
      sm: Small
      md: Medium
      lg: Large
      xl: Extra Large
```

Then bind it in the partial:

```html
<f:variable name="bp" value="{settings.container.stackBreakpoint}" />
```

If the project does not yet use site settings at all, fall back to a single `<f:variable name="bp" value="md" />` at the very top of `Partials/Container/Utilities.html` and document that this is the only place to edit it.

#### 3. Keep the binding in one place

Whichever source wins, it must be read in exactly **one** location — the `Utilities.html` partial — and every container template consumes `{bp}` from there. Never hardcode `md`/`lg` in individual templates, and never introduce a second binding next to the first "just in case".

### Stacking options

Each container type exposes exactly two values for `tx_acme_stack_order`:

| Container | `default`   | `reverse`   |
| --------- | ----------- | ----------- |
| Two col   | 1, 2        | 2, 1        |
| Three col | 1, 2, 3     | 3, 2, 1     |

Both CTypes reuse the same TCA field — the semantics map onto however many columns the specific container has.

### How it renders

- **Bootstrap 5**: the column wrapper keeps `.row` and adds `flex-column`/`flex-column-reverse` plus `flex-{stackBreakpoint}-row`. On screens below the breakpoint the items stack in the chosen direction; at the breakpoint the row switches back to horizontal so `col-md-6` / `col-md-4` decide the side-by-side layout.
- **Tailwind**: the wrapper uses `flex flex-col` / `flex flex-col-reverse` below the breakpoint, and `{stackBreakpoint}:grid {stackBreakpoint}:grid-cols-2` (or `-3`) at and above the breakpoint. The DOM order stays `Left, Right`/`Left, Center, Right` — CSS alone decides the visual order.

No per-column DOM reshuffling is required. Editors never see a breakpoint field; they only choose *which sequence* to stack in.

## Design Rules To Apply Before Editing

- Place container registrations in the **site package or theme extension**, never in `typo3conf/`.
- Every container is its own **CType**. Use a stable vendor-prefixed identifier like `acme_container_two_columns` (lowercase, snake_case).
- Child columns must use **project-specific `colPos` integers** that do not collide with TYPO3 core values (`0`, `1`, `2`, `3`). Start at `200` and increment per column.
- Keep configuration in **one place per container**: one entry in `tt_content.php`, one TypoScript block, one Fluid template, one icon.
- Use **TCA fields** (not FlexForms) to expose the background color, margin, and max-width options. This matches how `b13/container` is designed and keeps the fields queryable.
- Ship styling **options**, not cosmetic hard-coding. Editors pick color/margin/max-width per container; CSS classes render the result.
- Keep the **mobile stacking breakpoint global** — one value in site settings, referenced by every container template. **Reuse an existing project-wide breakpoint (e.g. the one the main navigation uses for the hamburger switch) whenever possible**, and only introduce `container.stackBreakpoint` when no suitable key exists. Containers only choose between `default` and `reverse` order; they never name the breakpoint.

## Workflow

1. Detect the CSS framework (Bootstrap, Tailwind, or custom). Record the decision.
2. Resolve the global stacking breakpoint: first grep the project's site settings for an existing mobile / navigation breakpoint key (e.g. `navigation.mobileBreakpoint`, `mainNavigation.collapseBreakpoint`, `layout.mobileBreakpoint`, `theme.breakpoint.navigation`). If one exists, record its full settings path and reuse it. Only if none exists, declare `container.stackBreakpoint` (default `md`) in `Configuration/Sets/SitePackage/settings.definitions.yaml`.
3. Register the container CType and its grid layout in `Configuration/TCA/Overrides/tt_content.php`.
4. Add language labels in `Resources/Private/Language/locallang_db.xlf`.
5. Add an SVG icon in `Resources/Public/Icons/<CType>.svg` (or reuse a bundled default icon).
6. Add TCA fields for background color, full-width toggle, max width, space before/after, and stack order, and wire them into the container's `showitem`.
7. Add database columns for the new TCA fields via `ext_tables.sql`.
8. Add TypoScript to render the container with `ContainerProcessor` and a Fluid template.
9. Add a Fluid template that consumes the processed children and applies **only the detected framework's utility classes** via a Fluid map variable (see examples below). The template reads the global breakpoint from a single `<f:variable name="bp" ... />` in `Partials/Container/Utilities.html` — bound either to the existing project-wide breakpoint setting (preferred) or to `{settings.container.stackBreakpoint}` (fallback). It never hardcodes `md`/`lg`.
10. For Tailwind projects, add every emitted class to `tailwind.config.js` `safelist`, including both `flex-col` and `flex-col-reverse` plus the `{breakpoint}:grid` / `{breakpoint}:grid-cols-2` / `{breakpoint}:grid-cols-3` variants used by the stacking logic.
11. Optionally add a backend preview template to make the grid readable in the Page module.
12. Flush caches and run database analyzer.

## 1. Registering a Container CType

Call `B13\Container\Tca\Registry::configureContainer()` once per container in `EXT:<site_package>/Configuration/TCA/Overrides/tt_content.php`. Pass a `B13\Container\Tca\ContainerConfiguration` describing CType, labels, and grid rows/columns.

A container configuration has three parts:

- **CType** — unique identifier, e.g. `acme_container_two_columns`.
- **Label and description** — human-readable labels for the New Content Element wizard and CType select.
- **Grid configuration** — a nested array of rows; each row is an array of column configurations. A column must have `name` and `colPos`, and may carry `colspan`, `rowspan`, and — since TYPO3 v14.1, natively in the core — `allowedContentTypes` / `disallowedContentTypes` to restrict which CTypes editors may place in that column. The legacy `allowed.CType` / `disallowed.CType` (content_defender) array form is also accepted and is mapped internally to `allowedContentTypes`. Only `maxitems` still requires EXT:content_defender; the core v14 implementation deliberately does not cover that feature.

Two-column container (colPos 200, 201):

```php
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
);
```

Three-column container (colPos 210, 211, 212): same pattern, one row, three columns. A full paired example is in [references/container-patterns.md](references/container-patterns.md).

### ContainerConfiguration Methods

Use these methods on `ContainerConfiguration` to adjust registration behavior:

- `setIcon(string $icon)` — SVG file path (`EXT:…`) or existing icon identifier.
- `setBackendTemplate(string $backendTemplate)` — override the Fluid template used in the Page module preview.
- `setGridTemplate(string $gridTemplate)` — override the inner grid template (rarely needed).
- `setGridPartialPaths(array $paths)` / `addGridPartialPath(string $path)` — add partial roots for the backend grid.
- `setGridLayoutPaths(array $paths)` — layout roots for the backend grid.
- `setSaveAndCloseInNewContentElementWizard(bool)` — when `true` (default), the New Content Element wizard closes immediately after creating the container. Set to `false` so the editor lands in the edit form and can pick background color, margins, and max width before saving.
- `setRegisterInNewContentElementWizard(bool)` — hide the container from the wizard if `false`. Leave `true` for editor-facing containers.
- `setGroup(string $group)` — tab in the New Content Element wizard and optgroup in the CType select. Keep `container` unless the project uses its own group.
- `setRelativeToField(string $field)` and `setRelativePosition('before'|'after'|'replace')` — position the entry relative to an existing `showitem` field.
- `setDefaultValues(array $defaults)` — default values the wizard applies to new records, e.g. `['tx_acme_bgcolor' => 'none']`.

The registry automatically:

- adds the CType to the `tt_content.CType` select items,
- registers the SVG icon,
- writes Page TSconfig so the container appears in the New Content Element wizard,
- sets a sensible default `showitem` containing `header`,
- stores the grid configuration in `$GLOBALS['TCA']['tt_content']['containerConfiguration'][<CType>]` for later retrieval.

### Labels (locallang_db.xlf)

Add one `<trans-unit>` per referenced label key. Keep keys grouped by container identifier and option:

```xml
<trans-unit id="container.two_columns.label"><source>Two Columns</source></trans-unit>
<trans-unit id="container.two_columns.description"><source>Two-column grid container.</source></trans-unit>
<trans-unit id="container.bgcolor.label"><source>Background</source></trans-unit>
<trans-unit id="container.bgcolor.option.none"><source>None</source></trans-unit>
```

The full XLF with all keys is in [references/container-patterns.md](references/container-patterns.md).

## 2. Configurable Options (Background, Margins, Max Width, Space)

Expose these as plain TCA fields on `tt_content`, then restrict them to the container CTypes via each container's `showitem`. Use a project prefix (`tx_<vendor>_…`) so the columns do not collide with third-party code.

### Field Definitions

Register the fields in `Configuration/TCA/Overrides/tt_content.php` using `ExtensionManagementUtility::addTCAcolumns()`:

- `tx_acme_bgcolor` — `type=select`, `renderType=selectSingle`, items: `none`, `light`, `dark`, `primary`, `accent`. Default: `none`.
- `tx_acme_full_width` — `type=select`, `renderType=selectSingle`, items: `default` (container has horizontal padding / side margins on both left and right) and `full` (container spans the full width, no side margins). Default: `default`. This replaces the finer-grained left/right margin options; editors either want a contained container or a full-width one.
- `tx_acme_max_width` — `type=select` with items: `none`, `sm`, `md`, `lg`, `xl`, `full`. Drives a `container--mw-<size>` class.
- `tx_acme_space_before` — `type=select` with items: `none`, `sm`, `md`, `lg`, `xl`. Default: `none`. Drives a `container--mt-<size>` class that maps to `margin-top`.
- `tx_acme_space_after` — `type=select` with the same items as `tx_acme_space_before`. Default: `none`. Drives a `container--mb-<size>` class that maps to `margin-bottom`.
- `tx_acme_stack_order` — `type=select`, `renderType=selectSingle`, items: `default`, `reverse`. Default: `default`. Controls the column order on screens smaller than the global stacking breakpoint. Two-column containers read it as `1,2` / `2,1`; three-column containers read it as `1,2,3` / `3,2,1`. The breakpoint itself is **not** part of this field — it comes from site settings.

Keep the `space_before` / `space_after` item set identical so editors see one consistent vertical-spacing vocabulary. The actual spacing values (in `rem`/`px`) live in CSS — not in TCA — so theming can evolve without schema changes.

Use `onChange => 'reload'` only when a value changes `showitem` visibility — not needed for these purely cosmetic options.

A complete TCA snippet for all four fields — including localized labels, sensible defaults, and the `showitem` wiring that exposes them per CType — is in [references/container-patterns.md](references/container-patterns.md).

### Adding Fields To The Container Showitem

After calling `configureContainer()`, append the styling fields to the container's palette. Do **not** overwrite the `showitem` that the registry wrote — use a palette and `addToAllTCAtypes`:

```php
$GLOBALS['TCA']['tt_content']['palettes']['acme_container_style'] = [
    'label' => 'LLL:EXT:site_package/Resources/Private/Language/locallang_db.xlf:container.palette.style',
    'showitem' => 'tx_acme_bgcolor, tx_acme_max_width, --linebreak--, tx_acme_full_width, --linebreak--, tx_acme_space_before, tx_acme_space_after, --linebreak--, tx_acme_stack_order',
];

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addToAllTCAtypes(
    'tt_content',
    '--palette--;;acme_container_style',
    'acme_container_two_columns,acme_container_three_columns',
    'after:header'
);
```

The same call pattern works for every container CType — add each CType identifier to the third parameter (comma-separated).

### Database Columns

Declare the columns in `EXT:site_package/ext_tables.sql` so the TYPO3 database analyzer creates them:

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

Run `vendor/bin/typo3 extension:setup` (or the project's wrapper) and confirm the columns appear in `tt_content`. If the values fall back to empty strings in Fluid, the column is missing or the cache is stale.

## 3. Frontend Rendering (TypoScript + Fluid)

Each container CType needs one TypoScript entry. It inherits from `lib.contentElement`, points to a site-package Fluid template, and runs `ContainerProcessor` to expose children per column.

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
```

### ContainerProcessor Options

- `contentId` (`?int`) — container uid to process. Defaults to the current `cObj->data['uid']`. Override only when processing a foreign container (rare).
- `colPos` (`?int`) — restrict to one child column. When empty, all children are exposed as `children_<colPos>` variables.
- `as` (`?string`) — variable name for the processed children. Only honored when `colPos` is set.
- `skipRenderingChildContent` (`?int`) — skip `ContentObjectRenderer->render()` for children (`renderedContent` will be empty). Use only for list scenarios that render their own child representation.

Omitting `colPos` and `as` is the shortest form:

```typoscript
dataProcessing {
    10 = B13\Container\DataProcessing\ContainerProcessor
}
```

Fluid then receives `{children_200}`, `{children_201}`, etc., one per column declared in the grid.

### Fluid Template (framework-driven utilities)

Consume children with `f:for` and emit `renderedContent` for each record. Build a Fluid map variable that matches the **detected framework**'s utility mapping (see "CSS Framework Detection"), then index into it with the TCA value. This keeps the template logic identical across frameworks — only the map changes.

Bootstrap 5 example (two-column container):

```html
<!-- Prefer an existing site-wide breakpoint (e.g. {settings.navigation.mobileBreakpoint}). Fall back to container.stackBreakpoint only if none exists. -->
<f:variable name="bp"        value="{settings.container.stackBreakpoint}" />
<f:variable name="bgMap"     value="{none: '', light: 'bg-body-secondary', dark: 'bg-dark text-bg-dark', primary: 'bg-primary text-bg-primary', accent: 'bg-warning text-bg-warning'}" />
<f:variable name="fwMap"     value="{default: 'px-3', full: 'px-0'}" />
<f:variable name="mwMap"     value="{none: '', sm: 'container-sm', md: 'container-md', lg: 'container-lg', xl: 'container-xl', full: 'container-fluid'}" />
<f:variable name="mtMap"     value="{none: '', sm: 'mt-2', md: 'mt-3', lg: 'mt-4', xl: 'mt-5'}" />
<f:variable name="mbMap"     value="{none: '', sm: 'mb-2', md: 'mb-3', lg: 'mb-4', xl: 'mb-5'}" />
<f:variable name="stackMap"  value="{default: 'flex-column flex-{bp}-row', reverse: 'flex-column-reverse flex-{bp}-row'}" />

<section class="{mwMap.{data.tx_acme_max_width}} {bgMap.{data.tx_acme_bgcolor}} {fwMap.{data.tx_acme_full_width}} {mtMap.{data.tx_acme_space_before}} {mbMap.{data.tx_acme_space_after}}">
    <div class="row {stackMap.{data.tx_acme_stack_order}}">
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
```

Tailwind example (same container, different map):

```html
<!-- Prefer an existing site-wide breakpoint (e.g. {settings.navigation.mobileBreakpoint}). Fall back to container.stackBreakpoint only if none exists. -->
<f:variable name="bp"       value="{settings.container.stackBreakpoint}" />
<f:variable name="bgMap"    value="{none: '', light: 'bg-gray-50', dark: 'bg-gray-900 text-white', primary: 'bg-blue-600 text-white', accent: 'bg-amber-500 text-white'}" />
<f:variable name="fwMap"    value="{default: 'px-4', full: 'px-0'}" />
<f:variable name="mwMap"    value="{none: '', sm: 'max-w-screen-sm mx-auto', md: 'max-w-screen-md mx-auto', lg: 'max-w-screen-lg mx-auto', xl: 'max-w-screen-xl mx-auto', full: 'max-w-full'}" />
<f:variable name="mtMap"    value="{none: '', sm: 'mt-4', md: 'mt-8', lg: 'mt-16', xl: 'mt-24'}" />
<f:variable name="mbMap"    value="{none: '', sm: 'mb-4', md: 'mb-8', lg: 'mb-16', xl: 'mb-24'}" />
<f:variable name="stackMap" value="{default: 'flex flex-col {bp}:grid {bp}:grid-cols-2 gap-6', reverse: 'flex flex-col-reverse {bp}:grid {bp}:grid-cols-2 gap-6'}" />

<section class="{mwMap.{data.tx_acme_max_width}} {bgMap.{data.tx_acme_bgcolor}} {fwMap.{data.tx_acme_full_width}} {mtMap.{data.tx_acme_space_before}} {mbMap.{data.tx_acme_space_after}}">
    <div class="{stackMap.{data.tx_acme_stack_order}}">
        <div>
            <f:for each="{children_left}" as="child"><f:format.raw>{child.renderedContent}</f:format.raw></f:for>
        </div>
        <div>
            <f:for each="{children_right}" as="child"><f:format.raw>{child.renderedContent}</f:format.raw></f:for>
        </div>
    </div>
</section>
```

Three patterns to understand here:

- The `{bp}` variable — bound in `Partials/Container/Utilities.html` to either an existing project-wide breakpoint setting (e.g. `{settings.navigation.mobileBreakpoint}`) or, as a fallback, `{settings.container.stackBreakpoint}` — is the single source of truth for the breakpoint token. Change it in one place and the entire site flips at the new breakpoint. Container templates must never hardcode `md`/`lg` and must never rebind `{bp}` locally.
- `{mapName.{data.field}}` is Fluid's dynamic object access. With `{data.tx_acme_bgcolor}` resolving to e.g. `light`, `{bgMap.{data.tx_acme_bgcolor}}` resolves to `{bgMap.light}` = `bg-body-secondary`. Missing keys resolve to empty, which is why every map needs an explicit `none: ''` entry.
- The `class` attribute keeps the placeholders space-separated. Extra spaces are harmless.

To avoid duplicating the maps across every container template, put them in a partial (e.g. `Partials/Container/Utilities.html`) and `<f:render partial="..." />` it at the top of each container template.

The values `{data.tx_acme_bgcolor}` etc. come from the `tt_content` row — no explicit `dataProcessing` needed because `lib.contentElement` already exposes `data`.

## 4. Backend Preview

The registry ships a reasonable default preview. Override it with `setBackendTemplate()` when the default grid renders too narrowly, or use the `BeforeContainerPreviewIsRendered` PSR-14 event to add variables without swapping the whole template.

A minimal override template lives next to the frontend templates:

```text
EXT:site_package/Resources/Private/Backend/Container/TwoColumnsPreview.html
```

And is wired in `configureContainer()`:

```php
->setBackendTemplate('EXT:site_package/Resources/Private/Backend/Container/TwoColumnsPreview.html')
```

Use the backend preview only to show styling context that matters to editors (e.g. the selected background color as a colored border). Do not re-render frontend content in the backend.

## 5. PSR-14 Events

The extension exposes two events for cross-cutting adjustments:

- **`BeforeContainerConfigurationIsAppliedEvent`** — modify container configuration for third-party containers, or apply a shared `gridTemplate` to all containers. CType and grid structure cannot be changed; column properties can.
- **`BeforeContainerPreviewIsRendered`** — change the backend preview view object, add variables, or swap template paths at runtime.

Use events only when a change must apply to multiple containers or to a container registered by another extension. For project-local containers, configure them directly in `configureContainer()`.

## 6. Restricting Content Element Types per Column (colPos)

Since **TYPO3 v14.1** this is a core feature — the long-time community extension `EXT:content_defender` is no longer required for whitelisting or blacklisting CTypes per column. Use the core keys directly on each column configuration:

```php
['name' => 'Left',  'colPos' => 200, 'allowedContentTypes'    => 'text,textmedia,header,acme_cta'],
['name' => 'Right', 'colPos' => 201, 'disallowedContentTypes' => 'header'],
```

- `allowedContentTypes` (whitelist) — comma-separated list of `tt_content.CType` values; only these may be placed in that column.
- `disallowedContentTypes` (blacklist) — comma-separated list of CTypes that must not appear.
- The core legacy form `'allowed' => ['CType' => 'text,textmedia']` / `'disallowed' => ['CType' => 'header']` (the former `content_defender` syntax) is still accepted and is internally mapped to `allowedContentTypes`. If both forms are present, `allowedContentTypes` wins.
- The restriction takes effect consistently across the New Content Element wizard, the CType and column-position select boxes in the editor, and move/copy operations — no additional wiring required.

### When EXT:content_defender is still needed

Only for `maxitems` (maximum number of elements per column): the core implementation deliberately does not cover that feature. If a project needs it, keep `EXT:content_defender` installed alongside the native restrictions — both can coexist:

```php
['name' => 'Right', 'colPos' => 201, 'maxitems' => 4]  // content_defender-only
```

Otherwise — for plain allow/deny lists — remove the `EXT:content_defender` dependency when migrating to TYPO3 v14.

### Caveat

The feature currently targets **Page TSConfig backend layouts**. Database-based backend layouts (records in `backend_layout`) do not yet accept `allowedContentTypes` / `disallowedContentTypes` — that support is planned for a later release. `b13/container` registers its layouts through the `Registry` and stays on the Page TSConfig path, so container column restrictions configured via `configureContainer()` work out of the box.

Extensions that manipulate column configuration at runtime can hook into the new PSR-14 `ManipulateBackendLayoutColPosConfigurationForPageEvent`. It is marked `@internal` in v14 ("use at your own risk") — safe for site-local listeners with tests, but expect signature changes in later versions.

## 7. Troubleshooting

Start from the observable symptom and move outward:

- **Container not in the New Content Element wizard** — verify the CType was registered (search for the CType in a backend User Settings → TSconfig dump), flush all caches (`cache:flush -g system,pages`), and confirm the editor's user group permissions include the new CType. The registry writes PageTSconfig automatically; explicit PageTSconfig overrides that reset `mod.wizards.newContentElement.wizardItems.container` can hide it.
- **Child `colPos` shows as "Normal" or "Unused"** — the `colPos` used in the grid configuration does not match the `colPos` used by `ContainerProcessor` in TypoScript. Align the integers. Each container instance must use unique `colPos` values; the registry takes care of remapping through `tx_container_parent`.
- **Backend grid empty after changes** — run `vendor/bin/typo3 cache:flush -g system` and the database analyzer (`vendor/bin/typo3 extension:setup` or the TYPO3 Install Tool → Analyze Database Structure). New fields on `tt_content` will appear empty until the columns exist.
- **Background/max-width/space/full-width not applied in frontend** — check that the fields are declared in `ext_tables.sql`, that `showitem` exposes them for the CType, and that the Fluid template reads `{data.tx_acme_*}` (the `tt_content` row, not an override namespace). For Tailwind projects, also check that every emitted utility class is in the `tailwind.config.js` safelist — the JIT compiler strips classes it cannot see in source. For Bootstrap projects, confirm the built CSS actually ships the utility (e.g. `container-xl`, `bg-body-secondary`, `px-3`) — the classes are only present if the Bootstrap utility API is compiled in the site's SCSS entry.
- **Children do not render in the frontend** — the TypoScript block is missing or `templateName` does not match the case-sensitive HTML filename. `ContentTemplate.html` vs `contentTemplate.html` is not the same file.
- **Translations disappear** — mixed translation mode is not supported. The site must use connected mode or free mode consistently for translated container content.
- **Mobile stacking order does not switch** — open `Partials/Container/Utilities.html` and identify which site-settings path `{bp}` is bound to (the project-wide navigation breakpoint, or `{settings.container.stackBreakpoint}` as fallback). Then confirm that exact path is set in the active site settings (`Configuration/Sites/.../config.yaml` → `settings:` or a site set's `settings.yaml`) and that its value is a framework-valid token (Bootstrap: `sm/md/lg/xl/xxl`; Tailwind: `sm/md/lg/xl/2xl`). If `{bp}` resolves to an empty string, Bootstrap will emit `flex--row` (invalid) and Tailwind will emit `:grid` (invalid). Also ensure the column widths in the template use the same `{bp}` token (`col-{bp}-6`) so side-by-side kicks in at the same breakpoint where the flex direction flips.
- **Stacking order flips at the wrong breakpoint for just one container** — do not add a per-container breakpoint. Change `container.stackBreakpoint` globally; if a particular container truly needs a different breakpoint, model that as a separate container CType with its own TypoScript and template, not as a TCA option.

## References

Read [references/container-patterns.md](references/container-patterns.md) for:

- Full two-column and three-column registration PHP.
- Complete `locallang_db.xlf` with all keys.
- Full TCA definitions for `tx_acme_bgcolor`, `tx_acme_full_width`, `tx_acme_max_width`, `tx_acme_space_before`, `tx_acme_space_after`, `tx_acme_stack_order`.
- `ext_tables.sql` with all six columns.
- Global stacking breakpoint: reuse strategy vs. fallback `settings.definitions.yaml` snippet.
- Complete TypoScript and Fluid templates (frontend and backend preview).
- PSR-14 event listener example.
- End-to-end checklist for adding a new container type.
