# TYPO3 13 Change Hotspots

Use this reference when assessing whether a TYPO3 12 project is ready
for TYPO3 13. Always verify details against current official docs.

## Platform And Support

- TYPO3 v13.4 requires PHP 8.2 or newer and supports PHP 8.2 through
  8.4 on the official 13.4.0 requirements page.
- TYPO3 v13 requires Composer 2.1 or newer for Composer-based work.
- Supported databases include MariaDB 10.4.3 through 11.0.0, MySQL
  8.0.17 or newer, PostgreSQL 10.0 or newer, and SQLite 3.8.3 or newer.
- Required PHP extensions include `pdo`, `session`, `xml`, `filter`,
  `SPL`, `standard`, `tokenizer`, `mbstring`, and `intl`.
- TYPO3 v12 regular support ended on 2026-04-30. Treat v12 as ELTS or
  an interim source version when planning after that date.

Sources to verify:

- `https://get.typo3.org/version/13.4.0`
- `https://docs.typo3.org/c/typo3/cms-core/main/en-us/Changelog/13.0/Breaking-102779-TYPO3V13SystemRequirements.html`
- `https://docs.typo3.org/m/typo3/reference-coreapi/13.4/en-us/Administration/Installation/SystemRequirements/Index.html`

## Composer And Package Changes

- Upgrade all installed TYPO3 core packages together with
  `--update-with-all-dependencies`.
- Use `composer why-not` and `composer prohibits` before forcing
  changes.
- When Composer reports third-party blockers, add a target-compatible
  version constraint to the same `composer require` command. Official
  docs give `helhum/typo3-console` as an example where v12-compatible
  `^8.1` must move to a v13-compatible `^9.1`.
- `typo3/cms-t3editor` is merged into `typo3/cms-backend` in v13, but
  Composer docs may still list package examples. Verify whether the
  project should remove or keep package constraints based on installed
  packages and target core version.

Source:

- `https://docs.typo3.org/m/typo3/reference-coreapi/13.4/en-us/Administration/Upgrade/Major/UpgradeCore.html`

## Deprecated v12 Functionality Removed

TYPO3 v13 removes many APIs deprecated in v12. Search custom extensions
for the removed symbols and map each hit to the changelog.

High-impact removals include:

- Old TypoScript/Page TSconfig APIs:
  `TypoScriptParser`, `TemplateService`, `PageTsConfigLoader`,
  `PageTsConfigParser`, `PageTsConfig`, and the old
  `ModifyLoadedPageTsConfigEvent`.
- `TYPO3\CMS\Frontend\Plugin\AbstractPlugin`.
- `RequireJsController`, the `requirejs` eID endpoint, and RequireJS
  PageRenderer APIs.
- Backend CSH ViewHelpers `<f:be.buttons.csh>` and
  `<f:be.labels.csh>`.
- `<f:translate>` argument `alternativeLanguageKeys`.
- TypoScript options and condition functions including `config.baseURL`,
  `config.removePageCss`, `config.xhtmlDoctype`, `[loginUser()]`,
  `[usergroup()]`, and legacy constants constructs.
- TCA `MM_insert_fields`, FlexForm `TCEforms` compatibility, and
  `fe_users.TSconfig` / `fe_groups.TSconfig` database fields.
- Feature `security.backend.enforceContentSecurityPolicy` is now always
  enabled.

Source:

- `https://docs.typo3.org/c/typo3/cms-core/main/en-us/Changelog/13.0/Breaking-100963-DeprecatedFunctionalityRemoved.html`

## Backend JavaScript And RequireJS

RequireJS is removed in v13. Check for:

- `loadRequireJs()`, `loadRequireJsModule()`, and
  `includeRequireJsModules`.
- FormEngine result array key `requireJsModules`.
- AMD module definitions and `require([...])` calls in backend assets.
- Backend JavaScript relying on `window.jQuery`, `window.$`, jQuery UI,
  or Bootstrap's removed jQuery interface.

Migration direction:

