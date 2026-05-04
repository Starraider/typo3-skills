# TYPO3 Site Handling Placement Notes

This reference distills the TYPO3 Core API docs for Site Handling in TYPO3 v14.

## Official Sources

- [Site sets](https://docs.typo3.org/m/typo3/reference-coreapi/main/en-us/ApiOverview/SiteHandling/SiteSets.html)
- [Site handling basics](https://docs.typo3.org/m/typo3/reference-coreapi/main/en-us/ApiOverview/SiteHandling/Basics.html)
- [Site settings](https://docs.typo3.org/m/typo3/reference-coreapi/main/en-us/ApiOverview/SiteHandling/SiteSettings.html)

## Distilled Rules

### `config/sites/<site>/config.yaml`

Use for one concrete site's configuration:

- base URL
- root page ID
- languages
- error handling
- route enhancers
- set dependencies selected for that site

This is the live site configuration layer, not the reusable package layer.

### `config/sites/<site>/settings.yaml`

Use for site-specific values and overrides. TYPO3 stores changes from the site settings editor here. In TYPO3 v14, this file is map-based.

Because TYPO3 rewrites this file on save, do not rely on `imports` surviving here.

### `EXT:my_extension/Configuration/Sets/<SetName>/config.yaml`

This is the root of a Site Set definition. A set lives inside `Configuration/Sets/` and each subfolder represents one set. The `config.yaml` must at least define a unique `name`, and usually a `label`, plus any `dependencies` or `optionalDependencies`.

Use this file to describe the set, not the concrete site instance.

### `EXT:my_extension/Configuration/Sets/<SetName>/settings.definitions.yaml`

Use for typed site setting definitions. This is where you define the setting metadata and default value that TYPO3 validates and exposes.

When an extension or site package introduces a new configurable value, define it here first.

### `EXT:my_extension/Configuration/Sets/<SetName>/settings.yaml`

Use for version-controlled values shipped by the set, especially overriding defaults from dependent sets. This file is safe for `imports` because it is not rewritten by the site settings editor.

Use it for shipped defaults and set-level overrides, not as the only definition point for new typed settings.

### `EXT:my_extension/Configuration/Sets/<SetName>/setup.typoscript`

Use for reusable setup TypoScript that belongs to the set. TYPO3 loads set TypoScript automatically through dependencies and deduplicates ordering.

Prefer set dependencies over cross-extension `@import` chains.

### `EXT:my_extension/Configuration/Sets/<SetName>/constants.typoscript`

Use only when constants are still needed. Site settings override constants, so typed site settings should be the primary configuration surface in TYPO3 v14.

### `EXT:my_extension/Configuration/Sets/<SetName>/page.tsconfig`

Use for Page TSconfig that should apply only to sites depending on the set. This avoids global scope pollution.

## Site Package And Extension Guidance

- A site package can provide one or more sets in `Configuration/Sets/`.
- A non-site-package extension can also provide one or more sets in `Configuration/Sets/`.
- If extra functionality is optional, create additional sets and wire them with dependencies instead of hiding everything inside one TypoScript file.

## Practical Heuristic

Ask one question first:

`Is this value owned by one concrete site, or should it ship with the extension/site package?`

- If one concrete site owns it, put it in `config/sites/<site>/...`.
- If the package owns it and multiple sites may reuse it, put it in `Configuration/Sets/<SetName>/...`.
