# TYPO3 v12 to v13 Upgrade Skill DOX

## Purpose

This package provides a reusable, safety-first workflow for TYPO3 CMS 12 LTS to 13.4 LTS migrations.

## Ownership

`SKILL.md` owns triggers, safety boundaries, and the staged migration workflow. `references/` owns command detail, change hotspots, and report templates. `evals/evals.json` owns regression prompts. `agents/openai.yaml` owns the optional agent display metadata.

## Local Contracts

- Keep guidance portable: do not include a project name, actual site package, vendor namespace, environment URL, exact local path, or one project’s dependency set.
- Preserve the distinction between the core migration and optional modernization work such as site sets or PAGEVIEW.
- Treat production actions and data-changing schema/wizard operations as explicit approval boundaries.
- Keep every local reference linked directly from `SKILL.md`.

## Work Guidance

When version-specific facts or commands change, update the relevant reference and its source link rather than adding unbounded detail to `SKILL.md`. Keep evaluations focused on trigger quality, preservation evidence, and consequential-action boundaries.

## Verification

Run the portable-skill structural validator for the supported clients and check that the listed references and evaluation JSON parse correctly.

## Child DOX Index

No child DOX files.
