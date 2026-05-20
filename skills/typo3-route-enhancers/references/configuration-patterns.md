# Route Enhancer Configuration Patterns

## Extbase Route Enhancer Base Pattern

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

## Aspect Mappers Reference

| Type | Use Case | Example |
|------|----------|---------|
| `PersistedAliasMapper` | Record slugs | `tableName`, `routeFieldName` |
| `StaticRangeMapper` | Bounded numbers | `start`, `end` |
| `StaticValueMapper` | Fixed whitelist | `mapping` |
| `PersistedPatternMapper` | Composed values | `routeFieldPattern` |

## Requirements Reference

```yaml
requirements:
  year: '\d{4}'
  month: '\d{1,2}'
  page: '\d+'
```

## Common _arguments Mappings

```yaml
# Simple parameter
_arguments:
  item: 'item'

# Nested Extbase parameters
_arguments:
  tag: 'overwriteDemand/tags'
  year: 'overwriteDemand/year'
  month: 'overwriteDemand/month'

# Pagination widget
_arguments:
  page: '@widget_0/currentPage'
```

## cHash Guidelines

Good candidates for cHash-free URLs:
- Record slugs via `PersistedAliasMapper`
- Page numbers via `StaticRangeMapper`
- Month/year archives via strict numeric ranges

Open-ended parameters require cHash - this is normal and correct.
