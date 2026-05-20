---
name: google-adsense-search
description: Implement and optimize Google AdSense for Search (AFS) on websites, including AFS sign-up prerequisites, search style creation, code generation and placement, search ads parameter tuning, related search integration, Shopping ads, conditional styling, responsive design, performance monitoring, and AFS-specific policy compliance. Use when the user wants to add or troubleshoot AdSense for Search, configure AFS in the AdSense console, integrate AFS into a TYPO3 site, optimize search ad revenue, or produce exact step-by-step AFS setup instructions that stay aligned with privacy and compliance requirements.
---

# Google AdSense for Search (AFS)

## Overview

Use this skill to integrate AdSense for Search into a website, configure search styles and search ad parameters in the AdSense console, and give the user exact console-side and repo-side instructions for a working AFS implementation.

AdSense for Search is a separate product from AdSense for Content. AFS monetizes **search results pages** by showing Google Search and Shopping ads alongside user-initiated search queries. Publishers receive 51% of the revenue recognized by Google from AFS ad clicks. AFS can be used **in addition to** AdSense for Content to create an incremental revenue stream.

For display ad placement, Auto ads, manual ad units, ads.txt, blocking controls, experiments, or broader content-monetization decisions, pair this skill with [`../google-adsense/SKILL.md`](../google-adsense/SKILL.md). For consent banners, TCF/CMP requirements, Consent Mode v2, Privacy & messaging, or jurisdiction-specific cookie-law questions, pair this skill with [`../google-cmp-adsense/SKILL.md`](../google-cmp-adsense/SKILL.md). For GA4 property setup, event design, key events, or AdSense revenue reporting inside Analytics, pair this skill with [`../google-analytics/SKILL.md`](../google-analytics/SKILL.md). For GTM container architecture, Google tag governance, trigger/variable wiring, or preview/publish workflow, pair this skill with [`../google-tag-manager/SKILL.md`](../google-tag-manager/SKILL.md).

## Load These References As Needed

- Implementation details, code patterns, TYPO3 integration: [references/implementation-playbook.md](references/implementation-playbook.md)
- AdSense console steps, search style creation, and optimization: [references/console-and-optimization-checklist.md](references/console-and-optimization-checklist.md)
- Policy guardrails, privacy handoff, and troubleshooting: [references/policy-privacy-and-troubleshooting.md](references/policy-privacy-and-troubleshooting.md)
- Complementary content-ad monetization workflow: [`../google-adsense/SKILL.md`](../google-adsense/SKILL.md)
- Complementary CMP/privacy workflow: [`../google-cmp-adsense/SKILL.md`](../google-cmp-adsense/SKILL.md)
- Complementary GA4 workflow: [`../google-analytics/SKILL.md`](../google-analytics/SKILL.md)
- Complementary GTM workflow: [`../google-tag-manager/SKILL.md`](../google-tag-manager/SKILL.md)

## Trigger Examples

Use this skill for prompts like:

- "Add AdSense for Search to this site."
- "Set up AFS on our TYPO3 search results page."
- "Configure search ads and related search in AdSense."
- "Optimize our AFS revenue and fill rate."
- "Troubleshoot why AFS ads are not showing."
- "Integrate AFS with our existing consent management setup."
- "Add Shopping ads to our search results page."

## Workflow

### 1. Confirm The AFS Scope

Identify:

- whether the task is `initial setup`, `re-implementation`, `optimization`, or `troubleshooting`
- whether the user has an existing AdSense account with AFS access (AFS requires account manager approval)
- the live site URL and the specific search results page URL
- whether the site already has AdSense for Content, GA4, GTM, gtag.js, or a consent banner
- whether the site uses a custom site-search implementation or a third-party search engine
- whether the user wants Search ads only, Shopping ads too, or Related Search features
- whether the traffic includes EEA, UK, Switzerland, or regulated U.S. state traffic

If privacy or consent details are in scope, load [`../google-cmp-adsense/SKILL.md`](../google-cmp-adsense/SKILL.md) before finalizing architecture.

### 2. Verify AFS Access And Prerequisites

AFS is not self-service. Before implementation:

- confirm that the user's AdSense account has AFS access enabled by their Google account manager
- confirm the site is already added and approved under `AdSense > Sites`
- confirm the search results page exists and accepts a query parameter
- confirm `ads.txt` is published at the domain root

If AFS access is not yet enabled, the user must contact their AdSense account manager to request signup.

**Minimum performance criteria (effective August 20, 2025):** accounts must have exceeded 20 Search ad impressions in at least two of six preceding months to retain AFS access.

### 3. Choose The AFS Architecture

Default decision tree:

1. Create a dedicated search results page that accepts a `query` parameter.
2. Create a search style in the AdSense console with appropriate branding.
3. Enable Search ads; enable Shopping ads when the site content supports product-oriented queries.
4. Enable Related Search for search pages to increase query volume.
5. Consider Related Search for content pages to drive traffic from content pages to the search results page.
6. Use the `adtest: 'on'` parameter during development; remove before production.
7. Coordinate loading with the chosen consent architecture when the site requires prior consent.

