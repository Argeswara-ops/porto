---
title: SVG icon system
type: subsystem
created: 2026-07-02
updated: 2026-07-23
tags: [icons, svg, ui, figma]
sources:
  - src/components/svg/icons/Icon.astro
  - src/components/svg/icons/icons.ts
  - src/components/svg/icons/index.ts
  - src/components/svg/icons/README.md
  - src/components/svg/pixel-icons/PixelIcon.astro
  - src/components/svg/pixel-icons/pixelIcons.ts
  - src/components/svg/pixel-icons/index.ts
  - src/components/Sections/UiCatalog/IconsCatalog.astro
status: active
---

# SVG icon system

One `<Icon name="…" />` component over one **auto-generated registry** — 571 icons at ~450 KB,
zero new dependencies (`src/components/svg/icons/`). The bulk are **Stratis UI Icons** line icons
(11 category frames imported so far: General, Arrows (partial), Media & Devices, Alerts, Security,
Images, Files, Charts, Development, Communication, Editor); on top sits an 18-mark filled
**Social/brand** set (facebook … bluesky). Both come from Figma Community files — provenance and
the full regeneration pipeline live in the component's own `README.md`.

## The component follows the primitive contract

`Icon.astro` is an astro-boiler primitive in the [[subsystems/ui-primitives]] sense, just housed
under `svg/` instead of `ui/`: it exports its `tv()` config (`export const icon`,
`Icon.astro:14`), extends native `svg` props + variant props (`Icon.astro:11-12`), carries
`data-slot="icon"` (`Icon.astro:30`), and merges the consumer `class`. The ESLint
frontmatter-export allowance covers it explicitly — `eslint.config.mjs:44` globs
`src/components/svg/**/*.astro` alongside `ui/**`.

- **Typed names.** `name` is the generated `IconName` union, so an illegal name fails
  `astro check` and every icon autocompletes.
- **Sizes** `sm`/`md`/`lg`/`xl` map to `size-4…size-8` (default `md`, `Icon.astro:17`); or pass a
  `size-*` class directly.
- **Color is `currentColor`** — recolor with token utilities (`text-primary`, `text-error`), so
  dark mode is free ([[subsystems/styling-tokens]]). Brand marks are filled silhouettes with
  path-knockout negative space, so they theme the same way (one tone, not brand colors).
- **A11y:** decorative by default (`aria-hidden`, `Icon.astro:32`); passing `title` flips it to
  `role="img"` with a `<title>` (`Icon.astro:31,35`).

The barrel (`index.ts`) exports `Icon`, the bare `icon` recipe, `iconNames`, and the
`IconName` type.

## The pixel-icon sibling registry — `<PixelIcon>`

A second, smaller registry sits beside this one: `src/components/svg/pixel-icons/` (`<PixelIcon>` over
`PIXEL_ICONS`, 19 glyphs — socials, brand marks, and tech-stack icons). It renders on real pages (the
home Tech Stack chips via `PixelChip`, the About Skill Tree, the footer socials), so it is **not**
dev-only and **not** redundant with `<Icon>` — the two are a deliberate split:

- `svg/icons` is **stroke-based** on a fixed 24×24 viewBox; `svg/pixel-icons` is **fill-based**
  (`fill="currentColor"` + `shape-rendering="crispEdges"`) with each glyph on its **own native, often
  non-square** viewBox (`PixelIcon.astro:33-36`). Merging would squash the non-square glyphs
  (youtube/email).
- Because the glyphs aren't square, the `size` variant sizes by **height + `w-auto`**
  (`PixelIcon.astro:18-20`) to preserve aspect ratio, where `<Icon>` sizes by `size-*`.

It follows the same primitive contract otherwise: an exported `pixelIcon` recipe,
`data-slot="pixel-icon"`, typed `PixelIconName` names, decorative-by-default a11y (`title` →
`role="img"`). The barrel exports `PixelIcon`, the `pixelIcon` recipe, `pixelIconNames`, and the
`PixelIconName` type (`pixel-icons/index.ts`). The glyphs are hand-ported from a Figma pixel-icon
community set — the source note (file id + attribution) lives in `pixelIcons.ts:1-9`.

## Build-time only — the ponytail ceiling

`icons.ts` maps each name to inner SVG markup; `Icon.astro:36` inlines it with
`<Fragment set:html>`. Everything happens at build — **no icon bytes reach client JS**. The
registry's own `ponytail:` note (README) names the ceiling: importing it from a client `<script>`
would ship all ~450 KB; at that point split to per-file `.svg` imports or a sprite.

## Regeneration

`icons.ts` is auto-generated (`icons.ts:1` — "do not edit by hand") from Figma via the MCP
`get_design_context` per category frame → `manifest.json` → a `generate.mjs`/`clean.mjs` pipeline
that normalizes to `currentColor`, dedupes by content, and asserts on anything unexpected. The
generator lives in the scratchpad that built the set, **not in the repo** — the component
`README.md` is the runbook (including the `BRAND=1` mode for the filled social marks and the
source file's known mislabels). Still to import: Arrows columns 4–5 and the Finance frame.

## The check

The dev-only catalog renders every icon with its name: `/examples/ui` → Icons section
(`src/components/Sections/UiCatalog/IconsCatalog.astro` iterates `iconNames` and shows the live count).

Related: [[subsystems/ui-primitives]] · [[subsystems/styling-tokens]] · [[overview]] ·
[[ideal-template/architecture]]
