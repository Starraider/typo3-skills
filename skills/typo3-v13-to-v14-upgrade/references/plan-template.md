# Upgrade Plan Template and Documentation

## Migration Plan Output Structure

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

## Official TYPO3 Documentation Links

- TYPO3 14 major upgrade notes: https://docs.typo3.org/m/typo3/reference-coreapi/main/en-us/Administration/Upgrade/Major/Version14.html
- TYPO3 pre-upgrade tasks: https://docs.typo3.org/m/typo3/reference-coreapi/14.3/en-us/Administration/Upgrade/Major/PreupgradeTasks/Index.html
- TYPO3 Composer major upgrade workflow: https://docs.typo3.org/m/typo3/reference-coreapi/main/en-us/Administration/Upgrade/Major/UpgradeCore.html
- TYPO3 Composer migration and version constraints: https://docs.typo3.org/m/typo3/reference-coreapi/14.3/en-us/Administration/Upgrade/MigrateToComposer/MigrationSteps.html

## Completion Report Template

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
