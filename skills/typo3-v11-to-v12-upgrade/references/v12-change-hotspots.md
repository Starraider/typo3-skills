# TYPO3 12 Change Hotspots

Use this reference when assessing whether a TYPO3 11 project is ready
for TYPO3 12. Always verify details against current official docs.

## Platform And Support

- TYPO3 v12 requires PHP 8.1 or newer. TYPO3 v11 supports PHP 8.1, so
  upgrade the platform while still on v11 before changing core
  constraints.
- TYPO3 v12 requires Composer 2.1 or newer for Composer-based work.
- Supported databases include MySQL 8.0+, MariaDB 10.3+, PostgreSQL
  10+, and SQLite 3.8.3+. Microsoft SQL Server support is discontinued.
- Required PHP extensions include `pdo`, `session`, `xml`, `filter`,
  `SPL`, `standard`, `tokenizer`, `mbstring`, and `intl`.
- TYPO3 v12 regular support ended on 2026-04-30. Treat v12 as ELTS or
  an interim target if the current project timeline is after that date.

Sources to verify:

- `https://docs.typo3.org/c/typo3/cms-core/main/en-us/Changelog/12.0/Breaking-96553-TYPO3V12SystemRequirements.html`
- `https://get.typo3.org/version/12.4.0`

## Composer Package Changes

- `typo3/cms-recordlist` was merged into `typo3/cms-backend`; remove it
  from root Composer constraints before upgrading.
- Upgrade all installed `typo3/cms-*` packages together with
  `--update-with-all-dependencies`.
- Composer blocker examples commonly include extension constraints such
  as `helhum/typo3-console` versions that only support TYPO3 11.

Source:

- `https://docs.typo3.org/m/typo3/reference-coreapi/12.4/en-us/Administration/Upgrade/Major/UpgradeCore.html`

## Configuration File Location

- Composer projects move from `typo3conf/LocalConfiguration.php` to
  `config/system/settings.php`.
- Composer projects move from `typo3conf/AdditionalConfiguration.php`
  to `config/system/additional.php`.
- TYPO3 can move these files automatically on first request, but Git,
  deployment, `.gitignore`, backup, and secrets handling may need
  updates.

Source:

- `https://docs.typo3.org/c/typo3/cms-core/main/en-us/Changelog/12.0/Breaking-98319-NewFileLocationForLocalConfigurationphpAndAdditionalConfigurationphp.html`

## Doctrine DBAL 3

Custom extensions using TYPO3 database wrappers or Doctrine DBAL
directly are affected. Common migrations:

- Use `executeQuery()` for `SELECT` and count-style reads.
- Use `executeStatement()` for `INSERT`, `UPDATE`, and `DELETE`.
- Treat read results as `Doctrine\DBAL\Result`.
- Prefer `fetchAssociative()` over `fetch()`.
- Prefer `fetchAllAssociative()` over `fetchAll()`.
- Prefer `fetchOne()` over `fetchColumn(0)`.

Source:

- `https://docs.typo3.org/c/typo3/cms-core/main/en-us/Changelog/12.0/Breaking-96287-DoctrineDBALv3.html`

## CKEditor 5 And RTE YAML

TYPO3 v12 ships CKEditor 5 instead of CKEditor 4. Custom RTE plugins
and YAML presets need careful review.

Check for:

- custom CKEditor 4 plugins, which are not compatible as-is
- `editor.config.extraAllowedContent`, now mapped toward HTML support
- `editor.config.format_tags`, now represented by heading options
- `editor.config.removeButtons`, now toolbar `removeItems`
- `editor.config.toolbarGroups`, replaced by explicit toolbar items
- custom editor CSS that needs `.ck-content` scoping
- custom styles that rely on inline `style` attributes

Source:

- `https://docs.typo3.org/c/typo3/cms-core/main/en-us/Changelog/12.0/Feature-96874-CKEditor5.html`
- `https://docs.typo3.org/c/typo3/cms-core/main/en-us/Changelog/12.0/Breaking-96874-CKEditorRelatedPluginsAndConfiguration.html`

## TypoScript Parser And Includes

TYPO3 v12 introduces a new TypoScript parser. It is more robust, but
some legacy constructs stop working.

Check for:

- recursive constants such as constants referencing other constants
- constants used as object paths, for example `{$foo} = value`
- `@import` or `<INCLUDE_TYPOSCRIPT:` inside curly-brace scopes
- wildcard `@import` patterns that are too broad or outside extensions
- legacy `<INCLUDE_TYPOSCRIPT:` usage that should become `@import`
- comments or missing `[END]`/`[GLOBALS]` that previously leaked across
  included snippets

Source:

- `https://docs.typo3.org/c/typo3/cms-core/main/en-us/Changelog/12.0/Feature-97816-TypoScriptSyntaxImprovements.html`
- `https://docs.typo3.org/c/typo3/cms-core/main/en-us/Changelog/12.0/Breaking-97816-TypoScriptSyntaxChanges.html`

## Hooks, Events, And Services

TYPO3 v12 removes many deprecated hooks and older registration globals.
Search custom extensions for:

- page link and menu hooks
- TypoLink hooks
- page module hooks
- button bar and new content element wizard hooks
- record list hooks
- frontend cache hooks
- context menu providers
- element browsers
- linkvalidator link types
- backend toolbar items
- custom content object registration
- Extbase type converters and validators

Use PSR-14 events, service configuration, service tags, or new
configuration files where the changelog says so. Let Rector handle
supported PHP/TCA migrations, but manually verify behavior.

## Backend Modules And JavaScript

Check for:

- `$TBE_MODULES` and `$TBE_MODULES_EXT`; register backend modules in
  `Configuration/Backend/Modules.php`.
- `ModuleTemplate->addJavaScriptCode()`, inline JavaScript in
  FormEngine, and RequireJS assumptions.
- global jQuery access via `window.$`.
- custom backend route names; routes now include Composer package names.
- CodeMirror 6 changes in editor integrations.

## Extension And File Layout

- Global extensions in `typo3/ext/` are ignored and automatically
  disabled in TYPO3 v12. Use Composer or local extensions.
- `ext_typoscript_*.txt` files are not included anymore. Move TypoScript
  into current extension locations and include it explicitly.
- `ext_icon.*` as extension icon location is deprecated in v12.4.

Source:

- `https://docs.typo3.org/c/typo3/cms-core/main/en-us/Changelog/12.0/Breaking-96982-RemovedSupportForGlobalExtensions.html`

## TCA, FlexForms, Forms, And Output

Check for:

- FlexForm `TCEforms` array keys; use direct element definitions.
- TCA group, folder, email, password, link, and slug behavior changes.
- auto-created database fields for TCA `slug`.
- Form framework changed select markup.
- `EXT:form` EmailFinisher now using FluidEmail.
- frontend HTML sanitizer changes and custom allowed HTML assumptions.
- custom login logo alt text, which is enforced.

## Upgrade And Verification Tasks

Official post-upgrade tasks include:

- flush TYPO3 and PHP cache
- create missing database tables and columns
- run all upgrade wizards
- change or remove obsolete database columns and tables
- flush caches again
- optionally reset backend user preferences
- update language packs
- verify webserver configuration such as `.htaccess`

Source:

- `https://docs.typo3.org/m/typo3/reference-coreapi/12.4/en-us/Administration/Upgrade/Major/PostupgradeTasks/Index.html`
