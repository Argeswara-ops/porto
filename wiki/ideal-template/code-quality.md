---
title: Ideal template — code quality
type: standard
created: 2026-06-30
updated: 2026-07-21
tags: [code-quality, typescript, astro, conventions]
sources:
  - .claude/rules/typescript.md
  - .claude/rules/astro.md
  - .claude/rules/tailwind.md
  - .claude/rules/motion.md
  - .claude/rules/seo.md
  - src/js/schema.ts
  - src/js/textUtils.ts
  - src/config/siteSettings.json.ts
  - src/components/Sections/Home/Hero.astro
  - src/components/Sections/NotFound/NotFound.astro
status: active
---

# Ideal template — code quality

The house style every file must match. Unlike [[architecture]] and [[naming-conventions]], this axis is
**already fully in place**: astro-boiler's `.claude/rules/*` are a verbatim port of the reference
starter's rule files ([[sources/galaxy-main]]), and the existing utils already model the patterns. This page is the synthesis —
the rules plus the in-repo exemplars to copy from. The enforcement lives in the five
`.claude/rules/*` files — `typescript.md`, `astro.md`, `tailwind.md`, `motion.md`, `seo.md`
(imported by `CLAUDE.md:11-15`) — read those for the full list; the highlights and anchors are here.

## `.astro` component shape

- **Named `Props` interface, destructure with defaults.** `BaseHead.astro` models it
  (`interface Props extends SeoProps`, `src/layouts/BaseHead.astro:14`); `Hero.astro` models the
  locale-resolving frontmatter (`src/components/Sections/Home/Hero.astro:7-9`) and
  `LegalArticle.astro` the typed-props section (`Sections/Legal/LegalArticle.astro:14-16`). For UI primitives,
  `interface Props extends HTMLAttributes<"button">, VariantProps<typeof button> {}`, then
  destructure `class: className, ...rest` and spread the rest.
- **Zero JS by default.** A component is static unless it gets a `client:*` directive; reach for the
  cheapest hydration first (`client:visible`/`client:idle` before `client:load`). No `window`/`document`
  in frontmatter — browser code goes in a bundled `<script>`, re-initialized on `astro:after-swap`.
- **Path aliases over relative imports**, ordered by `simple-import-sort`
  (`Sections/NotFound/NotFound.astro:4-7` imports via `@components`/`@config`/`@js`; sibling
  sub-parts import relatively). Use `import type` for type-only modules.

## TypeScript utilities

The `src/js/*.ts` utils are the reference exemplars — match their shape:

- **Explicit return type on every export** — `export function slugify(text: string): string`
  (`src/js/textUtils.ts:7`); every JSON-LD builder returns `JsonLdNode` (`src/js/schema.ts:66`).
- **`as const` + derive the type from the value**, no parallel union —
  `export const siteLang = "en" as const` (`src/config/siteSettings.json.ts:12`).
- **`satisfies` for config** so literal types survive the check —
  `} satisfies SiteSettingsProps` (`src/config/siteSettings.json.ts:23`; the file even comments why).
  See [[concepts/config-driven]].
- **Constrained generics over `any`** where a util spans collections — the rule stands in
  `.claude/rules/typescript.md` (its in-repo exemplar left with the i18n helpers).
- **JSDoc on exported utilities** — one summary line, `@param`/`@returns`, a usage example
  (`src/js/schema.ts:60`, `:91`; `src/js/textUtils.ts:28-32`).
- **`@ts-expect-error <reason>`, never blanket `@ts-ignore`** — it self-heals: the suppression errors
  once the underlying issue is gone. (No live site in `src/` today; the rule is in
  `.claude/rules/typescript.md`.)
- **Avoid `as` casts and non-null `!`** — narrow instead; a cast is acceptable only immediately after
  a validating runtime check.

> [!note] The ESLint relaxations (`no-explicit-any`, `no-unused-vars`, `ban-ts-comment` are **off**) are
> a deliberate _teaching_ allowance because this is a buyer-facing template — **not** the bar for app
> code. In your own code keep `any` out and delete dead symbols. (`.claude/rules/typescript.md`.)

## Tailwind & tokens

Markup uses **token utilities only** (`bg-primary`, `text-foreground`, `text-base-700`) — never raw
`bg-violet-700`/`text-zinc-300`, which bypass theming and dark mode. Variants are defined with
`tailwind-variants` (`tv()`), never hand-threaded class strings or interpolated class names
(`bg-${tone}-500` is invisible to the compiler). Full architecture: [[subsystems/styling-tokens]] and
`.claude/rules/tailwind.md`.

## Content & validation at the boundary

External/content data is validated at the edge with Zod in `src/content.config.ts` (enforced at
`dev`/`build`, so bad frontmatter fails the build — `src/content.config.ts:12-34`). Cross-collection
links use `reference("authors")` with slugs that must exist (`:18`). See
[[subsystems/content-collections]].

## The ethos & the check

All of the above sits under the [[concepts/lazy-senior-ethos|lazy-senior ethos]]: smallest working diff
you actually understand, deletion over addition, climb the reuse ladder before writing. Deliberate
shortcuts get a `ponytail:` comment naming the ceiling. And non-trivial logic leaves **one runnable
check** behind — `src/components/ui/password/strength.test.ts` is the worked example (the retired
removal scripts' `*.test.mjs` were the original ones, readable in `592dff5`).

## Verification

A schema or i18n mistake surfaces at build time, so a clean build is the real check: run `pnpm lint`
then `pnpm build` after non-trivial changes (`package.json` scripts `lint`/`build`).

Main threads: [[architecture]] · [[naming-conventions]] · [[concepts/config-driven]] ·
[[concepts/lazy-senior-ethos]] · [[subsystems/styling-tokens]] · [[overview]]
