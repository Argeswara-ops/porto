# Handoff — bring astro-boiler up to the standard grafio-theme proved out

**Target repo:** `~/projects/astro-boiler-main` (this repo)
**Source of evidence:** `~/projects/grafio-theme` — a finished, shipped theme built _from_ this
boilerplate. Every recommendation below is grounded in a real file in one of the two repos.

## Read these before you form an opinion

The standard already exists here. Do not invent a competing one.

1. `AGENTS.md` (this repo) and the five files it `@`-imports from `.claude/rules/`.
2. `wiki/ideal-template/architecture.md`, `code-quality.md`, `naming-conventions.md` — the spec.
3. `src/components/ui/README.md` (the five-rule primitive contract), `Sections/README.md`,
   `Cards/README.md`.
4. In the sibling repo: `~/projects/grafio-theme/scripts/test.mjs`,
   `~/projects/grafio-theme/tasks/cleanup-audit-prompt.md`, and the same five `.claude/rules/*`
   files — they are strictly newer than the copies here.

A finding whose fix is "add a layer" has to justify itself far harder than one whose fix is
"delete this" or "wire the thing that already exists."

## The one-sentence diagnosis

The boilerplate has the **documentation** of a high-quality repo and is missing two of its
**mechanisms**: a test runner that fails when checks go missing, and a loop that carries lessons
learned in a finished template back into the boilerplate's rules. Four of the five rule files have
already drifted behind grafio's copies, and nothing noticed.

---

## Ground truth (verified, not assumed)

- `pnpm test` **passes vacuously.** `scripts/test.mjs:12` globs `scripts/*.test.mjs`; that directory
  has none, so it prints "No script checks left to run." and exits 0. Two real checks exist and are
  never executed: `src/components/ui/password/strength.test.ts` and `src/js/schema.selfcheck.ts`.
- `README.md` documents an i18n system and a Keystatic CMS that were both removed in commit
  `96b74d4`, and lists three commands (`config-i18n`, `remove-keystatic`, `remove-i18n`) that are
  not in `package.json`. `AGENTS.md` and `wiki/` are current; `README.md` is the one doc that was
  never updated.
- `.claude/rules/astro.md` is byte-identical to grafio's. The other four differ: `seo.md` by 56
  lines, `motion.md` by 19, `tailwind.md` by 14, `typescript.md` by 13 — grafio's is the newer side
  in every case.
- `src/components/Sections/Global/` exists and is **empty**, while `Sections/README.md` describes it
  normatively and `wiki/ideal-template/architecture.md` says "don't pre-create empties."
- `tsconfig.json` declares `@videos/*` → `./src/assets/videos/*`, which does not exist.
- `.claude/settings.json` allows fourteen pnpm commands but not `pnpm test` or `pnpm check` — the
  two the docs name as the verification chain.

---

## The work, in priority order

### 1. Make `pnpm test` fail closed — port grafio's runner

**This is the highest-value item in the document.** Replace `scripts/test.mjs` with
`~/projects/grafio-theme/scripts/test.mjs` (51 lines, no deps). Two changes matter:

```js
const tests = readdirSync(src, { recursive: true })
  .filter((file) => file.endsWith(".test.ts")) // src/**, not scripts/*.test.mjs
  .map((file) => path.join("src", file))
  .sort();

// Zero checks is a failure, not a pass: the whole point of discovery is that it cannot quietly
// stop finding the checks it is supposed to run.
if (tests.length === 0) {
  console.error("No checks found under src/ — expected at least one *.test.ts file.");
  process.exit(1);
}
```

It runs each file under `node --experimental-strip-types --disable-warning=ExperimentalWarning`.
The `engines.node >= 22.12.0` floor already in `package.json` is what makes that legal — keep it,
and keep the explicit flag (grafio's header explains why: stripping is only on by default from
23.6).

This is what turns "non-trivial logic leaves one runnable check" from a norm someone remembers into
a rule the tooling enforces. A boilerplate that ships a green-but-empty test command teaches the
opposite lesson on day one.

**Then:** rename `src/js/schema.selfcheck.ts` → `src/js/schema.test.ts` so the runner finds it, and
update the two places that name the old path (`.claude/rules/seo.md` "The check", and the file's own
header comment). Confirm `pnpm test` reports `2/2 check files passed.`

### 2. Rewrite `README.md`

