# Console And Optimization Checklist

## Scope

Use this file when we need exact AdSense console actions, search style configuration, revenue-tuning choices, or optimization guidance for AdSense for Search (AFS).

## Official Sources Reviewed

Reviewed on `2026-04-18`:

- Google AdSense Help, "AdSense for Search (AFS)"
  - https://support.google.com/adsense/answer/9879
- Google AdSense Help, "How to earn with AdSense for Search"
  - https://support.google.com/adsense/answer/35873
- Google AdSense Help, "About Search ads"
  - https://support.google.com/adsense/answer/9000515
- Google AdSense Help, "About Shopping ads"
  - https://support.google.com/adsense/answer/13476216
- Google AdSense Help, "Create a search style"
  - https://support.google.com/adsense/answer/7591102
- Google AdSense Help, "Edit a search style"
  - https://support.google.com/adsense/answer/9000520
- Google AdSense Help, "Search style ad settings"
  - https://support.google.com/adsense/answer/9000521
- Google AdSense Help, "Search style ad extensions"
  - https://support.google.com/adsense/answer/7591159
- Google AdSense Help, "Search style shopping ads settings"
  - https://support.google.com/adsense/answer/9933387
- Google AdSense Help, "Search style shopping ads extensions"
  - https://support.google.com/adsense/answer/9933694
- Google AdSense Help, "Search ad style standards"
  - https://support.google.com/adsense/answer/15469196
- Google AdSense Help, "Related Search for search pages"
  - https://support.google.com/adsense/answer/10218937
- Google AdSense Help, "Search styles for related search settings"
  - https://support.google.com/adsense/answer/10222432
- Google AdSense Help, "Related search for your content pages"
  - https://support.google.com/adsense/answer/10233819

## 1. Sign Up For AFS

AFS is not self-service. Tell the user to:

1. Contact their Google AdSense account manager to request AFS access.
2. Google will review the site and notify when AFS features become available.
3. The user cannot proceed with implementation until access is granted.

If the user does not have an account manager, they should use the AdSense Help Center contact form.

## 2. Create A Search Style

Tell the user to:

1. Sign in to their AdSense account at https://www.google.com/adsense.
2. Navigate to `Ads for search` > `Search styles`.
3. Click `Create search style` (or `+ New search style`).
4. Configure the following settings:

### Search Ads Settings

- **Ad format**: choose how ads appear (text ads, product listing ads)
- **Number of ads**: set the maximum number of ads per block
- **Link target**: `_top` (same window) or `_blank` (new window)
- **Ad extensions**: enable sitelinks, callouts, or structured snippets to increase ad quality and CTR

### Visual Customization

- **Font family**: match the site's typography
- **Title color**: use a clickable-link color that matches the site's brand
- **Background color**: match the search results page background
- **Border color**: subtle or matching
- **URL color**: standard green or brand-appropriate color
- **Description color**: readable contrast on the background

### Shopping Ads Settings (If Applicable)

- **Show Shopping ads**: enable for product-oriented queries
- **Grid layout**: configure rows and columns
- **Card style**: match the site design
- **Shopping ad extensions**: enable for richer product cards

### Related Search Settings

- **Related search for search pages**: enable to show related terms on search results
- **Related search for content pages**: enable to drive content-page traffic to search
- **Number of related searches**: typically 4-8 terms
- **Term length limits**: set `maxTermLength` if needed

## 3. Generate The AFS Code

Tell the user to:

1. Navigate to `Ads for search` > `Search styles`.
2. Find the created search style and click `Generate code`.
3. In "Step 1: Create your containers":
   - Enter the HTML `<div>` ID of the ad container on your search page (e.g., `afscontainer1`).
   - Optionally click `Add container` for additional containers.
4. In "Step 2: Copy and paste your code":
   - Copy the **first code snippet** and paste it into the `<head>` tag of the search results page.
   - Copy the **second code snippet** and paste it into the `<body>` tag of the search results page.
5. Click `I'm done`.

Key notes:

