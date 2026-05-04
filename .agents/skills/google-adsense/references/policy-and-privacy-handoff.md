# Policy And Privacy Handoff

## Scope

Use this file when we need the policy guardrails for AdSense work or needs to decide when to hand off to `$google-cmp-adsense`.

## Official Sources Reviewed

Reviewed on `2026-04-11`:

- Google AdSense Help, "AdSense Program policies"
  - https://support.google.com/adsense/answer/48182
- Google Publisher Policies Help, "Overview of Google Publisher Policies and Restrictions"
  - https://support.google.com/publisherpolicies/answer/10400453
- Google AdSense Help, "Top invalid traffic and policy violations that lead to account closure"
  - https://support.google.com/adsense/answer/2660562
- Google AdSense Help, "Add a new site to your AdSense sites list"
  - https://support.google.com/adsense/answer/12169212
- Google AdSense Help, "Google consent management requirements for serving ads in the EEA, the UK, and Switzerland (for publishers)"
  - https://support.google.com/adsense/answer/13554116
- Google AdSense Help, "Comply with the EU user consent policy"
  - https://support.google.com/adsense/answer/7670013

For the deeper CMP, Consent Mode v2, and legal-review workflow, also read:

- [`../google-cmp-adsense/SKILL.md`](../google-cmp-adsense/SKILL.md)
- [`../google-cmp-adsense/references/google-requirements.md`](../google-cmp-adsense/references/google-requirements.md)
- [`../google-cmp-adsense/references/compliance-and-config-checklists.md`](../google-cmp-adsense/references/compliance-and-config-checklists.md)

## 1. Policy Baseline

Treat these as hard limits:

- no deceptive ad placement
- no encouraging users to click ads
- no disguising ads as navigation or content controls
- no layouts where ads overwhelm the actual content value
- no traffic manipulation or invalid traffic sources

Google can limit ad serving or close the account when policy or invalid-traffic issues are serious enough.

## 2. Site Review Reality

Google's current site-add flow says new sites are checked for:

- domain ownership or ability to modify site content
- AdSense Program policy readiness
- Google Publisher policy readiness

Do not frame site review as automatic or guaranteed.

## 3. Revenue Work Must Stay Inside Policy

Allowed:

- using Auto ads
- using multiple ad units on pages with enough content
- testing density, spacing, and placements
- using experiments and optimization tips

Not allowed:

- optimizing for accidental clicks
- burying content beneath ad-heavy layouts
- buying or manufacturing invalid traffic
- hiding the reject path on privacy banners

## 4. When To Hand Off To $google-cmp-adsense

Switch skills when the task involves any of these:

- EEA / UK / Switzerland traffic
- Google-certified CMP requirements
- Privacy & messaging / European regulations messages
- TCF or GPP strings
- personalized vs non-personalized / limited ads fallback decisions
- Consent Mode v2 for `ad_storage`, `ad_user_data`, or `ad_personalization`
- legal evaluation of banner fairness, lawful basis, or jurisdiction-specific disclosures

## 5. Practical Boundary Between The Two Skills

`$google-adsense` owns:

- site verification choices
- AdSense code placement
- Auto ads vs manual units
- ads.txt
- GA4 linking for monetization analysis
- blocking controls, Ad review center, and experiments

`$google-cmp-adsense` owns:

- CMP selection
- Privacy & messaging configuration
- Consent Mode v2 implementation details
- TCF / GPP implications
- legal-risk framing for cookie banners and data uses

Use both skills together when the user wants monetization and privacy done in one pass.

## 6. Final-Answer Requirements For Mixed Tasks

If both monetization and privacy are in scope, the final answer should clearly separate:

- code changes completed
- AdSense console steps
- CMP / privacy console steps
- legal sign-off items
- residual policy risks
