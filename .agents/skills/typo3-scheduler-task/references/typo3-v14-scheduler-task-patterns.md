# TYPO3 v14 Scheduler Task Patterns

Use this reference when implementing or modifying a custom scheduler task.

## Source Basis

Official TYPO3 documentation:

- Creating a custom scheduler task:
  [docs.typo3.org/c/typo3/cms-scheduler/main/en-us/DevelopersGuide/CreatingTasks/Index.html](https://docs.typo3.org/c/typo3/cms-scheduler/main/en-us/DevelopersGuide/CreatingTasks/Index.html)
- Migration to TCA registration:
  [docs.typo3.org/c/typo3/cms-scheduler/main/en-us/DevelopersGuide/CreatingTasks/Migration.html](https://docs.typo3.org/c/typo3/cms-scheduler/main/en-us/DevelopersGuide/CreatingTasks/Migration.html)
- Scheduler task storage:
  [docs.typo3.org/c/typo3/cms-scheduler/main/en-us/DevelopersGuide/TaskStorage/Index.html](https://docs.typo3.org/c/typo3/cms-scheduler/main/en-us/DevelopersGuide/TaskStorage/Index.html)
- Scheduler backend form and timing fields:
  [docs.typo3.org/c/typo3/cms-scheduler/14.0/en-us/Administration/EditTask/Index.html](https://docs.typo3.org/c/typo3/cms-scheduler/14.0/en-us/Administration/EditTask/Index.html)

Relevant local core examples:

- `vendor/typo3/cms-reports/Configuration/TCA/Overrides/scheduler_system_status_update_task.php`
- `vendor/typo3/cms-reports/Classes/Task/SystemStatusUpdateTask.php`
- `vendor/typo3/cms-scheduler/Configuration/TCA/tx_scheduler_task.php`
- `vendor/typo3/cms-scheduler/Documentation/DevelopersGuide/CreatingTasks/Migration.rst`

## File Checklist

For a new task with custom settings, expect to touch:

1. `Classes/Task/<TaskName>Task.php`
2. `Configuration/TCA/Overrides/scheduler_<task_name>_task.php`
3. `Resources/Private/Language/locallang.xlf` or a dedicated language file
4. `ext_tables.sql`

## Minimal Task Class

```php
<?php

declare(strict_types=1);

namespace Vendor\Extension\Task;

use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Scheduler\Task\AbstractTask;
use Vendor\Extension\Service\MyTaskRunner;

final class ExampleTask extends AbstractTask
{
    protected string $txMyextEndpoint = '';

    public function execute(): bool
    {
        $runner = GeneralUtility::makeInstance(MyTaskRunner::class);
        return $runner->run($this->txMyextEndpoint);
    }

    public function setTaskParameters(array $parameters): void
    {
        $this->txMyextEndpoint = $parameters['tx_myext_endpoint'] ?? '';
    }

    public function getAdditionalInformation(): string
    {
        return $this->txMyextEndpoint !== ''
            ? 'Endpoint: ' . $this->txMyextEndpoint
            : '';
    }
}
```

Notes:

- `execute(): bool` is mandatory.
- The docs explicitly note that dependency injection cannot be used in scheduler tasks, so use `GeneralUtility::makeInstance()`.
- `getAdditionalInformation()` is optional but useful in the backend list.

## Native TCA Registration Pattern

```php
<?php

declare(strict_types=1);

use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;
use Vendor\Extension\Task\ExampleTask;

defined('TYPO3') or die();

if (isset($GLOBALS['TCA']['tx_scheduler_task'])) {
    ExtensionManagementUtility::addTCAcolumns(
        'tx_scheduler_task',
        [
            'tx_myext_endpoint' => [
                'label' => 'LLL:EXT:my_ext/Resources/Private/Language/locallang.xlf:scheduler.endpoint',
                'config' => [
                    'type' => 'input',
                    'required' => true,
                    'eval' => 'trim',
                ],
            ],
        ]
    );

    ExtensionManagementUtility::addRecordType(
        [
            'label' => 'LLL:EXT:my_ext/Resources/Private/Language/locallang.xlf:scheduler.task.label',
            'description' => 'LLL:EXT:my_ext/Resources/Private/Language/locallang.xlf:scheduler.task.description',
            'value' => ExampleTask::class,
            'icon' => 'mimetypes-x-tx_scheduler_task_group',
            'iconOverlay' => 'content-clock',
            'group' => 'my_ext',
        ],
        '
        --div--;core.form.tabs:general,
            tasktype,
            task_group,
            description,
            tx_myext_endpoint,
        --div--;core.form.tabs:timing,
            --palette--;;execution,
        --div--;core.form.tabs:access,
            disable,
        --div--;core.form.tabs:extended,',
        [],
        '',
        'tx_scheduler_task'
    );
}
```

Important points:

- The task type value is normally the task class FQCN.
- The task is added as a TCA type on `tx_scheduler_task`.
- Custom fields belong in the task type `showitem` definition.
- Keep the timing palette so the task can still be scheduled properly.

## SQL for Native Task Fields

If you add custom TCA columns to `tx_scheduler_task`, your extension must also provide SQL for them:

```sql
CREATE TABLE tx_scheduler_task (
    tx_myext_endpoint varchar(2048) DEFAULT '' NOT NULL
);
```

This is an implementation inference from standard TYPO3 TCA-to-schema behavior plus the native-task examples. Without matching SQL, the backend form cannot persist the field.

## Migration Pattern for Existing Tasks

When modifying an old task that used an additional field provider, keep the parameter bridge intact:

```php
public function getTaskParameters(): array
{
    return [
        'tx_myext_endpoint' => $this->txMyextEndpoint,
    ];
}

public function setTaskParameters(array $parameters): void
{
    $this->txMyextEndpoint = $parameters['endpoint'] ?? $parameters['tx_myext_endpoint'] ?? '';
}
```

Use this when:

- the old provider stored legacy names such as `endpoint`
- you renamed fields during migration
- existing scheduler records must remain editable after the TYPO3 v14 migration

The TYPO3 migration docs state that `getTaskParameters()` remains mainly relevant for migration from the old serialized task format and for non-native deprecated task types, while `setTaskParameters()` should still be implemented for native tasks.

## Validation Guidance

Use TCA for simple validation:

- `required => true`
- `eval => trim`
- normal input/select/check configuration

Use `validateTaskParameters()` only for business validation that TCA cannot express, for example:

- validating a comma-separated email list
- checking a remote endpoint format
- cross-field validation rules

When validation fails, add a `FlashMessage` and return `false`.

## TYPO3 v14 Facts to Preserve

- Native scheduler tasks are registered through TCA.
- Registration via `$GLOBALS['TYPO3_CONF_VARS']['SC_OPTIONS']['scheduler']['tasks']` is deprecated since TYPO3 14.
- `AdditionalFieldProviderInterface` and `AbstractAdditionalFieldProvider` are deprecated since TYPO3 14.
- Scheduler task storage switched to JSON-based storage in TYPO3 14.
- `tx_scheduler_task.tasktype` stores the task type identifier.
- For native tasks, custom field values are stored directly in database columns on `tx_scheduler_task`; non-native legacy tasks still rely on the `parameters` field.

## Backend and CLI Verification

Use this sequence after changes:

```bash
ddev typo3 database:updateschema
ddev typo3 cache:flush
ddev typo3 scheduler:list
```

Then create or edit the task in `Administration > Scheduler`.

To run it manually:

```bash
ddev typo3 scheduler:run --task=<uid> --force
```

or:

```bash
ddev typo3 scheduler:execute --task=<uid>
```

If the backend shows the type but fields do not persist, check these first:

- missing SQL column in `ext_tables.sql`
- wrong field name mapping in `setTaskParameters()`
- task still registered only through deprecated `ext_localconf.php` logic
- cache/schema not flushed after TCA or SQL changes