- The `pubId` is auto-populated from the account.
- The `query` parameter MUST be set dynamically to the user's search query.
- The `styleId` is auto-populated from the selected search style.
- Use `adtest: 'on'` during development, remove before production.

## 4. Revenue Model

For AFS, publishers receive **51% of the revenue recognized by Google** from ad clicks on search results pages. Key facts:

- Revenue is generated only from **ad clicks**, not from impressions or searches alone.
- Users who search but do not click on any ads generate no revenue.
- Higher-quality, longer, and more specific queries tend to attract better-paying ads.
- Shopping ads can increase revenue for product-related queries.

## 5. Optimization Tactics

### Query Quality

- Ensure the search box is prominent and easy to use.
- Use Related Search to help users refine queries.
- Do not pre-populate search boxes (policy violation).
- Do not modify, filter, or programmatically generate queries (policy violation).

### Search Style Tuning

- Match the ad styling to the site's visual design for a cohesive user experience.
- Enable ad extensions (sitelinks, callouts) to increase ad quality and CTR.
- Enable Shopping ads for sites with product-related content or audience.
- Test different numbers of ads per block (2-4 at top is a common sweet spot).

### Related Search

- Enable Related Search for search pages to show refinement options.
- Enable Related Search for content pages to drive traffic from non-search pages to the search results page.
- Use the `terms` parameter to suggest publisher-defined related terms.
- Use `maxTermLength` to keep terms visually clean.

### Conditional Styling

- Use multiple search styles when different pages or contexts need different ad appearances.
- Configure conditional styling in the body script to select the appropriate `styleId` based on page context.

### Custom Channels

- Create custom channels in AdSense to track AFS performance by page, section, or experiment.
- Use the `channel` parameter (e.g., `'channel': 'homepage_search+mobile_users'`).
- Separate multiple channels with `+`.

### Responsive Design

- Always use `'width': '100%'` for responsive layouts.
- The parent container should control maximum width.
- Test on mobile, tablet, and desktop breakpoints.
- Ensure ad containers do not overflow on narrow viewports.

### Performance (Page Speed)

- The AFS script uses `async` loading by default — do not change this.
- Use `adLoadedCallback` to hide empty containers and avoid layout waste.
- Reserve vertical space with CSS `min-height` to prevent CLS.
- If consent gating delays script loading, use dynamic script injection after consent.

## 6. Monitoring And Reporting

### AdSense Reports

Tell the user to check:

1. Navigate to `Reports` in the AdSense account.
2. Filter by product type: `AdSense for Search`.
3. Key metrics to monitor:
   - **Search queries**: number of user searches generating ad requests
   - **Search ad impressions**: number of times Search ads were shown
   - **Search ad clicks**: number of clicks on Search ads
   - **Search ad CTR**: click-through rate
   - **Search estimated earnings**: estimated revenue from Search ads
   - **Search RPM**: revenue per thousand impressions

### GA4 Integration

If AdSense is linked to GA4:

- AFS impressions and revenue can be analyzed alongside page traffic data.
- Use `$google-analytics` for detailed GA4 property, event, and reporting setup.
- Allow 24-48 hours for linked data to appear.

### Recommended KPIs

| KPI | Target | Notes |
|-----|--------|-------|
| Search ad impressions | ≥ 20/month (2 of 6 months) | Minimum to retain AFS access |
| Search ad CTR | Monitor trend | Higher CTR = better query-ad relevance |
| Search RPM | Monitor trend | Revenue per thousand impressions |
| Search query volume | Growing | Indicates healthy search usage |
| Fill rate | Monitor | Low fill may indicate query quality issues |
| CLS impact | < 0.1 | Core Web Vital for layout stability |

## 7. What The Final Response Should Include

When this skill is used for a user-facing answer, include:

- the repo-side code changes completed
- the exact AdSense navigation path for console changes
- the recommended optimization settings and why
- the privacy/CMP steps that belong to `$google-cmp-adsense`
- the content-monetization steps that belong to `$google-adsense`
- any expected delays such as AFS access approval or data propagation
