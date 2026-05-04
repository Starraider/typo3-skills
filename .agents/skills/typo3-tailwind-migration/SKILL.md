---
name: typo3-tailwind-migration
description: Migrate a TYPO3 theme from legacy/custom CSS to Tailwind CSS v4 in a DDEV environment. Use this skill when a TYPO3 project needs to convert its existing CSS-based site package to Tailwind utility classes while maintaining 1:1 visual parity. Covers the complete workflow from visual regression baseline capture through build pipeline setup, design token mapping, Fluid template migration, content element conversion, accessibility auditing, and cross-browser verification. Critical emphasis on regression-test-first approach — always capture baselines before any migration work begins.
---

# TYPO3 Tailwind CSS Migration

Migrate an existing TYPO3 site package from legacy/custom CSS to Tailwind CSS v4 within a DDEV development environment. This skill encapsulates battle-tested learnings from a complete migration project.

> **Most important lesson:** Set up VRT baselines and the test environment in the **first sprint**, not the last. Capture the legacy site's appearance before touching any CSS. Every migration decision is verified against these baselines.

## Migration Workflow

Follow these 6 phases in strict order:

### Phase 0: Pre-Flight — VRT Baseline & Test Environment

**⚠️ MANDATORY FIRST STEP. Do NOT skip or defer this.**

1. Set up Playwright inside the TYPO3 site package (see the companion skill `typo3-playwright-ddev` for detailed DDEV setup)
2. Create visual regression tests for **every page layout** and **every content element** in the legacy site
3. Run `ddev exec "cd packages/[theme-name] && npx playwright test --update-snapshots"` to generate baseline screenshots
4. Commit the baselines — these are the "source of truth" for the entire migration

**Test file checklist:**

- One `.spec.ts` per page layout (e.g., Default, Homepage, Sidebar — whatever your project defines)
- One `.spec.ts` for all content elements on a dedicated test page
- Verify every `.spec.ts` file is committed (Epic 1 lesson: missing test files = silent coverage gaps)

> See [references/migration-checklist.md](references/migration-checklist.md) for the complete pre-flight checklist.

### Phase 1: Foundation — Build Pipeline & Design Tokens

1. Install Tailwind CSS v4 dependencies:

   ```bash
   ddev npm install --save-dev tailwindcss postcss @tailwindcss/postcss postcss-cli cssnano
   ```

2. Create the build pipeline — see [references/build-pipeline.md](references/build-pipeline.md) for:
   - `postcss.config.js` setup
   - CSS entry point with `@import "tailwindcss"` (v4 syntax)
   - Content scanning paths for TYPO3 Fluid templates
   - npm scripts for dev/build

3. Map existing design tokens to Tailwind `@theme` block — see [references/design-tokens.md](references/design-tokens.md) for:
   - Color palette mapping
   - Typography (fonts, weights)
   - Spacing scale
   - Border radius
   - Breakpoints

4. Verify integration in a Fluid template:
   - Add a test class like `bg-primary-100` to any element
   - Run `ddev npm run build`
   - Confirm the class renders correctly in the browser

### Phase 2: Layouts & Global Partials

Migrate page layouts and global components in this order:

1. **Page Layouts** (migrate each layout defined in your site package, one at a time)
   - Replace legacy CSS classes with Tailwind utilities
   - Use `f:asset.css` to load the compiled `main.css`
   - Verify against Phase 0 baselines after each layout

2. **Header & Navigation**
   - Sticky header: `sticky top-0 z-50`
   - Mobile-first: base styles for mobile, `md:` prefix for desktop
   - Burger menu: semantic `<button>` with `aria-expanded`, `aria-controls`, `aria-label`
   - JavaScript toggle in a single consolidated `main.js` (avoid dead code in separate files)

3. **Footer**
   - **CMS-first**: Use `lib.dynamicContent` or Menu Processor — NOT TypoScript settings
   - Responsive stacking: vertical on mobile, horizontal on desktop

> See [references/fluid-integration.md](references/fluid-integration.md) for TYPO3-specific Fluid + Tailwind patterns.

### Phase 3: Content Elements

Migrate each content element type:

1. **Text** — typography (H1-H6, p, lists), heading hierarchy
2. **Image** — responsive sizing, `alt` text, `loading="eager"` for hero/LCP images
3. **Text + Image (Textpic)** — grid layout with orientation fallbacks (above/below/left/right), mobile stacking
4. **Hero** — diagonal split via `clip-path`, CTA button styling, mobile legibility
5. **Secondary/Sidebar content** — if your project has multi-column layouts, pass `colPos` from page layout through all partial layers to enable context-aware styling (smaller headings, adjusted image sizes)

**After each content element:**

- Run `ddev exec "cd packages/[theme-name] && npx playwright test --grep @stitch-vrt"` to compare against Phase 0 baselines
- Extract margins/paddings from baseline screenshots — do NOT guess spacing values
- Fix any diffs before proceeding to the next element

> See [references/migration-checklist.md](references/migration-checklist.md) for the element-by-element checklist.

### Phase 4: Quality Assurance

1. **Visual Regression Verification**
   - Run full VRT suite: `ddev exec "cd packages/[theme-name] && npx playwright test --grep @stitch-vrt"`
   - Target: 0 deviations from Phase 0 baselines
   - Document and justify any intentional changes

2. **Accessibility Audit**
   - Integrate `@axe-core/playwright` into the test suite
   - Verify WCAG 2.1 AA compliance across all layouts
   - Verify all theme variants (if applicable) for color contrast
   - Check: Skip-to-content link, `lang` attribute on `<html>`, focus indicators

3. **Cross-Browser Testing**
   - Functional tests in Chromium, Firefox, WebKit
   - Console error monitoring (filter DDEV benign patterns)
   - Run cross-browser smoke tests after every story, not just at project end

4. **Performance**
   - CSS bundle < 100KB compressed (Tailwind purge does most of the work)
   - Verify `loading="eager"` on LCP images
   - Optimize in the build pipeline, not in CMS runtime logic

### Phase 5: Cleanup

1. Remove legacy CSS files (keep backups until fully verified)
2. Run `ddev npm run build` — verify final `main.css` contains only used utilities
3. Run full test suite one final time
4. Update project documentation

## Anti-Patterns & Critical Gotchas

For the complete list of pitfalls discovered during the original migration, see [references/anti-patterns.md](references/anti-patterns.md). The top 5:

1. **Never blindly `--update-snapshots`** — every VRT diff must be understood and justified
2. **Never defer test environment setup** — set up Playwright+DDEV in Phase 0, not Phase 4
3. **Never hardcode CMS content** — Footer, navigation, and dynamic sections must use TYPO3's content APIs
4. **Never guess spacing** — extract margins/paddings from baseline screenshots or UX specs
5. **Never install Playwright on host** — always use `ddev exec "npx playwright install"` (Linux container ≠ macOS)

## Quality Gates

| Gate                   | When                    | Rule                                                                         |
| ---------------------- | ----------------------- | ---------------------------------------------------------------------------- |
| Test file verification | Every code review | Every `.spec.ts` must be committed; snapshots must have matching spec files |
| VRT comparison | After every component | Compare against Phase 0 baselines, not newly generated snapshots |
| A11y audit | After layout completion | Run axe-core across all viewports and theme variants |
| Cross-browser smoke | After every story | Don't wait until the final epic |
| Spacing verification | Before marking "done" | Compare pixel-level spacing against baseline screenshots |
