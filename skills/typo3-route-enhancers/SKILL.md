---
name: typo3-route-enhancers
description: Configure TYPO3 routeEnhancers for speaking URLs in site configuration, especially Extbase plugins with controller/action arguments, detail pages, filters, pagination, aliases, and cHash-sensitive parameters. Use when creating or fixing site config routing, mapping plugin GET parameters to route paths, or troubleshooting why TYPO3 falls back to query-string URLs.
---

# TYPO3 Route Enhancers

Configure route enhancers in TYPO3 site config so frontend plugin URLs resolve to stable speaking paths and back again. Focus on Extbase plugins with parameters, where `_arguments`, `aspects`, `requirements`, and page scoping determine whether TYPO3 generates clean URLs or falls back to query parameters.

## Workflow

1. Identify the real plugin namespace and parameter structure.
2. Choose the enhancer type, usually `Extbase` for Extbase plugins.
3. Map each URL variant with `routePath`, `_controller`, and `_arguments`.
4. Add strict `requirements` and appropriate `aspects` for slugs or bounded values.
5. Scope the enhancer with `limitToPages`, clear caches, and verify generation and resolving in both directions.

## Related Skills

- **`typo3-xml-sitemap`** — Sitemap providers rely on route enhancers to generate speaking URLs. If the detail page route enhancer is missing or misconfigured, sitemap URLs will contain raw query parameters. Use this skill when setting up `RecordsXmlSitemapDataProvider` or custom sitemap providers that need to produce speaking URLs.
- **`typo3-news-extension`** — EXT:news has a specific route enhancer pattern (slug field is `path_segment`, not `slug`). This skill covers the project's News TypoScript constants and plugin registration that the route enhancer must align with.
- **`typo3-site-config-sets`** — Route enhancers live in `config/sites/<site>/config.yaml`. This skill clarifies the boundary between site-specific config and reusable Site Set config.

## Decide The Configuration Shape

1. Determine whether the target is an Extbase plugin:
   - If the URL arguments look like `tx_extkey_plugin[key]=...`, use `type: Extbase` in most plugin cases.
   - If the plugin is not Extbase, inspect the namespace and use the matching enhancer pattern from TYPO3 core docs.
2. Prefer `extension` + `plugin` when you know the Extbase registration names.
3. Use `namespace` only when the raw GET namespace is known and more reliable than extension/plugin naming.
4. Add one `routes:` item per controller/action variant that should become a speaking URL.
5. Restrict matching with `limitToPages` whenever the plugin only appears on dedicated pages.

## Put The Config In The Right Place

- Store route enhancer configuration in `config/sites/<site>/config.yaml`.
- Do not put `routeEnhancers` in TypoScript.
- Treat the key under `routeEnhancers:` as an internal unique identifier only.
- Clear TYPO3 caches after every routing change.

## Build Extbase Route Enhancers

Use this base pattern for Extbase plugins:

```yaml
routeEnhancers:
  MyPlugin:
    type: Extbase
    limitToPages: [123]
    extension: MyExtension
    plugin: Listing
    routes:
      - routePath: '/list'
        _controller: 'Item::list'
      - routePath: '/detail/{item}'
        _controller: 'Item::show'
        _arguments:
          item: 'item'
    defaultController: 'Item::list'
    aspects:
      item:
        type: PersistedAliasMapper
        tableName: tx_myext_domain_model_item
        routeFieldName: slug
```

Interpret the keys as follows:

- `type`: select the enhancer implementation, usually `Extbase`.
- `limitToPages`: restrict enhancer matching to the page IDs that actually host the plugin.
- `extension`: Extbase extension name.
- `plugin`: Extbase plugin name.
- `namespace`: alternative to `extension` and `plugin`, for example `tx_news_pi1`.
- `routes`: list of speaking URL variants.
- `routePath`: path segment appended to the page route.
- `_controller`: `Controller::action` pair for this route.
- `_arguments`: map route placeholders to internal GET argument names.
- `defaultController`: fallback controller/action.
- `defaults`: optional default parameter values.
- `requirements`: regex constraints for placeholders.
- `aspects`: convert placeholders into static or persisted values TYPO3 can resolve safely.

## Map Placeholders To Real Parameters

Always inspect the real generated query parameters before writing `_arguments`.

Common mappings:

```yaml
_arguments:
  item: 'item'
```

