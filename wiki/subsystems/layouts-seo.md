---
title: Layouts & SEO
type: subsystem
created: 2026-06-30
updated: 2026-07-23
tags: [layout, seo, view-transitions, theme]
sources:
  - src/layouts/BaseLayout.astro
  - src/layouts/BaseHead.astro
status: stable
---

# Layouts & SEO

The page shell. Two layouts, intentionally chrome-free (no nav/footer) — those are composed per
template.

## BaseLayout

`src/layouts/BaseLayout.astro` is the top-level shell: `<!doctype html>` + `<html lang={siteLang}>`

- `<head>` (delegated to `BaseHead`) + a `<body>` with a single `<slot />` (`BaseLayout.astro:25-39`).
  It imports the one CSS entry point `src/styles/global.css` (`BaseLayout.astro:6`, the only place it's
  imported — see [[subsystems/styling-tokens]]) and sets `lang` from the `siteLang` constant in
  `siteSettings.json.ts` (the i18n helper layer is gone — [[subsystems/i18n]]). Props: `title`,
  `description`, optional `image`/`noindex`, and the SEO pass-throughs `schema`/`article`
  (`BaseLayout.astro:20`) forwarded to `BaseHead` — see [[subsystems/seo]].

## BaseHead

`src/layouts/BaseHead.astro` owns everything in `<head>` using **native tags only** (no SEO dependency).
It carries two concerns:

- **Page-shell bits** (this page) — charset/viewport/generator, two `<link rel="preload">` faces (the
  Press Start 2P pixel headings + the Space Mono body, single-weight woff2) for faster first paint
  (`BaseHead.astro:53-54`), favicons (`BaseHead.astro:57-58`), the sitemap link (`BaseHead.astro:60`),
  and the two gotchas below (pre-paint theme + view transitions).
- **The SEO layer** — title/description/canonical, OG/Twitter, and JSON-LD structured data (no
  hreflang: single-language site since the i18n removal). Large enough to have its own page:
  **[[subsystems/seo]]**. The one fact to keep here: canonical + `og:url` derive from `Astro.site`
  (`BaseHead.astro:23`), so setting `site` in `astro.config.mjs` feeds every absolute URL at once.

### Two deliberate gotchas

> [!warning] Pre-paint theme — the theme is set by an **inline** `<script is:inline>` that toggles
> `.dark` on `<html>` before paint (`BaseHead.astro:103-133`). A saved pick from the **ThemeToggle**
> primitive (`localStorage("colorTheme")`) wins; otherwise it follows the device `prefers-color-scheme`.
> It re-runs on `astro:after-swap` and, while the user hasn't pinned a choice, still updates live on OS
> color-scheme changes. Keep it inline; moving it to a bundled `<script>` reintroduces a flash of the
> wrong theme. The manual control that writes that key is the **ThemeToggle** primitive — see
> [[subsystems/ui-primitives]].

> [!note] View transitions — `<ClientRouter />` renders only when `siteSettings.useViewTransitions`
> is true (`BaseHead.astro:135`), a [[concepts/config-driven|config-driven]] toggle. This pairs with
> `vite.build.assetsInlineLimit: 0` in `astro.config.mjs`, which stops short scripts being inlined so
> they don't break under the router.

## Data this layer reads

`BaseHead` imports `siteData` directly (`BaseHead.astro:7`) and the `siteLocale` constant for
`og:locale`/`inLanguage` (`BaseHead.astro:31`). `siteData`'s shape is typed by `SiteDataProps` in
`src/config/types/configDataTypes.ts` (with an optional `sameAs` for the Organization JSON-LD — see
[[subsystems/seo]]).

## Consumers

Pages wrap their content in `BaseLayout`; how they're structured (thin route → sections) is
[[concepts/page-composition]]. `src/pages/404.astro` is the first route to opt into `noindex`, which
flips on the robots `noindex,nofollow` tag above — an error page shouldn't be indexed. The dev-only
`examples/ui` catalog route also renders through `BaseLayout` with `noindex`.
