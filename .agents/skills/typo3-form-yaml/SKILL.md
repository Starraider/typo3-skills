---
name: typo3-form-yaml
description: Create, configure, edit, and style TYPO3 v14 forms built with EXT:form using versioned YAML files in an extension or site package instead of database storage. Use this skill when adding or modifying YAML form setup in `Configuration/Form/`, creating or updating `.form.yaml` definitions under `Resources/Private/Forms/`, configuring extension-path persistence for the form editor, exposing styling hooks such as `containerClassAttribute` or `elementClassAttribute`, overriding TYPO3 form templates, or integrating TYPO3 forms with a frontend CSS workflow.
---

# TYPO3 Form YAML (v14)

Use this skill only for TYPO3 v14 and only for EXT:form work. Do not use it for Extbase plugin forms or FlexForms.

## Workflow

1. Confirm the task is really about TYPO3's Form Extension and check the concrete TYPO3 14 minor version before choosing a registration path.
2. Keep form framework setup in an extension or site package under `Configuration/Form/`.
3. Keep actual form definitions as versioned `.form.yaml` files under `Resources/Private/Forms/`.
4. Prefer extension-path storage for versioned forms. Do not create database-backed form definitions unless the user explicitly overrides that policy.
5. On TYPO3 v14.2 and newer, use form-set auto-discovery via `Configuration/Form/<Set>/config.yaml`.
6. On TYPO3 v14.0 or v14.1, use the legacy frontend and backend YAML registration path from the reference.
7. Style forms with YAML properties first such as `containerClassAttribute`, `elementClassAttribute`, and `elementErrorClassAttribute`. Override Fluid templates only when markup or shared structure must change.
8. If YAML contains Tailwind utility classes, make sure the Tailwind entrypoint scans the relevant YAML files, then rebuild CSS and flush TYPO3 caches.
9. If the task changes visible frontend output, verify the mounted form URL with the available browser-testing workflow or document that no URL/test target was provided.

## General Rules

- Treat extension-path YAML storage as the default because the user explicitly wants versioned form files instead of database records.
- Prefer storing forms in the owning extension or site package, not in the database and not in ad-hoc file mounts, unless the user asks otherwise.
- If the site package owns the form, prefer `Configuration/Form/` for framework setup and `Resources/Private/Forms/` for form definitions inside that package.
- If the task adds utility classes or custom CSS, also follow the local asset-build workflow so the generated frontend CSS stays in sync.
- If the task changes form markup or styling, the implementation is not finished until the relevant browser verification passes or the missing URL is called out explicitly.

## References

Read [references/typo3-v14-form-patterns.md](references/typo3-v14-form-patterns.md) when you need:

- the TYPO3 v14.2+ auto-discovery path
- the TYPO3 v14.0 and v14.1 legacy registration fallback
- extension-path persistence snippets for versioned `.form.yaml` files
- example form YAML and frontend template override paths
- CSS utility class and `elementClassAttribute` styling patterns
- the inferred pattern for exposing CSS class fields inside the backend form editor
