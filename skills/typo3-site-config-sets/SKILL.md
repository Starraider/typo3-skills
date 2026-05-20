---
name: typo3-site-config-sets
description: "Decide where TYPO3 v14 site-handling configuration belongs: site-specific files in `config/sites/site-id/`, reusable Site Set files in `Configuration/Sets/SetName/` inside a site package or extension, and typed site setting definitions. Use this skill whenever configuring TYPO3 v14, configuring a TYPO3 extension or Extbase plugin, integrating configuration into an extension/plugin, moving TypoScript or Page TSconfig into the right place, or deciding whether configuration belongs in `config/sites` or `Configuration/Sets`."
---

# TYPO3 Site Config & Sets

Use this skill as the placement authority before changing TYPO3 v14 configuration. Decide the correct configuration layer first, then hand off to a more specific TYPO3 skill if the task also needs implementation details such as Extbase, routing, FlexForms, or templates.

## Workflow

1. Classify the requested configuration as either site-specific runtime config or reusable package config.
2. Put per-site values into `config/sites/<site>/...`.
3. Put reusable settings, TypoScript, and Page TSconfig into `EXT:<ext>/Configuration/Sets/<SetName>/...`.
4. Keep PHP registration and DI in the extension's normal PHP and YAML files; use this skill only to decide adjacent site-handling files.
5. Validate that dependencies are expressed through Site Sets, not cross-extension TypoScript imports.

## Placement Decision

### Use `config/sites/<site>/config.yaml` for site-instance configuration

Put configuration here when it describes one concrete mounted site:

- `base`
- `rootPageId`
- languages
- error handling
- `routeEnhancers`
- the site's `dependencies` and `optionalDependencies`
- other site-identifying values that differ per installation or per mounted site

Do not put these values into an extension or site package when they are environment-specific or editor-managed.

### Use `config/sites/<site>/settings.yaml` for site-instance overrides

Put configuration here when the value should be editable per site and may be changed in the TYPO3 site settings editor.

Use this file for:

- site-specific overrides of typed site settings
- project or environment values that must differ between sites using the same extension or site package
- final integrator-controlled values after a set provides the setting definition

Important rules:

- TYPO3 writes editor changes back to `config/sites/<site>/settings.yaml`.
- TYPO3 can remove `imports` from this file when the site settings editor saves it.
- In TYPO3 v14, `settings.yaml` uses a flat map style, not a nested tree.

### Use `Configuration/Sets/<SetName>/` for reusable package configuration

Put configuration here when it should ship with a site package or extension and be reusable across one or more sites.

Both of these can provide Site Sets:

- a site package
- a non-site-package extension

A single extension may provide multiple sets by using multiple subfolders below `Configuration/Sets/`.

## File Map Inside A Site Set

Use this directory shape:

```text
EXT:my_extension/Configuration/Sets/MySet/
  config.yaml
  settings.definitions.yaml
  settings.yaml
  setup.typoscript
  constants.typoscript
  page.tsconfig
```

Not every file is required, but `config.yaml` is mandatory.

### `Configuration/Sets/<SetName>/config.yaml`

This is the set definition file. Put these concerns here:

- unique set `name` in `vendor/package` form
- backend-visible `label`
- `dependencies`
- `optionalDependencies`
- small inline settings only when they truly belong to the set definition
- `hidden: true` for helper sets that should not appear in selection UIs

Use `dependencies` for required upstream sets and `optionalDependencies` only when the providing extension may not be installed.

Do not put site-specific `base`, `rootPageId`, or route enhancer config here.

### `Configuration/Sets/<SetName>/settings.definitions.yaml`

Define typed site settings here when an extension, plugin, or site package exposes a configurable value that integrators should override per site.

Put these concerns here:

- setting type
- default value
- label, description, and UI metadata
- validation-oriented definitions for settings your code expects

Preferred pattern:

- define the setting in `settings.definitions.yaml`
- optionally ship reusable defaults in the set
- let the concrete site override the value in `config/sites/<site>/settings.yaml`

When adding a new plugin setting like `storagePid`, `detailPid`, or a feature toggle, prefer a site setting definition over hard-coding the value in TypoScript.

### `Configuration/Sets/<SetName>/settings.yaml`

Use this file for shipped values that belong to the set and should remain version-controlled inside the extension or site package.

Use it for:

- overriding defaults provided by dependent sets
- shipping stable defaults outside the editor-managed site file
- imported value fragments that must not be rewritten by the site settings editor

Do not use this file as the primary place to define new typed settings. Define them in `settings.definitions.yaml`; use this file to provide or override values.

### `Configuration/Sets/<SetName>/setup.typoscript`

Put reusable setup TypoScript here when it belongs to the set and should load automatically for every site depending on that set.

Use set dependencies for cross-set ordering. Avoid solving cross-extension loading with TypoScript `@import`.

### `Configuration/Sets/<SetName>/constants.typoscript`

Use only for reusable constants that still make sense in a Site Set based setup.

Remember:

- site settings override constants
- if a typed site setting exists, prefer the site setting as the main configuration surface

### `Configuration/Sets/<SetName>/page.tsconfig`

Put site-scoped Page TSconfig here when it belongs only to sites using the set.

Prefer this over globally registering Page TSconfig in PHP when the config should apply only if the site depends on the set.

## Site Package vs Extension

### Site package

Use a Site Set inside the site package when the configuration is part of the frontend integration layer:

- project TypoScript
- page TSconfig
- project-wide defaults
- site setting definitions used by the site's Fluid or TypoScript

Common location:

```text
EXT:site_package/Configuration/Sets/SitePackage/
```

### Reusable extension or plugin

Use a Site Set inside the extension when the extension ships reusable frontend configuration that should plug into any site:

- plugin TypoScript
- Page TSconfig tied to that extension's feature
- extension-owned site setting definitions
- optional feature presets split into separate sets

Common location:

```text
EXT:my_extension/Configuration/Sets/MyFeature/
```

If the extension has a base feature plus optional extras, create multiple sets and express the loading order through `dependencies`.

## Rules To Apply Before Editing

- Never put site-instance `base`, language setup, or `rootPageId` into a Site Set.
- Never put reusable extension or site-package defaults only in `config/sites/<site>/`; they will not ship with the package.
- Never use cross-extension TypoScript imports as the primary dependency mechanism when Site Sets can express the dependency.
- Never define new setting defaults only in `constants.typoscript` when a typed site setting should exist.
- Always keep TYPO3 v14 `settings.yaml` entries in flat map form.
- Always prefer version-controlled set files for reusable defaults that must survive editor saves.

## Handoff To Other TYPO3 Skills

After deciding the placement, continue with a specialized skill as needed:

- Extbase plugin registration and controller wiring: `typo3-extbase-plugin`
- route enhancers inside site config: `typo3-route-enhancers`
- plugin settings UI via FlexForms: `typo3-flexforms`
- conditional TypoScript in `setup.typoscript`, imported TypoScript, or site-setting-driven constants: `typo3-typoscript-conditions`
- translated extension records: `typo3-translatable-extension-data`

Keep this skill focused on where configuration belongs. Let other TYPO3 skills handle the implementation details inside the chosen files.

## References

For official TYPO3 v14 source material and distilled placement rules, read [references/site-handling-placement.md](references/site-handling-placement.md).
