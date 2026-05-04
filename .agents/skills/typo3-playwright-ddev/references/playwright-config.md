# Playwright Configuration for DDEV + TYPO3

## Complete Annotated Config

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    // Test directory relative to config file
    testDir: './Tests',

    // Run test files in parallel for speed
    fullyParallel: true,

    // Prevent accidental test.only() in CI
    forbidOnly: !!process.env.CI,

    // Retry failed tests in CI (flaky test recovery)
    retries: process.env.CI ? 2 : 0,

    // Single worker in CI for stability; unlimited locally
    workers: process.env.CI ? 1 : undefined,

    // HTML reporter for detailed results
    reporter: 'html',

    use: {
        // DDEV site URL — update per project
        baseURL: 'https://<project-name>.ddev.site',

        // REQUIRED: DDEV uses self-signed SSL certificates
        ignoreHTTPSErrors: true,

        // Collect traces only on retry to save resources
        trace: 'on-first-retry',
    },

    projects: [
        // Desktop browsers
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },

        // Mobile viewports
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
        },
        {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 12'] },
        },
    ],
});
```

## Package.json Scripts

```json
{
  "scripts": {
    "test": "playwright test",
    "test:visual": "playwright test",
    "test:visual:update": "playwright test --update-snapshots"
  },
  "devDependencies": {
    "@axe-core/playwright": "^4.11.1",
    "@playwright/test": "^1.58.2",
    "playwright": "^1.58.2"
  }
}
```

## Running Tests — Always Via DDEV

Using the command provided by the `ddev-playwright` add-on:

```bash
# Run all tests
ddev playwright test

# Run visual tests only
ddev npm run test:visual

# Update VRT baselines
ddev npm run test:visual:update
# You can also use: ddev playwright test --update-snapshots

# Run specific test file
ddev playwright test Tests/Visual/startpage.spec.ts

# Run specific browser only
ddev playwright test --project=chromium

# Open HTML report
ddev playwright show-report
```

## Project Filtering

Run tests against a subset of browsers:

```bash
# Desktop only
ddev playwright test --project=chromium --project=firefox --project=webkit

# Mobile only
ddev playwright test --project="Mobile Chrome" --project="Mobile Safari"
```

## CI Configuration Notes

- Set `CI=true` environment variable to activate CI-specific settings
- `forbidOnly: !!process.env.CI` — Prevents `test.only()` in CI
- `retries: 2` in CI for flaky test resilience
- `workers: 1` in CI for deterministic ordering
- Consider adding `--reporter=junit` for CI integration
