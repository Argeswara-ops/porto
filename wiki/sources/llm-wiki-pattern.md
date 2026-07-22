---
title: "Source: the LLM Wiki pattern"
type: source
created: 2026-06-30
updated: 2026-06-30
tags: [meta, pattern, wiki]
sources:
  - .claude/skills/wiki/SKILL.md
status: active
---

# Source: the LLM Wiki pattern

The design note this whole `wiki/` system instantiates (shared by the human, 2026-06-30). It describes
a pattern, not an implementation — our job was to instantiate a version that fits a **codebase**. This
page records the pattern so the north star lives in the wiki, not just in chat; the [[overview]] and the
`/wiki` SKILL.md are the running instantiation.

## The core idea

Don't re-derive knowledge from raw documents on every query (RAG). Instead the LLM **incrementally
builds and maintains a persistent, interlinked markdown wiki** that sits between you and the sources.
Adding a source isn't indexing — it's _integration_: read it, extract what matters, update entity/concept
pages, flag contradictions, strengthen the synthesis. The wiki is a **compounding artifact** — the
cross-references and contradictions are already there. The human curates, explores, and asks; the LLM
does all the bookkeeping (summarizing, cross-referencing, filing) because that maintenance cost is what
kills human-run wikis, and an LLM's cost for it is near zero.

## Three layers

1. **Raw sources** — immutable curated documents; the source of truth, read but never modified.
2. **The wiki** — LLM-owned interlinked markdown (summaries, entity/concept pages, an overview).
3. **The schema** — the config doc (CLAUDE.md / this skill) that makes the LLM a _disciplined_
   maintainer, co-evolved with the human.

> [!note] Our adaptation — layer 1 ("raw sources") is the **live codebase**, read fresh each `sync`
> rather than frozen, because code drifts. External reference material (a finished starter, an upstream
> doc, a design note like this one) is the _other_ kind of source, and lives under `sources/` (e.g. [[sources/galaxy-main]]). See the
> "layers" section of `.claude/skills/wiki/SKILL.md`.

## Operations

- **Ingest** — drop a source in, the LLM reads it, discusses takeaways, writes a summary page, updates
  index + relevant pages, appends to the log. One source can touch 10–15 pages. (We split this into
  `sync` for re-grounding against changed code and `ingest` for external references.)
- **Query** — ask the wiki; the LLM reads the index, drills into pages, answers with citations. **Good
  answers get filed back as new pages** so explorations compound. (Our `ask`.)
- **Lint** — periodic health-check: contradictions, stale claims, orphans, missing pages, missing
  cross-refs, **data gaps a web search could fill**, and **new questions/sources to investigate**.

## Index & log

`index.md` is the content catalog (read first on a query). `log.md` is append-only and chronological
with a grep-able prefix (`## [date] op | title`), so `grep "^## \[" log.md | tail -5` lists recent
activity. At our scale the index replaces embedding RAG; a search engine (e.g. qmd) is only worth it
once the wiki has hundreds of pages — YAGNI for now.

## What we deliberately skipped (the doc says "ignore what isn't useful")

Obsidian Web Clipper, local image downloads, Marp slide decks, Dataview, and a qmd search index — all
aimed at a _personal_ knowledge base over web articles. A small codebase-template wiki doesn't need
them yet. The pattern is modular; we took the parts that fit and left the rest.

## Lineage

Closer in spirit to Vannevar Bush's **Memex** (1945) — a private, curated knowledge store where the
_associative trails between documents_ are as valuable as the documents. Bush couldn't solve who does
the maintenance; the LLM does.

Related: [[overview]] · [[sources/galaxy-main]] · [[ideal-template/architecture]]
