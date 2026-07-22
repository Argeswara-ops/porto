# Audit prompt — template → best-in-class

A reusable instrument. Run it against a template built from this boilerplate when it is near the end
of its build, before launch. Fill in the two bracketed sections (**Ground truth** and **Known
suspects**) with what is actually true of that repo — everything else is the reusable frame, and the
framing rule below is why it works.

Copy this file into the template's `tasks/`, fill it in, and hand it to a fresh agent.

---

You are auditing `[REPO NAME]`, a buyer-facing **Astro 7 + Tailwind CSS v4 + TypeScript (strict)**
starter template. Your job is to produce the definitive cleanup plan that takes it from "good" to
"the best template of its kind". Report first — do not edit anything until I approve the plan.

## Read these before you form an opinion

The repo already states its own standard. Do not invent a competing one.

- `AGENTS.md` / `CLAUDE.md` — the house rules, plus the five imported rule files
  `.claude/rules/{typescript,tailwind,astro,motion,seo}.md`. These ARE the bar. Judge every file
  against them.
- `wiki/ideal-template/{architecture,code-quality,naming-conventions}.md` — the explicit spec for
  what this template is meant to become. Your audit is largely "where does reality diverge from
  this?" The architecture page marks each slot `✓ present` or `→ target`; read the `→` list as a
  to-do list, because that is what it is.
- `src/components/ui/README.md` — the five-rule primitive contract.
- `src/components/{Sections,Cards}/README.md` — the composition contract.
- `wiki/overview.md` and `wiki/index.md` — the current-state map.

The governing ethos is _lazy senior dev_: the best code is the code never written. **Deletion over
addition. Boring over clever. No new dependencies. No new abstractions that weren't asked for.** A
finding whose fix is "add a layer" needs to justify itself far harder than one whose fix is "delete
this" or "wire the thing that already exists".

## Ground truth (verified — trust as a starting point, re-verify before you cite)

> Replace this block with the real shape of the repo under audit: stack and versions, LOC and file
> counts, the primitive/Section/Card counts, which layers are owned vs vendored, the content
> collections, and the full route list including generated endpoints. Numbers you have actually run,
> not estimates — the auditor will cite them.

## Known suspects — confirm, quantify, or dismiss each

> Replace with 8–15 specific leads for this repo. Write each as a claim with its evidence, not a
> question. Good leads name a file and a number. The recurring shapes worth checking every time:
>
> 1. **`README.md` drift** — does it still advertise a system that was removed, or a command that is
>    not in `package.json`? For a template, the README _is_ the product surface.
> 2. **Duplicated instruction files** — an `AGENTS.md` byte-identical to `CLAUDE.md` is two files and
>    one truth, guaranteed to drift. One must be a pointer.
> 3. **Graveyard directories** — retired one-shot scripts and their fixtures committed "just in
>    case". Git already remembers.
> 4. **Near-identical Sections** — real markup duplication worth extracting, versus prose comment
>    headers restating the same rationale. Two separate questions; answer them separately, and do not
>    propose a mega-configurable component unless the evidence demands it.
> 5. **Names describing build phases, not content** (`Tier1`, `V2`, `New*`) — check against
>    `naming-conventions.md`.
> 6. **Placeholder values that reach production** — `example.com`, sample copy, a labelled OG image.
>    Check the pre-deploy checklist is impossible to miss and, better, that a gate enforces it.
> 7. **Config-driven placeholder vs collection-driven reality** — one route faked from a config file
>    while its sibling reads a real collection. Judge from a buyer's point of view.
> 8. **Dependencies a buyer half-discards** — deploy adapters, CMS packages, anything shipped for
>    optionality.
> 9. **Counts asserted in docs** — icons, primitives, utilities. Verify every number, and verify the
>    unused ones are actually tree-shaken out of the build.
> 10. **`console.log` in `src/`** — the rules permit teaching artifacts in template code and forbid
>     them in app code. Rule on each.
> 11. **Inline `<script>` without the `_client.ts` `onReady` contract** — anything that doesn't
>     re-init on `astro:after-swap` is a view-transitions bug waiting to happen.
> 12. **Wiki pages documenting removed features** — historical record or confusing cruft? If they
>     stay, say how a reader knows they're history.
> 13. **Uncommitted work in progress** — audit it to the same bar as committed code. A trust-boundary
>     form handler is exactly where the rules say not to be lazy.

Do not stop at this list. It is where I'd start, not the ceiling.

## Axes to cover

**Structure.** Does every file sit where `wiki/ideal-template/architecture.md` says it should? Any
directory doing two jobs, any role invented outside the sanctioned set, any file whose location
contradicts its name, any empty directory that is normatively documented (the spec's own rule is
"don't pre-create empties" — an empty documented dir is wrong either way, so decide it). Check the
three-tier `pages → Sections → ui/Cards` boundary actually holds: pages thin and owning only
`BaseLayout` + SEO, Sections layout-free, primitives content-unaware.

