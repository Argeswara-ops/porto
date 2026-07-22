# Handoff — astro-boiler UI primitives library

Status: Tier 1 + 2 + 3 built (2026-07-01) · Owner: TBD · Created: 2026-06-30

> **Tier 1 done.** Button, Input, Label, Textarea, Badge, Card (Header/Content/Footer), Alert,
> Separator, Skeleton, Avatar live in `src/components/ui/` per the contract. Deps added:
> `tailwind-variants@3` + its peer `tailwind-merge@3`. Contract codified in
> `src/components/ui/README.md` and pointed at from `.claude/rules/astro.md`. Living check +
> regression guard: `/examples/ui` (dev-only, on-demand).
>
> **Tier 2 done (2026-06-30).** Accordion, Tabs, Tooltip, Breadcrumb, Pagination, Progress, Spinner
> live in `src/components/ui/` per the contract — native-first per the interactivity policy:
> Accordion = `<details>` (shared `name` ⇒ exclusive group), Tooltip = CSS-only (`group-hover` /
> `group-focus-within`, inverted `bg-foreground`/`text-background`), and the Accordion chevron rotates
> via the `[&[open]_summary_svg]:rotate-180` arbitrary variant. **Tabs** is the only one with JS: a
> single bundled `<script>` wiring ARIA tabs (roving focus, arrow/Home/End keys, value-matched panels),
> re-init on `astro:after-swap`, degrading to all-panels-visible without it. `PaginationLink` reuses the
> `button` tv config (ladder rung 2: reuse) instead of defining a new one. No new deps, no new tokens.
> `/examples/ui` extended with a Tier 2 block; `pnpm lint` / `pnpm check` / `pnpm build` all clean.
>
> **Tier 3 done (2026-07-01).** Dialog, Sheet, Dropdown, Select, Checkbox, Radio, Switch, Table live
> in `src/components/ui/` per the contract — native-first per the interactivity policy. Dialog/Sheet
> are native modal `<dialog>` sharing one delegated controller (`_dialog.ts`: `data-dialog-open` /
> `data-dialog-close` hooks + backdrop light-dismiss; native Escape; binds once, survives view
> transitions). A **Sheet** is a Dialog pinned to an edge (`side` variant) and reuses Dialog's
> trigger/close (re-exported `SheetTrigger`/`SheetClose`) + the Dialog\* content parts. **Dropdown** is
> the native **Popover API** (`popover="auto"` + `popovertarget`) — top-layer (never clipped), native
> light-dismiss / Escape / focus-return; a small delegated script positions the menu, reflows on
> scroll/resize, adds arrow-key roving, and syncs `aria-expanded` (chevron flip). **Select** reuses the
> shared `_field` look (native `<select>`, size + `state`); **Checkbox/Radio/Switch** are native inputs
> styled `appearance-none` + `peer`/`:checked` (zero-JS); **Table** is static `<table>` styling.
> `/examples/ui` extended with a Tier 3 block; `pnpm lint` / `pnpm check` / `pnpm build` all clean.
> README Tier 3 section added.
>
> **Tier 3 polish (2026-07-01) — ponytails resolved.** The shortcuts left in the first pass are now
> real behavior, in `src/components/ui/_overlay.css`: Dialog fade/scale + Sheet per-side slide entry/exit
> via `@starting-style` + `transition-behavior: allow-discrete` (honoring `prefers-reduced-motion`), the
> `base-950` backdrop scrim, and a modal scroll-lock (`html:has(dialog:modal){overflow:clip}`, no shift —
> the gutter is already reserved). Dropdown was rewritten from `<details>` to the Popover API so the menu
> is top-layer (clipping ceiling gone) and gained full keyboard roving. No new tokens, no new deps.
>
> Next: catalog is at Starwind parity for the core tiers. Optional follow-up — cross-link the README
> from the wiki pages.
>
> **V2 batch spec'd (2026-07-01) → `tasks/ui-library-handoff-v2.md`:** Password fields
> (toggle + strength), Table, Navs, Marquee, dark-mode toggle, Slider. Marquee + Strong Password
> were out of scope here; V2 promotes them within the ethos (Marquee pure-CSS, strength = one
> rule-based scorer). No new deps.

