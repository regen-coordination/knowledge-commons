---
name: geo-read
description: Read and diagnose the Geo knowledge graph — GraphQL queries (entities, types, properties, relations, schema discovery, well-known IDs) and gap-discovery passes over a space's content stream. Use when looking up, searching, inspecting, or querying the graph ("look up", "find entity", "query geo", "search the graph", "what type is", "show me relations", "get entity"), fact-checking or reviewing a submission, running discovery ("run discovery", "discover gaps", "what's missing in {space}", "discovery pass"), or finding press sources for a topic+date. Read-only — never writes; publishing a discovered gap routes through the geo-write skill.
metadata:
  author: geobrowser
  version: 0.1.0
---

# Geo Knowledge Graph — Reading & Discovery

Read-only procedures for the Geo graph: querying and gap discovery. Follow the
references rather than improvising — the full filter grammar, performance rules,
and ID tables live there.

## Shared invariants (apply to everything below)

- **Endpoint:** `POST https://api-testnet.geobrowser.io/graphql`, no auth for
  reads. (`testnet-api.geobrowser.io` is retired.)
- **Default space:** Knowledge Commons `bd727a6ad6ec4a058f681ea9002a1fbf`
  (DAO, testnet).
- **Canonical spaces resolve by verified ID, never fuzzy name matching** — a
  fuzzy match silently scopes the whole query to the wrong space.
- **Never assume an ID** — discover schema (property/relation/type IDs) from the
  live graph before reasoning about or publishing to a type.
- **Nesting cost is multiplicative** (`root first` × `nested first`): filter
  nested relations, select only needed properties, keep fat-noded root pages
  ≤ 100 — unfiltered scans have OOM-killed the testnet API.
- **Paginate politely** — many small requests; prefer server-side filters over
  N+1 loops.

## Routing — which reference to load

| Task | Load |
| --- | --- |
| Any query / lookup / inspection: single entity, relations inline, search by type or space, pagination, schema discovery, well-known IDs, canonical client, troubleshooting | [`references/querying.md`](references/querying.md) |
| Gap-discovery pass over a space's daily stream ("run discovery", "what's missing in {space}") — 6 stages, harvest → extract → diagnose → score → theme heat → publish findings | [`references/discovery.md`](references/discovery.md) |
| Press source-discovery for a topic + date | [`references/discovery.md`](references/discovery.md) §Press source-discovery |

## What this skill never does

- **Writes of any kind.** A discovered gap becomes a Gap finding via the
  **geo-write** skill (safeguards + dry-run apply); press findings are acted on
  via geo-write too.
- Unfiltered nested-relation scans, N+1 follow-up loops, or unscoped `none`
  filters — read the performance sections of `references/querying.md` before
  any bulk read.

## Files

- `references/querying.md` — full query grammar, core queries, performance
  patterns, well-known ID tables (incl. the Knowledge Commons space + its 18
  types), canonical client, gotchas.
- `references/discovery.md` — the 6-stage gap-discovery procedure, guardrails,
  press source-discovery.
- `references/discovery-schema.md`, `references/drafting-conventions.md`,
  `references/ner_prompt.md`, `references/stage6-publish.md` — discovery support.
- `scripts/` — discovery tooling (harvest, diagnostics, theming, publish_gaps).
