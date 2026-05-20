# Favicon Implementation Patterns

## Expected Icon Files

At minimum, expect these files (names can vary by project):

- `apple-touch-icon.png`
- `favicon-32x32.png`
- `favicon-16x16.png`
- `android-chrome-192x192.png`
- `android-chrome-512x512.png`
- `safari-pinned-tab.svg`
- `favicon.ico`
- `site.webmanifest`
- `browserconfig.xml`

## Fluid Template Head Integration

Use `f:page.headerData` in the PAGEVIEW layout:

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

## TypoScript Head Integration

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

## site.webmanifest Template

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

## Route Enhancer for Manifest Files

Add to `config/sites/<site-id>/config.yaml`:

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

## Verification Steps

1. Open frontend HTML source and confirm all `<link>`/`<meta>` tags render
2. Check direct responses for `/site.webmanifest` and `/browserconfig.xml`
3. Confirm favicon appears in browser tabs and mobile install prompts
4. Clear TYPO3 caches if assets/routes do not appear immediately
