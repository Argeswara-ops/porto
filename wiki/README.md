# Codebase wiki

An interlinked markdown knowledge base that an LLM agent **builds and keeps current** for this
template. Instead of re-reading the whole repo to answer a question, the agent compiles the
non-obvious knowledge once — the architecture, how the subsystems connect, and the _why_ — into
pages here, and re-grounds them against the code as the template evolves. It doubles as the
template's human documentation.

This is **not** a RAG/embedding system. The repo is small enough that the model reads it directly;
the wiki adds the durable synthesis a single file can't show. (See `.claude/skills/wiki/SKILL.md`
for the reasoning and the full schema.)

## Layout

```
wiki/
├── index.md        # catalog of every page — read this first
├── overview.md     # the architecture synthesis: how the pieces fit
├── log.md          # append-only history of wiki edits
├── subsystems/     # the concrete moving parts (i18n, content, keystatic, styling, layouts, scripts)
└── concepts/       # cross-cutting patterns (config-driven design, the lazy-senior ethos)
```

## Use it

Open the repo in Claude Code and drive the wiki with the **`/wiki`** skill:

- **`/wiki sync <path|all>`** — re-ground the wiki against the code (run after a feature or refactor).
- **`/wiki ask <question>`** — answer from the wiki, with citations to pages and `path:line`.
- **`/wiki lint`** — find dangling links, orphans, and claims that have drifted from the code.

It's plain markdown in git, so you get history and diffs for free — and it renders on GitHub or in an
Obsidian vault (the `[[wiki-links]]` and graph view work out of the box).

## Keeping it honest

Every page cites the real files it describes (`path:line`). When the code changes, run `/wiki sync`
so the pages follow — a citation that no longer matches is exactly what `/wiki lint` flags.
