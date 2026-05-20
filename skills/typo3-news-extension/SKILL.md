---
name: typo3-news-extension
description: Install, configure, and template the TYPO3 News Extension (`georgringer/news`) in DDEV-based TYPO3 projects. Use this skill when adding EXT:news to a project, wiring Site Set or TypoScript settings, choosing the correct News frontend plugin, overriding List/Detail/SearchForm/SelectedList templates, extracting reusable News partials, styling News markup with a Tailwind v4 pipeline, preserving EXT:news SEO view helpers in detail templates, or creating Playwright VRT coverage for News pages.
---

# TYPO3 News Extension

Use this skill as the project-standard workflow for `georgringer/news`.

Treat the official docs as the baseline reference and the local installed package as the final source of truth for concrete template names and plugin registrations:

- Official docs home: `https://docs.typo3.org/p/georgringer/news/main/en-us/`
- Plugins: `https://docs.typo3.org/p/georgringer/news/main/en-us/UsersManual/Plugins/Index.html`
- Installation: `https://docs.typo3.org/p/georgringer/news/main/en-us/Administration/Installation/Index.html`
- TypoScript settings: `https://docs.typo3.org/p/georgringer/news/main/en-us/Reference/TypoScript/GeneralSettings.html`
- Template customization starting point: `https://docs.typo3.org/p/georgringer/news/main/en-us/Tutorials/Templates/TwitterBootstrap/Index.html`

In a typical TYPO3 site-package project, also inspect:

- `composer.json` for the installed constraint
- `vendor/georgringer/news/` for the actual package structure
- `packages/my-site-package/Configuration/Sets/MySitePackage/config.yaml`
- `packages/my-site-package/Configuration/Sets/MySitePackage/TypoScript/plugin.typoscript`
- `packages/my-site-package/Resources/Private/Templates/News/`
- `packages/my-site-package/Resources/Private/Partials/News/`

## Load References As Needed

- Plugin configuration, TypoScript settings, and clone patterns: [references/plugin-reference.md](references/plugin-reference.md)
- Template override patterns, SEO requirements, and Fluid snippets: [references/template-patterns.md](references/template-patterns.md)

## Related Skills

- **`typo3-xml-sitemap`** — Covers the full sitemap configuration for news records using `NewsXmlSitemapDataProvider`, including `fieldToParameterMap`, `excludedTypes`, Google News sitemap, and multi-language support. Use it when adding or debugging news entries in `/sitemap.xml`.
- **`typo3-route-enhancers`** — Speaking URLs for news detail pages require an Extbase route enhancer with `PersistedAliasMapper` pointing to `path_segment` (not `slug`). Use this skill to configure the `NewsDetail` route enhancer correctly.
- **`typo3-site-config-sets`** — EXT:news provides a dedicated Site Set (`georgringer/news-sitemap`) for sitemap settings. Use this skill for Site Set conventions when wiring news sitemap constants.

## Follow This Workflow

### 1. Confirm the installed baseline

Check `composer.json` and `vendor/georgringer/news` before making assumptions about available templates, partials, plugin names, or controller actions.

For a typical setup:

- `composer.json` requires `georgringer/news: ^14.0`
- the site package set depends on `georgringer/news` in `packages/my-site-package/Configuration/Sets/MySitePackage/config.yaml`

If the docs and vendor files differ, prefer the vendor package for implementation details and keep the skill output aligned with the official docs conceptually.

### 2. Install EXT:news the modern way

Install with Composer:

```bash
composer require georgringer/news
```

After installation:

- ensure the site set or template includes the News configuration
- keep News configuration inside the site package instead of scattering overrides across unrelated extensions
- use `ddev typo3` for TYPO3 CLI commands, never `ddev typo3cms`

When structural TYPO3 changes are involved, common maintenance commands are:

```bash
ddev typo3 cache:flush
ddev typo3 database:updateschema
ddev typo3 referenceindex:update
ddev typo3 cache:warmup
```

### 3. Keep configuration in the site package

Use the site package as the override boundary.

In a typical site package, News configuration belongs in:

