# AGENTS.md — Astro template

Astro 7 + Tailwind CSS v4 + TypeScript (strict) starter with typed, config-driven content and a
CSS-first token architecture. Single-language. Package manager: **pnpm**.

## Commands

| Command        | Action                                    |
| :------------- | :---------------------------------------- |
| `pnpm install` | Install dependencies                      |
| `pnpm dev`     | Dev server at `localhost:4321`            |
| `pnpm build`   | Production build to `dist/`               |
| `pnpm preview` | Preview the production build              |
| `pnpm lint`    | ESLint                                    |
| `pnpm format`  | `eslint --fix` then Prettier              |
| `pnpm check`   | `astro check` (type `.astro`/`.ts`)       |
| `pnpm test`    | Every `*.test.ts` self-check under `src/` |

## Project structure

```
src/
├── components/
│   ├── Sections/<Page>/<Name>.astro  # layout-free page sections; Global/ for cross-page ones
│   ├── Cards/<Name>Card.astro        # composed, content-aware cards (built on ui/card)
│   ├── ui/<name>/<Name>.astro        # UI primitives (contract: ui/README.md)
│   └── svg/icons/                    # the icon system
├── config/
│   ├── siteData.json.ts            # typed site metadata (name, title, author, OG default)
│   ├── legalData.json.ts           # terms + privacy content
│   ├── siteSettings.json.ts        # siteLang/siteLocale + feature flags
│   └── types/configDataTypes.ts    # interfaces for the data files
├── data/<collection>/<slug>/       # content collection entries
├── js/                             # textUtils, schema (JSON-LD builders)
├── layouts/                        # BaseHead (SEO/meta), BaseLayout (shell)
├── pages/                          # thin route shells: own BaseLayout + SEO, compose Sections
└── styles/                         # global.css (entry), tailwind-theme.css, fonts.css
```

- **Sections vs Cards vs ui**: pages are thin route shells that own `BaseLayout` + SEO and compose
  **Sections** (layout-free content blocks, per-page or `Global/`); Sections build on **ui** primitives
  and **Cards** (content-aware compositions). Contracts: `src/components/Sections/README.md`,
  `src/components/Cards/README.md`, `src/components/ui/README.md`.
- `src/content.config.ts` — content collection schemas (Zod). Entries live directly under the
  collection dir (id `<slug>`).
- `src/config/` — typed site config; drive values from here, not hard-coded literals in components.
- Path aliases (`@config/* @js/* @layouts/* @components/* @assets/* @images/* @/*`) come from
  `tsconfig.json` `paths` — prefer them over deep relative imports.

## Stack defaults

- **TypeScript** strict; validate external data at the boundary (Zod).
- **Tailwind v4** CSS-first: tokens in `@theme`; use token utilities (`bg-primary`, `text-foreground`,
  `text-base-700`), never raw palette colors (`bg-violet-700`) — that bypasses theming + dark mode.
- **Astro 7** Rust compiler: close every tag, mind JSX whitespace (`{" "}`), default to zero-JS islands.

## Don't / gotchas

- **Set `site` in `astro.config.mjs`** (currently `https://example.com`) before deploy — it feeds the
  sitemap and the canonical/OG URLs in `BaseHead.astro`.
- **`vite.build.assetsInlineLimit: 0`** is intentional — inlined short scripts break under
  `<ClientRouter />` view transitions. Leave it at 0.
- **Theme is set pre-paint** by an inline script in `BaseHead` (follows the device
  `prefers-color-scheme`) — don't move it to a bundled `<script>` or you'll reintroduce a flash of the
  wrong theme.
- **Token discipline:** in markup use `bg-primary` / `text-foreground` / `text-base-700`, never raw
  `bg-violet-700` / `text-zinc-300` (bypasses theming + dark mode). See `tailwind-theme.css`.
- **Motion is owned, not vendored.** The `animate-*` catalog is `src/styles/motion/` — don't `pnpm add`
  an animation library. `prefers-reduced-motion` is handled by a global guard there; scroll-driven
  (`timeline-*`) elements still need `motion-reduce:animate-none`, and decorative motion is gated on
  `siteSettings.useAnimations`.
- **SEO is owned, not vendored.** `BaseHead` emits every meta/OG tag natively; structured data comes
  from the JSON-LD builders in `@js/schema`; `robots.txt`/`llms.txt` are dynamic endpoints. Don't
  `pnpm add` an SEO/robots/schema package.
- `.claude/memory.db` and `.claude/settings.local.json` are local state — gitignored, not artifacts.

## Verification

After non-trivial changes run the full chain:

```sh
pnpm lint && pnpm check && pnpm build && pnpm test
```

Schema and config mistakes surface at build time, so a clean build is the real check. `pnpm test`
discovers and runs every `*.test.ts` under `src/` with Node's type stripping (no framework, no
fixtures) and **fails when it finds none** — name a check `<thing>.test.ts` next to the code it covers
and it runs.
