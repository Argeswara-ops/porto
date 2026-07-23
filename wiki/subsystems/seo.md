---
title: Technical SEO
type: subsystem
created: 2026-07-01
updated: 2026-07-23
tags: [seo, structured-data, json-ld, sitemap, robots, hreflang, open-graph]
sources:
  - src/layouts/BaseHead.astro
  - src/js/schema.ts
  - src/js/rss.ts
  - src/pages/rss.xml.ts
  - src/pages/blog/[slug].astro
  - src/pages/robots.txt.ts
  - src/pages/llms.txt.ts
  - astro.config.mjs
  - src/config/types/configDataTypes.ts
status: stable
---

# Technical SEO

The template's SEO surface is **owned, not vendored** — every tag is native and every artifact is
generated from typed config, with no SEO/robots/schema package (the same stance as the
[[subsystems/motion|motion]] catalog). Distilled from [[sources/astro-seo-devto]] and enforced by
`.claude/rules/seo.md`. The `<head>` mechanics (theme, view transitions, the shell) live in
[[subsystems/layouts-seo]]; this page is the SEO layer that rides on top.

## Structured data — `src/js/schema.ts`

Dependency-free JSON-LD builders. Each returns a plain `JsonLdNode` (`schema.ts:19`) — inputs are
typed precisely, node shape stays loose because schema.org is open-ended. The builders:
`getOrganizationSchema` (`schema.ts:71`), `getWebSiteSchema` (`schema.ts:98`), `getSiteSchema`
(`schema.ts:136`, composes the two into the site-level graph, linked by `@id`), `getArticleSchema`
(`schema.ts:174`, emits `BlogPosting`), `getBreadcrumbSchema` (`schema.ts:218`), and `serializeJsonLd`
(`schema.ts:236`). Stable `@id`s (`organizationId`, `schema.ts:49`) let nodes cross-reference inside a
`@graph`, so WebSite/Article point at the Organization by `@id` rather than duplicating it.

`BaseHead` emits a **site-level graph on every page** — it imports only `getSiteSchema`
(`BaseHead.astro:10`) and delegates the Organization + WebSite wiring to a single `getSiteSchema({…})`
call built from `siteData` (`BaseHead.astro:35-43`) — then merges any page-specific nodes passed via the
`schema` prop and serializes once into a single `<script type="application/ld+json" is:inline>`
(`BaseHead.astro:100`).

> [!note] `serializeJsonLd` escapes `<` → `<` (`schema.ts:242`) so a value containing `</script>`
> can't break out of the inline tag. A single node inlines directly; multiple nodes wrap in `@graph`.
> The logic carries a runnable self-check: `pnpm test` (or directly: `node --experimental-strip-types src/js/schema.test.ts`).

Page authors don't hand-write JSON-LD — they call a builder and pass the result:
`<BaseLayout schema={[getArticleSchema(…), getBreadcrumbSchema(…)]} article={{ published, … }}>`.
`sameAs` (social/profile URLs) feeds the Organization and is a typed, optional field on `SiteDataProps`
(`src/config/types/configDataTypes.ts`).

## Metadata, OG & Twitter — `BaseHead.astro`

`BaseHead` owns the whole `<head>` with native tags. Canonical and `og:url` both derive from one
`new URL(Astro.url.pathname, Astro.site)` (`BaseHead.astro:23`) so they can't disagree. The social
image resolves to an absolute URL with a `siteData.defaultImage` fallback (`BaseHead.astro:24`), and
OG carries `og:image:width/height/alt` — real dims from a bundled `ImageMetadata`, else the 1200×630
convention. `og:locale` is normalized to `language_TERRITORY` from the `siteLocale` constant
(`en-US` → `en_US`, `BaseHead.astro:31`). An optional `article` prop flips `og:type` to `article`
(`BaseHead.astro:68`) and emits `article:published_time` / `…:modified_time` / `…:author`
(`BaseHead.astro:82-86`). `noindex` still gates the robots meta.

**No hreflang is emitted** — the block (and its `og:locale:alternate` siblings) left with the i18n
removal on 2026-07-18; hreflang is only meaningful with 2+ locales. See [[subsystems/i18n]] for the
re-add path.

## Crawlability & indexation

- **Sitemap** — `@astrojs/sitemap` emits `/sitemap-index.xml` (linked in `BaseHead`). A `filter`
  (`astro.config.mjs:60`) drops `noindex` routes (the dev-only `/examples` catalog and 404s), so the
  sitemap never contradicts a page's `noindex`. The on-demand `/contact/` route emits no static file,
  so it is added by hand via the sitemap's `customPages`.
- **robots.txt** — a **dynamic endpoint** (`src/pages/robots.txt.ts`), not a `/public` file, so the
  `Sitemap:` line resolves against `site` and never drifts. Allows everything since the Keystatic
  removal dropped the `/keystatic` Disallow (`robots.txt.ts:9`). Prerenders to a static `/robots.txt`.
- **llms.txt** — a dynamic endpoint (`src/pages/llms.txt.ts`) emitting a small markdown content map for
  AI crawlers (llmstxt.org) from `siteData` + `site`. A curated map, not an auto-sitemap; not a ranking
  factor. Marked `ponytail:` to expand as the site grows.
- **Trailing slashes** — one URL shape, now enforced by config: `trailingSlash: "always"`
  (`astro.config.mjs:50`), agreeing with the directory build, canonical, and OG. It had been loosened
  to `"ignore"` only because `"always"` 404'd Keystatic's extensionless API calls;
  [[subsystems/keystatic-cms|removing Keystatic]] (2026-07-17) allowed tightening it back.

## Content pages — the live blog route

The blog route ships (`/blog/` + `/blog/<slug>/`) over the `blog` + `authors`
([[subsystems/content-collections]]) collections, and the SEO pieces that ride with it are built:

- **RSS** — a dependency-free `src/pages/rss.xml.ts` maps the `blog` collection to escaped RSS 2.0 via
  the `@js/rss` renderer (pure + self-checked by `src/js/rss.test.ts`); linked from the footer,
  `BaseHead`, and `llms.txt`. Single feed now that the site is single-language.
- **Article + breadcrumb schema** — the post page (`blog/[slug].astro`) passes `getArticleSchema` (a
  `BlogPosting` keyed `${url}#article`, with a `publisher` reference to the site Organization and
  `author.url` from the author's `authorLink`) **and** `getBreadcrumbSchema`, the latter paired with a
  **visible** breadcrumb in `BlogArticle` (`Home › Blog › <title>`) so markup and schema agree.
  `dateModified` is emitted only when the post carries an `updatedDate`, never invented.
- **`heroImage` is required** on blog posts (`content.config.ts`), so every post has an OG image. See
  `.claude/rules/seo.md`.

## Consumers & the flow

Every page rendering through [[subsystems/layouts-seo|BaseLayout]] gets the Organization + WebSite graph
and the full meta/OG set for free; content pages add their own nodes via `schema`. The `site` value in
`astro.config.mjs` (the `SITE_URL` env var, still defaulting to the `https://example.com` placeholder)
feeds **all** of it — canonical, OG, sitemap, robots, llms — so setting it once before deploy fixes
every absolute URL at once.
