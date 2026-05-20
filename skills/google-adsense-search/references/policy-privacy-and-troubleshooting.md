# Policy, Privacy, And Troubleshooting

## Scope

Use this file when we need the policy guardrails for AFS work, the privacy handoff boundaries, or troubleshooting guidance for common AFS issues.

## Official Sources Reviewed

Reviewed on `2026-04-18`:

- Google AdSense Help, "AdSense for Search (AFS) policies"
  - https://support.google.com/adsense/answer/1354757
- Google AdSense Help, "AdSense for Search Product-Integrated Feature policies"
  - https://support.google.com/adsense/answer/14638581
- Google AdSense Help, "Search ads policies"
  - https://support.google.com/adsense/answer/7003954
- Google AdSense Help, "Google Search ads policy: Alternative Search Queries"
  - https://support.google.com/adsense/answer/9467389
- Google AdSense Help, "AdSense for Search Restricted Access Features (RAFs)"
  - https://support.google.com/adsense/answer/16262554
- Google AdSense Help, "Policy violations in scope for Restricted Access Features (RAFs)"
  - https://support.google.com/adsense/answer/16269587
- Google AdSense Help, "AdSense Program policies"
  - https://support.google.com/adsense/answer/48182
- Google AdSense Help, "Google consent management requirements for serving ads in the EEA, the UK, and Switzerland"
  - https://support.google.com/adsense/answer/13554116
- Google AdSense Help, "AdSense for Search and other Search Ads products to use new serving domains and deprecate ad personalization"
  - https://support.google.com/adsense/answer/14201307

## 1. AFS-Specific Policy Rules

These are **hard policy limits** specific to AFS:

### Query Modification

