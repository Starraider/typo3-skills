# TYPO3 Skills

A collection of reusable **Agent Skills** for TYPO3 projects. Each skill teaches an AI coding agent how to perform a specific TYPO3-related task — from building Extbase plugins and Content Blocks to configuring CSP, route enhancers, Playwright VRT, Tailwind v4, or Google integrations.

Skills are **project-agnostic**: generic placeholders (`my-site-package`, `Vendor\MySitePackage\`, `config/sites/<site-id>`, …) are resolved by the LLM at runtime. No manual find-and-replace needed.

## Repository Layout

```
typo3-skills/
├── .claude-plugin/plugin.json    # Plugin metadata
├── skills/                       # All skills
│   └── <skill-name>/
│       ├── SKILL.md              # Skill definition
│       ├── agents/openai.yaml    # Agent interface
│       ├── references/          # Deep-dive patterns
│       ├── assets/              # Templates, configs
│       └── scripts/             # Helper scripts
├── .github/workflows/
│   ├── validate.yml             # Reusable validation
│   └── release.yml              # Tag-triggered release
├── composer.json                 # PHP distribution
├── README.md
├── LICENSE-MIT                  # Code (MIT)
└── LICENSE-CC-BY-SA-4.0        # Content (CC-BY-SA-4.0)
```

## Installation

### Option 1: Marketplace

```bash
/plugin marketplace add skom/typo3-skills
```

### Option 2: Composer (Recommended for PHP projects)

```bash
composer require skom/typo3-skills
```

### Option 3: npx

```bash
npx skills add https://github.com/Starraider/typo3-skills --skill <skill>
```

### Option 4: Manual Download

Download a release from GitHub and extract to `~/.claude/skills/typo3-skills/`.

## Available Skills

### TYPO3 Core & Site Package

| Skill | Purpose |
| --- | --- |
| [typo3-site-config-sets](skills/typo3-site-config-sets/SKILL.md) | TYPO3 v14 site-handling config — `config/sites/<site-id>/` vs Site Sets in `Configuration/Sets/`, typed site settings. |
| [typo3-typoscript-conditions](skills/typo3-typoscript-conditions/SKILL.md) | Frontend TypoScript conditions for TYPO3 v14 — page IDs, rootlines, site identifiers, languages, versions, FE/BE users & groups. |
| [typo3-favicon-manifest](skills/typo3-favicon-manifest/SKILL.md) | Favicon, app icon, `site.webmanifest` / `browserconfig.xml` delivery in TYPO3 v14, route-enhancer mapping. |
| [typo3-fluid-patterns](skills/typo3-fluid-patterns/SKILL.md) | Fluid templates: Layouts → Pages → Partials → Atoms, CMS-first content, colPos propagation, responsive images, WCAG 2.1 AA, progressive-enhancement JS. |
| [typo3-menu-dataprocessor](skills/typo3-menu-dataprocessor/SKILL.md) | Navigation menus in TYPO3 v13+ — `menu` and `language-menu` DataProcessors, main menus, breadcrumbs, language switchers, sitemaps. |
| [typo3-language-menu](skills/typo3-language-menu/SKILL.md) | Language switcher with browser-preference auto-redirect and persistent cookie-based choice. |
| [typo3-route-enhancers](skills/typo3-route-enhancers/SKILL.md) | Site-config routeEnhancers — Extbase plugin arguments, detail pages, filters, pagination, aliases, cHash-sensitive parameters. |
| [typo3-xml-sitemap](skills/typo3-xml-sitemap/SKILL.md) | TYPO3 v14 XML sitemaps with EXT:seo — multi-language, page sitemaps, custom record sitemaps, PageType route enhancer, hreflang links. |
| [typo3-rich-snippets](skills/typo3-rich-snippets/SKILL.md) | Schema.org structured data (JSON-LD/Microdata/RDFa) via Fluid and TypoScript for SEO-ready rich results. |
| [typo3-csp](skills/typo3-csp/SKILL.md) | Content Security Policies in TYPO3 v12–v14 — report-only iteration, violation analysis, site & extension `csp.yaml`, full enforcement. |

### Content Elements & Plugins

| Skill | Purpose |
| --- | --- |
| [typo3-content-blocks](skills/typo3-content-blocks/SKILL.md) | `friendsoftypo3/content-blocks` — `config.yaml`, ContentElements / PageTypes / RecordTypes, templates, backend previews, icons, linting. |
| [typo3-container](skills/typo3-container/SKILL.md) | `b13/container` for nested content — multi-column grids, background colors, optional margins, max-width options. |
| [typo3-extbase-plugin](skills/typo3-extbase-plugin/SKILL.md) | TYPO3 v13+/v14+ Extbase plugins end-to-end — plugin registration, Domain Models, Repositories, Controllers, TCA, TypoScript, SQL, DI. |
| [typo3-flexforms](skills/typo3-flexforms/SKILL.md) | FlexForms for Extbase plugins and content elements in TYPO3 v14 — category fields, removing legacy `TCEforms` tags. |
| [typo3-rte-ckeditor](skills/typo3-rte-ckeditor/SKILL.md) | TYPO3 RTE (`EXT:rte_ckeditor` / CKEditor 5) — YAML presets, toolbars, styles, headings, link browser, content CSS, HTML processing, plugins. |
| [typo3-form-yaml](skills/typo3-form-yaml/SKILL.md) | TYPO3 v14 forms with EXT:form YAML files — `Configuration/Form/`, `.form.yaml`, styling hooks, template overrides. |
| [typo3-scheduler-task](skills/typo3-scheduler-task/SKILL.md) | TYPO3 v14 Scheduler tasks — `tx_scheduler_task` registration, TCA configuration fields, migration from `AdditionalFieldProviderInterface`. |
| [typo3-translatable-extension-data](skills/typo3-translatable-extension-data/SKILL.md) | Make extension records translatable — TCA, SQL translation columns, repositories/controllers returning localized overlays. |
| [typo3-news-extension](skills/typo3-news-extension/SKILL.md) | `georgringer/news` in DDEV projects — Site Set / TypoScript settings, template overrides, SEO view helpers, Playwright VRT. |

### Styling & Frontend Workflow

| Skill | Purpose |
| --- | --- |
| [tailwind-v4-workflow](skills/tailwind-v4-workflow/SKILL.md) | Tailwind CSS v4 PostCSS build in TYPO3/DDEV — `@theme` tokens, `@source` directives, CSS partials, compilation. |
| [typo3-tailwind-migration](skills/typo3-tailwind-migration/SKILL.md) | Migrate TYPO3 theme from legacy CSS to Tailwind v4 — baseline VRT, build pipeline, token mapping, Fluid migration, a11y audit. |

### Testing & Quality

| Skill | Purpose |
| --- | --- |
| [typo3-playwright-ddev](skills/typo3-playwright-ddev/SKILL.md) | Set up Playwright infrastructure for TYPO3 in DDEV — initialization, browsers & add-ons, config, scripts, initial baselines. |
| [typo3-playwright-workflow](skills/typo3-playwright-workflow/SKILL.md) | Day-to-day Playwright verification — Fluid/CSS/UI changes, screenshots, `@stitch-vrt` checks, debugging visual diffs. |

### Google Integrations

| Skill | Purpose |
| --- | --- |
| [google-tag-manager](skills/google-tag-manager/SKILL.md) | Google Tag Manager — web-container install, consent-aware architecture, triggers/variables/tags, preview & publish, GDPR/ePrivacy. |
| [google-analytics](skills/google-analytics/SKILL.md) | GA4 with privacy-compliant tagging — events, key events, AdSense revenue linking, CMP/consent alignment, UI steps. |
| [google-cmp-adsense](skills/google-cmp-adsense/SKILL.md) | Google's certified CMP with Consent Mode v2 for EEA/UK/Swiss traffic across AdSense, Ad Manager, Google Ads, GA4, GTM. |
| [google-adsense](skills/google-adsense/SKILL.md) | Google AdSense — site approval, AdSense code, Auto ads, manual units, ads.txt, GA4 linking, blocking controls, experiments. |
| [google-adsense-search](skills/google-adsense-search/SKILL.md) | Google AdSense for Search (AFS) — search styles, code generation, parameter tuning, related search, Shopping ads, responsive design. |

## Using a Skill

**Automatic triggering:** Each skill's `SKILL.md` declares a description the AI uses to determine relevance. When your prompt matches (e.g. "about TYPO3 Content Blocks"), the LLM picks up the skill automatically.

**Explicit invocation:** Mention the skill by name in your prompt (e.g. *"use the `typo3-extbase-plugin` skill to scaffold a new plugin"*) to force the LLM to load that skill, even if context wouldn't trigger it.

**Placeholder resolution:** The LLM interprets placeholders like `my-site-package`, `my_site_package`, `Vendor\MySitePackage\`, and `<site-id>` at runtime — no manual editing required.

## Conventions

- **Placeholders over project names.** Skills never reference a specific site package, vendor, extension key, or site identifier.
- **Editor/LLM-agnostic.** Skills do not assume a specific IDE or LLM runtime.
- **TYPO3 v13+/v14 focused.** Unless noted otherwise, skills target modern TYPO3 versions.

## License

Code and scripts: [LICENSE-MIT](LICENSE-MIT) (Sven Kalbhenn)
Skills and documentation: [LICENSE-CC-BY-SA-4.0](LICENSE-CC-BY-SA-4.0)

## Contributing

1. Fork the repository and create a feature branch.
2. Add or modify skills under `skills/<skill-name>/` — always project-agnostic.
3. Each skill needs at minimum `SKILL.md` and `agents/openai.yaml`.
4. Submit a pull request with a clear description of what the skill does.

Questions and feedback welcome via GitHub issues or e-mail: sven@skom.de