- `packages/my-site-package/Configuration/Sets/MySitePackage/TypoScript/plugin.typoscript`
- `packages/my-site-package/Configuration/Sets/MySitePackage/settings.definitions.yaml`
- `packages/my-site-package/Resources/Private/Templates/News/`
- `packages/my-site-package/Resources/Private/Partials/News/`
- `packages/my-site-package/Resources/Private/Layouts/` if a News layout override is truly needed

Do not place News Fluid overrides inside `vendor/`.
Do not create a custom extension just to skin News.

### 4. Configure the base `plugin.tx_news`

Set the shared view paths and the project defaults centrally.

Use this exact pattern:

```typoscript
plugin.tx_news {
    view {
        templateRootPaths.10 = EXT:my_site_package/Resources/Private/Templates/
        partialRootPaths.10 = EXT:my_site_package/Resources/Private/Partials/
        layoutRootPaths.10 = EXT:my_site_package/Resources/Private/Layouts/
    }
    settings {
        startingpoint = {$mysitepackage.pages.newsStorage}
        detailPid = {$mysitepackage.pages.newsDetail}
        searchResultPid = {$mysitepackage.pages.searchResultPid}
        limit = 10
        format = html
    }
}
```

Use these settings intentionally:

- `startingpoint`: storage PID for news records
- `detailPid`: target page for detail links
- `listPid`: target page for list pages when a plugin needs it
- `searchResultPid`: target page for search results
- `limit`: default number of records per page

Prefer Site Set constants for page IDs:

- `{$mysitepackage.pages.newsStorage}`
- `{$mysitepackage.pages.newsDetail}`
- `{$mysitepackage.pages.searchResultPid}`
- `{$mysitepackage.news.heroBackgroundImage}`

### 5. Choose the correct frontend plugin

EXT:news exposes multiple content-element plugins. Pick the smallest native plugin that matches the use case before introducing extra TypoScript.

Use this plugin map:

| Purpose | Plugin name | CType | Controller action | Default template |
|---|---|---|---|---|
| List that can switch to detail on detail URLs | `Pi1` | `news_pi1` | `list,detail` | `Templates/News/List.html` and `Detail.html` |
| List only, never hijack into detail | `NewsListSticky` | `news_newsliststicky` | `list` | `Templates/News/List.html` |
| Curated article list | `NewsSelectedList` | `news_newsselectedlist` | `selectedList` | `Templates/News/SelectedList.html` |
| Standalone detail renderer | `NewsDetail` | `news_newsdetail` | `detail` | `Templates/News/Detail.html` |
| Date archive menu | `NewsDateMenu` | `news_newsdatemenu` | `dateMenu` | `Templates/News/DateMenu.html` |
| Search form | `NewsSearchForm` | `news_newssearchform` | `searchForm` | `Templates/News/SearchForm.html` |
| Search results | `NewsSearchResult` | `news_newssearchresult` | `searchResult` | `Templates/News/SearchResult.html` |
| Category tree/filter | `CategoryList` | `news_categorylist` | `CategoryController::list` | `Templates/Category/List.html` |
| Tag list/filter | `TagList` | `news_taglist` | `TagController::list` | `Templates/Tag/List.html` |

Important behavior rules:

- `news_pi1` is the classic list/detail hybrid. If the request contains a valid detail link payload, it renders detail instead of list.
- `news_newsliststicky` is the safe sidebar or companion list because it stays in list mode.
- `news_newsselectedlist` is the native curated-list plugin. Use it before inventing custom controllers.
- `news_newssearchform` and `news_newssearchresult` are separate plugins. Wire them with `listPid` or `searchResultPid` instead of hand-rolling search routing.

### 6. Clone plugin variants with TypoScript inheritance

For page-specific or variant-specific behavior, clone the base plugin settings instead of building custom Extbase plugins or custom News domain models.

Use TypoScript inheritance as the default pattern:

```typoscript
plugin.tx_news_newsliststicky < plugin.tx_news
plugin.tx_news_newsliststicky.settings.offset = 1

plugin.tx_news_newssearchform < plugin.tx_news
plugin.tx_news_newssearchform.settings.heroBackgroundImage = {$mysitepackage.news.heroBackgroundImage}

plugin.tx_news_newsselectedlist < plugin.tx_news
```

