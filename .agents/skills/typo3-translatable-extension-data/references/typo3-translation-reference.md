# TYPO3 Translation Reference

Use this reference when implementing or debugging translatable extension records.

## Official TYPO3 Documentation Used For This Skill

### TCA Reference

- `languageField`, `transOrigPointerField`, `transOrigDiffSourceField`, and `translationSource` are the core `ctrl` settings TYPO3 uses to localize custom tables.
- `sys_language_uid` should use TCA `config.type = language`.
- `behaviour.allowLanguageSynchronization = true` enables TYPO3's localization state selector for fields that may stay synchronized with the source record.

Context7 source URLs:

- https://github.com/typo3-documentation/typo3cms-reference-tca/blob/main/Documentation/BestPractises/LanguageFields.rst
- https://github.com/typo3-documentation/typo3cms-reference-tca/blob/main/Documentation/Ctrl/_Properties/_LanguageField.rst.txt
- https://github.com/typo3-documentation/typo3cms-reference-tca/blob/main/Documentation/Ctrl/_Properties/_TransOrigDiffSourceField.rst.txt
- https://github.com/typo3-documentation/typo3cms-reference-tca/blob/main/Documentation/ColumnsConfig/Type/Language/Index.rst
- https://github.com/typo3-documentation/typo3cms-reference-tca/blob/main/Documentation/ColumnsConfig/Type/Text/T3Editor/_Properties/_AllowLanguageSynchronization.rst.txt

### Core API / Extbase

- Extbase repository query settings expose `setLanguageAspect()` and `getLanguageAspect()` so custom queries can follow TYPO3's language overlay rules.
- TYPO3's `LanguageAspect` controls overlay behavior and fallback handling.
- Controllers may read the current language context from `Context` when they need to choose or pass a specific overlay strategy.

Context7 source URLs:

- https://github.com/typo3-documentation/typo3cms-reference-coreapi/blob/main/Documentation/ExtensionArchitecture/Extbase/Reference/Domain/Repository/Index.rst
- https://github.com/typo3-documentation/typo3cms-reference-coreapi/blob/main/Documentation/ApiOverview/Context/Index.rst

## Site Package Examples

Use your site package as a source of concrete, project-local patterns instead of starting from scratch. Typical locations (adjust package name to your project):

- `packages/my-site-package/Configuration/TCA/tx_mysitepackage_domain_model_faq.php`
- `packages/my-site-package/Configuration/TCA/tx_mysitepackage_domain_model_outletstore.php`
- `packages/my-site-package/Classes/Domain/Repository/OutletStoreRepository.php`
- `packages/my-site-package/ext_tables.sql`

## Practical Notes

- Keep Fluid template translation out of scope for this skill.
- Prefer TYPO3's built-in localization columns and overlay behavior over custom translation flags.
- Use low-level QueryBuilder or raw SQL only when necessary; Extbase query settings are the safer default for localized domain models.
