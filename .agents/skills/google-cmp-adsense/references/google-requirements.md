# Google Requirements Snapshot

## Scope

Use this file when you need the current Google policy rules, enforcement dates, or regulator-facing guardrails.

## 1. Current Google Publisher Requirements

As of `2026-04-11`:

- `EEA + UK`: Google requires a Google-certified CMP integrated with the IAB TCF for personalized ads, effective `2024-01-16`.
- `Switzerland`: the same requirement applies effective `2024-07-31`.
- This requirement applies to publishers using `AdSense`, `Ad Manager`, or `AdMob` when serving personalized ads.
- Traffic from a certified CMP can remain eligible for `personalized ads`, `non-personalized ads`, and `limited ads` where supported.
- Traffic from a non-certified CMP may be limited to `non-personalized ads` or `limited ads`.
- Google explicitly says its CMP certification does **not** prove full compliance with the TCF or with applicable privacy laws.

## 2. What Google's Own CMP Is

Google's own CMP lives in `Privacy & messaging` and is the default first-party path for web publishers who want a Google-run consent experience.

It can:

- show European regulations messages for `EEA / UK / Switzerland`
- show U.S. state privacy messages
- collect consent for Google's ad ecosystem and the publisher's own declared purposes
- populate vendor/ad partner disclosures from the configured partner list

Do not assume this removes the publisher's legal responsibility. Google says message legality is still the publisher's responsibility.

## 3. TCF Version Note

Google's help center is currently mixed:

- several publisher settings pages still refer to `TCF v2.2`
- the newer AdSense GPP help page says publishers should ensure EU TC strings are generated based on the `IAB Europe TCF v2.3` spec

Inference:

- treat `TCF support` as mandatory
- verify the exact currently supported TCF version at implementation time against the latest Google help article and the certified CMP list
- do not hard-code an older spec version into long-lived instructions without re-checking

## 4. Ad Partners / ATPs / Additional Consent

Google now refers to ATPs as `ad partners` in AdSense settings.

Key points:

- Google is selected by default in the commonly used partner set and cannot be deselected there.
- If you do not actively curate the partner controls, the commonly used set serves by default.
- That default may protect revenue but increases the list of parties that must be disclosed to users.
- If you use TCF and also work with providers not registered in the TCF, Google supports this through `Additional Consent`.

Practical tradeoff:

- `Commonly used set`: simpler, often stronger revenue coverage, broader disclosure burden
- `Custom set`: tighter legal/data minimization story, but you must know your actual demand stack or you may hurt fill and revenue

## 5. Consent Mode v2 Facts

Consent Mode now includes these advertising-related parameters in addition to the older storage flags:

- `ad_user_data`
- `ad_personalization`

Core consent types you will most often map:

- `ad_storage`
- `ad_user_data`
- `ad_personalization`
- `analytics_storage`
- optionally `functionality_storage`, `personalization_storage`, `security_storage`

Google's docs distinguish:

- `basic consent mode`: block tags entirely until consent; no pre-consent data flow to Google
- `advanced consent mode`: load tags with denied defaults, allow cookieless pings while denied, then upgrade if consent is granted

Revenue implication:

- advanced mode gives Google Ads / GA4 better advertiser-specific modeling than basic mode
- but the organization must be comfortable with the legal and policy posture of denied-state cookieless pings

## 6. U.S. State / GPP Notes

For U.S. state privacy laws:

- Google supports `GPP`
- Google does **not** require publishers to use GPP or a CMP for U.S. state compliance
- Google continues to require `TCF + certified CMP` for `EEA / UK / Switzerland`; GPP is not accepted as a substitute there

Google's own U.S. state message support has an important limitation:

- Google's consent management solution does not support collecting the `KnownChildSensitiveDataConsents` fields

Escalate any child-directed or minor-sensitive U.S. inventory for legal/product review.

## 7. Legal Baseline To Respect

Use these principles as hard constraints:

- no non-essential cookies before consent where consent is required
- consent must be clear, informed, specific, and affirmative
- continuing to browse is not sufficient consent
- users need an easy way to refuse or disable non-essential cookies
- fresh consent may be needed when purposes or cookie use materially changes
- behavioral tracking and ads personalization need extra care because regulators treat them as privacy-intrusive

## 8. Official Sources

Reviewed on `2026-04-11`:

- Google AdSense Help, "Comply with the EU user consent policy"
  - https://support.google.com/adsense/answer/7670013?hl=en-GB
- Google AdSense Help, "Google consent management requirements for serving ads in the EEA, the UK, and Switzerland (for publishers)"
  - https://support.google.com/adsense/answer/13554116?hl=en
- Google AdSense Help, "Manage GDPR ad partners"
  - https://support.google.com/adsense/answer/10960670?hl=en
- Google AdSense Help, "About European regulations messages"
  - https://support.google.com/adsense/answer/10961068?hl=en
- Google AdSense Help, "Request consent for your own use of data"
  - https://support.google.com/adsense/answer/10960671?hl=en
- Google AdSense Help, "Supporting the IAB's Global Privacy Platform"
  - https://support.google.com/adsense/answer/14126816?hl=en
- Google Ad Manager Help, "How the Google Consent Management Platform (CMP) works"
  - https://support.google.com/admanager/answer/16918505?hl=en&ref_topic=10366389
- Google for Developers, "Consent mode overview"
  - https://developers.google.com/tag-platform/security/concepts/consent-mode
- ICO, "Cookies and similar technologies"
  - https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/
- ICO, "ICO warns organisations to proactively make advertising cookies compliant"
  - https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2024/01/ico-warns-organisations-to-proactively-make-advertising-cookies-compliant/
- EDPB, "Guidelines 05/2020 on consent under Regulation 2016/679"
  - https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-052020-consent-under-regulation-2016679_en
- EUR-Lex / CJEU consent guidance snippet on pre-ticked boxes and inactivity
  - https://eur-lex.europa.eu/legal-content/EN/AUTO/?qid=1673631430997&uri=CELEX%3A62019CJ0061
