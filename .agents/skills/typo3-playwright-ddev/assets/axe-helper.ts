import { Page, TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Run an accessibility check on the current page using axe-core.
 * Scans for WCAG 2.1 AA compliance and attaches results to the test report.
 *
 * @param page - Playwright Page object
 * @param testInfo - Playwright TestInfo object (for attaching results)
 * @param context - Description of the context being tested (e.g., "Startpage (ocean-breeze)")
 */
export async function checkAccessibility(page: Page, testInfo: TestInfo, context: string = 'Page') {
    const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

    await testInfo.attach(`${context} accessibility scan results`, {
        body: JSON.stringify(accessibilityScanResults, null, 2),
        contentType: 'application/json',
    });

    if (accessibilityScanResults.violations.length > 0) {
        console.log(`Accessibility violations found in ${context}:`);
        accessibilityScanResults.violations.forEach(violation => {
            console.log(`- ${violation.id}: ${violation.description}`);
            console.log(`  Help URL: ${violation.helpUrl}`);
            violation.nodes.forEach(node => {
                console.log(`  Target: ${node.target}`);
            });
        });
    }

    return accessibilityScanResults;
}

/**
 * Set a theme variant on the page by updating the data-theme attribute on <html>.
 * Use this to test accessibility and styling across multiple theme variants.
 *
 * @param page - Playwright Page object
 * @param theme - Theme name (e.g., 'ocean-breeze', 'forest-mist', 'violet-velvet', 'default')
 */
export async function setTheme(page: Page, theme: string) {
    await page.evaluate((themeName) => {
        document.documentElement.setAttribute('data-theme', themeName);
    }, theme);
}
