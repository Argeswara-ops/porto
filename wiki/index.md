---
title: Index
type: overview
created: 2026-06-30
updated: 2026-07-21
status: active
---

# Index

The catalog of this wiki — every page with a one-line summary. Read this first to find the relevant
page, then drill in. See [[overview]] for the architecture synthesis and [[log]] for edit history.
Kept current on every `/wiki sync`.

## Subsystems

The concrete moving parts of the codebase.

- [[subsystems/i18n]] — **removed** in two steps (fr + scripts 2026-07-17, helper layer 2026-07-18); the removal record: what replaced it (flat config, `siteLang`/`siteLocale`) and the re-add path.
- [[subsystems/content-collections]] — `src/data/**` content, Zod schemas in `src/content.config.ts`, flat `<slug>` ids.
- [[subsystems/keystatic-cms]] — **removed 2026-07-17** via `pnpm remove-keystatic`; the removal record, its knock-on effects (`trailingSlash: "always"`, fully static build), and the re-add path.
- [[subsystems/styling-tokens]] — Tailwind v4 CSS-first token architecture (palette → semantic vars → utilities) and dark mode.
- [[subsystems/motion]] — owned, dependency-free `animate-*` catalog (a port of tailwind-animations), the global reduced-motion guard, the `useAnimations` switch, the zero-JS `<Reveal>` scroll primitive, and the native motion mechanisms (marquee, `@starting-style` overlays, view transitions).
- [[subsystems/ui-primitives]] — astro-boiler's own `tailwind-variants` primitive library at `src/components/ui/` (Tiers 1–3 + advanced-form batch built); the primitive contract, native-first interactivity, the `_field`/`_dialog`/`_overlay`/`_listbox`/`_popover`/`_client` shared modules, two overlay gotchas, dev-only catalog.
- [[subsystems/icons]] — the owned SVG icon system at `src/components/svg/icons/`: typed `<Icon>` primitive over an auto-generated 571-icon registry (Stratis line icons + social brand marks), build-time inlined, Figma-MCP regeneration runbook.
- [[subsystems/layouts-seo]] — `BaseLayout`/`BaseHead`: the page shell, font preload, pre-paint theme, view transitions (the SEO tags moved to their own page).
- [[subsystems/seo]] — the owned, dependency-free technical-SEO layer: JSON-LD builders (`@js/schema`, auto Organization+WebSite graph), canonical≡`og:url`, enriched OG/Twitter + `article:*`, sitemap `filter`, dynamic `robots.txt`/`llms.txt`, `trailingSlash`.
- [[subsystems/scripts]] — `scripts/` is now one file, the `pnpm test` discovery runner. The one-shot removal scripts ran and retired themselves (2026-07-17); the graveyard and the orphaned `utils/` plumbing were deleted (2026-07-21) — `592dff5` has all of it.

## Concepts

Cross-cutting patterns that span subsystems.

- [[concepts/config-driven]] — typed config as the single source of truth; what the retired config-i18n tooling taught about mirrored facts.
- [[concepts/lazy-senior-ethos]] — the project's guiding philosophy: the best code is the code never written.
- [[concepts/page-composition]] — the three-tier composition (thin route owning BaseLayout+SEO → layout-free `Sections/` → sub-parts/`Cards/`), restructured 2026-07-18; exemplars for both data-flow styles, the 404/noindex pattern, the dev-only catalog route, and theming an SVG with `currentColor`.

## Ideal template

The target standard the skeleton grows into — naming, structure, and code quality pinned so a ported
feature lands identical every time. A spec to grow toward, not the current state.

- [[ideal-template/architecture]] — the target `src/` layout (✓ present vs → target) and content-collection ids.
- [[ideal-template/naming-conventions]] — component folders, variant/sub-component suffixes, the per-directory casing table.
- [[ideal-template/code-quality]] — the house style (`.claude/rules/*`) with in-repo exemplars to copy from.

## Sources

Summaries of **external** references ingested into the wiki (the live codebase isn't listed here — it's
the implicit source behind every page).

- [[sources/galaxy-main]] — the finished reference starter astro-boiler ports from; provenance for the ideal-template standard.
- [[sources/llm-wiki-pattern]] — the LLM Wiki design pattern this whole `wiki/` instantiates.
- [[sources/astro-seo-devto]] — the dev.to "SEO for Astro" article; provenance for the technical-SEO layer, filtered through the dependency-free ethos.
