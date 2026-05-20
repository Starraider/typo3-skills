# Ready-Made Route Enhancer Patterns

## List And Detail

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

## Pagination

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

## Filter Or Archive Parameters

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

## Tag Or Category Alias

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

## Verification Checklist

Before declaring routing done:

- plugin page renders
- list route resolves
- detail route resolves
- pagination route resolves if present
- filter route resolves if present
- invalid values fail predictably
- no unexpected duplicate route paths exist
