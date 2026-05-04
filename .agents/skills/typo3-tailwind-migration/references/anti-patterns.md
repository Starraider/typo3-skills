# Anti-Patterns & Lessons Learned

Consolidated from epics of a real TYPO3 CSS → Tailwind migration. Each item caused measurable rework.

## 🔴 Critical — Will Cause Major Rework

### 1. Deferring Test Environment Setup

**Problem:** Playwright + DDEV setup was left until the final epic. DDEV Linux container uses different browser binaries than macOS, causing unexpected delays and debugging under deadline pressure.

**Rule:** Set up Playwright inside DDEV in Phase 0. Run `ddev npx playwright install --with-deps` immediately. Verify tests execute correctly before writing any migration code.

### 2. Ignoring VRT Baselines

**Problem:** Baselines were captured in Epic 1 but never compared against during Epic 2. Instead, *new* snapshots were generated, completely missing the point of having a baseline.

**Rule:** After every component migration, run `ddev npm run test:visual` to compare against original baselines. Never run `--update-snapshots` unless the diff is understood and justified.

### 3. Hardcoding CMS Content

**Problem:** Footer content was implemented via TypoScript settings instead of TYPO3's content APIs (`lib.dynamicContent`, Menu Processor). This defeated the CMS purpose — editors couldn't modify footer content.

**Rule:** All content visible to editors MUST use TYPO3's dynamic content mechanisms. Use `lib.dynamicContent` with the appropriate `colPos` for footer, sidebar, and any editor-managed areas.

### 4. Missing Test Files

**Problem:** Snapshot directories existed in the repo, but the corresponding `.spec.ts` files were missing. Tests appeared to pass because they simply weren't running.

**Rule:** Code reviews MUST verify that every snapshot folder has a corresponding `.spec.ts` file. Add a "Test File Verification" quality gate to every review.

## 🟡 Significant — Causes Wasted Hours

### 5. Guessing Spacing Values

**Problem:** Developers used general Tailwind spacing utilities without cross-referencing the exact pixel values from screenshots/UX specs. The project lead had to manually identify and correct every margin/padding discrepancy.

**Rule:** Extract spacing values from baseline screenshots or UX documentation. Use 1:1 overlay comparison before marking any component "done". Named spacing tokens (`p-m`, `gap-l`) should map to the exact values from the design.

### 6. Breakpoint Inconsistency

**Problem:** Navigation JavaScript used `xl` (1280px) breakpoint while CSS used `md` (768px), causing the burger menu to behave incorrectly between 768-1280px.

**Rule:** Define breakpoints once in the design token configuration and reference the same values in both CSS (`md:flex`) and JavaScript (`window.matchMedia`). The navigation switch point is typically `md` (768px).

### 7. Global CSS Changes for Local Fixes

**Problem:** Modifying global CSS to fix a specific visual regression broke other pages.

**Rule:** Use component-specific CSS overrides when fixing regressions. Never modify global styles to solve a single component issue without verifying all pages first.

### 8. Dynamic Tailwind Classes

**Problem:** Constructing class names via string concatenation (`bg-${color}-100`) causes Tailwind's scanner to miss the classes, and they get purged from the output.

**Rule:** Always use complete, literal class names in templates. If dynamic classes are absolutely necessary, safelist them in the CSS configuration.

## 🟢 Process — Prevents Friction

### 9. Single Consolidated JavaScript File

**Problem:** Initially created a separate `navigation.js` file for the burger menu, but it duplicated logic already in `main.js`, creating dead code and maintenance burden.

**Rule:** Keep all client-side JavaScript in a single `main.js` unless the project explicitly requires code splitting. Avoid creating separate files for small interactive features.

### 10. Not Running Cross-Browser Tests Per Story

**Problem:** Cross-browser testing was deferred to the final story. Issues discovered at the end required backtracking through already-completed components.

**Rule:** Run a cross-browser smoke test suite after every story completion. Catch rendering differences early when the context is fresh.

### 11. PRD URLs Not Extracted

**Problem:** Test scenarios used guessed URLs instead of the actual URLs defined in the PRD, leading to 404 errors and wasted debugging time.

**Rule:** Before writing any test case, extract the exact test URLs, credentials, and content scenarios from the PRD or project brief. When in doubt, ask the developer. Never assume URL paths.

### 12. `colPos` Propagation Complexity

**Problem:** Passing `colPos` context from page layouts through multiple partial layers to the deepest atom required touching many files. Missing a single layer caused silent rendering issues.

**Rule:** When implementing sidebar-aware styling, plan the propagation path early (Layout → Section → Partial → Atom) and test at each level before moving to the next.
