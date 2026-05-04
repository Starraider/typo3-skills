# Tailwind v4 Build Pipeline for TYPO3

## Dependencies

Install in the TYPO3 site package directory (e.g., `packages/theme-name/`):

```bash
ddev npm install --save-dev tailwindcss postcss @tailwindcss/postcss postcss-cli cssnano
```

## PostCSS Configuration

Create `postcss.config.js` in the package root:

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    'cssnano': {}
  }
}
```

> **Note:** Add `"type": "module"` to `package.json` to avoid ESM warnings.

## CSS Entry Point

Create `Resources/Private/Assets/Css/main.css`:

```css
@import "tailwindcss";

/* Explicit content scanning for TYPO3 Fluid templates */
@source "../../**/*.html";

/* Design tokens — see design-tokens.md */
@theme {
  /* Colors, fonts, spacing, etc. go here */
}
```

### Why `@source` is critical

Tailwind v4 auto-detects content files, but TYPO3's folder structure (`Resources/Private/Templates/`, `Partials/`, `Layouts/`) is non-standard. Without explicit `@source`, Tailwind won't scan Fluid `.html` files and utility classes used in templates will be purged from the output.

The path `../../**/*.html` is relative to the CSS entry point location and covers:

- `Resources/Private/Templates/**/*.html`
- `Resources/Private/Layouts/**/*.html`
- `Resources/Private/Partials/**/*.html`

## NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "dev": "postcss Resources/Private/Assets/Css/main.css -o Resources/Public/Css/main.css --watch",
    "build": "postcss Resources/Private/Assets/Css/main.css -o Resources/Public/Css/main.css",
    "test": "playwright test",
    "test:visual": "playwright test",
    "test:visual:update": "playwright test --update-snapshots",
    "test:css": "node -e \"const css = require('fs').readFileSync('Resources/Public/Css/main.css','utf8'); const tokens = ['--color-primary-100','--font-headline','--spacing-m']; tokens.forEach(t => { if(!css.includes(t)) { console.error('Missing: '+t); process.exit(1); } }); console.log('All tokens present.');\""
  }
}
```

### Commands — Always via DDEV

```bash
ddev npm run build        # Production build
ddev npm run dev          # Watch mode during development
ddev npm run test:visual  # Run VRT suite
```

> **⚠️ NEVER** run `npm run build` on the host directly. The build must run inside DDEV to ensure consistent Node.js version and OS environment.

## Output

The build produces `Resources/Public/Css/main.css` which is loaded in Fluid via:

```html
<f:asset.css identifier="theme-main" href="EXT:theme_name/Resources/Public/Css/main.css" />
```

## Build Verification Checklist

After initial setup, verify:

- [ ] `ddev npm run build` completes without errors
- [ ] `Resources/Public/Css/main.css` is generated
- [ ] Output contains Tailwind base styles
- [ ] Custom `@theme` tokens appear as CSS custom properties
- [ ] Adding a Tailwind class in a Fluid template and rebuilding includes it in the output
- [ ] Production build size is reasonable (< 100KB for a typical theme)
