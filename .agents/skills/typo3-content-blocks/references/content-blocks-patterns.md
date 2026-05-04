# TYPO3 Content Blocks Patterns

This reference captures practical patterns from the official Content Blocks documentation for `friendsoftypo3/content-blocks`.

Official docs:

- Main docs: https://docs.typo3.org/p/friendsoftypo3/content-blocks/main/en-us/
- Definition: https://docs.typo3.org/p/friendsoftypo3/content-blocks/main/en-us/Definition/Index.html
- Registration: https://docs.typo3.org/p/friendsoftypo3/content-blocks/main/en-us/Registration/Index.html
- Kickstart command: https://docs.typo3.org/p/friendsoftypo3/content-blocks/main/en-us/Commands/Make/Index.html
- Lint command: https://docs.typo3.org/p/friendsoftypo3/content-blocks/main/en-us/Commands/Lint/Index.html
- JSON Schema: https://docs.typo3.org/p/friendsoftypo3/content-blocks/main/en-us/JsonSchema/Index.html
- Templating: https://docs.typo3.org/p/friendsoftypo3/content-blocks/main/en-us/Templating/Index.html
- Known Problems: https://docs.typo3.org/p/friendsoftypo3/content-blocks/main/en-us/KnownProblems/Index.html

## Minimal Content Element

```yaml
name: vendor/teaser
group: default
labelField: header
fields:
  - identifier: header
    useExistingField: true
  - identifier: text
    type: Textarea
```

Expected path:

```text
EXT:site_package/ContentBlocks/ContentElements/teaser/config.yaml
```

The `name` must be unique in the installation. It follows a Composer-like `vendor/package` shape and is used when Content Blocks generates field names, table names, and type identifiers.

## Common Content Element Root Options

- `description`: Editor-facing description. Prefer `language/labels.xlf` for translated projects.
- `group`: Backend wizard and selector group. TYPO3 core groups include `default`, `menu`, `special`, `forms`, and `plugins`.
- `typeName`: Explicit content element identifier. If omitted, it is generated from `name`.
- `saveAndClose`: Useful for elements/plugins without configuration.
- `labelField`: Field or fields used as backend record title.
- `fallbackLabelFields`: Fallback fields when a single `labelField` is empty.

## Generator Commands

One-line creation:

```bash
vendor/bin/typo3 make:content-block --content-type="content-element" --vendor="my-vendor" --name="my-name" --title="My Content Element" --extension="my_sitepackage"
```

Interactive creation:

```bash
vendor/bin/typo3 make:content-block
```

Non-Composer fallback:

```bash
typo3/sysext/core/bin/typo3 make:content-block
```

Useful options:

- `--content-type`: `content-element`, `page-type`, or `record-type`.
- `--vendor`: Lowercase vendor name, separated by dashes.
- `--name`: Lowercase Content Block name, separated by dashes.
- `--extension`: Host extension key.
- `--title`: Human-readable title.
- `--type-name`: Custom type name. Required and integer for page types.
- `--skeleton-path`: Project-relative skeleton folder.
- `--config-path`: YAML defaults file, defaulting to `content-blocks.yaml`.

## Skeleton Defaults

Projects can provide a `content-blocks-skeleton` folder at the project root. The generator copies matching content-type skeleton files into new blocks, except `language/labels.xlf` and `config.yaml`, which are generated dynamically.

Example:

```text
content-blocks-skeleton/
  content-element/
    assets/icon.svg
    templates/backend-preview.fluid.html
    templates/frontend.fluid.html
  page-type/
  record-type/
```

Projects can also provide command defaults in `content-blocks.yaml`:

```yaml
vendor: my-vendor
extension: site_package
content-type: content-element
skeleton-path: content-blocks-skeleton
config:
  content-element:
    basics:
      - TYPO3/Appearance
      - TYPO3/Links
    group: default
    prefixFields: true
    prefixType: vendor
```

## Validation And IDE Schemas

The extension ships JSON Schemas under `JsonSchema/`. The integrated lint command validates all loaded Content Blocks:

```bash
vendor/bin/typo3 content-blocks:lint
```

Schema file patterns:

```text
JsonSchema/content-element.schema.json -> **/ContentBlocks/ContentElements/*/config.yaml
JsonSchema/page-type.schema.json      -> **/ContentBlocks/PageTypes/*/config.yaml
JsonSchema/record-type.schema.json    -> **/ContentBlocks/RecordTypes/*/config.yaml
JsonSchema/file-type.schema.json      -> **/ContentBlocks/FileTypes/*/config.yaml
JsonSchema/basic.schema.json          -> **/ContentBlocks/Basics/*.yaml
```

When lint reports a path such as `/fields/3/fields/0`, walk the YAML object by array indexes and keys. Fix the nearest invalid option according to the field type schema.

## Templating Patterns

Content Blocks provides separate frontend and backend preview templates:

```text
templates/frontend.fluid.html
templates/backend-preview.fluid.html
```

Use processed fields on `{data}`:

```html
<h2>{data.header}</h2>
<p>{data.text}</p>
```

Use `rawRecord` only when the database value is needed:

```html
{data.rawRecord.my_vendor_my_field}
```

Relation-like fields are resolved automatically, including `Collection`, `Select`, `Relation`, `File`, `Folder`, `Category`, and `FlexForm`.

```html
<f:for each="{data.cards}" as="card">
    <article>
        <h3>{card.title}</h3>
        <p>{card.text}</p>
    </article>
</f:for>
```

Use local Content Block assets through the Content Blocks ViewHelper:

```html
<f:asset.css identifier="teaserCss" href="{cb:assetPath()}/frontend.css" />
<f:asset.script identifier="teaserJs" src="{cb:assetPath()}/frontend.js" />
```

Use local labels through the Content Blocks language path:

```html
<f:translate key="{cb:languagePath()}:header" />
```

## Troubleshooting Checklist

### Content Block Is Not Registered

- Confirm the extension is loaded and depends on `content_blocks`.
- Confirm path spelling is exactly `ContentBlocks/ContentElements`, `ContentBlocks/PageTypes`, or `ContentBlocks/RecordTypes`.
- Confirm `config.yaml` exists directly inside the block folder.
- Confirm `name` is unique and has the `vendor/name` form.
- Flush system cache.
- Run extension setup/database compare after adding generated fields.
- Check backend user group permissions for generated fields, tables, and CType.

### Backend Shows Identifiers Instead Of Labels

- Add or repair `language/labels.xlf`.
- Use expected keys such as `title`, `description`, and field identifiers.
- In backend contexts where Content Blocks cannot provide central field labels, add a TCA override:

```php
$GLOBALS['TCA']['tt_content']['columns']['my_prefix_my_identifier']['label'] = 'LLL:EXT:my_extension/path/to/locallang.xlf';
```

### Fields Do Not Appear Or Persist

- Re-run system cache flush and extension setup/database compare.
- Check generated field names when `prefixFields` or `prefixType` is enabled.
- Check whether a `Basic` includes fields with prefixes that duplicate columns across many blocks.
- Avoid reusing system fields; only use `useExistingField: true` for sensible reusable fields.

### Template Data Looks Wrong

- Use `{data.identifier}` for processed values.
- Use `{data.rawRecord.column_name}` only for raw database values.
- Do not use `_processed` in Fluid access even if debug output shows processed internals.
- For relation fields, iterate the resolved property on `{data}` before adding custom DataProcessors.

### Row Size Too Large

- Reduce duplicated generated columns.
- Prefer relation-style structures for repeated or large data.
- Review `Basic` usage with field prefixing; shared basics can generate many columns if every included field is prefixed per Content Block.

## Implementation Discipline

- Keep Content Blocks copy-pasteable across projects when possible; avoid hard dependencies on unrelated extension resources.
- Update frontend and backend preview templates together when editor preview matters.
- Use project command wrappers, DDEV, or composer scripts when the repository provides them.
- Verify with `content-blocks:lint` before considering schema work complete.