- Define imports in `Configuration/JavaScriptModules.php`.
- Load modules with `PageRenderer->loadJavaScriptModule()`.
- Use Fluid `includeJavaScriptModules` for backend page rendering.
- Convert AMD modules to native ES modules.

Sources:

- `https://docs.typo3.org/c/typo3/cms-core/main/en-us/Changelog/13.0/Breaking-101266-RemoveRequireJS.html`
- `https://docs.typo3.org/c/typo3/cms-core/main/en-us/Changelog/13.0/Breaking-100966-RemoveJquery-ui.html`
- `https://docs.typo3.org/c/typo3/cms-core/main/en-us/Changelog/13.0/Breaking-101820-RemoveBootstrapJQueryInterfaceAndWindowJQuery.html`

## Typed APIs And Enums

TYPO3 v13 introduces stricter native types and native enum/bitset APIs.
Custom extensions may fail even when names still exist.

Check usages of:

- `IconFactory->getIcon()` and icon state handling.
- FAL `FileInterface`, `FolderInterface`, `ResourceInterface`,
  `DriverInterface`, `AbstractDriver`, processing APIs, and duplication
  behavior values.
- `GeneralUtility::intExplode()`, `sanitizeLocalUrl()`, and other
  methods with stricter arguments/return values.
- `VersionState`, backend MFA/Login/Action values, information status,
  duplication behavior, and file type constants/classes migrated toward
  native enums or bitsets.
- Extbase strict typing, validators receiving PSR-7 request context,
  and file upload handling with `UploadedFile`.

Sources:

- `https://docs.typo3.org/c/typo3/cms-core/main/en-us/Changelog-13-combined.html`
- `https://docs.typo3.org/c/typo3/cms-core/main/en-us/Changelog/13.0/Breaking-102632-UseStrictTypesInExtbase.html`

## Frontend, TSFE, PageRepository, And Hooks

TYPO3 v13 removes or changes many frontend hooks and TSFE/PageRepository
internals. Search for direct `$GLOBALS['TSFE']`, TSFE member access, and
PageRepository hooks.

Hotspots:

- `TypoScriptFrontendController` methods/properties and hooks.
- `TSFE->fe_user`, `TSFE->applicationData`, and
  `TSFE->generatePage_preProcessing()`.
- `PageRepository->enableFields` hook and other PageRepository hooks.
- ContentObjectRenderer hooks, stdWrap hooks, GifBuilder hooks,
  LinkService hooks, TypoLinkCodecService hooks, and `getData` hooks.
- Indexed Search hooks, templates, search rules, TypoScript settings,
  pagination, and removed features.

Use replacement PSR-14 events where the changelog provides them. Do not
replace hooks by inventing custom lifecycle calls.

Sources:

- `https://docs.typo3.org/c/typo3/cms-core/main/en-us/Changelog-13-combined.html`
- `https://docs.typo3.org/c/typo3/cms-core/main/en-us/Changelog/13.0/Deprecation-102793-PageRepositoryEnableFields.html`

## TCA, FlexForms, FormEngine, And Database Schema

Check for:

- TCA datetime columns, because TYPO3 v13 uses BIGINT database column
  type for datetime TCA.
- TCA `[types][bitmask_*]` settings.
- `softref = notify`.
- Database relations in FlexForm container sections; these are no
  longer supported.
- `FlexFormTools->traverseFlexFormXMLData()` and old FlexForm traversal.
- `BE/flexformForceCDATA` and FlexForm XML output assumptions.
- FormEngine custom element labels/legends and removed `itemFormElID`.
- New Content Element Wizard entries, which are auto-registered via TCA
  in v13.
- TCA in `ext_tables.php`; use the Upgrade module check and move TCA to
  `Configuration/TCA`.

Sources:

- `https://docs.typo3.org/c/typo3/cms-core/main/en-us/Changelog-13-combined.html`
- `https://docs.typo3.org/m/typo3/reference-coreapi/13.4/en-us/Administration/Tools/Upgrade/Index.html`

## Backend Entry Point And Webserver Rules

