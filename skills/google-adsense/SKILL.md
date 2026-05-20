---
name: google-adsense
description: Implement and optimize Google AdSense on websites, including site approval, AdSense code placement, Auto ads, manual ad units, ads.txt, GA4 linking, blocking controls, experiments, and publisher-policy-safe monetization. Use when the user wants to add or troubleshoot AdSense, prepare a site for AdSense review, configure the AdSense UI for stronger revenue, or produce exact step-by-step AdSense setup instructions that stay aligned with privacy and compliance requirements.
---

# Google AdSense

## Overview

Use this skill to integrate AdSense into a website, configure the AdSense account for strong revenue, and give the user exact console-side instructions for the parts Codex cannot do inside the repo.

For consent banners, TCF/CMP requirements, Consent Mode v2, Privacy & messaging, or jurisdiction-specific cookie-law questions, pair this skill with [`../google-cmp-adsense/SKILL.md`](../google-cmp-adsense/SKILL.md). For `GA4` property setup, event design, key events, or AdSense revenue reporting inside Analytics, pair this skill with [`../google-analytics/SKILL.md`](../google-analytics/SKILL.md). For `GTM` container architecture, Google tag governance, trigger/variable wiring, or preview/publish workflow, pair this skill with [`../google-tag-manager/SKILL.md`](../google-tag-manager/SKILL.md). This skill owns monetization and placement decisions; `$google-cmp-adsense` owns the deeper privacy implementation and legal-risk workflow; `$google-analytics` owns the deeper measurement and reporting workflow; `$google-tag-manager` owns the deeper `GTM` container workflow.

## Load These References As Needed

- Implementation details, code patterns, repo touchpoints: [references/implementation-playbook.md](references/implementation-playbook.md)
- AdSense UI steps and revenue tuning decisions: [references/account-and-revenue-checklist.md](references/account-and-revenue-checklist.md)
- Policy guardrails and privacy handoff: [references/policy-and-privacy-handoff.md](references/policy-and-privacy-handoff.md)
- Complementary GA4 workflow: [`../google-analytics/SKILL.md`](../google-analytics/SKILL.md)
- Complementary GTM workflow: [`../google-tag-manager/SKILL.md`](../google-tag-manager/SKILL.md)

## Trigger Examples

Use this skill for prompts like:

- "Add Google AdSense to this TYPO3 site."
- "Prepare this website for AdSense approval."
- "Set up Auto ads and tell me exactly what to change in AdSense."
- "Improve AdSense revenue without wrecking UX."
- "Review our ad placements, blocking controls, and experiments."
- "Wire AdSense into the site and keep it privacy-compliant."

## Workflow

### 1. Confirm The Monetization Scope

Identify:

- whether the task is `initial setup`, `re-implementation`, `optimization`, or `troubleshooting`
- whether the user wants `Auto ads`, `manual ad units`, or `both`
- the live site URL and any page URLs that should or should not show ads
- whether the site already has `GA4`, `GTM`, `gtag.js`, or a consent banner
- whether the traffic includes `EEA`, `UK`, `Switzerland`, or regulated U.S. state traffic

If privacy or consent details are in scope, load [`../google-cmp-adsense/SKILL.md`](../google-cmp-adsense/SKILL.md) before finalizing architecture.

### 2. Audit The Site And The AdSense Prerequisites

Check both code and account readiness:

- search the codebase for `adsbygoogle`, `googlesyndication`, `google-adsense-account`, `gtag(`, `googletagmanager`, `googlefc`, and existing consent logic
- confirm whether the site has already been added under `AdSense > Sites`
- confirm how the site will be verified: `AdSense code`, `ads.txt`, or `meta tag`
- confirm whether `ads.txt` already exists at the domain root
- confirm that the site has enough original content and a stable UX to survive site review

Do not promise approval. Google reviews ownership and policy readiness, and can take days or longer.

### 3. Choose The Monetization Architecture

Default decision tree:

1. Start with `Auto ads` for the fastest, broadest baseline.
2. Add `manual ad units` only where the layout or business intent clearly benefits from fixed placements.
3. Use `responsive` or size-optimized units by default; use fixed-size units only when the layout reserves that space cleanly.
4. Keep `ads.txt` in place even if the site verifies by script or meta tag.
5. Link `GA4` if the user wants page-level monetization analysis, and use `$google-analytics` for the detailed property, event, and reporting workflow.
6. Use blocking controls sparingly; over-blocking usually harms competition and revenue.
7. Use `Ad review center`, `Optimization tips`, and `experiments` before making sweeping manual changes.
8. If the user wants `GTM` to manage Google tags or keep tagging centralized, use [`../google-tag-manager/SKILL.md`](../google-tag-manager/SKILL.md) for the container architecture. Do not default to moving the AdSense bootstrap or ad units into `GTM`.