It is the first file a buyer opens and it describes a different product. Model it on
`~/projects/grafio-theme/README.md`, which carries: a Commands table, a Routes table (route → source
file), a Content-collections table, a **"Before you deploy"** numbered checklist, a **"Verifying a
change"** block, and a Docs pointer at `CLAUDE.md` / `.claude/rules/*` / `wiki/index.md`.

The verification block is one line and belongs verbatim:

```sh
pnpm lint && pnpm check && pnpm build && pnpm test
```

Delete every i18n and Keystatic mention. `wiki/subsystems/i18n.md` and `keystatic-cms.md` already
hold the removal records and the re-add paths — that is where a reader should be sent, not into a
feature list for software that isn't here.

### 3. Back-port the four drifted rule files — but generalize the exemplars

Take grafio's version of `seo.md`, `motion.md`, `tailwind.md`, `typescript.md`. What each one
learned:

- **`seo.md`** — the `SITE_URL` env-var pattern replacing a literal `site:`; the note that `schema`
  is always an array so `BaseHead` has nothing to normalize; the blog section flipped from "wire
  these later" to "all wired"; `dist/` not `dist/client/`. Most importantly the **breadcrumb rule**:
  `getBreadcrumbSchema` was deleted after sitting unused long enough that other docs began citing it
  as though it were part of the pattern. That is a general lesson about dead exports in a template,
  not a grafio quirk.
- **`motion.md`** — the block measuring what the UI catalog costs (91 of 101 keyframes in the
  production bundle referenced by no built page; −17.6% CSS if the catalog is excluded) and, more
  valuable, the record that the obvious one-line fix (`@source not …`) was **tried and reverted**
  because `@source` isn't build-mode conditional and it silently killed the dev catalog. Expensive
  lesson, cheap to carry.
- **`tailwind.md`** — the third-party-brand-colour exception to token discipline, with the test
  stated as **ownership, not inconvenience**: if _you_ could restyle it, it is a token.
- **`typescript.md`** — the ESLint description corrected from "_disables_ `no-explicit-any`,
  `no-unused-vars`, and `ban-ts-comment`" to "_downgrades_ `no-explicit-any` and `no-unused-vars` to
  `warn`", which is what `eslint.config.mjs` here actually does. The current text is wrong about
  this repo's own config.

**The care this needs:** grafio's edits cite grafio-only files — `Sections/About/Experience.astro`,
`src/js/blog.ts`, `src/pages/rss.xml.ts`, `getRelatedPosts`. Copying them verbatim would break the
wiki's cardinal rule ("never invent a file, symbol, or flag — verify it exists"). Either restate the
rule without the exemplar, or mark it with the `→` target convention the ideal-template pages
already use. Do not leave a rule file pointing at a path this repo does not have.

### 4. Adopt the `SITE_URL` gate — the only automated check either repo has

Replace the `site: "https://example.com"` literal in `astro.config.mjs` with grafio's shape:

```js
const site = process.env.SITE_URL ?? "https://example.com";
if (process.env.CONTEXT === "production" && site.includes("example.com")) {
  throw new Error("SITE_URL is unset or still the placeholder. …");
}
```

