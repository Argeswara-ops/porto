# Technical SEO — clean-code rules

Grounded in this template's real setup: the `<head>` owner (`src/layouts/BaseHead.astro`), the
dependency-free JSON-LD builders (`src/js/schema.ts`), the crawlability endpoints
(`src/pages/robots.txt.ts`, `src/pages/llms.txt.ts`), and `@astrojs/sitemap`. Lazy-senior ethos
applies to SEO too: **the best tag is the one the layout already emits.** Astro solved performance;
metadata, structured data, and crawl clarity are the part that's on you.

## The head is owned, not vendored

`BaseHead` emits every SEO tag with **native tags — no SEO dependency** (the same stance as the
[[motion]] catalog). Don't add `astro-seo`, `astro-robots-txt`, or a schema package; the pieces are
here. One page passes props to `BaseLayout` → `BaseHead`; nothing hard-codes a URL.

- **Every indexable page goes through `BaseLayout`** with a real `title` + `description`. Those are
  the two tags that still move rankings — make them unique per page, pulled from typed config or
  content frontmatter, never a site-wide default.
- **Canonical + `og:url` must agree.** Both derive from `new URL(Astro.url.pathname, Astro.site)` in
  `BaseHead.astro` — don't reconstruct URLs by hand elsewhere.
- **`noindex` is a prop, not a copy-paste tag.** Error/dev pages set `noindex` (the 404 and the
  `examples/ui` catalog do); that flips the `robots` meta. A `noindex` page must **also** be excluded
  from the sitemap — see the `filter` in `astro.config.mjs`.
- **`SITE_URL` must be set** before deploy — `astro.config.mjs` reads
  `process.env.SITE_URL ?? "https://example.com"`, and a **production** deploy throws on the
  placeholder (local builds and deploy previews build freely, so a fresh clone still runs). The gate
  reads each host's own signal — Netlify's `CONTEXT`, Vercel's `VERCEL_ENV`, or `DEPLOY_ENV` that you
  set anywhere else. It feeds canonical, OG, the sitemap, robots.txt and llms.txt: one variable fixes
  all of them. See `.env.example`.

## Structured data — build it with `@js/schema`, never hand-write JSON-LD

`BaseHead` emits an `Organization` + `WebSite` `@graph` on **every** page automatically (from
`siteData`). For page-specific schema, build a node with a `@js/schema` helper and pass it via the
`schema` prop — `BaseHead` merges it into the graph and serializes once.

```astro
---
import { getArticleSchema } from "@js/schema";

const article = getArticleSchema({
  headline,
  description,
  url: canonical,
  datePublished,
  authorName,
  inLanguage,
});
---

<BaseLayout
  title={post.title}
  description={post.description}
  schema={[article]}
  article={{ published, modified, author }}
>
  <!-- article content -->
</BaseLayout>
```

`schema` is always an **array**, even for one node — the prop takes `JsonLdNode[]`, not a
node-or-array union, so `BaseHead` has nothing to normalize. The union saved a call site one pair of
brackets and cost a normalizing ternary on every render; it was removed.

- **Don't inline a raw `<script type="application/ld+json">`.** Use the builders — they set stable
  `@id`s so nodes cross-reference, and `serializeJsonLd` escapes `<` so a value can't break out of the
  tag. New schema type? Add a typed builder (explicit return type, options interface) beside the others.
- **Fill `sameAs`** in each `siteData` file (social/profile URLs) so the Organization is disambiguated.
- **`article` prop drives the article semantics** — `og:type=article` + `article:published_time` /
  `…:modified_time`. Set `dateModified` when content is updated; stale `dateModified` hurts more than
  none.
- **`getBreadcrumbSchema` requires a _visible_ breadcrumb nav — it is not a free win.** Emitting a
  `BreadcrumbList` on a page with no on-screen breadcrumb is markup and schema disagreeing, which is
  the one thing structured data must never do. The builder ships unused **on purpose**: it is the
  schema counterpart to the `src/components/ui/breadcrumb/` primitive, the same way the other 43
  primitives ship unused. Build the nav first, then pass the node — don't reach for the builder
  because it happens to exist. (A dead export with no counterpart is a different matter: an unused
  helper that sits long enough starts getting cited in other files' docs as though it were part of
  the pattern, and then it is load-bearing fiction. Delete those.)
- Validate output in Google's Rich Results Test before shipping a new schema type.

## Crawlability & indexation

- **Sitemap** is `@astrojs/sitemap` → `/sitemap-index.xml` (linked in `BaseHead`). Keep its `filter`
  free of `noindex` routes. It can't enumerate on-demand (SSR) routes — those need a manual entry.
- **robots.txt / llms.txt are dynamic endpoints** (`src/pages/*.txt.ts`), not `/public` files, so their
  absolute URLs resolve against `site` and never drift. Extend robots' `Disallow` for any app-only
  path; curate `llms.txt` as the site grows (it's an editorial content map for AI crawlers, not an
  auto-sitemap — not a ranking factor).
- **One trailing-slash shape.** The directory build, canonical, and OG all emit the trailing-slash
  form — keep them agreeing. The config is `trailingSlash: "always"` (tightened after the Keystatic
  removal — `"ignore"` was only ever needed because `"always"` 404'd Keystatic's extensionless API
  calls; re-loosen it if a CMS with extensionless routes returns).
- **hreflang** — none is emitted: the site is single-language (the i18n layer was removed), and
  hreflang is only meaningful with 2+ locales. Re-adding i18n means re-adding per-locale alternates +
  `x-default` in `BaseHead` (git history has the old block).

## Content pages (blog) — wire these when the blog route lands

The `blog` + `authors` collections and `@astrojs/mdx` are wired, but **no `/blog/` route ships** —
a stated decision, not an oversight, and the README says so in the same words so the two can't
drift. Every project wants its blog shaped differently; the collections are the starting point.
When the route lands, these three come with it (**deliberately not built** until then — YAGNI):

- **RSS**: add a dependency-free endpoint (`src/pages/rss.xml.ts`) that maps the `blog` collection
  to escaped RSS 2.0 — hand-rolled, like everything else in `head`. Link it from `BaseHead`,
  `llms.txt`, and the footer.
- **Article schema + `article` prop** on the post page (pattern above).
- **`heroImage`** is optional in the schema today; make it **required** for a real blog so every post
  has an OG image, and add `og:image:width/height` from the bundled `ImageMetadata` (BaseHead already
  emits real dims when you pass an `image`).

## Images & Core Web Vitals

- Optimize through `astro:assets` (`<Image>`/`<Picture>`), sources in `src/assets` — see [[astro]].
  **Always** set `alt`; **always** ship intrinsic `width`/`height` (kills CLS).
- **Don't lazy-load above-the-fold media.** Hero/LCP image: `loading="eager"`. The variable font is
  already `<link rel="preload">`'d in `BaseHead` for LCP — preload a hero the same way if it's the LCP.
- Keep islands tiny and hydrate late (`client:visible`/`idle`) so INP stays low — [[astro]] islands
  rules. Third-party scripts are where a fast Astro site loses its lead; add them deliberately.

## The check

`pnpm build`, then confirm the artifacts in `dist/` (a fully static build — no adapter, so the tree
is flat, not `dist/client/`): valid JSON-LD in the HTML `<head>` (a `@graph` with matching `@id`s),
`robots.txt` + `llms.txt` with absolute URLs, and `sitemap-0.xml` listing only indexable,
trailing-slash URLs. The JSON-LD builders carry a runnable self-check: `pnpm test` (or directly:
`node --experimental-strip-types src/js/schema.test.ts`).
