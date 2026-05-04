---
name: google-analytics
description: Implement Google Analytics 4 on websites, configure privacy-compliant Google tag or GTM measurement, define GA4 events and key events, link AdSense revenue reporting, and provide exact Google Analytics UI steps. Use when the user wants to add or troubleshoot GA4, wire analytics into a website, track registrations/newsletter/lead goals, connect AdSense reporting, or keep Analytics aligned with consent/CMP requirements and data-protection law.
---

# Google Analytics

## Overview

Use this skill to add or repair `GA4`, define a clean event taxonomy, and give the user exact Google Analytics, Google tag, and reporting steps that stay inside a privacy-first implementation.

Pair it with [`../google-cmp-adsense/SKILL.md`](../google-cmp-adsense/SKILL.md) when consent architecture, `Consent Mode v2`, banner fairness, `TCF`, or legal-risk framing are in scope. Pair it with [`../google-adsense/SKILL.md`](../google-adsense/SKILL.md) when the task also includes `AdSense` approval, ad placement, Auto ads, manual units, or monetization optimization. Pair it with [`../google-tag-manager/SKILL.md`](../google-tag-manager/SKILL.md) when the site uses `GTM`, needs a Google tag inside `GTM`, or needs trigger/variable/container guidance instead of direct `gtag.js`.

## Load These References As Needed

- Repo touchpoints, tag patterns, and verification rules: [references/implementation-playbook.md](references/implementation-playbook.md)
- Exact GA4 and AdSense console steps: [references/account-and-measurement-checklist.md](references/account-and-measurement-checklist.md)
- Recommended event selection and key-event mapping: [references/event-and-key-event-mapping.md](references/event-and-key-event-mapping.md)
- Privacy, consent, and legal handoff boundaries: [references/privacy-and-legal-handoff.md](references/privacy-and-legal-handoff.md)
- Complementary consent workflow: [`../google-cmp-adsense/SKILL.md`](../google-cmp-adsense/SKILL.md)
- Complementary AdSense workflow: [`../google-adsense/SKILL.md`](../google-adsense/SKILL.md)
- Complementary GTM workflow: [`../google-tag-manager/SKILL.md`](../google-tag-manager/SKILL.md)

## Trigger Examples

Use this skill for prompts like:

- "Add Google Analytics to this TYPO3 site."
- "Set up GA4 and tell me exactly what to click in Analytics."
- "Track shopper registrations, store-owner applications, and newsletter signups."
- "Link AdSense revenue to GA4."
- "Fix our duplicate page views or broken GA4 events."
- "Make our analytics privacy-compliant."

## Workflow

### 1. Confirm The Measurement Scope

Identify:

- whether the task is `initial setup`, `repair`, `migration`, `event design`, `reporting`, or `privacy hardening`
- whether the site already uses `gtag.js`, `GTM`, `AdSense`, `Google Ads`, or a CMP
- which journeys matter most: `shopper sign-up`, `store owner registration`, `newsletter`, `search`, `login`, `AdSense revenue`
- which regions matter. Default to `EEA + UK + Switzerland` plus any regulated U.S. state traffic the user mentions
- whether the user wants `basic` or `advanced` consent behavior

If the page URL is needed for verification, request it before claiming the work is complete.

### 2. Choose The Tag And Consent Architecture

Default decision tree:

1. Prefer direct `gtag.js` unless `GTM` is already in place or the user explicitly wants GTM. If `GTM` is in scope, hand the container work to [`../google-tag-manager/SKILL.md`](../google-tag-manager/SKILL.md).
2. Prefer `basic` consent mode by default for the legally safer baseline.
3. Use `advanced` consent mode only when the user wants modeled measurement and legal review accepts denied-state cookieless pings.
4. Keep reusable analytics settings in a theme Site Set, not inside the site-specific `config/sites/<site-id>/` directory.
5. If the consent architecture is unclear, load [`../google-cmp-adsense/SKILL.md`](../google-cmp-adsense/SKILL.md) before finalizing implementation.

