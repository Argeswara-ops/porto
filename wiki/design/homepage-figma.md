---
title: Homepage Figma → code
type: design
created: 2026-07-22
updated: 2026-07-22
status: active
---

# Homepage Figma → code

The reproduction record for the **8-BitQuest** Figma design — the durable Figma→token mapping and the
recurring motifs, so each new section lands identical without re-deriving the mapping. Read this
**before** writing markup for a Figma node; add any new one-time decision back here.

- **File:** `GEzHpPLeK9pZhYHGgbmmJX` — [8-BitQuest](https://www.figma.com/design/GEzHpPLeK9pZhYHGgbmmJX/8-BitQuest)
- **Home frame:** node `5:2`. Sections: nav, hero panel, stats strip, latest posts, tech-stack
  badges, featured projects, about, contact, footer.
- The design is delivered as **dark-theme frames**. The token layer flips them to the light theme
  (a cool inversion of dark — light lavender-blue ground, navy ink; NOT the old cream "paper") for
  free — never hard-code a Figma hex; map it to a token below. See [[subsystems/styling-tokens]].

## Figma hex → token mapping

The Figma frames are pinned to the dark palette. Each hex is already an alias in
`src/styles/tailwind-theme.css`; use the **semantic** utility (it flips with the theme) unless the
value is a fixed palette anchor.

| Figma hex | Palette alias (dark) | Use in markup                   | Notes                                                |
| :-------- | :------------------- | :------------------------------ | :--------------------------------------------------- |
| `#101222` | `base-900`           | `bg-background`                 | dark page bg (light = `#e1e1f7` lavender)            |
| `#1c1e2f` | `base-800`           | `bg-card`                       | panels                                               |
| `#272939` | `base-700`           | `bg-muted`                      | stats strip / input                                  |
| `#323445` | `base-600`           | `bg-accent`                     | thumbnails, tags, the nav avatar tile                |
| `#e1e1f7` | `base-100`           | `text-foreground`               | headings / default nav text                          |
| `#bfc7d3` | `base-200`           | `text-muted-foreground`         | body copy                                            |
| `#99cbff` | `primary-300`        | `text-info`                     | airy heading/link blue (the brand wordmark)          |
| `#41a6f6` | `primary-500`        | `bg-primary` / `text-primary`   | action blue (buttons/badges)                         |
| `#ffb2ba` | `secondary-200`      | `bg-secondary`                  | retro pink accents                                   |
| `#63de86` | `success` (dark)     | `text-success` / `fill-success` | the green **active/hover** state                     |
| `#000000` | —                    | `border-border`                 | pixel borders are **always** pure black, both themes |

## Recurring motifs

- **Pixel border + shadow.** Black borders (`border-border`), sharp corners (`--radius: 0`), and the
  signature hard offset shadow `--shadow-pixel` (`4px 4px 0 0 #000`, `shadow-pixel`) /
  `--shadow-pixel-lg` (hero). Always black — the theme's own mark, not a themeable value.
- **Type.** Headings + labels are **Press Start 2P** (`font-display`, uppercase); body is **Space
  Mono** (`--font-sans`, the site default). Both preloaded in `BaseHead`.
- **The retro pointer ►.** A solid right-triangle (`fill-success`) that marks the active/hover item —
  the classic 8-bit menu selector. Reproduced inline as a one-path SVG (the icon registry is
  stroke-based `fill=none`, so it can't supply a filled glyph).
- **Section heading = title + dashed rule.** Every content section (Figma "Heading 2 + Margin"):
  an airy-blue Press Start `.h2` (`text-info`) + a `flex-1` `border-b-4 border-dashed border-base-300`
  filler. Componentised once as `Sections/Home/SectionHeading.astro` (`title`/`id` props).
- **Pixel card.** `bg-card` + `border-4 border-border` + `shadow-pixel` + `p-1`, a thumbnail on
  `bg-accent` with a 4px black bottom divider, then padded content. `Cards/ContentCard.astro` (posts
  - projects). Deliberately **not** built on `ui/card` (that primitive is a `<div>` + 1px border; the
    card needs `<a>`/`<article>` semantics + the pixel structure) — it reuses the same surface tokens.
- **Pixel chip.** Icon + bold-uppercase label in a `bg-card border-4 shadow-pixel` box —
  `Sections/Home/PixelChip.astro`, used by Tech Stack (static `<span>`) and Contact socials (`<a>`,
  green on hover). Icons come from the existing stroke `svg/icons` registry.
- **Category / tag badge.** The Figma "Background+Border" tag (PLAYER 1 / QUEST / LORE / TECH /
  PROJECT). Reproduced by a new **`pixel` variant on `ui/badge`** (2px black frame, chunkier padding,
  bold uppercase) — same opt-in-variant pattern as `ui/nav`'s `retro`. Tone comes from the badge
  `variant`; **LORE** has no semantic token, so it takes a fixed maroon (`bg-secondary-600
text-secondary-100`) via `class`.
- **Blue pixel button.** The pink `.pixel-btn` was parameterised to four CSS vars (pink default) plus
  a **`.pixel-btn--blue`** modifier (action blue) for the Figma READ BLOG / EMAIL ME CTAs. The pink
  render is byte-identical to before.

## Sections built

### Top navigation — node `5:110` (2026-07-22)

`src/components/Sections/Global/Header.astro`, rendered once in `BaseLayout`. Reuses `ui/nav` and
`ui/sheet` (opened/closed via its `_dialog` `data-dialog-open`/`-close` hooks) — no new primitives.
Content is wired: brand = `siteData.name`, links = `config/navData.json.ts`; active state via
`isActive` (`src/js/nav.ts`, tested). Added a **`retro` variant** to `ui/nav/NavLink.astro`
(Press Start 2P, uppercase, `text-success` on hover/active, reserved `pl-6` + `group` for the
absolutely-positioned pointer → zero reflow).

The **theme toggle** and the mobile **MENU** / **CLOSE** controls are the pink retro **`.pixel-btn`**
— a dependency-free port of CodePen "Pure CSS 8bit Button Style" (Maximuz/BdqXXN) in `global.css`
(flat pink face, inset dark-pink shadow, notched black frame, hover/active press). MENU and CLOSE are
worded (no icons); the toggle's light/dark glyphs are pixel-art `meteor` / `moon` from the
`svg/pixel-icons` registry (see the Footer section) — they replaced the original hand-drawn rect glyphs.

**Decisions the single desktop mock didn't specify** (cheap to veto):

- **Placement:** global — in `BaseLayout` above `<main>` (the skeleton was chrome-free; a committed
  theme wants global chrome). Sticky (`top-0 z-50`).
- **Container:** full-bleed bar (bg/border/shadow span the viewport), inner content in
  `.site-container` (`max-w-[1100px]`), not the mock's edge-to-edge `px-16` at 1280.
- **Responsive:** desktop nav at `lg`+ (measured — the four Press Start labels + brand + toggle stop
  fitting below ~1024); below `lg` a pink **MENU** button → **Sheet** drawer (native `<dialog>`). Brand
  wordmark scales `text-base → xs:text-lg → sm:text-2xl` and truncates (`min-w-0`) so a narrow phone
  never overflows.
- **Theme toggle:** added to the header (the mock omits it) — the site is dual-theme and the
  `ThemeToggle` primitive is built to live here.
- **Avatar:** the "Pixel hero avatar" sprite → `src/assets/images/hero-avatar.jpg`, rendered with a
  plain `<img>` on the Vite-fingerprinted import (not `<Image>`) so the build needs **no Sharp** (the
  template ships no images / no Sharp dep). Fine for a 1KB mark.
- **Routes:** `navData` points at `/`, `/blog/`, `/about/`, `/contact/` (trailing-slash). Only `/`
  exists today — the other three 404 until their pages land.
- **Brand copy:** `siteData` rebranded off the "Astro Boiler" placeholder (`name`/`title`/
  `description`/`defaultImage.alt`).

### Footer — node `5:93` (2026-07-22)

`src/components/Sections/Global/Footer.astro`, rendered once in `BaseLayout` below `<main>`. A
full-bleed pixel bar (black **top** border `border-t-4`, **no** `shadow-pixel`) with three groups:
copyright (left, `text-info` #99cbff), a social icon row (centre), legal links (right,
`text-muted-foreground` #bfc7d3). The four social glyphs are **pixel-art** icons — `linkedin`,
`rss`, `youtube`, `email` — from the new `svg/pixel-icons` registry (see below), plus
`.site-container` / `.primary-focus` from `global.css`. Tokens only → light theme flips free. **No
JS**.

Hover follows the house motif — links **and** icons go **green** (`text-success`, the shared
active/hover colour) via `transition-colors`. The legal links rest at `text-muted-foreground`; the
social icons rest **blue in light / pink in dark** (`text-info dark:text-secondary`) — a per-user
change from the mock's dark-only pink, so the icons stay legible on the light lavender ground.
(Verified `hover:text-success` wins over `dark:text-secondary` in dark mode — Tailwind emits the
`hover` rule after `dark`.) Considered reusing `ui/nav`'s `retro` `NavLink` for the legal links but
its baked `text-[16px] pl-6` pointer sizing fights the 8px legal row — a plain tokenised `<a>` is the
right scale.

**Decisions the single desktop mock didn't specify** (cheap to veto):

- **Placement / layout:** global footer in `BaseLayout`; `<body>` became `flex min-h-[100lvh]
flex-col` + `<main class="flex-1">` so the footer pins to the viewport bottom on short pages
  (sticky-footer). Header stays `sticky top-0` inside the flex column.
- **Container:** inner content in `.site-container` (`max-w-[1100px]`) to align with the header/page,
  not the mock's edge-to-edge `px-16` at 1280. Bar height is padding-driven (`py-4`), not the mock's
  fixed 56px, so it can stack.
- **Responsive:** one desktop frame → below **`md` (768px)** the three groups stack to a centred
  column (`flex-col items-center text-center`); at `md`+ they return to `justify-between` row.
  Measured: the three Press Start groups (~216 + ~128 + ~222px) stop fitting comfortably under
  ~768px. Verified column at 390px, row at 800/1280px, no horizontal overflow.
- **Copyright:** year is build-time (`new Date().getFullYear()`); "GAME OVER" kept as retro flavour
  (the site name lives in the header brand, not repeated here).
- **Legal routes:** `PRIVACY → /privacy/`, `TERMS → /terms/` (real pages). `CREDITS → /credits/`
  is an **intended route that 404s until built** — same honest precedent as the nav's
  `/blog//about//contact`.
- **Social glyphs & destinations** (user-picked pixel icons, replacing the first pass's
  share/mail/rss/github): `linkedin → siteData.sameAs` linkedin entry, else `linkedin.com`;
  `rss → /rss.xml` (intended, 404s until the blog+RSS land per `seo.md`); `youtube → siteData.sameAs`
  youtube entry, else `youtube.com`; `email → mailto:{author.email}`. Wire real profiles by filling
  `siteData.sameAs`.
- **Icon colour:** resting **blue in light** (`text-info`), **pink in dark** (`dark:text-secondary`),
  green on hover — a deliberate per-user override of the mock's dark-only pink so the light theme has
  contrast (the first pass flagged the pink-on-lavender contrast issue; this resolves it).

### Pixel-icon registry — `svg/pixel-icons` (2026-07-22)

`src/components/svg/pixel-icons/` — a **second** icon system beside `svg/icons`, for the theme's
pixel-art glyphs (hand-ported from the Figma _"1300 Free Pixel Icons"_ community set, file
`CsRVZj1WwtKNAuqZEE2NT0`). Same primitive contract as `Icon` (`data-slot`, exported `tv()`, tokens,
merged class), but distinct because these glyphs are **fill-based on their own native, often
non-square viewBox** (`youtube` 32×22.86, `email` 32×25.9) — forcing them through the 24×24
stroke-based `Icon` would squash them and break the pixel grid. `<PixelIcon>` keeps each source
viewBox, fills `currentColor`, sizes by **height + `w-auto`** (so non-square glyphs keep aspect), and
sets `shape-rendering: crispEdges`. Registry today: `moon`, `meteor`, `linkedin`, `rss`, `youtube`,
`email`. Used by the footer (4 socials) and the **theme toggle** — whose light/dark glyphs are now
`meteor` (light) / `moon` (dark) at `size="lg"` (the 16px default read too thin on the pink button).
The node the user linked for "sun" (`1178:17346`) is the set's `weather-meteor` glyph — kept as-is
per the user's confirmed choice, so light mode shows a comet, not a sun.

### Home content sections — nodes `5:4`–`14:159` (2026-07-22)

The seven `Main Content` (node `5:3`) sections, in `src/components/Sections/Home/`, composed by
`src/pages/index.astro` inside **one** shared `.site-container` with `gap-10 md:gap-12` (the mock's
~40px section rhythm). New shared pieces: `SectionHeading`, `PixelChip` (both in `Sections/Home/`),
`Cards/ContentCard.astro`, the `ui/badge` `pixel` variant, and the `.pixel-btn--blue` modifier (see
motifs above). Demo imagery ships in `src/assets/images/demo/` (+ `about-avatar.png`) rendered with
plain `<img>` on the Vite import (no Sharp — the Header-avatar precedent), quantised to ~225 KB total.

- **Hero** (`5:4`): pixel panel (`shadow-pixel-lg`), PLAYER 1 tag, H1, intro line, READ BLOG (blue) +
  SAY HI (pink) CTAs. Above the fold → **no** scroll-reveal.
- **Stats** (`5:20`): three neon Press Start stats + short dividers.
- **Latest Posts** (`5:31`) / **Featured Projects** (`14:34`): `SectionHeading` + a 1/2/3-col
  `ContentCard` grid.
- **Tech Stack** (`14:3`): `SectionHeading` + wrapping `PixelChip`s (8 techs).
- **About** (`14:116`): avatar tile + bio + a `LOCATION`/`ROLE`/`FAVORITE` `<dl>`.
- **Contact** (`14:137`): centred prompt + EMAIL ME (blue) / LET'S TALK (pink) CTAs + 3 social chips.

**Content classification.** Real / wired: the hero intro, About bio, and Contact prompt are the
mock's copy verbatim (meaningful, not lorem); EMAIL ME → `mailto:{author.email}`; the Contact socials
derive from `author.twitter` / `siteData.sameAs` (same shape as the footer). Placeholder demo (typed
local lists, flagged in each file to swap later): the 3 posts (the `blog` collection is empty + no
`/blog` route yet), the 3 projects, the 8 techs, the stats, and the About meta. Intended routes that
**404 until built** (same precedent as the nav): `/blog/<slug>/`, `/projects/<slug>/`, `/contact/`.

**Decisions the single desktop mock didn't specify** (cheap to veto):

- **Hero H1 copy:** the mock's placeholder "WELCOME HERO" → **"Welcome, Player One"** (real headline,
  ties to the PLAYER 1 tag). The intro paragraph is kept verbatim.
- **Stats strip stays dark in BOTH themes** (`bg-base-800`, a fixed anchor). The mock maps it to
  `bg-muted`, which flips to a light grey-blue in light mode where the green/blue stats fail contrast;
  a fixed dark scoreboard reads as intentional on the light lavender page. Stat colours:
  POSTS `text-success` / YEARS `text-secondary` (fixed pink) / COFFEE `text-info` — all pass on dark.
- **LORE badge** is fixed maroon (`secondary-600`), not a flipping token (the mock's dark maroon has
  no dark-theme semantic; a flip would turn it light-pink). QUEST → `success`, TECH/PROJECT →
  `primary`, PLAYER 1 → `info`.
- **Tech-stack icons** map to the nearest existing `svg/icons` glyphs; the set lacks exact
  `layers`/`cloud`, so **React → `component`** and **AWS → `globe`**. Twitter/X uses `x-01` (no brand
  glyph in the set) — its logo is an X, so it reads correctly.
- **Responsive** (measured in a 390/768 iframe, since this env ignores window resize / viewport-meta):
  card grids `1 → sm:2 → lg:3`; hero + contact CTAs and the stats strip stack below `sm` (dividers
  `hidden sm:block`); About avatar stacks above the bio below `sm`; tech/social chips `flex-wrap`.
  No horizontal overflow at any width.
- **Scroll-reveal** (`<Reveal>`, decorative) added to the five below-fold sections — auto-gated on
  `siteSettings.useAnimations` + `prefers-reduced-motion` by the primitive. Cards also lift
  (`hover:-translate + shadow-pixel-lg`, `motion-reduce:` guarded).
- **Card is one link:** the whole `ContentCard` is an `<a>` (title = accessible name); the "READ →" /
  "VIEW →" is a visual affordance, not a nested link.

### About page — node `5:278` (2026-07-22)

The **"Pixel Quests - About Me"** frame — six stacked `Main Content` sections in
`src/components/Sections/About/`, composed by `src/pages/about.astro` inside the **same** shell as
`index.astro` (one `.site-container` + `gap-10 md:gap-12`). This is the page the header nav's
**ABOUT** link points at (it 404'd until now). Header + Footer are the existing global chrome —
reused untouched. Visual order top→bottom (by Figma `y`, not node order):

- **Dev Profile** (`5:303`): `SectionHeading` + a pixel avatar tile beside a "character sheet" card
  — `ROLE`/`YRS` rows plus two HP-style skill bars (`FRONTEND 95%` / `BACKEND 90%`). First section →
  above the fold → **no** `<Reveal>`. The bar track is the **fixed black pixel surface** (`bg-border`
  — the same token as the frames), the fill `bg-info`; both read on the card in either theme (the
  card flips, the track stays black). Bars are `aria-hidden` (the `95%` text carries the value).
- **Hero** (`5:280`): the profile panel (`shadow-pixel-lg`) — a `DEV 01` info `Badge`, the H1, a
  two-paragraph bio (mock copy verbatim), the CTAs, and a retro scoreboard **stats strip**. Second
  section, still near the fold → **no** `<Reveal>`.
- **Skill Tree / Tech Stack** (`5:331`): `SectionHeading` + three centred **skill cards** (tag + icon
  - name). Distinct from the home TechStack's inline `PixelChip`s (larger vertical cards) so the
    layout is reproduced inline (used once). The tag is the mock's **inverted** pixel tag (black
    `bg-border` surface + a coloured frame/label per tone) — it does **not** map to the `ui/badge`
    `pixel` variant (tone bg + dark ink); it's a small whole-class tone map (`success`/`secondary`/`info`).
- **Project Log** (`25:61`) / **Achievements** (`25:124`): `SectionHeading` + a `ContentCard` grid via
  the shared **`CardGrid`** — six cards each, reused wholesale. Only the status tag and copy differ
  (`[COMPLETE]`→`success`, `[IN PROGRESS]`→`warning`, `UNLOCKED`→`success`).
- **Setup / Gear** (`25:215`): `SectionHeading` + a single pixel card holding a five-row `<dl>` spec
  list — the same label→value row as the Dev Profile card.

**Reuse.** `SectionHeading`, `CardGrid`, `ContentCard`, `ui/badge` (`pixel`), the `Icon` registry,
`.pixel-btn` (+`--blue`), the `.h1`/`.h2`/`.h3` classes, and the shared demo images — all reused in
place (About sections import the two shared shells from `Sections/Home/`). New surface: **none** —
only the six section files + the route. **The button is `.pixel-btn`**, the site's existing
dependency-free port of the CodePen "Pure CSS 8bit Button Style" (Maximuz/BdqXXN) the brief asked for.

**Content classification.** Real/wired: the bio (mock copy verbatim), the page `title`/`description`
(About-specific SEO), `GET IN TOUCH → /contact/`. Placeholder demo (typed local, flagged per file to
swap): the profile role/years/skill %s, the stats strip, the 6 projects, the 6 achievements, the 5
gear rows, and the thumbnails (**reuse** the six shared demo images — each appears once in Project Log
and once in Achievements — rather than the mock's per-card art, keeping the repo lean; the home-page
placeholder precedent). Intended routes that **404 until built** (same nav precedent):
`/projects/<slug>/`; achievement cards point at `#` (no detail route).

**Decisions the single desktop mock didn't specify** (cheap to veto):

- **CTAs added to the Hero.** The mock's hero has no button, but the brief asked for the `.pixel-btn`.
  Added a matching CTA row (home-hero pattern): `VIEW PROJECTS` (blue) → `#project-log-heading`,
  `GET IN TOUCH` (pink) → `/contact/`. Stacks below `sm`.
- **Stats strip stays fixed-dark in BOTH themes** (`bg-base-700`, `#272939`, a palette anchor that
  doesn't flip) — same call as the home Stats scoreboard. Colours chosen to pass on that dark strip in
  light mode too: `text-success` (both themes pass), `text-secondary` (fixed pink), and the blue uses
  the **fixed `text-primary-300`** alias — semantic `text-info` would flip to a deep blue that fails
  contrast on the dark strip (measured ~2.7:1). Separators are `bg-base-400 h-3.5 w-1`, hidden below
  `lg` where the four Press Start items stack.
- **Skill-tag tones** (mock shows three colours): JS→`success`, Python→`secondary`, React→`info`;
  icons reuse the home TechStack glyph choices (`code-01`/`flash-on`/`component`).
- **Responsive** (measured in a 390/768 iframe — this env ignores window resize): card grids
  `1 → sm:2 → lg:3`; skill cards `1 → sm:3`; Dev Profile avatar stacks above the card below `sm`; hero
  CTAs + stats strip stack below `sm`/`lg`. **No horizontal overflow at any width** — the long
  `ACHIEVEMENTS UNLOCKED` heading forced dropping **`whitespace-nowrap` from the shared
  `SectionHeading`** (the home's shorter titles are byte-identical; long titles now wrap on narrow
  screens instead of overflowing 390px by 22px).
- **Reveal** on the four below-fold sections (Tech Stack / Project Log / Achievements / Gear); the two
  above-fold sections (Dev Profile, Hero) are plain (a scroll-timeline element in view on load renders
  mid-progress). Degrades to static under reduced motion (the primitive's `motion-reduce:animate-none`
  - `opacity:1` base, verified).

### Projects pages — nodes `72:7` (list) + `72:191` (detail) (2026-07-22)

The **first dynamic, collection-driven** pages. A `projects` content collection (`content.config.ts`,
rich Zod schema) backs six `.mdx` entries at `src/data/projects/<slug>/index.mdx`; the glob loader
gives bare-slug ids (`realtime-chat`, verified in `dist/`). The **free-form "Project Overview" prose
is the MDX body** (`render()` → `<Content />`); everything the detail page lays out in fixed slots —
the spec table, the feature list, the challenge/solution pair, the ARC_MAP glyph+caption — is
**structured frontmatter**, so it renders without parsing prose. `status` drives the retro card badge;
`order` sorts the listing.

- **Listing** (`/projects/`, node `72:7`) — `pages/projects/index.astro` composes
  `Sections/Project/ProjectsHero.astro` (MISSION ARCHIVE tag + PROJECT LOG H1 + blurb) and the shared
  **`CardGrid`** (`headingId="all-systems-heading"`, title "All Systems"), fed the collection sorted by
  `order`. Cards are the existing **`ContentCard`** — status → badge (`[Complete]`→`success`,
  `[In Progress]`→`warning`) via the new `Sections/Project/projectCards.ts` (`statusMeta` +
  `toProjectCard`, tested in `projectCards.test.ts`).
- **Detail** (`/projects/<slug>/`, node `72:191`) — `pages/projects/[slug].astro` (`getStaticPaths`
  keyed on `entry.id`, which the card `href` reuses so the two can't drift) renders
  `Sections/Project/ProjectArticle.astro`: back-nav → `/projects/`, hero (status + `MODULE_ID`, H1,
  tagline), a **2/3 + 1/3 content split** (left: Overview card wrapping the MDX slot + System Features
  list with `bg-info` square bullets and bold-blue leads; right: SYS_SPECS `<dl>` with green values +
  ARC_MAP framed glyph), and a Challenges & Solutions block (`# Threat` pink / `# Remedy` green).

**New canonical surface:** `ui/pixel-panel/` — the bare pixel surface (`bg-card border-4
border-border shadow-pixel[-lg]` via `tv`, `elevated` prop) promoted to a **ui primitive** so every
layer can reuse it without a bad cross-`Sections` dependency. It is now the **single** source for the
surface: the two project heroes, the ContentCard shell (`as="article"`), the About Dev-Profile stats
card + Gear card (`as="dl"`), and the Home/About hero panels (`as="section"`, which also collapsed
their redundant `<section><div>` nesting) all render through it — the cluster no longer lives inline
anywhere. Behaviour-preserving: `--card-foreground` equals `--foreground` in both themes, so the two
heroes (which set no text colour before) are visually unchanged. `data-access` for the collection is a
sibling `Sections/Project/projectData.ts` (`getSortedProjects()` — the one draft-filter + order-sort
behind the listing, the home grid, and the detail `getStaticPaths`), kept apart from the pure,
astro-free `projectCards.ts` so `pnpm test` can still type-strip the latter.

**Reuse (no other new surface):** `CardGrid`, `ContentCard`, `SectionHeading` (via CardGrid),
`ui/badge` (`pixel`), the `Icon` registry (`arrow-left` back-nav; the ARC_MAP box uses a single fixed
decorative glyph — `git-branch-02` — since it's a placeholder diagram frame and `archCaption` carries
the per-project meaning), the `.h1`/`.h3` classes, `.primary-focus`, and the shared demo images (each
of the six reused once as a placeholder thumbnail — the home/About precedent).

**Content classification.** Real/wired: the realtime-chat entry is the **mock's copy verbatim**
(overview, features, specs, challenge/solution, tagline); the SEO title/description per entry. The
other five are **plausible placeholder demo** matching their listing cards (flagged to swap).
Thumbnails are the shared placeholder art; alts honestly describe the image, not the project.

**Decisions the two desktop mocks didn't specify** (cheap to veto):

- **Nav: PROJECTS replaces BLOG.** Both frames show `HOME · PROJECTS · ABOUT · CONTACT` (no Blog).
  Took the mock's 4-label nav exactly — Projects is now a real page, Blog still 404s and stays reachable
  via the home READ BLOG CTA + footer RSS. Keeps the nav at the tested 4-label width (no `lg` overflow
  re-measure). One-line revert: re-add `{ label: "Blog", href: "/blog/" }` to `navData`.
- **Home Featured Projects now reads the collection** (top 3 by `order` via `toProjectCard`), replacing
  its hardcoded 3-card list whose slugs 404'd — one source, links resolve. Home's featured art/titles
  therefore change to the first three collection entries.
- **About "Project Log" section removed** (per the brief) — `Sections/About/ProjectLog.astro` deleted,
  dropped from `about.astro`; its orphaned hero CTA `#project-log-heading` repointed to `/projects/`.
  `demoThumbs.ts` stays (Achievements still uses all six).
- **Content split stacks below `lg`** (1024) — measured: at 768 the two content-dense columns are
  cramped, so single-column there; 2/3 + 1/3 only at `lg`+. Listing grid `1 → sm:2 → lg:3`. **No
  horizontal overflow at 390/768/1280** (iframe-measured; this env ignores window resize). Verified in
  **both themes**; the pages are fully static (no new animation — only CardGrid's reused, RM-guarded
  Reveal animates).
- **Heading colours** follow the mock: left-column card titles + Challenges heading = `text-secondary`
  (pink, `.h3`); right-column terminal labels SYS_SPECS/ARC_MAP = `text-info` (blue, smaller); spec
  values + `# Remedy` = `text-success`; `# Threat` = `text-secondary`.

### Blog pages — nodes `76:4` (listing) + `5:128` (article) (2026-07-22)

The blog subsystem the skeleton **deliberately deferred** (`seo.md`: "no `/blog/` route ships — a
stated decision"). The `blog` collection existed but shipped empty + route-less; this lands it. The
task's "Project page" wording was a loose copy of the projects prompt — the two Figma nodes are
authoritative and are unmistakably a **blog listing + article**, and the "≥3 mdx articles" + "link in
the nav" asks confirm it. Same collection-driven shape as the projects pages: `blogData.ts` (draft
filter + `pubDate` sort), `postCards.ts` (pure `categoryMeta` + `toPostCard` + `getAdjacentPosts` /
`getRelatedPosts`, tested), `pages/blog/index.astro` + `pages/blog/[slug].astro`.

- **Listing** (`/blog/`, node `76:4`) — `Sections/Blog/BlogHero.astro` (MISSION CONTROL tag + LATEST
  POSTS H1 + Dev Dispatches blurb, verbatim) + the shared **`CardGrid`** ("Archive Modules"), fed the
  collection newest-first. Cards are the existing **`ContentCard`**; `category` → the retro status
  badge via `categoryMeta` (QUEST→success, TECH→primary, GUIDE→warning, LORE→fixed maroon
  `bg-secondary-600`, DEV LOG→info, else primary — the home Latest Posts precedent).
- **Article** (`/blog/<slug>/`, node `5:128`) — `Sections/Blog/BlogArticle.astro`: breadcrumb
  (`ui/breadcrumb`) → article `PixelPanel` (category badge, H1, meta row `avatar · date · read · byline`,
  framed hero banner, the MDX body, footer `#tags` + `◄PREV NEXT►`) + `RelatedPosts.astro`
  ("More Quests", ≤2 cards). **The article body IS the MDX body** (`render()` → `<Content />`) — unlike
  the projects' fixed slots, blog prose is free-form (H2/list/blockquote/code), so it renders as
  markdown and is styled by a new global **`.blog-prose`** class (global, not scoped — MDX HTML is
  outside Astro's scope; tokens flip with the theme, the fenced code block stays a fixed-dark Shiki
  panel). The H2 `►` is a green `clip-path` triangle (font-safe, no glyph); list bullets are `bg-info`
  squares; the blockquote takes the pink `border-secondary` bar.

**New surface:** the six `Sections/Blog/*` files, `src/js/readingTime.ts` (word-count → "N MIN READ",
tested), the `.blog-prose` class, one `authors/admin.md` entry (byline avatar reuses `hero-avatar.jpg`),
and a hand-rolled **`pages/rss.xml.ts`** (dependency-free RSS 2.0 — `seo.md` says RSS ships with the
blog; resolves the footer's existing `/rss.xml` link + a new BaseHead `alternate`). **Reuse:** CardGrid,
ContentCard, SectionHeading, ui/pixel-panel, ui/badge (`pixel`), ui/breadcrumb, the Icon registry
(`arrow-left`/`arrow-right`), Reveal, `.h1`/`.h2`/`.h3`, `.primary-focus`, and the existing demo images.

**Content classification.** Real/wired: the listing's six card titles/excerpts/categories are the
mock's verbatim; `the-art-of-pixel-graphics` carries the **article frame's verbatim body** (dithering,
the list, the blockquote, the render-loop code, `#pixel`/`#gamedev`) — the flagship; the SEO
title/description per entry. Placeholder demo (flagged): the other five bodies (plausible authored
prose, not lorem), the `admin` byline, and the retro dates. The blog schema was reshaped (heroImage
now **required** + `heroImageAlt`, added `category` + `tags`) — safe, it had zero entries.

**Decisions the two desktop mocks didn't specify** (cheap to veto):

- **Nav: `ABOUT · PROJECTS · BLOG · CONTACT`** (per the user — HOME dropped from the bar; the brand
  wordmark is the home link, the logo-as-home pattern). Four Press Start labels fit the desktop bar at
  `lg` (iframe-measured at 1024: no overflow, desktop nav shown, MENU button hidden), so the header
  keeps the original `lg` breakpoint. (An earlier five-label pass needed `xl`; dropping HOME returned
  it to `lg`.)
- **Home Latest Posts now reads the collection** (top 3 by date via `toPostCard`) — the rewire its own
  TODO asked for; the three placeholder slugs (`building-the-ultimate-css-grid`, …) are now real, so
  those long-dead home links resolve. Same move Featured Projects got.
- **Related + prev/next are computed, not transcribed.** The mock names two specific related posts;
  instead `getRelatedPosts` picks same-category-then-recent siblings and `getAdjacentPosts` the date
  neighbours, so every link resolves and there are no orphan routes. Article frame's "DEV LOG" tag and
  "Mastering the 8-Bit Grid" H1 are realized as the flagship post's own `category` (LORE) + title
  (card and article share one field) — the two frames show different example posts, so the listing
  frame (the catalog) wins on the concrete inventory.
- **Article column** is the mock's centred ~800px reading width (`max-w-[800px] mx-auto`) inside the
  1100px `.site-container`; the listing is full container like the other pages.
- **One image per post** — the card thumbnail and the article hero banner share the post's `heroImage`
  (the projects/About placeholder precedent), rather than the mock's separate card vs banner art.
- **Article H1 = `text-foreground`** (matches the mock's light title), where the listing/hero H1s stay
  `text-info` blue — the article reads as content, not a marketing hero.
- **Code-block copy button omitted** (the mock shows one) — it needs JS and the template favours
  zero-JS; the fenced block ships static. Add a bundled `_client.ts` copy handler if wanted.
- **Responsive** (iframe-measured 390/768, this env ignores window resize): listing grid `1 → sm:2 →
  lg:3`; related `1 → sm:2`; the article's long code lines scroll **inside** the `<pre>`
  (`overflow-x-auto`), never the page. **No horizontal overflow at 390/768** (page scrollWidth ==
  clientWidth); verified light **and** dark. Below-fold sections use the RM-guarded `Reveal`.
- **SEO:** each article emits a `BlogPosting` + a `BreadcrumbList` matching the visible breadcrumb
  (`seo.md` — never one without the other) + the `article` prop (`og:type=article`).

### Contact page — node `9:4` (2026-07-22)

The **"contact-page"** frame — the first (and only) **server-rendered** page. Three stacked blocks in
`src/components/Sections/Contact/`, composed by `src/pages/contact.astro` in the same shell as
index/about (one `.site-container` + `gap-10 md:gap-12`). This is the nav's **CONTACT** target (it
404'd until now). Visual order top→bottom:

- **Hero** (`9:22`): `PixelPanel as="section" elevated` + a `QUEST START` info `Badge` (pixel) + the H1
  (`.h1 text-info`) + the intro line (mock copy verbatim). Above the fold → NO `<Reveal>`. Byte-for-byte
  the Home/About hero shape.
- **Form** (`9:31`): the `SEND MESSAGE` card — the **one server-driven piece**. Reuses `PixelPanel`
  (elevated) + the `Input`/`Textarea`/`Label` primitives, re-skinned to the pixel field look
  (`bg-accent` + a 4px black frame) via a shared class. Fields: YOUR NAME / EMAIL ADDRESS / SUBJECT
  (Input) + MESSAGE TRANSMISSION (Textarea). Submit is the new **green** pixel button.
- **InfoCards** (`9:53`): three `PixelPanel` cards beside the form — a `pixel` `Badge` (E-MAIL→info /
  COMMUNITY→success / CODEBASE→secondary), an `.h3` title, a blurb, and a **linked** value box
  (`bg-accent border-2`, green-on-hover).
- **Faq** (`9:75`): `SectionHeading` + a `PixelPanel` of `Accordion` rows (native `<details>`,
  zero-JS). Below the fold → `<Reveal>`.

**The Resend contact form (the grafio pattern; astrocraft-doc → `grafio/contact-form.md`).** The site
was fully static; this adds its **one on-demand route**. `contact.astro` sets `export const prerender
= false`; `@astrojs/node` (`mode: "standalone"`) is mounted in `astro.config.mjs` so that one route
runs server-side — chosen over Netlify/Vercel because this project deploys behind **Dokploy + Traefik +
Docker** (a Node server fits; swap the adapter in two lines if the host changes). The pieces:

- **`src/js/contact.ts`** — the trust boundary, pure + framework-free (no `import.meta.env`, no
  `fetch`) so it type-strips for `pnpm test`: the `contactSchema` (Zod; CRLF refine on `name`/`subject`
  = header-injection guard), `MIN_FILL_MS` + `spamReason` (honeypot `_gotcha` + time gate `_ts`,
  server-clock), `escapeHtml`, and `buildEmail` (HTML-escaped body, `replyTo` = sender). Runnable
  check: `contact.test.ts`.
- **`src/actions/index.ts`** — the `contact` Astro Action (`accept: "form"`, so the native
  `<form method="POST">` works **with JS disabled**). Runs the spam gates, checks the mail keys **at
  request time** (a missing key never breaks the build), then a plain `fetch` to Resend (`no SDK`, 10s
  timeout). Resend's own reply is logged server-side, never shown (it can name the account).
- **`Form.astro`** reads `Astro.getActionResult` → success replaces the card (`role="status"`),
  validation errors render per-field (`isInputError` + `aria-invalid` + `aria-describedby`),
  everything else in one `role="alert"`. A tiny script moves focus to the status region after the
  swap (no `preventDefault` — the view-transition router owns the submit).
- **Env** (in `.env.example`): `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, optional `CONTACT_FROM_EMAIL`
  (defaults to `onboarding@resend.dev`, which only delivers to the account owner). **Turnstile is
  deliberately omitted** to keep the no-JS path (it's the optional both-or-neither layer in grafio).

**Token mapping (all already in the table above).** Form fields + info-card value boxes = `bg-accent`
(#323445 dark / #bfc7d3 light) + `border-border` (always black); labels = `text-info`; SEND MESSAGE
title = `text-secondary`; FAQ question = `text-secondary`, answer = `text-muted-foreground`, dashed
rules = `border-base-300` (#89919c). New surface: a **`success` palette ramp** (`--color-success-*` in
`tailwind-theme.css`, anchored on the Figma greens) — the one status colour promoted to a full ramp so
the semantic `--success` reads it and the new **`.pixel-btn--green`** modifier can point at fixed,
non-flipping anchors (`-400` face / `-300` hover / `-900` ink / `-600` depth), the action-green
counterpart to `--blue`. Values match the old green literals exactly, so nothing shifts visually.

**Reuse (no new primitive):** `PixelPanel`, `Badge` (`pixel`), `Input`/`Textarea`/`Label`,
`Accordion`/`AccordionItem`/`AccordionContent`, `SectionHeading`, `Reveal`, `socialUrl`, the
`.h1`/`.h3` classes, `.primary-focus`, `.pixel-btn` (+ the new `--green`).

**Content classification.** Real/wired: the hero + FAQ copy is the mock's verbatim (meaningful, not
lorem); the E-MAIL value is `siteData.author.email` (→ mailto); GITHUB/DISCORD derive from
`siteData.sameAs` via `socialUrl` (header/footer precedent), NOT the mock's placeholder brand
(HELLO@PIXELQUESTS.COM etc.). Editorial placeholder (flagged): the three FAQ Q&A.

**Decisions the single desktop mock didn't specify** (cheap to veto):

- **Deploy target: `@astrojs/node` standalone**, per the Dokploy/Traefik/Docker infra (astrocraft-doc's
  own deploy shape). Grafio ships Netlify by default — swap is two lines (`pnpm add @astrojs/vercel` /
  `@astrojs/netlify` + one `adapter:` line); nothing else knows which adapter is mounted. The build is
  now `dist/client` + `dist/server` (not a flat `dist/`) — `seo.md`'s check note was updated.
- **`/contact/` is added to the sitemap by hand** (`sitemap({ customPages })`) — the on-demand route
  emits no static file, so the auto-enumerator can't see it (the one manual entry `seo.md` prescribes).
- **Error affordance is the red message + `aria-invalid` ring, not a recoloured border** — black
  borders are the theme invariant, and it also sidesteps grafio's "colour in a field override beats
  `state=error`" trap. Fields carry SHAPE only in their class override.
- **FAQ: independent rows, first open**, with a bespoke retro **+/−** marker (two token bars, the
  vertical fades when open) to match the mock's "+", where the accordion primitive's default trigger
  draws a chevron. The mock shows all three expanded (a static render); first-open-collapsible is the
  conventional read.
- **Responsive** (iframe-measured 390, this env ignores window resize): form/info grid
  `1 → lg:[minmax(0,1fr)_340px]` (form grows, info column fixed 340, stacks below `lg`); form CTAs and
  fields are full-width; FAQ rows wrap. **No horizontal overflow at 375/1521**; verified light **and**
  dark. Below-fold FAQ uses the RM-guarded `Reveal`; the +/− `transition-opacity` is caught by the
  global reduced-motion guard.
- **Nav unchanged** — CONTACT was already `navData` → `/contact/` (it just resolves now). The "≥3 mdx
  articles / nav link" line in the task is leftover from the blog prompt: the `blog` collection already
  ships **6** mdx articles and BLOG is already in the nav, so it's satisfied — no redundant posts added.
