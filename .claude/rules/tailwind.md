# Tailwind CSS v4 — clean-code rules

Tailwind v4 is **CSS-first** (config lives in CSS). Grounded in this template's real setup
(`src/styles/global.css`, `tailwind-theme.css`, `src/components/ui/*`).

## The token architecture (use it — never hard-code raw colors)

Three layers, each with one job:

1. **Palette aliases** in `@theme` — name your brand on top of Tailwind's scale, so a rebrand is one edit:
   ```css
   @theme {
     --color-primary-500: var(--color-violet-500); /* …-50 … -950 */
     --color-base-500: var(--color-zinc-500);
   }
   ```
2. **Semantic runtime vars** in `@layer base` for `:root` and `.dark`, so they flip with the theme:
   ```css
   :root {
     --background: var(--color-base-100);
     --primary: var(--color-primary-700);
     --foreground: var(--color-base-900);
   }
   .dark {
     --background: var(--color-base-900);
     --primary: var(--color-primary-400);
     --foreground: var(--color-base-100);
   }
   ```
3. **Bridge** semantic vars to utilities with `@theme inline` (needed so they resolve to the runtime var):
   ```css
   @theme inline {
     --color-background: var(--background);
     --color-primary: var(--primary);
   }
   ```

**The rule:** in markup use the project's token utilities — `bg-primary`, `text-foreground`, `bg-muted`,
`border-border`, or the palette aliases `text-base-700`, `from-primary-800`. **Never** write raw Tailwind
colors (`bg-violet-700`, `text-zinc-300`) in components — that bypasses theming and dark mode.

**The one exception: a third party's brand colour.** A logo tile's fill is a fact about someone
else's mark, not a themeable value — there is no dark-mode Airbnb red to flip to, and tokenising it
would invite a rebrand to silently recolour a company's logo. **The test is ownership, not
inconvenience — if _you_ could restyle it, it is a token.** No component in this skeleton needs the
exception today; when a logo wall or a tech-stack row lands, keep each hex on the data entry beside
the company that owns it and apply it via inline `style` (a computed `bg-[…]` class is invisible to
the compiler — see "Never interpolate class names" below).

Artwork that is merely _decorative_ does **not** qualify — it is the theme's own, so it themes.
`Sections/NotFound/NotFoundIllustration.astro` is the reference for getting this right: its shapes
use `currentColor` (driven by `text-primary` on the root `<svg>`) and token fills
(`fill-base-300` / `fill-info` / `fill-success` / `fill-secondary`) with `var(--color-base-400)`
gradient stops, so its paper and accent layers follow the theme in both modes — no raw hex. A stock
SVG pasted in with its own palette would instead sit there light-mode-white in dark mode; move it
onto `currentColor` + token fills the same way before you ship it.

## Dark mode

Class-based, declared once: `@variant dark (&:where(.dark, .dark *));`. Pair light/dark on the element so they
can't drift — `text-base-700 dark:text-base-300` — or let semantic tokens do it (`text-foreground` already flips).

## Components: `tailwind-variants` (`tv`) is the pattern

For any element with variants, define a `tv()` config — don't hand-thread class strings:

```ts
export const button = tv({
  base: [
    // group base classes by concern, one string per line
    "inline-flex items-center justify-center rounded-md font-medium",
    "transition-all outline-none focus-visible:ring-3",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  variants: {
    variant: {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90",
      ghost: "hover:bg-muted",
    },
    size: { sm: "h-9 px-3 text-sm", md: "h-11 px-4 text-base" },
  },
  defaultVariants: { variant: "primary", size: "md" },
});
```

- Derive props from it: `interface Props extends VariantProps<typeof button> { … }`.
- Accept and **merge** a consumer override: destructure `class: className`, then
  `class={button({ variant, size, class: className })}` — `tv` runs `tailwind-merge`, so the last
  conflicting utility wins (no `px-2 px-4` duplicates).
- **Never interpolate class names** (`bg-${tone}-500` is invisible to the compiler). Map to whole static
  classes inside `variants`, or a `const map = { ok: "bg-success", bad: "bg-error" }`.

## `@apply` is allowed here — for shared, cross-cutting classes

This template uses `@apply` inside `@layer components`/`utilities` for reusable semantic classes, and that's
correct usage: `.h1`, `.description`, `.site-container`, `.primary-focus`,
`.main-text-gradient`. Use `@apply` for a pattern repeated across many unrelated elements; reach for a
**component** (or `tv`) when the thing has structure/variants. Don't `@apply` to "tidy" a one-off class list.

## CSS-first config mechanics

- `@import "tailwindcss";` (one line). Load plugins with `@plugin "@tailwindcss/forms";`.
- Declare layer order explicitly: `@layer theme, base, components, utilities;` and import into a layer when
  needed: `@import "./buttons.css" layer(components);`.
- Native CSS nesting is available (`.blog-prose { & a { @apply text-info; } }`, as in global.css).
- Keep the `@theme` token file separate (`tailwind-theme.css`) so it can also be imported into a `.astro`
  `<style>` block.

## Always

- Let `prettier-plugin-tailwindcss` order classes — never hand-sort, don't fight it.
- Mobile-first (`base` then `sm: md: lg:`). Prefer tokens over arbitrary `[…]` values; if you must, use
  `[var(--token)]` over a literal.
- Keep a visible focus ring (`focus-visible:ring-*` / `.primary-focus`), use `sr-only` for SR-only text,
  respect `motion-reduce:`.

## Smell test

6+ utilities with a ternary inside `class` → make it a `tv` component. Same class cluster 3+ times → a
component or an `@apply` class. A raw `violet-`/`zinc-` color in markup → wrong, use a token.
