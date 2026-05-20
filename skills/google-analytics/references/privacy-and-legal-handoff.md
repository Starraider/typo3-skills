# Privacy And Legal Handoff

## Scope

Use this file when Analytics work overlaps with consent, banner design, international transfers, or data-minimization questions.

## Official Sources Reviewed

Reviewed on `2026-04-11`:

- Google for Developers, "Set up consent mode on websites"
  - https://developers.google.com/tag-platform/security/guides/consent
- Google Business Safety, "Ads and measurement products: information on international data transfers"
  - https://business.safety.google/intl/en/adsdatatransfers/
- Google Analytics Help, "[GA4] Collect granular location and device data"
  - https://support.google.com/analytics/answer/12002752
- Google Analytics Help, "HIPAA and Google Analytics"
  - https://support.google.com/analytics/answer/13297105
- ICO, "Guidance on the use of cookies and similar technologies"
  - https://ico.org.uk/media2/kz0doybw/guidance-on-the-use-of-cookies-and-similar-technologies-1-0.pdf
- ICO, "How should we obtain, record and manage consent?"
  - https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/consent/how-should-we-obtain-record-and-manage-consent/

## 1. Baseline Privacy Rules

Treat these as the default baseline:

- Analytics is non-essential unless the user's legal team says otherwise.
- Do not set analytics cookies or equivalent identifiers before consent in regions where prior consent is required.
- Keep the reject path fair and prominent.
- Record consent evidence, including who consented, when, what they were told, how they consented, and whether they later withdrew.
- Never send `PII` or sensitive data to Google Analytics.

ICO's current cookies guidance says you must tell people what cookies will be set, explain what they do, and obtain consent unless an exemption applies. The same guidance explicitly covers cookies and similar technologies, not just classic cookies.

## 2. Consent Mode Boundary

This skill does not own the full CMP architecture.

Switch to [`../google-cmp-adsense/SKILL.md`](../google-cmp-adsense/SKILL.md) when the task involves:

- `Consent Mode v2`
- Google `Privacy & messaging`
- `TCF` or `GPP`
- region-specific consent defaults
- banner copy or fairness decisions
- `ad_storage`, `ad_user_data`, or `ad_personalization`

Practical default:

- prefer `basic` mode unless the user explicitly wants `advanced` and legal review accepts it

Google's current consent-mode guide says you should persist the user's choice and update consent status on subsequent pages, and that region-specific defaults are supported.

## 3. Data Minimization

Google's current `GA4` Help says granular location and device data collection is enabled by default and can be disabled per region.

Use that setting deliberately when the privacy posture calls for minimization. Google also says disabling it reduces modeled key-event volume in affected regions.

Other minimization rules:

- avoid long-lived, noisy custom parameters
- scrub or prevent personal data in URLs before they reach Analytics
- avoid sending free-text search or form data if it may contain personal information

Google's current HIPAA page reiterates that Google Analytics policies and terms do not allow passing data Google could recognize as personally identifiable information, and that collected data must not reveal sensitive information about a user.

## 4. International Transfers

Google's current Business Safety page says Google relies on the `EU-U.S. Data Privacy Framework` for certain transfers from the `EEA`, and from `2024-09-16` on the `Swiss-U.S. DPF` and `UK Extension` in certain circumstances for Swiss and UK data.

Treat that as a useful transfer-mechanism statement, not as full legal clearance by itself.

Open items that still need legal review:

- whether the organization's privacy notice is accurate
- whether the chosen consent model is acceptable in the relevant jurisdictions
- whether the organization's DPA and transfer-risk assessment are complete
- whether any sector-specific rules apply

## 5. Practical Boundary Between The Three Skills

`$google-analytics` owns:

- `GA4` property and stream setup
- measurement ID and repo-side tag integration
- event and key-event design
- reporting handoff
- AdSense revenue visibility inside `GA4`

`$google-cmp-adsense` owns:

- CMP selection
- `Consent Mode v2`
- `Privacy & messaging`
- fair consent UX and regulator-facing privacy choices

`$google-adsense` owns:

- site verification for AdSense
- Auto ads and manual ad units
- `ads.txt`
- blocking controls, experiments, and monetization optimization

Use all three together when the user wants revenue, consent, and analytics solved in one pass.

## 6. Final-Answer Requirements For Mixed Tasks

If Analytics, consent, and AdSense overlap, separate the final answer into:

- repo changes completed
- `GA4` UI steps
- CMP / privacy steps
- AdSense steps
- legal sign-off items
- residual risks
