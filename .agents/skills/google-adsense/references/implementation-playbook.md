# Implementation Playbook

## Scope

Use this file when we need repo-side implementation details, code placement guidance, or verification checks for AdSense.

## Official Sources Reviewed

Reviewed on `2026-04-11`:

- Google AdSense Help, "Add a new site to your AdSense sites list"
  - https://support.google.com/adsense/answer/12169212
- Google AdSense Help, "About Auto ads"
  - https://support.google.com/adsense/answer/9261805
- Google AdSense Help, "About the 'Fine-tune your ads' controls"
  - https://support.google.com/adsense/answer/14113110
- Google AdSense Help, "Where to place ad unit code in your HTML"
  - https://support.google.com/adsense/answer/9190028
- Google AdSense Help, "Ad size optimization setting"
  - https://support.google.com/adsense/answer/9139818

## 1. Default Technical Strategy

Prefer this order:

1. Verify the site in `AdSense > Sites`.
2. Add `ads.txt` at the root.
3. Start with `Auto ads`.
4. Add manual units only after the layout and page intent justify them.
5. Coordinate loading with the chosen consent architecture.

## 2. Verification Methods

Google currently supports these site-connection methods:

- `AdSense code snippet`
- `ads.txt code snippet`
- `meta tag`

Practical preference:

- use the `AdSense code snippet` when the site is already ready for the bootstrap script
- use the `meta tag` if the site is not ready to show ads yet but ownership must be proven
- still maintain `ads.txt` even if the primary verification method is different

## 3. Site Package Touchpoints

In a typical site package, start with:

- `packages/my-site-package/Configuration/Sets/MySitePackage/TypoScript/page.typoscript`
- `packages/my-site-package/Resources/Private/Templates/Pages/`
- `packages/my-site-package/Resources/Private/Partials/Pages/`

Why:

- `page.headerData.*` is already used for shared head markup
- the site package uses `PAGEVIEW`, so shared page-level inserts should be added centrally
- page templates and partials are the right place for manual in-body ad slots

## 4. Head-Side Bootstrap Pattern

Google's site setup flow currently shows the AdSense bootstrap script in the page head:

```html
<script async
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"
    crossorigin="anonymous"></script>
```

Rules:

- load it once per page
- avoid duplicate inclusion through multiple partials
- if a strict prior-consent model is required, coordinate whether the script loads immediately or only after consent with `$google-cmp-adsense`

## 5. Manual Ad Unit Placement Pattern

Google's help center says ad unit code belongs inside the page body, not outside it.

Representative structure:

```html
<div class="ad-slot ad-slot--article">
  <ins class="adsbygoogle"
      style="display:block"
      data-ad-client="ca-pub-1234567890123456"
      data-ad-slot="1234567890"
      data-ad-format="auto"
      data-full-width-responsive="true"></ins>
</div>
<script>
  (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

Implementation notes:

- reserve layout space where practical to reduce CLS
- avoid placing units in tiny, hidden, or collapsing containers
- do not stack units so aggressively that content becomes secondary
- prefer layout-aware placements such as article bodies, long list pages, or other scroll-heavy content

## 6. Auto Ads Guidance

Auto ads are the safest default because Google can scan the page and place ads across eligible formats.

Good default:

- enable Auto ads site-wide first
- preview before wider rollout
- use exclusions for pages where ads would clearly hurt UX or business goals

Useful Auto ads controls:

- overlay formats such as `anchor`, `vignette`, and `side rail`
- in-page formats such as `banner` and `multiplex`
- intent-driven formats when the site and content model justify them
- fine-tune controls for maximum count, spacing, and more article-page opportunities

## 7. Responsive And Fixed-Size Units

Default recommendation:

- use responsive or auto-sized units
- turn on Google's mobile ad size optimization where the format supports it

Use fixed-size units only when:

- the design already reserves the exact dimensions
- the slot is stable across breakpoints
- the placement still satisfies policy and user-experience expectations

## 8. ads.txt

Google's site setup flow currently shows this format:

```txt
google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0
```

Rules:

- publish it at the site root as `/ads.txt`
- merge with any existing seller declarations instead of overwriting them blindly
- verify the live URL, not only the repo copy

## 9. Verification Checklist

Before sign-off, verify:

- the chosen verification snippet is live in rendered HTML
- the crawler can fetch the page
- the AdSense bootstrap appears once
- manual units render in valid body markup
- `/ads.txt` is reachable
- no duplicate script or `push({})` pattern exists
- any privacy-sensitive gating matches the chosen consent mode

## 10. Repo Completion Notes

If frontend markup changes in this repo:

- rebuild frontend assets when needed
- run `ddev typo3 cache:flush`
- verify the affected page in DDEV
- if a real mounted URL is needed for page-level validation, request it before claiming completion
