# Content Blocks 0.x To 1.x Migration Checks

Use this reference only when `friendsoftypo3/content-blocks` is installed and the current project uses the 0.x structure.

## Preserve Before Changing Folders

For every registered Content Block, record its `typeName`, persisted fields, prefixes, FAL field names and order, labels, and relevant record counts. Include hidden/deleted history when the data-preservation requirement includes it.

## Required Structure And Fluid Changes

- Migrate `EditorInterface.yaml` to `config.yaml`, `Source/` to `templates/`, and language files to `language/labels.xlf`.
- Rename `Assets/` to lowercase `assets/`. On a case-insensitive workstation, stage and inspect the case-only rename from a case-sensitive environment so Git records the Linux-safe path.
- Replace removed `cb:asset.*` helpers with Core `f:asset.css` or `f:asset.script` plus `cb:assetPath()`. Replace removed resource helpers with the resulting asset path.
- Change `group: common` to `group: default`; remove or provide layouts no longer supplied by the old structure.
- Treat transformed link fields as objects and use `.url` where templates previously expected a scalar string.
- Port custom field types to the current attribute and `AbstractFieldType` API. Preserve their SQL storage contract unless a schema change is separately approved.
- Update Rector, Fractor, or other tool skip paths for lowercase `assets/` directories.

## Verification

Run the project equivalents of `content-blocks:lint` and `content-blocks:list`, then search for obsolete helpers, layouts, and names. A successful lint validates structure, not rendering: test each affected block in backend preview and representative frontend output, and compare the captured CType/FAL/data evidence after the copied-database upgrade.
