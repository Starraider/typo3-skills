# Implementation Workflow — TYPO3 CSP

A safe, step-by-step process for bringing a TYPO3 site from zero CSP to fully enforced CSP without ever breaking it in production.

---

## Phase 0: Pre-flight Check

### 0.1 Check Current Feature Flag State

Look in `config/system/settings.php` and `config/system/additional.php`:

```php
// Are these keys already present?
'SYS' => [
    'features' => [
        'security.frontend.enforceContentSecurityPolicy' => true,
        'security.frontend.reportContentSecurityPolicy'  => true,
    ],
],
```

### 0.2 Check Existing csp.yaml Files

```bash
find config/sites -name "csp.yaml"
```

### 0.3 Check Extension-Level Policies

```bash
find packages -name "ContentSecurityPolicies.php"
find vendor -name "ContentSecurityPolicies.php" | head -10
```

### 0.4 Check Current CSP Headers (Optional but Useful)

```bash
ddev exec "curl -sI https://your-site.ddev.site/" | grep -i content-security
```

---

## Phase 1: Enable Report-Only Mode

### 1.1 Set the Feature Flag

In `config/system/additional.php` (preferred for project-level overrides):

```php
$GLOBALS['TYPO3_CONF_VARS']['SYS']['features']['security.frontend.reportContentSecurityPolicy'] = true;
// Do NOT enable enforceContentSecurityPolicy yet
```

Or, via TYPO3 Admin Panel → Install Tool → All Configuration → SYS → features.

### 1.2 Alternatively: Use csp.yaml per Site (No Global Config Needed)

This approach avoids touching global configuration and is the preferred method for multi-site installations.

Create `config/sites/<site-identifier>/csp.yaml`:

```yaml
# Report-only mode — safe start
report:
  inheritDefault: true
  # No additional mutations yet; start with defaults only
  mutations: []
```

This activates report-only mode for that specific site only.

### 1.3 Flush Caches

```bash
ddev typo3 cache:flush
```

### 1.4 Verify the Header Is Being Sent

```bash
ddev exec "curl -sI https://your-site.ddev.site/" | grep -i content-security
# Should see: Content-Security-Policy-Report-Only: ...
# Should NOT see: Content-Security-Policy: ... (that's enforcement)
```

---

## Phase 2: Collect and Analyze Violations

### 2.1 Browse All Site Areas

Visit these pages while logged into the backend in a separate tab:
- Home page
- News list + detail
- FAQ page (all categories)
- Map / outlet search
- All forms (contact, registration)
- Any page with embedded YouTube / Vimeo / social widgets
- Backend login page + backend modules

### 2.2 Check Browser Console

Open DevTools → Console. CSP violations appear as red errors like:

```
Refused to load the script 'https://www.googletagmanager.com/gtm.js' because it violates
the following Content Security Policy directive: "script-src 'self' 'nonce-abc123'"
```

Note the **directive** (`script-src`) and the **blocked URL** (`https://www.googletagmanager.com`).

### 2.3 Check the TYPO3 CSP Backend Module

In the TYPO3 backend: **System → Content Security Policy**

This module lists all reported violations stored in `sys_http_report`. For each violation:
- Note the **blocked URI** and **violated directive**
- Click "Suggest resolution" (UI may propose a matching mutation)
- **Review the suggestion before applying** — do not blindly accept wildcards

### 2.4 Triage Each Violation

For each blocked source, decide:

| Category | Action |
|---|---|
| Your own CDN / asset server | Add to relevant directive |
| Google Tag Manager / Analytics | Add `*.googletagmanager.com`, `*.google-analytics.com` to `script-src` |
| Google AdSense | See `references/yaml-syntax-and-sources.md` → AdSense section |
| YouTube embeds | Add `*.youtube.com` to `frame-src`, `*.ytimg.com` to `img-src` |
| Vimeo embeds | Add `*.vimeo.com` to `frame-src`, `*.vimeocdn.com` to `img-src` |
| Google Maps/Fonts | Add `*.googleapis.com`, `*.gstatic.com` |
| Inline scripts from extensions | Use `'nonce-proxy'` in `script-src` |
| Unknown / unwanted script | **Do NOT whitelist** — investigate whether it belongs there |

---

## Phase 3: Write Site-Specific csp.yaml

Create or update `config/sites/<site-identifier>/csp.yaml`:

```yaml
# Inherit rules provided by TYPO3 core and installed extensions
inheritDefault: true

# Enforce the rules (browsers will block violations)
enforce:
  inheritDefault: true
  mutations:
    # Example: allow YouTube embeds
    - mode: "extend"
      directive: "frame-src"
      sources:
        - "https://*.youtube.com"
        - "https://*.youtube-nocookie.com"

    # Example: allow Google Tag Manager
    - mode: "extend"
      directive: "script-src"
      sources:
        - "https://*.googletagmanager.com"

    # Example: allow Google Analytics
    - mode: "extend"
      directive: "connect-src"
      sources:
        - "https://*.google-analytics.com"
        - "https://stats.g.doubleclick.net"

    # Example: allow your own CDN
    - mode: "extend"
      directive: "img-src"
      sources:
        - "https://cdn.example.com"
```

**Flush caches after every change:**

```bash
ddev typo3 cache:flush
```

**Re-check violations** — iterate Phase 2 → Phase 3 until zero unexpected violations appear.

### 3.1 Running Both Report and Enforce Simultaneously

You can run both dispositions at once. This is useful to test a stricter "candidate policy":

```yaml
# Current production policy (enforced)
enforce:
  inheritDefault: true
  mutations:
    - mode: "extend"
      directive: "img-src"
      sources:
        - "https://cdn.example.com"
        - "https://*.instagram.com"

# Stricter candidate policy (report-only) — must be a subset of enforce
report:
  inheritDefault: true
  mutations:
    - mode: "extend"
      directive: "img-src"
      sources:
        - "https://cdn.example.com"
        # No instagram here — testing if it breaks anything
```

---

## Phase 4: Switch to Enforcement

Once you have zero unexpected violations in report-only mode, enforce:

### Option A: Via csp.yaml (Recommended for Per-Site Control)

In `config/sites/<site-identifier>/csp.yaml`:

```yaml
inheritDefault: true

# Enforcement enabled
enforce:
  inheritDefault: true
  mutations:
    # ... your whitelisted mutations here ...

# Keep report-only running too, to catch regressions
report:
  inheritDefault: true
  mutations:
    # ... same or stricter mutations ...
```

### Option B: Via Global Feature Flag

In `config/system/additional.php`:

```php
$GLOBALS['TYPO3_CONF_VARS']['SYS']['features']['security.frontend.enforceContentSecurityPolicy'] = true;
$GLOBALS['TYPO3_CONF_VARS']['SYS']['features']['security.frontend.reportContentSecurityPolicy'] = true; // keep for monitoring
```

### Verification

```bash
ddev exec "curl -sI https://your-site.ddev.site/" | grep -i content-security
# Should now see: Content-Security-Policy: ... (enforced)
```

---

## Phase 5: Disable CSP for a Specific Site (Emergency Rollback)

If a site must have CSP disabled entirely:

```yaml
# config/sites/<site-identifier>/csp.yaml
active: false
```

Flush caches and CSP headers will stop being sent for that site.

---

## Phase 6: Active Rules Inspection

In the backend: **System → Configuration → Content Security Policy Mutations**

This displays a tree of all active directives, grouped by scope (frontend/backend), showing exactly which rule came from which source (extension, site YAML, UI resolution). Use this to audit your final policy before going live.
