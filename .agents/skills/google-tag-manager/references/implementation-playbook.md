# Implementation Playbook

## Scope

Use this file when you need repo touchpoints, code-placement guidance, migration rules, or verification steps for `GTM` work.

## Official Sources Reviewed

Reviewed on `2026-04-11`:

- Tag Manager Help, "2. Install a web container"
  - https://support.google.com/tagmanager/answer/14847097
- Tag Manager Help, "Set up your Google tag in Google Tag Manager"
  - https://support.google.com/tagmanager/answer/15756616
- Google for Developers, "Set up consent mode on websites"
  - https://developers.google.com/tag-platform/security/guides/consent
- Google for Developers, "Create a consent mode template"
  - https://developers.google.com/tag-platform/tag-manager/templates/consent-apis
- Google for Developers, "The data layer"
  - https://developers.google.com/tag-platform/tag-manager/datalayer
- Tag Manager Help, "Tag Manager consent mode support"
  - https://support.google.com/tagmanager/answer/10718549
- Tag Manager Help, "Client-side tagging vs. server-side tagging"
  - https://support.google.com/tagmanager/answer/13387731
- Tag Manager Help, "Release notes"
  - https://support.google.com/tagmanager/answer/4620708
- Analytics Help, "Verify your Google tag"
  - https://support.google.com/analytics/answer/15756111

## 1. Default Technical Strategy

For a typical TYPO3 site package, prefer this order:

1. Decide whether `GTM` is truly needed or whether direct `gtag.js` would stay simpler.
2. If `GTM` is chosen, install the container snippets once in the shared layout.
3. Keep repo-wide enable flags and IDs in the theme Site Set when the project needs environment-controlled settings.
4. Treat `GTM` as the single source of truth for the Google tag and related event tags.
5. Put consent defaults on `Consent Initialization - All Pages` and keep the legal/policy decisions aligned with `$google-cmp-adsense`.
6. Keep `AdSense` bootstrap and ad units site-side by default; use `GTM` to coordinate, not to replace the publisher implementation path.

Important:

- `GTM` does not remove consent obligations.
- Server-side tagging is optional architecture, not a legal shortcut.

## 2. Repo Audit Checklist

Search for these strings first:

- `googletagmanager`
- `gtag(`
- `dataLayer`
- `googlefc`
- `adsbygoogle`
- `GTM-`
- `G-`
- `AW-`
- `DC-`
- `cookie`
- `consent`

Then inspect these typical site-package touchpoints:

- `packages/my-site-package/Configuration/Sets/MySitePackage/settings.definitions.yaml`
- `packages/my-site-package/Configuration/Sets/MySitePackage/settings.yaml`
- `packages/my-site-package/Configuration/Sets/MySitePackage/TypoScript/page.typoscript`
- `packages/my-site-package/Resources/Private/Layouts/Pages/Default.fluid.html`
- `packages/my-site-package/Resources/Private/Partials/Pages/Header.fluid.html`
- `packages/my-site-package/Resources/Private/Partials/Pages/Footer.fluid.html`
- `packages/my-site-package/Resources/Public/JavaScript/main.js`
- existing Playwright specs under `packages/my-site-package/Tests/e2e/` that already stub `googletagmanager`

Identify:

- the earliest common `<head>` insertion point
- the earliest shared `<body>` opening hook
- whether `GTM`, direct `gtag.js`, or both are already present
- whether any tag fires before consent
- whether the current consent state is already exposed to JS in a reusable way

## 3. Snippet Placement Pattern

Google's current `GTM` install flow still expects:

- the first snippet as high in `<head>` as possible
- the `noscript` iframe immediately after the opening `<body>`

For the site package, start with the shared page layout rather than scattering snippets across page templates.

Practical rule:

- install `GTM` once centrally
- do not duplicate the snippet through page partials and separate TypoScript header injections at the same time

## 4. dataLayer Pattern

Keep `window.dataLayer = window.dataLayer || [];` centralized.

When custom site events are needed:

- push a named event such as `dataLayer.push({ event: 'newsletter_success' })`
- attach business data as low-cardinality fields
- avoid pushing personal data

Google's current developer docs say queued `gtag()` and `dataLayer.push()` messages are processed in order, and that consent updates inside `GTM` should use the `Tag Manager` consent APIs instead of queued `gtag('consent', ...)` calls.

## 5. Migration Rules

When moving from direct `gtag.js` to `GTM`:

1. inventory current destinations, consent defaults, and custom parameters
2. create the Google tag and event tags in `GTM`
3. move consent sequencing safely
4. verify in `Tag Assistant`
5. remove the old in-page Google tag code

Do not leave both implementations active unless a product-specific reason is documented.

Current `GTM` behavior to remember:

- since `2025-04-10`, containers with `Google Ads` or `Floodlight` tags may automatically load a Google tag first
- still make the container setup explicit so the team knows which destinations and settings are active

## 6. Server-Side Tagging Evaluation

Use server-side tagging when the user specifically needs:

- a first-party collection endpoint
- stronger control over data sent to vendors
- validation, normalization, or filtering before dispatch
- reduced client-side processing

Do not recommend it casually:

- it adds cloud infrastructure and operational cost
- consent must still be initialized and respected
- Google notes that if multiple `GTM` containers are present, consent must be initialized in each one

## 7. Verification Checklist

Always verify:

- `GTM` appears once in rendered HTML
- the Google tag appears once, or any auto-loaded behavior is understood
- `Consent Initialization` fires before business tags
- `Consent Overview` is enabled and usable
- `Tag Assistant` detects tags and expected events
- no duplicate `page_view` or conversion events occur
- no `AdSense` bootstrap or publisher code was accidentally duplicated or broken

Frontend verification checks:

- if you touched `TypoScript`, `Fluid`, or shared JS, verify the rendered page in `DDEV`
- if visible UI changed, follow the project's Playwright conventions (see any `AGENTS.md` or equivalent conventions file in the repo)
- preserve or extend the current test pattern that stubs `googletagmanager`

## 8. Completion Rules

General rules:

- do not claim a frontend-affecting tagging task is complete without rendered-page verification when verification is possible
- if a mounted plugin page URL is required for testing, request it before sign-off
- if the task also changes banner behavior or consent logic, finish the policy/legal side through `$google-cmp-adsense`
