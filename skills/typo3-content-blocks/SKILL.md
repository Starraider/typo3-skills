---
name: typo3-content-blocks
description: Create, edit, and troubleshoot TYPO3 Content Blocks from the friendsoftypo3/content-blocks extension. Use this skill whenever the user asks for TYPO3 Content Blocks, content block `config.yaml`, `ContentBlocks/ContentElements`, `ContentBlocks/PageTypes`, `ContentBlocks/RecordTypes`, Content Block fields, templates, backend previews, icons, generated fields, the `make:content-block` command, `content-blocks:lint`, schema validation errors, missing CType/page/record types, broken labels, or Content Block rendering/debugging.
---

# TYPO3 Content Blocks

Use this skill for TYPO3 projects using `friendsoftypo3/content-blocks`. The extension defines content types with a component-like folder containing `config.yaml`, optional assets, templates, and labels.

## First Checks

1. Locate the loaded site package or extension that should own the Content Block.
2. Check whether `friendsoftypo3/content-blocks` is installed and whether the project uses Composer mode.
3. Find existing Content Blocks before adding new conventions:
   - `ContentBlocks/ContentElements/*/config.yaml`
   - `ContentBlocks/PageTypes/*/config.yaml`
   - `ContentBlocks/RecordTypes/*/config.yaml`
   - `ContentBlocks/FileTypes/*/config.yaml`
   - `ContentBlocks/Basics/*.yaml`
4. Read the nearest existing Content Block and follow its naming, labels, groups, templates, and asset style.
5. If the exact field syntax is uncertain, consult the official docs or local schemas before editing.

## Core Layout

A Content Block is auto-discovered when a loaded extension contains a folder below the correct `ContentBlocks` type directory and that folder contains `config.yaml`.

Use these canonical locations:

```text
EXT:site_package/ContentBlocks/ContentElements/my-element/config.yaml
EXT:site_package/ContentBlocks/PageTypes/my-page-type/config.yaml
EXT:site_package/ContentBlocks/RecordTypes/my-record-type/config.yaml
EXT:site_package/ContentBlocks/FileTypes/my-file-type/config.yaml
EXT:site_package/ContentBlocks/Basics/shared-fields.yaml
```

Optional resources live next to `config.yaml`:

```text
assets/icon.svg
assets/frontend.css
assets/frontend.js
language/labels.xlf
templates/frontend.fluid.html
templates/backend-preview.fluid.html
templates/partials/*
templates/layouts/*
```

## Creation Workflow

Prefer the project-local generator when available because it creates the expected folder, label file, templates, and icon skeleton:

```bash
vendor/bin/typo3 make:content-block --content-type="content-element" --vendor="vendor-name" --name="my-element" --title="My Element" --extension="site_package"
```

Use `content-element`, `page-type`, or `record-type` for `--content-type`. Page types require an integer `--type-name`.

After creating or changing fields, run the project equivalent of:

```bash
vendor/bin/typo3 cache:flush -g system
vendor/bin/typo3 extension:setup --extension=site_package
vendor/bin/typo3 content-blocks:lint
```

If the project has wrappers such as `ddev`, `composer`, `bin/typo3`, `Build/Scripts`, or Makefile targets, use those instead of hard-coding the bare command.

## Editing Workflow

1. Parse `config.yaml` as YAML. Avoid regex edits for structured changes.
2. Preserve existing root options such as `name`, `group`, `basics`, `prefixFields`, `prefixType`, `typeName`, `labelField`, and `fallbackLabelFields`.
3. Reuse existing TYPO3 fields only with `useExistingField: true`, commonly for fields such as `header` or `bodytext`; do not reuse system fields casually.
4. Add new fields with unique `identifier` values within the Content Block.
5. Add or update `language/labels.xlf` for editor-visible labels and descriptions.
6. Update both `templates/frontend.fluid.html` and `templates/backend-preview.fluid.html` when the editor preview needs to mirror frontend content.
7. If adding assets, reference them with Content Block ViewHelpers in Fluid rather than assuming a public path.
8. Re-run linting and the project cache/database update path after schema or field changes.

## Troubleshooting Workflow

Start with the observable symptom, then narrow the layer:

- **Block not listed:** verify folder path, loaded extension, `config.yaml` filename, valid `name`, extension dependency on Content Blocks, and backend user group permissions for generated CType/fields.
- **Schema or YAML error:** run `vendor/bin/typo3 content-blocks:lint`; use the reported JSON pointer path to find the invalid field or root option.
- **Fields missing in backend:** flush system cache, run extension setup/database compare, confirm field identifiers and prefixing, and check backend user permissions.
- **Frontend value missing:** use `{data.fieldIdentifier}` for processed properties and `{data.rawRecord.field_name}` for raw database values.
- **Relations not rendering:** remember that `Collection`, `Select`, `Relation`, `File`, `Folder`, `Category`, and `FlexForm` fields are resolved automatically in Content Block templates.
- **Assets missing:** check `assets/`, published assets, and `cb:assetPath()` usage in Fluid.
- **Labels show identifiers:** add/update `language/labels.xlf`; for places where Content Blocks cannot centralize labels, use a TCA override for a default column label.
- **Database row too large:** reduce generated columns, use relations/collections where appropriate, or revisit field prefixing and duplicated basics.

## Fluid Notes

Inside `frontend.fluid.html` and `backend-preview.fluid.html`, use the Content Blocks data object:

```html
{data.header}
{data.my_text_field}
{data.rawRecord.vendor_field_name}
<f:for each="{data.items}" as="item">{item.title}</f:for>
```

Use Content Block ViewHelpers for local assets and labels:

```html
<f:asset.css identifier="myElementCss" href="{cb:assetPath()}/frontend.css" />
<f:asset.script identifier="myElementJs" src="{cb:assetPath()}/frontend.js" />
<f:translate key="{cb:languagePath()}:header" />
```

## References

Read [references/content-blocks-patterns.md](references/content-blocks-patterns.md) when you need concrete examples, docs links, validation details, or a troubleshooting checklist.
