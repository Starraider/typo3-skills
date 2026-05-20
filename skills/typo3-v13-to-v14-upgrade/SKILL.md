---
name: typo3-v13-to-v14-upgrade
description: "Use when upgrading TYPO3 13 to TYPO3 14, checking extension compatibility, Composer blockers, Rector/Fractor migrations, deprecations, or planning a major-version migration. Covers analysis, planning, and execution of TYPO3 13 to 14 upgrades in Composer-based projects."
---

# TYPO3 v13 to v14 Upgrade

Use this skill to analyze, plan, and execute a TYPO3 13 to TYPO3 14 upgrade in Composer-based projects. Treat the upgrade as a staged engineering change: first remove uncertainty, then plan the migration, then execute in small reversible steps.

## Required Start

1. Read the repository's `AGENTS.md` and follow it. If it requires SequentialThinking, memory reads, DDEV, Playwright, Rector, or Fractor, apply those rules before touching files.
2. Create or confirm a dedicated branch before making upgrade edits. Do not run destructive Git commands.
3. Confirm the project is not production. TYPO3 major upgrades should run locally, in DDEV, or on a parallel copy with database and file backups.
4. Fetch current documentation before planning version-specific changes:
   - Resolve and query TYPO3 documentation via Context7 when available.
   - Prefer official TYPO3 docs for v14 upgrade notes, pre-upgrade tasks, system requirements, changelogs, and extension scanner guidance.
   - Verify Rector and Fractor commands against the project's installed packages and config.

## Operating Modes

- `analyze`: Inventory the project, installed extensions, constraints, deprecations, and blockers. Do not change code except for explicitly requested reports.
- `plan`: Produce a detailed migration plan with ordered phases, commands, risks, rollback points, and acceptance criteria.
- `execute`: Perform the upgrade incrementally. Keep changes focused, run dry-runs before applying automated refactors, and verify after every phase.

If the user does not specify a mode, start with `analyze`, then ask before executing Composer or code changes unless the user already requested implementation.

## Analysis Workflow

### 1. Project Baseline

Collect the current state using DDEV-first commands when the project uses DDEV:

```bash
ddev describe
ddev composer show typo3/cms-core
ddev composer show --direct
ddev composer show -t
ddev composer outdated --direct
ddev php -v
ddev typo3 --version
```

Also inspect these files when present:

- `composer.json`, `composer.lock`, `rector.php`, `fractor.php`, `.ddev/config.yaml`
- `config/system/settings.php`, `config/sites/*/config.yaml`
- `packages/*/ext_emconf.php`, `packages/*/composer.json`, `packages/*/Configuration/**`
- `packages/*/Resources/Private/**/*.html`, `*.typoscript`, `*.tsconfig`, `*.yaml`, `*.xml`, `*.xlf`
- `public/typo3conf/ext/*` only for non-Composer or legacy extension layouts

### 2. Extension Inventory

Build a table of installed extensions and classify each one:

| Extension | Package | Type | Current version | TYPO3 14 compatible? | Evidence | Action |
| --- | --- | --- | --- | --- | --- | --- |
| `customer_sitepackage` | `packages/customer_sitepackage` | custom | local | unknown | local analysis | migrate |

Use these checks:

```bash
ddev composer why-not typo3/cms-core ^14.3
ddev composer prohibits typo3/cms-core ^14.3
ddev composer why-not typo3/cms-backend ^14.3
```

For each direct extension, inspect Packagist/TER/vendor docs as needed. Do not assume compatibility from package names. For local extensions, inspect composer constraints, `ext_emconf.php`, service configuration, event listeners, TCA, TypoScript, Fluid, XLF, and custom PHP APIs.

Classify actions as:

- `ready`: supports target TYPO3 14 version with no known changes.
- `update`: compatible version exists; update before or during core upgrade.
- `migrate`: local extension or sitepackage requires code/config changes.
- `replace`: extension is unmaintained or blocks v14.
- `remove`: extension is unused or no longer needed.
- `blocked`: no compatible version or unresolved Composer conflict.

### 3. Deprecation And Breaking-Change Scan

Run non-destructive scans first:

```bash
ddev typo3 referenceindex:update
ddev typo3 cache:flush
ddev exec vendor/bin/rector process --dry-run
ddev php vendor/bin/fractor process --dry-run
```

If TYPO3's extension scanner is available, run it from the backend Upgrade module or via an installed CLI scanner. Capture findings and map each issue to a changelog entry when possible.

