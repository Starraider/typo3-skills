# TYPO3 Sitepackage Standards

Use this reference while merging TYPO3 site packages. The current baseline is
the TYPO3 13.4 Site Package Tutorial minimal example:
https://docs.typo3.org/m/typo3/tutorial-sitepackage/13.4/en-us/MinimalExample/Index.html

## Current TYPO3 13.4 Shape

- A site package is a TYPO3 extension containing site configuration,
  templates, assets, TypoScript, and related theme behavior.
- Place the extension in `packages/<extension-key>/` for local Composer
  development.
- `composer.json` must identify the package as a TYPO3 extension:
  - `type: typo3-cms-extension`
  - `require.typo3/cms-core: ^13.4` for a TYPO3 13.4-only package
  - relevant TYPO3 packages such as `typo3/cms-rte-ckeditor` and
    `typo3/cms-fluid-styled-content` when used
  - PSR-4 autoloading from the PHP namespace to `Classes/`
  - `extra.typo3/cms.extension-key` with the underscore extension key
- Composer package names use dashes, for example
  `my-vendor/my-site-package`.
- TYPO3 extension keys use underscores, for example `my_site_package`.
- Extension asset references use the extension key, for example:
  `EXT:my_site_package/Resources/Public/Icons/favicon.ico`.

## Site Sets

- TYPO3 site sets were introduced in TYPO3 13.1.
- For TYPO3 13.1+, a site package should provide a site set in
  `Configuration/Sets/<SetName>/`.
- Each site set needs `config.yaml`.
- A set `config.yaml` should define `name`, `label`, and dependencies such as:

```yaml
name: my-vendor/my-site-package
label: 'My Site Package'
dependencies:
  - typo3/fluid-styled-content
  - typo3/fluid-styled-content-css
```

- The project site configuration can depend on the set:

```yaml
dependencies:
  - my-vendor/my-site-package
```

- For TYPO3 13.1+, provide site-package TypoScript through the site set, for
  example `Configuration/Sets/<SetName>/setup.typoscript`.

## TypoScript Rendering

The TYPO3 13.4 tutorial uses `PAGEVIEW` in page TypoScript:

```typoscript
page = PAGE
page {
  10 = PAGEVIEW
  10 {
    paths {
      0 = EXT:my_site_package/Resources/Private/PageView/
      10 = {$MySitePackage.template_path}
    }
    dataProcessing {
      10 = page-content
    }
  }
}
```

When merging, keep existing working rendering if the target project depends on
it, but normalize paths and constants to the target package.

## Backward Compatibility

- Site sets and site-scoped setting definitions are available from TYPO3 13.1.
- Until TYPO3 13, frontend TypoScript was conventionally provided from
  `Configuration/TypoScript/`.
- If the target package must support TYPO3 11.5 or 12.4, keep legacy TypoScript
  files such as `Configuration/TypoScript/setup.typoscript` and
  `Configuration/TypoScript/constants.typoscript`.
- For TYPO3 11.5 or 12.4 support, ensure static TypoScript can be included
  through legacy registration, commonly in
  `Configuration/TCA/Overrides/sys_template.php` using
  `ExtensionManagementUtility::addStaticFile()`.
- If the support range spans TYPO3 12.4 and 13.4, include both:
  - `Configuration/Sets/<SetName>/` for TYPO3 13.1+
  - legacy TypoScript files and registration for TYPO3 12.4 and older
- Do not use APIs or TypoScript objects that are unavailable in the oldest
  supported TYPO3 version unless guarded and optional.

## Composer Version Rules

- The target TYPO3 version controls Composer constraints. Do not simply combine
  both packages' constraints if they imply incompatible TYPO3 versions.
- Prefer the user's requested target version. Otherwise infer from the root
  project `composer.json`, `composer.lock`, and installed `typo3/cms-core`.
- Align PHP constraints with the TYPO3 support range and the project runtime.
- Keep extension metadata consistent:
  - package name with dash form
  - extension key with underscore form
  - PSR-4 namespace matching moved classes
  - no stale references to the absorbed package key

## Validation Checklist

- `composer.json` validates and can be installed.
- The target extension key is used consistently in TypoScript, Fluid, PHP,
  YAML, and asset paths.
- Site set dependencies are present for TYPO3 13.1+.
- Legacy TypoScript registration remains available when supporting TYPO3 11.5
  or 12.4.
- TCA overrides load without duplicate-field or missing-table errors.
- Fluid templates render without stale partial, layout, or asset references.
- Generated assets are rebuilt from sources when possible.
- TYPO3 caches are flushed after template, TypoScript, TCA, or site set changes.
