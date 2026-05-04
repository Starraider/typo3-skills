# TYPO3 Skills

A collection of reusable **Agent Skills** for TYPO3 projects. Each skill lives under
[.agents/skills/](./.agents/skills) and teaches an AI coding agent how to perform a
specific TYPO3-related task — from building Extbase plugins and Content Blocks to
configuring CSP, route enhancers, Playwright VRT, Tailwind v4, or Google integrations.

Skills are intentionally **project-agnostic**: generic placeholders
(`my-site-package`, `Vendor\MySitePackage\`, `config/sites/<site-id>`, …) are used so
each skill can be dropped into any TYPO3 site package or extension.

## Repository Layout

```
.agents/skills/<skill-name>/
├── SKILL.md                 # Skill definition (description + workflow)
├── agents/openai.yaml       # Standardized agent interface
├── references/              # Deep-dive patterns, playbooks, checklists
├── assets/                  # Optional: templates, configs, starter files
└── scripts/                 # Optional: helper scripts
```

## Available Skills

### TYPO3 Core & Site Package

| Skill | Purpose |
| --- | --- |
| [typo3-site-config-sets](./.agents/skills/typo3-site-config-sets/SKILL.md) | Decide where TYPO3 v14 site-handling configuration belongs — `config/sites/<site-id>/` vs reusable Site Sets in `Configuration/Sets/` — and work with typed site settings. |
| [typo3-typoscript-conditions](./.agents/skills/typo3-typoscript-conditions/SKILL.md) | Add or fix frontend TypoScript conditions for TYPO3 v14 (page IDs, rootlines, site identifiers, languages, requests, versions, FE/BE users & groups). |
| [typo3-favicon-manifest](./.agents/skills/typo3-favicon-manifest/SKILL.md) | Integrate favicon, app icon, and `site.webmanifest` / `browserconfig.xml` delivery in TYPO3 v14 projects, including route-enhancer mapping. |
| [typo3-fluid-patterns](./.agents/skills/typo3-fluid-patterns/SKILL.md) | Battle-tested Fluid template patterns: Layouts → Pages → Partials → Atoms, CMS-first content via `lib.dynamicContent`, colPos propagation, responsive images, WCAG 2.1 AA, and progressive-enhancement JS. |
| [typo3-menu-dataprocessor](./.agents/skills/typo3-menu-dataprocessor/SKILL.md) | Build navigation menus in TYPO3 v13+ using the `menu` and `language-menu` DataProcessors — main menus, breadcrumbs, language switchers, directory listings, sitemaps. |
| [typo3-language-menu](./.agents/skills/typo3-language-menu/SKILL.md) | Language switcher with browser-preference auto-redirect on first visit and persistent cookie-based language choice. |
| [typo3-route-enhancers](./.agents/skills/typo3-route-enhancers/SKILL.md) | Configure site-config routeEnhancers for speaking URLs — Extbase plugin arguments, detail pages, filters, pagination, aliases, and cHash-sensitive parameters. |
| [typo3-xml-sitemap](./.agents/skills/typo3-xml-sitemap/SKILL.md) | Configure TYPO3 v14 XML sitemaps with EXT:seo — multi-language, page sitemaps, custom record sitemaps, PageType route enhancer mapping, hreflang-aware links. |
| [typo3-rich-snippets](./.agents/skills/typo3-rich-snippets/SKILL.md) | Generate, validate, and implement schema.org structured data (JSON-LD/Microdata/RDFa) via Fluid and TypoScript for SEO-ready rich results. |
| [typo3-csp](./.agents/skills/typo3-csp/SKILL.md) | Implement and analyze Content Security Policies in TYPO3 v12–v14 — report-only iteration, violation analysis, site & extension-level `csp.yaml`, full enforcement. |

### Content Elements & Plugins

| Skill | Purpose |
| --- | --- |
| [typo3-content-blocks](./.agents/skills/typo3-content-blocks/SKILL.md) | Create, edit, and troubleshoot `friendsoftypo3/content-blocks` — `config.yaml`, ContentElements / PageTypes / RecordTypes, templates, backend previews, icons, linting. |
| [typo3-container](./.agents/skills/typo3-container/SKILL.md) | Install and configure `b13/container` for nested content elements — multi-column grids, background colors, optional margins, max-width options. |
| [typo3-extbase-plugin](./.agents/skills/typo3-extbase-plugin/SKILL.md) | Build TYPO3 v13+/v14+ Extbase plugins end-to-end — plugin registration, Domain Models, Repositories, Controllers, TCA, TypoScript, SQL, DI. |
| [typo3-flexforms](./.agents/skills/typo3-flexforms/SKILL.md) | Create and configure FlexForms for Extbase plugins and content elements in TYPO3 v14, including category fields and removing legacy `TCEforms` tags. |
| [typo3-rte-ckeditor](./.agents/skills/typo3-rte-ckeditor/SKILL.md) | Configure the TYPO3 RTE (`EXT:rte_ckeditor` / CKEditor 5) — YAML presets, toolbars, styles, headings, link browser, content CSS, HTML processing, plugins. |
| [typo3-form-yaml](./.agents/skills/typo3-form-yaml/SKILL.md) | Build TYPO3 v14 forms with EXT:form using versioned YAML files in an extension/site package — `Configuration/Form/`, `.form.yaml`, styling hooks, template overrides. |
| [typo3-scheduler-task](./.agents/skills/typo3-scheduler-task/SKILL.md) | Create or modify TYPO3 v14 Scheduler tasks — `tx_scheduler_task` registration, TCA configuration fields, migration from `AdditionalFieldProviderInterface`. |
| [typo3-translatable-extension-data](./.agents/skills/typo3-translatable-extension-data/SKILL.md) | Make extension records translatable in TYPO3 v13+/v14+ — TCA, SQL translation columns, repositories/controllers that return localized overlays for the active site language. |
| [typo3-news-extension](./.agents/skills/typo3-news-extension/SKILL.md) | Install, configure, and template `georgringer/news` in DDEV-based projects — Site Set / TypoScript settings, template overrides, SEO view helpers, Playwright VRT. |

### Styling & Frontend Workflow

| Skill | Purpose |
| --- | --- |
| [tailwind-v4-workflow](./.agents/skills/tailwind-v4-workflow/SKILL.md) | Tailwind CSS v4 PostCSS build workflow in TYPO3/DDEV — `@theme` tokens, `@source` directives, CSS partial organization, compilation steps. |
| [typo3-tailwind-migration](./.agents/skills/typo3-tailwind-migration/SKILL.md) | Migrate a TYPO3 theme from legacy/custom CSS to Tailwind v4 with 1:1 visual parity — baseline VRT, build pipeline, token mapping, Fluid template migration, a11y audit. |

### Testing & Quality

| Skill | Purpose |
| --- | --- |
| [typo3-playwright-ddev](./.agents/skills/typo3-playwright-ddev/SKILL.md) | Set up and maintain Playwright infrastructure for TYPO3 in DDEV — initialization, browsers & add-ons, config, scripts, initial baselines. |
| [typo3-playwright-workflow](./.agents/skills/typo3-playwright-workflow/SKILL.md) | Day-to-day Playwright verification workflow — Fluid/CSS/UI changes, screenshots, `@stitch-vrt` checks, debugging visual diffs. |

### Google Integrations

| Skill | Purpose |
| --- | --- |
| [google-tag-manager](./.agents/skills/google-tag-manager/SKILL.md) | Implement Google Tag Manager — web-container install, Google tag setup, consent-aware architecture, triggers/variables/tags, preview & publish, GDPR/ePrivacy alignment. |
| [google-analytics](./.agents/skills/google-analytics/SKILL.md) | Implement GA4 with privacy-compliant Google tag or GTM — events, key events, AdSense revenue linking, CMP/consent alignment, exact UI steps. |
| [google-cmp-adsense](./.agents/skills/google-cmp-adsense/SKILL.md) | Implement Google's certified CMP (Privacy & messaging / Funding Choices) with Consent Mode v2 for EEA/UK/Swiss traffic across AdSense, Ad Manager, Google Ads, GA4, GTM. |
| [google-adsense](./.agents/skills/google-adsense/SKILL.md) | Add and optimize Google AdSense — site approval, AdSense code, Auto ads, manual units, ads.txt, GA4 linking, blocking controls, experiments, policy-safe monetization. |
| [google-adsense-search](./.agents/skills/google-adsense-search/SKILL.md) | Implement Google AdSense for Search (AFS) — sign-up prerequisites, search styles, code generation, parameter tuning, related search, Shopping ads, responsive design, AFS policy compliance. |

## Using a Skill

1. Copy the chosen skill directory from `.agents/skills/` into either:
   - your target TYPO3 project's **project-specific skills folder** (e.g. `<project-root>/.agents/skills/<skill-name>/`) to make it available only inside that project, or
   - your **global skills folder** (the location depends on your AI coding agent's configuration) to reuse the skill across multiple TYPO3 projects.
2. Let the skill be invoked **automatically** — each skill's `SKILL.md` declares a description that tells the AI coding agent when the skill applies. Whenever your prompt's context matches (e.g. you ask about TYPO3 Content Blocks, CSP, route enhancers, …), the LLM picks up the relevant skill on its own.
3. Or invoke the skill **explicitly** — mention it by name in your prompt (e.g. *"use the `typo3-extbase-plugin` skill to scaffold a new plugin"*) to force the LLM to load and follow that skill, even if the context would not have triggered it automatically. Placeholders like `my-site-package`, `my_site_package`, `Vendor\MySitePackage\`, and `<site-id>` are interpreted by the LLM and mapped to your project's real values at runtime — no manual find-and-replace required.

## Conventions

- **Placeholders over project names.** Skills never reference a specific site package,
  vendor, extension key, or site identifier. Use `my-site-package` / `my_site_package`,
  `Vendor\MySitePackage\`, and `<site-id>` as replaceable defaults.
- **Editor/LLM-agnostic.** Skills do not assume a specific IDE or LLM runtime. The
  standardized `agents/openai.yaml` describes the skill interface, but skills remain
  usable with any compatible agent framework.
- **TYPO3 v13+/v14 focused.** Unless noted otherwise in the skill's own `SKILL.md`,
  skills target modern TYPO3 versions and current best practices.

## Contributing

Contributions are very welcome! If you want to improve an existing skill, add a new
TYPO3-related skill, fix a bug, or refine documentation, please open a **pull request**:

1. Fork the repository and create a feature branch.
2. Add or modify skills under `.agents/skills/<skill-name>/`, keeping them
   project-agnostic (use the placeholder conventions above).
3. Make sure each skill contains at least a `SKILL.md` and an `agents/openai.yaml`.
4. Submit your pull request with a clear description of what the skill does and when
   it should be used.

Ideas, questions, and feedback are equally welcome via GitHub issues or via e-mail at sven@skom.de

## License

This project is released under the terms described in the [LICENSE](./LICENSE) file.
Please refer to that file for the full license text and the conditions under which
you may use, modify, and redistribute the skills in this repository.
