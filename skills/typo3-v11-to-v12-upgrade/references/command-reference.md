# TYPO3 v11 to v12 Command Reference

Prefer DDEV commands when the project has `.ddev/`. Adapt every command
to the installed console package and project scripts.

## Baseline

```bash
git status --short
ddev start
ddev describe
ddev composer install
ddev composer show typo3/cms-core
ddev composer show --direct
ddev composer show -t
ddev php -v
ddev typo3 --version
```

## Composer Blockers

```bash
ddev composer outdated --direct
ddev composer why-not typo3/cms-core ^12.4
ddev composer prohibits typo3/cms-core ^12.4
ddev composer why-not typo3/cms-backend ^12.4
```

Use the output to decide whether to update, replace, remove, or pin
blocking extensions. Add compatible extension constraints to the same
Composer transaction rather than forcing TYPO3 alone.

## Current TYPO3 11 Stabilization

```bash
ddev composer update "typo3/*" --with-all-dependencies
ddev typo3 upgrade:list
ddev typo3 upgrade:run
ddev typo3 referenceindex:update
ddev typo3 cache:flush
ddev typo3 cache:warmup
```

If `upgrade:list` or `upgrade:run` is unavailable, inspect:

```bash
ddev typo3 list upgrade
ddev typo3 list
```

Then run the equivalent backend Upgrade module actions manually and
document them.

## Platform Preparation

TYPO3 v12 requires PHP 8.1 or newer. Upgrade PHP/database while still on
TYPO3 11 whenever possible.

```bash
ddev config --php-version 8.1
ddev restart
ddev php -v
ddev composer check-platform-reqs
```

For projects using MariaDB/MySQL images, verify the database target
against current TYPO3 requirements and the host's deployment platform.

## Rector And Fractor

```bash
ddev composer show | rg "rector|fractor"
ddev exec vendor/bin/rector process --dry-run
ddev php vendor/bin/fractor process --dry-run
```

Apply only after reviewing the dry-run:

```bash
ddev exec vendor/bin/rector process
ddev php vendor/bin/fractor process
```

Focused runs can reduce noise:

```bash
ddev exec vendor/bin/rector process packages/my_extension --dry-run
ddev php vendor/bin/fractor process packages/my_extension --dry-run
```

## Composer Upgrade To TYPO3 12

Remove `typo3/cms-recordlist` before upgrading when it is required by
the root project because it was merged into `typo3/cms-backend`:

```bash
ddev composer remove "typo3/cms-recordlist"
```

Generate the final Composer command from the installed `typo3/cms-*`
packages and the Composer helper. Example only:

```bash
ddev composer require --update-with-all-dependencies \
  "typo3/cms-adminpanel:^12.4" \
  "typo3/cms-backend:^12.4" \
  "typo3/cms-belog:^12.4" \
  "typo3/cms-beuser:^12.4" \
  "typo3/cms-core:^12.4" \
  "typo3/cms-dashboard:^12.4" \
  "typo3/cms-felogin:^12.4" \
  "typo3/cms-filelist:^12.4" \
  "typo3/cms-filemetadata:^12.4" \
  "typo3/cms-fluid:^12.4" \
  "typo3/cms-form:^12.4" \
  "typo3/cms-frontend:^12.4" \
  "typo3/cms-info:^12.4" \
  "typo3/cms-install:^12.4" \
  "typo3/cms-linkvalidator:^12.4" \
  "typo3/cms-lowlevel:^12.4" \
  "typo3/cms-recycler:^12.4" \
  "typo3/cms-rte-ckeditor:^12.4" \
  "typo3/cms-setup:^12.4" \
  "typo3/cms-t3editor:^12.4" \
  "typo3/cms-tstemplate:^12.4" \
  "typo3/cms-viewpage:^12.4"
```

Do not blindly use the example. Include only installed TYPO3 packages,
remove packages that no longer exist, and add compatible constraints for
third-party packages that Composer identifies as blockers.

## Post-Upgrade Tasks

```bash
ddev composer dump-autoload
ddev typo3 cache:flush
ddev typo3 database:updateschema
ddev typo3 upgrade:list
ddev typo3 upgrade:run
ddev typo3 referenceindex:update
ddev typo3 language:update
ddev typo3 cache:flush
ddev typo3 cache:warmup
```

If `database:updateschema` is unavailable, use the backend Database
Analyzer. Create missing tables/columns before running upgrade wizards;
remove obsolete columns/tables after the relevant wizards have run.

## Verification

Use repository-specific gates first. Typical checks:

```bash
ddev composer ci
ddev composer ci:static
ddev exec vendor/bin/phpunit
ddev npm test
ddev npm run build
ddev typo3 cache:flush
ddev typo3 cache:warmup
```

Manual checks:

- TYPO3 backend login, dashboard, page tree, list module, filelist,
  admin tools, forms, redirects, scheduler, and custom modules.
- Frontend pages, plugins, menus, routing, language switcher,
  canonical/hreflang tags, forms, media, and RTE output.
- Browser console, PHP logs, deprecation logs, and TYPO3 reports.
- Accessibility regressions after Fluid/RTE/template changes.
- `.htaccess` or NGINX rules against TYPO3 12 defaults.
