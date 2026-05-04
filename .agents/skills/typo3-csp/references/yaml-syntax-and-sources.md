# YAML Syntax & Common Source Patterns — TYPO3 CSP

Reference for writing `config/sites/<site-identifier>/csp.yaml` files.

---

## File Location

```
config/
  sites/
    <site-identifier>/
      config.yaml
      csp.yaml          ← this file
```

One `csp.yaml` per site. The site identifier matches the folder name under `config/sites/`.

---

## Top-Level Structure

```yaml
# Optional: completely disable CSP for this site
# active: false

# Inherit TYPO3 core + extension default mutations
inheritDefault: true

# Enforcement mode — browsers block violations
enforce:
  inheritDefault: true
  mutations:
    - mode: "extend"
      directive: "img-src"
      sources:
        - "https://cdn.example.com"
  # Optionally disable the built-in reporting endpoint for this disposition
  # reportingUrl: false
  # Or route to an external collector:
  # reportingUrl: "https://collector.example.com/csp-report"

# Report-only mode — browsers log violations but do not block
report:
  inheritDefault: true
  mutations:
    - mode: "extend"
      directive: "img-src"
      sources:
        - "https://cdn.example.com"
```

Both `enforce` and `report` are independent; you can run them simultaneously.

---

## Mutation Modes

| Mode | YAML | PHP Enum | Effect |
|---|---|---|---|
| `set` | `mode: "set"` | `MutationMode::Set` | Overrides the directive completely (ignores ancestors) |
| `extend` | `mode: "extend"` | `MutationMode::Extend` | Inherits parent sources AND appends new ones (most common) |
| `append` | `mode: "append"` | `MutationMode::Append` | Adds sources to an already-set directive without inheriting |
| `inherit-once` | `mode: "inherit-once"` | `MutationMode::InheritOnce` | Copies parent sources once (use before `append`) |
| `inherit-again` | `mode: "inherit-again"` | `MutationMode::InheritAgain` | Re-applies parent sources (idempotent) |
| `reduce` | `mode: "reduce"` | `MutationMode::Reduce` | Removes specific sources from the compiled result |
| `remove` | `mode: "remove"` | `MutationMode::Remove` | Removes the directive entirely from the policy |

**Use `extend` for most cases** — it safely inherits parent sources and adds yours.

---

## Common Directives

| Directive | Controls |
|---|---|
| `default-src` | Fallback for all directives not explicitly set |
| `script-src` | `<script>` tags, inline scripts, eval |
| `style-src` | `<style>` and `<link rel="stylesheet">` |
| `img-src` | `<img>`, `background-image`, favicons |
| `font-src` | `@font-face` sources |
| `frame-src` | `<iframe>` and `<frame>` (NOT `iframe-src`!) |
| `connect-src` | XHR, Fetch, WebSocket, EventSource |
| `media-src` | `<video>`, `<audio>` |
| `object-src` | `<object>`, `<embed>`, `<applet>` |
| `worker-src` | Web Workers, Service Workers |
| `manifest-src` | Web App Manifest |
| `form-action` | Where forms can submit to |
| `base-uri` | Restricts `<base href>` |

> **Note:** `frame-src` controls iframes. There is no `iframe-src` directive in CSP.

---

## Special Source Keywords

| Keyword (YAML) | Meaning |
|---|---|
| `'self'` | Same origin as the page |
| `'none'` | Nothing allowed (blocks everything for this directive) |
| `'nonce-proxy'` | TYPO3-managed nonce for inline scripts/styles |
| `'unsafe-inline'` | **AVOID** — allows all inline scripts/styles |
| `'unsafe-eval'` | **AVOID** — allows `eval()` |
| `'strict-dynamic'` | Allows scripts loaded by a nonce-bearing script |
| `data:` | `data:` URI scheme (e.g. inline base64 images) |
| `blob:` | `blob:` URI scheme (e.g. Web Workers) |
| `https:` | Any HTTPS source (safe only for `img-src`) |

---

## Common Third-Party Whitelists

### Google Tag Manager

```yaml
- mode: "extend"
  directive: "script-src"
  sources:
    - "https://*.googletagmanager.com"
- mode: "extend"
  directive: "connect-src"
  sources:
    - "https://*.googletagmanager.com"
```

