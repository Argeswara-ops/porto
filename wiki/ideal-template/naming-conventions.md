---
title: Ideal template — naming conventions
type: standard
created: 2026-06-30
updated: 2026-07-21
tags: [naming, components, conventions]
sources:
  - src/components/Sections/README.md
  - src/components/Sections/NotFound/NotFound.astro
  - src/layouts/BaseLayout.astro
  - src/js/textUtils.ts
  - src/config/siteSettings.json.ts
status: active
---

# Ideal template — naming conventions

How every file is named, so a ported feature is indistinguishable from one written here from scratch.
The base rules already hold in astro-boiler; the variant/sub-component rules are the **target** the
component library grows into. Pairs with [[architecture]] (where things live) and [[code-quality]]
(how they're written).

> [!note] Provenance — naming is distilled from the reference starter [[sources/galaxy-main]], adapted
> 2026-07-18 to the `Sections/`/`Cards/` restructure ([[concepts/page-composition]]). astro-boiler
> ships `Sections/` (Home, Legal, NotFound, UiCatalog), an empty-on-purpose `Cards/`, and the built
> `ui/` primitive library ([[subsystems/ui-primitives]]) today; the richer variant/sub-component rules
> below still describe the standard, not current files.

## Components — PascalCase folders under a role root

Components live under a **role root** — `Sections/` (layout-free page content, grouped per page or
`Global/`), `Cards/` (content-aware compositions), `ui/` (primitives), `svg/` (icons) — and inside a
role root every folder and file is PascalCase:

```
src/components/Sections/<Page>/<Name>.astro   e.g. Sections/NotFound/NotFound.astro  ✓
src/components/Cards/<Name>Card.astro         (target — none built yet)
```

The per-page folder is the unit — it gives a page's sections, their sub-parts, and future variants a
home without a later move.

### Variants — suffix the family name

When a component has several flavors, keep them in one folder and suffix the shared name. Two
sanctioned styles (target):

- **Numeric** for interchangeable layout variants: `Sections/Home/Hero1.astro`, `Hero2.astro`.
- **Descriptive** when the variants differ in kind: `Cards/FeatureCardLarge.astro`,
  `FeatureCardSmall.astro`, `FeatureCardImage.astro`.

Pick one style per family; don't mix `Hero1` with `HeroLarge` in the same folder.

### Sub-components — nest and keep the parent prefix (target)

A component made of smaller parts keeps them as siblings (nesting sub-folders when a part itself has
parts), and each part **carries the parent's name as a prefix** so the file is self-describing out of
context — `Sections/NotFound/NotFoundIllustration.astro` ✓ is the in-repo example:

```
src/components/Sections/Global/Nav/Nav.astro        (target)
src/components/Sections/Global/Nav/NavLink.astro
src/components/Sections/Global/Nav/MobileNav/MobileNav.astro
```

### Primitives live in `ui/`

Low-level UI primitives (Button, Card, Input…) live under `src/components/ui/` — astro-boiler's **own**
primitive library, now built (Tier 1+2) and documented in [[subsystems/ui-primitives]] (the in-house
equivalent of the reference starter's `starwind/`, see [[sources/galaxy-main]]). Casing nuance: the
per-primitive folder is **lowercase** (`ui/button/`) while its entry file stays **PascalCase**
(`Button.astro`), alongside an `index.ts` barrel — the one place `src/components/**` folders aren't
PascalCase. **Reuse a primitive before hand-rolling one** — see the smell test in [[code-quality]], the
`tailwind-variants` pattern there, and the build spec in `tasks/ui-library-handoff.md`.

## Per-directory casing — the table

Casing is decided by _which directory_ a file is in, not by what it does. This is the rule that makes
ports land identically:

| Location                | Case                                | Example (✓ = in repo)                                     |
| :---------------------- | :---------------------------------- | :-------------------------------------------------------- |
| `src/components/**`     | **PascalCase**                      | `Sections/NotFound/NotFound.astro` ✓                      |
| `src/layouts/**`        | **PascalCase**                      | `BaseLayout.astro` ✓, `BlogLayoutCentered.astro` (target) |
| `src/js/**` (utils)     | **camelCase**                       | `textUtils.ts` ✓, `schema.ts` ✓                           |
| `src/config/**`         | **camelCase**, `*.json.ts` for data | `siteSettings.json.ts` ✓                                  |
| `src/pages/**` (routes) | **kebab-case**                      | `index.astro` ✓, `password-reset.astro` (target)          |
| `src/data/**` (slugs)   | **kebab-case** folders              | `blog/<slug>/index.md`                                    |
| `src/styles/**`         | **kebab-case**                      | `tailwind-theme.css` ✓, `markdown-content.css` (target)   |
| `scripts/**`            | **kebab-case** `.mjs`               | `test.mjs` ✓ (the only one)                               |

> [!note] Utility _files_ are camelCase, but the _symbols_ they export follow [[code-quality]]: named
> functions with explicit return types, e.g. `formatDate` (`src/js/textUtils.ts:32`).

## Config files

Config data files are camelCase `*.json.ts` directly under `src/config/` (`siteData.json.ts`,
`legalData.json.ts`, `siteSettings.json.ts`), typed by `types/configDataTypes.ts`. The per-locale
`config/<locale>/` nesting left with the i18n system ([[subsystems/i18n]]) — if locales return, the
mirrored-folder naming (`config/<locale>/`, `data/**/<locale>/`, `pages/<locale>/`) is the shape to
restore. See [[concepts/config-driven]].

Main threads: [[architecture]] · [[code-quality]] · [[subsystems/i18n]] · [[overview]]
