---
title: UI primitives library
type: subsystem
created: 2026-06-30
updated: 2026-07-18
tags: [components, tailwind-variants, primitives, ui, tokens, forms, a11y]
sources:
  - src/components/ui/README.md
  - src/components/ui/_field.ts
  - src/components/ui/_dialog.ts
  - src/components/ui/_overlay.css
  - src/components/ui/_listbox.ts
  - src/components/ui/_client.ts
  - src/components/ui/_popover.ts
  - src/components/ui/_Chevron.astro
  - src/components/ui/button/Button.astro
  - src/components/ui/mega-menu/MegaMenu.astro
  - src/components/ui/list/List.astro
  - src/components/ui/input/Input.astro
  - src/components/ui/tabs/Tabs.astro
  - src/components/ui/dialog/Dialog.astro
  - src/components/ui/dropdown/Dropdown.astro
  - src/components/ui/slider/Slider.astro
  - src/components/ui/combobox/ComboBox.astro
  - src/components/ui/advanced-select/AdvancedSelect.astro
  - src/components/ui/searchbox/Searchbox.astro
  - src/components/ui/theme-toggle/ThemeToggle.astro
  - src/components/ui/card/Card.astro
  - src/components/ui/card/CardHeader.astro
  - src/components/ui/card/CardAction.astro
  - src/components/ui/card/CardImage.astro
  - src/components/ui/password/strength.ts
  - src/layouts/BaseHead.astro
  - src/pages/examples/[catalog].astro
  - eslint.config.mjs
status: active
---

# UI primitives library

astro-boiler's **own** low-level component library, at `src/components/ui/` — the in-house equivalent of
the reference starter's `starwind/` ([[sources/galaxy-main]]), _not_ a vendored kit (no Starwind CLI, no
`preline` package). It is built on `tailwind-variants` and consumes the
[[subsystems/styling-tokens|token architecture]] directly, so every primitive is themeable and dark-mode
correct for free. The full build spec and roadmap live in `tasks/ui-library-handoff.md`; this page is the
grounded synthesis of what's actually in the repo. Beside the `ui/` library sits its sibling system, the
SVG icon set at `src/components/svg/icons/` — see [[subsystems/icons]].

## The contract — five rules

Every primitive follows the _astro-boiler primitive contract_, codified in
`src/components/ui/README.md:12`: (1) **one folder per primitive** — `ui/<name>/<Name>.astro` +
`index.ts`; (2) **typed props = native + variants** — `type Props = HTMLAttributes<tag> &
VariantProps<typeof config>`; (3) **export the `tv()` config** (named after the component) so consumers
can compose it; (4) **tokens only, never raw colors**; (5) **merge consumer overrides** — destructure
`class: className`, spread `...rest`, pass `class` through the config, tag the root with
`data-slot="<name>"`. The canonical README is pointed at from `.claude/rules/astro.md:39`.

`Button.astro` shows the shape end to end: `export const button = tv({…})`
(`src/components/ui/button/Button.astro:10`), then a dynamic-tag render
`const Tag = href ? "a" : "button"` (`Button.astro:42`) with `data-slot="button"` and merged class
(`Button.astro:47-48`). It has since grown a boolean `icon` variant for square icon-only buttons —
`px-0` plus `compoundVariants` that set the width to match each size's height (`w-9`/`w-11`/`w-12`,
`Button.astro:31-37`). Each `index.ts` re-exports `{ <Name>, <Name>Variants }` + a default.

## Tier 1 (built)

The static, zero-JS primitives are in place: **Button, Input, Label, Textarea, Badge, Card, Alert,
Separator, Skeleton, Avatar**. Most are single-element; **Card** is the compound one, and the richest —
it grew a full set of sub-parts plus `variant`/`size` knobs in PR #6 (see [[#card]] below).

### Card

