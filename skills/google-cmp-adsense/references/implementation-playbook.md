# Implementation Playbook

## Scope

Use this file when you need code-path guidance for `gtag.js`, `GTM`, or repo-level integration work.

## 1. Default Implementation Strategy

For this skill, prefer this order:

1. Use Google's own CMP in `Privacy & messaging`.
2. Keep the site's Google publisher code or Google tag present on all pages that need the message.
3. Add `Consent Mode v2` for `GA4`, `Google Ads`, and any other Google tags.
4. Verify ordering so defaults run before any measurement or advertising command.

## 2. Repo Audit Checklist

Search for these strings first:

- `adsbygoogle`
- `googletagmanager`
- `gtag(`
- `G-`
- `AW-`
- `DC-`
- `floodlight`
- `conversion linker`
- `cookie`
- `consent`

Then identify:

- the earliest common head/include file
- whether GTM or direct `gtag.js` is in use
- whether anything fires Google cookies before consent
- whether an old custom banner must be removed or replaced

## 3. gtag.js Pattern

Use this when the site loads Google tags directly.

### Required ordering

1. Initialize `dataLayer` and load the Google tag bootstrap as early as possible.
2. Set default consent state before any `config` / `event` commands.
3. Update consent immediately when the user acts.
4. Persist the user's choice and replay it on future pages.

### Example

```html
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500
  });

  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

When the user accepts the relevant purposes:

```html
<script>
  function applyFullGoogleConsent() {
    gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted'
    });
  }
</script>
```

Adjust grant/deny values purpose-by-purpose if the user made granular selections.

## 4. GTM Pattern

Use this when the site uses `Google Tag Manager`.

### Required rules

- Fire consent defaults on `Consent Initialization - All Pages`.
- Use GTM APIs `setDefaultConsentState` and `updateConsentState`.
- Do not use queued `gtag('consent', ...)` calls inside GTM instead of the GTM consent APIs.
- If you build or adapt a GTM consent template, allow region-specific defaults and consent updates.

### Minimum GTM flow

1. Consent Initialization tag sets denied defaults.
2. CMP shows the banner as early as possible.
3. User choice triggers consent updates.
4. Tags with consent checks fire only when their required states allow them.
5. Optional GTM settings such as ads data redaction or URL passthrough are applied only when justified.

## 5. Basic vs Advanced Consent Mode

### Basic

Choose this when:

- legal or compliance requires zero Google requests before consent
- the organization wants the strictest possible data minimization posture

Effects:

- Google tags are blocked before consent
- Google receives no pre-consent data
- Google Ads / GA4 modeling is weaker

### Advanced

Choose this when:

- the organization wants stronger modeled measurement
- legal review accepts Google's denied-state cookieless pings
- the banner still provides a fair, non-manipulative choice

Effects:

- Google tags load with denied defaults
- denied-state traffic sends cookieless pings
- modeling is better than in basic mode

Default recommendation for monetization work:

- prefer `advanced` only after legal review
- otherwise fall back to `basic`

## 6. Google CMP Message Testing

Google's message preview is useful and should be part of verification.

Examples:

- `?fc=alwaysshow`
- `?fc=alwaysshow&fctype=gdpr`

Important:

- the message must already be published to the site
- the page must contain the relevant Google tag / AdSense code
- use a clean browser profile or incognito session

## 7. Verification Checklist

Inspect all of these before sign-off:

- tag order in HTML
- consent defaults before `config` / `event`
- CMP render timing
- no non-essential Google cookies before consent in `basic`
- only denied-state cookieless behavior in `advanced`
- consent updates after accept, reject, and granular choices
- stored consent replay on navigation and reload
- TCF string or Google message behavior matches the chosen architecture
- no duplicate banner or race condition from legacy consent code

## 8. Repo-Specific Completion Rules

For this repo:

- if the CMP or consent code changes visible UI, verify in `DDEV`
- if a page URL is needed to test the real message, request it
- if Playwright can run against that URL, use it before calling the work done
