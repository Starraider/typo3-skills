---
name: tailwind-v4-workflow
description: Tailwind CSS v4 PostCSS build workflow, @theme token configuration, @source directives, CSS partial organization, and compilation steps for a TYPO3/DDEV project. Use this skill whenever modifying any CSS file under Resources/Private/Assets/Css/, adding or changing Tailwind utility classes in Fluid templates, adding new design tokens or colors, troubleshooting missing or broken CSS styles, or creating new CSS partials. Also use when build output appears stale or classes are missing from compiled output.
---

# Tailwind CSS v4 Workflow

## ⚠️ The Golden Rule

**Every CSS modification requires a build step.** Tailwind v4 uses PostCSS compilation — editing `.css` source files alone does NOT update the browser output. After any CSS change, run:

```bash
ddev npm run build --prefix packages/my-site-package
```

Forgetting this step is the #1 agent failure in this project. The compiled output lives at `Resources/Public/Css/main.css` — this is what TYPO3 serves to the browser.

## Quick Reference

| Action | Command |
|--------|---------|
| **Build once** | `ddev npm run build --prefix packages/my-site-package` |
| **Watch mode** | `ddev npm run dev --prefix packages/my-site-package` |
| **Verify token** | `grep '<token-name>' packages/my-site-package/Resources/Public/Css/main.css` |

> See [references/build-commands.md](references/build-commands.md) for detailed command reference and error interpretation.

## CSS Architecture

### Entry Point

`packages/my-site-package/Resources/Private/Assets/Css/main.css`

Structure (order matters):

```
1. @import url(Google Fonts)
2. @import "tailwindcss"       ← Tailwind v4 syntax (NOT @tailwind directives)
3. @source directives          ← Tell Tailwind which files to scan for classes
4. @import CSS partials        ← Component-level styles
5. @theme { }                  ← Design tokens
6. Global base styles          ← body, h1-h4, etc. using @apply
7. Component CSS               ← .rte-content, .header, etc.
8. @import footer partial      ← Footer MUST be last (overrides global headings)
```

### @source — Content Scanning

Tailwind v4 auto-detects content files but TYPO3's folder structure is non-standard. These `@source` directives are **mandatory**:

```css
@source "../../**/*.html";   /* Fluid templates, partials, layouts */
@source "../../**/*.js";     /* JS files with Tailwind classes */
@source "../../**/*.ts";     /* TypeScript files */
@source "../../../Classes/**/*.php";  /* ViewHelpers with class attributes */
```

Without explicit `@source`, Tailwind purges utility classes used in Fluid templates from the output.

### CSS Partials

Partials live in `Resources/Private/Assets/Css/Partials/` with `_` prefix:

| File | Purpose |
|------|---------|
| `_icon.css` | Icon sizing utilities |
| `_button.css` | Button variants and states |
| `_linklist.css` | Link list styling |
| `_component.css` | Generic component wrapper |
| `_lang-menu.css` | Language switcher |
| `_footer.css` | Footer — **must be imported last** |

### Creating a New Partial

1. Create `Resources/Private/Assets/Css/Partials/_name.css`
2. Add `@import "./Partials/_name.css";` to `main.css`
3. Place it **before** the `_footer.css` import (footer must remain last)
4. Run `ddev npm run build --prefix packages/my-site-package`
5. Verify import order didn't break existing styles

## Design Tokens (@theme)

All design tokens live in the `@theme {}` block of `main.css`. Tailwind v4 uses CSS-first configuration — there is no `tailwind.config.js`.

### Current Tokens

```css
@theme {
    --color-primary: #336699;
    --color-text-main: #101418;
    --color-text-muted: #5c738a;
    --color-card-light: #ffffff;
    --color-background-light: #f6f7f8;
    --color-success: #378200;
    --color-error: #D70000;
    --color-neutral-0: #FFFFFF;
    --font-sans: "Inter", sans-serif;
    --spacing-xs/s/m/l/xl: 4/8/16/24/64px;
    --radius-s/m/l/xl: 4/8/16/24px;
    --breakpoint-sm/md/lg/xl: 640/768/1024/1280px;
}
```

### Adding a New Token

1. Add the variable to the `@theme {}` block in `main.css`
2. Use consistent naming: `--color-<name>`, `--spacing-<name>`, `--radius-<name>`
3. Run `ddev npm run build --prefix packages/my-site-package`
4. Verify: `grep '<variable-name>' packages/my-site-package/Resources/Public/Css/main.css`

### Critical: Variables MUST Be in @theme

External CSS variables (from imported files or separate stylesheets) are **not** available to Tailwind's utility generator. If `bg-[--color-foo]` doesn't work, the variable must be inside `@theme {}`.

```css
/* ❌ WRONG — variable in external file, invisible to Tailwind */
:root { --color-foo: #abc; }

/* ✅ CORRECT — variable in @theme, Tailwind generates utilities */
@theme { --color-foo: #abc; }
```

## Using Tailwind in Fluid Templates

### Safe Patterns

```html
<!-- Static classes — always safe -->
<div class="bg-primary p-m rounded-s text-neutral-0">

<!-- Responsive prefixes — always safe -->
<div class="block md:hidden">

<!-- Tailwind's ! modifier to override global CSS -->
<h2 class="!text-2xl !font-bold !leading-[1.15]">
```

### Dangerous Patterns

```html
<!-- ❌ Dynamic class concatenation — PURGED from output -->
<div class="bg-{color}-100">

<!-- ❌ Complex Fluid conditional classes — parser may miss them -->
<div class="{f:if(condition: '{open}', then: 'bg-success', else: 'bg-error')}">

<!-- ✅ Use complete literal class names instead -->
<f:if condition="{open}">
    <f:then><div class="bg-success"></f:then>
    <f:else><div class="bg-error"></f:else>
</f:if>
```

### Global vs Component Typography

Global styles (`h1`-`h4` in `main.css`) use `@apply` with `clamp()` for fluid sizing. These **will conflict** with Tailwind utility classes at the component level.

**Rule:** Never replace semantic HTML tags (`<h1>`, `<h2>`) with `<div>` to avoid conflicts. Use Tailwind's `!` modifier to override global styles at the component level.

## Build Verification Checklist

Run after **every** CSS modification:

1. `ddev npm run build --prefix packages/my-site-package` completes without errors
2. `Resources/Public/Css/main.css` timestamp is updated
3. New/changed classes appear in the compiled output
4. Browser shows the expected visual result (hard-refresh with `Cmd+Shift+R`)

> See [references/troubleshooting.md](references/troubleshooting.md) for symptom → cause → fix lookup when things go wrong.

## PostCSS Configuration

`packages/my-site-package/postcss.config.js`:

```javascript
export default {
    plugins: {
      "@tailwindcss/postcss": {},
      cssnano: {},
    },
};
```

- `@tailwindcss/postcss` — Tailwind v4's PostCSS plugin (replaces the old `tailwindcss` plugin)
- `cssnano` — CSS minification for production
- `package.json` has `"type": "module"` — required for ESM `export default` syntax
