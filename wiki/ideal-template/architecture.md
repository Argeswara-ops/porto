---
title: Ideal template — directory architecture
type: standard
created: 2026-06-30
updated: 2026-07-23
tags: [architecture, structure, conventions]
sources:
  - CLAUDE.md
  - tsconfig.json
  - src/content.config.ts
status: active
---

# Ideal template — directory architecture

The target `src/` layout the skeleton grows into. astro-boiler ships a **lean subset** of this
(marked ✓ below); the rest is the standard to reach for when you port a feature in, so the grown
template lands in the same shape every time. This is a _spec to grow toward_, not a description of
what exists today — see [[overview]] for the current state and [[naming-conventions]] /
[[code-quality]] for the rules that fill it in.

> [!note] Provenance — the full standard is distilled from the finished reference starter
> [[sources/galaxy-main]]. It is reproduced here deploy-neutral (no Netlify-specific dirs) and adapted
> to Astro 7. Cite the reference's real files when porting; don't invent paths.

## The target `src/` tree

Each directory has exactly one job. `✓` = already in astro-boiler; `→` = target to add when a feature
needs it (YAGNI — don't pre-create empties).

```
src/
├── components/            ✓ role roots, PascalCase inside each (see [[naming-conventions]])
│   ├── Sections/<Page>/  ✓ layout-free page sections (About/, Blog/, Contact/, Home/, Legal/, NotFound/, Project/, UiCatalog/)
│   │   └── Global/       ✓  cross-page sections (Header, Footer, SectionHeading, CardGrid, Scoreboard)
│   ├── Cards/            ✓ content-aware card compositions (ContentCard, PixelCardLink)
│   ├── svg/icons/        ✓ the owned SVG icon system (`<Icon>` + typed `icons.ts` registry — [[subsystems/icons]])
│   └── ui/               ✓ our own UI primitives library (39 primitives — [[subsystems/ui-primitives]])
├── layouts/              ✓ page-shell wrappers, PascalCase .astro (BaseLayout, BaseHead)
│   └── Blog*Layout.astro →  per-content layouts as the content types arrive
├── pages/                ✓ file-based routes, kebab-case files — thin shells owning BaseLayout + SEO
│   ├── index.astro       ✓  (every route prerenders to static HTML except contact.astro)
│   ├── about.astro       ✓
│   ├── blog/             ✓  index.astro (listing) + [slug].astro (article) — live
│   ├── projects/         ✓  index.astro (listing) + [slug].astro (detail) — live
│   ├── contact.astro     ✓  SSR: `export const prerender = false`, Resend form on the @astrojs/node adapter
│   ├── privacy.astro     ✓  · terms.astro ✓ · 404.astro ✓ (noindex)
│   ├── robots.txt.ts / llms.txt.ts / rss.xml.ts   ✓  dynamic endpoints
│   └── examples/         ✓ dev-only UI catalog (`[catalog].astro` — emits no prod paths, noindex, sitemap-excluded)
├── config/               ✓ typed site config — see [[concepts/config-driven]]
│   ├── siteSettings.json.ts        ✓ siteLang/siteLocale + feature flags
│   ├── siteData.json.ts            ✓ site metadata (name, title, author, OG default)
│   ├── legalData.json.ts           ✓ terms + privacy content
│   ├── navData.json.ts             ✓ header primary-nav link set (About · Projects · Blog · Contact)
│   ├── portfolioData.json.ts       ✓ buyer-customized profile/bio/stat/intro/contact copy
│   └── types/configDataTypes.ts    ✓ interfaces for the data files
├── data/                 ✓ content-collection source (flat slugs — [[subsystems/i18n]] removal)
│   ├── blog/<slug>/index.mdx             ✓ (6 posts — live at /blog/)
│   ├── projects/<slug>/index.mdx         ✓ (6 projects — live at /projects/)
│   ├── authors/<slug>/index.md           ✓ (1: admin — referenced by blog)
│   ├── otherPages/<slug>/                 →  privacy/terms/etc. as a collection
│   └── codeToggles/<language>/            →  reusable code-sample snippets
├── js/                   ✓ TypeScript utilities, camelCase (textUtils, schema, blogData/postCards,
│                            projectData/projectCards, nav, resend, rss, readingTime, social)
├── styles/               ✓ CSS — global.css (entry), tailwind-theme.css, fonts.css
│   └── buttons.css, markdown-content.css …  →  add per concern, imported into a @layer
├── assets/               ✓ optimizable media (astro:assets) — @images → assets/images
│   ├── images/           ✓
│   └── videos/           →  add the dir AND a matching @videos/* path in tsconfig.json together
├── icons/                →  superseded: the icon system landed at src/components/svg/icons/ instead ([[subsystems/icons]])
└── content.config.ts     ✓ collection schemas (Zod + glob loaders)
```

(Astro's ambient types are the generated `.astro/types.d.ts`, referenced from `tsconfig.json:3` —
there is no `src/env.d.ts` and none is needed since Astro 5.)

## Content-collections layout

Entries live directly under their collection dir — ids are plain slugs since the i18n removal
(`src/content.config.ts:7` documents the `<slug>` id). See [[subsystems/content-collections]].

- `blog` → `src/data/blog/<slug>/index.mdx` (id `"<slug>"`; 6 posts, `heroImage` required —
  `src/content.config.ts:27`).
- `projects` → `src/data/projects/<slug>/index.mdx` (id `"<slug>"`; 6 projects — structured
  spec/feature frontmatter plus a free-form MDX overview body).
- `authors` → `src/data/authors/<slug>/index.md` (1 author `admin`; blog entries `reference("authors")`
  by slug — `src/content.config.ts:22`).
- `otherPages` (target) → `src/data/otherPages/<slug>/` — same shape as blog.
- `codeToggles` (target) → `src/data/codeToggles/<language>/` — keyed by programming language.

## Top-level (outside `src/`)

- `public/` — static, **non-optimized** assets only (favicons, `robots.txt`, raw `scripts/`). Final
  assets only; everything optimizable goes in `src/assets/`.
- `scripts/` — repo tooling. astro-boiler has exactly one: the `test.mjs` discovery runner ✓. The
  one-shot removal scripts (`config-i18n`, `remove-keystatic`, `remove-i18n`) ran on 2026-07-17 and
  retired themselves; their graveyard and the orphaned `utils/` plumbing were deleted on 2026-07-21
  (`592dff5` has all of it). A one-shot script is deleted once it has run — git is the graveyard.
  See [[subsystems/scripts]].
- `.claude/rules/` — the enforced house style ([[code-quality]]).
- `wiki/` — this knowledge base.

## Why this shape

The split is by **role, not by feature**: routing (`pages/`) stays thin — it owns `BaseLayout` + SEO
and delegates markup to `components/Sections/` ([[concepts/page-composition]]), and prerenders to
static HTML everywhere except the single SSR `/contact/` route (`@astrojs/node` standalone adapter, so
the build splits into `dist/client/` + `dist/server/`); data and behavior live in typed `config/`
([[concepts/config-driven]]); cross-cutting logic lives in `js/` so a route never hand-rolls date or
mapping math. Growing the template means filling these slots, never inventing new top-level roles.

Main threads: [[naming-conventions]] · [[code-quality]] · [[overview]] ·
[[subsystems/content-collections]] · [[subsystems/scripts]]
