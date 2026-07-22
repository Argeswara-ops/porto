---
title: Motion & animation
type: subsystem
created: 2026-07-01
updated: 2026-07-02
tags: [tailwind, css, animation, motion, a11y, accessibility, scroll-driven]
sources:
  - src/styles/motion/index.css
  - src/styles/motion/keyframes.css
  - src/styles/global.css
  - src/components/ui/reveal/Reveal.astro
  - src/styles/tailwind-theme.css
  - src/components/ui/_overlay.css
  - src/config/siteSettings.json.ts
  - src/config/types/configDataTypes.ts
  - src/layouts/BaseHead.astro
status: stable
---

# Motion & animation

The template ships an **owned, dependency-free** motion vocabulary and a set of native-first patterns
for putting it on the page. The through-line matches the rest of the project: prefer the platform,
own it rather than vendor it, and never trade away accessibility. The house rules are in
`.claude/rules/motion.md`; this page is the map.

## The catalog — `src/styles/motion/`

The heart is `src/styles/motion/` — `index.css` (entry: value tokens, `--animate-*` shorthands,
modifier `@utility`s, the guards) plus `keyframes.css` (the raw `@keyframes`): a **CSS port of
`tailwind-animations`** (© midudev, MIT), adapted to the template's conventions and imported once from
`global.css` right after the theme file.
It's owned for the same reason the Marquee keyframes live in `tailwind-theme.css:57-80` rather than in a
package — a keyframe set is _content_, not build infrastructure, and the template stays vendor-free
(the "ours, not vendored" line the [[subsystems/ui-primitives]] README draws at Preline generalizes to
feature libraries). The port is one line to `@import`, tree-shakes to nothing when unused, and keeps the
API identical, so tailwind-animations.com's docs apply 1:1.

It provides 78 time-based `animate-*` utilities across entrances, exits, attention-seekers, transforms, and
continuous loops (`animate-fade-in-up`, `animate-zoom-in`, `animate-shake`, `animate-jelly`, …) — plus the
9-utility scroll-driven extension described below, 87 in all — built on
Tailwind v4's `@theme` `--animate-*` → utility mechanism — the same mechanism the Marquee uses. On top of
the animations sit a full modifier layer, all Tailwind v4 `@utility` functional utilities:
`animate-duration-*`, `animate-delay-*`, `animate-bezier-*` (24 curves), `animate-iteration-count-*`,
`animate-fill-mode-*`, `animate-steps-*`, `animate-direction-*`, `animate-play-*`, and the native
scroll-driven helpers `timeline-*` (`animation-timeline`), `animate-range-*` (`animation-range`),
`scroll-/view-timeline-axis-*`, plus the named-timeline trio `scroll-timeline-name-*` /
`view-timeline-name-*` / `timeline-scope-*` (declare a timeline on one element, hoist it to a common
ancestor, drive an animation on another — e.g. a fixed reading bar tracking an article).

Three deliberate deviations from upstream: `--animate-pulse` is **omitted** (identical to Tailwind's
built-in `animate-pulse`, which Skeleton uses — likewise `animate-spin`/`bounce`/`ping` stay built-ins);
a **reduced-motion guard is added** (the upstream ships none); and an owned **scroll-driven extension**
(end of `keyframes.css`) adds keyframes shaped for timeline _scrubbing_ rather than time: `progress`
(reading bar, `timeline-scroll origin-left`), `parallax-up`/`parallax-down` and `ken-burns`
(`timeline-view animate-range-cover`), `fade-through` (in on viewport entry, out on exit), and the
dual-use `wipe-in-up/down/left/right` clip reveals. Clipping frames for parallax/zoom must use
`overflow-clip`, not `overflow-hidden`: a hidden box is a scroll container, so `view()` resolves to the
frame (which never scrolls) instead of the page scrollport and the animation freezes. The scroll-only shapes end away from identity (a
played-once parallax would leave content offset; fade-through would end invisible), so a
`@supports not (animation-timeline: view())` guard in `index.css` makes them inert where scroll
timelines are unsupported (Firefox) — new scroll-only keyframes must be added to that guard's list.

