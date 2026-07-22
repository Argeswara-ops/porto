# Audit prompt — 8-BitQuest → best-in-class Astro template

You are auditing `8-BitQuest`, a buyer-facing **Astro 7 + Tailwind CSS v4 + TypeScript (strict)**
retro-pixel theme built on the astro-boiler skeleton. Your job is to produce the definitive cleanup
plan that takes it from "good" to "the best template of its kind". **Report first — do not edit
anything until I approve the plan.** There is uncommitted work on `main`; judge it, do not clobber it.

## Read these before you form an opinion

The repo already states its own standard. Do not invent a competing one.

- `AGENTS.md` (which `CLAUDE.md` imports — the pointer indirection is deliberate, not drift) plus
  the five imported rule files `.claude/rules/{typescript,tailwind,astro,motion,seo}.md`. These ARE
  the bar. Judge every file against them.
- `wiki/ideal-template/{architecture,code-quality,naming-conventions}.md` — the explicit spec for
  what this template is meant to become. Your audit is largely "where does reality diverge from this?"
- `src/components/ui/README.md` — the five-rule primitive contract.
- `src/components/{Sections,Cards}/README.md` — the composition contracts.
- `wiki/overview.md` and `wiki/index.md` — the current-state map.

The governing ethos is *lazy senior dev*: the best code is the code never written. **Deletion over
addition. Boring over clever. No abstractions that weren't asked for.** A finding whose fix is "add a
layer" must justify itself far harder than one whose fix is "delete this".

## Ground truth (verified — trust these before you cite)

Astro 7, Tailwind v4, TS strict, pnpm. **142 `.astro` and 78 `.ts` files**: ~46 UI primitives under
`src/components/ui/` (47 entries incl. README), 9 Section groups (About, Blog, Contact, Global, Home,
Legal, NotFound, Project, UiCatalog), 2 Cards (ContentCard, PixelCardLink), an owned SVG icon registry
(**571 icons — claim verified correct**), an owned motion catalog, an owned SEO layer (`BaseHead` +
`src/js/schema.ts`), 3 content collections (`blog` — 6 entries, `projects` — 6 entries, `authors`),
and a dev-only UI catalog at `/examples/<catalog>`. Signature: a retro pixel skin — one
`ui/pixel-panel` primitive, a `shadow-pixel` hard-offset shadow, pages reproduced from Figma.

Routes: `/`, `/about/`, `/blog/`, `/blog/<slug>/`, `/projects/`, `/projects/<slug>/`, `/contact/`
(**`prerender = false`, mounted on `@astrojs/node`**), `/privacy/`, `/terms/`, `/404`,
`/examples/<catalog>`, plus `robots.txt`, `llms.txt`, and `rss.xml` endpoints.

## Known suspects — confirm, quantify, or dismiss each

These are leads, not findings. Verify every one against the actual files and say plainly if one is wrong.

1. **`README.md` is stale to the point of misdescribing the product.** It is titled "Astro Boiler",
   calls the project "single-language and **fully static**", and states "**There is no `/blog/`
   route, deliberately**" — all false now. `/contact/` is server-rendered on `@astrojs/node`; `/blog/`,
   `/about/`, `/projects/` all ship; `rss.xml` and a reading-time util exist. The Routes table (lines
   ~33–52) omits `/about /blog /projects /contact` entirely; the Content table says collections "**ship
   empty**" (they hold 6 + 6 entries) and never lists the `projects` collection; "**38 UI primitives**"
   understates the ~46 that ship; nothing in the README mentions 8-BitQuest, the pixel theme, the
   Resend contact form, or `SITE_URL`/contact env at all. For a template the README *is* the product
   surface. Assess the full blast radius (README, `wiki/overview.md`, any deploy-checklist drift) and
   name every specific false claim with its line.

2. **Uncommitted work on `main`.** `git status` shows five modified files —
   `Sections/{About/Hero,About/SkillTree,Home/Stats}.astro`, `styles/global.css`,
   `styles/tailwind-theme.css` — a coherent light-mode redesign (lavender→retro-blue desktop, white
   card panels, a theme-aware `--pixel-shadow`, light/dark token *pairs* for the scoreboard stats).
   Hold it to the same bar as committed code and rule on it: is it finished and correct (token
   discipline, contrast, both themes), and should it be committed or reverted? It must not sit
   dangling on `main`. Note: the new tuned literal hex (`#d6e3f4`, `#c3d5ef`, `#6a769a`) lives inside
   `@layer base` semantic runtime vars — the *sanctioned* token-definition layer per `tailwind.md`, not
   a markup violation. Confirm that distinction holds.

