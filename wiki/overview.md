---
title: Overview
type: overview
created: 2026-06-30
updated: 2026-07-21
tags: [architecture]
sources: [astro.config.mjs, src/layouts/BaseLayout.astro, CLAUDE.md, src/components/Sections/README.md]
status: active
---

# Overview

**astro-boiler** is a deliberately lean Astro 7 + Tailwind CSS v4 + TypeScript (strict) starter. It is
not a finished site — it's the skeleton you copy and grow into a real template, adding components, a
CMS, and search per project. Package manager is **pnpm**. The whole repo is small by design, so the
fastest way to understand it is to read it; this wiki captures the parts no single file makes obvious.

> [!note] Two big state changes since early July: **(1)** the optional Keystatic CMS and the whole
> i18n system were removed — the fr locale and scripts on 2026-07-17, the surviving helper layer on
> 2026-07-18 ([[subsystems/i18n]], [[subsystems/keystatic-cms]], [[subsystems/scripts]]) — leaving a
> single-language, fully static site; **(2)** the component layer was restructured on 2026-07-18
> around `Sections/` + `Cards/` ([[concepts/page-composition]]).

## What's actually here

Two things carry most of the design weight, and each has its own page:

The **[[concepts/config-driven|config-driven data layer]]** is the backbone: typed config in
`src/config/` (`siteData`, `legalData`, `siteSettings` — interfaces in `configDataTypes.ts`),
imported directly by the pages and sections that need it, never hard-coded copies in components.
The site is **single-language**: the former i18n helper layer is gone ([[subsystems/i18n]] is the
removal record), and the only locale facts are the `siteLang`/`siteLocale` constants in
`siteSettings.json.ts`.

The **[[subsystems/styling-tokens|Tailwind v4 token architecture]]** is the other pillar: a three-layer
CSS-first system (palette aliases → semantic runtime vars that flip with the theme → utilities) so
markup only ever uses tokens like `bg-primary`/`text-foreground`, never raw colors.

The component layer is a three-tier composition ([[concepts/page-composition]]):
**`src/components/Sections/`** holds layout-free page sections (per-page folders; a `Global/` folder
for cross-page sections is the documented convention but is created with the first one, not
pre-made), **`src/components/Cards/`** holds content-aware card compositions (empty until the
first card lands), and both build on the in-house
[[subsystems/ui-primitives|UI primitives library]] (`src/components/ui/`, `tailwind-variants`-based)
and the owned [[subsystems/icons|SVG icon system]] (`src/components/svg/icons/`). Around that: a
content layer ([[subsystems/content-collections]]) storing blog entries under `src/data/**`
validated with Zod (no blog route yet); a minimal page shell ([[subsystems/layouts-seo]]) handling
`<head>`, the pre-paint theme, and view transitions, with an owned, dependency-free
[[subsystems/seo|technical-SEO layer]] on top (JSON-LD, canonical, sitemap, dynamic
`robots.txt`/`llms.txt`); and a [[subsystems/motion|motion layer]] (`src/styles/motion/`) — an owned
`animate-*` catalog with a scroll-driven extension, a global reduced-motion guard, and the zero-JS
`<Reveal>` primitive.

## How a page renders (the request flow)

1. A route under `src/pages/` renders. Routes are thin shells that **own `BaseLayout` + SEO** (title,
   description, `noindex`, `schema`) and compose layout-free sections from
   `src/components/Sections/` — see [[concepts/page-composition]].
2. `BaseLayout` imports the single CSS entry `src/styles/global.css` and composes `BaseHead` — see
   [[subsystems/layouts-seo]].
3. `BaseHead` imports `siteData` directly and emits the [[subsystems/seo|SEO layer]]: canonical +
   OG/Twitter and an Organization+WebSite JSON-LD graph (plus any page `schema`). An inline script
   sets the theme class before paint to avoid a flash.
4. Tokens from the [[subsystems/styling-tokens|token architecture]] resolve against `:root`/`.dark`, so
   the same utility classes render correctly in light and dark mode.
5. Content pages (once a blog route lands) additionally read entries from the
   [[subsystems/content-collections|content collections]].

## Conventions worth knowing up front

- **Path aliases** (`@config/* @js/* @layouts/* @components/* @assets/* @images/* @/*`) over deep
  relative imports (`tsconfig.json`).
- **Typed config, never hard-coded literals** — feature flags and data come from `src/config/`. See
  [[concepts/config-driven]].
- **Thin routes own layout + SEO; sections own markup** — the contract in
  `src/components/Sections/README.md`, walked through in [[concepts/page-composition]].
- The project follows a **[[concepts/lazy-senior-ethos|lazy-senior ethos]]**: smallest working diff,
  deletion over addition, reuse before adding.

## Growing the template — the ideal-template standard

astro-boiler is a _subset_ of a finished template. The conventions a ported feature must match — so the
grown template is reproducible, not improvised — are pinned in [[ideal-template/architecture|the
directory architecture]], [[ideal-template/naming-conventions|naming conventions]], and
[[ideal-template/code-quality|code quality]]. Read those before porting anything in; they distinguish
what's already here from the target to grow toward.

## Open questions / things to watch

- `astro.config.mjs` `site` reads `process.env.SITE_URL ?? "https://example.com"` — it feeds the
  canonical/OG URLs, the sitemap, `robots.txt`, `llms.txt`, and the JSON-LD `@id`s. A **production**
  deploy throws on the placeholder (the gate reads Netlify's `CONTEXT`, Vercel's `VERCEL_ENV`, or a
  generic `DEPLOY_ENV`, `astro.config.mjs:16-27`); local builds and previews are unaffected. See
  [[subsystems/seo]] and `.env.example`.
- `scripts/` is one file — the `pnpm test` runner. The gitignored `scripts/deleted/` graveyard and the
  orphaned `scripts/utils/` plumbing were deleted on 2026-07-21; `592dff5` holds the removed fr +
  Keystatic material and the retired scripts. See [[subsystems/scripts]].

## Main threads

[[subsystems/i18n]] · [[subsystems/styling-tokens]] · [[subsystems/ui-primitives]] ·
[[subsystems/icons]] · [[subsystems/content-collections]] · [[subsystems/keystatic-cms]] ·
[[subsystems/layouts-seo]] · [[subsystems/seo]] · [[subsystems/scripts]] · [[subsystems/motion]] ·
[[concepts/config-driven]] · [[concepts/lazy-senior-ethos]] · [[concepts/page-composition]]
