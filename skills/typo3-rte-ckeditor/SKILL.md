---
name: typo3-rte-ckeditor
description: Configure TYPO3 Rich Text Editor setups with EXT:rte_ckeditor / CKEditor 5. Use this skill when asked to install or enable the TYPO3 RTE, create or modify RTE YAML presets, register presets in `ext_localconf.php` or `system/additional.php`, assign presets with Page TSconfig or TCA `richtextConfiguration`, customize toolbars, styles, headings, link browser options, content CSS, HTML processing, or install and activate CKEditor plugins or TYPO3 extensions that add RTE functionality.
---

# TYPO3 RTE CKEditor

Use this skill for TYPO3 rich text editing based on the Core extension `rte_ckeditor`. Prefer sitepackage-owned, versioned configuration over backend-only changes.

## First Checks

1. Identify the TYPO3 major/minor version and whether the project is Composer-based.
2. Locate the sitepackage or custom extension that owns editor configuration.
3. Check whether `typo3/cms-rte-ckeditor` is installed and active.
4. Inspect existing RTE presets before adding a new convention:
   - `EXT:<sitepackage>/Configuration/RTE/*.yaml`
   - `EXT:<sitepackage>/ext_localconf.php`
   - `EXT:<sitepackage>/Configuration/page.tsconfig`
   - `%config-dir%/system/additional.php` or `config/system/additional.php`
5. If changing a table field, inspect TCA for `enableRichtext` and `richtextConfiguration` before overriding with Page TSconfig.

## Installation And Activation

For Composer projects, check and install with the project wrapper when available:

```bash
composer show | grep rte
composer require typo3/cms-rte-ckeditor
```

For non-Composer projects, `rte_ckeditor` is shipped with TYPO3 Core but may need activation in the backend under **System > Extensions**.

If a requested feature requires a third-party TYPO3 extension, install it with Composer, activate/boot it through the project's normal TYPO3 extension setup, then verify whether it registers an RTE preset, Page TSconfig, CKEditor plugin module, or both.

## Configuration Workflow

1. Create or update the RTE YAML preset in the sitepackage:

```text
EXT:<sitepackage>/Configuration/RTE/<PresetName>.yaml
```

2. Register the preset in the sitepackage's `ext_localconf.php`:

```php
$GLOBALS['TYPO3_CONF_VARS']['RTE']['Presets']['site_default']
    = 'EXT:sitepackage/Configuration/RTE/SiteDefault.yaml';
```

Use `%config-dir%/system/additional.php` only for installation-local overrides that do not belong in an extension.

3. Assign the preset with Page TSconfig when the change should affect a page tree, table field, or content type:

```typoscript
RTE.default.preset = site_default
RTE.config.tt_content.bodytext.preset = site_default
RTE.config.tt_content.bodytext.types.textmedia.preset = minimal
```

4. Use TCA when enabling RTE on a custom field or setting the field's default preset at schema level:

```php
'bodytext' => [
    'config' => [
        'type' => 'text',
        'enableRichtext' => true,
        'richtextConfiguration' => 'site_default',
    ],
],
```

5. Flush TYPO3 caches and verify the backend field. Use System > Configuration to inspect `$GLOBALS['TYPO3_CONF_VARS']['RTE']['Presets']` and `$GLOBALS['TCA']` when debugging.

## YAML Preset Rules

Start from TYPO3's Core `Default.yaml` for normal site work. Keep the Core imports unless there is a deliberate security and processing decision:

```yaml
imports:
  - { resource: "EXT:rte_ckeditor/Configuration/RTE/Processing.yaml" }
  - { resource: "EXT:rte_ckeditor/Configuration/RTE/Editor/Base.yaml" }
  - { resource: "EXT:rte_ckeditor/Configuration/RTE/Editor/Plugins.yaml" }
```

Avoid removing `Processing.yaml` casually; it contributes RTE processing and safety behavior. Use 2-space YAML indentation and keep CKEditor configuration under `editor.config`. Link browser options such as `allowedOptions`, `allowedTypes`, `classesAnchor`, and `buttons.link` live at the top YAML level, not under `editor`.

## Plugins And Extensions

Use built-in TYPO3/CKEditor features first by importing Core plugin configuration and adding toolbar items. When a feature requires a custom CKEditor plugin:

1. Confirm whether it is provided by TYPO3 Core, a TYPO3 extension, or project JavaScript.
2. Install the TYPO3 extension or add the JavaScript module to the sitepackage.
3. Register project JavaScript modules in `Configuration/JavaScriptModules.php` when needed.
4. Register or import the plugin via the preset's `editor.config.importModules`.
5. Add the plugin command to `editor.config.toolbar.items`.
6. Add any required allowed HTML, style definitions, content CSS, or processing rules.
7. Flush caches, reload backend assets, and test creating, editing, saving, and rendering content.

Do not reuse CKEditor 4 plugins directly; TYPO3's RTE uses CKEditor 5 in modern supported versions and CKEditor 4 plugins are not compatible.

## Troubleshooting

- **Preset not available:** verify `ext_localconf.php` is loaded, extension key spelling, YAML path, cache flush, and `$GLOBALS['TYPO3_CONF_VARS']['RTE']['Presets']`.
- **Backend field ignores preset:** check Page TSconfig loading order, field-specific `RTE.config.*`, TCA `richtextConfiguration`, and content-type overrides.
- **Toolbar button missing:** check the plugin exists, `Editor/Plugins.yaml` or `importModules` is loaded, and the toolbar item name matches CKEditor 5.
- **HTML stripped on save:** align CKEditor allowed HTML/style configuration with TYPO3 RTE processing; do not solve by removing processing wholesale.
- **Content CSS stale:** clear browser cache or version the `contentsCss` URL.
- **Frontend output wrong:** adjust TypoScript/frontend parsing or Fluid rendering separately from editor YAML.

## References

Read [references/rte-ckeditor-patterns.md](references/rte-ckeditor-patterns.md) when you need concrete YAML, Page TSconfig, TCA, link browser, or plugin examples.