A build spec for astro-boiler's own UI component library — the equivalent of galaxy-main's
`src/components/starwind/`, but authored in-house. Read this top to bottom before writing a component.
Related wiki: `wiki/ideal-template/naming-conventions.md`, `wiki/ideal-template/code-quality.md`,
`wiki/subsystems/styling-tokens.md`.

---

## TL;DR — the decision

- **We define our OWN pattern.** This is non-negotiable: astro-boiler gets its own primitive
  convention — the _astro-boiler primitive contract_ (defined in "Our pattern" below) — that we own,
  name, and codify as a house standard. We are **not** adopting, vendoring, or re-skinning anyone
  else's kit. Starwind/shadcn and Preline are **prior art we learn from**, nothing more.
- **Build our own primitives** at `src/components/ui/` (one PascalCase folder + `index.ts` per
  component). Bespoke: _not_ the Starwind CLI, _not_ the `preline` package.
- **The pattern is informed by, not copied from, the proven shape** (folder / `tv()` config / `index.ts`
  re-export). That shape is industry-standard `tailwind-variants` usage, not Starwind-proprietary — we
  adopt the _idea_, write our own implementation, and the load-bearing fact below makes it ours cleanly:
  **our design tokens already satisfy the contract 1:1**.
- **Preline is the visual/markup reference only** (https://preline.co/docs/components/input.html), for
  the _breadth of states_ (validation, floating labels, input groups, icons) that a minimal primitive
  omits. Translate its classes to our tokens; never copy raw colors; never load `preline.js`.

## Why our own pattern (not a vendored kit)

Owning the pattern is the whole point of a template: it's part of astro-boiler's identity and must bend
to _our_ rules, not an upstream maintainer's. Concretely — full control over the API and markup; no
coupling to a CLI/registry or to `preline.js`; it composes with our tokens, i18n helpers, and
zero-JS-by-default rules out of the box; and we can diverge from both Starwind and Preline whenever our
design calls for it. The cost of "our own" is near zero here precisely because the tokens already line
up, so we get ownership without re-inventing a worse wheel.

- **Only new dependency: `tailwind-variants`** (the house pattern, already assumed by
  `.claude/rules/tailwind.md`). Optionally `tailwind-merge` for a standalone `cn()`. Preline stays out
  of `package.json`.

## Why this split (the recommendation, grounded)

The reason Starwind-pattern primitives can be authored _without_ adapting them is that
`src/styles/tailwind-theme.css` (the `@theme inline` block) **already exposes the exact token utilities
Starwind components reference**:

| Token utility a primitive needs                            | In our theme? | Source                                     |
| :--------------------------------------------------------- | :------------ | :----------------------------------------- |
| `border-input`, `bg-input`                                 | ✓             | `--color-input` → `--input` (`global.css`) |
| `border-outline`, `ring-outline` (focus ring)              | ✓             | `--color-outline` → `--outline`            |
| `text-foreground`, `text-muted-foreground`                 | ✓             | `--foreground` / `--muted-foreground`      |
| `border-border`                                            | ✓             | `--border`                                 |
| `bg-primary` + `text-primary-foreground`                   | ✓             | `--primary` / `--primary-foreground`       |
| `border-error` / `bg-error`, `border-success` (validation) | ✓             | `--error` / `--success` (+ `-foreground`)  |
| `rounded-md`, `rounded-lg` (+ `xs…3xl`)                    | ✓             | `--radius-*` scale                         |

So a Starwind-style component drops in with our tokens unchanged. Preline's own Tailwind-v4 examples are
_also_ semantic-token-based (`bg-layer`, `text-foreground`, `border-primary-focus`), so "translating"
Preline is mostly renaming its token names to ours — only its **validation** styles fall back to raw
`red-500`/teal, which map to our `error`/`success` tokens.

> Net: Starwind gives the skeleton, Preline gives the richer states, our theme supplies the colors. We
> own all three layers, so this is genuinely "our own" library — not a re-skin of either.

## Prerequisites (one-time)

1. `pnpm add tailwind-variants` — required. (galaxy pins `tailwind-variants@^3`, `tailwind-merge@^3`.)
   `tv()` runs `tailwind-merge` internally, so you only need `tailwind-merge` directly if you add a
   standalone `cn()` for merging outside `tv()`.
2. Optional `src/js/cn.ts` (only if components merge classes ad hoc):
   ```ts
   import { type ClassValue, clsx } from "clsx";
   import { twMerge } from "tailwind-merge";
   /** Merge conditional class lists, resolving Tailwind conflicts (last wins). */
   export function cn(...inputs: ClassValue[]): string {
     return twMerge(clsx(inputs));
   }
   ```
   (Needs `clsx` too. For pure `tv()` components you can skip this entirely.)
3. **Folder name: `src/components/ui/`** (decided 2026-06-30). The wiki has been reconciled to match
   (`wiki/ideal-template/naming-conventions.md` + `architecture.md`) and `.claude/rules/tailwind.md` now
   points at `src/components/ui/*`. No code alias change needed — `@components/*` already resolves the
   subfolder (`tsconfig.json:15`).

## Our pattern — the astro-boiler primitive contract

This is the convention we own. Every primitive in `src/components/ui/` MUST follow it; it is the thing
to codify (see "Codify the pattern" below), and it is what makes the library _ours_ rather than a pile
of one-off components. It aligns with `.claude/rules/astro.md` "UI primitives" guidance. Five rules:

1. **One folder per primitive** — `src/components/ui/<name>/<Name>.astro` + `index.ts` (matches
   `wiki/ideal-template/naming-conventions.md`).
2. **Typed props = native + variants** — `type Props = HTMLAttributes<tag> & VariantProps<typeof config>`.
3. **Export the `tv()` config** (named after the component) so consumers can compose/extend it.
4. **Tokens only, never raw colors** — every class resolves to a semantic token (see the translation
   table); this is what keeps dark mode and re-theming free.
5. **Merge consumer overrides** — destructure `class: className`, spread `...rest`, pass
   `class: className` through the config, and tag the root with `data-slot="<name>"` for styling hooks.

The shape:

```
src/components/ui/<name>/
├── <Name>.astro      # the component + its exported tv() config
└── index.ts          # re-exports: { <Name>, <Name>Variants } and default
```

```astro
---
// src/components/ui/<name>/<Name>.astro
import type { HTMLAttributes } from "astro/types";
import { tv, type VariantProps } from "tailwind-variants";

type Props = HTMLAttributes<"input"> & VariantProps<typeof field>;

export const field = tv({
  base: ["...layout + typography, token utilities only..."],
  variants: { size: { sm: "...", md: "...", lg: "..." } },
  defaultVariants: { size: "md" },
});

const { size, class: className, ...rest } = Astro.props;
---

<input class={field({ size, class: className })} data-slot="field" {...rest} />
```

```ts
// index.ts
import Field, { field } from "./Field.astro";
const FieldVariants = { field };
export { Field, FieldVariants };
export default Field;
```

## Token translation — Preline → ours

When you lift markup from a Preline example, run it through this map. **Never ship a raw `*-500`/`zinc-`
color** — that bypasses theming + dark mode (`.claude/rules/tailwind.md`).

| Preline class                                                         | Use instead                                                |
| :-------------------------------------------------------------------- | :--------------------------------------------------------- |
| `border-gray-200`, `border-layer-line`                                | `border-input` (form fields) / `border-border` (dividers)  |
| `bg-white`, `bg-layer`                                                | `bg-input` or `bg-transparent` (we layer on `background`)  |
| `text-gray-800`, `text-foreground`                                    | `text-foreground`                                          |
| `text-gray-500`, `text-muted-foreground-1`, `placeholder:text-gray-*` | `text-muted-foreground`                                    |
| `focus:border-blue-500`, `border-primary-focus`                       | `focus-visible:border-outline`                             |
| `focus:ring-blue-500`                                                 | `focus-visible:ring-outline/50` (+ `focus-visible:ring-3`) |
| `border-red-500`, `focus:ring-red-500`, `text-red-600`                | `border-error` / `ring-error/50` / `text-error`            |
| `border-teal-500`, `text-teal-600`                                    | `border-success` / `text-success`                          |
| `rounded-lg`                                                          | `rounded-md` or `rounded-lg` (our `--radius` scale)        |
| `disabled:opacity-50 disabled:pointer-events-none`                    | keep — already token-agnostic                              |

Also prefer the existing helper class `.form__input` (`global.css`) and `.primary-focus` as prior art —
the new `Input` primitive should supersede `.form__input`; align their look, then migrate callers.

## Interactivity policy (this is where Preline-as-dependency is a trap)

Preline's interactive components (dropdown, modal, tabs, accordion, select, tooltip, floating-label JS)
depend on `preline.js`. We do **not** load it. Instead, cheapest-first per `.claude/rules/astro.md`:

- **Zero-JS / native HTML** wherever possible: `<details>/<summary>` for accordion, `<dialog>` for
  modal, the Popover API for dropdowns/tooltips, `:has()`/`peer` for floating labels & validation
  display. Most static primitives need no JS at all.
- **Tiny bundled `<script>`** only when native won't do — ES module, re-initialised on view transitions
  via `document.addEventListener("astro:after-swap", …)`. No `is:inline`, no global plugin.

## Worked example — Input + Label (the page you linked)

Starwind's `Input` is size-only; Preline's Input page is mostly about **validation + label/helper
layout**. Combine them: keep the Starwind base, add a `state` variant for validation (our `error`/
`success` tokens), and document the field composition. `disabled`/`readonly` stay native attributes — no
variant needed.

Variant matrix: `size` = sm | md | lg · `state` = default | error | success. (× native `disabled`,
`readonly`, `required`.)

```astro
---
// src/components/ui/input/Input.astro
import type { HTMLAttributes } from "astro/types";
import { tv, type VariantProps } from "tailwind-variants";

type Props = HTMLAttributes<"input"> & VariantProps<typeof input>;

export const input = tv({
  base: [
    "text-foreground placeholder:text-muted-foreground w-full rounded-md border bg-transparent shadow-xs",
    "transition-[color,box-shadow] outline-none",
    "focus-visible:ring-3",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "peer", // enables peer-* on a following label/message (floating label, validation)
  ],
  variants: {
    size: { sm: "h-9 px-2 text-sm", md: "h-11 px-3 text-base", lg: "h-12 px-4 text-lg" },
    state: {
      default: "border-input focus-visible:border-outline focus-visible:ring-outline/50",
      error: "border-error focus-visible:border-error focus-visible:ring-error/50",
      success: "border-success focus-visible:border-success focus-visible:ring-success/50",
    },
  },
  defaultVariants: { size: "md", state: "default" },
});

const { size, state, class: className, ...rest } = Astro.props;
---

<input class={input({ size, state, class: className })} data-slot="input" {...rest} />
```

```astro
---
// src/components/ui/label/Label.astro
import type { HTMLAttributes } from "astro/types";
import { tv, type VariantProps } from "tailwind-variants";

type Props = HTMLAttributes<"label"> & VariantProps<typeof label>;

export const label = tv({
  base: [
    "text-foreground leading-none font-medium",
    "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  ],
  variants: { size: { sm: "text-sm", md: "text-base", lg: "text-lg" } },
  defaultVariants: { size: "md" },
});

const { size, class: className, ...rest } = Astro.props;
---

{/* eslint-disable-next-line astro/jsx-a11y/label-has-associated-control */}
<label class={label({ size, class: className })} data-slot="label" {...rest}><slot /></label>
```

```ts
// src/components/ui/input/index.ts
import Input, { input } from "./Input.astro";
const InputVariants = { input };
export { Input, InputVariants };
export default Input;
```

Field composition (Preline's label + helper/error layout, translated, accessible). Wire
`aria-invalid` + `aria-describedby` so the error text is announced; that's the non-negotiable a11y bit:

```astro
---
import Input from "@components/ui/input";
import Label from "@components/ui/label";
const errorId = "email-error";
---

<div class="flex flex-col gap-2">
  <Label for="email">Email</Label>
  <Input
    id="email"
    type="email"
    state="error"
    required
    aria-invalid="true"
    aria-describedby={errorId}
    placeholder="you@example.com"
  />
  <p id={errorId} class="text-error text-sm">Please enter a valid email address.</p>
</div>
```

## Codify the pattern (make it durably ours)

A pattern only counts as "ours" once it's written down where the next contributor (human or LLM) will
follow it. After the first 2–3 primitives prove the contract, lock it in:

1. **`src/components/ui/README.md`** — the canonical statement of the contract above (the five rules +
   the skeleton + the token-only rule). This is the source of truth for the library.
2. **`.claude/rules/astro.md`** — add a short "UI primitives live in `src/components/ui/` and follow the
   contract in its README" note so the rule files point at it.
3. **`wiki/ideal-template/naming-conventions.md` + `architecture.md`** — already reconciled to `ui/`
   (2026-06-30); when the README exists, link it from these pages. (See the prerequisite decision.)

Until then the contract lives here, in this handoff.

## Build order (roadmap)

Match galaxy's catalog as the eventual target, but ship in tiers — don't build 30 at once (YAGNI). The
**Primitive catalog** below is the full list with each primitive's Preline reference and Tier.

1. **Tier 1 — static, zero-JS (do first):** Button, Input, Label, Textarea, Badge, Card, Alert,
   Separator, Skeleton, Avatar. High reuse, no behavior to own.
2. **Tier 2 — light native behavior:** Accordion (`<details>`), Tabs, Tooltip (Popover API),
   Breadcrumb, Pagination, Progress, Spinner.
3. **Tier 3 — heavier interaction:** Dialog (`<dialog>`), Dropdown, Select, Sheet, Checkbox/Radio/Switch
   (native inputs styled with `peer`/`:checked`), Table.

## Primitive catalog — full reference

The complete set of primitives our library targets, each linked to its Preline doc as the **markup
reference** (translate classes per the table above; never load `preline.js`). Legend: **✦** = in
galaxy's Starwind set (the catalog target, build these for parity) · **Tier 1** static/zero-JS · **Tier
2** light native behavior · **Tier 3** heavier interaction, native-first (`<dialog>` / Popover API /
small bundled script). All refs live under `https://preline.co/docs/`.

### Form controls

| Our component   | Preline reference               | Tier | Build approach                                       |
| :-------------- | :------------------------------ | :--- | :--------------------------------------------------- |
| Input ✦         | input.html                      | 1    | native `<input>`; `peer` for float/validation states |
| Textarea ✦      | textarea.html                   | 1    | native `<textarea>`                                  |
| Label ✦         | input.html (no standalone page) | 1    | native `<label>` + `peer-disabled`                   |
| Input Group     | input-group.html                | 1    | flex wrapper + leading/trailing addons               |
| File Input      | file-input.html                 | 1    | native `file:` pseudo-element                        |
| Checkbox ✦      | checkbox.html                   | 1    | native `<input type=checkbox>` + `:checked`/`peer`   |
| Radio Group ✦   | radio.html                      | 1    | native `<input type=radio>`                          |
| Switch ✦        | switch.html                     | 1    | native checkbox styled as toggle                     |
| Select ✦        | select.html                     | 1    | native `<select>` (custom-dropdown select = Tier 3)  |
| Range Slider    | range-slider.html               | 2    | native `<input type=range>` + accent token           |
| Toggle Password | toggle-password.html            | 2    | tiny script flips `type`                             |
| Input Number    | input-number.html               | 2    | native `type=number` or small script                 |
| PIN Input       | pin-input.html                  | 3    | small script (focus advance)                         |

### Buttons & indicators

| Our component    | Preline reference     | Tier | Build approach                               |
| :--------------- | :-------------------- | :--- | :------------------------------------------- |
| Button ✦         | buttons.html          | 1    | dynamic `<a>`/`<button>` tag, variant + size |
| Button Group     | button-group.html     | 1    | flex wrapper, merged radii                   |
| Badge ✦          | badge.html            | 1    | static                                       |
| Legend Indicator | legend-indicator.html | 1    | static dot                                   |
| KBD              | kbd.html              | 1    | static `<kbd>`                               |
| Avatar ✦         | avatar.html           | 1    | `<img>` + fallback initials                  |
| Avatar Group     | avatar-group.html     | 1    | overlapped stack                             |
| Spinner ✦        | spinners.html         | 1    | CSS animation (respect `motion-reduce`)      |
| Progress ✦       | progress.html         | 1    | static bar or native `<progress>`            |
| Skeleton ✦       | skeleton.html         | 1    | CSS pulse                                    |
| Ratings          | ratings.html          | 2    | radio hack or small script                   |

### Content & layout

| Our component  | Preline reference             | Tier | Build approach                                         |
| :------------- | :---------------------------- | :--- | :----------------------------------------------------- |
| Card ✦         | card.html                     | 1    | compound: Card / Header / Content / Footer             |
| Alert ✦        | alerts.html                   | 1    | static (dismissible = Tier 2 + tiny script)            |
| Toast          | toasts.html                   | 2    | small script (dismiss / auto-hide)                     |
| Separator ✦    | dividers.html                 | 1    | `<hr>` / div, horizontal + vertical                    |
| List Group     | list-group.html               | 1    | static list                                            |
| List           | lists.html                    | 1    | **built** — `ui/list` (marker/orientation, icon items) |
| Item ✦         | lists.html (closest ref)      | 1    | Starwind compound (Item / Media / Content / Actions)   |
| Blockquote     | blockquote.html               | 1    | static                                                 |
| Aspect Ratio ✦ | — (native CSS `aspect-ratio`) | 1    | no Preline page; pure CSS                              |
| Timeline       | timeline.html                 | 2    | mostly static                                          |

### Navigation

| Our component | Preline reference | Tier | Build approach                                                 |
| :------------ | :---------------- | :--- | :------------------------------------------------------------- |
| Breadcrumb ✦  | breadcrumb.html   | 1    | static `<nav>` + compound parts                                |
| Pagination ✦  | pagination.html   | 1    | static links + ellipsis/prev/next                              |
| Tabs ✦        | tabs.html         | 2    | `:target`/radio trick or small script                          |
| Navs          | navs.html         | 1    | static nav list                                                |
| Mega Menu     | mega-menu.html    | 3    | **built** — `ui/mega-menu` (Popover API, shared `_popover.ts`) |
| Stepper       | stepper.html      | 2    | static + small script for active step                          |

### Overlays (interactive — native-first, **no `preline.js`**)

| Our component       | Preline reference            | Tier | Build approach                   |
| :------------------ | :--------------------------- | :--- | :------------------------------- |
| Accordion ✦         | accordion.html               | 2    | `<details>/<summary>`            |
| Collapse            | collapse.html                | 2    | `[hidden]` toggle or `<details>` |
| Tooltip ✦           | tooltip.html                 | 2    | Popover API or CSS-only          |
| Dropdown ✦          | dropdown.html                | 3    | Popover API or small script      |
| Popover             | popover.html                 | 3    | Popover API                      |
| Dialog / Modal ✦    | modal.html                   | 3    | native `<dialog>`                |
| Alert Dialog ✦      | modal.html (confirm variant) | 3    | native `<dialog>`, focus-trapped |
| Sheet / Offcanvas ✦ | offcanvas.html               | 3    | `<dialog>` + slide transform     |
| Context Menu        | context-menu.html            | 3    | Popover API + small script       |

### Tables

| Our component | Preline reference | Tier | Build approach                                          |
| :------------ | :---------------- | :--- | :------------------------------------------------------ |
| Table ✦       | tables.html       | 1    | static `<table>` styling (sortable/data = out of scope) |

### Deliberately out of scope (skip; add per-project only if a build needs it)

These need heavy JS or a third-party library, which fights our zero-JS-first / no-extra-dependency
ethos — so they're **not** core primitives: Datepicker, Time Picker, Color Picker, Advanced Select /
ComboBox / SearchBox, Carousel, Datatables, Charts, Maps / Datamaps, WYSIWYG (Text Editor),
Drag-and-Drop, File Upload / **Dropzone** (the one galaxy ✦ item we defer — heavy), Confetti, Tree View,
Layout Splitter, Custom Scrollbar, Marquee, Strong Password, Copy Markup. Compositions like **Navbar /
Sidebar** are built _from_ these primitives, so they belong in `src/components/`, not the
`ui/` primitive layer. (The mega-menu _mechanics_ — trigger + anchored wide panel — turned out
primitive-shaped and were built on request as `ui/mega-menu`, reusing Dropdown's `_popover.ts`
controller; a full site-header composition still belongs in `src/components/`.)

## Verification (the check)

- Per `.claude/rules` + `CLAUDE.md`: after each primitive, `pnpm lint` and `pnpm build` must be clean.
- **The one runnable check:** a `src/pages/examples/ui.astro` route (dev-only) that renders every
  primitive in every variant (each `size` × each `state`, plus disabled/readonly). Eyeball it in light
  **and** dark mode — a missing token shows up instantly as an un-themed element. This page is also the
  living demo and the regression guard.

## Out of scope / non-goals

- Installing `preline` or loading `preline.js`. (Reference only.)
- Vendoring the Starwind CLI / `starwind.config.json`, or adopting any external kit's pattern wholesale.
  We define and own _our_ pattern; theirs is reference only.
- Building the full 30-component catalog up front.
- Adding new theme tokens — the existing set already covers Tier 1–3. Only revisit the theme if a
  component genuinely needs a token that isn't there (none identified yet).
