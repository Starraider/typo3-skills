# Implementation Playbook

## Scope

Use this file when we need repo-side implementation details, code placement guidance, code snippets, TYPO3 integration patterns, or verification checks for AdSense for Search (AFS).

## Official Sources Reviewed

Reviewed on `2026-04-18`:

- Google AdSense Help, "AdSense for Search (AFS)"
  - https://support.google.com/adsense/answer/9879
- Google AdSense Help, "How to earn with AdSense for Search"
  - https://support.google.com/adsense/answer/35873
- Google AdSense Help, "Get the code for your search style"
  - https://support.google.com/adsense/answer/7591103
- Google AdSense Help, "Search ads parameter descriptions"
  - https://support.google.com/adsense/answer/9055049
- Google AdSense Help, "Use conditional styling to apply multiple search styles"
  - https://support.google.com/adsense/answer/9300516
- Google AdSense Help, "Related search for search pages"
  - https://support.google.com/adsense/answer/10218937
- Google AdSense Help, "Related search for your content pages"
  - https://support.google.com/adsense/answer/10233819

## 1. AFS Code Architecture

AFS uses a two-part code structure:

1. **Head script** — loads the AFS JavaScript library
2. **Body script** — configures page options, ad blocks, and triggers the ad call

Both parts are generated in the AdSense console under `Ads for search > Search styles > Generate code`.

## 2. Head Script (Place In `<head>`)

```html
<script async
    src="https://www.google.com/adsense/search/ads.js">
</script>
```

Rules:

- load it once per search results page
- the `async` attribute is required
- do not duplicate across multiple partials or includes
- if consent gating is required, coordinate with `$google-cmp-adsense`

## 3. Body Script (Place In `<body>`)

### Minimal AFS Configuration

```html
<div id="afscontainer1"></div>

<script>
  // Page-level options (apply to all ad units on the page)
  var pageOptions = {
    'pubId': 'partner-pub-1234567890123456',
    'query': myQuery,
    'styleId': '1234567890'
  };

  // Ad block 1 — top search ads
  var adblock1 = {
    'container': 'afscontainer1',
    'maxTop': 4
  };

  _googCsa('ads', pageOptions, adblock1);
</script>
```

### Full AFS Configuration With Multiple Blocks

```html
<div id="afscontainer1"></div>
<div id="afscontainer2"></div>
<div id="searchrelatedcontainer"></div>

<script>
  // Page-level options
  var pageOptions = {
    'pubId': 'partner-pub-1234567890123456',  // Required: your publisher ID
    'query': myQuery,                          // Required: dynamic search query from user
    'styleId': '1234567890',                   // Required: from search style in console
    'hl': 'en',                                // Optional: language code
    'channel': 'search_results_main',          // Optional: custom channel for tracking
    'adtest': 'on',                            // TESTING ONLY — remove for production
    'adsafe': 'high',                          // Optional: family-safe filter
    'adPage': currentPage,                     // Optional: for paginated results
    'linkTarget': '_blank'                     // Optional: open ads in new window
  };

  // Ad block 1 — top search ads
  var adblock1 = {
    'container': 'afscontainer1',
    'maxTop': 4,
    'width': '100%',
    'adLoadedCallback': function(containerName, adsLoaded) {
      if (!adsLoaded) {
        document.getElementById(containerName).style.display = 'none';
      }
    }
  };

  // Ad block 2 — bottom search ads
  var adblock2 = {
    'container': 'afscontainer2',
    'number': 3,
    'width': '100%'
  };

  // Related search block
  var relatedSearchBlock = {
    'container': 'searchrelatedcontainer',
    'relatedSearches': 4,
    'width': '100%'
  };

  _googCsa('ads', pageOptions, adblock1, adblock2);
  _googCsa('relatedsearch', pageOptions, relatedSearchBlock);
</script>
```

## 4. Parameter Reference Quick-Look

### Page-Level Parameters (Required)

| Parameter | Description | Example |
|-----------|-------------|---------|
| `pubId` | Publisher ID without `ca-` prefix when using `partner-pub-` format | `'partner-pub-1234567890123456'` |
| `query` | Dynamic user search query | `myQueryVariable` |
| `styleId` | Search style ID from console | `'1234567890'` |

### Page-Level Parameters (Optional)

