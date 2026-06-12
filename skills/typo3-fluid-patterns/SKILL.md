---
name: typo3-fluid-patterns
description: Battle-tested TYPO3 Fluid template patterns for site package development. Use this skill when building or maintaining a TYPO3 v12+ site package — regardless of CSS framework. Covers the full template hierarchy (Layouts → Pages → Partials → Atoms), CMS-first content architecture with lib.dynamicContent, colPos propagation for sidebar-aware styling, responsive image handling, WCAG 2.1 AA accessibility patterns, and progressive-enhancement JavaScript. Complements the typo3-playwright-ddev and typo3-tailwind-migration skills.
---

# TYPO3 Fluid Template Patterns

Reusable patterns for building TYPO3 v14+ site packages with Fluid templates. This skill is **CSS-framework-agnostic** — the patterns apply whether you use Tailwind, Bootstrap, vanilla CSS, or any other approach.

> **Companion skills:** Use `typo3-playwright-ddev` for test setup and `typo3-tailwind-migration` for CSS migration workflows.

## Site Package Directory Structure

Standard layout for a TYPO3 site package:

```
packages/theme-name/
├── Configuration/
│   └── Sets/
│       └── <set-name>/
│           ├── TypoScript/
│           │   ├── page.typoscript      # Page rendering (PAGEVIEW, data processors)
│           │   └── content.typoscript    # Content rendering (lib.dynamicContent, lib.contentElement)
│           └── setup.typoscript          # Main include file
├── Resources/
│   ├── Private/
│   │   ├── Language/                     # XLIFF translation files
│   │   └── Templates/
│   │       ├── Content/                  # Content element templates (Text, Hero, etc.)
│   │       ├── ContentPreviews/          # Backend preview templates
│   │       ├── Layouts/
│   │       │   ├── Content/              # Content element layouts (Default, Unwrapped)
│   │       │   └── Pages/               # Page layouts (Default — the outer HTML shell)
│   │       ├── Pages/                    # Page templates (Startpage, Contentpage, Sidebar)
│   │       └── Partials/
│   │           ├── Atoms/                # Smallest reusable units (Image, Video)
│   │           ├── Components/           # Composed units (Intro, Figure, Person)
│   │           ├── Content/              # Content-specific partials (Hero, Textpic)
│   │           ├── Header/               # Heading partials (Header, HeaderTag, Subheader)
│   │           ├── Icons/                # SVG icon partials
│   │           ├── Pages/                # Page-level partials (Header, Footer)
│   │           └── Wrapper/              # Wrapper partials (Component, Anchor)
│   └── Public/
│       ├── Css/                          # Compiled CSS output
│       └── JavaScript/                   # Client-side JS (single main.js)
└── package.json                          # Build scripts, dependencies
```

## Template Hierarchy

TYPO3 Fluid uses a **3-tier rendering chain** for pages and a parallel chain for content:

### Page Rendering

```
Page Layout (Layouts/Pages/Default.fluid.html)
  └── The outer HTML shell: <html>, <body>, asset loading, header/footer partials
  └── Defines sections: Stage, Main
      └── Page Template (Pages/Contentpage.fluid.html)
          └── Fills sections with content columns via lib.dynamicContent
          └── Uses Wrapper partials for consistent component framing
```

### Content Rendering

```
Content Template (Content/Text.fluid.html)
  └── Selects a Content Layout (Layouts/Content/Default.fluid.html)
  └── Content Layout renders: frame classes, anchor, header, main section
      └── Content Template fills the Main section
          └── Delegates to Content Partials (Partials/Content/Textpic.fluid.html)
              └── Partials use Atoms (Atoms/Image.fluid.html) and Components (Components/Intro.fluid.html)
```

### When to Use Each Level

