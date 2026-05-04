# Event And Key-Event Mapping

## Scope

Use this file to choose the right `GA4` event names and to avoid inventing avoidable custom events.

## Official Sources Reviewed

Reviewed on `2026-04-11`:

- Google Analytics Help, "[GA4] Recommended events"
  - https://support.google.com/analytics/answer/9267735
- Google Analytics Help, "Create or modify key events"
  - https://support.google.com/analytics/answer/12844695

Google's current recommended-events page lists these relevant event names for websites:

- `generate_lead` for form submissions or requests for information
- `login`
- `search`
- `select_content`
- `sign_up`
- later-stage lead events such as `qualify_lead`, `working_lead`, `close_convert_lead`, and `close_unconvert_lead`

## 1. Default Selection Rules

Use this order:

1. Prefer a Google-recommended event when it matches the action.
2. Add custom parameters before inventing a custom event name.
3. Add a custom event only when the business question cannot be expressed cleanly through a recommended event.
4. Mark only the real business-success events as `key events`.

## 2. Recommended Mapping For This Project

### Shopper registration

Primary success event:

```js
gtag('event', 'sign_up', {
  method: 'website_form',
  account_type: 'shopper'
});
```

Mark this as a key event when the user's account creation really succeeds.

Do not fire it on the initial CTA click.

### Store owner registration / application

Primary submit-success event:

```js
gtag('event', 'generate_lead', {
  method: 'website_form',
  lead_type: 'store_owner_registration'
});
```

Why this is the default:

- the current business flow behaves like a lead/application flow
- the account may still depend on manual review or later approval

If the workflow later has a distinct "approved and activated" milestone, consider a second-stage lifecycle event such as `close_convert_lead` only when that status transition actually exists and is reliably detectable.

### Newsletter subscription

Recommended baseline:

```js
gtag('event', 'generate_lead', {
  method: 'website_form',
  lead_type: 'newsletter',
  form_id: 'homepage_newsletter'
});
```

This keeps the event inside the recommended lead-generation model instead of fragmenting reporting with a one-off custom name.

Only add a parallel custom event such as `newsletter_subscribe` if stakeholders need that exact label and understand the duplication risk.

If you do add a custom alias, choose one primary key event and leave the duplicate alias unmarked.

### Login

```js
gtag('event', 'login', {
  method: 'password'
});
```

### Site search

If the site search is not already captured cleanly through `Enhanced Measurement`, use:

```js
gtag('event', 'search', {
  search_term: '<user query>'
});
```

## 3. Secondary Funnel Events

These can be useful, but they are usually not key events:

- CTA clicks into the registration flow
- opening a registration form
- outbound clicks to an external newsletter provider
- progress steps inside a long form

When needed, use:

- `select_content` for high-level CTA selections
- a clearly named custom event for a UX step that has no recommended equivalent

Keep these separate from the final success event.

## 4. AdSense Revenue Is Not A Custom Web Event

Do not invent a web `ad_impression` event for `AdSense` revenue tracking.

Google's current recommended-events page lists `ad_impression` for apps only. For websites using AdSense, the correct way to get publisher revenue in `GA4` is to link the `AdSense` account with the `GA4` property and use the Monetization reports.

## 5. Parameter Hygiene

Good parameters:

- `method`
- `account_type`
- `lead_type`
- `form_id`
- `page_section`
- `language`

Avoid:

- email addresses
- names
- phone numbers
- full free-text form answers
- anything that would create high-cardinality, user-identifying reports

## 6. Key-Event Value Guidance

Use default key-event values only when the business has agreed on a stable value model.

Examples:

- a newsletter lead value used in Google Ads import
- a store owner application value used in lead-acquisition reporting

Do not fake revenue values just to make reports look richer.