## Accessibility — the guard and its one blind spot

The bottom of `motion/index.css` holds a single global guard: `@media (prefers-reduced-motion: reduce)` zeroes
animation/transition _durations_ site-wide (near-zero rather than `none`, so `animationend`/`transitionend`
listeners still fire) and forces `scroll-behavior: auto`, neutralizing the unconditional
`scroll-behavior: smooth` on `<html>` (`global.css:89`). This is the single global source for
reduced-motion resets; individual primitives keep their `motion-reduce:` utilities too (Marquee, Skeleton,
Tooltip, the Accordion/Dropdown chevrons…), which is the house discipline.

The guard has one blind spot by nature: **scroll-driven animations are progressed by scroll position, not
time**, so zeroing durations doesn't stop them. Anything driven by `timeline-*` must _also_ carry
`motion-reduce:animate-none` — which is exactly how `<Reveal>` stays accessible.

## Two independent switches

Motion answers to two orthogonal controls, and the split matters:

- **`prefers-reduced-motion`** — a _user_ need. Always honored via the guard above; never gated behind config.
- **`siteSettings.useAnimations`** — a _brand/design_ choice (`configDataTypes.ts` `SiteSettingsProps`,
  set in `siteSettings.json.ts`). The master switch for the **decorative** motion layer (scroll-reveal,
  ambient loops), read at build time. It does **not** govern intentional micro-interactions — a rotating
  dropdown chevron is UX, not decoration. This closes the gap where `astro.md` already told authors to
  gate on `siteSettings.useAnimations` before the flag existed.

## The `<Reveal>` primitive

`src/components/ui/reveal/Reveal.astro` is the reveal-on-scroll wrapper and the one motion
[[subsystems/ui-primitives|primitive]]. It composes the catalog — an entrance `animate-*` driven by the
**native** scroll timeline (`timeline-view` = `animation-timeline: view()`), progress mapped to
`animate-range-*` — so it's **zero-JS**. It follows `siteSettings.useAnimations` by default (off ⇒ plain
pass-through wrapper) with a per-call `animate` prop override, and carries `motion-reduce:animate-none` so
reduced-motion degrades to static content. Ceiling (a `ponytail:` note in the file): native scroll
timelines are Chromium + Safari; where unsupported the animation plays once on load instead of on scroll —
content still ends visible, no JS fallback shipped. Use `<Reveal>` for below-the-fold content; for
above-the-fold prefer a plain time-based `animate-*` (a scroll element already in view renders mid-progress).

## The rest of the subsystem (already in the tree)

Motion isn't only the `motion/` catalog. The subsystem spans four native mechanisms, each proven in the
codebase: the **Marquee** keyframes (`tailwind-theme.css`), the **overlay enter/exit** transitions via
`@starting-style` + `allow-discrete` in `ui/_overlay.css` (Dialog/Sheet), **view transitions** through
`<ClientRouter>` (`BaseHead.astro:170`, gated on `useViewTransitions` — add `transition:name` to a shared
element for near-free morphing), and the shared **`_client.ts`** `onReady` + `astro:after-swap` contract
for the rare scripted case. The rule of thumb (in `motion.md`) is to climb that ladder — scroll-driven →
`@starting-style` → view transitions → a bundled script — before reaching for JS, exactly as the
[[subsystems/ui-primitives]] library treats hydration.

## The check

`/examples/ui` (dev-only) has a **Motion** section rendering every catalog animation (hover a tile to
replay) plus modifier composition and live `<Reveal>` demos — eyeball it in light **and** dark, and with
the OS "reduce motion" setting on. Keyframes emit only when a utility is used, so a seemingly-inert class
is usually just tree-shaken; confirm with `pnpm build` + grep `dist` for the `@keyframes`. Related:
[[subsystems/styling-tokens]] (the token architecture this sits beside), [[subsystems/layouts-seo]] (view
transitions), [[subsystems/ui-primitives]] (the primitive contract `<Reveal>` follows).
