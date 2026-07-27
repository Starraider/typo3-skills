# TYPO3 12 LTS → 13.4 LTS Upgrade

A portable, safety-first workflow for moving a TYPO3 project from version 12 LTS to version 13.4 LTS. It covers dependency resolution, copied-database upgrades, Content Blocks 0.x compatibility, TSConfig changes, and evidence-based verification.

## What this skill solves

It turns a risky major-version change into a staged, reviewable migration with explicit dependency, data-preservation, and acceptance evidence.

## Use when

- Planning or implementing a TYPO3 12 to 13.4 migration.
- Reviewing a proposed v13 dependency, database, or Content Blocks migration.
- Building a migration evidence report before a separately approved deployment.

It is not for TYPO3 patch updates, deployments, or unrelated extension migrations.

## Expected outputs

- A reviewed dependency and source migration.
- A documented, approval-gated database upgrade on a copied environment.
- Preservation comparisons and a pass/fail/blocked manual verification matrix.

## Context requirements

- Composer manifests and lock file.
- Project runtime/build/test commands and database CLI.
- A non-production database and file-storage backup location.
- Approval for any data-changing wizard, conversion, rename, cleanup, or deployment.

## Installation

This directory is installed at `.agents/skills/typo3-v12-to-v13-upgrade`, which is discovered by Codex, Cursor, Antigravity IDE, and OpenCode. For other clients, copy or symlink it to the corresponding skill directory:

- Claude Code: `.claude/skills/typo3-v12-to-v13-upgrade/`
- Cursor: `.cursor/skills/typo3-v12-to-v13-upgrade/`
- Qoder: `.qoder/skills/typo3-v12-to-v13-upgrade/`

The skill uses only portable Agent Skills frontmatter.

## Example prompts

- “Plan and execute the upgrade of this TYPO3 12.4 site to TYPO3 13.4 on our local DDEV copy.”
- “Review this TYPO3 12→13 Composer update and identify unsafe schema or extension decisions.”
- “Migrate our Content Blocks 0.7 definitions as part of a TYPO3 13 upgrade, preserving CTypes and FAL data.”

## Validation

Run the structural validator from the `new-skill` toolkit:

```bash
path/to/new-skill/scripts/validate-skill.sh \
  .agents/skills/typo3-v12-to-v13-upgrade \
  --clients claude,codex,cursor,antigravity,opencode,qoder
```

Review [evals/evals.json](evals/evals.json) with realistic migration, Content Blocks, and safety-boundary prompts.

## Related skills

`typo3-gridelements-to-container` complements this skill when a project also needs to replace EXT:gridelements. Run that work as a separately reviewed migration after the v13 baseline is stable.

## License

CC-BY-SA-4.0.
