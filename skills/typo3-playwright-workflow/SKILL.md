---
name: typo3-playwright-workflow
description: Run the day-to-day Playwright verification workflow for TYPO3 frontend changes in DDEV. Use when testing Fluid, CSS, and UI changes, capturing screenshots, running @stitch-vrt checks, debugging visual diffs, or verifying mounted content element and plugin pages.
---

# TYPO3 Playwright Workflow

## Overview

Use this skill after frontend implementation work is in place and you need to verify the rendered TYPO3 output.

This skill is for the **daily execution loop**, not initial infrastructure setup. If Playwright is not installed yet, browsers are missing, or the DDEV test environment is broken, use `typo3-playwright-ddev` instead.

## Default Verification Loop

For frontend-visible changes, use this sequence:

```bash
ddev exec "cd packages/[theme-name] && npm run build"
ddev typo3 cache:flush
ddev exec "cd packages/[theme-name] && npx playwright test Tests/e2e/<file>.spec.ts --grep @stitch-vrt"
```

Run this loop before considering the task complete.

## Mounted URL Rule

TYPO3 frontend verification depends on the real mounted page URL.

- If the content element or plugin is editor-mounted, ask for the actual URL before final verification.
- Do not guess plugin URLs.
- If the page is not mounted yet, implementation may continue, but verification must pause until the URL is known.

Recommended environment variable names:

- `HOMEPAGE_TEST_URL`
- `QUICK_MENU_TEST_URL`
- `NEWS_DETAIL_TEST_URL`
- `NEWS_SEARCH_RESULTS_TEST_URL`

## Section-Level VRT Pattern

Prefer locator-based screenshots for content elements and homepage sections.

- Add a stable ID in the markup, for example:
  - `#foc-homepage-hero`
  - `#foc-quick-menu`
  - `#foc-popular-outlets`
- Assert visibility first.
- Then use `locator.toHaveScreenshot(...)` with the Stitch baseline.

Example:

```ts
const section = page.locator('#foc-quick-menu').first();
await expect(section).toBeVisible();
await expect(section).toHaveScreenshot('quick-menu-01-homepage.png', {
  maxDiffPixelRatio: 0.05,
});
```

## Artifact-First Review

In agent environments, generated artifacts are more reliable than attempting live browser inspection.

Review failures in this order:

1. Screenshot diff or actual screenshot
2. Playwright HTML report
3. Trace file
4. Captured page HTML or curl output if routing/cHash is suspicious

## Host And Routing Checks

If Playwright cannot find the expected UI:

- Verify the mounted URL is correct.
- Confirm TYPO3 is not returning a 404 or fallback error page.
- Be careful with internal container hostnames like `https://web/...`; TYPO3 site resolution may differ from the public DDEV hostname.
- When checking HTML inside DDEV, preserve the correct host context.

## Required Test Coverage

For new or materially changed frontend UI, prefer:

- one functional smoke test that proves the section renders on the expected URL
- one `@stitch-vrt` visual test for the affected page area or content element
- one additional mobile or alternate viewport check if the layout meaningfully changes across breakpoints

If an existing spec already covers the exact area, extend it instead of duplicating coverage.

## Fast Commands

Use these commands for rapid iteration:

```bash
ddev exec "cd packages/[theme-name] && npx playwright test Tests/e2e/<file>.spec.ts --project=chromium --grep @stitch-vrt"
ddev exec "cd packages/[theme-name] && npx playwright test Tests/e2e/<file>.spec.ts --project=firefox --grep @stitch-vrt"
ddev exec "cd packages/[theme-name] && npx playwright test Tests/e2e/<file>.spec.ts --project=chromium"
ddev exec "cd packages/[theme-name] && npx playwright test Tests/e2e/<file>.spec.ts --update-snapshots --project=chromium"
```

Update snapshots only after reviewing and accepting the visual change.

## Load References As Needed

- VRT patterns and commands: [references/vrt-patterns.md](references/vrt-patterns.md)