```yaml
_arguments:
  tag: 'overwriteDemand/tags'
  year: 'overwriteDemand/year'
  month: 'overwriteDemand/month'
```

```yaml
_arguments:
  page: '@widget_0/currentPage'
```

Rules:

- The placeholder name on the left must match the `{placeholder}` used in `routePath`.
- The value on the right must match the internal plugin argument path exactly.
- Nested Extbase arguments often use slash notation like `overwriteDemand/tags`.
- Pagination widgets often require `@widget_0/currentPage` rather than a simple `page` key.
- If TYPO3 keeps rendering query parameters, the mapping usually does not match the real argument structure.

## Choose Aspects Deliberately

Use aspects to make route variables resolvable and as static as possible.

Prefer these patterns:

- `PersistedAliasMapper` for record slugs or other persisted alias fields.
- `StaticRangeMapper` for bounded numeric values such as pagination, months, or years.
- `StaticValueMapper` for a fixed whitelist of values.
- `PersistedPatternMapper` only when a composed persisted value is truly needed.

Example for a slug:

```yaml
aspects:
  item:
    type: PersistedAliasMapper
    tableName: tx_myext_domain_model_item
    routeFieldName: slug
```

Example for pagination:

```yaml
aspects:
  page:
    type: StaticRangeMapper
    start: '1'
    end: '100'
```

Guidance:

- Prefer dedicated slug fields over arbitrary title fields.
- Keep static ranges tight; TYPO3 recommends strict definitions and does not allow huge pagination ranges.
- Remember that aspect mapping takes precedence over `requirements` for the same variable.
- If slug values contain `/`, inspect whether `routeValuePrefix: '/'` is needed for the mapper.

### Open-Ended Search Terms: Do Not Use Routes

**Critical limitation:** Do NOT add route paths for free-text search parameters like `searchTerm`, `query`, or `sword`. TYPO3's built-in aspect mappers cannot handle arbitrary user input, and attempting to create speaking routes for search terms produces broken URLs where the route path matches but the parameter value is lost.

**What happens when you try:**
- TYPO3 generates URLs like `/faq/search/individualists/?cHash=abc...` (missing the actual parameter)
- The route matches the path, but `searchTerm` is not passed to the controller
- Result: 404 errors or empty search results

**Correct approach for search:**
- Do NOT add routes for search parameters
- Let TYPO3 use query parameters: `?tx_extkey_plugin[searchTerm]=value&cHash=...`
- This is the correct and expected behavior for dynamic search input
- Search result pages typically should not be indexed anyway (infinite URL variations)