**Correctness and type safety.** Real bugs first. Then: `any` and `as` casts, non-null `!`, missing
return types on exports, unvalidated external data crossing a trust boundary, floating promises,
swallowed errors.

**Duplication and dead weight.** Copy-pasted markup or logic across Sections and primitives;
unreferenced exports, components, styles, config keys, aliases, assets; anything reachable from
nothing. Prefer deletion; every deletion must name what proves it's unused. Distinguish a **library**
of deliberately-unused things (a primitive catalog, its schema counterparts) from a **dead export**
with no counterpart — the second kind, left long enough, starts getting cited in other files' docs as
though it were part of the pattern, and then it is load-bearing fiction.

**Contract compliance.** Walk every primitive against the five rules in `src/components/ui/README.md`
(folder shape, native+variant props, exported `tv()` config, tokens only, `data-slot` + merged
`class`). Report violations as a table. Same for the Sections and Cards contracts.

**Tokens and theming.** Any raw Tailwind colour (`violet-`, `zinc-`, hex, arbitrary `[…]`) in markup
is a defect — it bypasses dark mode. Grep exhaustively and list every instance with `file:line`. The
one exception is a third party's brand colour; the test is ownership, not inconvenience.

**Accessibility.** Focus visibility, keyboard paths through every interactive primitive, labels and
names, `aria-*` claims the markup doesn't actually honour, heading order, alt text, and the
reduced-motion discipline `.claude/rules/motion.md` requires (`motion-reduce:animate-none` on every
`timeline-*` element; the global guard cannot stop scroll-driven animation). These are the findings a
linter cannot see, so they are worth the most here.

**Performance.** Islands and hydration directives, image handling via `astro:assets` with intrinsic
dimensions and the correct eager/lazy split on LCP media, CSS weight (measure what the dev-only
catalog costs the shared stylesheet), and any per-page ceiling a design pushes against.

**SEO.** Against `.claude/rules/seo.md`: unique title/description per route, canonical and `og:url`
agreement, `noindex` pages excluded from the sitemap, JSON-LD graph validity, trailing-slash
consistency. Check whether items that rule file defers are still rightly deferred.

**Documentation.** Does `README.md` describe what a buyer actually gets? Does `AGENTS.md` describe
what an agent actually finds? Is the `wiki/` accurate, and does its `[[wikilink]]` graph resolve?
**Does any rule file cite a path, symbol or flag that does not exist in this repo?** That last one is
the cardinal failure: a rule pointing at a file that isn't there teaches the next agent to invent.

**Tests and verification.** What non-trivial logic ships with no runnable check, per the house rule
that non-trivial logic leaves exactly one behind? Which existing checks are actually wired into
`pnpm test`, and which are orphans nothing runs?

## Verification — required, not optional

Run these and report real output. Do not claim a clean state you did not observe.

```sh
pnpm install
pnpm lint
pnpm check
pnpm build
pnpm test
```

Then inspect the build artifacts in `dist/`: JSON-LD in the `<head>`, `robots.txt` and `llms.txt`
with absolute URLs, `sitemap-0.xml` listing only indexable trailing-slash routes, and no `/examples/`
HTML shipped.

> Environment caveat: if this runs under WSL, browser verification is unreliable — `resize_window` is
> a no-op, WebGL contexts don't mount, and throttled background tabs freeze animations mid-flight and
> read as bugs. Verify anything visual by code and built CSS, and mark anything you genuinely could
> not check as **unverified** rather than guessing.

## Output

A single prioritized report. No preamble, no restating the brief.

For each finding: severity (blocker / high / medium / polish), the evidence as `file:line`, one
sentence on why it's wrong _citing the rule or spec it violates_, the concrete fix, the rough diff
size, and the risk of making the change. Rank most-severe first. Separate **template debt** (what a
buyer trips on: stale docs, placeholder values, unfinished seams, misleading claims) from **code
debt** (what only a maintainer sees) — they get cleaned up on different timelines.

End with three things: the ten changes that deliver the most quality per line of diff; the list of
things I might expect you to flag that are actually **correct as-is** and should be left alone, with
the reason (the deliberate `ponytail:` shortcuts, the owned-not-vendored motion/SEO/icon layers, and
the intentional ESLint teaching relaxations are the obvious candidates — confirm or challenge each);
and an honest statement of what you could not verify and why.

Be direct. If something is genuinely excellent, say so in one line and move on — I need the problems,
not reassurance. **If a lead I gave you above is wrong, say it's wrong.**
