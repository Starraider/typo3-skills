---
name: typo3-playwright-ddev
description: Set up and maintain Playwright infrastructure for TYPO3 projects running in DDEV. Use when initializing Playwright, installing browsers and add-ons, creating config and scripts, generating initial baselines, or fixing broken Playwright environment issues. For day-to-day frontend verification and VRT execution, use `typo3-playwright-workflow`.
---

# Playwright Setup For TYPO3 In DDEV

## Overview

Use this skill when the Playwright environment itself needs to be created, repaired, or upgraded.

This skill is about **infrastructure and setup**:

- installing Playwright dependencies
- installing browsers inside DDEV
- adding or fixing Playwright config
- wiring package scripts
- creating initial test structure
- generating first baselines
- debugging broken DDEV/Playwright environment issues

For normal frontend verification work after setup is complete, use `typo3-playwright-workflow`.

> **Critical lesson learned:** Set up the test environment in the first sprint or epic, not at the end. Delaying Playwright setup creates avoidable friction under deadline pressure.

## Setup Workflow

### 1. Initialize Node.js In The Site Package

If the TYPO3 package has no `package.json` yet:

```bash
ddev npm init -y
```

### 2. Install Dependencies

```bash
ddev npm install --save-dev @playwright/test playwright @axe-core/playwright
```

### 3. Install The DDEV Playwright Add-on

**CRITICAL:** Browsers must be installed inside DDEV, not on the host machine.

Use the DDEV add-on:

```bash
ddev get Lullabot/ddev-playwright
ddev restart
```

This keeps browser binaries persistent across restarts and avoids host/container mismatches.

### 4. Create Or Fix Playwright Config

Create or update `playwright.config.ts` in the TYPO3 package root.

Key settings:

- `baseURL` points to the DDEV site URL
- `ignoreHTTPSErrors: true`
- suitable timeouts for DDEV container performance

Example:

```ts
baseURL: 'https://<project-name>.ddev.site'
```

### 5. Add Package Scripts

Recommended scripts:

```json
{
  "scripts": {
    "test": "playwright test",
    "test:visual": "playwright test",
    "test:visual:update": "playwright test --update-snapshots"
  }
}
```

### 6. Create Initial Test Structure

Recommended structure:

```text
Tests/
├── e2e/
├── Visual/
├── Accessibility/
└── CrossBrowser/
```

Adjust to the existing repo conventions if they already exist.

### 7. Generate Initial Baselines

After the first VRT specs exist:

```bash
ddev exec "cd packages/[theme-name] && npx playwright test --update-snapshots"
```

Commit the resulting snapshot files as the baseline.

## Agent Sandbox Reality

When used from an agentic coding environment, do **not** assume the agent can directly open `https://<project>.ddev.site` from the host sandbox. In many environments that hostname resolves to loopback and is not reachable.

Fallback rule:

- run Playwright inside DDEV
- write screenshots, traces, and reports into the workspace
- inspect artifacts from disk instead of relying on live browser access from the host agent

## Environment Repair Checklist

Use this skill if any of the following are broken:

- Playwright is missing from `package.json`
- browsers are not installed in the container
- `playwright.config.ts` is missing or wrong
- DDEV HTTPS handling breaks Playwright
- tests fail because the browser/runtime environment is inconsistent
- reports, traces, or snapshots are not being generated correctly

## DDEV-Specific Gotchas

1. Always run Playwright commands through DDEV.
2. Prefer `ddev exec "cd packages/[theme-name] && npx playwright test ..."` for speed.
3. Do not rely on the default `ddev playwright` wrapper for tight iteration loops if it adds unnecessary overhead.
4. Self-signed DDEV certificates require `ignoreHTTPSErrors: true`.
5. Browser binaries belong inside the container, not on the host.
6. Never update snapshots blindly; every visual diff must be understood.

## Quality Gates For Setup Work

A Playwright environment setup is only complete when:

- Playwright runs successfully inside DDEV
- at least one spec executes end-to-end
- artifacts are generated in the workspace
- baseline snapshot creation works when intended
- the project has a clear command path for future frontend verification