| Level | Purpose | Example |
|-------|---------|---------|
| **Layout** | Outer shell, shared across pages/content types | `<html>`, `<body>`, asset loading |
| **Page Template** | Column structure for a specific backend layout | Main + sidebar grid |
| **Content Template** | Entry point for a CType, selects layout | `Text.fluid.html` → `Content/Default` layout |
| **Content Partial** | Complex rendering logic for a content type | `Textpic.fluid.html` with orientation handling |
| **Component** | Reusable composed unit (heading + text + CTA) | `Components/Intro.fluid.html` |
| **Atom** | Smallest reusable unit | `Atoms/Image.fluid.html` with responsive `<picture>` |

## CMS-First Content Architecture

**Rule:** All editor-managed content must be rendered via `lib.dynamicContent`, never hardcoded in TypoScript settings.

```html
<!-- ✅ GOOD — Editors can manage content in TYPO3 backend -->
<f:cObject typoscriptObjectPath="lib.dynamicContent" data="{colPos: 0}"/>

<!-- ❌ BAD — Content locked in TypoScript, editors can't change it -->
<p>{settings.footer.copyright}</p>
```

See [references/cms-first-content.md](references/cms-first-content.md) for the full `lib.dynamicContent` TypoScript definition, `colPos` conventions, frame class handling, and RTE customization.

## colPos Propagation

When content elements need different styling based on their column position (e.g., smaller headings in a sidebar), propagate `colPos` through the template chain:

```html
<!-- Content element templates automatically have access to data.colPos -->
<!-- Pass it explicitly to partials that need context-aware rendering: -->
<f:render partial="Components/Intro" arguments="{colPos: data.colPos, ...}"/>

<!-- Then in the partial, conditionally adjust styling: -->
<f:if condition="{colPos} == 1">
    <!-- Sidebar: smaller headings, narrower images -->
</f:if>
```

> **Lesson learned:** This pattern touches many files (layout → partial → atom). Plan for it early — missing a layer causes silent rendering issues where sidebar content renders with full-width styles.

See [references/colpos-propagation.md](references/colpos-propagation.md) for the complete annotated walkthrough.

## Accessibility Essentials (WCAG 2.1 AA)

Every TYPO3 site package must include these from day one:

1. **`lang` attribute** on `<html>` — dynamic via `{site.language.twoLetterIsoCode}`
2. **Skip-to-content link** — first element inside `<body>`, visually hidden until focused
3. **Semantic landmarks** — `<header>`, `<nav>`, `<main>`, `<footer>` in the page layout
4. **ARIA for interactive elements** — `aria-expanded`, `aria-controls`, `aria-label` on burger menu
5. **Focus indicators** — visible outline + ring on all interactive elements
6. **Heading hierarchy** — never skip levels; adjust sizes by context, not by tag

See [references/accessibility-patterns.md](references/accessibility-patterns.md) for implementation examples.

## Responsive Images

Use an `Atoms/Image` partial with `<picture>` + `<source>` for responsive, WebP-optimized images:

```html
<f:render partial="Atoms/Image" arguments="{
    image: files.0,
    width: '800',
    sources: {
        lg: {width: '1244', cropVariant: 'lg'},
        md: {width: '768', cropVariant: 'md'},
        sm: {width: '640', cropVariant: 'sm'},
        xs: {width: '400'}
    },
    loading: 'eager',
    class: 'w-full h-auto'
}"/>
```

**Key rules:**

- Use `loading="eager"` for hero / above-the-fold images (LCP performance)
- Use `loading="lazy"` (default) for everything else
- Adjust image widths based on `colPos` (sidebar images should be narrower)

See [references/responsive-image-pattern.md](references/responsive-image-pattern.md) for the full `Atoms/Image` implementation.

## JavaScript Patterns

- **One consolidated `main.js`** — avoid orphaned feature-specific JS files
- **Progressive enhancement** — navigation works without JS; JS adds toggle UX
- **ARIA state sync** — JS must keep `aria-expanded` in sync with visual state
- **`JS_` prefix convention** — use `JS_header-menu-button` class names for JS-targeted selectors (separates styling from behavior)
- **Load as ES module** — `<f:asset.script type="module" />`

