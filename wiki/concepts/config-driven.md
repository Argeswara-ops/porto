---
title: Config-driven design
type: concept
created: 2026-06-30
updated: 2026-07-18
tags: [config, i18n, architecture]
sources:
  - src/config/siteSettings.json.ts
  - src/config/translationData.json.ts
  - src/config/types/configDataTypes.ts
  - astro.config.mjs
status: stable
---

# Config-driven design

The recurring pattern across the template: **behavior and data come from typed config, never
hard-coded literals in components.** Toggle a feature, add a language, or rebrand by editing
`src/config/` (or the token files), not by hunting through `.astro` files.

## How it shows up

- **Feature flags** — `siteSettings` is declared with `satisfies SiteSettingsProps`
  (`siteSettings.json.ts:33`) so literal types survive (e.g. `useViewTransitions: true` stays `true`,
  not widened to `boolean`). Components gate on it, e.g. `BaseHead` only renders `<ClientRouter />`
  when `siteSettings.useViewTransitions` is true ([[subsystems/layouts-seo]]).
- **`as const` + derived types** — fixed config is `as const` and types are derived from the value
  (`type Locale = (typeof locales)[number]`), so there's no parallel union to keep in sync. This is the
  house TypeScript style.
- **Typed data files** — site content (`siteData`, `legalData`) is typed by interfaces in
  `src/config/types/configDataTypes.ts` and imported directly
  (`import siteData from "@config/siteData.json"`). The helper indirection that used to sit between
  components and these files left with the i18n layer ([[subsystems/i18n]]).

## The cost: things that must stay in sync

Config-driven design moves the source of truth into config, but mirrored facts **must agree** — that
was the project's sharpest footgun class. Both historical instances dissolved with the 2026-07-17
removals ([[subsystems/i18n]], [[subsystems/keystatic-cms]]): `locales` used to live in both
`siteSettings.json.ts` and the `astro.config.mjs` `i18n` block (gone — single locale, no `i18n`
block), and the Keystatic field schemas used to mirror the Zod schemas in `src/content.config.ts`
(gone with the CMS). The mirror returns the moment you re-add a locale or a CMS.

The lesson the codebase encodes stands: when you can't make a single source of truth, write the tool
that keeps the copies aligned (the retired config-i18n script, [[subsystems/scripts]]) rather than
trusting people to remember.
