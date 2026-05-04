# Schema Type Reference

Complete JSON-LD examples and property reference for each supported schema.org type.

## Article / NewsArticle / BlogPosting

**Required by Google:** none strictly, but strongly recommended:
- `headline` (Text, max 110 chars)
- `image` (ImageObject or URL, multiple aspect ratios: 16:9, 4:3, 1:1)
- `datePublished` (DateTime, ISO 8601 with timezone)
- `dateModified` (DateTime)
- `author` (Person or Organization, must include `name` + `url` or `sameAs`)

**Recommended:** `publisher`, `mainEntityOfPage`, `description`, `articleBody`, `wordCount`, `inLanguage`

```json
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "@id": "https://example.com/news/my-article#article",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://example.com/news/my-article"
  },
  "headline": "Breaking: Major Event Happening Now",
  "description": "A brief summary of the article content.",
  "image": [
    "https://example.com/photos/16x9/photo.jpg",
    "https://example.com/photos/4x3/photo.jpg",
    "https://example.com/photos/1x1/photo.jpg"
  ],
  "datePublished": "2025-01-15T08:00:00+01:00",
  "dateModified": "2025-01-15T10:30:00+01:00",
  "author": [
    {
      "@type": "Person",
      "name": "Jane Doe",
      "url": "https://example.com/authors/jane-doe"
    }
  ],
  "publisher": {
    "@type": "Organization",
    "name": "Example News",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  },
  "inLanguage": "de-DE"
}
```

**Subtypes:**
- `NewsArticle` -- news/journalism
- `BlogPosting` -- blog content
- `Article` -- generic articles

---

## Product

**Required by Google (Product snippet):** `name`, `image`, `review` or `aggregateRating` or `offers`
**Required by Google (Merchant listing):** `name`, `image`, `offers` (with `price`, `priceCurrency`, `availability`)

**Recommended:** `brand`, `description`, `sku`, `gtin`, `mpn`, `category`, `color`, `material`

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": "https://example.com/products/widget-pro#product",
  "name": "Widget Pro 3000",
  "image": "https://example.com/images/widget-pro.jpg",
  "description": "Professional-grade widget for advanced applications.",
  "brand": {
    "@type": "Brand",
    "name": "WidgetCorp"
  },
  "sku": "WP-3000",
  "gtin13": "4006381333931",
  "mpn": "WP3K-2025",
  "color": "Silver",
  "offers": {
    "@type": "Offer",
    "url": "https://example.com/products/widget-pro",
    "priceCurrency": "EUR",
    "price": "149.99",
    "priceValidUntil": "2025-12-31",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition",
    "seller": {
      "@type": "Organization",
      "name": "Example Store"
    },
    "hasMerchantReturnPolicy": {
      "@type": "MerchantReturnPolicy",
      "applicableCountry": "DE",
      "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
      "merchantReturnDays": 30,
      "returnMethod": "https://schema.org/ReturnByMail",
      "returnFees": "https://schema.org/FreeReturn"
    },
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingRate": {
        "@type": "MonetaryAmount",
        "value": "4.99",
        "currency": "EUR"
      },
      "shippingDestination": {
        "@type": "DefinedRegion",
        "addressCountry": "DE"
      },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "handlingTime": {
          "@type": "QuantitativeValue",
          "minValue": 0,
          "maxValue": 1,
          "unitCode": "DAY"
        },
        "transitTime": {
          "@type": "QuantitativeValue",
          "minValue": 1,
          "maxValue": 3,
          "unitCode": "DAY"
        }
      }
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "reviewCount": "234"
  },
  "review": [
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Max Mustermann"
      },
      "datePublished": "2025-03-10",
      "reviewBody": "Excellent product, works as advertised.",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      }
    }
  ]
}
```

**Multiple offers (price range):** Use `AggregateOffer` with `lowPrice` / `highPrice`.

---

## LocalBusiness

**Required by Google:** `name`, `address`
**Recommended:** `geo`, `telephone`, `url`, `openingHoursSpecification`, `image`, `priceRange`, `aggregateRating`, `review`, `sameAs`

Use the most specific subtype: `Store`, `Restaurant`, `MedicalBusiness`, `AutomotiveBusiness`, etc.

```json
{
  "@context": "https://schema.org",
  "@type": "Store",
  "@id": "https://example.com/#store",
  "name": "Example Factory Outlet",
  "image": "https://example.com/images/storefront.jpg",
  "url": "https://example.com",
  "telephone": "+49-123-4567890",
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Musterstraße 42",
    "addressLocality": "Musterstadt",
    "postalCode": "12345",
    "addressRegion": "NW",
    "addressCountry": "DE"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 51.4556,
    "longitude": 7.0116
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "18:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday",
      "opens": "10:00",
      "closes": "16:00"
    }
  ],
  "sameAs": [
    "https://www.facebook.com/examplestore",
    "https://www.instagram.com/examplestore"
  ]
}
```

---

## Event

**Required by Google:** `name`, `startDate`, `location` (with `address`)
**Recommended:** `endDate`, `description`, `image`, `eventStatus`, `eventAttendanceMode`, `offers`, `performer`, `organizer`

```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "@id": "https://example.com/events/summer-sale-2025#event",
  "name": "Summer Sale 2025",
  "description": "Annual summer clearance sale with up to 70% off.",
  "image": "https://example.com/images/summer-sale.jpg",
  "startDate": "2025-07-01T10:00:00+02:00",
  "endDate": "2025-07-14T18:00:00+02:00",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "location": {
    "@type": "Place",
    "name": "Example Factory Outlet",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Musterstraße 42",
      "addressLocality": "Musterstadt",
      "postalCode": "12345",
      "addressCountry": "DE"
    }
  },
  "organizer": {
    "@type": "Organization",
    "name": "Example Factory Outlet",
    "url": "https://example.com"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://example.com/events/summer-sale-2025",
    "price": "0",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock",
    "validFrom": "2025-06-01T00:00:00+02:00"
  },
  "inLanguage": "de"
}
```

---

## FAQPage

**Required by Google:** `mainEntity` array of `Question` objects, each with `acceptedAnswer` containing `text`

Only use `FAQPage` for editorially authored Q&A. For user-generated Q&A, use `QAPage`.

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://example.com/faq#faqpage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What are your opening hours?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We are open Monday to Friday from 9:00 to 18:00 and Saturday from 10:00 to 16:00."
      }
    },
    {
      "@type": "Question",
      "name": "Do you offer free parking?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, we have 200 free parking spaces directly in front of the store."
      }
    },
    {
      "@type": "Question",
      "name": "Can I return items?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Items can be returned within 30 days with the original receipt."
      }
    }
  ]
}
```

