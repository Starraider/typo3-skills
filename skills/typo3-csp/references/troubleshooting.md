# Troubleshooting Guide — TYPO3 CSP

Diagnose and fix the most common CSP problems in TYPO3.

---

## Diagnostic Checklist

Before debugging any violation, verify:

1. **Caches are flushed** after every config change:
   ```bash
   ddev typo3 cache:flush
   ```
2. **Hard-refresh the browser** (Ctrl+Shift+R / Cmd+Shift+R) to bypass browser cache.
3. **CSP header is actually being sent:**
   ```bash
   ddev exec "curl -sI https://your-site.ddev.site/" | grep -i content-security
   ```
4. **Check the correct site** — multi-site TYPO3 installations have per-site `csp.yaml` files.

---

## Problem: No CSP Header Appearing at All

**Symptoms:** `curl -sI` shows no `Content-Security-Policy` or `Content-Security-Policy-Report-Only` header.

**Causes & Fixes:**

| Cause | Fix |
|---|---|
| Feature flags not enabled | Set `security.frontend.reportContentSecurityPolicy` = `true` in `additional.php` **or** add a `report:` block in `csp.yaml` |
| Wrong site identifier in `csp.yaml` | Check the folder name under `config/sites/` matches exactly |
| `active: false` in `csp.yaml` | Remove that line or set to `true` |
| Reverse proxy stripping headers | Check nginx/Apache config for header removal rules |
| Cache still serving old response | `ddev typo3 cache:flush` then hard-refresh |

---

## Problem: Legitimate Script / Style Is Being Blocked

**Symptoms:** Browser console shows `Refused to load the script/style '...'`.

**Steps:**

1. Copy the exact blocked URL from the console.
2. Identify the directive: `script-src` for JS, `style-src` for CSS, `img-src` for images, `frame-src` for iframes.
3. Add an `extend` mutation for that domain in `csp.yaml`:
   ```yaml
   - mode: "extend"
     directive: "script-src"
     sources:
       - "https://blocked-domain.example.com"
   ```
4. Flush caches and retest.

**Common Mistake:** Using `frame-src` is correct for `<iframe>` — there is no `iframe-src` directive in the CSP specification.

---

## Problem: Inline Script / Style Blocked

**Symptoms:** `Refused to execute inline script because it violates...`

**Causes & Fixes:**

| Scenario | Fix |
|---|---|
| TYPO3 core-generated inline script | Ensure `'nonce-proxy'` is in `script-src` sources |
| Third-party widget inline script | Use `'nonce-proxy'` if TYPO3 outputs it, or investigate using a loader script from the external domain |
| Hardcoded `onclick="..."` attributes in Fluid templates | Refactor to external script with event listeners |
| RTE-generated inline styles | Add `'nonce-proxy'` to `style-src` |

**Never add `'unsafe-inline'`** — it defeats XSS protection. Use nonces instead.

---

## Problem: `eval()` Call Blocked

**Symptoms:** `Refused to evaluate a string as JavaScript because 'unsafe-eval' is not an allowed source`

**Causes & Fixes:**

| Cause | Fix |
|---|---|
| Minified/bundled frontend JS using `eval()` | Rebuild JS without `eval()` in bundler settings. Most modern bundlers have a `devtool: 'source-map'` option that removes `eval` from production builds |
| Legacy jQuery plugin | Update or replace the plugin |
| Third-party widget absolutely requiring `eval()` | If unavoidable, add `'unsafe-eval'` to `script-src` **only for that site** and document the reason |

---

## Problem: TYPO3 Backend Is Broken After CSP Changes

**Important:** TYPO3 backend CSP is always enforced by TYPO3 itself — you cannot disable it. Backend rules must be set via PHP (`ContentSecurityPolicies.php`), never via `csp.yaml`.

**If backend is broken:**
1. Check `Configuration/ContentSecurityPolicies.php` in your custom extensions.
2. Look for `MutationMode::Set` overrides that might be too restrictive.
3. Use **System → Configuration → Content Security Policy Mutations** to inspect what rules are active.
4. Check **System → Content Security Policy** for violation reports.