| Parameter | Description | Default |
|-----------|-------------|---------|
| `adPage` | Paginated results page number | `1` |
| `adtest` | Test mode (no revenue generated) | `'off'` |
| `adsafe` | Content safety filter: `'high'`, `'medium'`, `'low'` | — |
| `channel` | Custom channel for tracking | — |
| `hl` | Language code (e.g., `'en'`, `'de'`, `'fr'`) | auto |
| `ie` | Input encoding | `'utf-8'` |
| `linkTarget` | `'_top'` (same window) or `'_blank'` (new) | `'_top'` |
| `maxTermLength` | Max characters for related search terms | — |
| `oe` | Output encoding | `'utf-8'` |
| `personalizedAds` | Personalized ad control (being deprecated per Google) | — |
| `resultsPageBaseUrl` | Base URL for Related Search for Content | — |
| `resultsPageQueryParam` | Query parameter name for Related Search | `'query'` |
| `terms` | Publisher-specified related search terms | — |

### Unit-Level Parameters

| Parameter | Description |
|-----------|-------------|
| `container` | (Required) HTML `<div>` ID for this ad block |
| `maxTop` | Number of ads in a top ad block |
| `number` | Number of ads to show |
| `relatedSearches` | Number of related search terms to show |
| `width` | Width of the ad block (e.g., `'100%'`, `700`) |
| `adLoadedCallback` | Callback when ads load (or do not load) |

## 5. TYPO3 Integration Patterns

### Option A: Dedicated Search Results Page Template

Create a dedicated TYPO3 page with a backend layout that uses a custom Fluid template for the search results page.

**Fluid template example** (`Resources/Private/Templates/Pages/SearchResults.html`):

```html
<f:layout name="Default" />

<f:section name="Main">
    <div class="search-results-page">
        <h1>Search Results</h1>

        <div class="search-results-form">
            <form action="" method="get" id="afs-search-form">
                <label for="afs-search-input" class="sr-only">Search</label>
                <input type="text"
                       id="afs-search-input"
                       name="q"
                       value=""
                       placeholder="Search..."
                       class="search-input" />
                <button type="submit" class="search-button">Search</button>
            </form>
        </div>

        <!-- AFS Ad Container -->
        <div id="afscontainer1" class="afs-ad-slot"></div>

        <!-- AFS Related Search Container -->
        <div id="searchrelatedcontainer" class="afs-related-search-slot"></div>
    </div>
</f:section>

<f:section name="FooterScripts">
    <script>
        (function() {
            var urlParams = new URLSearchParams(window.location.search);
            var searchQuery = urlParams.get('q') || '';

            // Pre-fill the search input
            var searchInput = document.getElementById('afs-search-input');
            if (searchInput && searchQuery) {
                searchInput.value = searchQuery;
            }

            // Only load AFS if there is a query
            if (searchQuery) {
                var pageOptions = {
                    'pubId': 'partner-pub-XXXXXXXXXXXXXXXX',
                    'query': searchQuery,
                    'styleId': 'XXXXXXXXXX',
                    'hl': '{f:format.raw(value: \'{siteLanguage.hreflang}\')}',
                    'channel': 'typo3_search_results'
                };

                var adblock1 = {
                    'container': 'afscontainer1',
                    'maxTop': 4,
                    'width': '100%',
                    'adLoadedCallback': function(containerName, adsLoaded) {
                        if (!adsLoaded) {
                            document.getElementById(containerName).style.display = 'none';
                        }
                    }
                };

                var relatedSearch = {
                    'container': 'searchrelatedcontainer',
                    'relatedSearches': 4,
                    'width': '100%'
                };

                _googCsa('ads', pageOptions, adblock1);
                _googCsa('relatedsearch', pageOptions, relatedSearch);
            }
        })();
    </script>
</f:section>
```

### Option B: TypoScript Head Injection

Add the AFS head script to only the search results page using a TypoScript condition:

```typoscript
# AFS head script — only on the search results page
[traverse(page, "uid") == {$searchResultsPageUid}]
page.headerData.800 = TEXT
page.headerData.800.value = <script async src="https://www.google.com/adsense/search/ads.js"></script>
[end]
```

The page UID should come from a site setting:

```yaml
# settings.definitions.yaml
searchResultsPageUid:
  type: int
  default: 0
  label: 'AFS Search Results Page UID'
```

### Option C: Related Search for Content Pages

Place Related Search blocks on content pages to drive traffic to the search results page:

```html
<!-- On content pages -->
<div id="rscontentcontainer"></div>

<script>
  var pageOptions = {
    'pubId': 'partner-pub-XXXXXXXXXXXXXXXX',
    'styleId': 'XXXXXXXXXX',
    'resultsPageBaseUrl': 'https://www.example.com/search-results/',
    'resultsPageQueryParam': 'q'
  };

  var rsBlock = {
    'container': 'rscontentcontainer',
    'relatedSearches': 4,
    'width': '100%'
  };

  _googCsa('relatedsearch', pageOptions, rsBlock);
</script>
```

## 6. CLS Prevention

