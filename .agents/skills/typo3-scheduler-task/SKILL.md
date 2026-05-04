---
name: typo3-scheduler-task
description: Create and modify custom TYPO3 Scheduler tasks for TYPO3 v14 only. Use this skill when adding a new scheduler task class, registering a task type in `tx_scheduler_task`, adding or changing scheduler task configuration fields, migrating an existing task away from `AdditionalFieldProviderInterface`, or updating an existing custom scheduler task's TCA, validation, storage, or execution behavior.
---

# TYPO3 Scheduler Task

Build and maintain native TYPO3 v14 scheduler tasks. This skill covers both greenfield task creation and modifications to existing custom tasks that must now be configured through TCA.

## Use This Skill For

- Creating a new custom scheduler task in a TYPO3 v14 extension
- Modifying an existing custom scheduler task
- Migrating legacy scheduler tasks registered in `ext_localconf.php`
- Replacing `AdditionalFieldProviderInterface` with native TCA fields
- Adding, renaming, validating, or persisting task-specific configuration fields

## Core Rules

1. TYPO3 v14 only. Do not use pre-v14 registration patterns as the primary implementation.
2. Custom task classes must extend `\TYPO3\CMS\Scheduler\Task\AbstractTask`.
3. Register custom task types via TCA on `tx_scheduler_task`, not via `$GLOBALS['TYPO3_CONF_VARS']['SC_OPTIONS']['scheduler']['tasks']`.
4. Do not build new implementations around `AdditionalFieldProviderInterface` or `AbstractAdditionalFieldProvider`; they are deprecated in TYPO3 v14.
5. Dependency injection cannot be relied on inside scheduler task execution. Instantiate collaborators with `GeneralUtility::makeInstance()` from the task.
6. Prefer TCA/FormEngine validation for required fields and basic normalization. Only use `validateTaskParameters()` for validation that TCA cannot express.

## Workflow

### 1. Classify the task change

Choose one path before editing:

- New native task: create task class, TCA registration, labels, and SQL for any custom `tx_scheduler_task` columns.
- Existing native task: update the task class, TCA type definition, TCA columns, labels, and SQL in sync.
- Legacy task migration: remove old `ext_localconf.php` scheduler registration, replace deprecated additional field provider usage with TCA, and keep migration-safe parameter mapping in the task class.

### 2. Touch the right files

Most TYPO3 v14 scheduler task work belongs in these files:

- `Classes/Task/<TaskName>Task.php`
- `Configuration/TCA/Overrides/scheduler_<task_name>_task.php`
- `Resources/Private/Language/locallang*.xlf`
- `ext_tables.sql` for any custom `tx_scheduler_task` columns your task adds

Only touch `ext_localconf.php` when removing deprecated registration during migration.

## Implementation Rules

### Task class

- Implement `execute(): bool`.
- Implement `getAdditionalInformation(): string` when the backend list should show useful per-task context.
- Implement `setTaskParameters(array $parameters): void` for native v14 tasks.
- Keep `getTaskParameters(): array` when migrating legacy tasks or when explicit mapping is clearer than `AbstractTask` defaults.
- For migrations, map old provider field names and new TCA column names in `setTaskParameters()`.

### TCA registration

- Add custom task fields with `ExtensionManagementUtility::addTCAcolumns('tx_scheduler_task', ...)`.
- Register the task type with `ExtensionManagementUtility::addRecordType(...)`.
- Use the fully qualified task class name as the record type `value`.
- Put task-specific fields directly into the `showitem` string for that task type.
- Preserve the core timing and access tabs unless there is a strong reason not to.

### Storage and field naming

- Treat native v14 tasks as TCA-driven records on `tx_scheduler_task`.
- If the task needs custom persisted settings, add real columns to `tx_scheduler_task` and define matching SQL in your extension.
- Use extension-prefixed column names such as `tx_myext_api_endpoint` to avoid collisions.
- Keep task property names and TCA field names aligned where practical; add explicit mapping when changing legacy names.

### Legacy task migration

- Remove deprecated scheduler registration from `ext_localconf.php`.
- Remove the old `AdditionalFieldProvider` class once TYPO3 13 compatibility is no longer needed.
- Keep migration-aware parameter mapping like:
  `oldName ?? tx_myext_new_field ?? default`
- Do not break existing stored task records during renames.

## Verification

After implementation or modification:

1. Run `ddev typo3 database:updateschema`.
2. Run `ddev typo3 cache:flush`.
3. Open `Administration > Scheduler`, create or edit the task, and confirm the custom fields render and save.
4. Use `ddev typo3 scheduler:list` to confirm the task is registered.
5. Run the task manually with `ddev typo3 scheduler:run --task=<uid> --force` or `ddev typo3 scheduler:execute --task=<uid>` when appropriate.

## References

Read [references/typo3-v14-scheduler-task-patterns.md](references/typo3-v14-scheduler-task-patterns.md) when you need the concrete file patterns, migration mapping examples, or source-backed implementation notes.
