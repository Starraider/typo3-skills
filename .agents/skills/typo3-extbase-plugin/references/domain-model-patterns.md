# Domain Model Patterns

Reference for Extbase domain model property types, ObjectStorage relations, the sys_category shim, and model-level annotations.

## Table of Contents

- [DocBlock Documentation](#docblock-documentation)
- [Base Class](#base-class)
- [Simple Properties](#simple-properties)
- [ObjectStorage Relations](#objectstorage-relations)
  - [FileReference (Images)](#filereference-images)
  - [Inline Children (1:n)](#inline-children-1n)
  - [sys_category Relation](#sys_category-relation)
- [Constructor & initializeObject](#constructor--initializeobject)
- [Complete Model Example](#complete-model-example)
- [Model Annotations & Attributes](#model-annotations--attributes)
  - [Syntax: Docblock vs PHP 8 Attributes](#syntax-docblock-vs-php-8-attributes)
  - [Validate (on Properties)](#validate-on-properties)
  - [ORM Annotations](#orm-annotations)
  - [Combining Annotations](#combining-annotations)
  - [Quick Reference](#quick-reference)

## DocBlock Documentation

All classes and public/protected methods **must** have DocBlock comments explaining their purpose. For methods, document what parameters are expected and what the method returns.

```php
/**
 * Represents a store managed by a frontend user.
 *
 * Each outlet store belongs to exactly one fe_user and can have
 * multiple categories, images, and promotions attached.
 */
class OutletStore extends AbstractEntity
{
    /**
     * Return the store's display name.
     */
    public function getName(): string
    {
        return $this->name;
    }

    /**
     * Set the frontend user UID who owns this store.
     *
     * @param int $feUser The fe_users.uid of the owner
     */
    public function setFeUser(int $feUser): void
    {
        $this->feUser = $feUser;
    }
}
```

> [!NOTE]
> For simple getters/setters with obvious semantics, a one-line summary is sufficient. For complex logic, domain constraints, or non-obvious parameters, provide detailed descriptions and `@param`/`@return` tags.

## Base Class

All models extend `AbstractEntity`:

```php
<?php
declare(strict_types=1);
namespace Vendor\MySitePackage\Domain\Model;

use TYPO3\CMS\Extbase\DomainObject\AbstractEntity;

class Example extends AbstractEntity
{
}
```

## Simple Properties

| PHP Type | Example Property | DB Column |
|----------|-----------------|-----------|
| `string` | `protected string $title = '';` | `varchar(255) DEFAULT '' NOT NULL` |
| `string` (long) | `protected string $description = '';` | `text` |
| `int` | `protected int $sortOrder = 0;` | `int(11) DEFAULT '0' NOT NULL` |
| `bool` | `protected bool $approved = false;` | `tinyint(4) unsigned DEFAULT '0' NOT NULL` |
| `?\DateTime` | `protected ?\DateTime $startDate = null;` | `int(11) unsigned DEFAULT '0' NOT NULL` |
| `string` (country) | `protected string $country = '';` | `varchar(255) DEFAULT '' NOT NULL` |
| `int` (fe_user uid) | `protected int $feUser = 0;` | `int(11) unsigned DEFAULT '0' NOT NULL` |

Each property needs a getter and setter:

```php
public function getTitle(): string
{
    return $this->title;
}

public function setTitle(string $title): void
{
    $this->title = $title;
}
```

For `bool` properties, use `is` prefix:

```php
public function isApproved(): bool
{
    return $this->approved;
}
```

## ObjectStorage Relations

### FileReference (Images)

```php
use TYPO3\CMS\Extbase\Domain\Model\FileReference;
use TYPO3\CMS\Extbase\Persistence\ObjectStorage;

/**
 * @var \TYPO3\CMS\Extbase\Persistence\ObjectStorage<\TYPO3\CMS\Extbase\Domain\Model\FileReference>
 */
protected ?ObjectStorage $images = null;

public function getImages(): ObjectStorage
{
    if ($this->images === null) {
        $this->images = new ObjectStorage();
    }
    return $this->images;
}

public function setImages(ObjectStorage $images): void
{
    $this->images = $images;
}

public function addImage(FileReference $image): void
{
    $this->getImages()->attach($image);
}

public function removeImage(FileReference $image): void
{
    $this->getImages()->detach($image);
}
```

> [!IMPORTANT]
> Always use the **fully qualified annotation** `@var \TYPO3\CMS\Extbase\Persistence\ObjectStorage<\TYPO3\CMS\Extbase\Domain\Model\FileReference>` — Extbase uses this annotation to resolve relation types.

### Inline Children (1:n)

The child model has a back-reference property to the parent:

```php
// In child model (e.g., Promotion)
protected ?OutletStore $outletStore = null;

public function getOutletStore(): ?OutletStore { return $this->outletStore; }
public function setOutletStore(?OutletStore $outletStore): void { $this->outletStore = $outletStore; }
```

The parent model has an ObjectStorage:

```php
/**
 * @var \TYPO3\CMS\Extbase\Persistence\ObjectStorage<\Vendor\MySitePackage\Domain\Model\Promotion>
 */
protected ?ObjectStorage $promotions = null;

public function getPromotions(): ObjectStorage
{
    if ($this->promotions === null) {
        $this->promotions = new ObjectStorage();
    }
    return $this->promotions;
}

public function setPromotions(ObjectStorage $promotions): void
{
    $this->promotions = $promotions;
}

public function addPromotion(Promotion $promotion): void
{
    $this->getPromotions()->attach($promotion);
}

public function removePromotion(Promotion $promotion): void
{
    $this->getPromotions()->detach($promotion);
}
```

### sys_category Relation

sys_category requires **three** pieces:

#### 1. Category Shim Model

Create a local model class that extends the core Category. This resolves Extbase namespace mapping issues:

```php
<?php
declare(strict_types=1);
namespace Vendor\MySitePackage\Domain\Model;

/**
 * Category shim to resolve Extbase namespace mapping issues
 */
class Category extends \TYPO3\CMS\Extbase\Domain\Model\Category
{
}
```

#### 2. CategoryRepository with ENTITY_CLASSNAME

```php
<?php
declare(strict_types=1);
namespace Vendor\MySitePackage\Domain\Repository;

use TYPO3\CMS\Extbase\Persistence\Repository;

class CategoryRepository extends Repository
{
    public const ENTITY_CLASSNAME = \Vendor\MySitePackage\Domain\Model\Category::class;
}
```

`ENTITY_CLASSNAME` tells the repository to return instances of your shim class instead of the core class.

#### 3. Persistence Mapping

In `Configuration/Extbase/Persistence/Classes.php`:

```php
\Vendor\MySitePackage\Domain\Model\Category::class => [
    'tableName' => 'sys_category',
],
```

#### Usage in Parent Model

```php
use TYPO3\CMS\Extbase\Domain\Model\Category;

/**
 * @var \TYPO3\CMS\Extbase\Persistence\ObjectStorage<\TYPO3\CMS\Extbase\Domain\Model\Category>
 * @TYPO3\CMS\Extbase\Annotation\Validate("NotEmpty")
 */
protected ?ObjectStorage $categories = null;
```

> [!TIP]
> The `@var` annotation references the **core** `Category` class, not the shim. The persistence mapping handles the resolution transparently.

#### Building a Category Tree in Controller

```php
$categories = $this->categoryRepository->findAll();
$categoriesTree = $this->buildCategoryTree($categories->toArray());

protected function buildCategoryTree(array $categories, int $parentId = 0): array
{
    $childrenMap = [];
    foreach ($categories as $category) {
        $parent = $category->getParent();
        $currentParentId = $parent ? $parent->getUid() : 0;
        if (!isset($childrenMap[$currentParentId])) {
            $childrenMap[$currentParentId] = [];
        }
        $childrenMap[$currentParentId][] = $category;
    }

    $buildTreeRecursive = function ($currentParentId) use (&$buildTreeRecursive, &$childrenMap) {
        $nodes = [];
        if (isset($childrenMap[$currentParentId])) {
            foreach ($childrenMap[$currentParentId] as $category) {
                $nodes[] = [
                    'category' => $category,
                    'children' => $buildTreeRecursive($category->getUid()),
                ];
            }
        }
        return $nodes;
    };

    return $buildTreeRecursive(0);
}
```

## Constructor & initializeObject

Every model with ObjectStorage properties **must** initialize them:

```php
public function __construct()
{
    $this->initializeObject();
}

public function initializeObject(): void
{
    $this->images = new ObjectStorage();
    $this->categories = new ObjectStorage();
    $this->promotions = new ObjectStorage();
}
```

`initializeObject()` is also called by Extbase when reconstituting objects from the database.

## Complete Model Example

```php
<?php
declare(strict_types=1);
namespace Vendor\MySitePackage\Domain\Model;

use TYPO3\CMS\Extbase\Domain\Model\Category;
use TYPO3\CMS\Extbase\Domain\Model\FileReference;
use TYPO3\CMS\Extbase\DomainObject\AbstractEntity;
use TYPO3\CMS\Extbase\Persistence\ObjectStorage;

class OutletStore extends AbstractEntity
{
    protected string $name = '';
    protected string $address = '';
    protected string $city = '';
    protected string $zip = '';
    protected string $country = '';
    protected string $email = '';
    protected int $feUser = 0;
    protected bool $approved = false;
    protected ?\DateTime $createDate = null;
    protected int $tstamp = 0;

    /** @var \TYPO3\CMS\Extbase\Persistence\ObjectStorage<\TYPO3\CMS\Extbase\Domain\Model\FileReference> */
    protected ?ObjectStorage $images = null;

    /** @var \TYPO3\CMS\Extbase\Persistence\ObjectStorage<\TYPO3\CMS\Extbase\Domain\Model\Category> */
    protected ?ObjectStorage $categories = null;

    /** @var \TYPO3\CMS\Extbase\Persistence\ObjectStorage<\Vendor\MySitePackage\Domain\Model\Promotion> */
    protected ?ObjectStorage $promotions = null;

    public function __construct()
    {
        $this->initializeObject();
    }

    public function initializeObject(): void
    {
        $this->images = new ObjectStorage();
        $this->categories = new ObjectStorage();
        $this->promotions = new ObjectStorage();
    }

    // ... getters/setters for each property
    // ... add/remove methods for each ObjectStorage
}
```

## Model Annotations & Attributes

All Extbase annotations live under the namespace `\TYPO3\CMS\Extbase\Annotation`. Since **TYPO3 v12+**, annotations can also be written as **PHP 8 native attributes** (recommended for v12+/v13+/v14+ projects).

This section covers annotations used **on model properties**. For controller-specific annotations (`Validate` on actions, `IgnoreValidation`), see [controller-patterns.md](controller-patterns.md#controller-annotations).

Source: [TYPO3 Annotations Reference](https://docs.typo3.org/m/typo3/reference-coreapi/12.4/en-us/ExtensionArchitecture/Extbase/Reference/Annotations.html)

### Syntax: Docblock vs PHP 8 Attributes

Both syntaxes are equivalent in TYPO3 v12+. **Prefer PHP 8 attributes** for new code:

```php
use TYPO3\CMS\Extbase\Annotation\Validate;
use TYPO3\CMS\Extbase\Annotation\ORM\Lazy;
use TYPO3\CMS\Extbase\Annotation\ORM\Cascade;

// ✅ PHP 8 attribute syntax (recommended for v12+)
#[Validate(['validator' => 'NotEmpty'])]
protected string $title = '';

// ⚠️ Docblock annotation syntax (legacy, needed for v11 compatibility)
/** @TYPO3\CMS\Extbase\Annotation\Validate("NotEmpty") */
protected string $title = '';
```

### Validate (on Properties)

`\TYPO3\CMS\Extbase\Annotation\Validate` — Configure validators on model properties.

```php
use TYPO3\CMS\Extbase\Annotation\Validate;

// Simple "not empty" validation
#[Validate(['validator' => 'NotEmpty'])]
protected string $title = '';

// String length validation with options
#[Validate([
    'validator' => 'StringLength',
    'options' => ['maximum' => 150],
])]
protected string $description = '';

// Docblock equivalent:
/**
 * @Validate("StringLength", options={"maximum": 150})
 */
protected string $description2 = '';
```

**Built-in validators:** `NotEmpty`, `StringLength`, `EmailAddress`, `Integer`, `Float`, `NumberRange`, `RegularExpression`, `Alphanumeric`, `Text`, `DateTime`, `Boolean`, `Raw` (skip all validation).

### ORM Annotations

These three annotations control **persistence behavior** and can only be used on model properties.

#### Lazy

`\TYPO3\CMS\Extbase\Annotation\ORM\Lazy` — Load the property lazily on first access. **Greatly improves performance** for ObjectStorage relations that are not always needed.

```php
use TYPO3\CMS\Extbase\Annotation\ORM\Lazy;

/** @var \TYPO3\CMS\Extbase\Persistence\ObjectStorage<\Vendor\MySitePackage\Domain\Model\Promotion> */
#[Lazy()]
protected ?ObjectStorage $promotions = null;

// Docblock equivalent:
/**
 * @var \TYPO3\CMS\Extbase\Persistence\ObjectStorage<\Vendor\MySitePackage\Domain\Model\Promotion>
 * @Lazy
 */
protected ?ObjectStorage $promotions2 = null;
```

#### Cascade

`\TYPO3\CMS\Extbase\Annotation\ORM\Cascade("remove")` — Automatically **delete child entities** when the parent (aggregate root) is deleted. Only the value `"remove"` is supported.

```php
use TYPO3\CMS\Extbase\Annotation\ORM\Cascade;

/** @var \TYPO3\CMS\Extbase\Persistence\ObjectStorage<Post> */
#[Cascade(['value' => 'remove'])]
protected ObjectStorage $posts;

// Docblock equivalent:
/**
 * @var \TYPO3\CMS\Extbase\Persistence\ObjectStorage<Post>
 * @Cascade("remove")
 */
protected ObjectStorage $posts2;
```

#### Transient

`\TYPO3\CMS\Extbase\Annotation\ORM\Transient` — Mark a property as **not persisted** to the database. Useful for computed/virtual properties.

```php
use TYPO3\CMS\Extbase\Annotation\ORM\Transient;

#[Transient()]
protected string $fullName = '';

// Docblock equivalent:
/** @Transient */
protected string $fullName2 = '';
```

### Combining Annotations

Annotations can be freely combined. `Lazy` + `Cascade` is a very common pattern for child collections:

```php
use TYPO3\CMS\Extbase\Annotation\ORM\Cascade;
use TYPO3\CMS\Extbase\Annotation\ORM\Lazy;

// PHP 8 attributes (recommended)
#[Lazy()]
#[Cascade(['value' => 'remove'])]
/** @var \TYPO3\CMS\Extbase\Persistence\ObjectStorage<Comment> */
protected ObjectStorage $comments;

// Docblock equivalent:
/**
 * @var \TYPO3\CMS\Extbase\Persistence\ObjectStorage<Comment>
 * @Lazy
 * @Cascade("remove")
 */
protected ObjectStorage $comments2;
```

### Quick Reference

| Annotation | PHP 8 Attribute | Purpose |
|------------|-----------------|--------|
| `Validate` | `#[Validate(['validator' => '...'])]` | Add validation rules to properties |
| `Lazy` | `#[Lazy()]` | Lazy-load on first access |
| `Cascade` | `#[Cascade(['value' => 'remove'])]` | Delete children with parent |
| `Transient` | `#[Transient()]` | Exclude from persistence |
