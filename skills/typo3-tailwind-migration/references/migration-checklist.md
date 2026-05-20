# Migration Checklist

Use this checklist to track progress through each phase. Mark items as you complete them.

## Phase 0: Pre-Flight

- [ ] DDEV environment running with legacy site fully functional
- [ ] Playwright installed inside DDEV container (`ddev npx playwright install --with-deps`)
- [ ] `playwright.config.ts` created with:
  - [ ] `baseURL` pointing to DDEV site URL
  - [ ] `ignoreHTTPSErrors: true`
  - [ ] Multiple viewports (desktop 1280px, mobile 375px, tablet 768px)
  - [ ] Chromium, Firefox, WebKit projects
- [ ] VRT test files created:
  - [ ] One `.spec.ts` per page layout
  - [ ] One `.spec.ts` for content elements (dedicated test page)
  - [ ] Header/Navigation `.spec.ts`
  - [ ] Footer `.spec.ts`
- [ ] Baseline screenshots generated: `ddev npm run test:visual:update`
- [ ] All `.spec.ts` files AND snapshot directories committed to repository
- [ ] Verified: every snapshot folder has a corresponding `.spec.ts` file

## Phase 1: Foundation

- [ ] Tailwind v4 dependencies installed
- [ ] `postcss.config.js` created with `@tailwindcss/postcss` and `cssnano`
- [ ] `Resources/Private/Assets/Css/main.css` created with:
  - [ ] `@import "tailwindcss"`
  - [ ] `@source "../../**/*.html"` for Fluid template scanning
  - [ ] `@theme {}` block with all design tokens
- [ ] npm scripts: `dev`, `build`, `test`, `test:visual`, `test:visual:update`
- [ ] `ddev npm run build` produces `Resources/Public/Css/main.css`
- [ ] Token verification: test class renders correctly in a Fluid template
- [ ] `f:asset.css` loading confirmed in page layout

## Phase 2: Layouts & Global Partials

### Page Layouts

Add one item per layout defined in your site package (e.g., Default, Homepage, Sidebar, Landing, etc.):

- [ ] Layout "____" migrated to Tailwind
- [ ] Layout "____" migrated to Tailwind
- [ ] _(add more as needed — include `colPos` propagation for multi-column layouts)_
- [ ] VRT comparison passed for all layouts

### Header & Navigation

- [ ] Sticky header (`sticky top-0 z-50`)
- [ ] Desktop navigation (visible at `md:` breakpoint)
- [ ] Mobile burger menu (hidden at `md:`)
- [ ] Burger button: semantic `<button>` with ARIA attributes
- [ ] JavaScript toggle in consolidated `main.js`
- [ ] Keyboard navigation (Tab/Enter/Space)
- [ ] Focus indicators on all interactive elements
- [ ] VRT comparison passed (desktop + mobile burger states)

### Footer

- [ ] Uses `lib.dynamicContent` or Menu Processor (NOT TypoScript settings)
- [ ] Responsive: stacks vertically on mobile, horizontal on desktop
- [ ] Keyboard accessible links
- [ ] VRT comparison passed

### Accessibility Foundations

- [ ] `<html lang="...">` attribute set dynamically
- [ ] Skip-to-content link (visible on focus)
- [ ] Semantic HTML: `<header>`, `<nav>`, `<main>`, `<footer>`

## Phase 3: Content Elements

For each element type, complete ALL items before moving to the next. Add sections for your project's specific content elements. Common examples:

### Per Content Element (repeat for each)

- [ ] Element "____" migrated to Tailwind
- [ ] Spacing extracted from baseline (not guessed)
- [ ] Responsive behavior verified (mobile stacking, etc.)
- [ ] VRT comparison passed

### Typical Elements to Cover

- **Text** — H1-H6 heading hierarchy, paragraph styling, list styling (ul/ol)
- **Image** — responsive sizing, `alt` text, `loading="lazy"` / `"eager"`
- **Text + Image (Textpic)** — grid layout for all orientations, mobile stacking
- **Hero / Banner** — visual effects, CTA button, `loading="eager"` on hero image (LCP)
- **Teaser / Card** — content preview components
- **Gallery** — lightbox, grid/slider layouts
- **Accordion / Tabs** — interactive elements with ARIA
- _(add your project's custom elements here)_

### Secondary/Sidebar Content (if applicable)

- [ ] `colPos` propagated through all template layers
- [ ] Heading sizes adjusted for sidebar context
- [ ] Image sizes adjusted for narrower column
- [ ] VRT comparison passed

## Phase 4: Quality Assurance

### Visual Regression

- [ ] Full VRT suite: 0 deviations from Phase 0 baselines
- [ ] All intentional changes documented

### Accessibility

- [ ] `@axe-core/playwright` integrated
- [ ] axe-core tests pass on all page layouts
- [ ] Theme variant testing (all color schemes verified)
- [ ] Color contrast ≥ 4.5:1 for all text
- [ ] Focus indicators visible on all interactive elements
- [ ] Keyboard-only navigation test passed

### Cross-Browser

- [ ] Functional tests pass: Chromium, Firefox, WebKit
- [ ] Console error audit (with DDEV benign-pattern filtering)
- [ ] Mobile viewport tests pass

### Performance

- [ ] CSS bundle < 100KB compressed
- [ ] LCP images use `loading="eager"`
- [ ] No layout shift after initial paint

## Phase 5: Cleanup

- [ ] Legacy CSS files removed (after full verification)
- [ ] Final `ddev npm run build` — only used utilities in output
- [ ] Full test suite green
- [ ] Documentation updated
