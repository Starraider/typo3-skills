# TYPO3 Integration

Strategies for injecting structured data into TYPO3 sites using Fluid templates, TypoScript, and ViewHelpers.

## Strategy 1: Fluid Partial (Recommended)

Create a reusable Fluid partial that outputs JSON-LD. Include it in page layouts or content element templates.

### File: `Resources/Private/Partials/Seo/JsonLd.html`

```html
<f:comment><!-- Renders a JSON-LD block. Pass 'jsonLd' as a pre-built array or 'type' for auto-generation --></f:comment>
<script type="application/ld+json">
<f:format.raw>{jsonLd}</f:format.raw>
</script>
```

### Usage in a Page Layout

```html
<f:section name="HeaderAssets">
  <f:render partial="Seo/JsonLd" arguments="{jsonLd: breadcrumbJsonLd}" />
  <f:render partial="Seo/JsonLd" arguments="{jsonLd: organizationJsonLd}" />
</f:section>
```

### Building JSON-LD in the Controller

Build the JSON-LD string in an Extbase controller and assign it to the view:

```php
use TYPO3\CMS\Extbase\Mvc\Controller\ActionController;

class ProductController extends ActionController
{
    public function showAction(Product $product): \Psr\Http\Message\ResponseInterface
    {
        $jsonLd = json_encode([
            '@context' => 'https://schema.org',
            '@type' => 'Product',
            'name' => $product->getTitle(),
            'image' => $this->getAbsoluteImageUrl($product->getImage()),
            'description' => $product->getDescription(),
            'sku' => $product->getSku(),
            'offers' => [
                '@type' => 'Offer',
                'priceCurrency' => 'EUR',
                'price' => number_format($product->getPrice(), 2, '.', ''),
                'availability' => $product->isInStock()
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/OutOfStock',
            ],
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

        $this->view->assign('productJsonLd', $jsonLd);
        return $this->htmlResponse();
    }
}
```

In the Fluid template:

```html
<script type="application/ld+json">
<f:format.raw>{productJsonLd}</f:format.raw>
</script>
```

## Strategy 2: TypoScript `headerData`

Inject static or semi-dynamic JSON-LD via TypoScript (useful for site-wide Organization/WebSite markup):

```typoscript
page.headerData.100 = TEXT
page.headerData.100 {
    value (
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://example.com/#organization",
    "name": "Example Factory Outlet GmbH",
    "url": "https://example.com",
    "logo": "https://example.com/logo.png",
    "sameAs": [
        "https://www.facebook.com/examplestore",
        "https://www.instagram.com/examplestore"
    ]
}
</script>
    )
}
```

For dynamic values (e.g., page title in breadcrumbs):

```typoscript
page.headerData.110 = COA
page.headerData.110 {
    10 = TEXT
    10.value = <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage","name":"
    20 = TEXT
    20.field = title
    20.htmlSpecialChars = 1
    30 = TEXT
    30.value = ","url":"
    40 = TEXT
    40.typolink.parameter.data = TSFE:id
    40.typolink.forceAbsoluteUrl = 1
    40.typolink.returnLast = url
    50 = TEXT
    50.value = "}</script>
}
```

## Strategy 3: Custom ViewHelper

For complex or reusable JSON-LD generation, create a Fluid ViewHelper:

### File: `Classes/ViewHelpers/JsonLdViewHelper.php`

```php
<?php
declare(strict_types=1);

namespace MyVendor\MyExtension\ViewHelpers;

use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper;

class JsonLdViewHelper extends AbstractViewHelper
{
    protected $escapeOutput = false;

    public function initializeArguments(): void
    {
        $this->registerArgument('data', 'array', 'Schema.org data array', true);
    }

    public function render(): string
    {
        $data = $this->arguments['data'];
        if (!isset($data['@context'])) {
            $data['@context'] = 'https://schema.org';
        }
        $json = json_encode(
            $data,
            JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT
        );
        return '<script type="application/ld+json">' . $json . '</script>';
    }
}
```

Usage in Fluid:

```html
{namespace my=MyVendor\MyExtension\ViewHelpers}
<my:jsonLd data="{
    '@type': 'LocalBusiness',
    'name': settings.storeName,
    'telephone': settings.phone
}" />
```

## Strategy 4: AssetCollector (TYPO3 v10+)

Inject JSON-LD via PHP using TYPO3's `AssetCollector` in middleware, event listeners, or controllers:

```php
use TYPO3\CMS\Core\Page\AssetCollector;

class StructuredDataMiddleware
{
    public function __construct(
        private readonly AssetCollector $assetCollector,
    ) {}

    public function injectOrganization(): void
    {
        $jsonLd = json_encode([
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            'name' => 'Example Factory Outlet GmbH',
            'url' => 'https://example.com',
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        $this->assetCollector->addInlineJavaScript(
            'structured-data-organization',
            $jsonLd,
            ['type' => 'application/ld+json']
        );
    }
}
```

## Strategy 5: Client-Side JavaScript Injection

For SPAs or dynamically loaded content where server-side rendering is not feasible:

```javascript
function injectJsonLd(data) {
  if (!data['@context']) {
    data['@context'] = 'https://schema.org';
  }
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

// Example: inject product data loaded via API
fetch('/api/product/123')
  .then(res => res.json())
  .then(product => {
    injectJsonLd({
      '@type': 'Product',
      'name': product.title,
      'image': product.imageUrl,
      'offers': {
        '@type': 'Offer',
        'price': product.price,
        'priceCurrency': 'EUR',
        'availability': 'https://schema.org/InStock'
      }
    });
  });
```

**Important:** Google can render JavaScript, but relies primarily on server-rendered HTML for structured data. Prefer server-side injection. Use client-side only as a fallback for dynamic content.

## Breadcrumb Auto-Generation

TYPO3's rootline can be used to auto-generate `BreadcrumbList` markup. Create a DataProcessor or build it in TypoScript:

```typoscript
lib.breadcrumbJsonLd = COA
lib.breadcrumbJsonLd {
    10 = HMENU
    10 {
        special = rootline
        special.range = 0|-1
        1 = TMENU
        1 {
            NO {
                doNotLinkIt = 1
                stdWrap.cObject = COA
                stdWrap.cObject {
                    10 = LOAD_REGISTER
                    10.breadcrumbPos.cObject = TEXT
                    10.breadcrumbPos.cObject {
                        data = register:breadcrumbPos
                        ifEmpty = 0
                        wrap = |+1
                        prioriCalc = 1
                    }
                    20 = TEXT
                    20.dataWrap = {"@type":"ListItem","position":{register:breadcrumbPos},"name":"{field:title}","item":"{getIndpEnv:TYPO3_REQUEST_HOST}/{field:uid}"}
                }
            }
        }
    }
    wrap = <script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[|]}</script>
}
```

A cleaner approach is building the breadcrumb array in a custom DataProcessor and rendering it via a Fluid partial.

## EXT:schema (Third-Party)

The TYPO3 extension `brotkrueml/schema` provides a comprehensive API for structured data:

```bash
composer require brotkrueml/schema
```

Usage in Fluid:

```html
{namespace schema=Brotkrueml\Schema\ViewHelpers}
<schema:type.product
    -id="https://example.com/products/widget#product"
    name="Widget Pro 3000"
    description="Professional-grade widget"
    sku="WP-3000">
    <schema:type.offer
        -as="offers"
        price="149.99"
        priceCurrency="EUR"
        availability="https://schema.org/InStock" />
</schema:type.product>
```

This extension handles JSON-LD serialization, `@context` injection, and validation automatically. Consider it for larger TYPO3 projects with many schema types.
