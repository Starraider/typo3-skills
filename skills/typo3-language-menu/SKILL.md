---
name: typo3-language-menu
description: Build a TYPO3 v13+ language switcher menu that uses the `language-menu` DataProcessor, auto-redirects first-time visitors to their browser's preferred language, and persists the user's manual language choice in a cookie. Use this skill when adding or modifying a language selection menu in a TYPO3 site package — covers TypoScript configuration, Fluid template rendering, JavaScript browser-detection + cookie logic, and the hidden data-attribute bridge pattern between Fluid and JS.
---

# TYPO3 Language Menu

## Architecture

Three layers work together:

1. **TypoScript** — `language-menu` data processor exposes `{languageMenu}` to Fluid
2. **Fluid partial** — renders the dropdown UI + a hidden `<ul class="lang-menu__data">` that embeds per-language data attributes for JS
3. **JavaScript** — reads the data attributes, detects browser language preference, redirects if needed, and writes `lang_pref` cookie on manual selection

The hidden data list decouples Fluid from JS cleanly: Fluid renders once server-side; JS reads the emitted data without parsing HTML text.

---

## 1. TypoScript

Add inside `lib.fluidPage` (or `PAGEVIEW`) `dataProcessing`:

```typoscript
1767788400 = language-menu
1767788400 {
    languages = auto
    as = languageMenu
}
```

> Use a unique timestamp-style key to avoid collisions.
> `languages = auto` reads available languages from site configuration.

---

## 2. Fluid Partial

See **`references/fluid-template.md`** for the complete annotated Fluid partial.

Key structural elements:

- `.JS_lang-menu` wrapper — JS hook
- `.lang-menu__data` hidden `<ul>` — machine-readable language data (hreflang, link, active, available)
- `.JS_lang-menu-trigger` button — toggle control
- `.lang-menu__dropdown` — visible language list

Each `<li>` in the data list carries `data-hreflang`, `data-link`, `data-active`, `data-available`.

**Flag images** are referenced as SVG resources:

```html
<img src="{f:uri.resource(path: 'Icons/Flags/{lang.flag}.svg', extensionName: 'MySitePackage')}" />
```

Provide SVG flags in `Resources/Public/Icons/Flags/` named by the `flag` field of the language config (e.g. `gb.svg`, `de.svg`).

---

## 3. JavaScript

Copy **`assets/language-preference.js`** into your extension's JS build.
Include it after the DOM is available (e.g. at end of `<body>` or as a module).

### What it does

| Step | Description |
|------|-------------|
| Read data | Parses `.lang-menu__data` items into a structured array |
| Cookie on click | Sets `lang_pref=<hreflang>` for 365 days when user clicks a language link |
| Session guard | Skips auto-redirect if `sessionStorage.lang_redirected` is set (prevents redirect loops) |
| Preferred lang | Uses `lang_pref` cookie first, then iterates `navigator.languages` to find a match |
| Redirect | `window.location.replace(target.link)` — single redirect, no history entry |

### Cookie spec

| Attribute | Value |
|-----------|-------|
| Name | `lang_pref` |
| Value | hreflang code, e.g. `de-DE` |
| Expires | 365 days |
| Path | `/` |
| SameSite | `Lax` |

---

## 4. LanguageMenu item properties

Each item exposed by the `language-menu` processor:

| Property | Type | Description |
|----------|------|-------------|
| `hreflang` | string | BCP-47 language tag, e.g. `de-DE` |
| `navigationTitle` | string | Display name |
| `link` | string | URL for this language version |
| `active` | bool | Current language |
| `available` | bool | Translation exists for current page |
| `flag` | string | Flag identifier (from site config) |
| `title` | string | Page title in that language |
| `twoLetterIsoCode` | string | ISO 639-1 code |

---

## 5. CSS

See `references/css-patterns.md` for the complete CSS reference.
Structure uses BEM with `.lang-menu` block: `__trigger`, `__dropdown`, `__item`, `__link`, `__flag`, `__label`.

---

## References

- **Fluid template**: `references/fluid-template.md`
- **CSS patterns**: `references/css-patterns.md`
- **JS asset**: `assets/language-preference.js`
- [LanguageMenuProcessor reference](https://docs.typo3.org/m/typo3/reference-typoscript/main/en-us/DataProcessing/LanguageMenuProcessor.html)
- [Frontend Localization Guide](https://docs.typo3.org/m/typo3/guide-frontendlocalization/main/en-us/LanguageMenu/Index.html)
