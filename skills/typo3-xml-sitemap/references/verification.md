# Verification and Diagnostic Commands

## Sitemap Verification Commands

```bash
# Check sitemap XML output
curl -s "https://example.test/sitemap.xml" | head -50

# Check specific sitemap section
curl -s "https://example.test/sitemap-type/records/sitemap.xml" | grep '<loc>'

# Flush caches and retry
vendor/bin/typo3 cache:flush
```

## SQL Diagnostics

### Find Records with Empty Slugs
```sql
SELECT uid, slug
FROM tx_extension_domain_model_record
WHERE deleted = 0
  AND (slug IS NULL OR slug = '')
LIMIT 20;
```

### Check Sitemap Configuration
```bash
# Show active SEO configuration
ddev typo3 configuration:show plugin.tx_seo.config.xmlSitemap

# Clear all caches
ddev typo3 cache:flush

# Warm caches
ddev typo3 cache:warmup
```

## Common Verification Steps

After each change:

1. Flush TYPO3 caches
2. Open `/sitemap.xml` and confirm XML response
3. Open each sitemap listed in the sitemap index
4. Confirm record URLs are speaking URLs when route enhancers are expected
5. Confirm URLs resolve in every configured site language
6. Check for empty slug, missing detail page, or cHash fallbacks
7. Validate XML with search console tools

## Google Sitemap Limits

- Max 50,000 URLs per sitemap file
- Max 50MB uncompressed per sitemap
- Use sitemap index for larger sites
- Custom providers can set `$numberOfItemsPerPage`
