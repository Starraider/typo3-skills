# TYPO3 RTE CKEditor Patterns

## Official Documentation

- Introduction: https://docs.typo3.org/c/typo3/cms-rte-ckeditor/main/en-us/Introduction/Index.html
- Installation: https://docs.typo3.org/c/typo3/cms-rte-ckeditor/main/en-us/Installation/Index.html
- Configuration quickstart: https://docs.typo3.org/c/typo3/cms-rte-ckeditor/main/en-us/Configuration/QuickStart.html
- TYPO3 configuration basics: https://docs.typo3.org/c/typo3/cms-rte-ckeditor/main/en-us/Configuration/ConfigureTypo3.html
- Configuration concepts: https://docs.typo3.org/c/typo3/cms-rte-ckeditor/main/en-us/Configuration/Concepts.html
- Configuration best practices: https://docs.typo3.org/c/typo3/cms-rte-ckeditor/main/en-us/Configuration/BestPractices.html
- Configuration examples: https://docs.typo3.org/c/typo3/cms-rte-ckeditor/main/en-us/Configuration/Examples.html
- Configuration reference: https://docs.typo3.org/c/typo3/cms-rte-ckeditor/main/en-us/Configuration/Reference.html

## Recommended File Locations

Use the sitepackage for reusable project configuration:

```text
EXT:sitepackage/ext_localconf.php
EXT:sitepackage/Configuration/RTE/SiteDefault.yaml
EXT:sitepackage/Configuration/page.tsconfig
EXT:sitepackage/Resources/Public/Css/rte.css
EXT:sitepackage/Resources/Public/JavaScript/Ckeditor/<Plugin>.js
EXT:sitepackage/Configuration/TCA/Overrides/<table>.php
```

Use `%config-dir%/system/additional.php` only when the preset is truly installation-specific and should not ship with an extension.

## Register A Preset

```php
<?php

defined('TYPO3') or die();

$GLOBALS['TYPO3_CONF_VARS']['RTE']['Presets']['site_default']
    = 'EXT:sitepackage/Configuration/RTE/SiteDefault.yaml';
```

To override TYPO3's default preset globally:

```php
$GLOBALS['TYPO3_CONF_VARS']['RTE']['Presets']['default']
    = 'EXT:sitepackage/Configuration/RTE/SiteDefault.yaml';
```

## Minimal Site Preset

```yaml
imports:
  - { resource: "EXT:rte_ckeditor/Configuration/RTE/Processing.yaml" }
  - { resource: "EXT:rte_ckeditor/Configuration/RTE/Editor/Base.yaml" }
  - { resource: "EXT:rte_ckeditor/Configuration/RTE/Editor/Plugins.yaml" }

editor:
  config:
    contentsCss:
      - "EXT:sitepackage/Resources/Public/Css/rte.css"
    toolbar:
      items:
        - heading
        - '|'
        - bold
        - italic
        - link
        - bulletedList
        - numberedList
        - '|'
        - undo
        - redo
    heading:
      options:
        - { model: 'paragraph', title: 'Paragraph' }
        - { model: 'heading2', view: 'h2', title: 'Heading 2' }
        - { model: 'heading3', view: 'h3', title: 'Heading 3' }
    style:
      definitions:
        - { name: "Lead", element: "p", classes: [ "lead" ] }
```

## Assign Presets With Page TSconfig

```typoscript
# Default for this page tree
RTE.default.preset = site_default

# All content element bodytext fields
RTE.config.tt_content.bodytext.preset = site_default

# A specific CType
RTE.config.tt_content.bodytext.types.textmedia.preset = site_default

# A FlexForm field; escape dots in the field path
RTE.config.tt_content.settings\.notifications\.emailText.preset = site_default
```

Loading order for selecting a preset:

1. Field-specific Page TSconfig.
2. TCA `richtextConfiguration`.
3. General Page TSconfig `RTE.default.preset`.
4. Preset named `default`.

## Enable RTE On A Custom TCA Field

```php
'description' => [
    'label' => 'Description',
    'config' => [
        'type' => 'text',
        'cols' => 48,
        'rows' => 8,
        'enableRichtext' => true,
        'richtextConfiguration' => 'site_default',
    ],
],
```

## Link Browser Options

These options are top-level YAML values, not children of `editor`.

```yaml
allowedOptions: 'target,title,class,params,rel'
allowedTypes: 'page,url,file,email'

classesAnchor:
  - { class: "link-page", type: "page", target: "" }
  - { class: "link-external", type: "url", target: "_blank" }

buttons:
  link:
    relAttribute:
      enabled: true
    queryParametersSelector:
      enabled: true
    properties:
      class:
        allowedClasses: 'link-page,link-external'

classes:
  link-page:
    name: 'Internal link'
  link-external:
    name: 'External link'
```

## Custom CKEditor Plugin Pattern

Use this pattern only when the feature is not already available through TYPO3's imported Core plugin setup or a maintained TYPO3 extension.

```yaml
editor:
  config:
    importModules:
      - { module: '@vendor/sitepackage/ckeditor/my-plugin.js', exports: [ 'MyPlugin' ] }
    toolbar:
      items:
        - myPlugin
        - '|'
        - bold
        - italic
```

For project-owned plugins, place the module where the TYPO3 asset/import-map workflow can expose it. For extension-owned plugins, follow that extension's documented module path and any required extension setup commands.

Register a project-owned module in the extension:

```php
<?php

return [
    'dependencies' => ['backend'],
    'imports' => [
        '@vendor/sitepackage/my-plugin.js'
            => 'EXT:sitepackage/Resources/Public/JavaScript/Ckeditor/my-plugin.js',
    ],
];
```

Then import the same module specifier from the RTE YAML:

```yaml
editor:
  config:
    importModules:
      - { module: '@vendor/sitepackage/my-plugin.js', exports: [ 'MyPlugin' ] }
    toolbar:
      items:
        - myPlugin
        - '|'
        - bold
        - italic
```

## Verification Checklist

1. Run the project cache flush, commonly `vendor/bin/typo3 cache:flush`.
2. Rebuild backend/import-map assets if the project or extension requires it.
3. Open a backend form using the configured field.
4. Confirm the toolbar and dropdowns are present.
5. Enter representative content, save, reopen, and confirm markup survives the RTE processing round trip.
6. Check frontend rendering separately when the saved markup affects output.
