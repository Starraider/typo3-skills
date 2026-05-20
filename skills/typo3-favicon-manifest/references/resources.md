# Favicon Resources and External Links

## Icon Generation

- [RealFaviconGenerator](https://realfavicongenerator.net/) - Generate complete icon sets from a single image

## TYPO3 Integration Articles

- [TYPO3 app icon integration (t3forum)](https://t3forum.net/d/405-einbindung-von-app-icons-in-typo3)

## File Naming Conventions

Standard file names for favicon assets:

| File | Purpose |
|------|---------|
| `apple-touch-icon.png` | iOS home screen icon (180x180) |
| `favicon-32x32.png` | Standard favicon |
| `favicon-16x16.png` | Standard favicon small |
| `android-chrome-192x192.png` | Android Chrome M39+ icon |
| `android-chrome-512x512.png` | Android Chrome icon |
| `safari-pinned-tab.svg` | Safari pinned tab icon |
| `favicon.ico` | IE fallback icon |
| `site.webmanifest` | Progressive Web App manifest |
| `browserconfig.xml` | Windows tile configuration |

## Manifest Requirements

The `site.webmanifest` should include:
- `name` - Full app/site name
- `short_name` - Short name for home screen
- `icons` array with at least 192x192 and 512x512 variants
- `theme_color` - Browser UI color
- `background_color` - Splash screen color
- `display` - How to display (standalone, browser, etc.)

## browserconfig.xml Template

```xml
<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <tile>
            <square70x70logo src="/path/to/icon-70x70.png"/>
            <square150x150logo src="/path/to/icon-150x150.png"/>
            <square310x310logo src="/path/to/icon-310x310.png"/>
            <wide310x150logo src="/path/to/icon-310x150.png"/>
            <TileColor>#ffffff</TileColor>
        </tile>
    </msapplication>
</browserconfig>
```