---

## BreadcrumbList

**Required by Google:** `itemListElement` array of `ListItem`, each with `position`, `name`, and `item` (URL).
Last item may omit `item` (represents the current page).

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://example.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Products",
      "item": "https://example.com/products/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Widget Pro 3000"
    }
  ]
}
```

---

## Review / AggregateRating

**Required (Review):** `author`, `itemReviewed`, `reviewRating`
**Required (AggregateRating):** `itemReviewed`, `ratingValue`, `ratingCount` or `reviewCount`

Reviews are typically nested inside the reviewed entity (Product, LocalBusiness, etc.) rather than standalone. Google prohibits self-serving reviews (reviewing your own business).

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Widget Pro 3000",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "bestRating": "5",
    "ratingCount": "312",
    "reviewCount": "89"
  },
  "review": {
    "@type": "Review",
    "author": {
      "@type": "Person",
      "name": "Maria Schmidt"
    },
    "datePublished": "2025-04-01",
    "reviewBody": "Sturdy build quality and fast delivery.",
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": "5",
      "bestRating": "5",
      "worstRating": "1"
    }
  }
}
```

---

## Organization / WebSite (Site-level)

Typically placed on the homepage. Helps Google build a Knowledge Panel.

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://example.com/#organization",
  "name": "Example Factory Outlet GmbH",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+49-123-4567890",
    "contactType": "customer service",
    "availableLanguage": ["German", "English"]
  },
  "sameAs": [
    "https://www.facebook.com/examplestore",
    "https://www.instagram.com/examplestore"
  ]
}
```

---

## HowTo

**Required by Google:** `name`, `step` (array of `HowToStep` with `text`)
**Recommended:** `image`, `totalTime`, `estimatedCost`, `supply`, `tool`

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Apply for a Loyalty Card",
  "description": "Step-by-step guide to getting your loyalty card.",
  "totalTime": "PT5M",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Visit the service desk",
      "text": "Go to the service desk on the ground floor.",
      "image": "https://example.com/images/step1.jpg"
    },
    {
      "@type": "HowToStep",
      "name": "Fill out the form",
      "text": "Complete the registration form with your name and email.",
      "image": "https://example.com/images/step2.jpg"
    },
    {
      "@type": "HowToStep",
      "name": "Receive your card",
      "text": "Your loyalty card will be printed and handed to you immediately.",
      "image": "https://example.com/images/step3.jpg"
    }
  ]
}
```

---

## Multi-Language / Localization

For multilingual sites, structured data should reflect the page language:

1. **Set `inLanguage`** on content types (`Article`, `Event`, etc.):
   ```json
   "inLanguage": "de-DE"
   ```

2. **Use `@language` in JSON-LD** for text values when mixing languages:
   ```json
   "name": {
     "@value": "Sommerschlussverkauf 2025",
     "@language": "de"
   }
   ```

3. **Separate JSON-LD blocks per language variant** are NOT needed -- each page version (URL) should have its own markup matching its content language.

4. **`hreflang`** is handled via `<link rel="alternate">` HTML tags, not within JSON-LD. But `sameAs` can reference alternate-language page URLs.

---

## Output Format Alternatives

### Microdata (inline HTML attributes)

```html
<div itemscope itemtype="https://schema.org/Product">
  <h1 itemprop="name">Widget Pro 3000</h1>
  <img itemprop="image" src="/images/widget.jpg" alt="Widget Pro">
  <p itemprop="description">Professional-grade widget.</p>
  <div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
    <span itemprop="priceCurrency" content="EUR">&euro;</span>
    <span itemprop="price" content="149.99">149,99</span>
    <link itemprop="availability" href="https://schema.org/InStock">
  </div>
</div>
```

### RDFa (inline attributes, W3C standard)

```html
<div vocab="https://schema.org/" typeof="Product">
  <h1 property="name">Widget Pro 3000</h1>
  <img property="image" src="/images/widget.jpg" alt="Widget Pro">
  <p property="description">Professional-grade widget.</p>
  <div property="offers" typeof="Offer">
    <span property="priceCurrency" content="EUR">&euro;</span>
    <span property="price" content="149.99">149,99</span>
    <link property="availability" href="https://schema.org/InStock">
  </div>
</div>
```

**Recommendation:** Use JSON-LD for all new implementations. Only use Microdata/RDFa when maintaining existing markup or when the CMS enforces it.
