# TYPO3 Site Package Merge Guidelines

This guide details the step-by-step workflow, structured merge rules, and final reporting formats for merging TYPO3 site packages.

## Merge Workflow

1. Establish the merge contract:
   - Priority package: conflict winner for files and settings.
   - Secondary package: contributes non-conflicting content.
   - Target package path, extension key, Composer package name, PHP namespace, and output strategy.
   - Target TYPO3 version or version range.

2. Determine the target TYPO3 version for this merge:
   - Prefer an explicit user requirement.
   - Otherwise inspect the project root `composer.json`, `composer.lock`, installed `typo3/cms-core`, and both package `composer.json` files.
   - If signals conflict or no reliable target exists, ask before editing.
   - Record whether the result targets TYPO3 13.1+, 12.4, 11.5, or a mixed support range.

3. Inventory both packages before changing files:
   - Use fast targeted reads such as `rg --files`, `find`, `jq`, and `sed`.
   - Inspect Composer metadata, `ext_localconf.php`, `ext_tables.php`, `Configuration/`, `Resources/Private/`, `Resources/Public/`, build files, Fluid templates, TypoScript, TSconfig, TCA overrides, route enhancers, content blocks, and custom classes.
   - Check `git status` and avoid touching unrelated user changes.

4. Merge with precedence:
   - For exact file path conflicts, use the priority package version unless a structured merge is required for TYPO3 correctness.
   - For non-conflicting files, copy or move them into the target package.
   - For structured config files, merge entries conservatively, using the priority package when the same key or declaration conflicts.
   - Rename extension-key references, namespaces, TypoScript constants, asset paths, and Fluid paths to the target package consistently.
   - Do not silently drop secondary-package behavior. Summarize discarded or overridden items in the final response.

5. Normalize to TYPO3 sitepackage standards:
   - Keep `composer.json` as `type: typo3-cms-extension`.
   - Set `extra.typo3/cms.extension-key` to the target extension key.
   - Keep PSR-4 autoloading aligned with `Classes/`.
   - For TYPO3 13.1+, provide `Configuration/Sets/<SetName>/config.yaml`.
   - For TYPO3 13.1+, provide TypoScript through the site set.
   - Keep templates, layouts, partials, and public assets under `Resources/Private/` and `Resources/Public/` unless the project has a deliberate build pipeline.

6. Implement backward compatibility as needed:
   - If target support includes TYPO3 11.5 or 12.4, keep legacy TypoScript static include files and registration where required.
   - If target support spans 12.4 and 13.4, support both site sets and legacy TypoScript includes instead of relying on only one mechanism.
   - Avoid APIs, Fluid syntax, service tags, or TypoScript objects unavailable in the oldest supported target version.
   - Use conditional PHP guards such as `class_exists()` only when a feature is optional across supported versions.

7. Validate:
   - Run project-appropriate checks, for example `composer validate`, `ddev composer install`, `ddev composer ci:static`, asset build commands, `ddev typo3cms database:updateschema`, and `ddev typo3cms cache:flush`.
   - For frontend changes, verify rendered pages in a browser when a local site is available.
   - If a command cannot run, state why and provide the residual risk.

---

## Structured Merge Rules

Treat these files as structured data rather than plain overwrite targets unless the user explicitly wants a hard overwrite:

- `composer.json`: merge `require`, `suggest`, `autoload`, `extra`, and scripts; priority wins incompatible constraints.
- `Configuration/Sets/**/config.yaml`: merge dependencies and settings; priority wins duplicate keys.
- TypoScript and TSconfig: preserve import order from the priority package, then append non-conflicting secondary imports.
- `Configuration/Services.yaml`: merge service defaults and definitions; priority wins duplicate service ids.
- TCA overrides: combine non-conflicting table and column changes; priority wins duplicate field definitions.
- Fluid templates, layouts, and partials: preserve priority templates for same paths; copy secondary variants under clear names only when still referenced.
- Assets and build manifests: merge source assets, then rebuild generated assets instead of hand-editing generated output where possible.

---

## Final Response

Report:

- Priority package and target package.
- Target TYPO3 version or range.
- Main files/settings merged.
- Overrides from the priority package.
- Backward compatibility measures added.
- Validation commands run and their outcome.
