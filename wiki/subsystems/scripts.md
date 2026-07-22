---
title: Scripts
type: subsystem
created: 2026-06-30
updated: 2026-07-21
tags: [scripts, tooling]
sources:
  - scripts/test.mjs
  - package.json
  - eslint.config.mjs
status: stable
---

# Scripts

`scripts/` holds **one file**: `test.mjs`, the check runner behind `pnpm test`. Everything else this
subsystem once contained has been deleted, in two stages.

**2026-07-17** (commit `56f86ac` "remve") — the one-shot removal scripts `remove-keystatic` and
`remove-i18n` were both run. By design they moved themselves, the `config-i18n` locale tool,
`utils/locale-config.mjs` and all their `*.test.mjs` checks into a gitignored `scripts/deleted/`
graveyard, and unwired their `package.json` entries. What those scripts did is recorded in
[[subsystems/keystatic-cms]] and [[subsystems/i18n]].

**2026-07-21** — the graveyard and the leftover `scripts/utils/` were deleted outright. The graveyard
was gitignored, so it was never in the repo a fork or a buyer receives; `utils/` **was** tracked and
shipped, but nothing imported it — its only consumers were the retired scripts inside the graveyard.
Keeping unreachable plumbing on the theory that a future script might want it is the opposite of the
house ethos, and git makes the theory unnecessary.

> [!note] Recovering any of it
> Everything is in the **`592dff5`** tree at its original path — one commit before the removal:
>
> ```sh
> git show 592dff5:scripts/config-i18n.mjs
> git show 592dff5:scripts/remove-i18n.mjs
> git show 592dff5:scripts/remove-keystatic.mjs
> git show 592dff5:scripts/utils/shared.mjs
> git show 592dff5:scripts/utils/locale-config.mjs
> git show 592dff5:scripts/utils/detect-package-manager.mjs
> git ls-tree -r --name-only 592dff5 | grep -iE 'fr/|keystatic'   # the fr + Keystatic trees
> ```
>
> `git show 592dff5 --stat` lists the whole pre-removal tree.

## What remains

- **`pnpm test`** → `scripts/test.mjs` — runs every `*.test.ts` under `src/`, discovery-based
  (`test.mjs:19-22`), each under `node --experimental-strip-types` (`test.mjs:36-40`; the explicit
  flag is what makes it work on the Node 22.12 floor in `engines`, not just 23.6+ where stripping is
  on by default). **Zero checks found is a failure, not a pass** (`test.mjs:26-29`) — the whole point
  of discovery is that it cannot quietly stop finding the checks it is meant to run.

  > [!note] It used to glob `scripts/*.test.mjs` instead, so that it stayed green in every state of
  > the one-shot removal scripts. Once those retired into the graveyard, that made `pnpm test` pass
  > **vacuously** — printing "No script checks left to run" and exiting 0 — while the two real checks
  > that existed (`src/components/ui/password/strength.test.ts`, `src/js/schema.test.ts`) were never
  > executed by anything. A boilerplate that ships a green-but-empty test command teaches the
  > opposite of the rule it is supposed to enforce. Retargeted at `src/` and made to fail on zero on
  > 2026-07-21.

That is the whole subsystem. The checks it runs live next to the code they cover, under `src/` — not
here.

## Conventions

Scripts are ESM `.mjs`. `scripts/` is **no longer excluded from ESLint** — the blanket
`scripts/**` ignore existed for the messy one-shot scripts, and the one file left lints clean, so it
is held to the same bar as shipped code (`eslint.config.mjs`).

A future one-shot maintenance script should follow the retired ones' shape, which is worth reading in
`592dff5` before writing a new one: pure exported transforms, a `String.replace` wrapper that
**throws when the pattern matched nothing** (loud edits — a silent no-op rewrite is the failure mode
that matters), EOF-safe prompts that throw rather than hang when stdin closes, transform-before-touch,
and a self-check that skips cleanly when its precondition is already gone. Delete it once it has run;
git is the graveyard.

Main threads: [[overview]] · [[subsystems/i18n]] · [[subsystems/keystatic-cms]] ·
[[concepts/lazy-senior-ethos]]
