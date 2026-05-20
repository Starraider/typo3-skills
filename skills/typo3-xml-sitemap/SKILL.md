---
name: typo3-xml-sitemap
description: Configure TYPO3 v14 XML sitemaps with EXT:seo, multi-language support, page sitemaps, custom record sitemaps, PageType route enhancer mapping, and speaking URL generation for record detail pages. Use when adding, fixing, or extending `/sitemap.xml`, `RecordsXmlSitemapDataProvider`, custom sitemap data providers, EXT:news sitemap setup, hreflang-aware record links, or sitemap route enhancer configuration in a TYPO3 v14 project.
---

# TYPO3 XML Sitemap Configuration

Use this skill for TYPO3 v14 projects that use EXT:seo XML sitemaps. Keep examples generic and replace extension keys, table names, plugin namespaces, page IDs, sitemap names, and URLs with values from the current project.

## When To Use

- Add XML sitemap support to a TYPO3 v14 site
- Configure `/sitemap.xml` access through a PageType route enhancer
- Generate sitemaps for custom record detail pages
- Enable or debug language-specific sitemaps
- Configure `RecordsXmlSitemapDataProvider`
- Implement a custom `XmlSitemapDataProvider`
- Align sitemap URL generation with route enhancers
- Configure EXT:news or other extension-provided sitemap providers
- Add hreflang-aware record URLs

## Prerequisites

- TYPO3 v14
- EXT:seo installed and active
- Site configuration in `config/sites/<site-identifier>/config.yaml`
- A route enhancer for every speaking record detail URL the sitemap should output

## Related Skills

- `typo3-route-enhancers`: use when record sitemap URLs fall back to query parameters or when a detail-page route is missing.
- `typo3-site-config-sets`: use when deciding whether sitemap TypoScript/settings belong in a reusable Site Set or in a concrete site's `settings.yaml`.

## Core Architecture

TYPO3's sitemap system has three layers:

1. **Sitemap index**: `/sitemap.xml` lists the available sitemap providers.
2. **Sitemap providers**: page, record, or extension-specific providers generate sitemap XML.
3. **Route enhancers**: convert generated query parameters into speaking URLs.

TYPO3 ships these common provider options:

| Provider | When to use |
|---|---|
| `PagesXmlSitemapDataProvider` | Normal page tree sitemap entries |
| `RecordsXmlSitemapDataProvider` | Simple record tables with a detail page and standard UID/slug routing |
| Custom `*XmlSitemapDataProvider` | Domain-specific URL logic, category-dependent detail pages, Google News rules, custom filtering, or multiple record URL strategies |

## Required Site Route Enhancer

Ensure the site config exposes sitemap page types:

```yaml
routeEnhancers:
  Sitemap:
    type: PageType
    map:
      sitemap.xml: 1533906435
      sitemap.txt: 1533906436
    defaults:
      page: 0
```

If the site uses named sitemap sections such as `/sitemap-type/<name>/sitemap.xml`, keep the `StaticValueMapper` map keys identical to the TypoScript sitemap keys.

```yaml
routeEnhancers:
  Sitemap:
    type: PageType
    routePath: '/sitemap-type/{sitemap}/sitemap.xml'
    map:
      sitemap.xml: 1533906435
    aspects:
      sitemap:
        type: StaticValueMapper
        map:
          pages: pages
          records: records
```

## Page Sitemap

Use EXT:seo's page sitemap as the default starting point. Adjust root pages, excluded doktypes, and additional filters only when the project requires it.

```typoscript
plugin.tx_seo.config.xmlSitemap {
  sitemaps {
    pages {
      provider = TYPO3\CMS\Seo\XmlSitemap\PagesXmlSitemapDataProvider
      config {
        excludedDoktypes = 3, 4, 6, 7, 199, 254, 255
      }
    }
  }
}
```

## Record Sitemap With Core Provider

Use the core record provider for simple table-to-detail-page mappings.

```typoscript
plugin.tx_seo.config.xmlSitemap {
  sitemaps {
    records {
      provider = TYPO3\CMS\Seo\XmlSitemap\RecordsXmlSitemapDataProvider
      config {
        table = tx_extension_domain_model_record
        sortField = sorting
        lastModifiedField = tstamp
        pid = 123
        recursive = 1
        url {
          pageId = 456
          fieldToParameterMap {
            uid = tx_extension_plugin[record]
          }
          additionalGetParameters {
            tx_extension_plugin.controller = Record
            tx_extension_plugin.action = show
          }
          useCacheHash = 1
        }
      }
    }
  }
}
```

Adapt these placeholders:

- `records`: sitemap key; must match route enhancer maps if used there
- `tx_extension_domain_model_record`: source table
- `pid`: storage folder/page IDs
- `pageId`: detail page ID
- `tx_extension_plugin`: real plugin namespace
- `record`: Extbase argument name used by the detail action

## PersistedAliasMapper Rule

When the detail route enhancer uses `PersistedAliasMapper`, pass the record UID to `typolink` or `fieldToParameterMap`. The mapper resolves the configured slug field from the UID.