Card is the library's most-composed primitive: a root plus seven parts, all re-exported from one
`index.ts` (`card/index.ts:21`) — **CardImage**, **CardHeader** (holding **CardTitle** /
**CardDescription** / **CardAction**), **CardContent**, **CardFooter**. `CardTitle` is an `<h3>` and
`CardDescription` a `<p>`, reusing the same typography as the Dialog title/description pair
(`card/CardTitle.astro:16`, `card/CardDescription.astro:15`). The root carries two knobs
(`card/Card.astro:11`):

- **`variant`** — `default` / `elevated` / `outline` / `interactive` map to `shadow-sm` / `shadow-lg` /
  `shadow-none` / `shadow-sm transition-shadow hover:shadow-lg` (`Card.astro:14`); only the elevation
  changes, the markup stays identical.
- **`size`** — `sm` / `md` / `lg` set a `--card-p` CSS custom property (`Card.astro:23`) that the padded
  parts read as `p-[var(--card-p,1.5rem)]` (`CardHeader.astro:14`, `CardContent.astro:9`,
  `CardFooter.astro:9`). One knob repads header/content/footer at once; the parts fall back to `1.5rem`
  (= `p-6`) standalone, and — because `size` never touches the parts directly — a per-part padding
  override still wins via same-element `tailwind-merge`. This replaced an earlier descendant-selector
  form (`[&_[data-slot=card-content]]:p-4 …`) whose higher specificity _silently_ ate per-part
  overrides; the CSS-var rewrite was the fix from the PR #6 code-quality review.

Two structural techniques carry the compositions:

- **Grid header for the corner action.** `CardHeader` is a CSS grid, not a flex stack
  (`CardHeader.astro:12`). `has-[[data-slot=card-action]]:grid-cols-[1fr_auto]` (`CardHeader.astro:15`)
  opens a second column _only_ when a `CardAction` is present; the action pins itself there with
  `col-start-2 row-span-2` (`CardAction.astro:11`), leaving title and description to flow down column 1.
  Rows are implicit (`auto-rows-min`), so a title-only header carries no phantom trailing gutter — the
  action's row-span mints the second row when one is needed.
- **`overflow-hidden` clips the image.** The root sets `overflow-hidden` (`Card.astro:12`), so
  `CardImage` — a plain `<img class="block h-auto w-full object-cover">` (`CardImage.astro:12`) — is
  clipped to the card's `rounded-lg` radius whether it sits top, bottom, or full-bleed behind content,
  with no per-image corner logic. `CardImage` takes a raw/remote `src`; for an optimized asset the
  guidance is to skip the part and drop an `astro:assets` `<Image>` in its place (`CardImage.astro:3`).

