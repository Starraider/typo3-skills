---
name: google-adsense-search
description: "Use when adding AdSense for Search (AFS) to a site, configuring AFS in the AdSense console, integrating AFS into TYPO3, optimizing search ad revenue, or troubleshooting AFS. Covers AFS sign-up prerequisites, search styles, code placement, parameter tuning, Related Search, Shopping ads, responsive design, and policy compliance."
---

# Google AdSense for Search (AFS)

## Overview

Integrate AdSense for Search to monetize search results pages with Google Search and Shopping ads. AFS works alongside AdSense for Content for incremental revenue.

Pair with:
- [`../google-adsense/SKILL.md`](../google-adsense/SKILL.md) for display ads
- [`../google-cmp-adsense/SKILL.md`](../google-cmp-adsense/SKILL.md) for consent/privacy
- [`../google-analytics/SKILL.md`](../google-analytics/SKILL.md) for GA4 integration
- [`../google-tag-manager/SKILL.md`](../google-tag-manager/SKILL.md) for GTM setup

## Load References

- Implementation patterns: [references/implementation-playbook.md](references/implementation-playbook.md)
- Console setup: [references/console-and-optimization-checklist.md](references/console-and-optimization-checklist.md)
- Policy/troubleshooting: [references/policy-privacy-and-troubleshooting.md](references/policy-privacy-and-troubleshooting.md)

## Trigger Examples

- "Add AdSense for Search to this site."
- "Set up AFS on our TYPO3 search results page."
- "Configure search ads in AdSense."
- "Optimize our AFS revenue and fill rate."

## Workflow

### 1. Confirm AFS Scope

Identify: initial setup/re-implementation/optimization/troubleshooting, existing AdSense account with AFS access, site URL, existing analytics/consent setup, and traffic jurisdiction.

AFS requires account manager approval—user must contact Google if not enabled.

### 2. Architecture Steps

1. Create dedicated search results page with `query` parameter
2. Create search style in AdSense console
3. Enable Search ads (Shopping ads for e-commerce)
4. Use `adtest: 'on'` in development only
5. Coordinate with consent architecture if needed

### 3. Repo-Side Implementation

- Add AFS head script (`afs.js`) in `<head>` of search results page
- Add body script with `pageOptions` and ad block configs
- Create `<div>` containers with matching IDs
- Pass search query to `query` parameter dynamically
- Set `pubId` (without `ca-` prefix) and `styleId`

For TYPO3: start with `page.typoscript` and Fluid templates.

### 4. Console Configuration

- `Ads for search > Search styles`: create/edit style
- Ad settings: number of ads, link targets, extensions
- Shopping ads settings (if applicable)
- Related Search for search and content pages
- Custom channels for tracking

### 5. Verify Before Sign-Off

- AFS head script in `<head>` of search results page
- Body script calls `_googCsa` correctly
- Container IDs match `container` parameters
- `query` parameter receives actual search query
- `adtest` removed before production
- Ads render on submitted search queries
- No AFS on non-search-results pages
- Max two AFS search boxes per page

## Guardrails

- Never modify AFS code beyond documented parameters
- Never pre-populate search boxes or links with search terms
- Never place AFS on non-search-results pages
- Never use `adtest: 'on'` in production
- Max two AFS search boxes per page, one query per request
