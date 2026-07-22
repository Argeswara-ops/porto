# wiki/ — maintenance rules

This folder is a Claude-owned knowledge base describing the codebase. It is maintained through the
**`/wiki` skill** (`.claude/skills/wiki/SKILL.md`) — that file holds the full schema and the
`sync` / `ask` / `lint` / `ingest` operations.

If you edit anything here directly, follow the cardinal rules:

- The **codebase is the source of truth** — re-ground claims against the real files; cite `path:line`.
- **Never invent** a file, symbol, or flag. Verify it exists before writing it.
- **Link bidirectionally** with `[[wiki-links]]`; keep `index.md` and `log.md` current on every change.
- Use the **real date** (today) in frontmatter `updated:` — never a made-up one.
