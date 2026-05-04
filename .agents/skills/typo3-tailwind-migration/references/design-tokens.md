# Design Token Mapping: Legacy CSS → Tailwind v4

## Strategy

Tailwind v4 uses CSS-first configuration via `@theme {}` blocks inside the main CSS entry point. Map every legacy CSS variable to a Tailwind token so developers use semantic utility classes (e.g., `bg-primary-100`, `p-m`) instead of arbitrary values.

## Color Palette

Map legacy color variables to Tailwind color tokens:

```css
@theme {
  --color-primary-100: #B45023;    /* Main brand — warm rust */
  --color-primary-75: #DD997C;     /* Soft brand accent */
  --color-neutral-0: #FFFFFF;      /* White */
  --color-neutral-10: #FBF2EE;     /* Off-white / cream */
  --color-neutral-80: #49362D;     /* Dark brown */
  --color-neutral-90: #220B01;     /* Near-black */
}
```

Usage in templates: `bg-primary-100`, `text-neutral-0`, `border-neutral-80`

### Multiple Theme Variants

If the project supports multiple color themes (e.g., Ocean Breeze, Forest Mist, Violet Velvet), define each variant as a CSS class or `data-theme` attribute with overriding custom properties:

```css
[data-theme="ocean-breeze"] {
  --color-primary-100: #1A73B5;
  --color-primary-75: #7CB5DD;
  /* ... */
}
```

> **Accessibility:** Verify color contrast (4.5:1 minimum for normal text) for **every** theme variant, not just the default.

## Typography

```css
@theme {
  --font-headline: "Playfair Display", serif;
  --font-body: "Open Sans", sans-serif;
}
```

Import fonts before the `@theme` block:

```css
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500&family=Playfair+Display:wght@500&display=swap');
```

Usage: `font-headline`, `font-body`

## Spacing Scale

Map the project's named spacing scale. Avoid relying solely on Tailwind's default numeric scale — a named scale prevents arbitrary values:

```css
@theme {
  --spacing-xs: 0.25rem;  /* 4px */
  --spacing-s: 0.5rem;    /* 8px */
  --spacing-m: 1rem;      /* 16px */
  --spacing-l: 1.5rem;    /* 24px */
  --spacing-xl: 4rem;     /* 64px */
}
```

Usage: `p-m` → `padding: 1rem`, `gap-l` → `gap: 1.5rem`, `mt-xl` → `margin-top: 4rem`

> **Critical lesson:** Always derive spacing values from baseline screenshots or UX specs. Never guess paddings/margins — this was the single largest source of correction during the original migration.

## Border Radius

```css
@theme {
  --radius-s: 0.5rem;   /* 8px */
  --radius-m: 1rem;     /* 16px */
  --radius-l: 1.5rem;   /* 24px */
}
```

Usage: `rounded-s`, `rounded-m`, `rounded-l`

## Breakpoints

Ensure breakpoints match the existing design system:

```css
@theme {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}
```

> **Lesson learned:** The `md` (768px) breakpoint is typically the critical navigation switch point (desktop nav vs. burger menu). Align all responsive JavaScript logic with the same breakpoint value.

## Verification

After configuring tokens, run this checklist:

1. `ddev npm run build` succeeds
2. Open `Resources/Public/Css/main.css` and verify:
   - `--color-primary-100` appears with correct hex value
   - `--font-headline` appears with correct font stack
   - `--spacing-m` appears with `1rem`
3. Add `<div class="bg-primary-100 p-m rounded-s text-neutral-0">Test</div>` to any Fluid template
4. Rebuild and verify the element renders correctly in the browser