A placeholder domain silently shipping to production poisons canonical, OG, sitemap, robots and
llms in one move, and it is invisible in review. Adapt `CONTEXT` to whichever host the boilerplate
assumes (grafio uses Netlify's); if the boilerplate is host-agnostic, gate on
`import.meta.env.PROD` instead and say so in a comment. Add `.env.example` alongside it — grafio has
one and this repo has none.

### 5. Close the settings and hygiene gaps

- `.claude/settings.json` — add `Bash(pnpm test)`, `Bash(pnpm run test)`, `Bash(pnpm check)`,
  `Bash(pnpm run check)`. The allowlist should cover exactly the chain the README prescribes.
- `CLAUDE.md` is a **symlink** to `AGENTS.md` here. Grafio made it a real pointer file instead, with
  the reason written down: a symlink does not survive being unzipped on a machine that doesn't
  support them. For a template that ships as a zip, copy that fix.
- `tsconfig.json` — either create `src/assets/videos/` or drop the `@videos/*` alias. An alias to
  nothing is a trap that resolves in the editor and fails at build.
- `pnpm-workspace.yaml` — grafio additionally denies `@parcel/watcher`'s postinstall. Cheap
  supply-chain hygiene.

### 6. Decide the empties, don't leave them

Each of these is a small decision that should be made once and recorded, because a boilerplate's
empty directories become every future template's first ambiguity:

- `src/components/Sections/Global/` is empty but normatively documented. Either ship a minimal
  `Header.astro` / `Footer.astro` (every template needs them, and grafio's are a working reference
  with a tested `headerScroll.ts` beside them) or delete the directory. The architecture spec's own
  "don't pre-create empties" rule says the current state is wrong either way.
- `src/data/blog/` + `authors/` are empty, `content.config.ts` defines both collections, `@astrojs/mdx`
  is a dependency — and there is no blog route. Building `/blog/` + `/blog/<slug>/` is the single
  most-repeated first task across templates; grafio's is a working reference including
  `readingTime.ts`, `rss.xml.ts`, `escape.ts` and their checks. If you'd rather keep the boilerplate
  lean, then say so explicitly in the README and drop the unused mdx dependency.
- `getBreadcrumbSchema` in `src/js/schema.ts:207` is exported, unused, and cited in the JSDoc of
  another builder. Grafio deleted it for exactly the reason that combination predicts. Same call
  here, unless you intend to ship a breadcrumb nav.

### 7. Port the audit prompt — the instrument that reproduces the quality

Copy `~/projects/grafio-theme/tasks/cleanup-audit-prompt.md` into `tasks/` here, generalized from
grafio's specifics into a reusable template. Its structure is the reusable part: "Read these before
you form an opinion" (pointing the auditor at the rules and the contract READMEs) → "Ground truth
(verified)" → "Known suspects — confirm, quantify, or dismiss each" → a fixed list of axes
(structure, type safety, duplication, contract compliance, tokens, accessibility, performance, SEO,
docs). And its framing rule, which is why it works:

> The repo already states its own standard. Do not invent a competing one. […] These are leads, not
> findings. Verify every one against the actual files and say plainly if a lead is wrong.

That document, run against a template near the end of its build, is what produced the commits
grafio's log shows: nine accessibility fixes a linter cannot see, 97 re-anchored citations, dead
branches deleted, docs corrected where they had inverted.

---

## The part that actually answers "same quality every time"

The four drifted rule files are the symptom worth fixing structurally. Lessons flowed **from** the
boilerplate **into** grafio at fork time, and nothing has ever flowed back. Every template you
finish will keep learning things — and keep losing them.

Add a **harvest step** to the end of the template lifecycle, as a documented task in this repo:

1. `diff -r` the finished template's `.claude/rules/` against the boilerplate's; every line the
   template added is a candidate lesson. Take the ones that are general, generalize the exemplars,
   drop the ones that are project trivia.
2. Same for `wiki/ideal-template/*` — grafio's `architecture.md` uses a `✓ present / → target`
   annotated tree, which means it already encodes exactly what the boilerplate is still missing.
   Read it as a to-do list, because that is what it is.
3. Same for `src/js/*.ts` and `src/components/ui/` — anything that arrived with a `*.test.ts` beside
   it has already proved it is worth owning.
4. Append the harvest to `wiki/log.md` in this repo, in the format the wiki skill already enforces,
   so the next fork can see what came from where.

One more, optional but cheap: there is **no CI in either repo**. The verification chain is fully
specified and nothing runs it. A single GitHub Actions workflow — `pnpm install --frozen-lockfile`
then `pnpm lint && pnpm check && pnpm build && pnpm test` — would make every one of the mechanisms
above load-bearing instead of advisory. In a boilerplate, that file gets inherited by every template
you start, which is the whole point.

---

## What is deliberately **not** on this list

- **Promoting `no-explicit-any` / `no-unused-vars` to `error`.** Both repos downgrade them on
  purpose, and `wiki/ideal-template/code-quality.md` explains it: a teaching relaxation for a
  buyer-facing template, explicitly not the bar for app code. The boilerplate produces buyer-facing
  templates, so the relaxation stays. It is documented; leave it.
- **A test framework.** The zero-dependency `node:assert/strict` + type-stripping convention is a
  deliberate stance and it demonstrably scales — grafio runs eleven check files on it. Adding vitest
  would trade a mechanism that costs nothing for one that costs a dependency and a config file.
- **The two `.claude/skills/`** (`wiki`, `thermo-nuclear-code-quality-review`). They are byte-identical
  across both repos and already correct. No work.

## Verifying this handoff is done

```sh
pnpm lint && pnpm check && pnpm build && pnpm test
```

`pnpm test` must report a non-zero count of check files. Then confirm: `README.md` names no command
that isn't in `package.json`; `grep -rn "example.com" astro.config.mjs` shows the fallback with its
production guard; no file under `.claude/rules/` cites a path that doesn't resolve in this repo; and
`wiki/log.md` has an entry describing this pass.
