---
title: Keystatic CMS (removed)
type: subsystem
created: 2026-06-30
updated: 2026-07-21
tags: [cms, keystatic, removed, history]
sources:
  - astro.config.mjs
  - src/pages/robots.txt.ts
status: stable
---

# Keystatic CMS — removed 2026-07-17

The optional Git-based CMS that used to sit over the [[subsystems/content-collections|content
collections]] was **torn out** by running `pnpm remove-keystatic` (commit `56f86ac` "remve"). This
page is the record of that removal; the pre-removal wiring is described in this page's git history.

## What the removal did

Exactly what [[subsystems/scripts|the script]] promised: `keystatic.config.tsx` and
`src/components/KeystaticComponents/` were removed (parked in a graveyard, itself deleted on
2026-07-21 — `592dff5` has both); Keystatic, React,
and the Node adapter left `astro.config.mjs` (the build is fully static again — `mdx()` and
`sitemap()` are the only integrations, `astro.config.mjs:19-22`); the `/keystatic` Disallow left
`src/pages/robots.txt.ts`; the React JSX options left `tsconfig.json`; and the packages were
uninstalled — **keeping `@astrojs/mdx`**, since MDX renders content, not the CMS
([[subsystems/content-collections]]).

## Knock-on effects worth knowing

- **`trailingSlash` is `"always"` again** (`astro.config.mjs:14`). It had been loosened to
  `"ignore"` only because Keystatic's extensionless API calls 404'd under `"always"`; with the CMS
  gone, the strict form returned, and canonical/sitemap agree on it — see
  [[subsystems/seo]].
- The dev-only UI catalog route no longer needs the on-demand 404 guard the Node adapter enabled —
  it's now a `getStaticPaths` that emits no paths in prod (`src/pages/examples/[catalog].astro:11-13`,
  [[concepts/page-composition]]).
- Content authoring is file-based only until a CMS is re-added per project (the intended
  template-growing move, per [[overview]]).

## Re-adding a CMS

Git history is the reference for what the wiring looked like — `git show 592dff5:keystatic.config.tsx`
and `git show 592dff5:src/components/KeystaticComponents/Collections.tsx` show
what the wiring looked like: per-locale blog collections mirroring the Zod schemas, `storage` local
in dev / cloud in prod, and the Node adapter for the server-rendered `/keystatic` admin. Restoring it
means re-adding `@keystatic/core` + `@keystatic/astro` + React + an adapter and re-loosening
`trailingSlash` — or picking a different CMS entirely.
