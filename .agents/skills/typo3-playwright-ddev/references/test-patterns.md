# Test Patterns for TYPO3 + DDEV

Battle-tested patterns from a full TYPO3 theme migration project.

## Table of Contents

1. [Visual Regression Tests](#visual-regression-tests)
2. [Accessibility Tests](#accessibility-tests)
3. [Cross-Browser Functional Tests](#cross-browser-functional-tests)
4. [Console Error Audit Tests](#console-error-audit-tests)

---

## Visual Regression Tests

Location: `Tests/Visual/`

### Basic Page Screenshot

```typescript
import { test, expect } from '@playwright/test';

test('Startpage Visual Regression', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveScreenshot('startpage.png', { fullPage: true });
});
```

### Key Rules

- Always use `{ fullPage: true }` to capture complete layouts including footers
- Verify HTTP status before screenshots (`expect(response?.status()).toBe(200)`)
- Name screenshots descriptively: `startpage.png`, `contentpage.png`, `sidebar.png`
- Test all major page layouts: Startpage, Contentpage, Sidebar
- Test content elements on the page where they all appear

### Baseline Management

```bash
# Generate initial baselines
ddev npm run test:visual:update

# Run regression check against baselines
ddev npm run test:visual

# Anti-pattern: NEVER blindly update to make tests pass
# Every diff must be understood and justified
```

### Per-Page Pattern

Create one `.spec.ts` file per page type. Example files:

- `startpage.spec.ts` — Homepage layout
- `contentpage.spec.ts` — Standard content page
- `sidebar.spec.ts` — Page with sidebar layout
- `elements.spec.ts` — Page showcasing all content elements

---

## Accessibility Tests

Location: `Tests/Accessibility/`

### Reusable Helper (`axe-helper.ts`)

Copy from `assets/axe-helper.ts`. Provides:

- `checkAccessibility(page, testInfo, context)` — Run axe scan, attach JSON results
- `setTheme(page, theme)` — Switch theme variant for multi-theme a11y testing

### Basic Accessibility Test

```typescript
import { test, expect } from '@playwright/test';
import { checkAccessibility } from './axe-helper';

test('Startpage should be accessible', async ({ page }, testInfo) => {
    await page.goto('/');
    const results = await checkAccessibility(page, testInfo, 'Startpage');
    expect(results.violations).toEqual([]);
});
```

### Theme Variant Accessibility Test

Test all theme variants in a single describe block:

```typescript
import { test, expect } from '@playwright/test';
import { checkAccessibility, setTheme } from './axe-helper';

const themes = ['default', 'ocean-breeze', 'forest-mist', 'violet-velvet'];

test.describe('Startpage Accessibility', () => {
    for (const theme of themes) {
        test(`no a11y issues in ${theme} theme`, async ({ page }, testInfo) => {
            await page.goto('/');
            if (theme !== 'default') {
                await setTheme(page, theme);
            }
            const results = await checkAccessibility(page, testInfo, `Startpage (${theme})`);
            expect(results.violations).toEqual([]);
        });
    }
});
```

### Common A11y Fixes for TYPO3

- `html lang` attribute: Add `lang="{site.language.twoLetterIsoCode ?? 'en'}"` to page layout
- Logo link accessible text: Add `aria-label` or `title` to the header logo `<a>` tag
- Skip to Content link: Add `<a href="#content" class="skip-to-content">Skip to content</a>` before the header
- Heading hierarchy: Ensure only one `<h1>` per page via proper `HeaderTag` configuration

---

## Cross-Browser Functional Tests

Location: `Tests/CrossBrowser/`

### Navigation Test

```typescript
test('should have clickable main menu links', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav[aria-label]').first();
    await expect(nav).toBeVisible();
    const navLinks = nav.locator('a');
    expect(await navLinks.count()).toBeGreaterThan(0);
    const firstLink = navLinks.first();
    await expect(firstLink).toBeVisible();
    expect(await firstLink.getAttribute('href')).toBeTruthy();
});
```

### Mobile Burger Menu Test

```typescript
test('should toggle burger menu', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile viewports only');
    await page.goto('/');
    const burgerButton = page.locator('button[aria-label*="menu" i], button[aria-expanded]').first();
    await expect(burgerButton).toBeVisible();

    await burgerButton.click();
    expect(await burgerButton.getAttribute('aria-expanded')).toBe('true');

    await burgerButton.click();
    expect(await burgerButton.getAttribute('aria-expanded')).toBe('false');
});
```

### Browser-Specific Skips

Webkit has different focus behavior. Use conditional skips:

```typescript
test('keyboard navigation', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Webkit has different focus behavior');
    // ... test body
});
```

### Skip-to-Content Link Test

```typescript
test('skip link visible on focus', async ({ page, browserName }) => {
    await page.goto('/');
    const skipLink = page.locator('a[href="#content"]');
    await expect(skipLink).toBeAttached();

    await page.keyboard.press('Tab');

    if (browserName !== 'webkit') {
        await expect(skipLink).toBeFocused();
        await expect(skipLink).toBeVisible();
    } else {
        await expect(skipLink).toBeAttached();
    }
});
```

---

## Console Error Audit Tests

Location: `Tests/CrossBrowser/`

### Console Error Test with DDEV Benign Filtering

```typescript
import { test, expect } from '@playwright/test';

// Known benign console messages to ignore in DDEV
const BENIGN_PATTERNS = [
    /favicon\.ico/i,
    /net::ERR_CERT/i,
    /SSL certificate/i,
    /ddev\.site/i,
    /Failed to load resource.*favicon/i,
];

function isBenignMessage(message: string): boolean {
    return BENIGN_PATTERNS.some(pattern => pattern.test(message));
}

test('page should not have console errors', async ({ page }) => {
    const consoleMessages: { type: string; text: string }[] = [];

    page.on('console', msg => {
        consoleMessages.push({ type: msg.type(), text: msg.text() });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const errors = consoleMessages.filter(msg => msg.type === 'error');
    const realErrors = errors.filter(msg => !isBenignMessage(msg.text));

    if (realErrors.length > 0) {
        console.log('Real errors found:');
        realErrors.forEach(msg => console.log(`  [ERROR] ${msg.text}`));
    }

    expect(realErrors).toEqual([]);
});
```

### Key Points

- Always use `page.waitForLoadState('networkidle')` before checking console
- Filter out DDEV-specific benign messages (SSL, favicon, cert errors)
- Test all major pages: `/`, `/contentpage`, `/contentpagesidbar` (or project-specific URLs)
- Console warnings can be logged informatively without failing the test