### 3. Audit The Site And The Privacy Baseline

Search the codebase for:

- `gtag(`
- `googletagmanager`
- `google-analytics`
- `G-`
- `googlefc`
- `consent`
- `cookie`
- `adsbygoogle`

Then identify:

- the earliest shared include where Analytics can load once
- whether any Google tag already fires before consent
- whether a legacy banner or home-grown consent flag exists
- whether current forms already expose reliable success states for event tracking

### 4. Configure The GA4 Property, Stream, And Reports

Use [references/account-and-measurement-checklist.md](references/account-and-measurement-checklist.md) for the exact steps in Analytics and AdSense.

At minimum:

- create or confirm the `GA4` property and `Web` data stream
- install the Google tag or confirm the existing tag architecture
- decide how much `Enhanced Measurement` should stay enabled
- create or mark the business-success events as `key events`
- link `AdSense` if the user wants publisher revenue inside `GA4`
- document any settings the user must click manually in Google UIs

### 5. Implement The Repo-Side Changes

Follow [references/implementation-playbook.md](references/implementation-playbook.md).

For a typical site package, start with:

- `packages/my-site-package/Configuration/Sets/MySitePackage/settings.definitions.yaml`
- `packages/my-site-package/Configuration/Sets/MySitePackage/settings.yaml`
- `packages/my-site-package/Resources/Private/Layouts/Pages/Default.fluid.html`
- `packages/my-site-package/Configuration/Sets/MySitePackage/TypoScript/page.typoscript`
- `packages/my-site-package/Resources/Public/JavaScript/main.js`
- the relevant form templates under `packages/my-site-package/Resources/Private/Templates/`

Keep the implementation simple:

- initialize Analytics once
- avoid duplicate `page_view` and duplicate success events
- trigger conversions on real success states, not on button clicks
- keep event parameters low-cardinality and free of personal data

If `GTM` is the chosen architecture, this skill still owns the event taxonomy and `GA4` outcome mapping, but the container-side Google tag, triggers, and consent settings should be implemented through [`../google-tag-manager/SKILL.md`](../google-tag-manager/SKILL.md).

### 6. Map Business Targets To GA4 Events

Use [references/event-and-key-event-mapping.md](references/event-and-key-event-mapping.md).

Default mapping:

- shopper registration success: `sign_up`
- store owner application submitted: `generate_lead`
- store owner fully approved later in the workflow: `close_convert_lead` or a second-stage server-side event only if that lifecycle really exists
- newsletter subscription success: `generate_lead`
- login success: `login`
- AdSense revenue: use the product link between `AdSense` and `GA4`, not custom web ad-impression events

### 7. Verify Before Sign-Off

Always verify:

- the tag loads only as intended
- consent gating matches the chosen privacy architecture
- `Realtime` and `DebugView` show the expected events
- no event fires twice
- form failures do not count as conversions
- AdSense revenue reports appear in the expected `GA4` area after linking

For frontend and e2e checks:

- if the change affects visible frontend behavior, follow the project's DDEV and Playwright conventions (see any `AGENTS.md` or equivalent conventions file in the repo)
- when Playwright page-level tests would be polluted by analytics requests, stub `googletagmanager` and `google-analytics` the same way existing tests do

### 8. Report Clearly

Separate the outcome into:

- repo changes completed
- Google Analytics steps the user still must do
- GTM/container steps handled by `$google-tag-manager`
- CMP/privacy steps handled by `$google-cmp-adsense`
- AdSense setup or monetization steps handled by `$google-adsense`
- legal sign-off items and remaining risks

## Guardrails

- Never claim that a Google-recommended setup automatically satisfies all legal requirements.
- Never send `PII` or sensitive data to `GA4`.
- Never track a conversion on a click when the real business outcome happens later on success.
- Never invent a web `ad_impression` event for AdSense revenue tracking.
- Never mark both a recommended event and a parallel custom alias as key events for the same business action without a deliberate reason.
- Re-check dated Google UI labels, policy pages, and consent requirements before shipping time-sensitive instructions.
