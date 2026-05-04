# Testing & Validation

Strategies for manual validation, automated unit/integration tests, and CI pipeline integration.

## Manual Validation Tools

| Tool | URL | Purpose |
|------|-----|---------|
| Google Rich Results Test | https://search.google.com/test/rich-results | Test if markup qualifies for Google rich results |
| Schema Markup Validator | https://validator.schema.org/ | Validate against full schema.org spec |
| Google Search Console | (your property) > Enhancements | Monitor live indexing errors per type |

### Testing Workflow

1. Deploy or preview the page
2. Run **Rich Results Test** with the live URL or paste HTML source
3. Fix any errors (red) and warnings (yellow)
4. Run **Schema Markup Validator** for schema.org compliance beyond Google's subset
5. After deployment, monitor **Search Console > Enhancements** for ongoing issues

## Automated JSON-LD Validation

### Unit Tests: Validate JSON-LD Structure

Test that your controllers/data processors produce valid JSON-LD.

**PHPUnit example (TYPO3 Extbase controller):**

```php
<?php
declare(strict_types=1);

namespace MyVendor\MyExtension\Tests\Unit\Service;

use PHPUnit\Framework\TestCase;
use MyVendor\MyExtension\Service\JsonLdGenerator;

class JsonLdGeneratorTest extends TestCase
{
    private JsonLdGenerator $generator;

    protected function setUp(): void
    {
        $this->generator = new JsonLdGenerator();
    }

    public function testArticleJsonLdContainsRequiredProperties(): void
    {
        $data = [
            'title' => 'Test Article',
            'date' => new \DateTime('2025-01-15T08:00:00+01:00'),
            'author' => 'Jane Doe',
            'image' => 'https://example.com/image.jpg',
        ];

        $jsonLd = $this->generator->buildArticle($data);
        $decoded = json_decode($jsonLd, true);

        self::assertSame('https://schema.org', $decoded['@context']);
        self::assertSame('Article', $decoded['@type']);
        self::assertArrayHasKey('headline', $decoded);
        self::assertArrayHasKey('datePublished', $decoded);
        self::assertArrayHasKey('author', $decoded);
        self::assertArrayHasKey('image', $decoded);
        self::assertNotEmpty($decoded['headline']);
    }

    public function testProductJsonLdIncludesOffer(): void
    {
        $data = [
            'name' => 'Widget',
            'price' => 99.99,
            'currency' => 'EUR',
            'inStock' => true,
        ];

        $jsonLd = $this->generator->buildProduct($data);
        $decoded = json_decode($jsonLd, true);

        self::assertSame('Product', $decoded['@type']);
        self::assertArrayHasKey('offers', $decoded);
        self::assertSame('Offer', $decoded['offers']['@type']);
        self::assertSame('99.99', $decoded['offers']['price']);
        self::assertSame('https://schema.org/InStock', $decoded['offers']['availability']);
    }

    public function testJsonLdIsValidJson(): void
    {
        $jsonLd = $this->generator->buildArticle([
            'title' => 'Test',
            'date' => new \DateTime(),
            'author' => 'Author',
            'image' => 'https://example.com/img.jpg',
        ]);

        json_decode($jsonLd);
        self::assertSame(JSON_ERROR_NONE, json_last_error(), 'JSON-LD must be valid JSON');
    }

    public function testUrlsAreAbsolute(): void
    {
        $jsonLd = $this->generator->buildProduct([
            'name' => 'Widget',
            'price' => 10.00,
            'currency' => 'EUR',
            'inStock' => true,
            'image' => 'https://example.com/widget.jpg',
            'url' => 'https://example.com/products/widget',
        ]);

        $decoded = json_decode($jsonLd, true);

        self::assertStringStartsWith('https://', $decoded['image']);
        self::assertStringStartsWith('https://', $decoded['offers']['url'] ?? $decoded['url'] ?? '');
    }

    public function testDatesAreIso8601WithTimezone(): void
    {
        $jsonLd = $this->generator->buildArticle([
            'title' => 'Test',
            'date' => new \DateTime('2025-06-15T10:00:00+02:00'),
            'author' => 'Author',
            'image' => 'https://example.com/img.jpg',
        ]);

        $decoded = json_decode($jsonLd, true);
        // Must contain timezone offset like +02:00 or Z
        self::assertMatchesRegularExpression(
            '/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}/',
            $decoded['datePublished']
        );
    }
}
```

### Integration Tests: Validate Rendered HTML

Test that the full page response contains valid JSON-LD blocks.