### Google Analytics 4

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
    - "https://stats.g.doubleclick.net"
    - "https://region1.google-analytics.com"
    - "https://region1.analytics.google.com"
- mode: "extend"
  directive: "img-src"
  sources:
    - "https://www.google-analytics.com"
    - "https://www.google.com"
```

### Google AdSense

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
    - "https://www.googletagservices.com"
- mode: "extend"
  directive: "connect-src"
  sources:
    - "https://pagead2.googlesyndication.com"
    - "https://adservice.google.com"
```

### YouTube Embeds

```yaml
- mode: "extend"
  directive: "frame-src"
  sources:
    - "https://*.youtube.com"
    - "https://*.youtube-nocookie.com"
- mode: "extend"
  directive: "img-src"
  sources:
    - "https://*.ytimg.com"
    - "https://*.ggpht.com"
- mode: "extend"
  directive: "script-src"
  sources:
    - "https://*.youtube.com"
- mode: "extend"
  directive: "connect-src"
  sources:
    - "https://*.youtube.com"
```

### Vimeo Embeds

```yaml
- mode: "extend"
  directive: "frame-src"
  sources:
    - "https://player.vimeo.com"
- mode: "extend"
  directive: "img-src"
  sources:
    - "https://*.vimeocdn.com"
- mode: "extend"
  directive: "script-src"
  sources:
    - "https://f.vimeocdn.com"
- mode: "extend"
  directive: "connect-src"
  sources:
    - "https://*.vimeo.com"
    - "https://*.vimeocdn.com"
```

### Google Fonts

```yaml
- mode: "extend"
  directive: "style-src"
  sources:
    - "https://fonts.googleapis.com"
- mode: "extend"
  directive: "font-src"
  sources:
    - "https://fonts.gstatic.com"
```

### Google Maps (Embed)

```yaml
- mode: "extend"
  directive: "frame-src"
  sources:
    - "https://www.google.com"
    - "https://maps.google.com"
- mode: "extend"
  directive: "script-src"
  sources:
    - "https://maps.googleapis.com"
    - "https://*.gstatic.com"
- mode: "extend"
  directive: "img-src"
  sources:
    - "https://*.googleapis.com"
    - "https://*.gstatic.com"
```

### Google reCAPTCHA

```yaml
- mode: "extend"
  directive: "script-src"
  sources:
    - "https://www.google.com/recaptcha/"
    - "https://www.gstatic.com/recaptcha/"
- mode: "extend"
  directive: "frame-src"
  sources:
    - "https://www.google.com/recaptcha/"
    - "https://recaptcha.google.com/recaptcha/"
- mode: "extend"
  directive: "img-src"
  sources:
    - "https://www.gstatic.com"
```

### Matomo / Piwik Analytics

```yaml
- mode: "extend"
  directive: "script-src"
  sources:
    - "https://analytics.example.com"  # your Matomo instance
- mode: "extend"
  directive: "connect-src"
  sources:
    - "https://analytics.example.com"
- mode: "extend"
  directive: "img-src"
  sources:
    - "https://analytics.example.com"
```

---

## Nonces for TYPO3-Generated Inline Scripts

TYPO3 automatically adds a `nonce="..."` attribute to inline `<script>` and `<style>` tags it generates. To allow these:

```yaml
- mode: "extend"
  directive: "script-src"
  sources:
    - "'nonce-proxy'"
- mode: "extend"
  directive: "style-src"
  sources:
    - "'nonce-proxy'"
```

`'nonce-proxy'` is a TYPO3-specific placeholder that gets resolved to the actual `nonce-<random>` value at compile time.

---

## Reporting Endpoint Configuration

By default, TYPO3 provides its own built-in reporting endpoint that stores reports in the `sys_http_report` table.

```yaml
enforce:
  inheritDefault: true
  mutations: []
  # Disable built-in TYPO3 reporting endpoint for this disposition
  # reportingUrl: false
  # Or use an external collector (e.g. report-uri.com)
  # reportingUrl: "https://your-account.report-uri.com/r/d/csp/enforce"
```
