---
title: Log
type: overview
created: 2026-06-30
updated: 2026-07-21
status: active
---

# Log

Append-only, chronological. Every entry starts with `## [YYYY-MM-DD] op | title` so recent activity is
grep-able: `grep "^## \[" wiki/log.md | tail -5`. Ops: `sync`, `ask`, `lint`, `ingest`, `refactor`.
Newest at the bottom. Use today's real date.

## [2026-06-30] refactor | wiki initialized

Scaffolded the wiki (index, overview, log) and the `/wiki` skill. Set up `subsystems/` and `concepts/`.

## [2026-06-30] sync | initial pass over the codebase

First grounded pass. Wrote subsystem pages for i18n, content collections, Keystatic, styling/tokens,
layouts/SEO, and scripts; and concept pages for config-driven design and the lazy-senior ethos.
Touched: overview, index, subsystems/_, concepts/_. Sources read: astro.config.mjs, src/config/**,
src/js/_.ts, src/layouts/_.astro, src/styles/\*.css, src/content.config.ts, keystatic.config.tsx,
scripts/**.

## [2026-06-30] ingest | ideal-template standard

New top-level category `ideal-template/` pinning the target conventions the skeleton grows into, so a
ported feature lands reproducibly. Three pages: architecture (target src/ tree, ✓-present vs →-target,
content-collection ids), naming-conventions (component folders, variant/sub-component suffixes,
per-directory casing table), code-quality (house style + in-repo exemplars). Distilled from the
`galaxy-main-reference` starter; reproduced deploy-neutral and framed as the project's own standard
(not branded to the source). Grounded against real files: src/js/localeUtils.ts, src/config/
siteSettings.json.ts, src/components/Home/Home.astro, src/content.config.ts, .claude/rules/_, tsconfig
.json. Touched: ideal-template/_, index, overview, log, and the `/wiki` SKILL.md (noted the category).

## [2026-06-30] ingest | LLM Wiki pattern + galaxy-main as sources

Reconciled the wiki against the canonical "LLM Wiki" design note the human shared. Added a `sources/`
category (the missing home for external references): `sources/llm-wiki-pattern` (the pattern this wiki
instantiates) and `sources/galaxy-main` (the reference starter — now the grounded provenance the
ideal-template pages cite instead of inline prose). Updated the `/wiki` SKILL.md schema: explicit
three-layer model citing the pattern, `sources/` in the tree, `ingest` now files into `sources/`, two
lint items added (web-search data gaps; next questions/sources), `type:` enum gained standard|source.
Touched: sources/_, ideal-template/_ (provenance links), index, log, SKILL.md.

## [2026-06-30] refactor | primitives folder starwind/ → ui/

Settled the UI-primitives folder name: astro-boiler builds its own library in `src/components/ui/`, not
`starwind/`. Renamed every reference to _our target_ across the wiki (ideal-template/architecture +
naming-conventions) and pointed `.claude/rules/tailwind.md` and the `tasks/ui-library-handoff.md`
decision at `ui/`. **Kept** galaxy's real `starwind/` factual in [[sources/galaxy-main]] (that is
galaxy's actual folder; renaming it would make the source page lie) and clarified ours is the in-house
`ui/` equivalent. Touched: ideal-template/*, sources/galaxy-main, log (+ rules/tailwind.md, handoff).

## [2026-06-30] sync | UI primitives library (Tier 1) + theme follows device

PR #1 merged the Tier 1 `src/components/ui/` library (Button, Input, Label, Textarea, Badge, Card,
Alert, Separator, Skeleton, Avatar) on `tailwind-variants`, plus a shared `_field.ts`, a dev-only
`/examples/ui` catalog, and a switch of the pre-paint theme from default-dark to following the device
`prefers-color-scheme`. New page [[subsystems/ui-primitives]] (the contract, token coupling, shared
field config, dev-only check, the scoped eslint waiver, deps). Promoted `ui/` from target to built in
[[ideal-template/naming-conventions]] (+ lowercase-folder casing nuance). Fixed theme drift in
[[subsystems/styling-tokens]] and [[subsystems/layouts-seo]] (both said "default dark"; now device-
driven, no persistence, re-anchored `BaseHead.astro:81-95`). Touched: subsystems/ui-primitives (new),
subsystems/styling-tokens, subsystems/layouts-seo, ideal-template/naming-conventions, overview, index,
log. Sources read: src/components/ui/** (README, _field.ts, button, input), src/pages/examples/ui.astro,
eslint.config.mjs, package.json, src/layouts/BaseHead.astro, .claude/rules/astro.md. Open: a few
back-references (code-quality, sources/galaxy-main) still one-directional — a `lint` item.

## [2026-06-30] sync | UI primitives Tier 2 built

PR #2 (squash `2d1b7e8`) merged the Tier 2 primitives: Accordion, Tabs, Tooltip, Breadcrumb,
Pagination, Progress, Spinner — all in `src/components/ui/` per the same contract, native-first per the
handoff's interactivity policy. Rewrote [[subsystems/ui-primitives]]: new "Tier 2 (built)" section
(Accordion = `<details>` + exclusive `name` + chevron arbitrary-variant `AccordionItem.astro:12`;
Tooltip CSS-only `group-hover`/`focus-within`; Breadcrumb/Pagination static compounds with
`PaginationLink` reusing the `button` tv `PaginationLink.astro:5,17`; Progress determinate
`role=progressbar`; Spinner CSS `animate-spin`), and called out **Tabs as the only JS primitive** — one
bundled `<script>` wiring ARIA tabs with roving focus + re-init on `astro:after-swap` (`Tabs.astro:54,83`),
degrading to all-panels-visible. Demoted Tier 2 from roadmap → built; Tier 3 stays roadmap. Promoted
`ui/` "built (Tier 1)" → "(Tier 1+2)" in [[ideal-template/naming-conventions]] and refreshed the
[[index]] one-liner. overview.md left as-is (it describes the library architecturally, makes no tier
claim). Sources read: src/components/ui/{tabs,accordion,tooltip,breadcrumb,pagination,progress,spinner}/**,
src/components/ui/README.md, src/pages/examples/ui.astro. Note: review-trimmed Progress `tone` is absent
by design (YAGNI — would return as a `tv` slots variant if needed). Carryover lint item: a few
back-references still one-directional.

## [2026-07-01] sync | ui-primitives — Tier 3 + V2 + advanced-form batch

Touched: subsystems/ui-primitives, index. Re-grounded after PRs #3 (Nav/Marquee) and #4 (advanced-form
batch, 04278de) — the page was three batches stale. Corrected the "Tier 3 remains roadmap" claim →
built (Dialog/Sheet/Dropdown/Select/Checkbox/Radio/Switch/Table, commit 9d6940e). Added "V2 batch"
(Nav, Marquee) and "Advanced form controls" (Slider, InputNumber, ToggleCount, PasswordInput/
PasswordStrength, ComboBox, AdvancedSelect, Searchbox) sections. Expanded the single `_field.ts` note
into "Shared internal modules" covering _field/_dialog/_overlay/_listbox/_client, and recorded two
gotchas: modal centering vs Tailwind Preflight `margin:0` (_overlay.css:44) and Astro `multiple={false}`
emitting `multiple="false"` (AdvancedSelect.astro:84). overview.md left as-is (no tier claim). Sources
read: src/components/ui/{_field,_dialog,_overlay.css,_listbox,_client}, {slider,input-number,
toggle-count,password,combobox,advanced-select,searchbox}/**, README.md.

## [2026-07-01] sync | ui-primitives + layouts-seo — ThemeToggle (V2 Tier 2 §5)

Touched: subsystems/ui-primitives, subsystems/layouts-seo. Built the last unbuilt V2 Tier-2 item —
**ThemeToggle** (`ui/theme-toggle/`), a manual light/dark override reusing the `button` config with a
CSS-only sun/moon flip; the click toggles `.dark` and persists `localStorage("colorTheme")` (re-init via
`_client.ts`'s `onReady`). Paired edit to `BaseHead.astro:81-100`: the inline pre-paint script now reads
that key before the device default and only auto-follows OS changes while unpinned (kept INLINE — moving
it bundled reintroduces the flash). Refreshed the layouts-seo "pre-paint theme" gotcha (was "reads no
saved override / a future toggle would…") to built and fixed its shifted line refs (ClientRouter now
`BaseHead.astro:102`). Dev catalog: swapped the ad-hoc `#theme-toggle` button + script for the real
`<ThemeToggle>` and added a demo section. Sources read: src/components/ui/theme-toggle/**,
src/components/ui/{button,password}/**, _client.ts, src/layouts/BaseHead.astro, src/pages/examples/ui.astro.

## [2026-07-01] sync | ui-primitives — Card variants + sub-parts (PR #6)

Touched: subsystems/ui-primitives (new `### Card` synthesis, Tier 1 paragraph refresh, +4 card sources in
frontmatter). Notes: Card went from a 4-part compound one-liner to a documented section — root + 7 parts
(added CardImage/CardTitle/CardDescription/CardAction), `variant` (default/elevated/outline/interactive)
and `size` knobs. Recorded the three non-obvious techniques: the `--card-p` CSS-var repadding (replacing
a descendant-selector form that silently ate per-part overrides — the PR #6 review fix), the `:has()`
grid header that reserves a column for CardAction only when present, and root `overflow-hidden` clipping
CardImage to the radius. index.md/overview.md unchanged — the tier-level page summary still holds and no
architecture shifted. Sources read: src/components/ui/card/*.astro + index.ts (all 8 files).

## [2026-07-01] sync | new subsystem: motion & animation

Touched: new subsystems/motion; index, overview, subsystems/styling-tokens, subsystems/ui-primitives
(cross-links). Added an owned, **dependency-free** motion layer. `src/styles/motion.css` is a verbatim
CSS port of `tailwind-animations` (© midudev, MIT) into the template's `@theme` — ~78 `animate-*`
utilities + the full modifier set (`animate-duration/delay/bezier/iteration-count/fill-mode/steps/…`,
native `timeline-*` / `animate-range-*`), imported once from `global.css`. Two deviations from upstream:
dropped `--animate-pulse` (dupes Tailwind's built-in, used by Skeleton) and **added the reduced-motion
guard the upstream lacks** (near-zero durations so `animationend` still fires; also neutralizes the
unconditional `scroll-behavior: smooth` at `global.css:85`). New primitive `ui/reveal/Reveal.astro` — a
zero-JS scroll-reveal over the native `view()` timeline, gated on the new `siteSettings.useAnimations`
flag (added to `SiteSettingsProps` + `siteSettings`, closing the gap `astro.md` already referenced) with a
per-call `animate` override and `motion-reduce:animate-none` for a11y. Rule `.claude/rules/motion.md`
added + wired into CLAUDE.md's rule imports and a new gotcha. Dev catalog `UiCatalog` gained a **Motion**
section (all 78 animations hover-to-replay + modifier and `<Reveal>` demos). Verified: `pnpm build` clean;
keyframes, modifier utilities, and the guard all confirmed present in `dist` CSS. Sources read:
tailwind-animations 1.0.1 `src/index.css` (ported), src/styles/{motion,global,tailwind-theme}.css,
src/components/ui/{reveal/**,\_overlay.css,marquee/**,skeleton/**}, src/config/**, src/layouts/BaseHead.astro,
src/components/UiCatalog/UiCatalog.astro.

## [2026-07-01] sync | new concept: page composition & the 404 page

Touched: new concepts/page-composition; index, overview, subsystems/i18n, subsystems/layouts-seo,
subsystems/styling-tokens (cross-links + backrefs). Folded in the new localized **404 page** (PR #8):
`src/pages/404.astro` + `src/pages/fr/404.astro` are thin shells over `components/NotFound/NotFound.astro`,
which splits its artwork into the swappable sub-part `NotFoundIllustration.astro`. Rather than file a
"404 page" note, captured the durable pattern it demonstrates — **thin route → section component →
sub-parts** — as a concept page, using Home + NotFound as the two in-repo exemplars. Key facts pinned:
per-locale routes must be physical files (`prefixDefaultLocale:false`) but route through one shared
component to avoid forking markup; both 404s prerender static so `getLocaleFromUrl` bakes the locale per
file at build time; `NotFound` is the first `noindex` page consumer; copy is three `notfound_*` keys in
`textTranslations` (both locales, `translationData.json.ts:39-42,48-51`); the illustration themes via
`fill="currentColor"` + `text-primary` (follows the primary token in light/dark) and its `<defs>` ids
were renamed off the Figma export to feature-scoped names to avoid document-global id collisions. Sources
read: src/pages/{index,fr/index,404,fr/404,examples/ui}.astro, src/components/{Home/Home,NotFound/**}.astro,
src/config/translationData.json.ts, src/js/{localeUtils,translationUtils}.ts. Out of scope (pre-existing):
styling-tokens/overview still cite `src/styles/motion.css` (now `motion/index.css`) — belongs to the motion PR's sync.

## [2026-07-01] sync | new script: remove-i18n (collapse to a single language)

Touched: subsystems/scripts (new `## pnpm remove-i18n` section + 2 sources in frontmatter), subsystems/i18n
(new `## Removing i18n entirely` section, +remove-i18n.mjs source), index (scripts one-liner). Documented
`scripts/remove-i18n.mjs` — the inverse of the i18n subsystem for buyers who don't want i18n. Design choice
pinned: it does **not** rip out the helper layer (would touch every component); it collapses to the single
`defaultLocale` and strips the multi-locale machinery, which is non-breaking because the helpers are
single-locale-safe (`getLocaleFromUrl` defaults, `getTranslatedData`/`useTranslations` resolve one entry).
What it edits: `siteSettings.json.ts` (locales→[default], drop extra map lines), `astro.config.mjs` (remove
the `i18n` block), `translationData.json.ts` (drop non-default imports + registry blocks), `keystatic.config.tsx`
(drop per-locale `Collections.Blog("fr")` if Keystatic still present — else it fails `astro check`), moves
`src/{pages,config/,data/blog}/<locale>` + `config-i18n.mjs` to `scripts/deleted/`, and unwires `config-i18n`
from package.json. Mirrors the `remove-keystatic` pattern: every rewrite is a pure exported fn with a
companion `remove-i18n.test.mjs` self-check (run against the real fixtures). Validated end-to-end on a
hardlinked clone: script ran, then `astro check` = 0 errors and `astro build` prerendered only `/ /terms
/privacy /404` (no `/fr/*`). Sources read: scripts/{remove-i18n,remove-i18n.test,config-i18n,remove-keystatic}.mjs,
keystatic.config.tsx, src/components/KeystaticComponents/Collections.tsx, src/config/**, astro.config.mjs, package.json.

## [2026-07-01] refactor | extract scripts/utils/locale-config from a code-quality review

Touched: subsystems/scripts (new `## scripts/utils/` section covering locale-config + detect-package-manager,
+source in frontmatter, refreshed remove-i18n.mjs line refs after the shift). Acting on a thermo-nuclear
code-quality review of PR #9: `remove-i18n.mjs` had **byte-duplicated** `parseLocales`/`parseDefaultLocale`
and re-inlined the `setLocalesInSiteSettings`/`removeMapKeyLines` regexes that `config-i18n.mjs` already
owned — with a comment admitting the copy existed only so the script could stay importable after moving
`config-i18n.mjs` to the graveyard. Extracted the canonical set to `scripts/utils/locale-config.mjs`; both
scripts now import it, `collapseSiteSettings` shrank to a 3-line composition, and the workaround dissolved
(the util is never moved, so the import can't dangle). Two minors from the same review: `LegalPage.astro`
`doc` now derives `keyof LegalData` instead of re-hardcoding the `"terms"|"privacy"` union; the
`removeScriptFromPackageJson` non-terminal-entry assumption is now documented. Validated: `config-i18n
--selftest` + `remove-i18n.test.mjs` green, `pnpm lint`/`check`/`build` clean, and an end-to-end clone run
confirmed the collapse still checks (0 errors) + builds with `locale-config.mjs` surviving `config-i18n`'s
retirement. Sources read: scripts/{config-i18n,remove-i18n,remove-i18n.test,utils/locale-config}.mjs,
src/components/Legal/LegalPage.astro, src/config/types/configDataTypes.ts.

## [2026-07-01] ingest | SEO for Astro (dev.to)

Touched: new sources/astro-seo-devto; index (Sources list). Notes: folded the dev.to "SEO for Astro"
article into the wiki as an external reference. Recorded its checklist and — the part that matters —
**what we adopted / adapted / deferred** filtering it through the dependency-free, deploy-neutral ethos:
adopted JSON-LD + canonical≡og:url + OG dims/alt + article:* + robots/sitemap/llms + trailingSlash;
adapted its package picks (`astro-robots-txt`, Partytown, Plausible) into native tags + dynamic `.txt`
endpoints + hand-written builders (owned, not vendored); deferred RSS + a visible breadcrumb (YAGNI —
no blog route yet). Substance lives in [[subsystems/seo]]; provenance cited from there.

## [2026-07-01] sync | new subsystem: technical SEO

Touched: new subsystems/seo; subsystems/layouts-seo (split — trimmed to the shell, re-anchored theme
`152-182`/ClientRouter `184`/siteData `38`, added the schema/article props), overview, index, log; and
the coding standard `.claude/rules/seo.md` (wired into CLAUDE.md rule imports + a new gotcha). Built the
owned, dependency-free SEO layer: typed JSON-LD builders `src/js/schema.ts` (Organization/WebSite/
BlogPosting/BreadcrumbList + `serializeJsonLd` that escapes `<` — with a runnable `schema.selfcheck.ts`);
`BaseHead` now emits an auto Organization+WebSite `@graph` on every page plus any page `schema`
(`BaseHead.astro:61-79,149`), and enriched OG (image dims/alt, `og:locale` `en_US` + alternates,
`article:*` via an `article` prop). Dynamic `robots.txt`/`llms.txt` endpoints (config-driven absolute
URLs), sitemap `filter` dropping noindex routes, and `trailingSlash:"always"` for one canonical URL
shape. `SiteDataProps` gained an optional `sameAs`. Deferred RSS + visible breadcrumbs (no blog route).
Verified: `pnpm lint`/`check`/`build` clean; confirmed JSON-LD `@graph`, robots.txt, llms.txt, and a
noindex-free sitemap in `dist/client`; self-check green. Sources read: src/layouts/{BaseHead,BaseLayout}.astro,
src/js/schema.ts, src/pages/{robots.txt,llms.txt}.ts, astro.config.mjs, src/config/**.

## [2026-07-02] review-fix | scripts hardened: loud edits, surgical keystatic strip, self-retirement

Touched: subsystems/scripts (rewritten to match); scripts/** and their checks. A thermo-nuclear review
found `pnpm remove-keystatic` broken on main: its integrations-collapse regex was anchored to a comment
line the SEO PR (#10) reformatted, so it silently no-op'd — imports stripped, `react()`/`keystatic()`
calls left behind, config broken, "Updated" printed. Its own test caught it, but nothing ran the tests.
Fixes: (1) `stripKeystaticFromConfig` rewritten to surgical line-level edits — the sitemap `filter` and
user redirects now survive full removal (the old code deleted both; the old test asserted the
regression); (2) new `mustReplace` (`utils/shared.mjs`) — every code edit throws on pattern miss instead
of silently no-opping, and drivers transform-everything-before-writing-anything; (3) hyphenated locales:
`config-i18n add pt-br` used to write `pt-br:` (a TS syntax error `remove` couldn't round-trip) — map
keys now quoted via `asKey`; (4) `scaffoldLocaleFiles` copies every `src/config/<default>/*.json.ts`
(was siteData-only; the checklist's translationData imports need legalData too) and the add checklist
gained the `src/pages/<locale>/` step (hreflang links 404 without it); (5) `pnpm test` wired via
discovery-based `scripts/test.mjs`; the old `config-i18n --selftest` became `locale-config.test.mjs`;
(6) both removal scripts now retire themselves + their checks (package.json unwired via JSON round-trip,
position-independent), `scripts/deleted/` gitignored; (7) duplicated `ask()`/`moveToDeleted` collapsed
into `readline/promises` + `utils/shared.mjs`; `exec`+hand-rolled promise → `execSync(stdio:"inherit")`.
Verified: `pnpm test` green; `pnpm lint`/`build` clean; end-to-end smoke runs of both removal scripts in
BOTH orders in a scratch copy (configs parse, no traces, tests green in every state); pt-br add/remove
round-trip compiles under the repo's TypeScript.

## [2026-07-02] refactor | motion catalog: scroll-driven extension

The catalog had scroll plumbing (`timeline-*`, `animate-range-*`) but only time-designed keyframes.
Added an owned extension (end of `src/styles/motion/keyframes.css`, tokens in `motion/index.css`):
`progress`, `parallax-up/down`, `ken-burns`, `fade-through` (scroll-scrub shapes) and dual-use
`wipe-in-up/down/left/right` clip reveals; named-timeline utilities `scroll-timeline-name-*` /
`view-timeline-name-*` / `timeline-scope-*`; and a `@supports not (animation-timeline: view())` guard
making the non-identity-ending shapes inert where scroll timelines are unsupported. Demos added to
`MotionCatalog.astro`. Updated: subsystems/motion (also fixed stale pre-split `motion.css` paths),
`.claude/rules/motion.md`.

## [2026-07-02] sync | full-wiki accuracy pass (all 23 pages fact-checked against the code)

Fan-out verification of every page, every `path:line` citation re-anchored (~50 had drifted after
the Keystatic wiring, Marquee tokens, legal pages, and schema refactor shifted line numbers).
Real inaccuracies fixed: overview/styling-tokens still cited the pre-split `src/styles/motion.css`;
seo.md missed `getSiteSchema` and described BaseHead's old inline graph build; keystatic-cms.md
claimed `mode: server` (reality: no `output` key + `node({ mode: "standalone" })`) and "three
integrations" (four, with `sitemap()`); lazy-senior-ethos/code-quality said CLAUDE.md imports
three rule files (five — motion.md, seo.md added); code-quality's Props exemplar pointed at
Home.astro which has no `Astro.props` (re-anchored to BaseHead.astro:14); architecture.md flipped
`ui/` and `examples/` from → to ✓, dropped the false `env.d.ts` ✓, and noted the icon system
landed at `src/components/svg/icons/` (not the specced `src/icons/`); galaxy-main.md's
"not yet pulled in" list dropped starwind/examples. ui-primitives.md caught up with commits
009c2b4/1c89195/e195943 (MegaMenu, List, `_popover.ts`, `_Chevron.astro`, onReady×9). New page:
**subsystems/icons** (571-icon `<Icon>` registry, was a dangling link from overview/architecture).
i18n.md now covers the `legalData` registry + legal pages. Touched: every page except
naming-conventions, scripts, sources/llm-wiki-pattern, sources/astro-seo-devto (verified accurate
as-is). Code-side fixes alongside: root README rewritten (was the stock Astro-minimal README),
placeholder `public/og.jpg` generated (was a 404 in og:image + JSON-LD logo), stale mdx comment in
content.config.ts, `z` import moved to `astro/zod`, icon counts synced (571), ui/README Slider
theming claim corrected.

## [2026-07-02] sync | keystatic admin broken by trailingSlash "always" — found & fixed

Live-testing the admin (browser, local mode) surfaced a real regression: commit 4813504 (technical
SEO) set `trailingSlash: "always"`, which 404s Keystatic's extensionless slash-less API calls
(`GET /api/keystatic/tree` → Astro's HTML 404 before the injected handler runs), so every collection
view failed with "Unable to load collection … not valid JSON". Keystatic's client hardcodes those
URLs, so the fix is config-side: `trailingSlash: "ignore"` (astro.config.mjs:20) with a comment
naming the constraint; the one-URL-shape discipline is unchanged (directory build, getLocalizedRoute,
canonical, hreflang, OG all still emit slashed URLs — verified in dist). Admin verified end-to-end
after the fix: dashboard, all three collections, entry form. Updated: subsystems/seo (trailing-slash
bullet), subsystems/keystatic-cms + i18n + config-driven + layouts-seo (astro.config line
re-anchors), `.claude/rules/seo.md`. Also: a wedged 4.4h-old dev daemon held a stale Vite
optimize-deps cache (503/504 on @keystatic_core bundles) — restarting + clearing node_modules/.vite
fixed hydration; not a repo defect.

## [2026-07-02] sync | removal scripts hardened after first real fork (astrocraft-web)

Touched: subsystems/scripts (three invariants incl. new "loud prompts", config-i18n remove
automation, remove-keystatic flags/robots/tsconfig, line re-anchors), subsystems/keystatic-cms
(Removing it). Lessons from running the scripts in a real fork: (1) piped stdin made
`readline.question` never settle → node exited 0 with NOTHING done — new `ask` helper
(utils/shared.mjs:20) throws on stdin close, and all scripts gained non-interactive flags
(`--yes`, `--keep-adapter`, `--keep-react`); (2) the bundled "adapter + React" question forced
hand-removing React when only the adapter was wanted — split into independent keeps with comment
rewrites so no mode leaves stale Keystatic mentions; (3) remove-keystatic now also cleans
robots.txt.ts (`Disallow: /keystatic`) and tsconfig's React JSX options; (4) remove-i18n.test.mjs
crashed `pnpm test` on single-locale projects — preconditions in both removal tests are now
graceful exit-0 skips; (5) `config-i18n remove` automated its former manual checklist
(translationData collapse reusing remove-i18n's transform + parking the three locale trees).
Verified: pnpm test/lint green, E2E in a scratch fork (`--yes --keep-adapter` → `config-i18n
remove fr` → test skips → `pnpm build` clean).

## [2026-07-18] sync | Sections/Cards restructure + the i18n/Keystatic removal finally absorbed
Touched: overview, index, concepts/page-composition (rewritten), concepts/config-driven,
subsystems/i18n (rewritten), subsystems/keystatic-cms (now a removal record), subsystems/scripts
(rewritten), subsystems/seo, subsystems/content-collections, subsystems/icons,
subsystems/ui-primitives, ideal-template/{architecture,naming-conventions,code-quality},
sources/galaxy-main.
Two waves of drift folded in: (1) commit 56f86ac "remve" (2026-07-17) ran remove-i18n +
remove-keystatic — single `en` locale, fully static build, trailingSlash back to "always",
robots.txt Disallow gone, scripts self-retired into scripts/deleted/, [catalog].astro replaced the
on-demand ui.astro guard; the wiki had documented none of it. (2) Today's restructure: pages now own
BaseLayout + SEO and compose layout-free sections from src/components/Sections/<Page>/ (+ Global/),
with src/components/Cards/ reserved for card compositions; Home/Legal/NotFound moved under Sections/
(Home.astro → Hero.astro, LegalPage.astro → LegalArticle.astro with a typed `page` prop), the dead
single-locale language switcher was deleted. Contracts written to Sections/README.md +
Cards/README.md; CLAUDE.md structure/i18n claims corrected the same day.

## [2026-07-18] sync | dropped the unconsumed switcher config
Touched: subsystems/i18n, overview, concepts/page-composition. `languageSwitcherMap` left
siteSettings.json.ts and `nav_language` left textTranslations (their only consumer, the Home
language switcher, was deleted in the restructure); siteSettings' header comment no longer cites
the retired config-i18n script or the removed astro.config i18n block.

## [2026-07-18] sync | the i18n helper layer is gone — full single-language commit
Touched: subsystems/i18n (now a removal record), overview, index, concepts/page-composition,
concepts/config-driven, subsystems/{layouts-seo,seo,content-collections,keystatic-cms},
ideal-template/{architecture,naming-conventions,code-quality}, sources/astro-seo-devto.
The user chose the aggressive simplification: deleted src/js/{localeUtils,translationUtils}.ts and
src/config/translationData.json.ts; flattened src/config/en/* → src/config/* (direct imports) and
src/data/blog/en/ → src/data/blog/; siteSettings now exports only siteLang="en" + siteLocale="en-US";
formatDate(date) lost its locale param; BaseHead lost hreflang + og:locale:alternate (og:locale from
siteLocale) and imports siteData directly; BaseLayout lang={siteLang}; 404 copy lives in the route
and flows to the section as props; UI strings inlined. BaseHead line anchors re-cited (135 lines now).
.claude/rules/{seo,astro,typescript}.md and AGENTS.md corrected the same day. code-quality exemplars
re-anchored to schema.ts/textUtils (the localeUtils exemplars died with the file).

## [2026-07-21] refactor | harvest pass — the two missing mechanisms, and the first back-port from a finished fork
Touched: subsystems/scripts (rewritten `pnpm test` entry), subsystems/seo (schema.ts anchors
re-cited, self-check path), concepts/lazy-senior-ethos, ideal-template/architecture (Global/,
@videos), plus README.md, AGENTS.md, CLAUDE.md, .claude/rules/{typescript,tailwind,motion,seo}.md,
Sections/README.md.
Ran `tasks/boilerplate-upgrade-handoff.md` against `~/projects/grafio-theme`, the first finished
theme forked from this skeleton. The diagnosis held: the boilerplate had the *documentation* of a
high-quality repo and was missing two of its *mechanisms*.

(1) **`pnpm test` failed open.** `scripts/test.mjs` globbed `scripts/*.test.mjs`; those retired into
`scripts/deleted/` on 2026-07-17, so it printed "No script checks left to run" and exited 0 while the
two real checks that existed were run by nothing. Retargeted at `src/**/*.test.ts` under
`--experimental-strip-types`, and **made zero-checks-found a failure** — verified by moving both
checks aside (exit 1) and back (`2/2 check files passed.`). `schema.selfcheck.ts` → `schema.test.ts`
so discovery finds it. (2) **No gate on the placeholder domain.** `site` is now
`process.env.SITE_URL ?? "https://example.com"` with a production gate reading Netlify's `CONTEXT`,
Vercel's `VERCEL_ENV` or a generic `DEPLOY_ENV` — host-agnostic, unlike grafio's Netlify-only copy.
Verified in four directions (production+placeholder fails, production+real builds, Vercel signal
fails, deploy-preview builds). Added `.env.example` and a GitHub Actions workflow running the four
documented commands, so a fork inherits CI on day one.

Back-ported the four drifted rule files, **generalizing every grafio-only exemplar** rather than
copying hunks: `getRelatedPosts`/`src/js/blog.ts`, `.page-frame`, `.field` and `Experience.astro` do
not exist here, and a rule citing a missing file teaches the next agent to invent. Corrected
typescript.md's claim about this repo's own ESLint (it *downgrades* `no-explicit-any` /
`no-unused-vars` to `warn`; it never disabled `ban-ts-comment`) and dropped two exemplars that died
with the i18n layer (`arePostsRelated`, `removeLocale`). Measured the UI catalog's CSS cost **on this
repo** instead of importing grafio's number: shared stylesheet 76,413 → 56,695 bytes (−25.8%), 70 of
92 bundled `@keyframes` referenced by no built page — kept with grafio's expensive lesson that the
one-line `@source not` fix was tried and reverted (not build-mode conditional, kills the dev
catalog). Motion counts corrected to the true 87/87.

Two code harvests beyond docs: `SeoProps.schema` narrowed from `JsonLdNode | JsonLdNode[]` to
`JsonLdNode[]`, deleting BaseHead's per-render normalizing ternary (zero call sites, so free); and
`README.md` fully rewritten — it still advertised the i18n system, Keystatic, and three `pnpm`
commands absent from `package.json` since 2026-07-17, making it the last doc describing a different
product. Decisions recorded: empty `Sections/Global/` **deleted** (the architecture spec's own
"don't pre-create empties"); the `@videos/*` alias **dropped** rather than backed by a new empty dir;
no `/blog/` route, now stated plainly in README + seo.md so the two can't drift;
`getBreadcrumbSchema` **kept** — grafio deleted it as a dead export, but this repo ships
`ui/breadcrumb/`, so it is a primitive's schema counterpart, not fiction. The rule it carries is the
transferable part: pair a `BreadcrumbList` only with a *visible* nav.

Found while verifying, not fixed: `Sections/NotFound/NotFoundIllustration.astro` mixes `currentColor`
with 30 raw hex values, a token-discipline violation by the repo's own rule; recorded in
tailwind.md as the outstanding exception rather than written up as a good example.
Added `tasks/cleanup-audit-prompt.md` (grafio's audit instrument, generalized) and
`tasks/harvest-from-finished-template.md` (this pass, written down as a repeatable step) so the next
fork's lessons flow back instead of being lost.
Verified: `pnpm lint && pnpm check && pnpm build && pnpm test` all green; 0 errors across 169 files;
every `schema.ts` / `test.mjs` line anchor in the wiki re-checked against the current files.

## [2026-07-21] refactor | scripts/ down to one file — the graveyard and its orphaned plumbing deleted
Touched: subsystems/scripts (rewritten), overview, index, concepts/{lazy-senior-ethos,page-composition},
subsystems/{i18n,keystatic-cms}, ideal-template/{architecture,naming-conventions,code-quality}, plus
.gitignore, tsconfig.json, eslint.config.mjs.
Follow-up to the harvest pass, prompted by the user asking whether `scripts/deleted/` was necessary.
Checking it inverted the assumption the audit prompt had encoded ("graveyards are committed cruft"):
the graveyard was **gitignored** (`.gitignore:31`) and untracked, so it never reached a fork or a
buyer at all — 120K of purely local redundancy with git. The part that actually shipped was
`scripts/utils/` (12K, **tracked**): `shared.mjs` and `detect-package-manager.mjs`, whose only
importers were the retired scripts inside the gitignored graveyard. The new `test.mjs` imports node
builtins only, so nothing reachable used either file.

Deleted both. `scripts/` is now `test.mjs` alone. Verified first that all ten pre-removal files are
recoverable from **`592dff5`** at their original paths (`git ls-tree -r --name-only 592dff5 --
scripts/`), along with the fr trees and the Keystatic files — so every doc that pointed at the
graveyard now points at that commit instead. Cascade: dropped `scripts/deleted` from `tsconfig.json`
`exclude` and from `.gitignore` (plus its orphaned comment); **un-ignored `scripts/` in ESLint** —
the blanket ignore existed for the messy one-shot scripts and the one remaining file lints clean, so
it is now held to the same bar as shipped code.

Corrected while re-grounding: overview's `site` bullet still said "still `https://example.com`" and
named hreflang (both superseded — it now documents the SITE_URL gate at `astro.config.mjs:16-27`);
architecture claimed "~45 primitives" against a real 38; naming-conventions cited `blog/en/<slug>/`,
a path shape that died with the i18n removal, and `detect-package-manager.mjs` as a live exemplar.
`wiki/log.md` entries before today were left untouched — they record what was true when written.
Verified: `pnpm lint && pnpm check && pnpm build && pnpm test` green (0 errors, 169 files, 2/2 checks).