Reserve space for AFS containers to prevent Cumulative Layout Shift:

```css
.afs-ad-slot {
    min-height: 200px;
    width: 100%;
    contain: layout;
}

.afs-related-search-slot {
    min-height: 60px;
    width: 100%;
    contain: layout;
}
```

Use the `adLoadedCallback` to collapse empty containers when no ads are returned:

```javascript
'adLoadedCallback': function(containerName, adsLoaded) {
    var container = document.getElementById(containerName);
    if (!adsLoaded && container) {
        container.style.display = 'none';
        container.style.minHeight = '0';
    }
}
```

## 7. Responsive Width Configuration

AFS supports both pixel and percentage widths:

```javascript
// Responsive (recommended)
'width': '100%'

// Fixed width
'width': '728px'
'width': 728
```

For responsive layouts, always use `'100%'` and let the parent container control the maximum width.

## 8. Consent-Aware Loading Pattern

If the site requires consent before loading ads:

```javascript
// Wait for consent before initializing AFS
function initAFS() {
    // AFS initialization code here
    _googCsa('ads', pageOptions, adblock1);
}

// Example: listen for consent granted event
document.addEventListener('consentGranted', function() {
    // Load the AFS script dynamically
    var script = document.createElement('script');
    script.src = 'https://www.google.com/adsense/search/ads.js';
    script.async = true;
    script.onload = initAFS;
    document.head.appendChild(script);
});
```

Coordinate the exact consent mechanism with `$google-cmp-adsense`.

## 9. Required Assets And Information

Before implementation, collect:

| Item | Description | Source |
|------|-------------|--------|
| Publisher ID | `partner-pub-XXXXXXXXXXXXXXXX` or `pub-XXXXXXXXXXXXXXXX` | AdSense account |
| Search style ID | Numeric ID from the search style | `Ads for search > Search styles` |
| Search results page URL | Page receiving search queries | Site architecture |
| Query parameter name | URL parameter carrying the search term (e.g., `q`) | Site implementation |
| Domain verification | Site approved in AdSense | `AdSense > Sites` |
| ads.txt | Published at domain root | `/ads.txt` |
| Branding colors | For search style customization | AdSense console |
| Language code | Primary language (e.g., `en`, `de`) | Site configuration |

## 10. Site Package Touchpoints

In a typical site package, start with:

- `packages/my-site-package/Configuration/Sets/MySitePackage/TypoScript/page.typoscript`
- `packages/my-site-package/Resources/Private/Templates/Pages/`
- `packages/my-site-package/Resources/Private/Partials/Pages/`

Why:

- `page.headerData.*` is already used for shared head markup
- the site package uses `PAGEVIEW`, so the AFS head script fits as a conditional `headerData` entry
- a dedicated search results template is the cleanest approach

## 11. Implementation Checklist

- [ ] AFS access confirmed with Google account manager
- [ ] Site approved in `AdSense > Sites`
- [ ] `ads.txt` published and reachable at `/ads.txt`
- [ ] Search style created in AdSense console
- [ ] AFS head script added to `<head>` of search results page only
- [ ] AFS body script added to `<body>` with correct `pubId`, `query`, and `styleId`
- [ ] `<div>` container IDs match ad block `container` parameters
- [ ] `query` parameter dynamically reads from URL (not hard-coded)
- [ ] `adtest: 'on'` used during development
- [ ] CLS prevention styles applied to ad containers
- [ ] `adLoadedCallback` handles empty ad responses
- [ ] No AFS code on non-search-results pages
- [ ] Maximum two AFS search boxes per page
- [ ] Consent architecture coordinated (if needed)
- [ ] TYPO3 cache flushed after changes
- [ ] Visual verification in DDEV or live

## 12. Deployment Verification Checklist

- [ ] `adtest` parameter removed (or set to `'off'`)
- [ ] Live search results page renders ads on real queries
- [ ] No console errors related to `_googCsa` or AFS script
- [ ] Ads appear in the correct container(s)
- [ ] Related Search terms appear (if enabled)
- [ ] Shopping ads appear (if enabled)
- [ ] Click-through on ads works correctly
- [ ] `/ads.txt` is publicly reachable
- [ ] AdSense reports show AFS impressions within 24-48 hours
- [ ] Minimum 20 Search ad impressions tracked per qualifying month
- [ ] No policy violations flagged in AdSense account

## 13. Completion Notes

If frontend markup changes:

- rebuild frontend assets when needed (`ddev exec "cd packages/my-site-package && npm run build"`)
- run `ddev typo3 cache:flush`
- verify the search results page in DDEV
- if a real mounted URL is needed for page-level validation, request it before claiming completion