```typoscript
# Correct: route enhancer receives the UID and resolves the slug itself.
fieldToParameterMap {
  uid = tx_extension_plugin[record]
}
```

Do not pass the slug field as the Extbase argument unless the route enhancer explicitly expects a raw slug and does not use `PersistedAliasMapper`.

## Filter Invalid Slugs

Records with empty or null slug values can break URL generation when the route requires a non-empty alias. Filter them out in custom providers, or ensure editors generate slugs before records are included.

```php
$constraints[] = $queryBuilder->expr()->isNotNull('slug');
$constraints[] = $queryBuilder->expr()->neq(
    'slug',
    $queryBuilder->createNamedParameter('', \TYPO3\CMS\Core\Database\Connection::PARAM_STR)
);
```

For diagnostics, query the current table with its actual field names:

```sql
SELECT uid, slug
FROM tx_extension_domain_model_record
WHERE deleted = 0
  AND (slug IS NULL OR slug = '')
LIMIT 20;
```

## Custom Provider Checklist

Implement a custom provider when the core record provider cannot express the required URL logic.

Key implementation rules:

- Extend `TYPO3\CMS\Seo\XmlSitemap\AbstractXmlSitemapDataProvider`.
- Add an explicit `from($table)` for count and record queries.
- Use TYPO3 query restrictions instead of hand-written `deleted = 0` and `hidden = 0` clauses where possible.
- Respect language overlays when generating localized URLs.
- Exclude records that cannot generate valid public detail URLs.
- Keep provider configuration generic through TypoScript or site settings.
- Set `lastmod` from a reliable timestamp field when available.
- Keep the generated record argument compatible with the route enhancer.

Example query skeleton:

```php
$queryBuilder = GeneralUtility::makeInstance(ConnectionPool::class)
    ->getQueryBuilderForTable($table);

$rows = $queryBuilder
    ->select('uid', 'slug', 'tstamp', 'sys_language_uid')
    ->from($table)
    ->where(
        $queryBuilder->expr()->isNotNull('slug'),
        $queryBuilder->expr()->neq(
            'slug',
            $queryBuilder->createNamedParameter('', Connection::PARAM_STR)
        )
    )
    ->orderBy('sorting', 'ASC')
    ->executeQuery()
    ->fetchAllAssociative();
```

## Sitemap Size Limits

Google accepts up to 50,000 URLs or 50MB uncompressed per sitemap file. TYPO3 providers may paginate sitemap output. For custom providers with large record sets, set a suitable `numberOfItemsPerPage` and verify the sitemap index links all pages correctly.

```php
protected int $numberOfItemsPerPage = 50000;
```

## EXT:news Notes

EXT:news ships its own sitemap patterns and often uses `path_segment` rather than a generic `slug` field. Align configuration with the installed EXT:news version, plugin namespace, storage PIDs, detail page ID, and route enhancer. For Google News, include only eligible recent articles according to Google's Google News sitemap requirements.

## Verification Workflow

After each change:

1. Flush TYPO3 caches using the available cache-flush command.
2. Open `/sitemap.xml` and confirm it returns XML, not an exception page.
3. Open each sitemap listed in the sitemap index.
4. Confirm record URLs are speaking URLs when route enhancers are expected.
5. Confirm URLs resolve in every configured site language.
6. Check for empty slug, missing detail page, or cHash/query-string fallbacks.
7. Validate the generated XML with an XML parser or search-console style validation.

Useful generic commands:

```bash
curl -s "https://example.test/sitemap.xml" | head -50
curl -s "https://example.test/sitemap-type/records/sitemap.xml" | grep '<loc>'
vendor/bin/typo3 cache:flush
```

Use the local domain and CLI wrapper when they differ.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `/sitemap.xml` returns 404 | Missing PageType route enhancer or wrong type number | Add or correct the sitemap route enhancer in site config |
| Sitemap index lists a key but section URL fails | `StaticValueMapper` key does not match TypoScript sitemap key | Make route map values and TypoScript keys identical |
| Record URLs contain raw query parameters | Detail route enhancer does not match generated arguments | Inspect generated GET parameters and fix `_arguments`, `aspects`, and `limitToPages` |
| Route generation throws an invalid parameter error | Empty slug or mapper receives the wrong value | Pass UID for `PersistedAliasMapper` and filter records with empty aliases |
| SQL query reports "No tables used" | QueryBuilder count/select has no `from()` | Add an explicit `from($table)` |
| Hidden/deleted records appear | Restrictions were removed or filters are incomplete | Use TYPO3 restrictions or add equivalent constraints deliberately |
| Wrong language URLs | Language overlay/site language handling missing | Generate links in the active site language context |

## Output Expectations

When applying this skill, produce:

- the exact TypoScript sitemap block or PHP provider changes
- the exact `config/sites/<site>/config.yaml` route enhancer changes when needed
- a note about table, plugin namespace, detail page, storage PID, and slug-field assumptions
- verification steps with the actual local domain and TYPO3 CLI command

## Load References As Needed

- Sitemap configuration patterns: [references/configuration-patterns.md](references/configuration-patterns.md)
- Verification and diagnostic commands: [references/verification.md](references/verification.md)
