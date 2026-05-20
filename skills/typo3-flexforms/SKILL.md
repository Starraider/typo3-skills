---
name: typo3-flexforms
description: Create and configure TYPO3 v14 FlexForms for Extbase plugins and plain content elements. Use this skill when requested to add plugin settings, configure plugin registration with an XML FlexForm, add categories to a FlexForm, or when fixing broken FlexForms by removing legacy `TCEforms` tags.
---

# TYPO3 FlexForms (v14+)

This skill provides guidelines and patterns for implementing FlexForms in TYPO3 v14+.

## Core Rules for TYPO3 v14

1. **No `<TCEforms>` Tag**: The `<TCEforms>` tag is deprecated and has been completely removed in TYPO3 v13+. All configurations must be placed directly under the element property (e.g., directly as `<config>...</config>`). Including `<TCEforms>` will break the FlexForm display in the backend.
2. **Settings Prefix**: When configuring Extbase plugins, prefix field names with `settings.` (e.g., `<settings.limit>`). This makes them automatically available in the controller via `$this->settings['limit']` and in Fluid via `{settings.limit}`.
3. **Direct Plugin Registration**: Registration methods `ExtensionUtility::registerPlugin()` and `ExtensionManagementUtility::addPlugin()` accept the FlexForm XML path directly as an argument, eliminating the need for `addPiFlexFormValue()` and custom TCA `showitem` overrides in most cases. Internally, this adds the FlexForm definition to the `ds` option of the plugin via `columnsOverrides`.

## Workflow

1. Determine if the plugin is Extbase or a plain TYPO3 content element.
2. Create the FlexForm XML in `Configuration/FlexForms/PluginName.xml`.
3. Register the FlexForm using the new direct registration parameters (see references).
4. Remove any legacy `<TCEforms>` wrappers if modernizing existing configurations.

## References

For complete examples of configuration, including Extbase registration, plain plugin registration, XML file structure, and Categories, see [references/examples.md](references/examples.md).
