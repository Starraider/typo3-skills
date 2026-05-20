# Sitemap Configuration Patterns

## Page Sitemap TypoScript

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

## Record Sitemap TypoScript

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

## Site Route Enhancer Patterns

### Simple PageType Enhancer
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

### Named Sitemap Sections
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

## Custom Provider Skeleton

```php
<?php
declare(strict_types=1);

namespace Vendor\Extension\XmlSitemap;

use TYPO3\CMS\Seo\XmlSitemap\AbstractXmlSitemapDataProvider;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Database\Connection;
use TYPO3\CMS\Core\Utility\GeneralUtility;

class CustomXmlSitemapDataProvider extends AbstractXmlSitemapDataProvider
{
    protected int $numberOfItemsPerPage = 50000;

    public function __construct(
        private readonly string $table,
        private readonly int $detailPageId,
        private readonly string $pluginNamespace
    ) {
    }

    public function getNumberOfItems(): int
    {
        $queryBuilder = GeneralUtility::makeInstance(ConnectionPool::class)
            ->getQueryBuilderForTable($this->table);

        return (int) $queryBuilder
            ->count('uid')
            ->from($this->table)
            ->where(
                $queryBuilder->expr()->isNotNull('slug'),
                $queryBuilder->expr()->neq('slug', $queryBuilder->createNamedParameter('', Connection::PARAM_STR))
            )
            ->executeQuery()
            ->fetchOne();
    }

    protected function getItems(int $offset, int $limit): array
    {
        $queryBuilder = GeneralUtility::makeInstance(ConnectionPool::class)
            ->getQueryBuilderForTable($this->table);

        $rows = $queryBuilder
            ->select('uid', 'slug', 'tstamp', 'sys_language_uid')
            ->from($this->table)
            ->where(
                $queryBuilder->expr()->isNotNull('slug'),
                $queryBuilder->expr()->neq('slug', $queryBuilder->createNamedParameter('', Connection::PARAM_STR))
            )
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->orderBy('sorting', 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        $items = [];
        foreach ($rows as $row) {
            $items[] = [
                'loc' => $this->getDetailUrl($row),
                'lastmod' => date('c', (int) $row['tstamp']),
            ];
        }

        return $items;
    }

    private function getDetailUrl(array $row): string
    {
        return 'https://example.test/?id=' . $this->detailPageId
            . '&' . $this->pluginNamespace . '[controller]=Record'
            . '&' . $this->pluginNamespace . '[action]=show'
            . '&' . $this->pluginNamespace . '[record]=' . $row['uid'];
    }
}
```

## Troubleshooting Table

| Symptom | Likely cause | Fix |
|---|---|---|
| `/sitemap.xml` returns 404 | Missing PageType route enhancer | Add sitemap route enhancer in site config |
| Sitemap section URL fails | StaticValueMapper key mismatch | Make route map values and TypoScript keys identical |
| Record URLs with query params | Detail route enhancer mismatch | Fix `_arguments`, `aspects`, and `limitToPages` |
| Invalid parameter error | Empty slug or wrong mapper input | Pass UID for PersistedAliasMapper, filter empty aliases |
| "No tables used" error | QueryBuilder missing `from()` | Add explicit `from($table)` |
| Hidden/deleted records appear | Missing restrictions | Use TYPO3 restrictions or add explicit constraints |
| Wrong language URLs | Missing language overlay | Generate links in active site language context |
