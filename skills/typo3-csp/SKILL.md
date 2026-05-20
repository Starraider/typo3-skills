---
name: typo3-csp
description: Implement, configure, and analyze Content Security Policies (CSP) in TYPO3 v12-v14. Provides step-by-step instructions to enable CSP in report-only mode, monitor violations in the TYPO3 backend module, iteratively whitelist required sources, and transition to full enforcement — all without breaking site functionality. Use when the user wants to add or harden CSP on a TYPO3 site, interpret CSP violation reports, configure site-specific csp.yaml files, add extension-level CSP rules, troubleshoot blocked scripts/styles/images/iframes, or understand which TYPO3 feature flags control enforcement vs. report-only mode.
---

# TYPO3 Content Security Policy (CSP)

## Overview

Use this skill to safely implement and harden Content Security Policies on a TYPO3 v12–v14 installation. The skill provides a risk-free, iterative workflow:

1. **Audit** — understand what external resources the site currently loads.
2. **Report-only mode** — enable CSP in report-only mode so violations are logged without breaking anything.
3. **Refine** — use the TYPO3 CSP backend module to inspect violations and whitelisting candidates.
4. **Enforce** — switch to enforcement only after all legitimate sources are whitelisted.
5. **Maintain** — handle new violations from future content or third-party changes.

> **CRITICAL SAFETY RULE:** Never jump directly to enforcement mode on a live site. Always start with report-only mode and iterate until zero unexpected violations remain.

## Load These References As Needed

- Step-by-step implementation workflow: [references/implementation-workflow.md](references/implementation-workflow.md)
- YAML syntax and common source patterns: [references/yaml-syntax-and-sources.md](references/yaml-syntax-and-sources.md)
- PHP extension API reference: [references/php-extension-api.md](references/php-extension-api.md)
- Troubleshooting guide: [references/troubleshooting.md](references/troubleshooting.md)

## Trigger Examples

Use this skill for prompts like:

- "Add a Content Security Policy to our TYPO3 site."
- "Enable CSP in report-only mode so I can see what would be blocked."
- "Our CSP is blocking Google Tag Manager / YouTube embeds / inline styles — help me fix it."
- "Review the CSP violation reports and tell me what to whitelist."
- "Switch our CSP from report-only to enforced mode."
- "Set up site-specific CSP rules in csp.yaml."
- "How do I allow Google Fonts / AdSense / Vimeo in a TYPO3 CSP?"
- "Write a ContentSecurityPolicies.php for our custom extension."

## Workflow Summary

When this skill is activated, follow this workflow:

### Phase 0: Pre-flight Check

Before touching any configuration:
1. Confirm the TYPO3 version (`ddev typo3 --version`).
2. Check whether CSP feature flags are already set in `config/system/settings.php` or `config/system/additional.php`.
3. Verify whether a `sites/<site-identifier>/csp.yaml` already exists.
4. Check if any extension ships a `Configuration/ContentSecurityPolicies.php`.

### Phase 1: Enable Report-Only Mode

Read [references/implementation-workflow.md](references/implementation-workflow.md) → **Phase 1** for the exact steps.

Key action: Enable `security.frontend.reportContentSecurityPolicy` feature flag. Do **not** enable `enforceContentSecurityPolicy` yet.

### Phase 2: Collect and Analyze Violations

1. Browse all site sections — home page, news, FAQ, map, forms, backend login.
2. In the TYPO3 backend, navigate to **System → Content Security Policy** to see logged violations.
3. Group violations by directive (`script-src`, `img-src`, `frame-src`, etc.) and source domain.
4. For each violation, decide: **whitelist** (legitimate source) or **block** (unwanted/tracking script).

### Phase 3: Write Site-Specific csp.yaml

Read [references/yaml-syntax-and-sources.md](references/yaml-syntax-and-sources.md) for the full syntax reference.

Create/update `config/sites/<site-identifier>/csp.yaml`. Start from `inheritDefault: true` and add only what is needed via `mutations`.

### Phase 4: Switch to Enforcement

Only after zero unexpected violations remain in report-only mode:
1. Enable `security.frontend.enforceContentSecurityPolicy`.
2. Optionally disable `security.frontend.reportContentSecurityPolicy` (or keep both active to catch future regressions).
3. Test all pages again.

### Phase 5: Ongoing Maintenance

- Watch the CSP backend module for new violations after content changes.
- Use the UI "suggest resolution" feature as a starting point — review suggestions before applying.
- After adding new third-party integrations (analytics, ads, maps, embeds), add mutations before rolling out.

## Key Architecture Facts

- **Backend CSP is always enforced** in TYPO3 v13+; no configuration needed to enable it.
- **Frontend CSP** requires at least one of the two feature flags to be set **or** an explicit `enforce/report` block in `csp.yaml`.
- `inheritDefault: true` inherits TYPO3 core + extension defaults. Always include this unless you are building a completely custom policy.
- The TYPO3 backend module stores violations in `sys_http_report` table and resolutions in `sys_csp_resolution`.
- Nonces are applied automatically by TYPO3 for inline scripts/styles in core output. Use `'nonce-proxy'` as a source in `script-src`/`style-src` to allow TYPO3-generated nonce-bearing tags.

## Guardrails

- **Never use `'unsafe-inline'` unless absolutely forced by a legacy third-party library** — it defeats most of CSP's XSS protection. Use nonces instead.
- **Never use `'unsafe-eval'`** unless a specific, audited third-party library requires it. Document the reason.
- **Never use wildcard-protocol sources** like `https:` in `script-src` — only safe for `img-src`.
- **Avoid `*` wildcards** in script or frame sources. Prefer explicit domain allowlists.
- **Always test in a staging environment** before applying enforcement to production.
- **Never remove `inheritDefault: true`** unless you are deliberately writing a full replacement policy.
