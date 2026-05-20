# Playwright VRT Patterns

## Screenshot Commands

```bash
# Run VRT for specific spec
ddev exec "cd packages/[theme-name] && npx playwright test Tests/e2e/<file>.spec.ts --grep @stitch-vrt"

# Update snapshots
ddev exec "cd packages/[theme-name] && npx playwright test Tests/e2e/<file>.spec.ts --update-snapshots"

# Single project
ddev exec "cd packages/[theme-name] && npx playwright test Tests/e2e/<file>.spec.ts --project=chromium"
```

## Section-Level VRT Pattern

```ts
const section = page.locator('#foc-quick-menu').first();
await expect(section).toBeVisible();
await expect(section).toHaveScreenshot('quick-menu-01-homepage.png', {
  maxDiffPixelRatio: 0.05,
});
```

## Common Test URLs

- `HOMEPAGE_TEST_URL`
- `QUICK_MENU_TEST_URL`
- `NEWS_DETAIL_TEST_URL`
- `NEWS_SEARCH_RESULTS_TEST_URL`

## Recommended Baseline IDs

- `#foc-homepage-hero`
- `#foc-quick-menu`
- `#foc-popular-outlets`
