# Motion & animation — clean-code rules

Grounded in this template's real setup: the owned motion catalog (`src/styles/motion/`), the
Marquee keyframes (`tailwind-theme.css`), the overlay transitions (`ui/_overlay.css`), and view
transitions (`BaseHead.astro`). Lazy-senior ethos applies to motion too: reach for the platform and
the existing catalog before writing a keyframe.

## The catalog (use it — don't add the dependency)

`src/styles/motion/` is a **dependency-free port** of `tailwind-animations`, owned the same way the
Marquee keyframes are (a keyframe set is content, not infrastructure — the template stays vendor-free).
It splits into `index.css` (entry: value tokens, the `--animate-*` shorthands, modifier `@utility`s,
and the reduced-motion guard) and `keyframes.css` (the 87 `@keyframes`); `global.css` imports the entry.
It gives 87 `animate-*` utilities (`animate-fade-in-up`, `animate-zoom-in`, `animate-shake`,
`animate-jelly`, …) plus a full modifier set: `animate-duration-*`, `animate-delay-*`,
`animate-bezier-*`, `animate-iteration-count-*`, `animate-fill-mode-*`, `animate-steps-*`,
`animate-direction-*`, `animate-play-*`, and native scroll-driven helpers `timeline-*` /
`animate-range-*` / `*-timeline-axis-*` / `scroll-/view-timeline-name-*` / `timeline-scope-*`.
**Upstream class names match tailwind-animations.com 1:1**, so its docs apply. On top sits an owned
**scroll-driven extension** (not upstream): keyframes shaped for timeline scrubbing — `animate-progress`
(reading bar, pair `timeline-scroll origin-left`), `animate-parallax-up/down` + `animate-ken-burns`
(pair `timeline-view animate-range-cover`), `animate-fade-through` (in on entry, out on exit), and the
dual-use `animate-wipe-in-*` clip reveals. Clip parallax/zoom frames with **`overflow-clip`, never
`overflow-hidden`** — a hidden box is a scroll container, so `view()` tracks the frame (which never
scrolls) instead of the page and the animation freezes. Scroll-only shapes don't end at identity, so a `@supports`
guard in `motion/index.css` makes them inert where scroll timelines are unsupported (Firefox) — add any
new scroll-only keyframe to that list. See [[subsystems/motion]].

- **Use the catalog utilities**; don't re-install the package and don't hand-roll a keyframe for a
  one-off. If a motion is genuinely reusable and not in the catalog, add it the way the Marquee added
  its keyframes — a `--animate-*` token in `motion/index.css` + its `@keyframes` in `motion/keyframes.css`,
  each inside an `@theme` block (Tailwind resolves the name across blocks and tree-shakes it).
- **Don't redefine Tailwind built-ins.** `animate-pulse` / `animate-spin` / `animate-bounce` / `animate-ping`
  ship with Tailwind (Skeleton uses `animate-pulse`, Spinner `animate-spin`). `motion/index.css` deliberately
  omits `pulse` for this reason.
- **Tune with the modifier utilities, not arbitrary values.** `animate-fade-in-up animate-duration-1000
animate-bezier-back-out`, not `[animation:fade-in-up_1s_...]`. Never interpolate a class name
  (`animate-${x}` is invisible to the compiler) — map whole static classes (see `tailwind.md`).

## Accessibility is non-negotiable

- A **global reduced-motion guard** lives at the bottom of `motion/index.css` (`@media (prefers-reduced-motion:
reduce)`) — it zeroes animation/transition _durations_ site-wide (near-zero, not `none`, so
  `animationend`/`transitionend` still fire) and neutralizes `scroll-behavior: smooth`. It is the single
  global source for reduced-motion resets.
- **The guard cannot stop scroll-driven animations** (they're progressed by scroll position, not time).
  Any element you drive with `timeline-*` **must** also carry `motion-reduce:animate-none` (that's how
  `<Reveal>` degrades to static content). Keep the house discipline of pairing `motion-reduce:` on
  anything you animate directly (`motion-reduce:animate-none` / `motion-reduce:transition-none`) — every
  existing animated primitive does (Marquee, Skeleton, Tooltip, Accordion chevron…).

## Two independent switches — keep them separate

- **`prefers-reduced-motion`** is a _user_ need — always honored, via the guard above. Never gate it behind config.
- **`siteSettings.useAnimations`** is a _brand/design_ choice — the master switch for the **decorative**
  motion layer (scroll-reveal, ambient loops). Gate decorative motion on it (build-time), **not**
  intentional micro-interactions (a dropdown chevron rotating is UX, not decoration). `<Reveal>` follows
  it by default with a per-call `animate` override.

## Prefer the platform (cheapest hydration wins — same as islands)

Reach down this ladder before shipping JS:

1. **Scroll-driven** native animation (`timeline-view` = `animation-timeline: view()`) for reveal-on-scroll
   — zero-JS. `<Reveal>` is the wrapper; raw `animate-* timeline-view animate-range-*` is the escape hatch.
2. **`@starting-style` + `allow-discrete`** for enter/exit of top-layer elements (`<dialog>`, popovers) —
   see `ui/_overlay.css`. Real entry _and_ exit with no JS.
3. **View transitions** (`<ClientRouter>`, gated on `useViewTransitions`) — add `transition:name` to a
   shared element (hero image, card) for near-free morphing across navigations.
4. Only then a **bundled `<script>`**, and only via the shared `_client.ts` `onReady` contract (re-init on
   `astro:after-swap`). No animation libraries, ever.

`<Reveal>` for below-the-fold reveal; a plain `animate-*` (time-based, plays once on load) for
above-the-fold — a scroll-timeline element already in view on load renders mid-progress. The wrapper is a
real box; `display:contents` breaks the timeline.

## The check

Open `/examples/ui` → **Motion** section (dev-only catalog) and eyeball in light **and** dark, with and
without OS "reduce motion". Keyframes emit only when a utility is actually used, so if a class seems
inert, confirm it in the built CSS (`pnpm build` then grep `dist` for the `@keyframes`).

> **"Used" means "appears in a scanned source file", not "rendered by a page."** The catalog demos
> nearly the whole library, and Tailwind scans its `.astro` files even though `/examples/` builds no
> HTML in production — so the catalog's demo classes ship in the one stylesheet every real page
> loads. Measured on this repo (build with `Sections/UiCatalog/` + `pages/examples/` moved aside,
> then restored): the shared `BaseLayout` stylesheet goes **76,413 → 56,695 bytes (−25.8%)**, and
> **70 of the 92 `@keyframes` in the production bundle are referenced by no built page.**
>
> Do **not** "fix" this with `@source not "../components/Sections/UiCatalog"`. It was tried and
> reverted in the theme built from this skeleton: `@source` rules are not build-mode conditional, so
> the same directive strips the demo rules in `astro dev` too and the catalog above — the check this
> section prescribes — silently stops animating. Re-including the directory from a catalog-scoped
> stylesheet does not bring them back either. The real remedy is the buyer's: **delete
> `src/components/Sections/UiCatalog/` and `src/pages/examples/` before launch** (it is in the
> README's deploy checklist), which reclaims the same bytes with nothing to configure.
