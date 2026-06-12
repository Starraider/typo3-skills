# TYPO3 11 to 12 Plan Template

Use this shape for planning reports. Keep it project-specific and fill
all fields with evidence, not assumptions.

```markdown
# TYPO3 11 to 12 Migration Plan

## Executive Summary
- Current TYPO3/PHP/database versions:
- Target TYPO3/PHP/database versions:
- Support-status note:
- Upgrade readiness:
- Primary blockers:
- Recommended approach:

## Extension Compatibility Matrix
| Extension | Package | Current | Target | Status | Evidence | Action |
| --- | --- | --- | --- | --- | --- | --- |

## Composer Blockers
| Blocker | Evidence | Resolution | Risk |
| --- | --- | --- | --- |

## Platform Checklist
- [ ] PHP can run TYPO3 11 and TYPO3 12
- [ ] Database version supports TYPO3 12
- [ ] Composer is 2.1 or newer
- [ ] Required PHP extensions are installed
- [ ] DDEV/deployment platform matches target requirements

## Pre-Upgrade Checklist
- [ ] Backup database and files
- [ ] Create or confirm upgrade branch
- [ ] Update to latest TYPO3 11.5 patch
- [ ] Run all TYPO3 11 upgrade wizards
- [ ] Update reference index
- [ ] Enable/review deprecation logging
- [ ] Run extension scanner
- [ ] Resolve Composer blockers
- [ ] Update compatible third-party extensions
- [ ] Run Rector dry-run
- [ ] Run Fractor dry-run
- [ ] Confirm test baseline

## Step-by-Step Execution
1. Create branch and collect baseline evidence
2. Upgrade PHP/database while staying on TYPO3 11
3. Update TYPO3 11 and current extensions
4. Run and review deprecation, Rector, and Fractor dry-runs
5. Remove or replace incompatible packages
6. Remove `typo3/cms-recordlist` if present
7. Change installed TYPO3 package constraints to `^12.4`
8. Run Composer update with all dependencies
9. Flush caches and run database analyzer/schema updates
10. Run TYPO3 upgrade wizards and update reference index
11. Update language packs and verify webserver config
12. Apply post-upgrade Rector/Fractor and manual fixes
13. Run automated and manual verification
14. Prepare deployment, rollback, and residual-risk notes

## Commands
Provide exact DDEV-first commands for this project.

## Code And Configuration Hotspots
| Area | Files | Risk | Migration approach |
| --- | --- | --- | --- |

## Risks And Rollback Points
| Phase | Risk | Detection | Mitigation | Rollback point |
| --- | --- | --- | --- | --- |

## Verification Matrix
| Area | Command/manual check | Expected result | Status |
| --- | --- | --- | --- |

## Completion Report Template
- TYPO3/PHP/database versions before and after:
- Composer packages changed:
- Extensions updated/replaced/removed:
- Rector changes:
- Fractor changes:
- Upgrade wizards run:
- Database/schema/reference-index actions:
- Cache/language/webserver actions:
- Automated tests:
- Manual checks:
- Known residual risks:
- Deployment notes:
- Rollback notes:
```

## Documentation Links

- TYPO3 12 changelog:
  `https://docs.typo3.org/c/typo3/cms-core/main/en-us/Changelog-12.html`
- TYPO3 v12 system requirements:
  `https://docs.typo3.org/c/typo3/cms-core/main/en-us/Changelog/12.0/Breaking-96553-TYPO3V12SystemRequirements.html`
- TYPO3 pre-upgrade tasks:
  `https://docs.typo3.org/m/typo3/reference-coreapi/12.4/en-us/Administration/Upgrade/Major/PreupgradeTasks/Index.html`
- TYPO3 Composer upgrade workflow:
  `https://docs.typo3.org/m/typo3/reference-coreapi/12.4/en-us/Administration/Upgrade/Major/UpgradeCore.html`
- TYPO3 post-upgrade tasks:
  `https://docs.typo3.org/m/typo3/reference-coreapi/12.4/en-us/Administration/Upgrade/Major/PostupgradeTasks/Index.html`
- TYPO3 Rector and Fractor:
  `https://www.typo3-rector.com/`