### 4. Implement The Repo-Side Changes

Use the implementation playbook for exact patterns.

Typical code work:

- add the AFS head script (`afs.js`) once in the `<head>` of the search results page
- add the AFS body script with `pageOptions` and ad block configurations in the `<body>`
- create `<div>` containers with matching IDs for each ad block
- pass the user's search query to the `query` parameter dynamically
- set `pubId` to the publisher ID (without the `ca-` prefix in the parameter value)
- set `styleId` to the search style ID created in console
- reserve layout space for ad containers to prevent CLS
- do not modify the AFS code beyond setting the documented parameters

For a typical site package, start with:

- `packages/my-site-package/Configuration/Sets/MySitePackage/TypoScript/page.typoscript`
- the `PAGEVIEW` page templates under `packages/my-site-package/Resources/Private/Templates/Pages/`
- shared page/header partials under `packages/my-site-package/Resources/Private/Partials/Pages/`
- the search results Fluid template if one exists

If the implementation changes visible frontend output, rebuild frontend assets if needed, flush TYPO3 caches, and verify in DDEV.

### 5. Configure AdSense Console For Search

Use the console and optimization checklist reference and cover:

- `Ads for search > Search styles`: create or edit the search style
- Search style ad settings: number of ads, link targets, ad extensions
- Shopping ads settings and extensions (if applicable)
- Related search settings for search pages and content pages
- Code generator: generate the code, set container IDs, copy head and body snippets
- Custom channels for tracking (optional)

### 6. Optimize AFS Performance

Use the console and optimization checklist reference and cover:

- query refinement and Related Search configuration
- search style branding and color matching
- responsive width configuration for different viewports
- Shopping ads enablement for e-commerce-adjacent sites
- conditional styling for multiple search styles per page
- custom channels for granular performance tracking
- `adLoadedCallback` for handling empty ad responses gracefully

### 7. Hand Off Privacy And Legal Work Correctly

This skill should not improvise privacy architecture.

Switch to [`../google-cmp-adsense/SKILL.md`](../google-cmp-adsense/SKILL.md) when the task involves:

- Google-certified CMP requirements
- Privacy & messaging / Funding Choices
- IAB TCF or GPP
- Consent Mode v2
- personalized vs non-personalized / limited ads decisions
- banner fairness, lawful basis, or regulator-facing copy

Switch to [`../google-analytics/SKILL.md`](../google-analytics/SKILL.md) when the task involves:

- GA4 property or web-stream setup
- Google tag placement for measurement
- event taxonomy or key-event design
- debugging duplicate `page_view` or broken event collection
- AdSense or AFS revenue analysis inside GA4

Switch to [`../google-tag-manager/SKILL.md`](../google-tag-manager/SKILL.md) when the task involves:

- adding or repairing the GTM container itself
- creating the Google tag in GTM
- trigger, variable, or dataLayer architecture
- Consent Initialization, consent settings, or Tag Assistant workflow inside GTM

Use [references/policy-privacy-and-troubleshooting.md](references/policy-privacy-and-troubleshooting.md) to identify where the boundary sits.

### 8. Verify Before Sign-Off

Always verify:

- the AFS head script appears in the `<head>` of the search results page
- the AFS body script appears in the `<body>` and calls `_googCsa` correctly
- ad container `<div>` IDs match the `container` parameters in the code
- the `query` parameter receives the actual user search query dynamically
- the `pubId` matches the publisher's ID and the `styleId` matches the created style
- `adtest` is set to `'on'` during development and removed before production
- ads render in the expected container(s) when a search query is submitted
- no AFS code is placed on non-search-results pages (policy requirement)
- maximum two AFS search boxes exist per page (policy requirement)
- privacy-dependent behavior matches the chosen CMP / consent setup

If the user wants true production verification, ask for the live URL or the DDEV-mounted URL where the search results page exists.

### 9. Report Clearly

Separate the outcome into:

- repo/code changes completed
- AdSense console actions the user still must do
- GTM/container actions handled by `$google-tag-manager`
- Analytics / GA4 steps handled by `$google-analytics`
- privacy/CMP steps handled by `$google-cmp-adsense`
- content-ad monetization steps handled by `$google-adsense`
- open risks such as pending AFS access approval, low fill rate, or policy concerns

## Guardrails

- Never claim that AFS access approval, fill, RPM, or earnings are guaranteed.
- Never modify the AFS code beyond the documented parameters. Google explicitly prohibits code modification.
- Never pre-populate search boxes with terms or create links containing pre-populated search terms.
- Never place AFS ad units on non-search-results pages.
- Never incentivize users to perform searches or click on ads.
- Never frame AFS search results or remove/alter the Google logo.
- Never use `adtest: 'on'` in production; it generates no revenue.
- Re-check dated Google requirements before shipping time-sensitive compliance instructions.
- Maximum two AFS search boxes per page.
- Maximum one query per user request.