**Playwright / Node.js integration test:**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Structured Data Validation', () => {

  test('product page contains valid Product JSON-LD', async ({ page }) => {
    const url = process.env.PRODUCT_TEST_URL || 'https://example.ddev.site/products/widget';
    await page.goto(url);

    const jsonLdScripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(jsonLdScripts.length).toBeGreaterThan(0);

    const productSchema = jsonLdScripts
      .map(s => JSON.parse(s))
      .find(d => d['@type'] === 'Product' || d['@type']?.includes('Product'));

    expect(productSchema).toBeDefined();
    expect(productSchema['@context']).toBe('https://schema.org');
    expect(productSchema.name).toBeTruthy();
    expect(productSchema.offers).toBeDefined();
    expect(productSchema.offers.price).toBeTruthy();
    expect(productSchema.offers.priceCurrency).toBeTruthy();
  });

  test('article page contains valid Article JSON-LD', async ({ page }) => {
    const url = process.env.ARTICLE_TEST_URL || 'https://example.ddev.site/news/test-article';
    await page.goto(url);

    const jsonLdScripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const articleSchema = jsonLdScripts
      .map(s => JSON.parse(s))
      .find(d => ['Article', 'NewsArticle', 'BlogPosting'].includes(d['@type']));

    expect(articleSchema).toBeDefined();
    expect(articleSchema.headline).toBeTruthy();
    expect(articleSchema.datePublished).toMatch(/\d{4}-\d{2}-\d{2}/);
    expect(articleSchema.author).toBeDefined();
  });

  test('all pages have BreadcrumbList JSON-LD', async ({ page }) => {
    const urls = [
      process.env.HOME_TEST_URL || 'https://example.ddev.site/',
      process.env.PRODUCT_TEST_URL || 'https://example.ddev.site/products/widget',
    ];

    for (const url of urls) {
      await page.goto(url);
      const jsonLdScripts = await page.locator('script[type="application/ld+json"]').allTextContents();
      const breadcrumb = jsonLdScripts
        .map(s => JSON.parse(s))
        .find(d => d['@type'] === 'BreadcrumbList');

      expect(breadcrumb, `Missing BreadcrumbList on ${url}`).toBeDefined();
      expect(breadcrumb.itemListElement.length).toBeGreaterThan(0);
      breadcrumb.itemListElement.forEach((item: any, i: number) => {
        expect(item.position).toBe(i + 1);
        expect(item.name).toBeTruthy();
      });
    }
  });

  test('no duplicate @id values on page', async ({ page }) => {
    const url = process.env.PRODUCT_TEST_URL || 'https://example.ddev.site/products/widget';
    await page.goto(url);

    const jsonLdScripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const allIds: string[] = [];

    for (const script of jsonLdScripts) {
      const data = JSON.parse(script);
      collectIds(data, allIds);
    }

    const duplicates = allIds.filter((id, i) => allIds.indexOf(id) !== i);
    expect(duplicates, `Duplicate @id values: ${duplicates.join(', ')}`).toHaveLength(0);
  });
});

function collectIds(obj: any, ids: string[]): void {
  if (!obj || typeof obj !== 'object') return;
  if (obj['@id']) ids.push(obj['@id']);
  for (const val of Object.values(obj)) {
    if (Array.isArray(val)) {
      val.forEach(item => collectIds(item, ids));
    } else if (typeof val === 'object') {
      collectIds(val, ids);
    }
  }
}
```

### CLI Validation Script

Use `scripts/validate-jsonld.js` for quick validation from the command line. See the script for usage.

```bash
# Validate a single URL
ddev exec "cd packages/my-site-package && node ../../.agents/skills/typo3-rich-snippets/scripts/validate-jsonld.js https://example.ddev.site/products/widget"

# Validate a JSON-LD file
node .agents/skills/typo3-rich-snippets/scripts/validate-jsonld.js --file path/to/schema.json
```

## CI Pipeline Integration

Add structured data validation to your CI pipeline:

```yaml
# .github/workflows/structured-data.yml (example)
structured-data-check:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 20
    - run: npm ci
    - name: Validate structured data
      run: node .agents/skills/typo3-rich-snippets/scripts/validate-jsonld.js --file tests/fixtures/product-schema.json
```

## Google Search Console Monitoring

After deployment:

1. Open **Search Console** > select property
2. Navigate to **Enhancements** in the left sidebar
3. Check each structured data type (Product, FAQ, Breadcrumbs, etc.)
4. Review **Valid**, **Valid with warnings**, and **Error** counts
5. Click into errors to see affected URLs and specific issues
6. After fixing, use **Validate Fix** to request re-crawl

Common Search Console errors:
- `Missing field "X"` -- add the required property
- `Invalid value for field "X"` -- check expected type/format
- `Unsupported value in field "availability"` -- use full URL like `https://schema.org/InStock`
- `Missing field "priceValidUntil"` -- required for merchant listings with price