**If you absolutely need speaking search URLs:**
- Create a custom aspect mapper (like ke_search's `KeSearchUrlEncodeMapper`)
- Implement `TYPO3\CMS\Core\Routing\Aspect\MapperInterface`
- Handle URL encoding/decoding for special characters
- Register the mapper in `Services.yaml`

Example of what NOT to do:

```yaml
# WRONG - this produces broken URLs
routes:
  - routePath: '/search/{searchTerm}'
    _controller: 'Faq::list'
    _arguments:
      searchTerm: searchTerm
requirements:
  searchTerm: '[a-zA-Z0-9]+'  # Still fails - no aspect mapper
```

Instead, simply omit search routes and let the form submit to query parameters naturally.

## Control cHash Instead Of Fighting It

- Treat captured route arguments as dynamic unless made static or strictly mappable.
- Expect TYPO3 to add `cHash` when parameters remain dynamic.
- Do not try to suppress `cHash` manually.
- Reduce or eliminate `cHash` only by using strict `aspects` and bounded values that TYPO3 can validate deterministically.

Good candidates for cHash-free speaking URLs:

- record slugs via `PersistedAliasMapper`
- page numbers via `StaticRangeMapper`
- month/year archives via strict numeric ranges

If a parameter is open-ended, `cHash` is normal and correct.

## Use Strict Requirements

Add `requirements` whenever placeholders accept only a narrow shape:

```yaml
requirements:
  year: '\d{4}'
  month: '\d{1,2}'
```

Prefer strict regexes because they:

- improve matching accuracy
- avoid ambiguous routes
- reduce unnecessary routing work

Do not rely on loose catch-all patterns when a precise pattern is known.

## Ready-Made Patterns

### List And Detail

```yaml
routeEnhancers:
  Catalog:
    type: Extbase
    limitToPages: [45]
    extension: Catalog
    plugin: Products
    routes:
      - routePath: '/products'
        _controller: 'Product::list'
      - routePath: '/products/{product}'
        _controller: 'Product::show'
        _arguments:
          product: 'product'
    defaultController: 'Product::list'
    aspects:
      product:
        type: PersistedAliasMapper
        tableName: tx_catalog_domain_model_product
        routeFieldName: slug
```

### Pagination

```yaml
routeEnhancers:
  Catalog:
    type: Extbase
    limitToPages: [45]
    extension: Catalog
    plugin: Products
    routes:
      - routePath: '/products/page/{page}'
        _controller: 'Product::list'
        _arguments:
          page: '@widget_0/currentPage'
    defaultController: 'Product::list'
    defaults:
      page: '1'
    aspects:
      page:
        type: StaticRangeMapper
        start: '1'
        end: '99'
```

### Filter Or Archive Parameters

```yaml
routeEnhancers:
  Events:
    type: Extbase
    limitToPages: [87]
    extension: Events
    plugin: Listing
    routes:
      - routePath: '/archive/{year}/{month}'
        _controller: 'Event::list'
        _arguments:
          year: 'overwriteDemand/year'
          month: 'overwriteDemand/month'
    defaultController: 'Event::list'
    requirements:
      year: '\d{4}'
      month: '\d{1,2}'
    aspects:
      year:
        type: StaticRangeMapper
        start: '2020'
        end: '2035'
      month:
        type: StaticRangeMapper
        start: '1'
        end: '12'
```

### Tag Or Category Alias

```yaml
routeEnhancers:
  NewsTags:
    type: Extbase
    limitToPages: [13]
    extension: News
    plugin: Pi1
    routes:
      - routePath: '/tag/{tag}'
        _controller: 'News::list'
        _arguments:
          tag: 'overwriteDemand/tags'
    defaultController: 'News::list'
    aspects:
      tag:
        type: PersistedAliasMapper
        tableName: tx_news_domain_model_tag
        routeFieldName: slug
```

## Troubleshoot Systematically

If TYPO3 does not use the speaking route:

1. Confirm the config is in `config/sites/<site>/config.yaml`.
2. Confirm the page ID is covered by `limitToPages`.
3. Confirm `extension` and `plugin` or `namespace` match the actual plugin.
4. Confirm `_controller` matches an existing controller/action.
5. Confirm every `_arguments` path matches the actual GET parameter structure.
6. Confirm `requirements` are satisfied by the test URL.
7. Confirm `aspects` resolve real database values or valid static ranges.
8. Clear caches and retest link generation.

If TYPO3 falls back to query parameters, treat that as a matching failure, not a rendering preference.

## Verify Both Directions

After editing route enhancers:

1. Generate a frontend link through TYPO3 and inspect whether it becomes a speaking URL.
2. Open the speaking URL and confirm TYPO3 resolves it to the intended controller/action and arguments.
3. Test edge cases such as missing slugs, out-of-range pages, and invalid filter values.
4. Confirm the same enhancer does not accidentally match unrelated pages.

Use this quick checklist before declaring routing done:

- plugin page renders
- list route resolves
- detail route resolves
- pagination route resolves if present
- filter route resolves if present
- invalid values fail predictably
- no unexpected duplicate route paths exist

## Common Mistakes

- Put route enhancers in TypoScript instead of site config.
- Forget `limitToPages` and accidentally affect unrelated pages.
- Use the wrong plugin namespace or wrong Extbase plugin name.
- Map `_arguments` to simplified names instead of the real nested parameter path.
- Use free-text database fields instead of dedicated slug fields.
- Write duplicate `routePath` definitions that conflict with another enhancer.
- Expect `requirements` to matter when an aspect already owns that variable.
- Change routing config without clearing caches.
- Add routes for open-ended search terms (`searchTerm`, `query`, `sword`) - this produces broken URLs where the path matches but the parameter is lost. Use query parameters for search instead.

## Output Expectations

When applying this skill, produce:

- the exact `config/sites/<site>/config.yaml` block to add or adjust
- a short explanation of how each placeholder maps to real plugin arguments
- any required slug, mapper, or page-scoping assumptions
- a verification checklist covering generation, resolving, and cHash behavior

## Load References As Needed

- Configuration patterns and aspect mappers: [references/configuration-patterns.md](references/configuration-patterns.md)
- Ready-made patterns and verification checklist: [references/ready-made-patterns.md](references/ready-made-patterns.md)
