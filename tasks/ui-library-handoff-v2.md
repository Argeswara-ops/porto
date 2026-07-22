# Handoff V2 — astro-boiler UI primitives (advanced batch)

Status: built (2026-07-01) · Owner: TBD · Extends `tasks/ui-library-handoff.md` (V1).

> **Built 2026-07-01 — advanced form batch.** Beyond the earlier V2 land (Table, Nav, Marquee),
> the advanced form controls now live in `src/components/ui/` per the contract: **Slider**,
> **InputNumber**, **ToggleCount** (+ Value), **PasswordInput**, **PasswordStrength**, **ComboBox**
> (+ Option), **AdvancedSelect**, and **Searchbox** (+ Item). Slider / Password* follow §1 and §6
> below verbatim; InputNumber and ToggleCount are new (native `type=number` + steppers; a Switch-based
> pricing toggle). ComboBox / AdvancedSelect / Searchbox were the three the V1 catalog deferred as
> "heavy JS" — built on request, native-first (each a small bundled script re-init on
> `astro:after-swap`, `ponytail:` ceiling stated in-file: client-side static options, no remote/grouped
> data). AdvancedSelect is backed by a real hidden `<select>`; Searchbox reuses the Dialog shell.
> `password/strength.ts` has the one runnable check (`strength.test.ts`, passing). `pnpm check` /
> `pnpm lint` / `pnpm build` all clean; `/examples/ui` gained an "Advanced form controls" block.