3. **`Sections/UiCatalog/` has inconsistent file naming** — `Tier1Catalog`, `Tier2Catalog`,
   `Tier3Catalog`, `V2Catalog` sit alongside descriptive `FormControlsCatalog`, `IconsCatalog`,
   `MotionCatalog`, `NavigationCatalog`. Check against `wiki/ideal-template/naming-conventions.md`.
   `V2Catalog` implies a V1 that isn't there — is the numbered/versioned scheme meaningful or leftover?

4. **`authors` collection may be empty while `blog` posts require it.** Posts declare
   `authors: z.array(reference("authors"))` (referenced ids must exist), yet the authors data dir shows
   no folder entries. Verify whether every referenced author id resolves — if not, this is a **build
   blocker**, not a nit. (Confirm against the real `pnpm build`, below.)

5. **`Sections/NotFound/NotFoundIllustration.astro` mixes `currentColor` with a stock raw-hex
   palette** (`#47E6B1`, `#4D8AF0`, etc.), so its paper/accent layers don't follow the theme — the
   one violation `tailwind.md` calls out by name. Confirm it's still open and that the hex in
   `Hero.astro`/`Stats.astro` is only in *prose comments* (references to the Figma mock), not markup.

6. **`site: "https://example.com"` is still the placeholder in `astro.config.mjs`.** It feeds
   canonical, OG, sitemap, robots, llms. Confirm the production-deploy gate (`throw` on `example.com`)
   still fires so this can't reach a live site, and that the deploy checklist names the fix.

7. **15 components carry an inline `<script>`; ~9 use the `_client.ts`/`onReady` re-init contract.**
   Audit the gap: under `<ClientRouter />` view transitions, anything that doesn't re-init on
   `astro:after-swap` is a latent bug. `Contact/Form.astro` *does* re-bind (`astro:after-swap`) — check
   the rest, especially the interactive `ui/` primitives.

8. **`wiki/subsystems/{i18n,keystatic-cms}.md` document removed features.** Historical record or
   confusing cruft? Say which, and whether the `[[wikilink]]` graph makes clear they're history.

9. **Two deploy adapters vs one runtime need.** `@astrojs/node` is mounted for the one on-demand route
   (`/contact/`). Confirm whether a second adapter (`@astrojs/netlify`/`vercel`) also ships as a
   dependency a buyer half-discards, and weigh the swap-flexibility against the shipped weight.

10. **Perf of the About page's `demoThumbs`.** There's a `demoThumbs.ts` on About (and the memory
    trail mentions a canvas/`DistortImage` history). Confirm whether any WebGL/canvas contexts mount and,
    if so, count them against the ~16 browser ceiling. If there are none, say so and dismiss the concern
    — don't inherit a worry from a sibling repo that doesn't apply here.

Do not stop at this list. It is where I'd start, not the ceiling.

## Axes to cover

**Structure.** Does every file sit where `wiki/ideal-template/architecture.md` says? Any directory
doing two jobs, any file whose location contradicts its name, any leak across the three-tier
`pages → Sections → ui/Cards` boundary (pages thin, owning only `BaseLayout` + SEO; primitives
content-unaware). The pixel skin recently converged onto one `ui/pixel-panel` — confirm nothing
still hand-rolls a pixel surface.

**Correctness & type safety.** `any`, `as` casts, non-null `!`, missing return types on exports,
unvalidated external data at a trust boundary (the Resend contact handler `src/js/contact.ts` +
`src/actions/` if present is exactly where the rules say *not* to be lazy), floating promises,
swallowed errors.

**Duplication & dead weight.** Cross-Section markup duplication (the several `Sections/*/Hero.astro`
— quantify shared markup vs a `<PageHero>`, but do **not** propose a mega-configurable one unless the
evidence demands it), the comment-to-code ratio in `Sections/` (are the 10–15-line prose headers
serving a reader or drowning them — be specific about what to cut), unreferenced exports/components/
styles/config keys/assets/aliases. Prefer deletion; every dead export earns a delete.

**Contract compliance.** Walk the five `ui/README.md` rules (folder shape, native+variant props,
exported `tv()` config, tokens-only, `data-slot` + merged `class`) for every primitive, and the
Sections/Cards contracts. Flag each breach with file:line.

