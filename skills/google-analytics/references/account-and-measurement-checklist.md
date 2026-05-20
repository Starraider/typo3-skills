# Account And Measurement Checklist

## Scope

Use this file for the exact `GA4` and `AdSense` console-side steps that the user must perform outside the repo.

## Official Sources Reviewed

Reviewed on `2026-04-11`:

- Google Analytics Help, "Set up Analytics for a website and/or app"
  - https://support.google.com/analytics/answer/9304153
- Google Analytics Help, "Create or modify key events"
  - https://support.google.com/analytics/answer/12844695
- Google Analytics Help, "[GA4] Recommended events"
  - https://support.google.com/analytics/answer/9267735
- Google Analytics Help, "[GA4] Collect granular location and device data"
  - https://support.google.com/analytics/answer/12002752
- Google AdSense Help, "How your AdSense account is integrated with Google Analytics"
  - https://support.google.com/adsense/answer/98148
- Google AdSense Help, "Control access to your AdSense data in Analytics"
  - https://support.google.com/adsense/answer/65089

## 1. Create Or Confirm The GA4 Property

Give the user these steps when the property is missing:

1. Open `analytics.google.com`.
2. Go to `Admin`.
3. Create or select the correct account.
4. Create or select the `GA4` property for the site.
5. Confirm the property time zone and currency match the business reporting defaults.

If the property already exists, confirm that the correct property is selected before giving further instructions.

## 2. Create Or Confirm The Web Data Stream

Based on Google's current Help flow:

1. In `Admin`, under `Data collection and modification`, click `Data streams`.
2. Click `Web`.
3. Choose the correct stream for the website, or create it if it does not exist.
4. Under `Google tag`, click `View tag instructions`.
5. On the installation page, use `Install manually` if this repo will load the tag directly.
6. Copy the `Measurement ID` and store it in the repo settings instead of hard-coding it inline.

Google's current Help page says data collection can take up to `30 minutes` to begin, and recommends using the `Realtime` report to confirm that data is arriving.

## 3. Decide What Enhanced Measurement Should Handle

Do this deliberately instead of leaving the defaults unquestioned.

Keep a feature enabled only when it will not conflict with manual measurement. Review at least:

- page views
- scrolls
- outbound clicks
- site search
- file downloads
- form interactions
- video engagement

If a business outcome already has a clean custom event, do not double-count it through a second derived event.

## 4. Create And Mark Key Events

Google's current Help flow for event creation says:

1. In `Admin`, under `Data display`, click `Events`.
2. Click `+ Create event`.
3. Enter the event name.
4. If appropriate, toggle `Mark as key event`.
5. Choose whether the event is created `without code` or `with code`.

Use `without code` only for simple URL- or event-based derivations. Prefer `with code` when the success condition is controlled inside the site and we can emit the exact event ourselves.

If the user wants monetary values on a key event:

- the `value` parameter must be numeric
- the `currency` parameter must use `ISO 4217`

These values matter if the event is later used in Google Ads.

## 5. Review Granular Location And Device Data

Google's current Help page says this collection is enabled by default and can be controlled on a per-region basis.

Current UI path:

1. In `Admin`, under `Data collection and modification`, click `Data collection`.
2. Review `Granular location and device data collection`.
3. If the privacy posture requires stronger minimization, configure the affected regions explicitly.

Google also notes that disabling this data in a region reduces modeled key-event volume for that region and affects downstream modeling in linked Google Ads and Search Ads 360 accounts.

## 6. Link AdSense To GA4 For Publisher Revenue Reporting

Use this when the user wants `AdSense` earnings inside `GA4`.

Practical guidance based on current AdSense Help:

1. In `AdSense`, open the `Use Google Analytics with AdSense` / integration area for Analytics linking.
2. Link the correct `GA4` property to the AdSense account.
3. Confirm that the linked Analytics property is the same one the site tag sends data to.
4. Wait for reporting to populate, then verify the `Monetization` and `Publisher ads` reports inside `GA4`.

Google's current AdSense Help says that once the `GA4` property is linked with AdSense, AdSense revenue data is available in the `Monetization` `Publisher ads` reports and `Explorations`.

## 7. Minimum Reporting Handoff

After implementation, hand the user a simple reporting baseline:

- `Realtime` for immediate smoke tests
- `DebugView` for implementation debugging
- key events by `source / medium`
- key events by landing page
- publisher revenue by landing page after AdSense linking

If the site has multiple conversion types, recommend one exploration or saved report per business outcome instead of cramming everything into one chart.