Introduced in PR #6 (branch `feat/card-variants-subparts`), grounded in the Preline card reference —
markup/states only; Preline is never a dependency here, per the [[#the contract — five rules|contract]].

## Tier 2 (built)

The light-behavior primitives landed via PR #2: **Accordion, Tabs, Tooltip, Breadcrumb, Pagination,
Progress, Spinner** (`src/components/ui/README.md:84`). They follow the same contract, and they hold the
line on the handoff's **interactivity policy** — native HTML first, a tiny bundled script only when
native can't do it, never `preline.js`. Concretely:

- **Accordion** (compound: `Accordion` / `AccordionItem` / `AccordionTrigger` / `AccordionContent`) is
  native `<details>/<summary>` — zero JS. A shared `name` across items makes the group mutually exclusive
  (native exclusive-accordion), and the trigger chevron rotates on open via the descendant arbitrary
  variant `[&[open]_summary_svg]:rotate-180` (`accordion/AccordionItem.astro:12`).
- **Tooltip** is CSS-only: a `group` wrapper reveals the bubble on `group-hover` / `group-focus-within`
  (`tooltip/Tooltip.astro:15`), styled with the inverted `bg-foreground text-background` tokens
  (`Tooltip.astro:13`). No JS, no positioning library.
- **Breadcrumb** (compound: `Breadcrumb` / `…Item` / `…Link` / `…Page` / `…Separator`) and **Pagination**
  (compound: `Pagination` / `…Item` / `…Link` / `…Ellipsis`) are static `nav`-based. `PaginationLink`
  **reuses the `button` `tv()` config** (`pagination/PaginationLink.astro:5,17`) instead of defining a new
  one — the [[concepts/lazy-senior-ethos|ethos]] reuse rung, so pager links and buttons can't drift.
- **Progress** is a determinate `role="progressbar"` bar (`progress/Progress.astro:26`) with a
  `bg-primary` indicator width-driven by `value/max` (`Progress.astro:36`); kept determinate-only by
  design — an indeterminate slide would need a custom `@keyframes` (a `ponytail:` note marks the ceiling,
  `Progress.astro:5`). **Spinner** is a pure-CSS `animate-spin` with `motion-reduce:animate-none`
  (`spinner/Spinner.astro:12`) and `role="status"` (`Spinner.astro:25`).

**Tabs is the one exception that ships JavaScript** — HTML has no native tab element. A single bundled
`<script>` in `tabs/Tabs.astro` wires every instance through the shared re-init contract —
`onReady('[data-slot="tabs"]', initTabs)` (`Tabs.astro:81`) — into ARIA
tabs: roving focus with Arrow/Home/End keys (`Tabs.astro:54`) and runtime `aria-controls`/`aria-labelledby`
association by matching trigger↔panel `value`; the `astro:after-swap` re-init that keeps it alive across
view transitions lives in `_client.ts:10`. It degrades gracefully — without JS all panels stay visible.
This follows the template's "bundled `<script>`, re-init on swap" rule from `.claude/rules/astro.md`, the
same shape the scroll animations use.

> Note: the four Tier-2 compounds (Accordion, Tabs, Breadcrumb, Pagination) join Card as the library's
> compound primitives — each part is its own `.astro` file in the folder, re-exported from one `index.ts`.

## Tier 3 (built)

The heavier-interaction primitives landed (commit `9d6940e`): **Dialog** (compound:
Trigger/Close/Header/Title/Description/Footer), **Sheet**, **Dropdown** (Trigger/Menu/Item), **Select**,
**Checkbox**, **Radio**, **Switch**, **Table** — still native-first, still no `preline.js`
(`src/components/ui/README.md:92`). Dialog and Sheet are native modal `<dialog>` sharing one delegated
controller, **`_dialog.ts`** (see [[#shared internal modules]]); a Sheet is a Dialog pinned to an edge
via a `side` variant and reuses Dialog's trigger/close. **Dropdown** is the native **Popover API**
(`popover="auto"` + `popovertarget`) — top-layer so it's never clipped, native light-dismiss/Escape/
focus-return; placement, `aria-expanded` sync, and arrow-key roving come from **`_popover.ts`**, the
shared anchored-popover controller that also drives MegaMenu (see
[[#shared internal modules]]). **Select** reuses the
shared `_field` look (native `<select>` + token chevron); **Checkbox/Radio/Switch** are native inputs
styled `appearance-none` + `peer`/`:checked` (zero-JS); **Table** is static `<table>` styling in an
`overflow-x-auto` wrapper.

## V2 batch (built)

PR #3 added static, zero-JS primitives: **Nav** (compound Nav/NavItem/NavLink, with underline/pills/
segment variants keyed off `aria-current="page"`) and a pure-CSS **Marquee** (slotted content rendered
twice for a seamless `@keyframes` scroll; `motion-reduce` pauses it), alongside **Table**.

## Navigation & content (built)

PRs #12/#14 (commits `009c2b4`, `1c89195`) added the Preline nav/content set — **MegaMenu** (compound:
MegaMenu / MegaMenuTrigger / MegaMenuPanel / MegaMenuItem) and **List** (List / ListItem), joining the
Tier-2 Breadcrumb, which is reused as-is:

- **MegaMenu** is a Dropdown with a wide multi-column panel — the same reuse move as Sheet-on-Dialog.
  The panel is a Popover-API top layer placed by the shared **`_popover.ts`** controller (see
  [[#shared internal modules]]); the trigger **reuses the `navLink` config**
  (`mega-menu/MegaMenuTrigger.astro:8`) so it sits between NavLinks in a Nav, and `columns` (1/2/3) sets
  panel width + column count (`MegaMenuPanel.astro:24`). The panel keeps natural Tab order — it's a grid
  of links, not a `role="menu"` — and is click-to-open only; hover triggers are hostile to touch and
  keyboard users (a `ponytail:` note in `MegaMenu.astro`). `MegaMenuItem` is the Preline rich link (icon
  slot + title + description slot).
- **List** is the static Preline lists set, zero-JS: `marker` picks none/disc/decimal — decimal renders
  an `<ol>` (`list/List.astro:33`) — `orientation="horizontal"` inlines items with a dot separator drawn
  by the list itself, and `ListItem` carries an `icon` slot for checked lists (flex applies only when an
  icon is present, so disc/decimal markers survive).

## Advanced form controls (built)

PR #4 (`04278de`) scaffolded the Preline "advanced forms" set as primitives
(`src/components/ui/README.md:117`) — native-first, tokens only:

- **Slider** — native `<input type=range>` styled through the range pseudo-elements (a token track + a
  `bg-primary` thumb ringed in `background`, `slider/Slider.astro:26`). The first cut used
  `accent-color` alone with `appearance-none` and rendered _no track_ (appearance-none strips it) — the
  pseudo-element styling is the fix. Firefox fills `::-moz-range-progress`; WebKit has no progress pseudo
  (a `ponytail:` ceiling).
- **InputNumber** — native `type=number` between `−`/`+` steppers that **reuse the `button` config**
  (ethos rung 2); a script drives `stepUp()`/`stepDown()` and disables a stepper at its min/max bound.
- **ToggleCount** — a Monthly/Annual pricing toggle **built on the Switch primitive**
  (`toggle-count/ToggleCount.astro:28`); each `ToggleCountValue` swaps between its `data-min`/`data-max`
  text (`ToggleCountValue.astro:25`) when the toggle flips.
- **PasswordInput** (show/hide, reuses the `input` config) + **PasswordStrength** — a 4-segment meter
  driven by the rule-based `scorePassword` (`password/strength.ts:17`), the batch's one piece of
  non-trivial logic, kept in a plain module with a runnable self-check (`password/strength.test.ts`).
- **ComboBox** (+ Option) — `role="combobox"` autocomplete over a filterable `role="listbox"`; the
  visible input shows the label and a hidden input carries the value for form submission
  (`combobox/ComboBox.astro:57`). **AdvancedSelect** — searchable single/multi select backed by a real,
  visually-hidden native `<select>` so it still submits. **Searchbox** (+ Item) — a ⌘K command palette
  that **reuses the Dialog shell** (`<dialog>` + `_dialog.ts`).

The three interactive ones (ComboBox/AdvancedSelect/Searchbox) share a filter + roving kernel factored
into **`_listbox.ts`**, and every scripted primitive re-inits through **`_client.ts`** — both covered in
[[#shared internal modules]].

## Theme toggle (built)

**ThemeToggle** (`theme-toggle/ThemeToggle.astro`) is a manual light/dark override on top of the device
default. It **reuses the `button` config** (ethos rung 2) and the sun/moon icon flip is **CSS-only** —
`size-4 dark:hidden` / `hidden size-4 dark:block` — so it is correct pre-paint with no flash; only the
click ships JS (toggle `.dark`, persist `localStorage("colorTheme")`, sync `aria-pressed`), re-init
through `_client.ts`'s `onReady`. It is the one primitive that is **not purely additive**: it pairs with
an edit to [[subsystems/layouts-seo|BaseHead]]'s inline pre-paint script (`BaseHead.astro:138-168`), which
now reads `localStorage("colorTheme")` before falling back to the device and only auto-follows OS changes
while the user hasn't pinned a choice. That script stays **inline** pre-paint on purpose — moving it to a
bundled `<script>` reintroduces the flash (CLAUDE.md gotcha). The dev catalog's old ad-hoc toggle button

- script were removed in favor of the real primitive (it now drives the page's header switch).

## Why it drops onto the tokens with zero adaptation

The library references the same semantic token utilities the [[subsystems/styling-tokens|theme]] already
exposes — `border-input`, `ring-outline`, `text-foreground`/`text-muted-foreground`, `border-border`,
`bg-primary`/`text-primary-foreground`, `border-error`/`border-success`, the `rounded-*` radius scale.
Because those resolve against `:root`/`.dark`, a primitive is themed and dark-mode correct without any
per-component dark variants. This is the load-bearing reason the library could be authored as "ours"
cheaply (see the handoff's token table). The primitives are now the **main consumer** of the token layer
and supersede the older `.form__input` `@apply` helper documented in [[subsystems/styling-tokens]].

## Shared internal modules

Leading-underscore files in `src/components/ui/` are **internal shared modules, not primitives** — the
library's single sources of truth for cross-cutting look and behavior. Extracting them (rather than
re-copying) is the [[concepts/lazy-senior-ethos|ethos]] reuse rung applied to the library itself:

- **`_field.ts`** — the form-field contract. `fieldBase` (`_field.ts:7`) + `fieldState`
  (default/error/success, `_field.ts:16`). Input, Textarea, Select, and the password fields all compose
  them (`Input` uses `base: fieldBase`; `Textarea` uses `base: [...fieldBase, "min-h-20 py-2"]`), so the
  validation styling has one home.
- **`_dialog.ts`** — one delegated `document` click controller for every `<dialog>`: `data-dialog-open`
  openers → `showModal()`, `data-dialog-close` closers, and backdrop light-dismiss. It binds **once** and
  survives view transitions (no `astro:after-swap` re-init needed). Shared by Dialog, Sheet, and —
  through the Dialog shell — Searchbox.
- **`_overlay.css`** — the dialog/sheet entry-exit animations (`@starting-style` + `allow-discrete`),
  the `base-950` backdrop scrim, and the modal scroll-lock. It also restores `margin: auto` on
  `[data-slot="dialog"]` (`_overlay.css:44`) — see the centering gotcha below.
- **`_listbox.ts`** — the filterable-listbox kernel shared by ComboBox / Searchbox / AdvancedSelect:
  `filterByText` (`_listbox.ts:12`, case-insensitive substring match + empty-state toggle), `nextIndex`
  (`_listbox.ts:28`, wrap-around roving math), and `createActiveDescendant` (`_listbox.ts:39`, the
  `aria-activedescendant` rover ComboBox and Searchbox both use, focus staying in the input). Extracted in
  the PR #4 code-quality review to collapse three identical filters + two verbatim rovers into one.
- **`_popover.ts`** — the anchored-popover controller shared by **Dropdown and MegaMenu** (extracted
  from Dropdown when MegaMenu landed — commits `009c2b4`, `1c89195`). The Popover API owns
  open/close/light-dismiss/Escape natively; this adds delegated placement (under the trigger, flipping
  above and clamping into the viewport, reflow on scroll/resize), `aria-expanded` sync (which flips the
  trigger chevron), arrow-key roving for `role="menu"` dropdowns only (a mega-menu panel keeps natural
  Tab order), and close-on-item-activate (`_popover.ts:86` — clicks _inside_ a popover never
  light-dismiss it). Like `_dialog.ts` it delegates on `document`/`window`, so it binds **once** and
  survives view transitions with no `astro:after-swap` re-init.
- **`_Chevron.astro`** — the one disclosure/select chevron glyph, a shared partial that exports a
  `chevron` `tv()` config (`_Chevron.astro:14`); deduped from its six call sites (Accordion, Select,
  ComboBox, AdvancedSelect, Dropdown, MegaMenu). It owns the glyph, size, and rotation transition; the
  open-state rotation _selector_ stays at each call site because it genuinely differs per host.
- **`_client.ts`** — `onReady(selector, wire)` (`_client.ts:7`): run `wire` for every match on load **and**
  after each `astro:after-swap`. This is the re-init contract every scripted primitive needs (Tabs
  established the pattern inline originally; since commit `e195943` it goes through `onReady` like the
  rest); centralizing it means the view-transition invariant can't be forgotten. Used by 9 script blocks
  across the library (Tabs, Searchbox, PasswordStrength, PasswordInput, ThemeToggle, InputNumber,
  AdvancedSelect, ComboBox, ToggleCount).

### Gotchas

> [!warning] Modal centering vs Tailwind Preflight. Tailwind v4 Preflight resets `margin: 0` on _every_
> element, which wipes the UA `dialog { margin: auto }` that centers a modal `<dialog>` — so every
> centered Dialog lands top-left. `_overlay.css:44` restores `margin: auto` on `[data-slot="dialog"]`
> (Sheets are edge-pinned and unaffected). Verified in-browser after PR #4. (2026-07-01)

> [!warning] Astro boolean attrs — `multiple={false}`. AdvancedSelect's hidden `<select multiple={…}>`
> emitted `multiple="false"` for a single select, and browsers treat _any_ `multiple` attribute as
> present — so single-select silently behaved as multi-select. Fixed by passing `multiple || undefined`
> (`advanced-select/AdvancedSelect.astro:85`) so Astro omits the attribute; the option `selected`/
> `disabled` attrs are hardened the same way. Boolean attrs are omitted for `undefined`, not for `false`
> — pass `undefined`. (2026-07-01)

## Dependencies

Two runtime deps were added (`package.json:33-34`): **`tailwind-variants`** (the `tv()` engine — the
house pattern assumed by `.claude/rules/tailwind.md`) and **`tailwind-merge`**, which `tailwind-variants@3`
needs as a peer to resolve class conflicts at runtime (the build fails without it). `tv()` runs
`tailwind-merge` internally, so no standalone `cn()` helper was added — every primitive merges through
`tv()`.

## The check — a dev-only catalog

`/examples/ui` renders every primitive in every variant with a light/dark toggle — the living demo and
regression guard (a missing token shows up instantly as an un-themed element). The route is
`src/pages/examples/[catalog].astro`; the markup lives in `src/components/Sections/UiCatalog/`
([[concepts/page-composition]]). It is **dev-only and static-build-safe**: `getStaticPaths` emits no
paths in a prod build (`[catalog].astro:11-13`), so no HTML ships to production while `astro dev`
still serves it. (This replaced the old `prerender = false` + 404-`Response` guard, which needed the
Node adapter that left with [[subsystems/keystatic-cms|Keystatic]].)

## The one lint concession

Rule 3 (export the `tv()` config from `.astro` frontmatter) collides with the recommended
`astro/no-exports-from-components`, so a scoped override disables that rule for the two contract-following
trees — `src/components/ui/**/*.astro` and `src/components/svg/**/*.astro`, the icon primitive
(`eslint.config.mjs:44`) — documented in place. The alternative —
moving each config into a sibling `.ts` — would drop the waiver at the cost of one more file per
primitive; an open design call noted in the handoff and a code review.

## Related

[[subsystems/styling-tokens]] (the tokens it consumes) · [[subsystems/layouts-seo]] (the shell + theme)
· [[subsystems/motion]] (the `<Reveal>` motion primitive + the `animate-*` catalog it composes)
· [[ideal-template/naming-conventions]] (the `ui/` folder rule) · [[ideal-template/code-quality]]
(the `tailwind-variants` smell test) · [[concepts/lazy-senior-ethos]] · [[sources/galaxy-main]]
