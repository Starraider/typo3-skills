# Implementation Playbook

## Scope

Use this file when you need repo touchpoints, code patterns, and verification guidance for `GA4` implementation work.

## Official Sources Reviewed

Reviewed on `2026-04-11`:

- Google Analytics Help, "Set up Analytics for a website and/or app"
  - https://support.google.com/analytics/answer/9304153
- Google for Developers, "Google tag API reference"
  - https://developers.google.com/tag-platform/gtagjs/reference
- Google for Developers, "Set up consent mode on websites"
  - https://developers.google.com/tag-platform/security/guides/consent
- Google Analytics Help, "Create or modify key events"
  - https://support.google.com/analytics/answer/12844695
- Google Analytics Help, "[GA4] Recommended events"
  - https://support.google.com/analytics/answer/9267735

## 1. Default Implementation Strategy

For a typical TYPO3 site package, prefer this order:

1. Decide whether the site should use `basic` or `advanced` consent behavior.
2. If no `GTM` is already in place, prefer direct `gtag.js` for the smallest surface area.
3. Keep measurement IDs and repo-wide enable flags in the theme Site Set under `packages/my-site-package/Configuration/Sets/MySitePackage/`.
4. Centralize Analytics bootstrapping in one shared layout or JS module.
5. Track only business outcomes that have real success confirmation.

For consent and legal decisions, also read:

- [`../google-cmp-adsense/SKILL.md`](../google-cmp-adsense/SKILL.md)
- [privacy-and-legal-handoff.md](privacy-and-legal-handoff.md)

## 2. Repo Audit Checklist

Search for these strings first:

- `gtag(`
- `googletagmanager`
- `google-analytics`
- `G-`
- `googlefc`
- `adsbygoogle`
- `cookie`
- `consent`

Then inspect these typical site-package touchpoints:

- `packages/my-site-package/Configuration/Sets/MySitePackage/settings.definitions.yaml`
- `packages/my-site-package/Configuration/Sets/MySitePackage/settings.yaml`
- `packages/my-site-package/Configuration/Sets/MySitePackage/TypoScript/page.typoscript`
- `packages/my-site-package/Resources/Private/Layouts/Pages/Default.fluid.html`
- `packages/my-site-package/Resources/Public/JavaScript/main.js`
- mounted feature templates such as:
  - `packages/my-site-package/Resources/Private/Templates/Newsletter/Show.html`
  - `packages/my-site-package/Resources/Private/Templates/Login/Login.fluid.html`

Identify:

- where Analytics can be loaded once per page
- where consent state is already known or can be injected safely
- which templates already expose stable `data-*` hooks for event capture
- whether current tests already stub Google requests

## 3. Typed Site Settings Pattern

Prefer this convention: keep reusable settings in a theme Site Set, not inside the site-specific `config/sites/<site-id>/` directory.

Sensible starter settings:

```yaml
settings:
  mysitepackage.analytics.enabled:
    default: false
    type: bool
    category: mysitepackage
  mysitepackage.analytics.measurementId:
    default: ''
    type: string
    category: mysitepackage
  mysitepackage.analytics.mode:
    default: basic
    type: string
    enum:
      basic: Basic
      advanced: Advanced
    category: mysitepackage
```

And default values:

```yaml
mysitepackage:
  analytics:
    enabled: false
    measurementId: ''
    mode: basic
```

Add more settings only when the repo genuinely needs them.

## 4. Direct gtag.js Pattern

Use this when the site does not already depend on `GTM`.

### Basic mode

Choose this when the user wants the strictest pre-consent posture.

Rules:

- do not load the Google tag before analytics consent exists
- boot Analytics only once after consent is granted
- persist the consent state through the CMP or existing consent layer

### Advanced mode

Choose this only after legal review accepts denied-state cookieless pings.

Minimum pattern:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}

  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
  });

  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

When the user grants analytics consent:

```html
<script>
  gtag('consent', 'update', {
    analytics_storage: 'granted'
  });
</script>
```

If Ads products are also in scope, update the ad-related consent fields through the CMP workflow instead of improvising them here.

## 5. Event Capture Pattern

Prefer success-state tracking over click tracking.

Good examples for typical business journeys:

- newsletter success after the server confirms subscription
- shopper registration success after the application or account is actually accepted
- store owner lead capture after the form submission succeeds

Secondary journey events can still be useful, but they should not replace the main success event.

Useful current hooks:

- newsletter form: `[data-newsletter-form="true"]`
- newsletter success feedback: `#newsletter-server-feedback`
- register CTA block: `[data-testid="call-to-register"]`
- login page content: `[data-testid="login-page-content"]`
- store owner registration card: `[data-testid="store-owner-registration-card"]`

## 6. Duplicate-Count Protection

Before adding manual events, decide whether `Enhanced Measurement` already sends a comparable event.

Common mistakes:

- manual `page_view` plus automatic `page_view`
- CTA click tracked as a conversion and success tracked again as a conversion
- newsletter XHR success tracked twice because both JS and the success page emit the same event

Default rule:

- use one primary conversion event per business outcome
- keep optional secondary interaction events clearly separate

## 7. Verification Checklist

Always verify:

- the script order in HTML
- the tag is loaded once
- consent gating behaves as designed
- `Realtime` and `DebugView` receive the event once, not twice
- failures and validation errors do not emit success events
- page URLs or parameters do not leak personal data

Frontend verification checks:

- if you touched `TypoScript`, `Fluid`, or shared JS, clear TYPO3 caches before browser validation
- if visible UI changed, verify in `DDEV` and use Playwright when applicable
- when VRTs or E2E tests would become noisy from external requests, stub `googletagmanager` and `google-analytics` as current tests already do

## 8. Completion Rules

General rules:

- do not claim a frontend-affecting analytics task is complete without DDEV verification when verification is possible
- if a mounted plugin page URL is required for end-to-end testing, request it before sign-off
- if the task also changes consent or banners, finish the privacy work through `$google-cmp-adsense`
