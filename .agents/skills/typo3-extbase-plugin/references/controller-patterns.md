# Controller Patterns

Reference for Extbase ActionController patterns including CRUD operations, frontend user access control, CountryProvider, image upload handling, DateTimeConverter configuration, and controller-level annotations.

## Table of Contents

- [DocBlock Documentation](#docblock-documentation)
- [Base Structure](#base-structure)
- [Frontend User Access Control](#frontend-user-access-control)
- [CRUD Actions](#crud-actions)
  - [List Action](#list-action)
  - [Show Action](#show-action)
  - [New Action](#new-action)
  - [Create Action](#create-action)
  - [Edit Action](#edit-action)
  - [Update Action](#update-action)
  - [Delete Action](#delete-action)
- [CountryProvider Integration](#countryprovider-integration)
- [DateTime Converter for Form Dates](#datetime-converter-for-form-dates)
- [Image Upload Handling](#image-upload-handling)
- [Finding Records by Frontend User](#finding-records-by-frontend-user)
- [Flash Messages](#flash-messages)
- [Controller Annotations](#controller-annotations)
  - [Validate (on Actions)](#validate-on-actions)
  - [IgnoreValidation](#ignorevalidation)

## DocBlock Documentation

All controller classes and their public/protected methods **must** have DocBlock comments explaining their purpose. Document parameters (especially non-obvious ones), return behavior, and any side effects.

```php
/**
 * Manage outlet store profiles for frontend users.
 *
 * Provides CRUD operations scoped to the currently logged-in
 * frontend user's own store record.
 */
class StoreOwnerDashboardController extends ActionController
{
    /**
     * Display the edit form for the current user's store.
     *
     * Redirects to the "new" action if no store exists yet.
     *
     * @param OutletStore|null $outletStore Pre-loaded store (used by Extbase on form re-display)
     */
    public function editAction(?OutletStore $outletStore = null): ResponseInterface
    {
        // ...
    }
}
```

> [!NOTE]
> For simple actions with obvious semantics (e.g., `listAction`), a one-line summary is sufficient. For actions with authorization checks, redirects, or complex parameter handling, provide detailed descriptions and `@param` tags.

## Base Structure

```php
<?php
declare(strict_types=1);
namespace Vendor\MySitePackage\Controller;

use Psr\Http\Message\ResponseInterface;
use TYPO3\CMS\Core\Context\Context;
use TYPO3\CMS\Core\Type\ContextualFeedbackSeverity;
use TYPO3\CMS\Extbase\Mvc\Controller\ActionController;
use Vendor\MySitePackage\Domain\Model\Example;
use Vendor\MySitePackage\Domain\Repository\ExampleRepository;

class ExampleController extends ActionController
{
    protected ExampleRepository $exampleRepository;
    protected Context $context;

    public function __construct(
        ExampleRepository $exampleRepository,
        Context $context
    ) {
        $this->exampleRepository = $exampleRepository;
        $this->context = $context;
    }
}
```

All actions **must** return `ResponseInterface`. Use `$this->htmlResponse()` for rendered views and `$this->redirect()` for redirects.

## Frontend User Access Control

Access the current frontend user via `Context`:

```php
protected function isVerifiedOwner(): bool
{
    $userId = $this->context->getPropertyFromAspect('frontend.user', 'id');
    if (!$userId) {
        return false;
    }

    // Check group membership (e.g., group 2 = "Verified Owners")
    $groupIds = (array)$this->context->getPropertyFromAspect('frontend.user', 'groupIds');
    return in_array(2, $groupIds, true);
}
```

**Available `frontend.user` aspects:**

| Property | Type | Description |
|----------|------|-------------|
| `id` | `int` | User UID (0 if not logged in) |
| `username` | `string` | Login username |
| `groupIds` | `array` | FE group UIDs |
| `isLoggedIn` | `bool` | Whether user is authenticated |

## CRUD Actions

### List Action

```php
public function listAction(): ResponseInterface
{
    if (!$this->isVerifiedOwner()) {
        $this->view->assign('error', 'dashboard.error.not_verified');
        return $this->htmlResponse();
    }

    $items = $this->exampleRepository->findAll();
    $this->view->assign('items', $items);
    return $this->htmlResponse();
}
```

### Show Action

```php
public function showAction(Example $example): ResponseInterface
{
    $this->view->assign('example', $example);
    return $this->htmlResponse();
}
```

### New Action

```php
public function newAction(): ResponseInterface
{
    $newExample = new Example();
    $this->view->assign('newExample', $newExample);
    return $this->htmlResponse();
}
```

### Create Action

```php
public function createAction(Example $newExample): ResponseInterface
{
    $userId = $this->context->getPropertyFromAspect('frontend.user', 'id');
    $newExample->setFeUser($userId);

    $this->exampleRepository->add($newExample);
    $this->addFlashMessage('Created successfully.', '', ContextualFeedbackSeverity::OK);
    return $this->redirect('list');
}
```

### Edit Action

```php
public function editAction(Example $example): ResponseInterface
{
    // IDOR check: verify ownership
    $currentUserId = (int)$this->context->getPropertyFromAspect('frontend.user', 'id');
    if ($example->getFeUser() !== $currentUserId) {
        $this->addFlashMessage('Not authorized.', '', ContextualFeedbackSeverity::ERROR);
        return $this->redirect('list');
    }

    $this->view->assign('example', $example);
    return $this->htmlResponse();
}
```

### Update Action

```php
public function updateAction(Example $example): ResponseInterface
{
    // IDOR check
    $currentUserId = (int)$this->context->getPropertyFromAspect('frontend.user', 'id');
    if ($example->getFeUser() !== $currentUserId) {
        $this->addFlashMessage('Not authorized.', '', ContextualFeedbackSeverity::ERROR);
        return $this->redirect('list');
    }

    $this->exampleRepository->update($example);
    $this->addFlashMessage('Updated successfully.', '', ContextualFeedbackSeverity::OK);
    return $this->redirect('edit', null, null, ['example' => $example]);
}
```

### Delete Action

```php
public function deleteAction(Example $example): ResponseInterface
{
    $currentUserId = (int)$this->context->getPropertyFromAspect('frontend.user', 'id');
    if ($example->getFeUser() !== $currentUserId) {
        $this->addFlashMessage('Not authorized.', '', ContextualFeedbackSeverity::ERROR);
        return $this->redirect('list');
    }

    $this->exampleRepository->remove($example);
    $this->addFlashMessage('Deleted successfully.', '', ContextualFeedbackSeverity::OK);
    return $this->redirect('list');
}
```

## CountryProvider Integration

Inject `TYPO3\CMS\Core\Country\CountryProvider` to provide a dynamic country list in forms:

```php
use TYPO3\CMS\Core\Country\CountryProvider;

public function __construct(
    ExampleRepository $exampleRepository,
    Context $context,
    CountryProvider $countryProvider
) {
    $this->exampleRepository = $exampleRepository;
    $this->context = $context;
    $this->countryProvider = $countryProvider;
}

// In any action needing country selection:
$countries = $this->countryProvider->getAll();
$dynamicCountries = [];
foreach ($countries as $country) {
    $dynamicCountries[$country->getAlpha2IsoCode()] = $country->getName();
}
$this->view->assign('dynamicCountries', $dynamicCountries);
```

Fluid template:

```html
<f:form.select property="country" options="{dynamicCountries}" />
```

## DateTime Converter for Form Dates

When forms submit dates as `Y-m-d` strings, configure the type converter in `initialize<Action>Action()`:

```php
public function initializeCreateAction(): void
{
    $this->setDateTimeFormat('newExample');
}

public function initializeUpdateAction(): void
{
    $this->setDateTimeFormat('example');
}

protected function setDateTimeFormat(string $argumentName): void
{
    if ($this->arguments->hasArgument($argumentName)) {
        $config = $this->arguments->getArgument($argumentName)->getPropertyMappingConfiguration();
        $config->forProperty('startDate')->setTypeConverterOption(
            \TYPO3\CMS\Extbase\Property\TypeConverter\DateTimeConverter::class,
            \TYPO3\CMS\Extbase\Property\TypeConverter\DateTimeConverter::CONFIGURATION_DATE_FORMAT,
            'Y-m-d'
        );
        $config->forProperty('endDate')->setTypeConverterOption(
            \TYPO3\CMS\Extbase\Property\TypeConverter\DateTimeConverter::class,
            \TYPO3\CMS\Extbase\Property\TypeConverter\DateTimeConverter::CONFIGURATION_DATE_FORMAT,
            'Y-m-d'
        );
    }
}
```

## Image Upload Handling

For file uploads via frontend forms, strip the upload data from the Extbase argument in `initialize*Action` and process it manually:

```php
protected array $uploadedImages = [];

public function initializeCreateAction(): void
{
    if ($this->request->hasArgument('newExample')) {
        $arg = $this->request->getArgument('newExample');
        if (isset($arg['images'])) {
            $this->uploadedImages = is_array($arg['images']) ? $arg['images'] : [$arg['images']];
            unset($arg['images']);
            $this->request = $this->request->withArgument('newExample', $arg);
        }
    }
}

public function createAction(Example $newExample): ResponseInterface
{
    // ... process $this->uploadedImages via FAL StorageRepository
    // See StoreOwnerDashboardController for full implementation
}
```

## Finding Records by Frontend User

Query by `feUser` field to retrieve a user's own record:

```php
protected function getRecordForCurrentUser(): ?Example
{
    $userId = $this->context->getPropertyFromAspect('frontend.user', 'id');
    if (!$userId) {
        return null;
    }

    $query = $this->exampleRepository->createQuery();
    $query->getQuerySettings()->setRespectStoragePage(false);
    $query->matching(
        $query->equals('feUser', $userId)
    );
    $result = $query->execute();

    return $result->count() > 0 ? $result->getFirst() : null;
}
```

> [!NOTE]
> `setRespectStoragePage(false)` disables the storage page filter, allowing the query to find records on any page. Use when records may exist on different pages than the plugin's configured storage pid.

## Flash Messages

```php
use TYPO3\CMS\Core\Type\ContextualFeedbackSeverity;

$this->addFlashMessage('Success message', '', ContextualFeedbackSeverity::OK);
$this->addFlashMessage('Error message', '', ContextualFeedbackSeverity::ERROR);
$this->addFlashMessage('Warning message', '', ContextualFeedbackSeverity::WARNING);
$this->addFlashMessage('Info message', '', ContextualFeedbackSeverity::INFO);
```

Display in Fluid:

```html
<f:flashMessages />
```

## Controller Annotations

These annotations are used **on controller action methods**. For model-property annotations (`Validate` on properties, `Lazy`, `Cascade`, `Transient`), see [domain-model-patterns.md](domain-model-patterns.md#model-annotations--attributes).

Since **TYPO3 v12+**, all annotations can be written as PHP 8 native attributes (recommended).

Source: [TYPO3 Annotations Reference](https://docs.typo3.org/m/typo3/reference-coreapi/12.4/en-us/ExtensionArchitecture/Extbase/Reference/Annotations.html)

### Validate (on Actions)

`\TYPO3\CMS\Extbase\Annotation\Validate` — Add validation rules to action **parameters**. These run **in addition to** any validators defined on the domain model.

```php
use TYPO3\CMS\Extbase\Annotation\Validate;

// PHP 8 attribute (recommended)
#[Validate(['validator' => 'NotEmpty', 'param' => 'title'])]
public function createAction(string $title): ResponseInterface
{
    // ...
}

// Docblock equivalent:
/**
 * @Validate("NotEmpty", param="title")
 */
public function createAction2(string $title): ResponseInterface { ... }
```

### IgnoreValidation

`\TYPO3\CMS\Extbase\Annotation\IgnoreValidation` — Skip **all** Extbase default validations for a given action argument. Essential for `new`/`edit` actions that receive an empty or partially filled domain object.

```php
use TYPO3\CMS\Extbase\Annotation\IgnoreValidation;

// PHP 8 attribute (recommended)
#[IgnoreValidation(['argumentName' => 'blog'])]
public function editAction(Blog $blog): ResponseInterface
{
    $this->view->assign('blog', $blog);
    return $this->htmlResponse();
}

// Docblock equivalent:
/** @IgnoreValidation("blog") */
public function editAction2(Blog $blog): ResponseInterface { ... }
```

> [!IMPORTANT]
> Without `IgnoreValidation`, Extbase validates the domain object **before** executing the action. For `new`/`edit` forms where the object may be empty or partially filled, this causes validation errors and prevents the form from rendering.

> [!WARNING]
> `IgnoreValidation()` **must not** be used on domain models supporting Extbase file uploads — it causes a property mapping error.

### Controller Annotation Quick Reference

| Annotation | PHP 8 Attribute | Purpose |
|------------|-----------------|--------|
| `Validate` | `#[Validate(['validator' => '...', 'param' => '...'])]` | Add validation to action parameter |
| `IgnoreValidation` | `#[IgnoreValidation(['argumentName' => '...'])]` | Skip all validation for argument |
