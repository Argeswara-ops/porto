---
title: "Source: galaxy-main reference starter"
type: source
created: 2026-06-30
updated: 2026-07-18
tags: [reference, template, provenance]
sources:
  - CLAUDE.md
status: active
---

# Source: galaxy-main reference starter

The finished template astro-boiler grows toward by **porting patterns** (not copying verbatim). This is
an _external_ source in the [[sources/llm-wiki-pattern|LLM-wiki]] sense — it lives outside this repo and
is read by hand when porting, never imported. The [[ideal-template/architecture|ideal-template]] pages
are the distilled standard; this page is the provenance behind them.

## What & where

- A finished **Cosmic Themes** product: a marketing/blog theme. **Astro 6 + Tailwind 4**, Starwind UI,
  Keystatic CMS, React islands, Pagefind search, en/fr i18n driven by a codegen script. pnpm.
- On the Windows desktop, reachable from WSL at
  `/mnt/c/Users/domi/Desktop/galaxy-main/galaxy-main` (note the **doubled** folder).
- astro-boiler is **Astro 7 + deployment-neutral**, so every port is _adapted_: drop Netlify-specific
  bits, move to Astro 7 APIs, keep it lean.

## What's been distilled / ported so far (2026-06-30)

- **Conventions** → [[ideal-template/architecture]], [[ideal-template/naming-conventions]],
  [[ideal-template/code-quality]] — the component naming, directory structure, and code-quality
  standard, reproduced deploy-neutral and framed as the project's own (not branded to the source).
- **Coding rules** → astro-boiler's `.claude/rules/{astro,typescript,tailwind}.md` are a **verbatim
  port** of galaxy's `claude-starter/.claude/rules/*` (I diffed `astro.md`); `motion.md` and `seo.md`
  are astro-boiler's own later additions, not ports. See [[concepts/lazy-senior-ethos]].
- **Keystatic CMS** → ported with the Node adapter instead of galaxy's hard-coded Netlify; lean MDX;
  `pnpm remove-keystatic` teardown — which was then **run on 2026-07-17**, so the CMS is out again.
  See [[subsystems/keystatic-cms]].
- **Wiki-LLM** → galaxy's `wiki-starter` retargeted at the codebase = this `wiki/` + the `/wiki` skill.
  See [[sources/llm-wiki-pattern]].
- **config-i18n script** → ported, then retired when `remove-i18n` ran (2026-07-17) —
  [[subsystems/scripts]].

## Reusable starters not yet pulled in

The `otherPages`/`codeToggles` content collections, Pagefind search, and the `.tours/` AI tours.
These are the `→ target` markers in [[ideal-template/architecture]]. (Two former targets have since
landed in-house rather than as ports: galaxy's `src/components/starwind/` primitives were rebuilt as
astro-boiler's own `src/components/ui/` library — see [[subsystems/ui-primitives]] — and the
`examples/` route demos exist as the dev-only catalog at `src/pages/examples/[catalog].astro` +
`src/components/Sections/UiCatalog/`.)

> [!note] Grounding rule — when a claim describes the _target_ (something not yet in astro-boiler), it
> traces back here; cite galaxy's real files at the path above when porting, and never invent a path.
> Also mirrored in the `galaxy-main-reference` project memory.

Related: [[ideal-template/architecture]] · [[ideal-template/naming-conventions]] ·
[[ideal-template/code-quality]] · [[subsystems/keystatic-cms]] · [[overview]]