---

## Problem: Google AdSense Ads Not Showing

AdSense uses many domains and requires careful framing. Required additions to `csp.yaml`:

```yaml
- mode: "extend"
  directive: "script-src"
  sources:
    - "https://pagead2.googlesyndication.com"
    - "https://partner.googleadservices.com"
    - "https://*.googletagservices.com"
    - "https://adservice.google.com"
- mode: "extend"
  directive: "frame-src"
  sources:
    - "https://googleads.g.doubleclick.net"
    - "https://tpc.googlesyndication.com"
    - "https://*.safeframe.googlesyndication.com"
- mode: "extend"
  directive: "img-src"
  sources:
    - "https://*.googlesyndication.com"
    - "https://www.google.com"
- mode: "extend"
  directive: "connect-src"
  sources:
    - "https://pagead2.googlesyndication.com"
    - "https://adservice.google.com"
```

If ads still don't show, check: **Google AdSense → Sites** and ensure the site is approved, then check browser console for remaining violations.

---

## Problem: Google Tag Manager / Analytics Not Firing

```yaml
- mode: "extend"
  directive: "script-src"
  sources:
    - "https://*.googletagmanager.com"
    - "https://*.google-analytics.com"
- mode: "extend"
  directive: "connect-src"
  sources:
    - "https://*.google-analytics.com"
    - "https://*.googletagmanager.com"
    - "https://stats.g.doubleclick.net"
    - "https://region1.google-analytics.com"
```

Also ensure GTM snippet is loaded via external `<script src="...">` not inline `<script>eval</script>`.

---

## Problem: YouTube / Vimeo Embeds Broken

Ensure `frame-src` (not `iframe-src`) is set:

```yaml
- mode: "extend"
  directive: "frame-src"
  sources:
    - "https://*.youtube.com"
    - "https://*.youtube-nocookie.com"
    - "https://player.vimeo.com"
- mode: "extend"
  directive: "img-src"
  sources:
    - "https://*.ytimg.com"
    - "https://*.vimeocdn.com"
```

Also check for `connect-src` violations in console — YouTube may make XHR requests.

---

## Problem: Form Submission Blocked

If a form submits to an external URL or a different origin, add:

```yaml
- mode: "extend"
  directive: "form-action"
  sources:
    - "https://external-form-handler.example.com"
```

---

## Problem: `inheritDefault: true` Breaks Rules

`inheritDefault: true` at the root level and within `enforce`/`report` are independent settings:

```yaml
# Root-level: inherit extension-provided defaults globally
inheritDefault: true

enforce:
  # Disposition-level: inherit defaults within this disposition's policy
  inheritDefault: true
  mutations: []
```

If you omit `inheritDefault: true` inside `enforce:`, you get a blank slate (only your mutations). This can break TYPO3 core functionality.

---

## Problem: `sys_http_report` Table Growing Too Large

If the reporting endpoint is flooded by bots or crawlers reporting violations:

1. Periodically truncate old reports:
   ```bash
   ddev typo3 cleanup:localprocessedfiles  # cleans processed files, not CSP directly
   # Or via SQL:
   ddev exec mysql -u db -pdb db -e "DELETE FROM sys_http_report WHERE crdate < UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 30 DAY));"
   ```

2. Disable the reporting endpoint for a specific site:
   ```yaml
   enforce:
     inheritDefault: true
     mutations: []
     reportingUrl: false
   ```

3. Route reports to an external collector with rate limiting (e.g. [report-uri.com](https://report-uri.com)):
   ```yaml
   enforce:
     reportingUrl: "https://your-account.report-uri.com/r/d/csp/enforce"
   ```

---

## Inspecting the Compiled Policy

To see exactly what policy is being compiled and sent, use the TYPO3 backend:

- **System → Configuration → Content Security Policy Mutations** — tree view of all active rules
- **System → Content Security Policy** — violation reports

Or inspect the raw header:

```bash
ddev exec "curl -sI https://your-site.ddev.site/" | grep -i "content-security-policy"
```

Decode the header value to read the full compiled policy.
