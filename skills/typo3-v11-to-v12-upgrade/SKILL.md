---
name: typo3-v11-to-v12-upgrade
description: "Use when upgrading TYPO3 11 to TYPO3 12, checking extension compatibility, Composer blockers, Rector/Fractor migrations, deprecations, platform requirements, or planning a major-version migration. Covers analysis, planning, and execution of TYPO3 11 to 12 upgrades in Composer-based projects."
---

# TYPO3 v11 to v12 Upgrade

Use this skill to analyze, plan, and execute a TYPO3 11.5 to TYPO3 12.4 LTS upgrade in Composer-based projects. Treat the upgrade as a staged change: stabilize TYPO3 11 first, remove blockers, then upgrade Composer constraints and migrate code/configuration in small steps.

## Required Start

1. **Check Repositories**: Read the repository's `AGENTS.md` and follow it. If it requires SequentialThinking, DDEV, Context7, Rector, Fractor, or browser checks, apply those rules before editing.
2. **Fetch Docs**: Fetch current documentation before making version-specific claims. Resolve/query TYPO3 docs via Context7, and prefer official TYPO3 docs, get.typo3.org, TYPO3 Core changelogs, and package vendor docs.
3. **Environment check**: Confirm the project is not production. Major upgrades should run locally, in DDEV, or on a parallel copy with database and file backups.
4. **Git Branch**: Create or confirm a dedicated branch before making upgrade edits. Do not run destructive Git commands.
5. **Support status**: TYPO3 v12 reached regular end of life on 2026-04-30. If upgrading after that date, call out whether v12 is an interim step toward v13/v14 or requires ELTS.

## Operating Modes

If not specified, start with `analyze`, then ask before executing.
- `analyze`: Inventory versions, extensions, Composer blockers, deprecations, and risks. Do not change code.
- `plan`: Produce a detailed migration plan with phases, commands, risks, rollback points, and acceptance criteria using the plan template.
- `execute`: Perform the upgrade incrementally. Run dry-runs first, inspect diffs, and verify after every phase.

## Reference Materials

Use the following detailed resources located in this skill:
- **Command Reference**: [references/command-reference.md](references/command-reference.md) (All execution commands, scans, and verification tasks)
- **Change Hotspots**: [references/v12-change-hotspots.md](references/v12-change-hotspots.md) (Platform requirements, Doctrine DBAL 3, CKEditor 5, TypoScript parser, TCA, FlexForms, and Hooks/Events)
- **Plan Template**: [references/plan-template.md](references/plan-template.md) (Checklists, planning output formats, and completion reports)
