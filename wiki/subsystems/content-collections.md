---
title: Content collections
type: subsystem
created: 2026-06-30
updated: 2026-07-23
tags: [content, zod]
sources:
  - src/content.config.ts
  - src/data/
status: stable
---

# Content collections

How structured content (blog posts, projects, authors) is stored and typed.

## Schemas

`src/content.config.ts` defines three collections via Astro's `glob` loader + Zod. All three glob
`**/[^_]*{md,mdx}` over their `./src/data/<collection>` base (`content.config.ts:16,46,69`), so files
prefixed with `_` are ignored:

- **`blog`** (`content.config.ts:15`) — `title`, `description`, `authors` (an array of
  `reference("authors")`, **at least one required** via `.min(1)`, `content.config.ts:22`), `pubDate`
  (**`z.coerce.date()`** — it runs `new Date(value)` then rejects an Invalid Date at build,
  `content.config.ts:24`), optional `updatedDate` (same coercion; drives `article:modified_time` only
  when present), a **required** `heroImage` (`image()`) + `heroImageAlt`, `category` (the retro tag —
  Quest / Lore / Tech / Guide / Dev Log), `tags` (defaulting to `[]`), and optional `draft`. The post
  **body is free-form MDX** — headings, lists, code — rendered via `render()` and styled by
  `.blog-prose`; the frontmatter carries only what the layout slots (byline, category, tags, hero).
- **`projects`** (`content.config.ts:45`) — `title`, optional `cardTitle`, `description`, `tagline`,
  `status` (enum `complete` | `in-progress`), `moduleId`, `order` (listing sort key), `thumbnail`
  (`image()`) + `thumbnailAlt`, `tech` (string tags), and the structured detail slots: `specs`
  (`{ label, value }[]`), `features` (`{ lead, text }[]`), `archCaption`, and the `challenge` /
  `solution` pairs (`{ title, body }`), plus optional `draft`. The "Project Overview" prose is the MDX
  **body**; everything the detail page lays out in fixed slots is structured frontmatter, so it
  validates and renders without parsing prose.
- **`authors`** (`content.config.ts:68`) — `name`, optional `avatar` (`image()`), and `authorLink`
  (the author's public URL — it becomes the JSON-LD Article `author.url`). _(The old `about` and
  `email` author fields were removed in cleanup.)_

The blog `authors` field references the authors collection, so referenced author slugs must exist or
the build fails — that's the feature (bad data fails the build).

## Storage

Entries sit directly under their collection dir — ids are plain slugs since the i18n removal
(2026-07-18, [[subsystems/i18n]]) flattened the former `blog/<locale>/` nesting:

```
src/data/blog/<slug>/index.mdx      → entry id "<slug>"
src/data/projects/<slug>/index.mdx  → entry id "<slug>"
src/data/authors/<slug>.md          → entry id "<slug>"   (e.g. admin.md → "admin")
```

The collections are **populated**: 6 blog posts, 6 projects, and one author (`admin`) ship in the
theme, and `/blog/` is a **live route** (`src/pages/blog/index.astro` listing + `blog/[slug].astro`
articles, with an RSS feed at `src/pages/rss.xml.ts`). The listing and card mapping run through the
data utilities in `src/js/` (`blogData.ts` / `postCards.ts`, `projectData.ts` / `projectCards.ts`). If
i18n returns, per-locale sub-folders (`blog/<locale>/<slug>/` → `"<locale>/<slug>"` ids) plus a
language filter is the old, working shape — git history has it.

## mdx rendering

The glob pattern accepts both `.md` and `.mdx`; rendering `.mdx` needs the `@astrojs/mdx` integration,
which is installed (`astro.config.mjs:58`). It arrived with the Keystatic setup and was **deliberately
kept** when the CMS was removed (2026-07-17) — and it now earns its place: every blog post and project
entry is `.mdx`, its free-form body rendered via `render()` → `<Content />` (MDX renders content, not
the CMS) ([[subsystems/keystatic-cms]]).

## Relationship to a CMS

These collections are the Astro-side schema and, since the Keystatic removal, the only one — content
is authored as files. Any future CMS re-added over these directories must mirror the Zod schemas
(change one, change the other) — that mirror was the CMS's maintenance cost the first time around
([[concepts/config-driven]]).
