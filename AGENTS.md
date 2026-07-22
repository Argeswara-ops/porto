# CLAUDE.md — Astro Boiler

Astro 7 + Tailwind CSS v4 + TypeScript (strict) starter with typed, config-driven content and
a CSS-first token architecture. Single-language: the former i18n system (fr locale, helper
layer, maintenance scripts) and Keystatic were fully removed — git history and
`wiki/subsystems/i18n.md` record the old shape if a project needs it back. Package manager:
**pnpm**. This is the lean skeleton you copy and grow into a real template — add
components/CMS/search per project.

## Coding standard — read these

Detailed rules live alongside this file and are imported into context:

@.claude/rules/typescript.md
@.claude/rules/tailwind.md
@.claude/rules/astro.md
@.claude/rules/motion.md
@.claude/rules/seo.md

Overarching ethos (lazy senior dev): **the best code is the code never written.** Before
adding anything, climb the ladder — does it need to exist (YAGNI) → does it already exist
here (reuse the helper) → does the stdlib/platform do it → does an installed dep do it →
can it be one line → only then write the minimum. Deletion over addition. Boring over
clever. Shortest working diff that you actually understand. Mark deliberate shortcuts with
a `ponytail:` comment naming the ceiling.

Not lazy about: understanding the problem first, input validation at trust boundaries,
error handling, security, and accessibility.

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

- **Sections vs Cards vs ui**: pages are thin route shells that own `BaseLayout` + SEO and
  compose **Sections** (layout-free content blocks, per-page or `Global/`); Sections build on
  **ui** primitives and **Cards** (content-aware compositions). Contracts:
  `src/components/Sections/README.md`, `src/components/Cards/README.md`, `src/components/ui/README.md`.
- `src/content.config.ts` — content collection schemas (Zod). Entries live directly under the
  collection dir (id `<slug>`).
- `src/config/` — typed site config, never hard-coded values in components.
- Path aliases (`@config/* @js/* @layouts/* @components/* @assets/* @images/* @/*`) come from
  `tsconfig.json` `paths` — prefer them over deep relative imports.

## Stack defaults

- **TypeScript** strict; never `any`; validate external data at the boundary (Zod).
- **Tailwind v4** CSS-first: tokens in `@theme`, classes ordered by `prettier-plugin-tailwindcss`,
  conditional classes via `cn()`/`tailwind-variants`.
- **Astro 7** Rust compiler: close every tag, mind JSX whitespace (`{" "}`), default to zero-JS
  islands. See `@.claude/rules/astro.md` for the full v7 breaking-change list.

## Don't / gotchas

- **Set `site` in `astro.config.mjs`** (currently `https://example.com`) before deploy — it
  feeds the sitemap and the canonical/OG URLs in `BaseHead.astro`.
- **The i18n layer is gone, deliberately.** `siteLang`/`siteLocale` in `siteSettings.json.ts` are
  the only locale facts left. Don't re-introduce locale plumbing piecemeal — re-adding i18n means
  restoring the helper layer, per-locale config/data, hreflang in `BaseHead`, and the
  `astro.config.mjs` `i18n` block together (git history / `wiki/subsystems/i18n.md` have the shape).
- **`vite.build.assetsInlineLimit: 0`** is intentional — inlined short scripts break under
  `<ClientRouter />` view transitions. Leave it at 0.
- **Token discipline:** in markup use `bg-primary` / `text-foreground` / `text-base-700`, never
  raw `bg-violet-700` / `text-zinc-300` (bypasses theming + dark mode). See `tailwind-theme.css`.
- **Theme is set pre-paint** by an inline script in `BaseHead` (follows the device `prefers-color-scheme`) — don't move it
  to a bundled `<script>` or you'll reintroduce a flash of the wrong theme.
- **Motion is owned, not vendored.** The `animate-*` catalog is `src/styles/motion/index.css` (a dependency-free port of
  tailwind-animations) — don't `pnpm add` an animation library. `prefers-reduced-motion` is handled by a global guard
  in that file; scroll-driven (`timeline-*`) elements still need `motion-reduce:animate-none`, and decorative motion is
  gated on `siteSettings.useAnimations`. See `@.claude/rules/motion.md`.
- **SEO is owned, not vendored.** `BaseHead` emits every meta/OG/hreflang tag natively; structured
  data comes from the JSON-LD builders in `@js/schema` (an auto `Organization`+`WebSite` graph on every
  page, plus per-page `schema`); `robots.txt`/`llms.txt` are dynamic endpoints. Don't `pnpm add` an
  SEO/robots/schema package. See `@.claude/rules/seo.md`.
- `.claude/memory.db` and `.claude/settings.local.json` are local state — gitignored, not artifacts.

## Verification

After non-trivial changes run the full chain — the same four commands the README names:

```sh
pnpm lint && pnpm check && pnpm build && pnpm test
```

Schema and config mistakes surface at build time, so a clean build is the real check. `pnpm test`
discovers and runs every `*.test.ts` under `src/` with Node's type stripping (no framework, no
fixtures) and **fails when it finds none** — so the house rule that non-trivial logic leaves one
runnable check behind is enforced by tooling, not memory. Name a check `<thing>.test.ts` next to the
code it covers and it runs; name it anything else and nothing runs it.
