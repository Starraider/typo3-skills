# TYPO3 12 to 13 Command Reference

Use DDEV-first commands when the project uses DDEV. Adapt binary names
to the installed TYPO3 console package.

## Baseline

```bash
git status --short
git switch -c codex/typo3-v13-upgrade
ddev start
ddev composer install
ddev describe
ddev php -v
ddev typo3 --version
ddev composer show typo3/cms-core
ddev composer show --direct
ddev composer show -t
ddev composer outdated --direct
```

Only create the branch if the user has not already chosen one. If the
worktree is dirty, identify unrelated changes and do not overwrite them.

## Extension Compatibility Checks

```bash
ddev composer why-not typo3/cms-core ^13.4
ddev composer prohibits typo3/cms-core ^13.4
ddev composer why-not typo3/cms-backend ^13.4
```

For every direct extension, check Composer constraints and vendor
release notes. Common blockers include extension versions pinned to
`^12.4` only, old `helhum/typo3-console` versions, and Rector/Fractor
packages that cannot coexist with the target PHP or TYPO3 version.

## Current TYPO3 12 Stabilization

```bash
ddev composer update "typo3/*" --with-all-dependencies
ddev typo3 upgrade:list
ddev typo3 upgrade:run
ddev typo3 referenceindex:update
ddev typo3 cache:flush
ddev typo3 cache:warmup
```

If a command is unavailable, inspect `ddev typo3 list upgrade` or use
the backend Admin Tools > Upgrade module and document the manual step.

## Rector Commands

```bash
ddev composer show | grep rector
cat rector.php
ddev exec vendor/bin/rector process --dry-run
ddev exec vendor/bin/rector process
ddev exec vendor/bin/rector process packages/customer_sitepackage
```

Run dry-runs before applying. Prefer focused paths when the full run is
too noisy.

## Fractor Commands

```bash
ddev composer show | grep fractor
cat fractor.php
ddev php vendor/bin/fractor process --dry-run
ddev php vendor/bin/fractor process
```

Use Fractor for Fluid, TypoScript, XML, YAML, XLF, `.htaccess`, and
Composer-related migrations where rules exist.

## Composer Upgrade To TYPO3 13

Generate the exact Composer command from installed TYPO3 core packages.
Prefer upgrading all installed `typo3/cms-*` packages together:

```bash
ddev composer require --update-with-all-dependencies \
  "typo3/cms-core:^13.4" \
  "typo3/cms-backend:^13.4" \
  "typo3/cms-frontend:^13.4"
```

Do not blindly use this sample. Include every installed TYPO3 system
extension from the project and add compatible third-party constraints
that Composer reports as blockers.

## Post-Upgrade

```bash
ddev composer dump-autoload
ddev typo3 cache:flush
ddev typo3 upgrade:list
ddev typo3 upgrade:run
ddev typo3 database:updateschema
ddev typo3 referenceindex:update
ddev typo3 language:update
ddev typo3 cache:flush
ddev typo3 cache:warmup
```

Verify Apache/IIS rewrite updates from the install tool when the
backend still uses `/typo3/index.php`. For NGINX/Caddy or custom
deployments, inspect webserver rules manually.

## Verification

Use the repository gates first. Typical commands:

```bash
ddev composer ci
ddev composer ci:static
ddev exec vendor/bin/phpunit
yarn --cwd Build install
yarn --cwd Build encore production
ddev typo3 cache:flush
ddev typo3 cache:warmup
```

Manual checks:

- TYPO3 backend login, Admin Tools, page module, filelist, forms, and
  scheduler/CLI commands.
- Frontend pages in all configured languages, routing, redirects,
  hreflang, language switcher, forms, search, and media handling.
- Browser console, PHP logs, TYPO3 deprecation logs, and failed assets.
- Accessibility basics: heading order, keyboard navigation, focus
  visibility, labels, alt text, contrast, and no color-only states.
