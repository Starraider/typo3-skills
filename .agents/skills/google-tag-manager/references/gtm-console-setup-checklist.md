# GTM Console Setup Checklist

## Scope

Use this file when the user needs exact `Google Tag Manager` UI steps, publish instructions, or a clean setup checklist.

## Official Sources Reviewed

Reviewed on `2026-04-11`:

- Tag Manager Help, "1. Create an account and container"
  - https://support.google.com/tagmanager/answer/14842164
- Tag Manager Help, "2. Install a web container"
  - https://support.google.com/tagmanager/answer/14847097
- Tag Manager Help, "Set up your Google tag in Google Tag Manager"
  - https://support.google.com/tagmanager/answer/15756616
- Tag Manager Help, "Tag Manager consent mode support"
  - https://support.google.com/tagmanager/answer/10718549
- Tag Manager Help, "Publishing, versions, and approvals"
  - https://support.google.com/tagmanager/answer/6107163
- Analytics Help, "Verify your Google tag"
  - https://support.google.com/analytics/answer/15756111
- Google for Developers, "Set up consent mode on websites"
  - https://developers.google.com/tag-platform/security/guides/consent

## 1. Create Or Confirm The Account And Web Container

If the user does not already have a container:

1. Open `tagmanager.google.com`.
2. Create or select the correct account.
3. Create a `Web` container for the canonical domain.
4. Copy the `GTM-XXXXXXX` container ID.

If the container already exists, confirm the team is using the correct workspace before giving further steps.

## 2. Install The GTM Snippets

Google's current install flow expects:

1. Paste the first `GTM` snippet as high in `<head>` as possible.
2. Paste the second `noscript` snippet immediately after the opening `<body>`.
3. Use the built-in test step or `Tag Assistant` to verify the container is reachable.

Do not scatter multiple copies of the same container ID across the site.

## 3. Create Or Confirm The Google Tag In GTM

Current `Tag Manager` flow:

1. In `Tags`, click `New`.
2. Name the tag clearly.
3. Choose `Google tag` as the tag type.
4. Enter the Google tag ID.
5. Save the tag.
6. Use `Initialization - All Pages` so the tag loads before most other business tags.

Notes:

- Containers with `Google Ads` or `Floodlight` tags can automatically load a Google tag first.
- Still review whether an explicit Google tag is present so settings and destinations are deliberate.

## 4. Enable Consent Tools

Tell the user to:

1. Open `Admin > Container Settings`.
2. Under `Additional Settings`, enable `Consent Overview`.
3. Review the `Consent Overview` page after tags are created.

Inside each relevant tag:

1. Open the tag.
2. Go to `Advanced Settings > Consent Settings`.
3. Review `Built-In Consent Checks`.
4. Set `Additional Consent Checks` where needed.

Use this to distinguish:

- tags that rely only on built-in Google consent behavior
- tags that must fire only after additional consent types are granted

## 5. Set Up Consent Mode In GTM

For consent mode in `GTM`:

1. Fire consent defaults on `Consent Initialization - All Pages`.
2. Use a CMP template or your own template built on `setDefaultConsentState` and `updateConsentState`.
3. Map at minimum:
   - `ad_storage`
   - `ad_user_data`
   - `ad_personalization`
   - `analytics_storage`
4. Add region-specific defaults when the legal regime differs by geography.

Important:

- Do not use queued `gtag('consent', ...)` calls inside `GTM` instead of the `Tag Manager` consent APIs.
- If the CMP loads asynchronously, use `wait_for_update` only as needed and keep the delay purposeful.

## 6. Configure GA4 Through GTM

Use `GTM` for container-side setup:

1. Confirm the Google tag sends to the correct `GA4` destination.
2. Create event tags only for real business events.
3. Reuse settings variables instead of duplicating configuration across many tags.
4. Debug with `Tag Assistant` and `GA4 DebugView`.

Use [`../google-analytics/SKILL.md`](../google-analytics/SKILL.md) for:

- property and stream setup
- event naming strategy
- key-event selection
- reporting handoff

## 7. Configure Google Ads Or Floodlight Through GTM

When Ads products are present:

1. Add only consent-aware tags.
2. Add or review `Conversion Linker`.
3. Verify that tag consent settings do not bypass the chosen consent architecture.
4. Enable user-provided data or enhanced conversions only with product and legal approval.

## 8. Configure AdSense Alongside GTM

Default rule:

- keep `AdSense` bootstrap, site verification, `ads.txt`, and ad units in the site and AdSense workflow
- use `GTM` to coordinate Google tag behavior and consent, not as the default `AdSense` delivery path

Use [`../google-adsense/SKILL.md`](../google-adsense/SKILL.md) for:

- `AdSense > Sites`
- Auto ads
- manual ad units
- `ads.txt`
- revenue tuning

Use [`../google-cmp-adsense/SKILL.md`](../google-cmp-adsense/SKILL.md) for:

- `Privacy & messaging`
- Google-certified CMP requirements
- banner and disclosure decisions

## 9. Preview, Publish, And Version Cleanly

Before publishing:

1. Click `Preview`.
2. Use `Tag Assistant` to connect to the page.
3. Inspect the `Summary` tab for detected tags and events.
4. Check consent states and blocked versus fired tags.

When ready:

1. Click `Submit`.
2. Use `Publish and Create Version`.
3. Enter a clear version name and description.
4. Publish to the correct environment.

## 10. Minimum User Handoff

After setup, give the user:

- the container ID
- the Google tag ID
- which destinations are connected
- which tags depend on consent
- which steps still must be completed in `GA4`, `AdSense`, or `Privacy & messaging`