**Tokens & theming.** Any raw Tailwind color (`violet-`/`zinc-`/hex/arbitrary `[…]`) in *markup* is a
defect — it bypasses dark mode. Flag every instance with file:line. Remember the ownership exceptions:
`@layer base` var definitions may hold literals, and a genuinely third-party brand hex is a fact, not
a token. Also verify the WIP redesign keeps both themes legible (the scoreboard's light/dark pairs).

**Accessibility.** Focus visibility on every interactive primitive, labels/names, `aria-*` the markup
actually honors, heading order, alt text, and the reduced-motion discipline — the global guard can't
stop scroll-driven motion, so every `timeline-*` element must also carry `motion-reduce:animate-none`
(only `Reveal` and `MotionCatalog` use timelines here — confirm both comply).

**Performance.** Islands and hydration directives (cheapest first), image handling via `astro:assets`
with intrinsic dims and correct eager/lazy, and any canvas/WebGL context count (see suspect 10).

**SEO.** Against `.claude/rules/seo.md`: one unique title+description per route, canonical/`og:url`
agreement, `noindex` pages excluded from the sitemap, a valid JSON-LD `@graph` with matching `@id`s,
trailing-slash consistency (`trailingSlash: "always"`). The blog is now **live** — confirm the
previously-deferred items (RSS endpoint, Article schema + `article` prop on the post page, required
`heroImage`) actually landed and are correct, since the README's "deliberately deferred" note is now
out of date.

**Documentation.** Does `README.md` describe the theme a buyer actually gets (see suspect 1)? Does
`AGENTS.md`/`.claude/rules/*` match what an agent finds? Is `wiki/` accurate, and does its
`[[wikilink]]` graph resolve?

**Tests & verification.** What non-trivial logic ships with no runnable `*.test.ts` check (per the
house rule), and which checks are wired into `pnpm test` vs orphaned. Eight test files exist
(`schema`, `contact`, `nav`, `readingTime`, `social`, `password/strength`, `Blog/postCards`,
`Project/projectCards`) — confirm coverage of the new contact handler and any new logic in the WIP.

## Verification — required, not optional

Run these and report real output. Do not claim a clean state you did not observe.

```
pnpm install
pnpm lint
pnpm check
pnpm build
pnpm test
node --experimental-strip-types src/js/schema.test.ts
```

The build is static **except `/contact/`** (`prerender = false`), so `@astrojs/node` is mounted and
the prerendered tree lands in **`dist/client/`** with the server entry in `dist/server/` — look under
`dist/client/`. Confirm: valid JSON-LD in `<head>` (a `@graph` with matching `@id`s), `robots.txt` +
`llms.txt` with absolute URLs, `sitemap-0.xml` listing only indexable trailing-slash routes (incl.
`/about/ /blog/ /projects/` and their `<slug>` pages, plus `/contact/` via the sitemap `customPages`
entry), and no `/examples/` HTML shipped.

**Environment caveat:** this is WSL. Anything visual/GPU may not be reliable here — verify what you
can, and mark anything you genuinely could not check as *unverified* rather than guessing.

## Output

A single prioritized report. No preamble, no restating the brief.

For each finding: severity (blocker / high / medium / polish), evidence as `file:line`, one sentence
on why it's wrong *citing the rule it breaks*, the concrete fix, the rough diff size, and the risk of
making the change. Rank most-severe first. Separate **template debt** (what a buyer trips on: the
stale README, the placeholder `site`, misleading claims) from **code debt** (what only a maintainer
sees) — they get cleaned up on different timelines.

End with three things: the **ten changes that deliver the most quality per line of diff**; the list
of things I might expect you to flag that are **fine as-is** and should be left alone, each with its
reason — at minimum the `CLAUDE.md`→`AGENTS.md` pointer (intentional, not drift), the verified-correct
571-icon claim, the 8 `console.log`s (all sanctioned `*.test.ts` output), the tuned literal hex inside
`@layer base` semantic vars, `/projects/` as a real collection, `/contact/` being `prerender:false`,
the owned-not-vendored motion/SEO/icon layers, the deliberate `ponytail:` shortcuts, and the ESLint
teaching relaxations — confirm or challenge each; and an honest statement of what you could not verify
and why.

Be direct. If something is genuinely excellent, say so in one line and move on — I need the problems,
not reassurance. If a lead above is wrong, say it's wrong.