Use cloning for cases such as:

- sticky sidebar list
- lead-story offset list
- hero search form
- featured or curated list
- RSS-specific format switches

Do not create custom News controllers just to alter demand settings.
Do not introduce custom News domain models.
Stay on the native `{newsItem}` object provided by `NewsController`.

### 7. Override templates only in the site package

Place overrides here:

- `packages/my-site-package/Resources/Private/Templates/News/List.html`
- `packages/my-site-package/Resources/Private/Templates/News/Detail.html`
- `packages/my-site-package/Resources/Private/Templates/News/SearchForm.html`
- `packages/my-site-package/Resources/Private/Templates/News/SelectedList.html`

Extract shared markup into:

- `packages/my-site-package/Resources/Private/Partials/News/`

Use partials for repeated fragments such as:

- category badges
- card media blocks
- lead cards
- compact cards
- pagination
- related article rows
- sidebar trending cards
- meta information rows

Do not duplicate the same card or badge markup across List, Detail, SearchForm, and SelectedList templates when a partial can carry it once.

### 8. Preserve EXT:news detail SEO behavior

When overriding `Detail.html`, keep the vendor SEO and page-header logic intact.

Always preserve these elements near the top of the file:

```html
<n:excludeDisplayedNews newsItem="{newsItem}" />
<f:if condition="{settings.detail.showMetaTags}">
    <f:render partial="Detail/Opengraph" arguments="{newsItem: newsItem, settings:settings}" />
</f:if>
<n:titleTag>
    ...
</n:titleTag>
```

These are not decorative:

- `<n:excludeDisplayedNews>` prevents the current detail article from reappearing in exclusion-aware lists
- `<n:titleTag>` keeps the page title integration intact
- `Detail/Opengraph` keeps OpenGraph and related meta output working

If you redesign the detail page heavily, keep those calls and then rebuild the visual structure below them.

### 9. Render related and trending content with native News data

For related content in detail view, use the native relation already exposed by EXT:news:

```html
<f:if condition="{newsItem.relatedSorted}">
    <f:for each="{newsItem.relatedSorted}" as="relatedItem">
        <f:render partial="News/SidebarRelatedItem" arguments="{newsItem: relatedItem, settings: settings}" />
    </f:for>
</f:if>
```

Use `{newsItem.relatedSorted}` for Related News.

For trending or editorial sidebars:

- prefer a second native News plugin instance or a TypoScript-cloned plugin variant
- pass only the minimum settings needed
- keep the detail template free of custom persistence logic

Do not query the database manually from Fluid.
Do not bypass Extbase with ad-hoc SQL for standard News rendering.

### 10. Render images with TYPO3 image ViewHelpers

Use native TYPO3 image rendering so FAL processing, cropping, responsive output, and WebP generation keep working.

Preferred pattern:

```html
<f:if condition="{newsItem.firstPreview}">
    <f:image image="{newsItem.firstPreview}" maxWidth="1200" alt="{newsItem.firstPreview.originalResource.alternative}" />
</f:if>
```

Acceptable fallback when needed:

```html
<f:image image="{newsItem.falMedia.0}" maxWidth="1200" />
```

If a CSS background image is required, derive the URL with `f:uri.image`, but still keep the source object in TYPO3 FAL:

```html
style="background-image:url('{f:uri.image(src: heroImage.uid, treatIdAsReference: 1, maxWidth: 1600)}')"
```

Do not hardcode processed file URLs.
Do not replace TYPO3 image rendering with raw `<img src="/fileadmin/...">` paths for News media.

### 11. Style News templates through the Tailwind v4 pipeline

All News styling must use the site package Tailwind workflow.

When adding or changing utility classes in News Fluid templates:

```bash
ddev exec "cd packages/my-site-package && npm run build"
ddev typo3 cache:flush
```

Remember:

