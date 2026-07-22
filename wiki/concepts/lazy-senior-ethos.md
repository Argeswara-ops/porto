---
title: Lazy-senior ethos
type: concept
created: 2026-06-30
updated: 2026-07-21
tags: [philosophy, conventions]
sources:
  - CLAUDE.md
  - .claude/rules/typescript.md
  - .claude/rules/tailwind.md
  - .claude/rules/astro.md
  - .claude/rules/motion.md
  - .claude/rules/seo.md
status: stable
---

# Lazy-senior ethos

The philosophy the whole template is written under, stated in `CLAUDE.md` and the `.claude/rules/`
files: **the best code is the code never written.** "Lazy" means efficient, not careless.

## The ladder

Before writing anything, climb until a rung holds: does it need to exist (YAGNI) → does it already
exist here (reuse the helper) → does the stdlib/platform do it → does an installed dep do it → can it
be one line → only then write the minimum. The ladder runs _after_ you understand the problem, not
instead of it. Deletion over addition; boring over clever; the shortest working diff you actually
understand.

A worked example lives in the [[subsystems/ui-primitives|UI primitives]]: `PaginationLink` reuses the
`Button` primitive's exported `tv()` config rather than defining its own (`PaginationLink.astro:5,17`) —
the "reuse the helper" rung made concrete, so pager links and buttons can't visually drift.

## What it is NOT lazy about

Understanding the problem first, input validation at trust boundaries, error handling that prevents
data loss, security, and accessibility. And one concrete rule that appears throughout the code:

> [!note] The check — non-trivial logic leaves **one runnable check** behind: the smallest thing that
> fails if the logic breaks (an assert-based self-check or a tiny test, no frameworks). In-repo worked
> examples: `src/components/ui/password/strength.test.ts` and `src/js/schema.test.ts`; the
> retired [[subsystems/scripts|removal scripts]] carried theirs the same way (readable in
> `592dff5`). `pnpm test` now **fails when it finds no checks**, so this is enforced, not remembered.

`ponytail:` comments mark deliberate shortcuts and name their ceiling + upgrade path.

## Where the detailed rules live

`CLAUDE.md` imports five rule files (`CLAUDE.md:11-15`) that encode the house style, each grounded in
this repo's real code:

- `.claude/rules/typescript.md` — explicit return types, `as const` + derived types, options-object
  defaults, constrained generics, `satisfies`, narrow over cast, named exports.
- `.claude/rules/tailwind.md` — the [[subsystems/styling-tokens|token architecture]], `tailwind-variants`
  for variants, sanctioned `@apply`, never interpolate class names.
- `.claude/rules/astro.md` — Astro 7 breaking changes, `.astro` component shape, zero-JS-by-default
  islands, content-collection and i18n conventions.
- `.claude/rules/motion.md` — the owned [[subsystems/motion|motion catalog]], the platform-first ladder,
  reduced-motion always honored vs. the `useAnimations` design switch.
- `.claude/rules/seo.md` — the owned `<head>` and JSON-LD builders ([[subsystems/seo|technical SEO]]),
  crawlability endpoints, no SEO dependency.

These plus `CLAUDE.md` are the "claude-starter" half of making an LLM understand the repo; this wiki is
the synthesis half. See [[overview]].