See [references/javascript-patterns.md](references/javascript-patterns.md) for the debounce pattern, ARIA sync code, and viewport-aware reset.

## Localization — No Hardcoded Text

**Rule:** All static, user-facing text in Fluid templates must be stored in XLIFF language files and referenced with `<f:translate>`. Never write raw text strings directly inside templates.

Language files live in `Resources/Private/Language/` and are organized by domain (e.g. `messages.xlf`, `backend_previews.xlf`, `backend_fields.xlf`).

```html
<!-- ✅ GOOD — Text comes from the language file -->
<f:translate domain="my_site_package.messages" key="menu.categories" default="Categories"/>

<!-- ✅ GOOD — Inline syntax for attribute values -->
<nav aria-label="{f:translate(domain: 'my_site_package.messages', key: 'menu.main.label')}">

<!-- ❌ BAD — Hardcoded text, not translatable -->
<span>Categories</span>
<nav aria-label="Main navigation">
```

**Key rules:**

- Use the `domain` parameter to select the correct XLIFF file (e.g. `my_site_package.messages` → `messages.xlf`)
- Always provide a `default` value for new keys so the template degrades gracefully before the XLIFF is complete
- Use the **inline notation** `{f:translate(…)}` inside HTML attributes and the **tag notation** `<f:translate … />` for element content
- This applies to labels, ARIA attributes, button text, headings, placeholder text — any string a user could see or a screen reader could read

## Icons — SVG Files via `f:image`

**Rule:** Icons must always be stored as individual SVG files in `Resources/Public/Icons/` and included via the `<f:image>` ViewHelper. Never use inline SVG markup or HTML `<img>` tags for icons.

```
Resources/Public/Icons/
├── chevron.svg
├── close.svg
├── menu.svg
├── search.svg
├── social-facebook.svg
└── …
```

```html
<!-- ✅ GOOD — SVG icon via f:image with explicit dimensions -->
<f:image src="EXT:my_site_package/Resources/Public/Icons/menu.svg" class="icon icon--menu" width="24" height="24" alt="" />

<!-- ✅ GOOD — Dynamic icon name from a variable -->
<f:image src="EXT:my_site_package/Resources/Public/Icons/{icon}.svg" class="icon icon--{icon}" alt="" />

<!-- ❌ BAD — Inline SVG bloats the template and is hard to maintain -->
<svg xmlns="…" viewBox="…"><path d="…"/></svg>

<!-- ❌ BAD — Raw HTML img tag bypasses TYPO3's asset pipeline -->
<img src="/Icons/menu.svg" />
```

**Key rules:**

- Use the `EXT:` prefix to reference icons relative to the extension: `EXT:my_site_package/Resources/Public/Icons/icon-name.svg`
- Always set `width` and `height` to prevent layout shifts
- Set `alt=""` on decorative icons (most UI icons are decorative)
- Use the naming convention `icon icon--{name}` for CSS classes to keep styling consistent
- Organize flags separately in `Icons/Flags/` if needed

## ViewHelper-Only Links & Images

**Rule:** Links and images must **never** be written with raw HTML `<a>` or `<img>` tags. Always use the corresponding Fluid ViewHelper.

### Links

Use `<f:link.typolink>` (or `<f:link.page>`, `<f:link.external>`, etc.) so that TYPO3's link handling, `t3://` resolution, and workspace / language overlays all work correctly.

```html
<!-- ✅ GOOD — TYPO3-managed link -->
<f:link.typolink parameter="{item.link}" class="nav__link">
    {item.title}
</f:link.typolink>

<!-- ❌ BAD — Raw anchor tag, no TYPO3 link resolution -->
<a href="/some-page">Link text</a>
```

### Images

Use `<f:image>` (or `<f:media>`) so that TYPO3's FAL processing, cropping, and format conversion (e.g. WebP) are applied. **Never** use raw `<img>` tags.

