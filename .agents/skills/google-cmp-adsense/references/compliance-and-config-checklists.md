# Compliance And Configuration Checklists

## Scope

Use this file when you need exact console-side steps, legal review prompts, or revenue-safe defaults.

## 1. AdSense / Ad Manager Setup Checklist

### European regulations / Google CMP

1. Open `Privacy & messaging`.
2. Open the `European regulations` card.
3. Review ad serving mode.
4. If you want consented personalized ads, keep personalized ads enabled and use a `Google-certified CMP`.
5. Review `ad partners`.
6. Decide between the `commonly used` set and a `custom` set.
7. Add the public privacy-policy URL that explains cookies, purposes, partners, and user rights.
8. Add `purposes for your own use of data` if the site itself uses data for analytics, recommendations, personalization, or similar purposes.
9. Use `legitimate interest` only when the legal team has approved it for the relevant purpose and jurisdiction.
10. Publish the message and attach it to the correct site(s).
11. Preview with `?fc=alwaysshow&fctype=gdpr`.

### Revenue-safe default

If the user wants the strongest revenue outcome that still has a defensible privacy posture:

- use Google's own CMP or another certified CMP
- keep personalized ads available where consent is granted
- keep non-personalized / limited ads as fallback where consent is denied or traffic is not eligible
- review the partner list instead of blindly accepting every possible vendor

## 2. GA4 Checklist

1. Confirm the `Google tag` is present on every page.
2. Implement Consent Mode v2.
3. Map at minimum:
   - `analytics_storage`
   - `ad_storage`
   - `ad_user_data`
   - `ad_personalization`
4. Ensure defaults run before GA4 `config`.
5. Ensure denied users do not get analytics cookies before consent if using `basic` mode.
6. Verify consent updates after accept, reject, and granular choices.
7. Use Tag Assistant or DevTools to confirm consent states.

## 3. Google Ads Checklist

1. Confirm whether `Google Ads conversion tracking`, `remarketing`, or `Floodlight` is present.
2. Ensure `ad_storage`, `ad_user_data`, and `ad_personalization` are wired.
3. Prefer `advanced consent mode` only if legal review accepts it.
4. Verify conversion linker and remarketing tags do not bypass consent behavior.
5. Check modeled conversions expectations with the marketing team.

## 4. GTM Checklist

1. Determine whether GTM is the single source of truth for Google tags.
2. Move consent defaults to `Consent Initialization - All Pages`.
3. Use GTM consent APIs, not queued gtag consent calls inside GTM.
4. Ensure third-party tags either have built-in consent checks or explicit GTM consent settings.
5. Remove or disable any legacy banner code that conflicts with GTM.

## 5. Legal Review Checklist

The agent should explicitly ask for legal confirmation or leave a documented follow-up for:

- target regions: `EEA`, `UK`, `Switzerland`, `US states`, others
- whether `two-button` or `three-button` banner layouts are acceptable in the target jurisdictions
- whether any purpose can rely on `legitimate interest`
- whether the site's own analytics or personalization uses need to be listed as publisher purposes
- whether any child-directed or minor-sensitive inventory exists
- whether fresh consent is needed because vendors, purposes, or technologies changed

## 6. Banner Design Rules

Do not optimize revenue by crossing compliance lines.

Hard rules:

- no pre-ticked boxes
- no "continue browsing means consent"
- no hidden reject path
- refusal must be easy enough to be a real choice
- the text must clearly explain what data is used for and by whom

Risk note:

- Google offers different message layouts, but regulators increasingly expect a fair reject path for advertising cookies
- if the organization wants the highest-consent UI, require legal sign-off before using it

## 7. Acceptance Criteria

A compliant-enough implementation is not done until all are true:

- Google account-side settings are configured and documented
- site-side tag order is correct
- Consent Mode v2 is active where relevant
- vendor disclosures match actual ad partner choices
- fallback monetization exists for denied / non-certified traffic
- the privacy policy and cookie information are updated
- open legal questions are named, not buried
