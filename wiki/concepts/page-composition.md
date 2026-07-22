---
title: Page composition & routing
type: concept
created: 2026-07-01
updated: 2026-07-21
tags: [routing, pages, sections, composition, seo]
sources:
  - src/pages/index.astro
  - src/pages/404.astro
  - src/pages/privacy.astro
  - src/pages/terms.astro
  - src/pages/examples/[catalog].astro
  - src/components/Sections/README.md
  - src/components/Cards/README.md
  - src/components/Sections/Home/Hero.astro
  - src/components/Sections/Legal/LegalArticle.astro
  - src/components/Sections/NotFound/NotFound.astro
  - src/components/Sections/NotFound/NotFoundIllustration.astro
status: active
---

# Page composition & routing

How a real page is built in this template. The rule is a three-tier split — **thin route → sections →
sub-parts/cards** — so routes own only route concerns and content blocks stay reusable. The contract is
stated in `src/components/Sections/README.md` (and `Cards/README.md`); this page explains how the live
pages follow it.

> [!note] Restructured 2026-07-18. Previously each page delegated *everything* (including `BaseLayout`)
> to a `src/components/<Name>/<Name>.astro` page component. Now the **route owns `BaseLayout` + SEO**
> and composes **layout-free sections** from `src/components/Sections/` — the shape the dev-only
> catalog route already had, made uniform.

## The three tiers

1. **The route** (`src/pages/**`) owns the route concerns: `BaseLayout` with a real `title` +
   `description` (and `noindex`, `schema`, prod-gating where relevant), plus any data lookup the SEO
   tags need. It composes one or more sections and holds no markup of its own.
2. **Sections** (`src/components/Sections/<Page>/<Name>.astro`) are layout-free content blocks — a
   hero, a legal article, the 404 content. Page-specific sections live under their page's folder
   (`Home/`, `Legal/`, `NotFound/`, `UiCatalog/`); a section used by 2+ pages moves to
   `Sections/Global/`. A section never imports `BaseLayout`.
3. **Sub-parts and cards** — siblings in the section's folder for anything independently swappable
   (`NotFound/NotFoundIllustration.astro`, imported relatively), and `src/components/Cards/` for
   content-aware card compositions built on the [[subsystems/ui-primitives|`ui/card` primitives]]
   (empty on purpose until the first card lands).

## The exemplars in the repo

**Home** — `src/pages/index.astro` imports `siteData` for `<BaseLayout title description>` and
renders `Sections/Home/Hero.astro`, which imports `siteData` itself (`Hero.astro:4`) for the brand
name; the hero copy is inline in the section.

**Legal (props-in variant)** — `src/pages/privacy.astro` and `terms.astro` each pick their
`legalData` record (`privacy.astro:9`), use it for the SEO tags, **and pass it down** as a typed
prop: `<LegalArticle page={page} />`. `Sections/Legal/LegalArticle.astro` types the prop as
`LegalPageProps` (`LegalArticle.astro:12-14`) and just renders — one section serves both documents,
and nothing is read twice. This is the "data flows in from the route" side of the section contract;
Hero is the "section reads config itself" side. Pick one per datum, never both.

**404** — `src/pages/404.astro` owns the `noindex` `BaseLayout` **and the page copy**: the
title/description constants feed the meta tags and flow down as props
(`<NotFound title description />`), so the visible text and the SEO tags can't drift.
`Sections/NotFound/NotFound.astro` renders them and reuses the
[[subsystems/ui-primitives|Button primitive]] for the "back home" link. Its artwork is the sibling
sub-part `NotFoundIllustration.astro` — the fullest example of all three tiers.

**UiCatalog** — `src/pages/examples/[catalog].astro` is the dev-only catalog route: `getStaticPaths`
emits **no paths in a prod build** (`[catalog].astro:11-13`), so no HTML ships to production while
`astro dev` still serves `/examples/ui/`; markup lives in `Sections/UiCatalog/` (nine catalog section
files composed by `UiCatalog.astro` via relative imports).

## The illustration sub-part — theming an SVG with tokens

`NotFoundIllustration.astro` is a swappable sub-part (replace the one file to change the artwork) and a
small reusable pattern in its own right: its brand fills are `fill="currentColor"`
(`NotFoundIllustration.astro:29, 37, 183`) driven by `text-primary` on the root `<svg>` (`:17`), so the
illustration follows the [[subsystems/styling-tokens|primary token]] and themes in light **and** dark for
free — no per-color CSS, no dark-mode variant. It types props as `HTMLAttributes<"svg">` and spreads the
rest (`:9-10`), matching the primitive house style, and is decorative (`aria-hidden`) because the page
`<h1>` carries the accessible message. Decorative entrance motion (`animate-fade-in-up`) is gated on
`siteSettings.useAnimations` with `motion-reduce:animate-none` (`NotFound.astro:23-28`) — see
[[subsystems/motion]].

> [!warning] SVG `<defs>` IDs are document-global. The gradient/clip IDs were renamed from the
> Figma-exported `paint*_linear_3679_1556` to semantic `notfound-grad-0..3` / `notfound-clip`
> (`NotFoundIllustration.astro:186-234`) precisely so a second instance on the same page can't resolve its
> `url(#…)` references against the first instance's defs. Keep IDs feature-scoped when porting other
> exported SVGs.

## History: the single-locale collapse

Until 2026-07-17 every route had a `/fr/` mirror rendering the same shared component (the reason the
old "component owns BaseLayout" shape existed). `remove-i18n` collapsed the project to `en`
([[subsystems/i18n]]); the shared-component indirection for locales became moot, which is what made
the 2026-07-18 restructure natural. The same day, the rest of the i18n machinery followed: the Home
hero's language switcher (one self-link after the collapse), then the whole helper layer
(`useTranslations`/`getTranslatedData`/`getLocalizedRoute` and the registries) — sections now import
config directly or take props, as above. Git history (`592dff5` has the fr trees) is the
reference if locales return.

## When this grows

Sections that get shared (a real Header/Footer, a repeated CTA) go to `Sections/Global/`; repeated
content-shaped markup becomes a card in `Cards/`. Follows the
[[concepts/lazy-senior-ethos|lazy-senior ethos]]: the route is the smallest thing that can be a route.

Related: [[subsystems/layouts-seo]] · [[subsystems/i18n]] · [[ideal-template/architecture]] ·
[[ideal-template/naming-conventions]]