- Queries must originate from **clear user search intent** from one of three sources:
  1. A search query **entered and submitted directly by a user** into a search box, without editing, modification, or filtering.
  2. An AFS **Product-Integrated Feature** (compliant with Google's PIF policies).
  3. An **Alternative Search Query** on search-ads-enabled sites (compliant with Google's ASQ policies).
- Search boxes may **not** be pre-populated with search terms.
- Publishers may **not** create links containing pre-populated search terms.

### Code Modification

- Publishers are **not permitted** to modify the AFS code in any manner.
- Publishers may **not**:
  - Frame AFS search results
  - Remove or alter the Google logo

### Placement Limits

- Maximum **two** AFS search boxes per page.
- AFS ad units may **only** be placed on **search results pages**.
- AFS code may **not** be integrated into software applications, toolbars, or browser extensions.

### Content And Usage

- Copyrighted content or content violating site content guidelines should not be the focus of searchable content.
- You may **not** compensate users for viewing ads or performing searches.
- Maximum **one query per user request**.
- Annual query limit: **5 billion queries** per account (August 1 – July 31).

### Coexistence With Other Ads

- An AFS search box **can** be placed on pages already showing AdSense for Content ads.
- Additional Google-provided ads (text, image, video) should **not** be placed on pages with **framed** search results.
- Link units and additional AFS search boxes are allowed alongside framed results.

## 2. Performance Threshold (Effective August 20, 2025)

- Accounts must exceed **20 Search ad impressions** in at least **two of the six months** preceding the evaluation date.
- Failure to meet this threshold results in loss of AFS access.
- Publishers can re-apply at any time through their account manager.

## 3. Privacy And Consent

### Personalized Ads Deprecation

Google is deprecating ad personalization for AFS and other Search Ads products (see answer/14201307). AFS is transitioning to new serving domains. Key implications:

- The `personalizedAds` parameter is being deprecated.
- AFS will increasingly serve non-personalized ads by default.
- This reduces some consent complexity but does not eliminate it entirely.

### Consent Requirements For EEA/UK/Switzerland

Even with reduced personalization, AFS still requires:

- A Google-certified CMP if serving personalized ads to EEA/UK/Switzerland traffic.
- Consent Mode v2 integration with Google tags when applicable.
- Compliance with the EU user consent policy.

### GDPR/CCPA Considerations

- **GDPR**: If any user data processing occurs (even for analytics alongside AFS), consent must be obtained.
- **CCPA**: Provide a "Do Not Sell My Personal Information" link if applicable.
- **Children (COPPA)**: AFS has no specific child-directed exception. If the site targets children, consult legal counsel.

### CMP Integration Pattern

When consent gating AFS:

1. Load the CMP before any AFS scripts.
2. Do not load `ads.js` until consent is granted (for strict prior-consent models).
3. For advanced Consent Mode, set `ad_storage` and `ad_user_data` defaults before loading AFS.
4. Use `$google-cmp-adsense` for the full implementation.

## 4. When To Hand Off To Sibling Skills

### Hand off to `$google-cmp-adsense` when:

- Google-certified CMP requirements
- Privacy & messaging / European regulations messages
- TCF or GPP strings
- Personalized vs non-personalized / limited ads fallback decisions
- Consent Mode v2 for `ad_storage`, `ad_user_data`, or `ad_personalization`
- Legal evaluation of banner fairness, lawful basis, or jurisdiction-specific disclosures

### Hand off to `$google-adsense` when:

- Content-ad placement (Auto ads, manual units)
- Site verification choices
- ads.txt management
- GA4 linking for content-ad monetization analysis
- Blocking controls, Ad review center, and experiments for content ads

### Hand off to `$google-analytics` when:

- GA4 property or web-stream setup
- Google tag placement for measurement
- Event taxonomy or key-event design
- AFS revenue analysis inside GA4

### Hand off to `$google-tag-manager` when:

- Adding or repairing the GTM container
- Creating the Google tag in GTM
- Trigger, variable, or dataLayer architecture
- Consent Initialization or Tag Assistant workflow inside GTM

## 5. Troubleshooting Guide

### Ads Not Showing

| Symptom | Possible Cause | Resolution |
|---------|---------------|------------|
| No ads appear at all | AFS access not enabled | Contact account manager to verify AFS access |
| No ads for specific queries | Low ad inventory for the query | Normal behavior — not all queries have ads |
| `adtest: 'on'` shows "test ad" overlay | Site not approved in Sites page | Approve site in `AdSense > Sites` |
| Container div not found | Mismatched container ID | Verify `<div>` ID matches `container` parameter |
| Script 404 error | Wrong script URL | Use `https://www.google.com/adsense/search/ads.js` |
| `_googCsa is not defined` | Head script not loaded | Ensure `ads.js` is in `<head>` and loads before body script |

### Low Fill Rate

| Symptom | Possible Cause | Resolution |
|---------|---------------|------------|
| Many empty responses | Generic or very short queries | Improve search UX to encourage specific queries |
| Low fill on certain topics | Limited advertiser demand | Normal — some niches have less search ad inventory |
| Fill drops suddenly | Policy violation or account issue | Check AdSense notifications and Policy center |

### Layout Shift (CLS)

| Symptom | Possible Cause | Resolution |
|---------|---------------|------------|
| Page jumps when ads load | No reserved space for container | Add `min-height` to ad container CSS |
| Content shifts down | Container collapses when empty | Use `adLoadedCallback` to hide empty containers |

### Console Errors

| Error | Cause | Resolution |
|-------|-------|------------|
| `_googCsa is not defined` | Script not loaded or blocked | Check network tab for `ads.js` load status |
| `Uncaught TypeError` | Missing required parameters | Verify `pubId`, `query`, `container` are all set |
| CSP error | Content Security Policy blocking | Add `www.google.com` and `googlesyndication.com` to CSP |

### Policy Violations

| Violation | Description | Resolution |
|-----------|-------------|------------|
| Query modification | Pre-populated or auto-generated queries | Only use authentic user-typed queries |
| Code modification | Changed AFS output or framed results | Remove all modifications to AFS code |
| Placement violation | AFS on non-search-results pages | Move AFS code to dedicated search results page only |
| Incentivized searches | Paying or rewarding users for searching | Remove all search incentives immediately |
| Too many search boxes | More than 2 per page | Reduce to maximum 2 search boxes |

### Domain Verification Problems

| Symptom | Possible Cause | Resolution |
|---------|---------------|------------|
| Site not verified | Verification method not deployed | Add meta tag, AdSense code, or ads.txt |
| ads.txt not found | File not at domain root | Ensure `/ads.txt` is publicly accessible |
| Review pending for weeks | Google review backlog | Wait; do not resubmit repeatedly |

## 6. Practical Boundary Between AFS And Content Ad Skills

`$google-adsense-search` owns:

- AFS access and signup guidance
- Search style creation and editing
- AFS code generation and placement
- Search ads, Shopping ads, and Related Search configuration
- AFS parameter tuning and optimization
- AFS-specific policy compliance
- AFS-specific troubleshooting

`$google-adsense` owns:

- AdSense for Content site verification and setup
- Auto ads and manual display ad units
- ads.txt management
- Blocking controls and Ad review center
- Content-ad format selection and density tuning
- GA4 linking for content-ad analysis
- Display ad policy compliance

Use both skills together when the user wants both content ads and search ads.

## 7. Final-Answer Requirements For Mixed Tasks

If both AFS and content ads, or AFS and privacy, are in scope, the final answer should clearly separate:

- code changes completed in the repo
- AFS console steps the user must perform
- content-ad console steps from `$google-adsense`
- CMP / privacy console steps from `$google-cmp-adsense`
- GA4 measurement steps from `$google-analytics`
- GTM container steps from `$google-tag-manager`
- legal sign-off items still open
- residual policy risks
