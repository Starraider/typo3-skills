# Troubleshooting: Playwright in DDEV for TYPO3

Common issues and solutions discovered across 4 epics of a TYPO3 theme migration project.

## Table of Contents

1. [Browser Binary Mismatch](#browser-binary-mismatch)
2. [Test Timeout and Timing Issues](#test-timeout-and-timing-issues)
3. [Snapshot Baseline Pitfalls](#snapshot-baseline-pitfalls)
4. [HTTPS Certificate Errors](#https-certificate-errors)
5. [Missing Test File Verification](#missing-test-file-verification)
6. [Webkit-Specific Issues](#webkit-specific-issues)

---

## Browser Binary Mismatch

**Symptom:** Tests fail with "Executable doesn't exist" or "Browser was not installed" errors.

**Root Cause:** Playwright browsers were installed on the host machine (macOS/Windows) but tests run inside the DDEV container (Linux). The binaries are incompatible, and manually installing them inside the container doesn't persist across restarts.

**Fix:**

Install the `Lullabot/ddev-playwright` add-on, which manages browser binaries within the container and ensures they persist:

```bash
ddev get Lullabot/ddev-playwright
ddev restart
```

**Prevention:** Always install the DDEV Playwright add-on instead of trying to manually manage browsers inside or outside the container. Use `ddev playwright` or `ddev npm run` prefix for all Playwright commands.

---

## Test Timeout and Timing Issues

**Symptom:** Tests intermittently fail with timeout errors, especially on first load or complex pages.

**Root Cause:** DDEV environment may be slower than native host, especially on first request (cold TYPO3 cache).

**Fixes:**

```typescript
// Use networkidle for pages with dynamic content
await page.waitForLoadState('networkidle');

// Add small waits for focus management
await page.waitForTimeout(100); // Only for focus shift operations

// NEVER use arbitrary long waits — prefer proper wait conditions
await page.locator('.my-element').waitFor({ state: 'visible' });
```

**Global timeout adjustment (if needed):**

```typescript
// In playwright.config.ts
export default defineConfig({
    timeout: 30_000,  // Default 30s, increase if DDEV is slow
    expect: {
        timeout: 10_000, // Assertion timeout
    },
});
```

---

## Snapshot Baseline Pitfalls

**Symptom:** Visual regression tests always pass even though the site visually changed.

**Root Cause:** Developers generated *new* snapshots instead of comparing against existing baselines. This completely defeats the purpose of VRT.

**Rules:**

1. **Generate baselines once**, at the start of the project
2. **Run `ddev npm run test:visual`** (without `--update-snapshots`) for regression checks
3. **Only use `--update-snapshots`** when you intentionally changed the design and understand every diff
4. **Never run `--update-snapshots` as a fix** for failing tests without investigating the cause
5. **Commit baseline images** to version control

**Anti-pattern checklist:**

- ❌ Running `--update-snapshots` to "fix" failing VRT tests
- ❌ Generating new baselines for each epic without comparing to the original
- ❌ Having snapshot folders without corresponding `.spec.ts` files
- ✅ Comparing against Epic 1 / initial baselines throughout the project
- ✅ Examining each VRT diff in `test-results/` before deciding to update

---

## HTTPS Certificate Errors

**Symptom:** Tests fail to connect to the DDEV site with SSL errors.

**Root Cause:** DDEV uses self-signed certificates that Playwright rejects by default.

**Fix:** In `playwright.config.ts`:

```typescript
use: {
    ignoreHTTPSErrors: true,
},
```

---

## Missing Test File Verification

**Symptom:** Snapshot images exist in the repo but the corresponding `.spec.ts` file was never committed. Tests appear to run but actually skip missing test files silently.

**Prevention — Code Review Quality Gate:**

1. For every story that creates or modifies tests, verify:
   - All `.spec.ts` files are committed
   - Snapshot folders have matching `.spec.ts` files
   - `git status` shows no untracked test files
2. Run `ddev playwright test --list` to verify test discovery
3. Count expected tests vs. actual tests found

---

## Webkit-Specific Issues

**Symptom:** Tests pass on Chromium/Firefox but fail on Webkit (Safari).

**Known Webkit behaviors:**

1. **Focus management:** `:focus` pseudo-class is unreliable after keyboard navigation
2. **CSS `clip-path`:** May render differently (verify Hero components)
3. **CSS Custom Properties:** Inheritance through `::before`/`::after` can differ
4. **`position: sticky`:** Minor differences on mobile Webkit

**Pattern for browser-specific handling:**

```typescript
test('keyboard navigation', async ({ page, browserName }) => {
    // Skip unreliable Webkit focus tests
    test.skip(browserName === 'webkit', 'Webkit has different focus behavior');
    // ... test body
});

// Or conditional assertions
if (browserName !== 'webkit') {
    await expect(element).toBeFocused();
} else {
    await expect(element).toBeAttached();
}
```

---

## Quick Diagnostic Checklist

When tests fail unexpectedly, check these in order:

1. **Are browsers installed?** → Did you install the add-on? `ddev get Lullabot/ddev-playwright`
2. **Is DDEV running?** → `ddev start`
3. **Is the site accessible?** → `ddev launch` (opens browser)
4. **SSL issues?** → Verify `ignoreHTTPSErrors: true` in config
5. **Timing issues?** → Add `waitForLoadState('networkidle')`
6. **Browser-specific?** → Run with `--project=chromium` first, then other browsers
7. **Stale snapshots?** → Check if CSS rebuild is needed: `ddev npm run build`
