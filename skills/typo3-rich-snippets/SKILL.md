---
name: typo3-rich-snippets
description: Generate, validate, and implement structured data (Rich Snippets) for TYPO3 web pages to improve SEO. Identifies appropriate schema.org types, produces JSON-LD/Microdata/RDFa markup, provides TYPO3 Fluid and TypoScript integration, and validates against Google Rich Results expectations. Use when the user mentions rich snippets, structured data, schema markup, JSON-LD, schema.org, or SEO structured data in a TYPO3 context.
---

# Rich Snippets

## Overview

This skill helps generate, validate, and integrate structured data markup for web pages. It covers the full lifecycle: choosing schema types, producing markup, injecting it via server-side (TYPO3 Fluid) or client-side (JS) rendering, and validating output.

## Workflow

### 1. Identify Content Type

Determine the primary schema.org type for the page content:

| Content | Schema Type | Google Rich Result |
|---------|------------|-------------------|
| Blog/News | `Article` / `NewsArticle` / `BlogPosting` | Article carousel, Top stories |
| Store/Business | `LocalBusiness` (or subtype) | Knowledge Panel, Maps |
| Event | `Event` | Event listing |
| Product | `Product` + `Offer` | Product snippet, Merchant listing |
| FAQ | `FAQPage` + `Question` | FAQ accordion |
| Breadcrumb | `BreadcrumbList` | Breadcrumb trail |
| Review | `Review` / `AggregateRating` | Review stars |
| How-To | `HowTo` | Step-by-step rich result |
| Organization | `Organization` | Knowledge Panel |

If unsure, ask the user what content the page represents. One page can have multiple types (e.g., `BreadcrumbList` + `Article`).

### 2. Choose Output Format

| Format | When to Use |
|--------|------------|
| **JSON-LD** (default) | Google-recommended. Easiest to maintain. Decoupled from HTML. |
| **Microdata** | Legacy codebases already using it. Embedded in HTML attributes. |
| **RDFa** | Rare. Only if explicitly required. |

Always default to **JSON-LD** unless the user requests otherwise.

### 3. Generate Markup

Follow this checklist for every markup block:

- [ ] Set `@context` to `https://schema.org`
- [ ] Use the most specific `@type` (e.g., `NewsArticle` over `Article`)
- [ ] Include all **required** properties (see [references/reference.md](references/reference.md))
- [ ] Include **recommended** properties where data is available
- [ ] Use `@id` for entity cross-referencing within the page
- [ ] Use ISO 8601 for all dates
- [ ] Use absolute URLs for all `url`, `image`, `logo` properties
- [ ] For multi-language content, add `inLanguage` property

### 4. Integrate into the Page

**Server-side (TYPO3 Fluid):** See [references/typo3-integration.md](references/typo3-integration.md)
**Client-side (JS):** Inject a `<script type="application/ld+json">` element dynamically.

Quick Fluid example:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{article.title}",
  "datePublished": "{f:format.date(date: article.datetime, format: 'c')}",
  "author": {
    "@type": "Person",
    "name": "{article.author}"
  }
}
</script>
```

### 5. Validate

Run validation in this order:

1. **Syntax check** the JSON-LD (must be valid JSON)
2. **Schema.org compliance**: all properties must match expected types
3. **Google Rich Results Test**: https://search.google.com/test/rich-results
4. **Schema Markup Validator**: https://validator.schema.org/

For automated validation, see [references/testing.md](references/testing.md) and `scripts/validate-jsonld.js`.

## Common Pitfalls

| Issue | Solution |
|-------|---------|
| Mixing JSON-LD and Microdata for same entity | Pick one format per entity |
| Duplicate `@id` across pages | Use page-unique URIs as `@id` (e.g., `https://example.com/page#article`) |
| Missing `@context` | Always include `"@context": "https://schema.org"` |
| Relative URLs in `image`/`url` | Always use absolute URLs |
| Using `Review` for self-serving reviews | Google prohibits reviews about your own business |
| `FAQPage` with user-generated Q&A | Use `QAPage` instead; `FAQPage` is for site-authored content |
| Incorrect `@type` hierarchy | Check schema.org inheritance (e.g., `Store` extends `LocalBusiness`) |
| Missing `Offer` on `Product` | Products without pricing data won't trigger merchant listings |
| Dates without timezone | Always include timezone offset in ISO 8601 dates |

## Best Practices

1. **One canonical entity per page**: Use `mainEntityOfPage` to declare the primary entity
2. **Nest related entities**: Embed `author`, `publisher`, `offers` inline rather than separate blocks
3. **Keep markup in sync with visible content**: Google requires structured data to reflect what users see
4. **Use `sameAs` for disambiguation**: Link to Wikipedia, Wikidata, or social profiles
5. **Provide multiple image aspect ratios**: 16:9, 4:3, 1:1 (min 50K pixels)
6. **Test after every change**: Validate before deploying to production
7. **Monitor in Google Search Console**: Check "Enhancements" reports for errors

## Load References As Needed

- Detailed type reference and JSON-LD examples: [references/reference.md](references/reference.md)
- TYPO3 Fluid & TypoScript integration: [references/typo3-integration.md](references/typo3-integration.md)
- Testing strategies and automated validation: [references/testing.md](references/testing.md)
- Validation script: `scripts/validate-jsonld.js`
