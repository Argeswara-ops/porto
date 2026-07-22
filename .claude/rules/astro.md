# Astro 7 — conventions & gotchas

Targets **Astro 7** (June 2026); component patterns grounded in this template's
`.astro` files. Verify version-sensitive items against the upgrade guide:
https://docs.astro.build/en/guides/upgrade-to/v7/

## Astro 7 breaking changes that bite while writing code

- **The Rust compiler is strict about HTML.** Every non-void element needs a closing tag —
  unclosed tags are now a hard error. Invalid nesting is passed through as-is (no auto-correction).
- **Whitespace is stripped JSX-style** (`compressHTML` defaults to `'jsx'`).
  `<span>a</span><em>b</em>` renders as `ab`; insert an explicit space with `{" "}` where you need one.
- **Vite 8** is the bundler — review custom `vite` config/plugins.
- **`src/fetch.ts` is reserved** for advanced routing (now stable). Don't put an unrelated module there.
- **Markdown pipeline changed** (Sätteri default, replacing remark/rehype). If you rely on remark/rehype
  plugins, port them or add `@astrojs/markdown-remark`. _(Re-confirm the processor name on your pinned version.)_
- **`@astrojs/db` removed**; deprecated internal `astro:transitions` APIs removed.
- **Experimental flags graduated** — remove `rustCompiler`, `queuedRendering`, `advancedRouting`,
  `logger` (now top-level); move `cache`/`routeRules` out of the experimental block.

## `.astro` component shape (house style)

- Type props with a named interface, destructure with defaults:
  ```ts
  interface Props {
    type?: "blog" | "general";
    title: string;
    noindex?: boolean;
  }
  const { type = "general", title, noindex = false } = Astro.props as Props;
  ```
- For UI primitives, extend native attributes and the variant props, then spread the rest:
  ```ts
  interface Props extends HTMLAttributes<"button">, VariantProps<typeof button> {}
  const { variant, size, class: className, ...rest } = Astro.props;
  ```
  Pass `class: className` through your `tv()` call so consumer classes merge. Render a dynamic element when
  it makes sense: `const Tag = Astro.props.href ? "a" : "button";` and `<Tag {...rest}><slot /></Tag>`.
- **UI primitives** live in `src/components/ui/` and follow the _astro-boiler primitive contract_ —
  the canonical statement is `src/components/ui/README.md` (five rules: one folder per primitive,
  native+variant props, exported `tv()` config, tokens only, `data-slot` + merged `class`). Read it
  before adding one.
- Use named `<slot name="…" />` for composition.
- Import the global stylesheet at the top of the frontmatter (`import "@/styles/global.css";`). Use **path
  aliases** (`@components/*`, `@config/*`, `@js/*`, `@layouts/*`) over deep relative imports — ESLint's
  `simple-import-sort` will order them (side-effect imports first, then alphabetized).

## Islands & client JS

- Default to **zero JS** — a component is static unless you add a `client:*` directive. Import a framework
  island only when you need interactivity.
- Cheapest hydration first: `client:visible` / `client:idle` over `client:load`; `client:only` only when SSR
  truly can't run it.
- **No browser globals in frontmatter** (`window`, `document`) — that runs at build/SSR. Put browser code in a
  bundled `<script>` with ES imports (not `is:inline` unless you need raw output). Re-init after view
  transitions: `document.addEventListener("astro:after-swap", …)` (the template does this for scroll animations).

## Content collections

- Schema in `src/content.config.ts` via `glob`/`file` loaders + Zod; enforced at `dev`/`build`, so bad
  frontmatter fails the build (that's the feature).
- Read with `getCollection("blog", ({ data }) => data.draft !== true)` to drop drafts; type entries as
  `CollectionEntry<"blog">`. Link collections with `reference("authors")` — referenced slugs must exist; use
  `image()` for optimizable images.

## Config-driven

- Drive feature toggles from typed config, not hard-coded literals — e.g. gate behavior on
  `siteSettings.useAnimations` / `useViewTransitions` rather than sprinkling booleans.
- The site is single-language (the i18n layer was removed): `siteLang`/`siteLocale` in
  `siteSettings.json.ts` are the only locale facts. If you re-add i18n, restore the helper layer +
  the `astro.config.mjs` `i18n` block together (git history / wiki record the old shape).

## Images, routing, transitions

- Optimize via `astro:assets` (`<Image>` / `<Picture>`), sources in `src/assets`; only final, non-optimized
  assets go in `public/`.
- View transitions use `<ClientRouter />`; keep `vite.build.assetsInlineLimit: 0` if small scripts misbehave
  under the router (a known fix). Prefer Astro's built-ins (RSS, sitemap, `getStaticPaths`) before adding an
  integration.
