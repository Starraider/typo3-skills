---
name: typo3-translatable-extension-data
description: Make TYPO3 v13+/v14+ extension records translatable and ensure Extbase or frontend plugin code returns localized records for the active site language. Use when a custom table in an extension needs TYPO3 localization support, when selected record fields must be translatable or language-synchronized, when TCA and SQL translation columns must be added, or when repositories and controllers still return default-language records instead of overlays. Apply whenever certain records of an extension need to be translatable or when controllers must provide translated records. Do not use this skill for Fluid template or XLF label translation.
---

# TYPO3 Translatable Extension Data

## Overview

Configure custom extension tables so TYPO3 can localize records with the standard language columns and overlay behavior. Keep the scope on record data, TCA, SQL schema, repositories, and controllers; do not handle translating Fluid templates or labels in this skill.

## Workflow

1. Identify the custom table and the fields that must vary by language.
2. Add the required localization columns to `ext_tables.sql`.
3. Wire the table `ctrl` localization settings and localization columns in TCA.
4. Add `allowLanguageSynchronization` only to fields editors may intentionally keep in sync with the source record.
5. Keep repository queries language-aware so controllers receive localized entities.
6. Verify the translated page or plugin output in a non-default language.

## Add The Required Database Fields

Add these localization columns to every custom table that TYPO3 must translate:

```sql
sys_language_uid int(11) DEFAULT '0' NOT NULL,
l10n_parent int(11) DEFAULT '0' NOT NULL,
l10n_source int(11) DEFAULT '0' NOT NULL,
l10n_diffsource mediumblob,
```

Add this column when any business field uses `behaviour.allowLanguageSynchronization`:

```sql
l10n_state text,
```

Use TYPO3's normal base columns such as `uid`, `pid`, `hidden`, `deleted`, `tstamp`, and `crdate` as usual. Do not invent custom translation linkage fields when TYPO3's standard localization columns solve the problem.

## Configure The Required TCA `ctrl` Settings

Add the localization wiring to the table `ctrl` section:

```php
'ctrl' => [
    'languageField' => 'sys_language_uid',
    'transOrigPointerField' => 'l10n_parent',
    'transOrigDiffSourceField' => 'l10n_diffsource',
    'translationSource' => 'l10n_source',
],
```

These settings are the core TYPO3 translation contract for custom tables. Expose the language fields in a palette or type definition so editors can create and inspect translations in the backend.

## Configure The Localization Columns

Use TYPO3's current field types and local table relation pattern:

```php
'sys_language_uid' => [
    'exclude' => true,
    'label' => 'LLL:EXT:core/Resources/Private/Language/locallang_general.xlf:LGL.language',
    'config' => [
        'type' => 'language',
    ],
],
'l10n_parent' => [
    'displayCond' => 'FIELD:sys_language_uid:>:0',
    'exclude' => true,
    'label' => 'LLL:EXT:core/Resources/Private/Language/locallang_general.xlf:LGL.l18n_parent',
    'config' => [
        'type' => 'select',
        'renderType' => 'selectSingle',
        'default' => 0,
        'items' => [
            ['', 0],
        ],
        'foreign_table' => 'tx_myext_domain_model_record',
        'foreign_table_where' => 'AND {#tx_myext_domain_model_record}.{#pid}=###CURRENT_PID### AND {#tx_myext_domain_model_record}.{#sys_language_uid} IN (-1,0)',
    ],
],
'l10n_source' => [
    'displayCond' => 'FIELD:sys_language_uid:>:0',
    'config' => [
        'type' => 'passthrough',
    ],
],
'l10n_diffsource' => [
    'config' => [
        'type' => 'passthrough',
    ],
],
```

Use the table's own name in `foreign_table` and keep the parent selector restricted to the current PID and default or all-language source rows.

## Mark Business Fields Deliberately

Treat each business field intentionally:

- Add `behaviour.allowLanguageSynchronization = true` only on fields editors may keep synchronized from the source language.
- Leave fields fully editable per translation when the translated value should diverge, such as titles, summaries, body text, or language-specific slugs.
- Use synchronization mainly for shared metadata, dates, toggles, or relations that are usually identical across languages.
- Ensure related child tables are also translatable if editors need translated child records rather than inherited default-language relations.

Example:

```php
'config' => [
    'type' => 'datetime',
    'behaviour' => [
        'allowLanguageSynchronization' => true,
    ],
],
```

## Keep Repositories Translation-Aware

Prefer repository methods that respect the active frontend language instead of hardcoding default-language records.

For custom queries, set the language behavior on query settings:

```php
private function createFrontendQuery(): QueryInterface
{
    $query = $this->createQuery();
    $querySettings = $query->getQuerySettings();
    $querySettings->setRespectStoragePage(false);
    $querySettings->setRespectSysLanguage(true);
    $querySettings->setLanguageAspect($this->context->getAspect('language'));

    return $query;
}
```

Apply these rules:

- Prefer Extbase repository queries for localized domain records so TYPO3 can apply language overlays.
- Avoid hardcoding `sys_language_uid = 0` in frontend-facing repository methods unless the explicit goal is to fetch source records.
- Accept or construct a `LanguageAspect` for custom fallback or overlay behavior instead of inventing manual translation switching logic.
- Keep all related repository calls on the same language aspect so translated pages do not mix translated parents with default-language children.

If a method must force a specific overlay strategy, use `setLanguageAspect()` on the query settings, as documented in TYPO3's Extbase repository reference.

## Keep Controllers Thin And Language-Aware

Use controllers to obtain the current context and delegate localized record lookup to repositories:

- Inject or resolve `TYPO3\CMS\Core\Context\Context` when a controller needs the active language aspect.
- Pass the current `LanguageAspect` into repository methods only when default Extbase behavior is not sufficient.
- Assign already localized entities to Fluid.
- Do not fetch source records in the controller and expect the view layer to translate them afterward.

## Verify Translation Behavior

After implementation:

1. Create or inspect a default-language record.
2. Create a translated child record in the backend.
3. Check that the plugin page in the target language renders translated field values.
4. Check that synchronized fields still follow the source record when editors choose synchronization.
5. Check that untranslated relations or custom queries do not leak default-language records unexpectedly.

## References

Read [references/typo3-translation-reference.md](references/typo3-translation-reference.md) for the official TYPO3 documentation that backs the TCA and repository rules in this skill, plus local project examples to reuse.
