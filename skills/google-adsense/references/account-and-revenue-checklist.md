# Account And Revenue Checklist

## Scope

Use this file when we need exact AdSense UI actions, revenue-tuning choices, or user instructions for account-side work.

## Official Sources Reviewed

Reviewed on `2026-04-11`:

- Google AdSense Help, "Add a new site to your AdSense sites list"
  - https://support.google.com/adsense/answer/12169212
- Google AdSense Help, "About Auto ads"
  - https://support.google.com/adsense/answer/9261805
- Google AdSense Help, "About the 'Fine-tune your ads' controls"
  - https://support.google.com/adsense/answer/14113110
- Google AdSense Help, "Maximize ad space with multiple ad units"
  - https://support.google.com/adsense/answer/17958
- Google AdSense Help, "Optimization tips to increase your AdSense revenue"
  - https://support.google.com/adsense/answer/10568458
- Google AdSense Help, "Ad review center overview"
  - https://support.google.com/adsense/answer/2369326
- Google Analytics Help, "Connect Google AdSense to Google Analytics"
  - https://support.google.com/analytics/answer/13610380

## 1. Add And Approve The Site

Tell the user to:

1. Open `AdSense > Sites`.
2. Click `+ New site`.
3. Enter the canonical domain.
4. Choose a verification method.
5. Click `Verify`.
6. Click `Request review`.

Key notes:

- Google says the site must pass ownership and policy checks before it is ready to show ads.
- Review can take a few days and sometimes longer.
- The setup flow now also offers a CMP choice after review request; use `$google-cmp-adsense` if the privacy path matters.

## 2. Start With Auto Ads

Default recommendation:

- enable `Auto ads` first unless the user already has a strong manual-placement plan

Why:

- one shared code path
- broader format coverage
- easier iteration through the AdSense UI
- less template churn in the codebase

## 3. Tune Auto Ads Deliberately

Use these controls intentionally:

- `Maximum number of ads`
- `Minimum distance between ads`
- `Find more ad placements on article pages`

Revenue-safe default:

- start moderately, not at the most aggressive setting
- turn on more article-page opportunities when the site has long editorial pages
- preview changes before rolling them out broadly

Google explicitly recommends turning on the "find more ad placements on article pages" control when article-style content exists.

## 4. Decide When To Add Manual Units

Add manual units when the site has:

- long-form articles
- high-intent list or directory pages
- repeatable page structures where a slot can be placed without harming UX

Good uses:

- first slot after a meaningful content block
- mid-article positions on long content
- list pages where content is scroll-heavy and ads do not break task flow

Avoid:

- forcing ads into every short page
- placing units so tightly that ads dominate the viewport

## 5. Use Multiple Units Carefully

Google says multiple ad units can improve performance, especially on text-heavy or thread-like pages, but the page still needs a healthy balance between ads and content.

Practical rule:

- add more units only on long pages with real scroll depth
- measure total earnings and UX impact, not just a single slot RPM

## 6. Blocking Controls And Brand Safety

Default stance:

- do not over-block
- keep auction pressure high unless there is a specific reason to restrict demand

Use blocking when there is a concrete need:

- legal or contractual requirement
- clear brand-safety issue
- user-trust problem that outweighs revenue loss

Prefer this order:

1. `Ad review center` for specific creatives
2. narrowly scoped advertiser/category blocks
3. broader blocks only with clear evidence

## 7. Optimization And Experiments

Tell the user to review:

- `Optimization tips`
- AdSense `experiments`
- Auto ads preview before pushing aggressive changes

Good practice:

- change one major variable at a time
- let the experiment finish before drawing conclusions
- keep a rollback path for aggressive density changes

## 8. Link GA4 When Analysis Matters

Link `GA4` when the team wants to analyze:

- page path performance
- ad format and ad unit performance
- ad impressions, clicks, exposure, and total ad revenue alongside traffic data

Implementation reminder:

- GA4 and AdSense code order matters
- allow up to 24 hours for linked data to appear
- discrepancies can happen because of iframes, blockers, or tag issues

## 9. Revenue-Maximizing But Defensible Defaults

If the user asks for the highest-revenue setup that still stays defensible:

- start with Auto ads
- keep several eligible formats enabled
- use fine-tune controls instead of maxing density blindly
- add manual units only on high-value templates
- avoid broad blocking
- review creatives in Ad review center instead of disabling large swaths of demand
- link GA4 so optimization decisions use both revenue and traffic context
- pair the rollout with `$google-cmp-adsense` so personalized ads are available where legally valid consent exists

## 10. What The Final Response Should Include

When this skill is used for a user-facing answer, include:

- the repo-side changes Codex made
- the exact AdSense navigation path for account changes
- the recommended revenue settings and why
- the privacy/CMP steps that belong to `$google-cmp-adsense`
- any expected delays such as site review or GA4 link propagation
