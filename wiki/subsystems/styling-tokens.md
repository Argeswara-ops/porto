---
title: Styling & token architecture
type: subsystem
created: 2026-06-30
updated: 2026-07-23
tags: [tailwind, css, theming, dark-mode]
sources:
  - src/styles/global.css
  - src/styles/tailwind-theme.css
  - src/styles/fonts.css
status: stable
---

# Styling & token architecture

Tailwind CSS v4 is **CSS-first** (config lives in CSS, not a JS config file). This template builds a
three-layer token system on top of it so a rebrand is a few edits and dark mode can't drift. The
cardinal rule: **markup uses tokens** (`bg-primary`, `text-foreground`, `text-base-700`), never raw
Tailwind colors (`bg-violet-700`, `text-zinc-300`), which bypass theming and dark mode.

## The two files

`src/styles/global.css` is the single CSS entry point, imported once in `BaseLayout`
([[subsystems/layouts-seo]]). `src/styles/tailwind-theme.css` is kept separate so it can _also_ be
imported into a `.astro` `<style>` block. Together they implement three layers:

1. **Brand palette ramps** — `@theme` in `tailwind-theme.css:15` defines the brand ramps as **direct
   hex** (`--color-primary-500: #41a6f6`, `--color-base-500: #3f4358`, each ramp `-50`…`-950`). The
   8-BitQuest theme dropped the Tailwind-scale aliasing (`--color-*: var(--color-violet-*)`) the
   skeleton shipped with; repointing these hexes is the entire rebrand.
2. **Semantic runtime vars** — `@layer base` in `global.css:25` defines `:root` and `.dark` sets of
   semantic vars (`--background`, `--foreground`, `--primary`, `--muted`, `--border`, status colors,
   `--radius`, …) that **flip with the theme** (`:root` at `global.css:32`, `.dark` at `:68`).
3. **The bridge** — `@theme inline` in `tailwind-theme.css:137` maps the semantic vars to utility colors
   (`--color-background: var(--background)`). `inline` is required so utilities resolve to the _runtime_
   var, not a frozen value — there's a comment + upstream link explaining why just above it.

So `text-foreground` → `--color-foreground` → `--foreground` → the `:root`/`.dark` value. One utility,
both themes. This three-layer split is the cross-cutting idea; markup never needs to know which layer it
touches.

## Theming an SVG with the token layer

The same discipline extends to illustrations: `NotFound/NotFoundIllustration.astro` sets `text-primary`
on the root `<svg>` and fills its brand shapes with `fill="currentColor"`, so the artwork inherits the
`--primary` semantic var and flips with the theme for free — no per-color CSS and no dark-mode variant.
It's the token rule applied through `currentColor` instead of a `bg-*`/`text-*` utility. See
[[concepts/page-composition]] for the surrounding pattern (and the SVG-`<defs>`-id gotcha).

## Dark mode

Class-based, declared once: `@variant dark (&:where(.dark, .dark *));` (`global.css:13`). The `.dark`
class is toggled on `<html>` **before paint** by an inline script in `BaseHead` that follows the device
`prefers-color-scheme` to avoid a flash of the wrong theme — see [[subsystems/layouts-seo]]. Because
semantic tokens already flip,
`text-foreground` is enough; where you use palette aliases directly, pair them
(`text-base-700 dark:text-base-300`) so they can't drift.

## Shared classes via `@apply`

`global.css` uses `@apply` inside `@layer components`/`utilities` for genuinely cross-cutting classes —
`.h1`/`.h2`/`.h3`, `.description`, `.site-container`, `.primary-focus`,
`.main-text-gradient` (`global.css:118-271`). That's the sanctioned use of `@apply` (a pattern repeated
across many unrelated elements); something with structure/variants should be a component or a
`tailwind-variants` config instead — which is exactly what the [[subsystems/ui-primitives]] library
provides. Those primitives are now the main consumer of these tokens, and the `Input` primitive
replaced the former `.form__input` helper (since removed).

## Layer order, breakpoints, fonts

Layer order is explicit: `@layer theme, base, components, utilities;` (`global.css:23`). Breakpoints
(including a custom `xs: 400px`) and the font families are declared in `@theme`
(`tailwind-theme.css:81-98`). The theme is a **two-face** system: `--font-display` is **Press Start
2P** (the pixel heading face, drives `.h1`–`.h3`) and `--font-sans`/`--font-mono` are both **Space
Mono** (the body/mono face, set on `<html>`), loaded via `fonts.css` (imported at the top of
`global.css:8`).

## Animation tokens

Keyframe/animation tokens are a sibling concern: the Marquee's `--animate-marquee*` +
`@keyframes` live in `tailwind-theme.css:57-80`, and the full owned `animate-*` catalog (a dependency-free
port of tailwind-animations) is split across the `src/styles/motion/` directory — the tokens, modifier
utilities, and the global reduced-motion guard in `motion/index.css`, the raw `@keyframes` in
`motion/keyframes.css` — with the entry imported by `global.css:20`. They use the same Tailwind v4
`@theme` → `--animate-*` mechanism as the color tokens here. See [[subsystems/motion]].
