---
name: google-tag-manager
description: Implement Google Tag Manager on websites, including web-container installation, Google tag setup, consent-aware GTM architecture, triggers/variables/tags, preview and publish workflows, and exact Tag Manager UI instructions. Use when the agent needs to add or repair GTM, migrate from direct gtag.js to GTM, centralize Google tags, wire privacy-compliant GA4 or Google Ads tagging through GTM, compare client-side vs server-side tagging, or keep GTM aligned with GDPR, ePrivacy, UK, Swiss, and U.S. state privacy requirements.
---

# Google Tag Manager

## Overview

Use this skill to integrate or repair `GTM`, keep Google tagging centralized, and give the user exact `Tag Manager` instructions that stay compatible with privacy and consent requirements.

This skill owns:

- web-container installation
- `dataLayer` and trigger architecture
- Google tag setup inside `GTM`
- `GTM` consent APIs, consent settings, and preview/publish workflow
- client-side versus server-side tagging decisions

Pair it with:

- [`../google-cmp-adsense/SKILL.md`](../google-cmp-adsense/SKILL.md) for legal-risk framing, `Privacy & messaging`, `TCF` / `GPP`, banner fairness, and deeper `Consent Mode v2` compliance questions
- [`../google-analytics/SKILL.md`](../google-analytics/SKILL.md) for `GA4` property setup, event taxonomy, key events, and reporting decisions
- [`../google-adsense/SKILL.md`](../google-adsense/SKILL.md) for `AdSense` site approval, `ads.txt`, Auto ads, manual ad units, blocking controls, and monetization decisions

## Load These References As Needed

- Repo touchpoints, migration rules, and verification guidance: [references/implementation-playbook.md](references/implementation-playbook.md)
- Exact `GTM` console actions and publish workflow: [references/gtm-console-setup-checklist.md](references/gtm-console-setup-checklist.md)
- Legal guardrails, product boundaries, and handoff rules: [references/privacy-and-product-handoff.md](references/privacy-and-product-handoff.md)
- Complementary consent workflow: [`../google-cmp-adsense/SKILL.md`](../google-cmp-adsense/SKILL.md)
- Complementary `GA4` workflow: [`../google-analytics/SKILL.md`](../google-analytics/SKILL.md)
- Complementary `AdSense` workflow: [`../google-adsense/SKILL.md`](../google-adsense/SKILL.md)

## Trigger Examples

Use this skill for prompts like:

- "Add Google Tag Manager to this TYPO3 site."
- "Migrate our Google tags from direct gtag.js to GTM."
- "Set up GTM so GA4 and Google Ads run through one privacy-compliant container."
- "Wire consent mode correctly in Google Tag Manager."
- "Review our GTM container for duplicate Google tags and consent issues."
- "Should we stay client-side or move this tagging stack to server-side GTM?"

## Workflow

### 1. Confirm The Tagging Scope

Identify:

- whether the task is `initial setup`, `migration`, `repair`, `audit`, `consent hardening`, or `server-side evaluation`
- whether the site already uses `GTM`, direct `gtag.js`, `GA4`, `Google Ads`, `Floodlight`, `AdSense`, or a CMP
- whether `GTM` should manage only Google tags or a broader third-party tag stack
- which regions matter. Default to `EEA + UK + Switzerland` plus any regulated U.S. state traffic the user mentions
- whether the user needs exact `Tag Manager` console steps, repo-side implementation, or both

If a live page URL is needed for verification, request it before claiming completion.

### 2. Choose The Architecture Deliberately

Default decision tree:

1. If the site only needs simple `GA4` and no `GTM` exists, direct `gtag.js` may still be simpler. Use [`../google-analytics/SKILL.md`](../google-analytics/SKILL.md) unless the user explicitly wants `GTM`.
2. If multiple Google tags, repeated marketing changes, third-party tags, or CMS constraints exist, prefer `GTM`.
3. If `GTM` is in scope, keep it as the single source of truth for the Google tag and related event tags. Remove duplicate in-page Google tag code during migration unless a product-specific exception is documented.
4. If consent is in scope and `GTM` is in use, put consent defaults on `Consent Initialization - All Pages` and use `GTM` consent APIs, not queued `gtag('consent', ...)` calls inside the container.
5. Consider server-side tagging only when the user wants first-party routing, stricter data filtering, or performance improvements and can operate the required cloud infrastructure. Server-side tagging does not remove consent obligations.
6. Do not default to managing `AdSense` bootstrap or ad units through `GTM`. Use [`../google-adsense/SKILL.md`](../google-adsense/SKILL.md) for the publisher implementation path, and use this skill to keep `GTM`, the Google tag, and consent behavior from conflicting with it.

Use [references/privacy-and-product-handoff.md](references/privacy-and-product-handoff.md) when the legal or product boundary is unclear.

### 3. Audit The Current Site

Search the codebase for:

- `googletagmanager`
- `gtag(`
- `dataLayer`
- `googlefc`
- `adsbygoogle`
- `GTM-`
- `G-`
- `AW-`
- `DC-`
- `consent`
- `cookie`

Then identify:

- the earliest shared `<head>` include and `<body>` opening hook
- whether a direct Google tag or old `GTM` snippet already exists
- whether any Google or third-party tag fires before consent
- whether a CMP or custom banner is already present
- whether existing tests already stub Google requests

Use [references/implementation-playbook.md](references/implementation-playbook.md) for repo-specific touchpoints and migration patterns.

### 4. Implement The Repo-Side Changes

Install the `GTM` snippets once:

- first snippet as high in `<head>` as possible
- `noscript` snippet immediately after the opening `<body>`

Keep `dataLayer` initialization centralized and predictable. If the site already pushes custom events, prefer explicit `dataLayer.push({ event: '...' })` contracts over scattered inline tracking.

If migrating from direct `gtag.js`:

1. inventory the current destinations and settings
2. recreate the equivalent Google tag and event tags in `GTM`
3. move consent sequencing safely
4. preview and verify
5. remove old in-page Google tag code so events do not duplicate

### 5. Configure The GTM Container

Use [references/gtm-console-setup-checklist.md](references/gtm-console-setup-checklist.md).

At minimum:

- create or confirm the web container
- create or confirm the Google tag in `GTM`
- use `Initialization - All Pages` for the Google tag when the tag should load before other business tags
- enable `Consent Overview`
- configure consent checks for tags that need them
- create clear variables, triggers, and event names instead of relying on brittle DOM scraping

Important current behavior:

- containers with `Google Ads` or `Floodlight` tags can automatically load a Google tag first
- still review the container so tag settings and destinations are deliberate rather than accidental

### 6. Configure Consent And Product Integrations

For consent:

- fire defaults on `Consent Initialization - All Pages`
- use `setDefaultConsentState` and `updateConsentState`, or a trusted CMP template that uses those APIs
- map at minimum `ad_storage`, `ad_user_data`, `ad_personalization`, and `analytics_storage`
- use region-specific defaults when legal obligations differ by geography

For `GA4`:

- use this skill for container setup, triggers, and shared variables
- use [`../google-analytics/SKILL.md`](../google-analytics/SKILL.md) for property setup, event taxonomy, key-event design, and reporting

For `Google Ads` / `Floodlight`:

- keep only consent-aware tags
- use `Conversion Linker` deliberately
- enable user-provided data or enhanced conversions only with product and legal approval

For `AdSense`:

- keep site verification, `ads.txt`, Auto ads, manual units, and monetization tuning in [`../google-adsense/SKILL.md`](../google-adsense/SKILL.md)
- use this skill to prevent `GTM` and consent settings from conflicting with AdSense

For Google's CMP or integrated CMP partners:

- use [`../google-cmp-adsense/SKILL.md`](../google-cmp-adsense/SKILL.md) for `Privacy & messaging`, `TCF`, `GPP`, banner fairness, and legal-risk framing
- use this skill for the container-side wiring when that CMP integrates through `GTM`

### 7. Verify Before Sign-Off

Always verify:

- the `GTM` snippets appear once in rendered HTML
- the Google tag appears once, or that any auto-loaded Google tag behavior is expected
- `Consent Initialization` runs before other tags
- `Consent Overview` is enabled and coherent
- `Tag Assistant` shows the expected tags and events
- no non-essential cookies appear before consent in a `basic` setup
- consent updates work for accept, reject, and granular choices
- no duplicate `page_view` or conversion events exist

Additional frontend checks:

- if you touched `TypoScript`, `Fluid`, or shared JS, verify in `DDEV`
- if visible frontend changed, follow the project's Playwright conventions (see any `AGENTS.md` or equivalent conventions file in the repo)
- existing tests already stub `googletagmanager`, so preserve or extend that pattern when relevant

### 8. Report Clearly

Separate the outcome into:

- repo changes completed
- exact `GTM` console actions the user still must perform
- consent and legal items handled by `$google-cmp-adsense`
- `GA4` items handled by `$google-analytics`
- `AdSense` items handled by `$google-adsense`
- remaining risks such as duplicate tags, unresolved legal review, or missing live-page verification

## Guardrails

- Never say that `GTM`, Google documentation, or Google certification alone guarantees legal compliance.
- Never use `GTM` as a reason to bypass consent or hide tag behavior.
- Never rely on queued `gtag('consent', ...)` calls inside `GTM` instead of the `Tag Manager` consent APIs.
- Never leave duplicate Google tag or `GTM` installs in place after a migration without an explicit reason.
- Never default to loading `AdSense` through `GTM` when the product-specific docs and site integration path point to direct page integration instead.
- Re-check dated Google UI labels, Help pages, and consent requirements before shipping time-sensitive instructions.