For **non-decorative, content images** (hero banners, editorial photos, teaser images, etc.) always use the `Atoms/Image` partial (`Partials/Atoms/Image.fluid.html`) instead of a bare `<f:image>` tag. The partial provides responsive `<picture>` + `<source>` rendering with automatic WebP conversion, crop-variant support per breakpoint, and configurable loading strategy — all in one call:

```html
<!-- ✅ BEST — Content image via the Atoms/Image partial (responsive, WebP, crop variants) -->
<f:render partial="Atoms/Image" arguments="{
    image: files.0,
    width: '800',
    sources: {
        lg: {width: '1244', cropVariant: 'lg'},
        md: {width: '768', cropVariant: 'md'},
        sm: {width: '640', cropVariant: 'sm'},
        xs: {width: '400'}
    },
    loading: 'eager',
    class: 'w-full h-auto'
}"/>

<!-- ✅ OK — Simple content image without responsive sources -->
<f:render partial="Atoms/Image" arguments="{image: files.0, width: '800'}"/>

<!-- ✅ OK — Decorative SVG icon (no need for the partial) -->
<f:image src="EXT:my_site_package/Resources/Public/Icons/menu.svg" class="icon icon--menu" width="24" height="24" alt="" />

<!-- ❌ BAD — Raw img tag, no FAL processing -->
<img src="/fileadmin/user_upload/photo.jpg" alt="Photo" />
```

**When to use which:**

| Use Case | Approach |
|---|---|
| Content images (hero, teaser, editorial) | `Atoms/Image` partial — gets responsive sources + WebP |
| Decorative SVG icons | `<f:image>` directly (see Icons section above) |
| Thumbnails / simple single-size images | `Atoms/Image` partial (omit `sources` argument) |

### Videos

Embed videos using the `Atoms/Video` partial (`Partials/Atoms/Video.fluid.html`). It wraps `<f:media>` with automatic aspect-ratio preservation based on the file's native dimensions:

```html
<!-- ✅ GOOD — Video via the Atoms/Video partial -->
<f:render partial="Atoms/Video" arguments="{video: files.0}"/>

<!-- ❌ BAD — Raw HTML video tag, no FAL integration -->
<video src="/fileadmin/video.mp4"></video>
```

**Key rules:**

- `<f:link.typolink>` handles all link types (pages, files, external URLs, mail) through a single parameter
- For content images, prefer the `Atoms/Image` partial over a bare `<f:image>` — it gives you responsive breakpoints, WebP conversion, and crop handling out of the box
- For SVG icons, `<f:image>` directly is the correct approach (see Icons section above)
- For videos, use the `Atoms/Video` partial — it uses `<f:media>` and preserves aspect ratio automatically
- This rule applies everywhere — page layouts, partials, content element templates, and atoms

## Anti-Patterns

| Anti-Pattern | Why It's Bad | Correct Approach |
|---|---|---|
| Hardcoded footer/nav content in TypoScript | Editors can't change it — defeats CMS purpose | `lib.dynamicContent` with `colPos` |
| Multiple orphaned JS files | Dead code, duplication, maintenance burden | Single consolidated `main.js` |
| Dynamic Tailwind class construction | CSS scanner won't find `bg-{var}-100` | Use complete class names with conditionals |
| Missing `f:argument` declarations | No type safety, unclear API | Always declare arguments in reusable partials |
| Skipping `colPos` in a partial layer | Sidebar content renders with full-width styles | Pass `colPos` through every layer that needs it |
| Guessing spacing values | Pixel mismatches accumulate | Extract from design specs or baseline screenshots |
| Hardcoded text in templates | Not translatable, breaks i18n | `<f:translate>` with XLIFF language files |
| Inline SVG markup in templates | Bloated templates, hard to maintain | SVG files in `Resources/Public/Icons/` via `<f:image>` |
| Raw `<a>` / `<img>` HTML tags | Bypasses TYPO3 link handling and FAL processing | `<f:link.typolink>` and `<f:image>` ViewHelpers |
