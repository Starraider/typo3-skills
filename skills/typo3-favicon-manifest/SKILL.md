---
name: typo3-favicon-manifest
description: Integrate and configure favicon, app icon, and web manifest support in TYPO3 v14 projects, including Fluid `f:page.headerData`, TypoScript head tags, `page.shortcutIcon`, site-level route enhancer mapping for `/site.webmanifest` and `/browserconfig.xml`, and practical verification steps. Use when creating or fixing favicon/app icon setup, wiring web manifest delivery, or migrating icon configuration in a TYPO3 v14 project.
---

# TYPO3 Favicon + Web Manifest Workflow

Follow this workflow to add or repair favicon and app icon integration in a reusable, project-agnostic way.

## 1. Collect Required Context

Ask for missing context before editing:

1. Identify which extension or site package owns frontend output.
2. Ask where the favicon/app icon files are stored (exact folder path).
3. Ask whether `site.webmanifest` and `browserconfig.xml` already exist.
4. Ask which site configuration identifier is active (for `config/sites/<site-id>/config.yaml`).

If icon files do not exist yet, suggest generating a full icon set with [RealFaviconGenerator](https://realfavicongenerator.net/) and then continue once the files are available.

## 2. Verify or Define Expected Icon Files

Expect at least these common files (names can vary by project):

- `apple-touch-icon.png`
- `favicon-32x32.png`
- `favicon-16x16.png`
- `android-chrome-192x192.png`
- `safari-pinned-tab.svg`
- `favicon.ico`
- `site.webmanifest`
- `browserconfig.xml`

If project naming differs, keep generated markup consistent with actual filenames.

## 3. Add Head Integration

Prefer Fluid `f:page.headerData` in the PAGEVIEW layout when the site package owns the page shell:

```html
<f:page.headerData>
    <link rel="apple-touch-icon" sizes="180x180" href="{f:uri.resource(path: 'Icons/Favicon/apple-touch-icon.png', extensionName: 'Sitepackage')}">
    <link rel="icon" type="image/png" sizes="32x32" href="{f:uri.resource(path: 'Icons/Favicon/favicon-32x32.png', extensionName: 'Sitepackage')}">
    <link rel="icon" type="image/png" sizes="16x16" href="{f:uri.resource(path: 'Icons/Favicon/favicon-16x16.png', extensionName: 'Sitepackage')}">
    <link rel="icon" type="image/png" sizes="192x192" href="{f:uri.resource(path: 'Icons/Favicon/android-chrome-192x192.png', extensionName: 'Sitepackage')}">
    <link rel="manifest" href="/site.webmanifest">
    <link rel="mask-icon" href="{f:uri.resource(path: 'Icons/Favicon/safari-pinned-tab.svg', extensionName: 'Sitepackage')}" color="#5bbad5">
    <meta name="msapplication-config" content="/browserconfig.xml">
    <meta name="theme-color" content="#ffffff">
</f:page.headerData>
```

Use TypoScript `page.headerData` when the head tags are configured outside Fluid templates. Keep `{path:EXT:...}` + `insertData = 1` so Composer/public-path setups resolve correctly.

```typoscript
page {
  headerData {
    10 = TEXT
    10 {
      value (
<link rel="apple-touch-icon" sizes="180x180" href="{path:EXT:sitepackage/Resources/Public/Icons/Favicon/apple-touch-icon.png}">
<link rel="icon" type="image/png" sizes="32x32" href="{path:EXT:sitepackage/Resources/Public/Icons/Favicon/favicon-32x32.png}">
<link rel="icon" type="image/png" sizes="16x16" href="{path:EXT:sitepackage/Resources/Public/Icons/Favicon/favicon-16x16.png}">
<link rel="icon" type="image/png" sizes="192x192" href="{path:EXT:sitepackage/Resources/Public/Icons/Favicon/android-chrome-192x192.png}">
<link rel="manifest" href="/site.webmanifest">
<link rel="mask-icon" href="{path:EXT:sitepackage/Resources/Public/Icons/Favicon/safari-pinned-tab.svg}" color="#5bbad5">
<meta name="msapplication-config" content="/browserconfig.xml">
<meta name="theme-color" content="#ffffff">
      )
      insertData = 1
    }
  }

  shortcutIcon = EXT:sitepackage/Resources/Public/Icons/Favicon/favicon.ico
}
```

Implementation notes:

1. Replace `EXT:sitepackage/...` with the real extension path.
2. Avoid hardcoding `/_assets/...` hashes.
3. If `headerData.10` is already occupied, use the next free index (`20`, `30`, ...).
4. Escape or hardcode only trusted values in `f:page.headerData`; it outputs raw head content.

## 4. Create or Update `site.webmanifest`

Create the manifest file in the same public icon folder used by the project (or adapt to existing conventions).

Use this minimal template and replace placeholders:

```json
{
  "name": "Project Name",
  "short_name": "Project",
  "icons": [
    {
      "src": "/path-or-public-url/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/path-or-public-url/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#ffffff",
  "background_color": "#ffffff",
  "display": "standalone"
}
```

Keep icon URLs consistent with the deployed public paths used by TYPO3.

## 5. Expose Manifest and Browser Config at Root URL

Ensure `/site.webmanifest` and `/browserconfig.xml` are resolvable via site routing.

Add entries to the `PageTypeSuffix` map in `config/sites/<site-id>/config.yaml`:

```yaml
routeEnhancers:
  PageTypeSuffix:
    type: PageType
    default: '/'
    index: ''
    map:
      site.webmanifest: 3478304621
      browserconfig.xml: 2943879438
```

Use stable, unused numeric type IDs and document them with the site configuration.

## 6. Confirm Delivery and HTML Output

Verify end-to-end after changes:

1. Open frontend HTML source and confirm all `<link>`/`<meta>` tags render.
2. Check direct responses for `/site.webmanifest` and `/browserconfig.xml`.
3. Confirm favicon appears in browser tabs and mobile install prompts.
4. Clear TYPO3 caches if assets/routes do not appear immediately.

## 7. Project-Agnostic Guardrails

1. Preserve existing site package conventions instead of forcing a fixed icon folder.
2. Keep semantic and routing behavior unchanged except for favicon-related additions.
3. Prefer minimal diffs when retrofitting existing TYPO3 projects.
4. Document assumptions explicitly when file names, site IDs, or route enhancer names are inferred.

## Load References As Needed

- Implementation patterns: [references/implementation-patterns.md](references/implementation-patterns.md)
- External resources: [references/resources.md](references/resources.md)

## References

Use these external sources when needed:

- [TYPO3 app icon integration article (t3forum)](https://t3forum.net/d/405-einbindung-von-app-icons-in-typo3)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