### 4. Implement The Repo-Side Changes

Use the implementation playbook for exact patterns.

Typical code work:

- add the site verification snippet or meta tag in the shared head include
- add the AdSense bootstrap script once per page where ads can run
- add manual ad slots only in layout-safe containers inside the page body
- keep `ads.txt` present at the site root
- avoid duplicate script loads and duplicate `push({})` calls
- coordinate tag loading with the consent architecture when the site requires prior consent

For a typical site package, start with:

- `packages/my-site-package/Configuration/Sets/MySitePackage/TypoScript/page.typoscript`
- the `PAGEVIEW` page templates under `packages/my-site-package/Resources/Private/Templates/Pages/`
- shared page/header partials under `packages/my-site-package/Resources/Private/Partials/Pages/`

If the implementation changes visible frontend output, rebuild frontend assets if needed, flush TYPO3 caches, and verify in DDEV.

### 5. Configure AdSense For Revenue And Control

Use the AdSense UI checklist reference and cover:

- `Sites`: add, verify, request review
- `Ads`: turn on Auto ads or create manual units
- `Fine-tune your ads`: set density deliberately instead of guessing
- `Blocking controls`: block only when there is a real brand-safety or inventory reason
- `Ad review center`: review or block specific creatives only when needed
- `Optimization`: use Optimization tips and experiments
- `Analytics`: link GA4 for publisher reporting when helpful

### 6. Hand Off Privacy And Legal Work Correctly

This skill should not improvise privacy architecture.

Switch to [`../google-cmp-adsense/SKILL.md`](../google-cmp-adsense/SKILL.md) when the task involves:

- Google-certified CMP requirements
- Privacy & messaging / Funding Choices
- IAB TCF or GPP
- Consent Mode v2
- personalized vs non-personalized / limited ads decisions
- banner fairness, lawful basis, or regulator-facing copy

Switch to [`../google-analytics/SKILL.md`](../google-analytics/SKILL.md) when the task involves:

- `GA4` property or web-stream setup
- Google tag placement for measurement
- event taxonomy or key-event design
- debugging duplicate `page_view` or broken event collection
- AdSense revenue analysis inside `GA4`

Switch to [`../google-tag-manager/SKILL.md`](../google-tag-manager/SKILL.md) when the task involves:

- adding or repairing the `GTM` container itself
- creating the Google tag in `GTM`
- trigger, variable, or `dataLayer` architecture
- `Consent Initialization`, consent settings, or `Tag Assistant` workflow inside `GTM`
- deciding between client-side and server-side tagging

Use [references/policy-and-privacy-handoff.md](references/policy-and-privacy-handoff.md) to identify where the boundary sits.

### 7. Verify Before Sign-Off

Always verify:

- the site can be crawled and the verification method is live
- the AdSense script appears only where intended
- manual units sit inside the `<body>` and have stable layout space
- `ads.txt` is reachable at `/ads.txt`
- Auto ads preview or page HTML matches the intended scope
- there are no placements that invite accidental clicks or bury content under ads
- privacy-dependent behavior matches the chosen CMP / consent setup

If the user wants true production verification, ask for the live URL or the DDEV-mounted URL where the monetized page exists.

### 8. Report Clearly

Separate the outcome into:

- repo/code changes completed
- AdSense console actions the user still must do
- GTM/container actions handled by `$google-tag-manager`
- Analytics / `GA4` steps handled by `$google-analytics`
- privacy/CMP steps handled by `$google-cmp-adsense`
- open risks such as pending site review, unresolved policy questions, or missing legal sign-off

## Guardrails

- Never claim that AdSense approval, fill, RPM, or earnings are guaranteed.
- Never optimize by inducing accidental clicks, disguising ads as navigation, or overwhelming content with ads.
- Never treat Google's policy approval or CMP certification as full legal clearance.
- Never overfit to one metric such as immediate RPM while ignoring UX, crawlability, or policy risk.
- Re-check dated Google requirements before shipping time-sensitive compliance instructions.