Review TYPO3 v14 changelogs for these categories:

- Breaking Changes
- Important
- Deprecation removals from v13
- System extension additions, removals, and behavior changes
- Upgrade Wizards, including scheduler/task migrations when `typo3/cms-scheduler` is installed

### 4. Code And Configuration Hotspots

Pay special attention to:

- `ext_localconf.php`, `ext_tables.php`, event listeners, middleware, DI services, hooks, signals, and PSR-14 events
- TCA definitions and FormEngine customizations
- TypoScript setup/constants, Page TSconfig, site sets, routing, and language config
- Fluid ViewHelpers, templates, layouts, partials, content blocks, and Form YAML
- Scheduler tasks, CLI commands, backend modules, workspaces, redirects, SEO, indexed search, and form integrations
- Third-party extensions with custom database schema or upgrade wizards
- Accessibility and bilingual/RTL behavior after template or frontend changes

## Pre-Upgrade Preparation

Produce and execute a checklist before changing Composer constraints:

1. Backups:
   - Export database.
   - Preserve uploaded files and generated assets if needed.
   - Save current `composer.json` and `composer.lock` state through Git.
2. Current v13 health:
   - Update to the latest TYPO3 13.4 patch release first.
   - Run all pending v13 upgrade wizards.
   - Update reference index.
   - Flush and warm caches.
   - Fix existing test failures before upgrading.
3. Dependency readiness:
   - Update direct extensions to the latest versions compatible with v13.
   - Resolve Composer blockers shown by `why-not` and `prohibits`.
   - Decide replace/remove strategy for incompatible extensions.
4. Automated refactors:
   - Run Rector dry-run and review output.
   - Run Fractor dry-run for Fluid, TypoScript, XML, and YAML changes.
   - Apply automated changes only after reviewing the dry-run scope.
5. Documentation:
   - Record known risks, blocked extensions, target TYPO3 version, target PHP version, and rollback plan.

## Migration Plan Output

When asked for a plan, use this structure:

```markdown
# TYPO3 13 to 14 Migration Plan

## Executive Summary
- Current TYPO3/PHP versions:
- Target TYPO3/PHP versions:
- Upgrade readiness:
- Primary blockers:
- Recommended approach:

## Extension Compatibility Matrix
| Extension | Current | Target | Status | Evidence | Required action |

## Pre-Upgrade Checklist
- [ ] Backup database and files
- [ ] Update to latest v13.4 patch
- [ ] Run v13 upgrade wizards
- [ ] Update reference index
- [ ] Resolve Composer blockers
- [ ] Run Rector dry-run
- [ ] Run Fractor dry-run
- [ ] Confirm test baseline

## Step-by-Step Execution
1. Create branch and baseline evidence
2. Update PHP/DDEV if required while staying on TYPO3 13
3. Update extensions compatible with v13 and v14
4. Apply Rector and Fractor pre-upgrade changes
5. Change TYPO3 Composer constraints to target v14
6. Run Composer update with all dependencies
7. Run TYPO3 upgrade wizards
8. Apply post-upgrade Rector and Fractor changes
9. Fix extension and sitepackage issues
10. Run full verification
11. Prepare deployment and rollback notes

## Commands
Provide exact DDEV-first commands for this project.

## Risks And Rollback Points
List risk, impact, detection method, mitigation, rollback point.

## Verification Matrix
| Area | Command/manual check | Expected result |
```

## Execution Protocol

### Phase 1: Baseline And Branch

```bash
git status --short
git switch -c codex/typo3-v14-upgrade
ddev start
ddev composer install
ddev npm install
```

Only create the branch if the user has not already chosen one. If the worktree is dirty, identify unrelated changes and do not overwrite them.

### Phase 2: Current v13 Stabilization

```bash
ddev composer update "typo3/*" --with-all-dependencies
ddev typo3 upgrade:run
# If the project uses a different command name, inspect `ddev typo3 list upgrade` first.
ddev typo3 referenceindex:update
ddev typo3 cache:flush
ddev typo3 cache:warmup
ddev exec vendor/bin/phpunit
ddev playwright test
```

Adapt command names to the installed TYPO3 console version. If an upgrade command is unavailable, use the backend Upgrade module and document manual steps.

### Phase 3: Rector And Fractor Before Composer Upgrade

Run dry-runs, inspect the diff, then apply only relevant changes:

