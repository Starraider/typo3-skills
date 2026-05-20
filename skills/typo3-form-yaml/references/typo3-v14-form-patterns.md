# TYPO3 v14 Form Patterns

Use the TYPO3 Form manual overview as the canonical starting point, then open the narrower configuration pages as needed:

- TYPO3 Form manual overview: [https://docs.typo3.org/c/typo3/cms-form/main/en-us/Index.html](https://docs.typo3.org/c/typo3/cms-form/main/en-us/Index.html)

## Version Gate

Check the exact TYPO3 v14 minor version first.

- TYPO3 `14.0` and `14.1`: use the legacy YAML registration path for frontend and backend.
- TYPO3 `14.2+`: TYPO3 auto-discovers form configuration from `Configuration/Form/<Set>/config.yaml`.
- TYPO3 `14.2+`: database storage for forms exists, file-mount storage is deprecated, and extension-path storage continues to work unchanged.

When a task explicitly requires versioned form definitions, prefer YAML in an extension path unless the user explicitly asks for database storage.

## Preferred File Layout

When the form belongs to the site package, prefer this layout:

```text
EXT:site_package/
  Configuration/
    Form/
      SiteForms/
        config.yaml
  Resources/
    Private/
      Forms/
        contact.form.yaml
      Templates/
        Form/
          Frontend/
      Partials/
        Form/
      Layouts/
        Form/
```

Use the owning extension key and package paths when the form belongs to a feature extension instead of the site package.

## TYPO3 v14.2+ Auto-Discovery

On TYPO3 `14.2` and newer, place form framework YAML in `Configuration/Form/<Set>/config.yaml`. TYPO3 loads it automatically for frontend and backend, so no extra PHP or TypoScript registration is required.

Example:

```yaml
name: 'vendor/site-package/forms'
label: 'Site Forms'
priority: 200

persistenceManager:
  allowedExtensionPaths:
    10: 'EXT:site_package/Resources/Private/Forms/'
  allowSaveToExtensionPaths: true
  # Enable only when editors should be allowed to delete versioned YAML forms.
  # allowDeleteFromExtensionPaths: true

prototypes:
  standard:
    formElementsDefinition:
      Form:
        renderingOptions:
          templateRootPaths:
            200: 'EXT:site_package/Resources/Private/Templates/Form/Frontend/'
          partialRootPaths:
            200: 'EXT:site_package/Resources/Private/Partials/Form/'
          layoutRootPaths:
            200: 'EXT:site_package/Resources/Private/Layouts/Form/'
      Text:
        properties:
          containerClassAttribute: 'form-field'
          elementClassAttribute: 'form-input'
          elementErrorClassAttribute: 'form-input form-input--error'
      Textarea:
        properties:
          containerClassAttribute: 'form-field'
          elementClassAttribute: 'form-textarea'
          elementErrorClassAttribute: 'form-textarea form-textarea--error'
```

Use `allowedExtensionPaths` plus `allowSaveToExtensionPaths: true` when editors should be able to save changes back into versioned `.form.yaml` files.

Prefer extension paths over file mounts for versioned project forms:

- file mounts are the deprecated file-based storage path in TYPO3 `14.2+`
- extension paths remain supported
- extension paths align better with version-controlled YAML

## TYPO3 v14.0 And v14.1 Legacy Registration

Do not assume TYPO3 `14.2+` features are available unless you verify the installed version.

For TYPO3 `14.0` and `14.1`, keep the same extension-based file layout but register the YAML for both frontend and backend.

Frontend registration example in the site set TypoScript:

```typoscript
plugin.tx_form {
  settings {
    yamlConfigurations {
      200 = EXT:site_package/Configuration/Form/SiteForms/FormSetup.yaml
    }
  }
}
```

Backend registration example in `ext_localconf.php`:

```php
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTypoScriptSetup(
    "module.tx_form.settings.yamlConfigurations.200 = EXT:site_package/Configuration/Form/SiteForms/FormSetup.yaml"
);
```

Use this fallback only on TYPO3 `14.0` or `14.1`. Once the project runs on TYPO3 `14.2+`, prefer the `config.yaml` auto-discovery path.

## Example Versioned Form Definition

Store the actual form under `Resources/Private/Forms/*.form.yaml`.

```yaml
identifier: contact
label: 'Contact form'
type: Form
prototypeName: standard
renderingOptions:
  submitButtonLabel: 'Send message'
renderables:
  -
    type: Page
    identifier: page-1
    label: 'Contact'
    renderables:
      -
        type: Text
        identifier: fullName
        label: 'Full name'
        properties:
          containerClassAttribute: 'form-field'
          elementClassAttribute: 'form-input'
          elementErrorClassAttribute: 'form-input form-input--error'
          fluidAdditionalAttributes:
            placeholder: 'Jane Doe'
        validators:
          -
            identifier: NotEmpty
      -
        type: Email
        identifier: email
        label: 'Email'
        properties:
          containerClassAttribute: 'form-field'
          elementClassAttribute: 'form-input'
          elementErrorClassAttribute: 'form-input form-input--error'
        validators:
          -
            identifier: NotEmpty
          -
            identifier: EmailAddress
      -
        type: Textarea
        identifier: message
        label: 'Message'
        properties:
          containerClassAttribute: 'form-field'
          elementClassAttribute: 'form-textarea'
          elementErrorClassAttribute: 'form-textarea form-textarea--error'
        validators:
          -
            identifier: NotEmpty
finishers:
  -
    identifier: EmailToReceiver
  -
    identifier: Confirmation
```

## Styling Strategy

Use this order of preference:

1. Set shared defaults per form element type in the form framework YAML.
2. Set form-specific classes in the `.form.yaml` definition when the form needs exceptions.
3. Override templates only when classes are not enough.

The most important built-in styling hooks are:

- `properties.containerClassAttribute`: wrapper around the field
- `properties.elementClassAttribute`: class written to the form control
- `properties.elementErrorClassAttribute`: class added when validation fails

For many form elements, TYPO3's config reference marks these properties as overwritable in the form definition, even though the default backend form editor does not expose them as editable fields.

## Tailwind And CSS Workflows

Prefer semantic class names in YAML such as `form-field`, `form-input`, and `form-textarea`, then define those classes in the site package CSS.

Example partial or shared CSS:

```css
.form-field {
    @apply mb-5;
}

.form-input {
    @apply block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm;
}

.form-input--error {
    @apply border-error ring-1 ring-error;
}

.form-textarea {
    @apply block min-h-40 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm;
}

.form-textarea--error {
    @apply border-error ring-1 ring-error;
}
```

If you put raw Tailwind utility classes directly into `.form.yaml`, Tailwind must scan those YAML files or the utilities will be missing from the compiled CSS.

If the frontend build uses Tailwind and stores utility classes directly in form YAML, add a matching content-scan rule in the Tailwind entrypoint, for example:

```css
@source "../../Forms/**/*.yaml";
```

After any CSS or Tailwind class change, run the local frontend asset build and clear TYPO3 caches if required by the setup.

Prefer literal class strings. Do not rely on dynamically constructed utility classes inside YAML or Fluid when Tailwind needs to extract them.

## Exposing CSS Class Fields In The Backend Form Editor

This pattern is inferred from TYPO3's documented `formEditor.editors` configuration: inspector editors write to a `propertyPath`, and the class properties are overwritable in the form definition even though the standard prototype does not expose them by default.

Example:

```yaml
prototypes:
  standard:
    formElementsDefinition:
      Text:
        formEditor:
          editors:
            350:
              identifier: elementClassAttribute
              templateName: Inspector-TextEditor
              label: 'Element CSS classes'
              propertyPath: properties.elementClassAttribute
            360:
              identifier: containerClassAttribute
              templateName: Inspector-TextEditor
              label: 'Container CSS classes'
              propertyPath: properties.containerClassAttribute
```

Use this only when editors truly need per-field styling control. Otherwise, prefer stable defaults in the form framework YAML.

## Frontend Template Overrides

Override TYPO3's form templates only when you need markup changes, extra wrappers, or shared semantics that class attributes cannot provide.

Put the override paths into the form setup YAML via:

- `renderingOptions.templateRootPaths`
- `renderingOptions.partialRootPaths`
- `renderingOptions.layoutRootPaths`

Keep the override surface small. If a CSS class is enough, do not fork the template.

## Validation

Any visible form change is a frontend task and must be verified accordingly.

1. Ask for the mounted form URL if it is not already known.
2. Confirm the page renders before testing, especially when query arguments or `cHash` are involved.
3. Run the available frontend test workflow, such as Playwright, Cypress, or manual browser verification if no automated browser tests exist.
4. Add or extend a relevant browser test when the work changes rendered output or needs regression protection.

Typical command pattern:

```bash
npx playwright test path/to/<form-spec>.spec.ts
```

## Sources

Primary TYPO3 sources used for this reference:

- TYPO3 Form manual overview: [https://docs.typo3.org/c/typo3/cms-form/main/en-us/Index.html](https://docs.typo3.org/c/typo3/cms-form/main/en-us/Index.html)
- Form configuration and YAML registration: [https://docs.typo3.org/c/typo3/cms-form/main/en-us/I/Concepts/Configuration/Index.html](https://docs.typo3.org/c/typo3/cms-form/main/en-us/I/Concepts/Configuration/Index.html)
- Form and file storage, including `allowedExtensionPaths` and `allowSaveToExtensionPaths`: [https://docs.typo3.org/c/typo3/cms-form/main/en-us/I/Concepts/FormFileStorages/Index.html](https://docs.typo3.org/c/typo3/cms-form/main/en-us/I/Concepts/FormFileStorages/Index.html)
- TYPO3 `14.2` database-storage feature and extension-path support: [https://docs.typo3.org/c/typo3/cms-core/main/en-us/Changelog/14.2/Feature-108653-DatabaseStorageForFormExtension.html](https://docs.typo3.org/c/typo3/cms-core/main/en-us/Changelog/14.2/Feature-108653-DatabaseStorageForFormExtension.html)
- Form element config reference showing `containerClassAttribute`, `elementClassAttribute`, and inspector-editor patterns: [https://docs.typo3.org/c/typo3/cms-form/main/en-us/I/Config/proto/formElements/formElementTypes/Text.html](https://docs.typo3.org/c/typo3/cms-form/main/en-us/I/Config/proto/formElements/formElementTypes/Text.html)
