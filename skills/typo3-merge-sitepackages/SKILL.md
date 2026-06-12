---
name: typo3-merge-sitepackages
description: "Use when merging two TYPO3 site packages, side-packages, or theme extensions into one TYPO3-compliant site package, consolidating files, TypoScript, site sets, Fluid templates, TCA overrides, Composer metadata, assets, or version compatibility."
---

# Merge TYPO3 Site Packages

## Overview

Merge two TYPO3 site packages into one target extension while preserving intentional customizations, applying an explicit conflict winner, and keeping the result compatible with the target TYPO3 version.

## Required Start

1. **Choose Priority Package**: Prompt the user to choose the priority package unless they already specified it. Use a direct question:
   ```text
   Which site package has priority and should overwrite conflicting settings and files from the other package?
   ```
   Do not start the merge until the priority package is known.
2. **Determine Target Version**: Establish target TYPO3 version (e.g. 11.5, 12.4, 13.4, or 14.x) by checking root `composer.json` or asking the user.

## Related Skills

- `typo3-site-config-sets`: use when configuring site sets in TYPO3 v13+
- `typo3-fluid-patterns`: use when resolving differences or overriding Fluid layouts, partials, or templates

## Reference Materials

Use the following detailed resources located in this skill:
- **Merge Guidelines**: [references/merge-guidelines.md](references/merge-guidelines.md) (Detailed workflow, structured file-by-file merge rules, validation commands, and reporting format)
- **TYPO3 Site Package Standards**: [references/typo3-sitepackage-standards.md](references/typo3-sitepackage-standards.md) (Standard file layout, Composer configuration, and TYPO3 version compatibility specifications)
