# TypeScript — clean-code rules

Grounded in the house style of this template (`src/js/*.ts`, `src/config/*`). Lazy-senior
ethos: the best code is the code never written. Reuse before adding, stdlib before deps,
one line before many.

## House patterns (do these — they're the template's own style)

- **Explicit return types on exported functions.** Every util declares it
  (`export function getAllPosts(...): Promise<CollectionEntry<"blog">[]>`). It documents intent
  and catches accidental widening.
- **`as const` for fixed config, then derive the type from the value** — don't hand-write a parallel
  union:
  ```ts
  export const locales = ["en", "fr"] as const;
  type Locale = (typeof locales)[number];          // "en" | "fr"
  function formatDate(d: Date, locale: Locale) { … }
  ```
- **Options object with destructured defaults**, typed by a named interface, for functions with
  several optional knobs:
  ```ts
  // Shape only — no collection util ships in this skeleton yet (src/js/ is textUtils + schema).
  // Write the first one in this shape.
  interface FormatPostsOptions { sortByDate?: boolean; limit?: number }
  export function formatPosts(posts: Post[], { sortByDate = true, limit }: FormatPostsOptions = {}) { … }
  ```
- **Constrained generics** over `any` when a util spans collections:
  `function filter<T extends CollectionKey>(c: CollectionEntry<T>[]): CollectionEntry<T>[]`.
- **Type guards in predicates** to narrow inside `.filter`/`.map`:
  `categories.filter((c): c is string => typeof c === "string")`.
- **JSDoc on exported utilities** — one `*` summary line, `@param`/`@returns`, and a usage example.
  It's the house convention; keep it.
- **Inline `type` imports**: `import { type CollectionEntry, getCollection } from "astro:content";`
  Use `import type { … }` for purely-type modules so they're erased from the bundle.

## Type safety

- `tsconfig` is `strict`. Prefer `unknown` + narrowing over `any`. The template's ESLint _downgrades_
  `no-explicit-any` and `no-unused-vars` to `warn` **because it's a buyer-facing template** —
  that's a deliberate teaching relaxation, **not** the bar for your own app code. In your code, keep `any`
  out and delete unused symbols.
- Suppress only with `// @ts-expect-error <reason>` (e.g. where an `includes()` should narrow a
  `string`), never a blanket `@ts-ignore`. `@ts-expect-error` fails when the underlying error disappears.
- Avoid `as` casts and non-null `!` — narrow instead. Casts are acceptable only right after a runtime
  check (e.g. immediately after a validating `includes(...)`).
- Upgrade config typing from annotation to **`satisfies`** to keep literal types while checking:
  `export const siteSettings = { useAnimations: true } satisfies SiteSettingsProps;`
  (preserves `true` over widening to `boolean`).

## Modelling

- Prefer `type` unions; use a **discriminated union** over several optional booleans. Make illegal states
  unrepresentable.
- Prefer an `as const` object + derived union over `enum` (smaller output, no runtime surprises).
- Mark immutable data `readonly`. Avoid mutating shared collection entries in place where a map/copy is as
  cheap; when you must mutate (perf on large lists), say so with a `ponytail:` note.

## Functions, errors, async

- Small and single-purpose; **early return** over nested conditionals — bail on each failing
  condition before doing the real work, rather than nesting the happy path inside `if`s.
- `throw new Error(...)`, never a string. In `catch (e)` treat `e` as `unknown` and narrow. Report real
  failures with context (`console.error(\`Author ${slug} not found\`)`), don't swallow them.
- `async/await` over `.then()`. Run independent awaits with `Promise.all`. No floating promises.

## Hygiene — your code vs. the template

The template leaves commented-out demos and `console.log`s as teaching aids. **Don't replicate that.**
In your own code: delete dead code (git remembers), no leftover logs, named exports over default (except where
a framework requires default — Astro pages, configs).

## The check

Non-trivial logic leaves ONE runnable check behind — the smallest thing that fails if the logic breaks
(an assert-based self-check on `node:assert/strict`; no frameworks, no fixtures). Trivial one-liners
need none.

**Name it `<thing>.test.ts` and put it next to the code it covers.** That is the whole registration
step: `pnpm test` (`scripts/test.mjs`) discovers every `*.test.ts` under `src/` and runs it with
Node's type stripping. A check named anything else is a check nothing runs — and the runner **fails
when it finds zero**, so the convention cannot quietly rot.
