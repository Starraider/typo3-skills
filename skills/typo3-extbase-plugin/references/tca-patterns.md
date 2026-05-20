# TCA Field Patterns

TCA configuration lives in `Configuration/TCA/tx_<ext>_domain_model_<name>.php`. This reference covers the field types commonly needed in Extbase plugins.

## Table of Contents

- [Minimal TCA Skeleton](#minimal-tca-skeleton)
- [Field Types](#field-types)
  - [Text Input](#text-input)
  - [Textarea / RTE](#textarea--rte)
  - [Number](#number)
  - [Email](#email)
  - [Link / URL](#link--url)
  - [Checkbox Toggle](#checkbox-toggle)
  - [DateTime](#datetime)
  - [Country Select](#country-select)
  - [Category (sys_category)](#category-sys_category)
  - [File / Image](#file--image)
  - [Inline (1:n child records)](#inline-1n-child-records)
  - [Frontend User Select](#frontend-user-select)
  - [Select with Checkbox Rendering](#select-with-checkbox-rendering)

## Minimal TCA Skeleton

```php
<?php
return [
    'ctrl' => [
        'title' => 'My Model',
        'label' => 'title',
        'default_sortby' => 'title ASC',
        'tstamp' => 'tstamp',
        'crdate' => 'crdate',
        'delete' => 'deleted',
        'enablecolumns' => [
            'disabled' => 'hidden',
        ],
        'searchFields' => 'title,description',
        'iconfile' => 'EXT:my_site_package/Resources/Public/Icons/Extension.svg',
    ],
    'types' => [
        '1' => ['showitem' => '
            --div--;General,
            hidden, title, description,
            --div--;Relations,
            categories, images'],
    ],
    'columns' => [
        'hidden' => [
            'exclude' => true,
            'label' => 'LLL:EXT:core/Resources/Private/Language/locallang_general.xlf:LGL.hidden',
            'config' => [
                'type' => 'check',
                'renderType' => 'checkboxToggle',
            ],
        ],
        // ... column definitions below
    ],
];
```

## Field Types

### Text Input

```php
'title' => [
    'exclude' => true,
    'label' => 'Title',
    'config' => [
        'type' => 'input',
        'size' => 30,
        'eval' => 'trim',
        'required' => true,
    ],
],
```

### Textarea / RTE

```php
// Plain textarea
'teaser' => [
    'exclude' => true,
    'label' => 'Teaser',
    'config' => [
        'type' => 'text',
        'cols' => 40,
        'rows' => 5,
        'eval' => 'trim',
    ],
],
// Rich text editor
'description' => [
    'exclude' => true,
    'label' => 'Description',
    'config' => [
        'type' => 'text',
        'enableRichtext' => true,
        'cols' => 40,
        'rows' => 15,
        'eval' => 'trim',
    ],
],
```

### Number

```php
'sort_order' => [
    'exclude' => true,
    'label' => 'Sort Order',
    'config' => [
        'type' => 'number',
        'size' => 10,
        'default' => 0,
    ],
],
```

### Email

```php
'email' => [
    'exclude' => true,
    'label' => 'E-Mail',
    'config' => [
        'type' => 'email',
        'size' => 30,
    ],
],
```

### Link / URL

```php
'website' => [
    'exclude' => true,
    'label' => 'Website',
    'config' => [
        'type' => 'link',
        'size' => 30,
    ],
],
```

### Checkbox Toggle

```php
'approved' => [
    'exclude' => true,
    'label' => 'Approved',
    'config' => [
        'type' => 'check',
        'renderType' => 'checkboxToggle',
    ],
],
```

Model property: `protected bool $approved = false;`

### DateTime

```php
'start_date' => [
    'exclude' => true,
    'label' => 'Start Date',
    'config' => [
        'type' => 'datetime',
        'size' => 20,
        'default' => 0,
    ],
],
```

Model property: `protected ?\DateTime $startDate = null;`

DB column: `start_date int(11) unsigned DEFAULT '0' NOT NULL`

### Country Select

Use TYPO3's built-in `type => 'country'` (v13+). The DB stores the ISO 3166-1 alpha-2 code as a string.

```php
'country' => [
    'exclude' => true,
    'label' => 'Country',
    'config' => [
        'type' => 'country',
        'labelField' => 'name',
        'prioritizedCountries' => ['DE', 'AT', 'CH'],
        'default' => 'DE',
    ],
],
```

**Model property:** `protected string $country = '';`

**DB column:** `country varchar(255) DEFAULT '' NOT NULL`

**Controller usage with CountryProvider:**

```php
use TYPO3\CMS\Core\Country\CountryProvider;

// Inject via constructor
public function __construct(CountryProvider $countryProvider) { ... }

// In action: build array for Fluid <f:form.select>
$countries = $this->countryProvider->getAll();
$dynamicCountries = [];
foreach ($countries as $country) {
    $dynamicCountries[$country->getAlpha2IsoCode()] = $country->getName();
}
$this->view->assign('dynamicCountries', $dynamicCountries);
```

### Category (sys_category)

```php
'categories' => [
    'exclude' => true,
    'label' => 'Categories',
    'config' => [
        'type' => 'category',
    ],
],
```

This automatically uses the `sys_category_record_mm` table. No manual MM config needed.

**DB column:** `categories int(11) unsigned DEFAULT '0' NOT NULL`

See [domain-model-patterns.md](domain-model-patterns.md#sys_category-relation) for the required Category shim model and persistence mapping.

### File / Image

```php
'images' => [
    'exclude' => true,
    'label' => 'Images',
    'config' => [
        'type' => 'file',
        'maxitems' => 4,
        'allowed' => 'common-image-types',
    ],
],
```

**DB column:** `images int(11) unsigned DEFAULT '0' NOT NULL`

Uses `sys_file_reference` via FAL. Model property is `ObjectStorage<FileReference>`.

### Inline (1:n child records)

```php
'promotions' => [
    'exclude' => true,
    'label' => 'Promotions',
    'config' => [
        'type' => 'inline',
        'foreign_table' => 'tx_mysitepackage_domain_model_promotion',
        'foreign_field' => 'outlet_store',     // column on child table pointing back
        'maxitems' => 9999,
        'appearance' => [
            'collapseAll' => 1,
            'levelLinksPosition' => 'top',
            'showSynchronizationLink' => 1,
            'showPossibleLocalizationRecords' => 1,
            'showAllLocalizationLink' => 1,
        ],
    ],
],
```

The child table **must** have the `foreign_field` column (e.g., `outlet_store int(11) unsigned DEFAULT '0' NOT NULL`).

### Frontend User Select

```php
'fe_user' => [
    'exclude' => true,
    'label' => 'Frontend User (Owner)',
    'config' => [
        'type' => 'select',
        'renderType' => 'selectSingle',
        'foreign_table' => 'fe_users',
        'items' => [
            ['label' => '-- Select --', 'value' => 0],
        ],
        'size' => 1,
        'maxitems' => 1,
    ],
],
```

**Model property:** `protected int $feUser = 0;` (store uid, not object)

### Select with Checkbox Rendering

```php
'payment_methods' => [
    'exclude' => true,
    'label' => 'Payment Methods',
    'config' => [
        'type' => 'select',
        'renderType' => 'selectCheckBox',
        'items' => [
            ['label' => 'Cash', 'value' => 'cash'],
            ['label' => 'Mastercard', 'value' => 'mastercard'],
            ['label' => 'Apple Pay', 'value' => 'applepay'],
        ],
    ],
],
```

**Model property:** `protected string $paymentMethods = '';` (stored as comma-separated values)

## tstamp Passthrough

To make `tstamp` available to the model (e.g., for "last modified" display), add it as passthrough:

```php
'tstamp' => [
    'config' => [
        'type' => 'passthrough',
    ],
],
```

Model property: `protected int $tstamp = 0;`
