import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for TYPO3 in DDEV environment
 * See https://playwright.dev/docs/test-configuration
 *
 * SETUP:
 * 1. Update baseURL to match your DDEV project URL
 * 2. Run: ddev get Lullabot/ddev-playwright && ddev restart
 * 3. Run: ddev playwright test
 */
export default defineConfig({
    testDir: './Tests',

    /* Run tests in files in parallel */
    fullyParallel: true,

    /* Fail the build on CI if you accidentally left test.only in the source code */
    forbidOnly: !!process.env.CI,

    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,

    /* Single worker in CI for deterministic ordering */
    workers: process.env.CI ? 1 : undefined,

    /* HTML reporter for detailed results */
    reporter: 'html',

    use: {
        /* ⚠️ UPDATE THIS: DDEV site URL for your project */
        baseURL: 'https://your-project.ddev.site',

        /* REQUIRED: DDEV uses self-signed SSL certificates */
        ignoreHTTPSErrors: true,

        /* Collect trace when retrying failed tests */
        trace: 'on-first-retry',
    },

    projects: [
        /* Desktop browsers */
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

        /* Mobile viewports */
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