> **ThemeToggle (§5) now built too — the last Tier-2 item, so this batch is fully landed.** It lives
> at `src/components/ui/theme-toggle/`, reuses the `button` config, and does a CSS-only sun/moon flip
> (no FOUC — `.dark` is set pre-paint). It's the one item that edits existing code: `BaseHead.astro`'s
> **inline** pre-paint script now honors a saved `localStorage("colorTheme")` pick before the device
> default (only auto-follows OS changes while unpinned; kept inline so there's still no flash). The dev
> catalog's ad-hoc `#theme-toggle` button + script were replaced by the real `<ThemeToggle>`. Codified
> in `ui/README.md`, `wiki/subsystems/{ui-primitives,layouts-seo}.md`, and `wiki/log.md`. Nothing here
> is spec-only anymore.

> **What this is.** The build spec for the next batch the template needs: **password fields**
> (show/hide toggle + strength meter), **Table**, **Navs**, **Marquee**, **dark-mode toggle**,
> and **Slider** (range). Same contract, same tokens, same zero-JS-first policy as V1 — read
> `src/components/ui/README.md` (the five-rule contract) and V1's token-translation table before
> writing any of these. Preline is the markup/states reference only
> (https://preline.co/docs/components/); never load `preline.js`.
>
> **Two of these were explicitly out of scope in V1** — **Marquee** and **Strong Password** —
> because they looked JS-heavy. They're promoted here on request, and the approach below keeps
> them inside the ethos: Marquee is **pure CSS**, the strength meter is one small rule-based
> scorer with a stated ceiling. Net new npm dependencies: **zero**. Net new theme tokens: **two
> animation keyframes** for Marquee (justified — V1 only ruled out new _color_ tokens; an
> animation keyframe is a different, necessary kind). The dark-mode toggle is the one item that
> touches existing code (`BaseHead.astro`) — see its section.

Related: `src/components/ui/README.md` (contract), `tasks/ui-library-handoff.md` (V1 + catalog),
`wiki/subsystems/ui-primitives.md`, `wiki/subsystems/styling-tokens.md`.

---

## TL;DR — the batch

| #   | Primitive(s)                             | Preline ref                                    | Tier |        New JS?        | Approach in one line                                                                        |
| :-- | :--------------------------------------- | :--------------------------------------------- | :--: | :-------------------: | :------------------------------------------------------------------------------------------ |
| 1   | **PasswordInput** + **PasswordStrength** | `toggle-password.html`, `strong-password.html` |  2   | yes (2 small scripts) | reuse the `input` config; a button flips `type`; a rule-based scorer drives a segmented bar |
| 2   | **Table** (+ compound parts)             | `tables.html`                                  |  1   |          no           | static `<table>` in an `overflow-x-auto` wrapper; variants for striped/bordered/hover       |
| 3   | **Nav** (+ `NavItem`/`NavLink`)          | `navs.html`                                    |  1   |          no           | static `<nav>`; `aria-current="page"` for active; underline/pills/segment variants          |
| 4   | **Marquee**                              | `marquee.html`                                 |  1*  |        **no**         | pure-CSS keyframe scroll over duplicated content; `motion-reduce` pauses it                 |
| 5   | **ThemeToggle**                          | (no Preline page)                              |  2   |  yes (small script)   | button writes `localStorage.colorTheme` + toggles `.dark`; **icon flip is CSS-only**        |
| 6   | **Slider** (range)                       | `range-slider.html`                            |  2   |       optional        | native `<input type="range">` + `accent-primary`; optional value bubble                     |

\* Marquee needs no per-instance JS but does add two `@keyframes` to the theme (see §4).

Build order (cheapest first, like V1): **Table → Nav → Slider → Marquee → PasswordInput →
PasswordStrength → ThemeToggle**. Tables and Navs are pure static reuse and land in minutes;
ThemeToggle is last because it edits `BaseHead` and wants the most care.

---

## Ground rules (don't re-derive these)

- **Contract:** the five rules in `src/components/ui/README.md`. One folder per primitive
  (`src/components/ui/<name>/<Name>.astro` + `index.ts`); `type Props = HTMLAttributes<tag> &
VariantProps<typeof config>`; export the `tv()` config; **tokens only**; merge `class:
className` through the config and tag the root `data-slot="<name>"`.
- **Reuse before writing** (ladder rung 2). Input-like fields compose `src/components/ui/_field.ts`
  (`fieldBase`, `fieldState`) — PasswordInput **must** reuse them, not restate the field look.
  Anything button-shaped reuses `button` from `button/Button.astro` (PaginationLink already does).
- **Script pattern** (only when native won't do): one bundled `<script>` per component, an
  `initAll()` that queries `[data-slot="…"]`, run once on load **and** re-run on
  `astro:after-swap` (view transitions). Degrade gracefully without JS. `Tabs.astro` is the
  reference implementation — copy its shape.
- **Tokens that exist** (confirmed in `global.css` / `tailwind-theme.css`): `background`,
  `foreground`, `card`, `primary`, `secondary`, `muted`, `accent`, `info`, `success`, `warning`,
  `error` (each with `-foreground`), `border`, `input`, `outline`; palettes `primary-50…950` /
  `base-50…950`; the `--radius-*` scale; the `xs` (400px) breakpoint. `accent-color` utilities
  resolve too — **`accent-primary` works** because `--color-primary` is defined. No raw
  `violet-`/`zinc-`/`red-` in markup.
- **The check:** extend `src/pages/examples/ui.astro` with a "V2" block (dev-only route; 404s in
  prod). After each primitive: `pnpm lint` && `pnpm check` && `pnpm build` clean, then eyeball
  `/examples/ui` in **light and dark** (the page's "Toggle theme" button — soon the real
  `ThemeToggle`). Non-trivial logic (the strength scorer) also leaves one assert-based self-check.

---

## 1. Advanced form — passwords (`PasswordInput` + `PasswordStrength`)

Two primitives, both composing the existing field look. Preline splits these into _Toggle
Password_ and _Strong Password_; we keep them as two small, independent pieces so a project can
use the eye toggle without the meter.

### 1a. `PasswordInput` — show/hide toggle

Reuse the `input` config (rung 2). The component is a relative wrapper holding `<Input>` (with
right padding to clear the button) and an absolutely-positioned toggle `<button type="button">`.
A tiny script flips the field `type` between `password`/`text` and toggles `aria-pressed`; the
two icons (eye / eye-off) swap with a CSS `hidden` toggle the script drives.

```astro
---
// src/components/ui/password/PasswordInput.astro — astro-boiler primitive (see ../README.md).
// Reuses the `input` config; a small script flips type password<->text. Without JS it stays a
// plain, fully-usable password field (the toggle button is simply inert).
import type { HTMLAttributes } from "astro/types";
import { type VariantProps } from "tailwind-variants";

import { input } from "@components/ui/input/Input.astro";

type Props = HTMLAttributes<"input"> & VariantProps<typeof input>;
const { size, state, class: className, ...rest } = Astro.props;
---

<div class="relative" data-slot="password-input">
  <input
    type="password"
    class={input({ size, state, class: ["pr-10", className] })}
    data-slot="password-field"
    {...rest}
  />
  <button
    type="button"
    data-slot="password-toggle"
    aria-pressed="false"
    aria-label="Show password"
    class="text-muted-foreground hover:text-foreground focus-visible:ring-outline/50 absolute inset-y-0 right-0 grid w-10 place-items-center rounded-md outline-none focus-visible:ring-3"
  >
    {/* eye (visible while hidden) + eye-off (visible while shown) — script toggles `hidden` */}
    <svg data-slot="eye" class="size-4" aria-hidden="true"><!-- … --></svg>
    <svg data-slot="eye-off" class="hidden size-4" aria-hidden="true"><!-- … --></svg>
  </button>
</div>

<script>
  function wire(root: HTMLElement) {
    const field = root.querySelector<HTMLInputElement>('[data-slot="password-field"]');
    const btn = root.querySelector<HTMLButtonElement>('[data-slot="password-toggle"]');
    if (!field || !btn) return;
    btn.addEventListener("click", () => {
      const shown = field.type === "text";
      field.type = shown ? "password" : "text";
      btn.setAttribute("aria-pressed", String(!shown));
      btn.setAttribute("aria-label", shown ? "Show password" : "Hide password");
      root.querySelector('[data-slot="eye"]')?.classList.toggle("hidden", !shown);
      root.querySelector('[data-slot="eye-off"]')?.classList.toggle("hidden", shown);
    });
  }
  const init = () =>
    document.querySelectorAll<HTMLElement>('[data-slot="password-input"]').forEach(wire);
  init();
  document.addEventListener("astro:after-swap", init);
</script>
```

a11y: keep `aria-label` accurate per state (above); the icons are `aria-hidden`. Don't animate
the icon swap (no value in it).

### 1b. `PasswordStrength` — strength meter

A segmented bar (4 segments) + a live label, driven by a small **rule-based** scorer. It listens
to its paired field (`for="<input id>"`, mirroring `<label for>`), scores on `input`, and paints
N segments with `success`/`warning`/`error` tokens. The label sits in an `aria-live="polite"`
region so screen readers announce changes.

```ts
// scoring lives in a plain module so it's unit-checkable: src/components/ui/password/strength.ts
export type Strength = 0 | 1 | 2 | 3 | 4; // none … strong
/** ponytail: naive rule-based scorer (length + character-class diversity), NOT entropy.
 *  Ceiling: doesn't catch "Password1!" as weak. Upgrade path: swap in `zxcvbn` per-project
 *  if a build needs real strength estimation — keep this signature so callers don't change. */
export function scorePassword(pw: string): Strength {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4) as Strength;
}
```

```ts
// src/components/ui/password/strength.test.ts — the one runnable check (no framework; `node`/tsx).
import assert from "node:assert/strict";
import { scorePassword } from "./strength";
assert.equal(scorePassword(""), 0);
assert.equal(scorePassword("abc"), 0); // too short, single class
assert.equal(scorePassword("abcdefgh"), 1); // length only
assert.equal(scorePassword("Abcd1234!xyz"), 4); // long + mixed + digit + symbol
console.log("scorePassword ok");
```

The `.astro` renders 4 segment `<div>`s (`bg-muted` empty; script flips filled ones to the
status token via a class map — never an interpolated `bg-${tone}-500`) and a `<p aria-live>` label.
Token map: 1 → `bg-error`, 2 → `bg-warning`, 3 → `bg-warning`, 4 → `bg-success`. Re-init on
`astro:after-swap`. Without JS, render the bar empty and the label as a static hint — no error.

Variant: `size` (sm/md) for bar height only. No `state` variant (the score _is_ the state).

---

## 2. Table (`tables.html`) — Tier 1, static

Compound, all static. Root is an `overflow-x-auto` wrapper around a `w-full` `<table>` so wide
tables scroll on mobile instead of breaking layout (the one non-obvious correctness bit).

Parts: `Table` (wrapper + `<table>`), `TableHeader` (`<thead>`), `TableBody` (`<tbody>`),
`TableFooter` (`<tfoot>`), `TableRow` (`<tr>`), `TableHead` (`<th scope>`), `TableCell` (`<td>`),
`TableCaption` (`<caption>`). One folder, one file per part (compound rule).

```astro
---
// src/components/ui/table/Table.astro — astro-boiler primitive (see ../README.md).
import type { HTMLAttributes } from "astro/types";
import { tv, type VariantProps } from "tailwind-variants";

type Props = HTMLAttributes<"table"> & VariantProps<typeof table>;

export const table = tv({
  base: [
    "w-full caption-bottom text-sm",
    "[&_th]:text-muted-foreground [&_th]:text-left [&_th]:font-medium",
  ],
  variants: {
    variant: {
      default: "[&_tbody_tr]:border-border [&_tbody_tr]:border-b",
      striped: "[&_tbody_tr:nth-child(even)]:bg-muted/40",
      bordered:
        "border-border border [&_td]:border-border [&_th]:border-border [&_td]:border [&_th]:border",
    },
    hover: { true: "[&_tbody_tr:hover]:bg-muted/50" },
    density: {
      comfortable: "[&_td]:p-3 [&_th]:p-3",
      compact: "[&_td]:px-3 [&_td]:py-1.5 [&_th]:px-3 [&_th]:py-1.5",
    },
  },
  defaultVariants: { variant: "default", density: "comfortable" },
});

const { variant, hover, density, class: className, ...rest } = Astro.props;
---

<div class="border-border w-full overflow-x-auto rounded-md border" data-slot="table">
  <table class={table({ variant, hover, density, class: className })} {...rest}><slot /></table>
</div>
```

Parts are thin: each renders its native tag with `data-slot` + merged `class` and a `<slot/>`.
`TableHead` defaults `scope="col"`; let callers pass `scope="row"`. Caption uses
`text-muted-foreground`. No JS — sorting/pagination/data-tables are out of scope (V1 said so).

---

## 3. Nav (`navs.html`) — Tier 1, static

`Nav` (`<nav><ul>`), `NavItem` (`<li>`), `NavLink` (`<a>`). Zero-JS. Active state is the caller's
job via `aria-current="page"`, styled with the `aria-[current=page]:` variant (no "active" prop —
the platform already models it).

```astro
---
// src/components/ui/nav/NavLink.astro — astro-boiler primitive (see ../README.md).
import type { HTMLAttributes } from "astro/types";
import { tv, type VariantProps } from "tailwind-variants";

type Props = HTMLAttributes<"a"> & VariantProps<typeof navLink> & { href: string };

export const navLink = tv({
  base: [
    "text-muted-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors",
    "hover:text-foreground outline-none focus-visible:ring-3 focus-visible:ring-outline/50",
    "aria-[current=page]:text-foreground",
  ],
  variants: {
    variant: {
      underline: "border-b-2 border-transparent px-1 py-2 aria-[current=page]:border-primary",
      pills:
        "rounded-md px-3 py-1.5 hover:bg-muted aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground",
      segment:
        "rounded-md px-3 py-1.5 aria-[current=page]:bg-muted aria-[current=page]:text-foreground",
    },
  },
  defaultVariants: { variant: "underline" },
});

const { variant, href, class: className, ...rest } = Astro.props;
---

<a href={href} class={navLink({ variant, class: className })} data-slot="nav-link" {...rest}
  ><slot /></a
>
```

`Nav` carries `orientation` (`horizontal` → `flex gap-1`, `vertical` → `flex-col`) on the `<ul>`,
and passes `variant` down by convention (caller sets it on each `NavLink`, or `Nav` documents the
intended pairing). Keep it dumb — this is a list of links, not a menu (dropdown is Tier 3 in V1).

---

## 4. Marquee (`marquee.html`) — pure CSS, zero per-instance JS

The one item that adds to the theme. Define the keyframes once in `tailwind-theme.css` `@theme`
(animation tokens, not color — this is the justified exception to V1's "no new tokens"):

```css
/* tailwind-theme.css → @theme { … } */
--animate-marquee: marquee var(--marquee-duration, 30s) linear infinite;
--animate-marquee-vertical: marquee-vertical var(--marquee-duration, 30s) linear infinite;

@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}
@keyframes marquee-vertical {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-50%);
  }
}
```

The component renders the slotted content **twice** (so the `-50%` translate loops seamlessly)
inside a `group` wrapper. `pauseOnHover` pauses via `group-hover:[animation-play-state:paused]`;
`motion-reduce:animate-none` respects reduced-motion (non-negotiable a11y); `reverse` flips
direction with `[animation-direction:reverse]`. `--marquee-duration` is the speed knob (a
`style` override or a `speed` variant mapping to whole values).

```astro
---
// src/components/ui/marquee/Marquee.astro — astro-boiler primitive (see ../README.md).
// Pure CSS infinite scroll. Content is duplicated for a seamless loop; reduced-motion pauses it.
import type { HTMLAttributes } from "astro/types";
import { tv, type VariantProps } from "tailwind-variants";

type Props = HTMLAttributes<"div"> & VariantProps<typeof marquee> & { pauseOnHover?: boolean };

export const marquee = tv({
  base: ["group flex overflow-hidden"],
  variants: {
    direction: { left: "flex-row", right: "flex-row", up: "flex-col", down: "flex-col" },
    speed: {
      slow: "[--marquee-duration:60s]",
      normal: "[--marquee-duration:30s]",
      fast: "[--marquee-duration:15s]",
    },
  },
  defaultVariants: { direction: "left", speed: "normal" },
});

const { direction = "left", speed, pauseOnHover = true, class: className, ...rest } = Astro.props;
const vertical = direction === "up" || direction === "down";
const reverse = direction === "right" || direction === "down";
const track = [
  vertical ? "animate-marquee-vertical flex-col" : "animate-marquee flex-row",
  "flex shrink-0 gap-[var(--marquee-gap,1rem)] motion-reduce:animate-none",
  reverse && "[animation-direction:reverse]",
  pauseOnHover && "group-hover:[animation-play-state:paused]",
];
---

<div class={marquee({ direction, speed, class: className })} data-slot="marquee" {...rest}>
  <div class:list={track} aria-hidden="false"><slot /></div>
  <div class:list={track} aria-hidden="true"><slot /></div>{/* duplicate for seamless loop */}
</div>
```

Note: Astro renders the slot twice fine for static content. The second copy is `aria-hidden`
(it's a visual duplicate). Don't put focusable/interactive content in a marquee.

---

## 5. Dark-mode toggle (`ThemeToggle`) — the one that edits existing code

Today the site **follows the device** only: `BaseHead.astro` sets `.dark` pre-paint from
`prefers-color-scheme`, with no saved override (its own comment invites adding one). Two changes:

**(a) Teach the pre-paint script to honor a saved pick — edit in place, keep it inline.** The
CLAUDE.md gotcha stands: theme is set pre-paint by the **inline** script in `BaseHead`; do **not**
move it to a bundled `<script>` (that reintroduces a flash). Only widen what it reads:

```js
// BaseHead.astro inline script (replace initTheme + the change listener)
function initTheme() {
  const saved = localStorage.getItem("colorTheme"); // "light" | "dark" | null
  const dark = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", dark);
}
initTheme();
// only auto-follow the OS when the user hasn't pinned a choice
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if (!localStorage.getItem("colorTheme")) initTheme();
});
document.addEventListener("astro:after-swap", initTheme);
```

**(b) Add the `ThemeToggle` primitive.** Reuse the `button` config. The **icon flip is CSS-only**
(no FOUC): show a sun in light, a moon in dark via the `dark:` variant — because `.dark` is
already set pre-paint. Only the _click_ needs JS: toggle `.dark`, persist to `localStorage`, and
sync `aria-pressed`.

```astro
---
// src/components/ui/theme-toggle/ThemeToggle.astro — astro-boiler primitive (see ../README.md).
// Manual override on top of BaseHead's device default. Icon flip is CSS-only; the script only
// handles the click (toggle .dark + persist). Pairs with the BaseHead pre-paint change above.
import type { HTMLAttributes } from "astro/types";
import { type VariantProps } from "tailwind-variants";

import { button } from "@components/ui/button/Button.astro";

type Props = HTMLAttributes<"button"> & VariantProps<typeof button>;
const { variant = "ghost", size = "sm", class: className, ...rest } = Astro.props;
---

<button
  type="button"
  data-slot="theme-toggle"
  aria-label="Toggle color theme"
  class={button({ variant, size, class: ["w-10 px-0", className] })}
  {...rest}
>
  <svg class="size-4 dark:hidden" aria-hidden="true"><!-- sun --></svg>
  <svg class="hidden size-4 dark:block" aria-hidden="true"><!-- moon --></svg>
</button>

<script>
  function wire(btn: HTMLElement) {
    const sync = () =>
      btn.setAttribute("aria-pressed", String(document.documentElement.classList.contains("dark")));
    sync();
    btn.addEventListener("click", () => {
      const dark = document.documentElement.classList.toggle("dark");
      localStorage.setItem("colorTheme", dark ? "dark" : "light");
      sync();
    });
  }
  const init = () =>
    document.querySelectorAll<HTMLElement>('[data-slot="theme-toggle"]').forEach(wire);
  init();
  document.addEventListener("astro:after-swap", init);
</script>
```

Once this lands, swap the dev-only `#theme-toggle` button in `examples/ui.astro` for the real
`<ThemeToggle />` (delete the ad-hoc toggle script there — it's superseded).

Note for whoever wires this site-wide: gate it on a `siteSettings` flag only if the project wants
device-only behavior to remain the default elsewhere; the primitive itself is config-free.

---

## 6. Slider (`range-slider.html`) — native range, Tier 2

Native `<input type="range">`. The lazy-correct first rung is one utility: **`accent-primary`**
(themes the track + thumb cross-browser via `accent-color`). That's the whole component for the
common case.

```astro
---
// src/components/ui/slider/Slider.astro — astro-boiler primitive (see ../README.md).
// Native range; `accent-primary` themes it in one utility. No JS for the basic slider.
import type { HTMLAttributes } from "astro/types";
import { tv, type VariantProps } from "tailwind-variants";

type Props = HTMLAttributes<"input"> & VariantProps<typeof slider>;

export const slider = tv({
  base: [
    "accent-primary w-full cursor-pointer appearance-none bg-transparent outline-none",
    "focus-visible:ring-3 focus-visible:ring-outline/50 rounded-md",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  variants: { size: { sm: "h-1", md: "h-2" } },
  defaultVariants: { size: "md" },
});

const { size, class: className, ...rest } = Astro.props;
---

<input type="range" class={slider({ size, class: className })} data-slot="slider" {...rest} />
```

Two **optional** add-ons, each a separate decision (don't build until asked):

- **Custom track/thumb** (if `accent-color` styling isn't enough): arbitrary variants
  `[&::-webkit-slider-thumb]:…` / `[&::-moz-range-thumb]:…` with `bg-primary`, `bg-muted` track.
  `ponytail:` more markup for marginal gain — only if a design needs a thumb `accent-primary`
  can't express.
- **Value bubble**: tiny script mirroring `input.value` into an adjacent `<output>` on `input`
  (re-init on `astro:after-swap`). Keep the slider itself zero-JS; the bubble is the enhancement.

---

## Verification (the check)

Per `.claude/rules` + `CLAUDE.md`, after **each** primitive: `pnpm lint` && `pnpm check` &&
`pnpm build` clean. Then:

1. Extend `src/pages/examples/ui.astro` with a **"Tier 3 / V2"** section rendering each new
   primitive in every variant (Table striped/bordered/hover; Nav underline/pills/segment; Marquee
   left/right + reduced-motion; Slider sizes; PasswordInput + a live PasswordStrength; ThemeToggle).
2. Eyeball `/examples/ui` in **light and dark** — once `ThemeToggle` exists, use it (and delete the
   old ad-hoc toggle). A missing token shows up instantly as an un-themed element.
3. Run the one self-check for the only non-trivial logic: `scorePassword`
   (`strength.test.ts` above) — `pnpm exec tsx src/components/ui/password/strength.test.ts` (or
   `node` after `astro check` compiles it). Everything else is static/declarative and the build
   - eyeball cover it.

## After it's built — codify (mirror V1)

- Add a **Tier 3 (built)** line to `src/components/ui/README.md` listing these, noting Marquee's
  two `@theme` keyframes and the `BaseHead` persistence change (so the next contributor knows the
  toggle isn't purely additive).
- Update `wiki/subsystems/ui-primitives.md` and `wiki/log.md` (the wiki keeps a log).
- Flip this file's status header to **built** with the date, like V1's.

## Out of scope (still)

Sortable/data-tables, multi-handle range, combobox/searchable select, carousel — all still need
heavy JS or a dep and stay deferred per V1. Compositions (Navbar/Sidebar built _from_ `Nav`) live
in `src/components/`, not `ui/`.