TYPO3 v13 deprecates the `/typo3/index.php` backend entry point in
favor of handling backend and frontend requests through `/index.php`.

Check:

- `.htaccess`, NGINX, Caddy, Apache vhost, IIS, DDEV, and deployment
  rewrites.
- Whether `typo3/*` requests are rewritten to `/index.php`.
- Whether rules still special-case `/typo3/index.php`.
- The configured backend entry point when
  `$GLOBALS['TYPO3_CONF_VARS']['BE']['entryPoint']` is used.

Source:

- `https://docs.typo3.org/c/typo3/cms-core/main/en-us/Changelog/13.0/Deprecation-87889-TYPO3BackendEntrypointScriptDeprecated.html`

## Site Sets, PAGEVIEW, And TypoScript Modernization

Site sets and `PAGEVIEW` are v13 features, not mandatory upgrade steps.
Treat adoption as a separate modernization phase unless the project
already uses them or the user explicitly asks.

Use site sets when consolidating site-scoped settings, TypoScript,
TSconfig, and configuration presets in
`Configuration/Sets/<SetName>/config.yaml`.

Check:

- `config/sites/*/config.yaml` dependencies.
- `Configuration/Sets/*/config.yaml`.
- `settings.definitions.yaml` and `settings.yaml`.
- `bin/typo3 site:sets:list`.
- TypoScript providers for sites and sets.
- Whether `FLUIDTEMPLATE` migration to `PAGEVIEW` is in scope.

Sources:

- `https://docs.typo3.org/c/typo3/cms-core/main/en-us/Changelog/13.1/Feature-103437-IntroduceSiteSets.html`
- `https://docs.typo3.org/c/typo3/cms-core/main/en-us/Changelog/13.1/Feature-103504-NewContentObjectPageView.html`

## Fluid 4 And Templates

TYPO3 v13 uses Fluid 4 as the base version. Existing templates should
mostly keep working, but deprecations become more visible when
deprecation logging is enabled.

Check:

- Custom ViewHelpers, especially overridden `initializeArguments()`,
  escaping flags, tag-based boolean attributes, and APIs deprecated in
  Fluid 2.
- Direct use of `StandaloneView` or template view classes; prefer TYPO3
  Core's view factory APIs where v13 deprecates older view construction.
- Backend templates using removed ViewHelpers or `f:format.html` in BE
  context.
- Accessibility after template changes, especially labels, headings,
  focus order, and generated boolean attributes.

Sources:

- `https://docs.typo3.org/c/typo3/cms-core/main/en-us/Changelog/13.3/Feature-104896-RaiseFluidStandaloneTo40.html`
- `https://typo3.org/article/recent-improvements-in-fluid`

## Upgrade And Verification Tasks

Official upgrade flow emphasizes:

- Do not upgrade production directly; use backups and a development or
  parallel instance.
- Run all upgrade wizards on the current major before changing major
  Composer constraints.
- Enable/check deprecation logging and extension scanner findings before
  the major upgrade.
- Check each installed extension for target compatibility.
- Upgrade all installed TYPO3 core packages together and resolve
  Composer blockers explicitly.
- After the upgrade, flush caches, update database schema, run upgrade
  wizards, update language packs, and verify webserver configuration.

Sources:

- `https://docs.typo3.org/m/typo3/reference-coreapi/13.4/en-us/Administration/Upgrade/Major/PreupgradeTasks/Index.html`
- `https://docs.typo3.org/m/typo3/reference-coreapi/13.4/en-us/Administration/Upgrade/Major/UpgradeCore.html`
- `https://docs.typo3.org/m/typo3/reference-coreapi/13.4/en-us/Administration/Upgrade/Major/PostupgradeTasks/Index.html`
- `https://docs.typo3.org/m/typo3/reference-coreapi/13.4/en-us/ApiOverview/Deprecation/Index.html`
- `https://docs.typo3.org/m/typo3/reference-coreapi/13.4/en-us/Administration/Tools/Upgrade/Index.html`
- `https://www.typo3-rector.com/`
