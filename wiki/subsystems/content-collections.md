---
title: Content collections
type: subsystem
created: 2026-06-30
updated: 2026-07-18
tags: [content, zod]
sources:
  - src/content.config.ts
  - src/data/
status: stable
---

# Content collections

How structured content (blog posts, authors) is stored and typed.

## Schemas

`src/content.config.ts` defines two collections via Astro's `glob` loader + Zod:

- **`blog`** (`content.config.ts:12`) — `title`, `description`, `authors` (an array of
  `reference("authors")`), `pubDate`/`updatedDate` (string-or-date → `Date`), optional `heroImage`
  (`image().optional()` — optional so example posts need no bundled asset), optional `categories`, and
  optional `draft`. The glob pattern is `**/[^_]*{md,mdx}` over `./src/data/blog`
  (`content.config.ts:13`), so files prefixed with `_` are ignored.
- **`authors`** (`content.config.ts:36`) — `name`, optional `avatar`, `about`, `email`, `authorLink`.

The blog `authors` field references the authors collection, so referenced author slugs must exist or
the build fails — that's the feature (bad data fails the build). (A `mappingKey` comment in the
schema explains pairing posts across locales — only relevant if i18n returns.)

## Storage

Entries sit directly under their collection dir — ids are plain slugs since the i18n removal
(2026-07-18, [[subsystems/i18n]]) flattened the former `blog/<locale>/` nesting:

```
src/data/blog/<slug>/index.md      → entry id "<slug>"
src/data/authors/<slug>/index.md
```

Both dirs are empty today (a `.gitkeep` holds `blog/`). If i18n returns, per-locale sub-folders
(`blog/<locale>/<slug>/` → `"<locale>/<slug>"` ids) plus a language filter is the old, working
shape — git history has it.

## mdx rendering

The glob pattern accepts both `.md` and `.mdx`; rendering `.mdx` requires the `@astrojs/mdx`
integration, which is installed (`astro.config.mjs:20`). It arrived with the Keystatic setup and was
**deliberately kept** when the CMS was removed (2026-07-17) — MDX renders content, not the CMS
([[subsystems/keystatic-cms]]).

## Relationship to a CMS

These collections are the Astro-side schema and, since the Keystatic removal, the only one — content
is authored as files. Any future CMS re-added over these directories must mirror the Zod schemas
(change one, change the other) — that mirror was the CMS's maintenance cost the first time around
([[concepts/config-driven]]).
