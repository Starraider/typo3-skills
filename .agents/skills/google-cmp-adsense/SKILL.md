---
name: google-cmp-adsense
description: Implement Google's consent management platform for websites that use AdSense, Ad Manager, Google Ads, Google Analytics 4, or Google Tag Manager/gtag.js. Use when the user asks to set up Google CMP / Privacy & messaging / Funding Choices, configure Consent Mode v2, meet the Google-certified CMP + TCF requirement for EEA/UK/Switzerland traffic, or maximize Google ad revenue while staying privacy-compliant.
---

# Google CMP for AdSense

## Overview

This skill helps implement Google's own CMP for web publishers, align Google tags with Consent Mode v2, and produce exact console-side steps for AdSense, Ad Manager, GA4, Google Ads, and GTM/gtag.js.

Default stance:

- Maximize monetization only inside a legally defensible setup.
- Prefer Google's own CMP in `Privacy & messaging` unless the user explicitly wants a third-party certified CMP.
- Treat legal review as mandatory for banner design, legal basis, and jurisdiction-specific disclosures.
- Pair with [`../google-adsense/SKILL.md`](../google-adsense/SKILL.md) when the task also includes AdSense site approval, ad placement, Auto ads, ads.txt, blocking controls, experiments, or broader revenue optimization decisions.
- Pair with [`../google-analytics/SKILL.md`](../google-analytics/SKILL.md) when the task also includes `GA4` property setup, Google tag implementation, event design, key events, or AdSense revenue visibility inside Analytics.
- Pair with [`../google-tag-manager/SKILL.md`](../google-tag-manager/SKILL.md) when the site uses `GTM`, needs `Consent Initialization` or `GTM` consent APIs, or needs exact container-side instructions for Google tags.

## Load These References As Needed

- Policy dates, Google requirements, legal-risk notes: [references/google-requirements.md](references/google-requirements.md)
- Site implementation and code patterns: [references/implementation-playbook.md](references/implementation-playbook.md)
- Step-by-step account, tag, and legal checklists: [references/compliance-and-config-checklists.md](references/compliance-and-config-checklists.md)
- Complementary AdSense monetization workflow: [`../google-adsense/SKILL.md`](../google-adsense/SKILL.md)
- Complementary GA4 measurement workflow: [`../google-analytics/SKILL.md`](../google-analytics/SKILL.md)
- Complementary GTM workflow: [`../google-tag-manager/SKILL.md`](../google-tag-manager/SKILL.md)

## Trigger Examples

Use this skill for prompts like:

- "Implement Google's CMP on our site."
- "Set up Privacy & messaging for AdSense."
- "Wire Consent Mode v2 into GA4 and Google Ads."
- "Make our Google ads setup compliant in the EEA, UK, and Switzerland."
- "Use Google's CMP and keep ad revenue as high as possible without violating privacy rules."

## Workflow

### 1. Confirm Scope

Identify:

- Web only or web + app. This skill is web-first.
- Which Google products are live: `AdSense`, `Ad Manager`, `GA4`, `Google Ads`, `Floodlight`, `GTM`, `gtag.js`.
- Which regions matter. Default to `EEA + UK + Switzerland`; optionally review `US state` traffic.
- Whether the user wants Google's own CMP or a third-party certified CMP.

If the site page URL is needed for verification, request it before claiming the work is complete.

### 2. Choose The Consent Architecture

Default decision tree:

1. If the user wants Google's own CMP, use `Privacy & messaging`.
2. If the site serves personalized ads in the EEA, UK, or Switzerland, require a Google-certified CMP that integrates with the IAB TCF.
3. If Google tags are present, wire Consent Mode v2.
4. If the site uses GTM, use GTM consent APIs and hand the container-side work to [`../google-tag-manager/SKILL.md`](../google-tag-manager/SKILL.md).
5. If the site uses `gtag.js`, set consent defaults before any `config` or `event` command.

### 3. Audit The Current Site

Search the codebase for:

- `adsbygoogle`
- `googletagmanager`
- `gtag(`
- `G-`, `AW-`, `DC-`, `GT-`
- custom cookie banner code
- existing privacy or consent storage keys

Then locate the earliest shared include where consent defaults must run.

### 4. Configure Google Account-Side Settings

Use the checklist reference and configure:

- Ad serving mode: personalized vs non-personalized fallback
- Ad partners / ATP list
- privacy policy URL(s)
- purposes for the publisher's own use of data
- legitimate interest only when the user's legal team has approved it
- message publishing and site assignment

### 5. Implement Site-Side Tag Behavior

For `gtag.js`:

- Set default consent state before any measurement command.
- Update consent state immediately after user choice.
- Persist the user's choice and replay it on later pages.

For `GTM`:

- Fire consent defaults on `Consent Initialization - All Pages`.
- Use `setDefaultConsentState` and `updateConsentState`.
- Do not rely on queued `gtag('consent', ...)` calls inside GTM.

Choose `advanced` versus `basic` consent mode deliberately:

- Prefer `advanced` when the user wants better Google Ads / GA4 modeling and legal review accepts the approach.
- Prefer `basic` when the organization wants zero Google data flow before consent.

### 6. Verify Before Sign-Off

Always verify:

- the CMP appears on the correct page(s)
- the correct consent states are sent
- no non-essential cookies are written before consent in `basic` mode
- denied-state traffic stays cookieless in `advanced` mode
- vendor / ad partner disclosures match actual configuration
- revenue fallbacks exist for denied or uncertified traffic

Useful checks:

- `?fc=alwaysshow&fctype=gdpr` to preview the Google message
- Tag Assistant / DevTools network inspection
- consent cookie / storage inspection
- page-source review for tag order

If the repo UI changes and the page is reachable in DDEV, finish with Playwright verification per this repo's frontend rules.

### 7. Report Clearly

The final response should separate:

- code changes completed in the repo
- GTM/container steps handled by `$google-tag-manager`
- Analytics / `GA4` steps that belong to `$google-analytics`
- Google-console steps the user must perform
- AdSense monetization and placement steps that belong to `$google-adsense`
- legal-review decisions still open
- residual risks, especially around banner design or lawful basis

## Guardrails

- Never claim that Google certification equals full legal compliance.
- Never use dark patterns, pre-ticked choices, or default-on optional purposes.
- Treat `two-button` vs `three-button` banners as a compliance choice first and a revenue lever second.
- When Google documentation disagrees on `TCF v2.2` vs `TCF v2.3`, cite the date and verify the currently supported version before shipping.
- If child-directed or minor-sensitive inventory is involved, escalate because Google's CMP has scope limits for some U.S. child/minor fields.
