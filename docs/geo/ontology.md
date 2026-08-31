# Regen Knowledge Commons — ontology (current state)

> **Status: refreshed 2026-08-31** against the live space (see §3). The space
> is the **source of truth** — this note mirrors it. Core types stable as of
> end of session **2026-08-28** (testnet); structure updated by the owner on
> 2026-08-31 (Ontology-tab buckets, meta-typed hierarchy, space renamed
> "Knowledge Commons"). The `Type` type on core ontology types is
> **intentional** — not an error.
>
> **Platform mechanics** (how types/properties/relations work as entities in
> GRC-20) are not repeated here — see the skills and the
> [GRC-20 Knowledge Graph spec](https://github.com/yanivtal/graph-improvement-proposals/blob/new-ops/grcs/0020-knowledge-graph.md).
> A non-binding reading of these types through the knowledge-commoning craft
> lens lives in [`commoning.md`](./commoning.md) — it proposes no changes to
> the space.
>
> **Owner conventions:**
>
> - **Root types** — `Resource`, `Agent`, `Event`, `Environment` — are
>   structural roots, *not intended for direct application to entities*.
>   They store inherited common metadata for their subtypes. "Resource as
>   root type" is the only correct definition of how `Resource` is used.
> - This space (`bd727a6a…`) is the **Knowledge Commons**: it holds the core
>   types, properties, and relations used by other aligned spaces. It is
>   foundational, not comprehensive — other spaces extend its ontology and
>   populate it with their knowledge artifacts. GRC-20 is the ID convention.
>
> Raw point-in-time captures of the space were removed from the repo
> (superseded by this note; regenerable with
> `.agents/scripts/geo/export_space.py`).

## 1. Types in the space's ontology tab (now 18)

Both `Case Study` type definitions (`e45dd5b4…`, `bcf6bcb2…`) were removed by
the owner on 2026-08-28 — **verified: no residual relations** in the space
reference either ID. Re-add later in a single non-duplicated form. Not an
open decision.

| Type | ID | Note |
| --- | --- | --- |
| **Agent** ✨ | `4bc3786b2d094e42aaa3917b35c8abfe` | now local — "An actor which controls or affects resources and participates in events" |
| **Environment** ✨ | `02f8089f2f9f471dbfd06377ce753d65` | new — "The living systems, ecological processes, and biophysical conditions that sustain…" |
| Resource | `10eb3c89c4254f7b89726f18a6677b36` | root of knowledge artifacts |
| Knowledge | `522de6b3580b40e3afd02a5fb2512765` | back to local attribution |
| Event | `4d876b81787e41fcab5d075d4da66a3f` | |
| Topic | `5ef5a5860f274d8e8f6c59ae5b3e89e2` | |
| Funding structure | `658f9a253c244ae6bf0cdcec9c765212` | |
| Bioregion | `69a636ec6a5f4d1a8796f2b788d85c9b` | |
| Person | `7ed45f2bc48b419e8e4664d5ff680b0d` | referenced; description **verified 2026-08-31 via live query**: still the baseball fixture ("A person in baseball history — player, manager, coach, umpire, or official scorer"). Fixing it is an owner-approved write to a Type entity |
| Organization | `9547f4fb78744de0a9a9fdd7b4c01c0c` | referenced |
| Claim | `96f859efa1ca4b229372c86ad58b694b` | referenced |
| Article | `a2a5ed0cacef46b1835de457956ce915` | referenced |
| Evidence | `a7bcc070d9e94acdbd5011936d8cb607` | referenced |
| Pattern | `af4f13a5b9b44ff18a24780579f291e4` | referenced |
| Protocol | `c38c419810c24cf29dd58f194033fc31` | referenced |
| Playbook | `c7e64025536a472c9d220609b064ed78` | referenced |
| Network | `fca084311aa140f28a4d0743c2a59df7` | referenced |
| Tool | `fe1df81dd01a4d24a186425b8713d172` | referenced |

## 2. Structure (as of 2026-08-31, verified live)

### 2.1 Ontology-tab buckets (structure = Tags on Types)

The Ontology tab groups the 18 types with three named query blocks; each
filters by a Tag relation on the Type entities:

| Block | Tag entity | Members |
| --- | --- | --- |
| Core Entity Types | `ce3a3216980041e0bbf8bf7a4f6cd3a6` | Environment, Resource, Agent, Event |
| Abstract Entity Types | `d49f6921d4ac432d809ba004453b96ab` | Knowledge, Topic, Tool |
| Typical Entity Types | `12ab24a30c084184bdfcf24fce444a60` | Article |

### 2.2 Hierarchy via meta-typing

Types are typed as instances of the abstract categories (this supersedes the
earlier parent/child trunk sketch):

- Article → Knowledge **and** Resource
- Evidence, Pattern, Protocol, Playbook → Knowledge
- Funding structure → Pattern
- Bioregion, Network → Environment
- Organization, Tool → Resource
- Knowledge → Knowledge + Topic + Resource

## 3. Space front page (2026-08-31)

- Named **"Knowledge Commons"** (kernel name retired), tagged Featured; tabs:
  front page, **Ontology**, **Agents** (agent-facing resources, incl. a
  "Geo Skills" block).
- Related organizations: Regen Coordination, Green Pill Network, SuperBenefit,
  OpenCivics, Bread Cooperative. Broader topics: Commons, Knowledge; subtopic:
  Open source.
- `Case Study` was removed 2026-08-28 (fixture collision); re-add later in a
  single non-duplicated form per owner direction — not an open decision.

## 4. Extraction method (reproducible)

```
# Types in the space (18, post Case Study removal)
entities(typeId: "e7d737c536764c609fa16aa64a8c90ad", spaceId: "bd727a6ad6ec4a058f681ea9002a1fbf")
# Per-type instance counts (in-space and global)
entities(typeId: "<TYPE_ID>", spaceId: "bd727a6ad6ec4a058f681ea9002a1fbf")
# Case Study property wiring
relations(filter: { spaceId: { is: "bd727a6a…" }, typeId: { is: "01412f8381894ab1836565c7fd358cc1" },
          fromEntity: { id: { is: "<CS_TYPE_ID>" } } })
# Global name search for duplicates
entities(filter: { name: { includesInsensitive: "case study" } })
```

Endpoint: `https://api-testnet.geobrowser.io/graphql` — 2026-08-28, after the
owner's fix pass. ~~Indexer pagination beyond the first page of `entities`
was still broken during this extraction~~ — **re-tested 2026-08-31, working
on both paths** (`entitiesConnection` with `after` cursor, `entities` with
`offset`); re-runnable queries in [`plan.md`](./plan.md) §D.
