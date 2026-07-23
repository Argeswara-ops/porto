# Handoff — 8-BitQuest template debt cleanup

## Objective

Implement the approved cleanup plan that takes 8-BitQuest from a strong Astro template to a
reliable buyer-facing product.

Prefer deletion over addition, preserve the existing architecture, and do not introduce
generalized abstractions without demonstrated reuse. Treat `AGENTS.md`, `.claude/rules/*`, and
`wiki/ideal-template/*` as the governing standards.

## Starting state

- Branch: `main`
- Git status at audit completion: clean, aligned with `origin/main`
- Light-mode redesign: already committed in `81c7b39`; keep it and fix its contrast defects
- Baseline verification:
  - `pnpm install`: pass
  - `pnpm lint`: pass
  - `pnpm check`: 224 files, zero issues
  - `pnpm build`: pass
  - `pnpm test`: eight checks pass
  - Direct schema test: pass
- Production build correctly rejects the placeholder `https://example.com`
- `/contact/` is intentionally SSR with `prerender = false`
- The recent `category.trim()` failure was caused by a stale Astro dev content cache, not invalid
  source content. If schema/content fields appear missing, restart with `pnpm dev --force`.

Do not revert or overwrite unrelated work if the branch becomes dirty.

## Recommended execution order

### Batch 1 — Small correctness and buyer-facing fixes

These provide the best improvement per line and should land first.

1. Delete the broken `/credits/` footer link.
   - File: `src/components/Sections/Global/Footer.astro`
   - Do not add a Credits page.

2. Fix project-detail OG images.
   - Pass `entry.data.thumbnail` to `BaseLayout` from `src/pages/projects/[slug].astro`.

3. Correct About document order.
   - Render `About/Hero` before `DevProfile` in `src/pages/about.astro`.
   - Repair the invalid `dl` grouping in `About/DevProfile.astro`.

4. Strengthen collection validation.
   - Require at least one referenced author.
   - Replace unchecked `new Date()` transformations with validated/coerced dates.
   - Run `pnpm dev --force` after changing the schema.

5. Correct Article structured data.
   - Do not invent `dateModified`.
   - Add a stable article `@id`.
   - Pass the organization publisher reference and author URL.
   - Extend `schema.test.ts`.

6. Expand `llms.txt`.
   - Add About, Blog, Projects, Contact, and RSS entry points.

7. Tighten the placeholder-site guard.
   - Compare the parsed hostname exactly instead of using `includes("example.com")`.

Expected risk: low, except for the About visual ordering, which should be checked against the Figma
intent.

### Batch 2 — Light-theme accessibility

Keep the redesign and fix forward.

Retune the light-mode semantic pairs and their direct consumers:

- `--primary`: use a darker primary tone such as `primary-700`
- `--success`: use `success-700`
- `--info` and `--outline`: use a tone around `primary-800`
- Warning foreground: use `base-900`
- Muted scoreboard success text: use approximately `success-800`
- Direct `text-secondary` on light cards: use `text-secondary-700 dark:text-secondary`
- Remove `/50` opacity from focus rings
- Route `.primary-focus` through the semantic outline token

Primary locations:

- `src/styles/global.css`
- `src/styles/tailwind-theme.css`
- `src/components/Sections/Home/Stats.astro`
- `src/components/Sections/Global/Footer.astro`
- `src/components/Sections/Project/ProjectArticle.astro`
- `src/components/Sections/Contact/Faq.astro`
- `src/components/ui/button/Button.astro`
- `src/components/ui/badge/Badge.astro`
- `src/components/ui/alert/Alert.astro`

Recheck small text, focus rings, buttons, badges, alerts, white panels, and scoreboards in both
themes. The target pairs from the audit measured approximately 4.98–6.42:1.

Do not replace the sanctioned literal colors inside `@layer base`; the problem is semantic pair
selection and usage, not literal token definitions.

### Batch 3 — Deployment and product documentation

Rewrite the product surface around what buyers actually receive.

#### README

Replace the stale skeleton description with:

- 8-BitQuest retro-pixel theme overview
- Astro 7, Tailwind v4, strict TypeScript, MDX, and the Node adapter
- Complete route table
- Six blog posts, six projects, and the authors collection
- RSS, sitemap, robots, and `llms.txt`
- UI taxonomy: 39 primitive folders plus seven internal UI entries
- Pixel-panel and token customization map
- Resend contact behavior
- SSR deployment shape
- Required environment variables
- Adapter swap/removal guidance
- Accurate production measurements, or omit measurements that cannot be maintained reliably

Do not claim:

- Fully static output
- Empty collections
- No blog or RSS
- No runtime accounts or keys
- 38 primitives
- That all buyer content lives in config today

#### Contact deployment contract

Update `.env.example` with:

- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL` as optional
- A note that the sender must use a Resend-verified domain

Add to `package.json`:

```json
"start": "node ./dist/server/entry.mjs"
```

Explain that the shipped Node adapter exists for `/contact/`; buyers can swap adapters or remove
SSR/contact behavior.

### Batch 4 — Documentation synchronization

Synchronize current-state documentation in one pass:

- `wiki/overview.md`
- `wiki/ideal-template/architecture.md`
- `wiki/ideal-template/naming-conventions.md`
- `wiki/subsystems/content-collections.md`
- `wiki/subsystems/seo.md`
- `wiki/concepts/page-composition.md`
- `wiki/subsystems/ui-primitives.md`
- `wiki/index.md`
- `src/components/Sections/README.md`
- `src/components/Cards/README.md`
- `.claude/rules/seo.md`

Required corrections include:

- Live Blog, Projects, Contact, RSS, Article schema, breadcrumbs, and hero-image requirements
- Existing `Global/` and `Cards/`
- Current collection contents
- Current UI taxonomy
- ThemeToggle's actual recipe ownership
- Historical features described in past tense

Keep the i18n and Keystatic removal pages as historical records. Do not delete them.

Remove obsolete live-code headers that preserve old routes, colors, paths, or implementation
history. Keep useful Figma provenance, `ponytail:` ceilings, accessibility rationale, and
non-obvious runtime invariants.

### Batch 5 — Architecture cleanup

Make ownership match the documented three-tier model.

Move shared visual components from `Sections/Home` to `Sections/Global`:

- `SectionHeading`
- `CardGrid`
- `Scoreboard`

Then:

- Update imports
- Make `Scoreboard` compose `ui/pixel-panel`
- Move blog/project collection and mapping utilities from Section directories to `src/js`
- Keep page shells thin
- Do not introduce a configurable `PageHero`; existing Hero overlap does not justify it

Rename:

- `Sections/UiCatalog/V2Catalog.astro`
- Suggested name: `NavMarqueeCatalog.astro`

Keep `Tier1Catalog`, `Tier2Catalog`, and `Tier3Catalog`; those tiers are meaningful.

### Batch 6 — Theme and primitive contract cleanup

1. Replace the raw SVG palette in `NotFoundIllustration.astro` with semantic CSS variables or token
   utilities.
2. Amend `ui/README.md` so a primitive may compose an existing exported recipe.
3. Add small exported recipes only where justified:
   - ThemeToggle
   - Searchbox
4. Clarify or split Switch's root/track class targets.
5. Improve Avatar:
   - Accept `ImageMetadata | string`
   - Require explicit alt intent
   - Emit metadata dimensions where available
   - Support loading and decoding props
6. Add stable tooltip IDs and `aria-describedby` in the Tier 2 catalog example.

Do not create seven redundant `tv()` recipes for parts that intentionally reuse an existing
recipe.

### Batch 7 — Tests and small deletion debt

Add targeted checks for:

- RSS rendering and escaping
- Resend success/provider-error/timeout handling
- Shared listbox keyboard behavior

A single browser smoke suite may cover the shared interactive-controller surface if its dependency
and maintenance cost are justified. Do not add a separate testing framework per primitive.

Delete or correct:

- Unused `slugify` and `humanize`
- Unused `.form__input`
- Truly unused author schema fields, after confirming they are not needed for the Article author
  URL work
- Unnecessary `as Node` casts
- Missing explicit exported return types
- Widening config annotations; use `satisfies`

Exercise care around the author fields: the SEO cleanup may make an existing author URL field newly
useful.

## Buyer-data consolidation

Create one typed `portfolioData.json.ts` only for facts buyers are expected to customize:

- Profile identity and biography
- Experience/stat values
- Home introduction
- Contact-facing organization/person copy

Keep presentational labels local. Normalize the inconsistent individual-versus-"we/our crew" voice
during the move.

This is the one proposed data layer whose added structure is justified by buyer customization. Do
not turn it into a generic content registry.

## Leave unchanged

These were audited and are intentional:

- `CLAUDE.md` pointing to `AGENTS.md`
- The exact 571-icon registry claim
- Eight test-file `console.log` calls
- Server-side action `console.error` reporting
- Literal tuned colors inside semantic `@layer base` variables
- Hex colors mentioned only in Figma comments
- Six-entry Projects collection
- Existing `authors/admin.md` and all six valid author references
- `/contact/` with `prerender = false`
- `@astrojs/node`; no second deployment adapter is installed
- Owned motion, SEO, and icon layers
- Deliberate `ponytail:` shortcuts
- ESLint teaching relaxations
- Existing view-transition rebinding strategies
- Existing reduced-motion handling
- Static About thumbnails; there is no canvas or WebGL
- Zero `client:*` islands
- Historical i18n and Keystatic pages
- Straightforward duplicated Hero markup
- Specialized avatar/media frames that are not generic panels

## Definition of done

After every coherent batch, run:

```sh
pnpm lint
pnpm check
pnpm build
pnpm test
node --experimental-strip-types src/js/schema.test.ts
```

Before final handoff, also verify:

- `DEPLOY_ENV=production pnpm build` still rejects the placeholder site
- `/` and `/blog/` render after `pnpm dev --force`
- `/contact/` returns HTTP 200
- Every generated indexable page has:
  - Unique title and description
  - One correctly ordered `h1`
  - Matching canonical and `og:url`
  - Parseable JSON-LD
- Article `@id`, author, publisher, and modification dates are truthful
- Sitemap contains exactly the intended trailing-slash routes
- Sitemap excludes `/404/` and `/examples/`
- No `/examples/` HTML ships
- `robots.txt` and `llms.txt` use absolute production URLs
- Both themes have visible focus states and compliant small-text contrast
- Git status contains only the intended cleanup changes

Visual Figma fidelity, real Resend delivery, and external schema/XML validation remain
environment-dependent and must be reported honestly if they cannot be performed.
