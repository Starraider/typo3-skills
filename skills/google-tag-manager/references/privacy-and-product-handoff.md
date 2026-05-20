# Privacy And Product Handoff

## Scope

Use this file when the task involves legal guardrails, consent boundaries, or deciding which of the Google skills should own which part of the work.

## Official Sources Reviewed

Reviewed on `2026-04-11`:

- Google for Developers, "Consent mode overview"
  - https://developers.google.com/tag-platform/security/concepts/consent-mode
- Google for Developers, "Set up consent mode on websites"
  - https://developers.google.com/tag-platform/security/guides/consent
- Tag Manager Help, "Tag Manager consent mode support"
  - https://support.google.com/tagmanager/answer/10718549
- AdSense Help, "Google consent management requirements for serving ads in the EEA, the UK, and Switzerland (for publishers)"
  - https://support.google.com/adsense/answer/13554116
- AdSense Help, "Comply with the EU user consent policy"
  - https://support.google.com/adsense/answer/7670013
- AdSense Help, "Fix issues with your EU User Consent Policy consent audit"
  - https://support.google.com/adsense/answer/16758589
- EDPB, "Report of the work undertaken by the Cookie Banner Taskforce"
  - https://www.edpb.europa.eu/system/files/2023-01/edpb_20230118_report_cookie_banner_taskforce_en.pdf
- ICO, "Cookies and similar technologies"
  - https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/
- ICO, "ICO warns organisations to proactively make advertising cookies compliant"
  - https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2024/01/ico-warns-organisations-to-proactively-make-advertising-cookies-compliant/

## 1. Legal Baseline

Use these as hard constraints unless the user's legal team documents a narrower or broader rule for a specific jurisdiction:

- non-essential cookies and similar technologies need prior consent where local law requires it
- consent must be a real affirmative choice
- pre-ticked boxes are not valid consent
- the reject path must be real and reasonably visible
- withdrawal must be as easy as granting consent
- changes to purposes, vendors, or technology may require fresh consent

Inference from the regulator sources:

- `GTM` does not change whether consent is legally required
- a privacy-compliant implementation depends on banner behavior, disclosures, and actual tag behavior together, not on the tag manager alone

## 2. Google-Specific Privacy Facts

Current Google facts that matter for `GTM` work:

- Consent mode has `basic` and `advanced` implementations.
- `basic` blocks Google tags until consent.
- `advanced` loads tags with denied defaults and can send cookieless pings while consent is denied.
- `GTM` provides `Consent Initialization`, consent settings per tag, and `Consent Overview`.
- Google product tags with built-in consent checks include the Google tag, `GA4`, `Google Ads`, `Floodlight`, and `Conversion Linker`.

For publisher monetization:

- Google requires a Google-certified CMP with `TCF` support for certain ad use cases in the `EEA`, `UK`, and `Switzerland`.
- Google explicitly says CMP certification is not the same thing as full legal compliance.

## 3. AdSense-Specific Boundary

Important practical boundary:

- `GTM` has native support for the Google tag, `GA4`, `Google Ads`, `Floodlight`, and `Conversion Linker`
- `AdSense` is not the default native `GTM` tag path in the same way
- AdSense help still frames core publisher implementation around page integration, `AdSense > Sites`, and `ads.txt`

Default recommendation:

- keep `AdSense` bootstrap and ad units in the site and `AdSense` workflow
- use `GTM` to coordinate consent-aware measurement and avoid conflicts

Treat any request to move `AdSense` delivery into `GTM` as an exception that needs explicit review.

## 4. Which Skill Owns What

Use this split consistently:

- `$google-tag-manager`
  - owns container install, Google tag setup, variables, triggers, `dataLayer`, consent APIs inside `GTM`, preview, publish, and server-side architecture decisions
- `$google-cmp-adsense`
  - owns `Privacy & messaging`, certified CMP questions, `TCF` / `GPP`, banner fairness, disclosure quality, and legal-risk framing
- `$google-analytics`
  - owns `GA4` property and stream setup, event taxonomy, key events, DebugView expectations, and reporting handoff
- `$google-adsense`
  - owns `AdSense > Sites`, approval flow, `ads.txt`, Auto ads, manual ad units, blocking controls, and revenue optimization

## 5. Basic Versus Advanced Consent Mode

Default guidance:

- recommend `basic` when the user wants the safer pre-consent posture
- recommend `advanced` only when the organization explicitly wants improved modeling and legal review accepts denied-state cookieless pings

Do not present `advanced` as automatically compliant or risk-free.

## 6. Banner And Disclosure Guardrails

From the current Google and regulator guidance:

- do not hide reject behind a weak text link or secondary maze
- do not use pre-selected opt-ins
- do not imply consent from continued browsing
- clearly explain the purposes and the third parties involved
- keep disclosure text and actual tag behavior aligned

For Google-related consent audits, Google's current guidance also expects strong disclosure around how Google uses personal data and valid consent signals that match the user's choice.

## 7. When To Escalate

Escalate or leave a documented legal follow-up when any of these are true:

- the target regions include `EEA`, `UK`, `Switzerland`, or regulated U.S. states and the banner policy is undecided
- the business wants `advanced` consent mode
- the organization wants to rely on `legitimate interest` for advertising-related behavior
- child-directed or minor-sensitive inventory is involved
- the team wants to move `AdSense` or other publisher tags into a non-standard delivery pattern
- the existing banner design appears to favor accept over reject in a way a regulator could view as misleading
