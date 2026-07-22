---
title: "Source — SEO for Astro (dev.to)"
type: source
created: 2026-07-01
updated: 2026-07-01
tags: [seo, source, external]
sources:
  - https://dev.to/cookieduster_n/seo-for-astro-how-to-make-the-fastest-framework-also-the-smartest-501o
status: stable
---

# Source — "SEO for Astro: how to make the fastest framework also the smartest" (dev.to)

External reference ingested via `/wiki ingest` (2026-07-01). A practitioner walkthrough of technical
SEO for Astro. Its thesis, in five words: **"Performance alone doesn't guarantee SEO"** — Astro ships
zero-JS by default, but metadata, structured data, and crawl clarity are still on you. Its substance is
folded into [[subsystems/seo]], cross-referenced from [[subsystems/layouts-seo]], and codified as the
coding standard `.claude/rules/seo.md`.

## Its checklist (priority order, paraphrased)

Canonical on every indexable page · unique title + meta description · Article/Product/HowTo JSON-LD ·
Open Graph + Twitter cards · one H1 + logical headings · sitemap + robots.txt · image optimization ·
descriptive internal-link anchors · breadcrumbs + BreadcrumbList schema · redirect strategy for changed
slugs · `dateModified` on updates · pagination rules (canonical, prev/next, noindex) · `llms.txt` / AI
crawler policy · site search for content-heavy sites · content-collection Zod schemas. Core Web Vitals
targets: LCP < 2.5s (preload hero/fonts), INP < 200ms (tiny islands), CLS < 0.1 (image dims).

## What we adopted, adapted, or deferred

The template's guiding constraint is **dependency-free, deploy-neutral** (see
[[concepts/lazy-senior-ethos]]) — so the article's recommendations were filtered through it:

- **Adopted** — JSON-LD (Organization/WebSite always; Article/BreadcrumbList builders ready),
  canonical≡`og:url`, OG image dims + alt, `article:*` semantics + `dateModified`, sitemap, robots.txt,
  `llms.txt`, one trailing-slash shape, hreflang (present until the 2026-07-18 i18n removal —
  single-language sites emit none, see [[subsystems/i18n]]).
- **Adapted** — the article reaches for packages (`astro-robots-txt`, Partytown, Plausible); the
  template stays **owned, not vendored**: native `<head>` tags, hand-written typed JSON-LD builders, and
  dynamic `.txt` endpoints instead of an integration. Same stance as the [[subsystems/motion|motion]]
  catalog. `Article` → `BlogPosting` (the accurate schema.org subtype for the blog collection).
- **Deferred (YAGNI)** — RSS and a _visible_ breadcrumb component. The blog collection exists but has
  no route yet, so a feed/breadcrumb for non-existent pages would be premature. The builders and the
  wiring recipe are documented in [[subsystems/seo]] and `.claude/rules/seo.md` for when the blog lands.

## Not adopted (out of scope for the skeleton)

Partytown/GTM, Plausible, pagination `rel=prev/next`, and site search are site-specific concerns the
template intentionally leaves to the project that grows out of it — noted here so the omission is a
decision, not an oversight.
