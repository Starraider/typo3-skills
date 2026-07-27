# Skills DOX

## Purpose

`skills/` contains independent, reusable Agent Skill packages for TYPO3 and related integrations.

## Ownership

Each direct child package owns its `SKILL.md`, agent interface, optional references, assets, scripts, README, and evaluations. The repository README owns the public catalogue.

## Local Contracts

- Keep every package project-agnostic: use placeholders rather than a real site, vendor, extension key, or deployment environment.
- Keep `SKILL.md` focused on triggers, safety boundaries, and workflow. Put detailed examples and lookup material in `references/`.
- When a package has checks or evaluations, keep them aligned with its `SKILL.md` and discoverable from it.
- Update the root README when adding, removing, or materially repurposing a skill.

## Work Guidance

Read a child `AGENTS.md` when present before changing that package. Otherwise, follow this contract and the package’s `SKILL.md`.

## Verification

Run the available package-level validation and verify all referenced local files are present. For portable skill changes, use the `new-skill` validator when it is available.

## Child Index

- `typo3-v12-to-v13-upgrade/AGENTS.md` — version-12-to-version-13 migration skill, evidence requirements, and package structure.
- All other direct child packages currently use this shared contract and have no additional local DOX file.