- Tailwind classes in Fluid templates are not visible until the CSS build runs
- TYPO3 may serve stale markup or assets until caches are flushed
- the Tailwind entry point is `packages/my-site-package/Resources/Private/Assets/Css/main.css`
- `@source` coverage must include the News templates and partials

Do not verify visual changes before rebuilding CSS and flushing caches.

### 12. Keep semantic HTML and local overrides

Preserve semantic tags like `<h1>` and `<h2>` in News templates.

If global typography fights with a News-specific design, use Tailwind's `!` modifier on the semantic element instead of downgrading it to a `<div>`.

### 13. Respect SearchForm and SearchResult routing

Use the native News search plugins and wire them with page IDs.

Project pattern:

- set `searchResultPid` centrally in TypoScript
- set custom SearchForm visuals through template override and cloned settings
- keep the request parameter structure compatible with EXT:news

If you build a custom search form override, keep it compatible with the plugin's expected request names and target page.

### 14. Cover every UI change with Playwright VRT

Any visual change to News List, Detail, SearchForm, SelectedList, or shared partials requires a Playwright visual regression check tagged `@stitch-vrt`.

Run Playwright only inside DDEV:

```bash
ddev exec "cd packages/my-site-package && npx playwright test"
```

For rapid iteration, run the relevant spec directly:

```bash
ddev exec "cd packages/my-site-package && npx playwright test Tests/e2e/news.spec.ts --grep @stitch-vrt"
```

Before running VRT:

```bash
ddev exec "cd packages/my-site-package && npm run build"
ddev typo3 cache:flush
```

Use environment variables for editor-managed page URLs because plugin pages are not predictable:

- `NEWS_LIST_TEST_URL`
- `NEWS_DETAIL_TEST_URL`
- `NEWS_SEARCH_TEST_URL` if the scenario needs it

Do not hardcode guessed TYPO3 plugin URLs in the tests.
Ask the user for the actual page URLs when a new News page is being tested.

### 15. Match Stitch designs when changing UI

If a News template or partial changes visually, compare it against the authoritative Stitch references under `docs/designs/stitch/`.

Keep the UI aligned with the design system and fix deviations before calling the work done.

## Project Defaults To Reuse

Prefer project-specific anchors exposed by the site package constants (names are examples — use whatever your site package defines):

- storage PID constant: `{$mysitepackage.pages.newsStorage}`
- detail PID constant: `{$mysitepackage.pages.newsDetail}`
- search result PID constant: `{$mysitepackage.pages.searchResultPid}`
- RSS constants under `{$mysitepackage.news.feed.*}`
- hero search background: `{$mysitepackage.news.heroBackgroundImage}`

Prefer existing override files in the site package as extension points (adjust the package path to your project):

- `packages/my-site-package/Resources/Private/Templates/News/List.html`
- `packages/my-site-package/Resources/Private/Templates/News/Detail.html`
- `packages/my-site-package/Resources/Private/Templates/News/SearchForm.html`
- `packages/my-site-package/Resources/Private/Templates/News/SelectedList.html`
- `packages/my-site-package/Resources/Private/Partials/News/CardLead.html`
- `packages/my-site-package/Resources/Private/Partials/News/CardGrid.html`
- `packages/my-site-package/Resources/Private/Partials/News/CardCompact.html`
- `packages/my-site-package/Resources/Private/Partials/News/CardMedia.html`
- `packages/my-site-package/Resources/Private/Partials/News/SidebarRelatedItem.html`
- `packages/my-site-package/Resources/Private/Partials/News/SidebarTrendingCard.html`

## Avoid These Mistakes

- Do not override News templates in `vendor/`
- Do not create custom News domain models for simple rendering changes
- Do not bypass `NewsController` just to get a differently styled list
- Do not remove `<n:excludeDisplayedNews>`, `<n:titleTag>`, or the OpenGraph partial from `Detail.html`
- Do not render News media with raw file paths when `f:image` or `f:uri.image` can do the job
- Do not forget the Tailwind build and TYPO3 cache flush after template class changes
- Do not run Playwright on the host machine; run it inside DDEV
- Do not invent News plugin page URLs; ask for them or consume them from environment variables
