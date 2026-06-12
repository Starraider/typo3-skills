# TYPO3 12 to 13 Plan And Report Template

## Migration Plan Output Structure

```markdown
# TYPO3 12 to 13 Migration Plan

## Executive Summary
- Current TYPO3/PHP/database versions:
- Target TYPO3/PHP/database versions:
- Upgrade readiness:
- Primary blockers:
- Recommended approach:

## Extension Compatibility Matrix
| Extension | Package | Current | Target | Status | Evidence | Action |
| --- | --- | --- | --- | --- | --- | --- |

## Composer Blockers
| Package | Constraint/blocker | Evidence | Resolution |
| --- | --- | --- | --- |

## Pre-Upgrade Checklist
- [ ] Backup database and files
- [ ] Create/confirm upgrade branch
- [ ] Update to latest TYPO3 12.4 patch
- [ ] Run pending v12 upgrade wizards
- [ ] Update reference index
- [ ] Resolve deprecations and extension scanner findings
- [ ] Resolve Composer blockers
- [ ] Run Rector dry-run
- [ ] Run Fractor dry-run
- [ ] Confirm test baseline

## Step-by-Step Execution
1. Create branch and collect baseline evidence
2. Update PHP/DDEV/database if required while staying on TYPO3 12
3. Update extensions compatible with v12 and v13
4. Apply Rector and Fractor pre-upgrade changes
5. Change TYPO3 Composer constraints to target v13.4
6. Run Composer update with all dependencies
7. Run TYPO3 upgrade wizards and database/schema updates
8. Apply post-upgrade Rector and Fractor changes
9. Fix extension and sitepackage issues
10. Run full verification
11. Decide whether v13 site sets/PAGEVIEW modernization is in scope
12. Prepare deployment and rollback notes

## Commands
Provide exact DDEV-first commands for this project.

## Risks And Rollback Points
| Risk | Impact | Detection | Mitigation | Rollback point |
| --- | --- | --- | --- | --- |

## Verification Matrix
| Area | Command/manual check | Expected result |
| --- | --- | --- |
```

## Completion Report Template

When done, report:

- TYPO3/PHP/database versions before and after
- Composer packages changed, including removed or replaced packages
- Extension compatibility outcomes
- Rector and Fractor changes applied
- Upgrade wizards run
- Database/schema/reference-index/language-pack actions
- Cache, `.htaccess`, and webserver rewrite checks
- Tests and manual checks performed
- Known residual risks, blockers, or follow-up tasks
- Deployment and rollback instructions

## Official TYPO3 Documentation Links

- TYPO3 13 changelog:
  `https://docs.typo3.org/c/typo3/cms-core/main/en-us/Changelog-13.html`
- TYPO3 13 changes by type:
  `https://docs.typo3.org/c/typo3/cms-core/main/en-us/Changelog-13-combined.html`
- TYPO3 13 system requirements:
  `https://docs.typo3.org/m/typo3/reference-coreapi/13.4/en-us/Administration/Installation/SystemRequirements/Index.html`
- get.typo3.org v13 requirements:
  `https://get.typo3.org/version/13.4.0`
- TYPO3 pre-upgrade tasks:
  `https://docs.typo3.org/m/typo3/reference-coreapi/13.4/en-us/Administration/Upgrade/Major/PreupgradeTasks/Index.html`
- TYPO3 Composer major upgrade workflow:
  `https://docs.typo3.org/m/typo3/reference-coreapi/13.4/en-us/Administration/Upgrade/Major/UpgradeCore.html`
- TYPO3 post-upgrade tasks:
  `https://docs.typo3.org/m/typo3/reference-coreapi/13.4/en-us/Administration/Upgrade/Major/PostupgradeTasks/Index.html`
- TYPO3 Admin Tools > Upgrade:
  `https://docs.typo3.org/m/typo3/reference-coreapi/13.4/en-us/Administration/Tools/Upgrade/Index.html`
- TYPO3 Rector and Fractor:
  `https://www.typo3-rector.com/`
