# Harvest — carry a finished template's lessons back into the boilerplate

Run this **once, at the end of every template's lifecycle**, before you archive it. It is the step
that was missing when this boilerplate and its first fork drifted apart: lessons flowed _from_ the
boilerplate _into_ the template at fork time, and nothing ever flowed back. Four of five rule files
had gone stale against the fork's copies and nothing noticed, because nothing was looking.

Every template you finish learns things. Without this step you keep losing them.

## Why it is a diff, not a memory

The finished template's `.claude/rules/` is a record of every rule that got corrected while real code
was being written against it. `diff` is the cheapest possible way to read that record: every line the
template added is a candidate lesson, already written down, already proven in use.

## The steps

**1. Diff the rules.**

```sh
for f in typescript tailwind astro motion seo; do
  diff -u .claude/rules/$f.md ../<finished-template>/.claude/rules/$f.md
done
```

Every hunk is a candidate. Sort each into one of three piles:

- **General lesson** → take it. Mechanisms, gotchas, "we tried X and reverted it because Y", counts
  and measurements, corrections to statements that were simply wrong.
- **Project trivia** → drop it. Anything true only of that template's design.
- **General lesson wearing a project-specific exemplar** → take the lesson, **rewrite the example.**

That third pile is where this goes wrong. The fork's edits cite the fork's files. Copying a hunk
verbatim imports a path this repo does not have, and a rule file that cites a missing file teaches
the next agent to invent — the one failure the wiki's cardinal rule exists to prevent. Either restate
the rule without the exemplar, or re-anchor it to a file that exists here and **verify it**: open the
file and confirm the claim before you write it down. A plausible-sounding citation you did not check
is worse than no citation, because it reads as evidence.

**2. Diff the ideal-template spec.** `wiki/ideal-template/architecture.md` uses a `✓ present / →
target` annotated tree. The fork's copy has had a real build run against it, so its `✓` list is
larger and its `→` list is better informed. Read the delta as a to-do list, because that is what it
is.

**3. Harvest the code that proved itself.** Anything in the fork's `src/js/` or `src/components/ui/`
that arrived **with a `*.test.ts` beside it** has already demonstrated it is worth owning. Small,
dependency-free, checked utilities are exactly what a boilerplate should carry. Weigh each against
YAGNI: a util the next three projects will all want, take; one shaped by that project's content
model, leave.

**4. Check the mechanisms, not just the prose.** Did the fork change `scripts/test.mjs`,
`eslint.config.mjs`, `astro.config.mjs`, `pnpm-workspace.yaml`, `.claude/settings.json`, or add a
gate or a CI workflow? Tooling changes are the highest-value harvest of all: a rule someone must
remember is worth less than a rule the build enforces. This boilerplate's discovery test runner and
its `SITE_URL` production gate both arrived this way.

**5. Log it.** Append an entry to `wiki/log.md` in the format the `wiki` skill enforces, naming which
template it came from and what you took, generalized, and dropped. The next fork needs to see what
came from where — otherwise the harvest itself is undocumented and the next person redoes the diff.

## The check

After harvesting, the full chain must pass and no rule file may cite a path that doesn't resolve:

```sh
pnpm lint && pnpm check && pnpm build && pnpm test
```

Then grep every backtick-quoted `src/…` path in `.claude/rules/*.md` and confirm each one exists.
That is the specific failure this task is most likely to introduce, so it is the specific thing to
check before calling it done.
