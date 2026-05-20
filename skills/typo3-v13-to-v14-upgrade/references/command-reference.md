# Rector and Fractor Reference

## Rector Commands

```bash
# Dry-run (preview changes without applying)
ddev exec vendor/bin/rector process --dry-run

# Apply changes
ddev exec vendor/bin/rector process

# Run on specific paths
ddev exec vendor/bin/rector process packages/my_extension
```

## Fractor Commands

```bash
# Dry-run (preview changes)
ddev php vendor/bin/fractor process --dry-run

# Apply changes
ddev php vendor/bin/fractor process
```

## Key Inspection Commands

```bash
# Show installed Rector packages
ddev composer show | grep rector

# Check rector.php configuration
cat rector.php

# Show installed Fractor packages
ddev composer show | grep fractor

# Check fractor.php configuration
cat fractor.php
```

## TYPO3 v14 Upgrade Command Reference

### Phase 1: Baseline
```bash
git status --short
git switch -c codex/typo3-v14-upgrade
ddev start
ddev composer install
ddev npm install
```

### Phase 2: Current v13 Stabilization
```bash
ddev composer update "typo3/*" --with-all-dependencies
ddev typo3 upgrade:run
ddev typo3 referenceindex:update
ddev typo3 cache:flush
ddev typo3 cache:warmup
ddev exec vendor/bin/phpunit
```

### Phase 3: Composer Upgrade To TYPO3 14
```bash
ddev composer require --update-with-all-dependencies \
  "typo3/cms-core:^14.3" \
  "typo3/cms-backend:^14.3" \
  "typo3/cms-frontend:^14.3"
```

### Phase 5: Post-Upgrade Wizards
```bash
ddev composer dump-autoload
ddev typo3 cache:flush
ddev typo3 upgrade:list
ddev typo3 upgrade:run
ddev typo3 database:updateschema
ddev typo3 referenceindex:update
```

### Phase 6: Verification
```bash
ddev composer ci:composer:normalize
ddev exec vendor/bin/phpunit
ddev npm run build
ddev playwright test
ddev typo3 cache:flush
ddev typo3 cache:warmup
```

## Extension Compatibility Checks

```bash
ddev composer why-not typo3/cms-core ^14.3
ddev composer prohibits typo3/cms-core ^14.3
ddev composer why-not typo3/cms-backend ^14.3
```