```bash
ddev exec vendor/bin/rector process --dry-run
ddev exec vendor/bin/rector process
ddev php vendor/bin/fractor process --dry-run
ddev php vendor/bin/fractor process
```

After changing Fluid, TypoScript, YAML, XML, XLF, or `.htaccess`, run Fractor dry-run again to confirm no remaining automated findings.

### Phase 4: Composer Upgrade To TYPO3 14

Generate the exact Composer command from installed TYPO3 core packages. Prefer upgrading all installed TYPO3 core packages together:

```bash
ddev composer require --update-with-all-dependencies \
  "typo3/cms-core:^14.3" \
  "typo3/cms-backend:^14.3" \
  "typo3/cms-frontend:^14.3"
```

Do not blindly use this sample. Include every installed `typo3/cms-*` package from the project and remove packages that no longer exist in v14. Use `composer why-not` to resolve conflicts before forcing changes.

### Phase 5: Post-Upgrade Wizards And Refactors

```bash
ddev composer dump-autoload
ddev typo3 cache:flush
ddev typo3 upgrade:list
ddev typo3 upgrade:run
ddev typo3 database:updateschema
ddev typo3 referenceindex:update
ddev exec vendor/bin/rector process --dry-run
ddev php vendor/bin/fractor process --dry-run
```

Run relevant upgrade wizards. For TYPO3 14, check official docs for current required wizards; scheduler task migration is one known area when `typo3/cms-scheduler` is installed.

### Phase 6: Verification

Use the repository's completion gates. Typical checks:

```bash
ddev composer ci:composer:normalize
ddev exec vendor/bin/phpunit
ddev npm run build
ddev playwright test
ddev typo3 cache:flush
ddev typo3 cache:warmup
```

Manually verify:

- TYPO3 backend login and key modules
- Frontend pages in all configured languages
- Language switcher, hreflang, routes, and redirects
- Forms, scheduler tasks, CLI commands, and custom content blocks
- Accessibility: keyboard navigation, focus, labels, contrast, screen reader smoke checks
- RTL rendering for Urdu or other RTL site languages
- Error logs, deprecation logs, and browser console

## Using Rector

Before using Rector, inspect `rector.php` and installed packages. Upgrade or add TYPO3 Rector sets only when compatible with the target. Use dry-run output to separate safe mechanical changes from changes needing human review.

Good practice:

- Commit or checkpoint before applying Rector.
- Run Rector on focused paths if the full run is too noisy.
- Review changes to public APIs, dependency injection, event listeners, and TCA carefully.
- Run PHPUnit and selected Playwright tests after applying Rector.

## Using Fractor

Fractor is required after changes to Fluid, TypoScript, XML, YAML, XLF, and `.htaccess` when available in the project. Use it for automated modernization and formatting where rules exist.

Good practice:

- Run Fractor dry-run before and after major upgrade edits.
- Review template changes for accessibility and translation behavior.
- Verify TypoScript and site set changes in both frontend and backend.
- Keep Fractor changes separate from hand-written functional changes when possible.

## Completion Report

When done, report:

- TYPO3/PHP versions before and after
- Composer packages changed
- Extension compatibility outcomes
- Rector and Fractor changes applied
- Upgrade wizards run
- Database/schema/reference-index actions
- Tests and manual checks performed
- Known residual risks or follow-up tasks
- Deployment and rollback instructions

If the upgrade is not fully completed, clearly separate completed work, blockers, and next executable steps.

## Official Documentation To Check

Use current official documentation during each real upgrade because TYPO3 14 guidance and extension compatibility can change:

- TYPO3 14 major upgrade notes: `https://docs.typo3.org/m/typo3/reference-coreapi/main/en-us/Administration/Upgrade/Major/Version14.html`
- TYPO3 pre-upgrade tasks: `https://docs.typo3.org/m/typo3/reference-coreapi/14.3/en-us/Administration/Upgrade/Major/PreupgradeTasks/Index.html`
- TYPO3 Composer major upgrade workflow: `https://docs.typo3.org/m/typo3/reference-coreapi/main/en-us/Administration/Upgrade/Major/UpgradeCore.html`
- TYPO3 Composer migration and version constraints: `https://docs.typo3.org/m/typo3/reference-coreapi/14.3/en-us/Administration/Upgrade/MigrateToComposer/MigrationSteps.html`

## Load References As Needed

- Rector and Fractor command reference: [references/command-reference.md](references/command-reference.md)
- Upgrade plan template and documentation links: [references/plan-template.md](references/plan-template.md)
