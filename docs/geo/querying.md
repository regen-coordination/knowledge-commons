# Querying the Geo Knowledge Graph

How to read from Geo's GraphQL API. Reads require no key. The default context
for this repo is the **Knowledge Commons** space (`bd727a6ad6ec4a058f681ea9002a1fbf`,
testnet) and its 18 types — see [`ontology.md`](./ontology.md). This is the
high-level layer — query grammar, recipes, performance rules, and ID tables
live in the **geo-read skill** (`.agents/skills/geo-read/`, full reference at
`.agents/skills/geo-read/references/querying.md`), which
agents must follow rather than improvising.

> Namespaced under `docs/geo/` — see [`README.md`](./README.md) for the
> overview and [`publishing.md`](./publishing.md) for writes.

Primary source: the official [geo-query skill](https://github.com/geobrowser/geo-skills/blob/main/geo-query/SKILL.md)
and its [reference](https://github.com/geobrowser/geo-skills/blob/main/geo-query/reference.md).

---

## Endpoint & conventions

```
POST https://api-testnet.geobrowser.io/graphql
Content-Type: application/json
```

- **Auth:** none for reads.
- **UUIDs:** 32-char hex, no dashes (e.g. `7ed45f2bc48b419e8e4664d5ff680b0d`).
- **Browser links:** `https://www.geobrowser.io/space/{spaceId}/{entityId}`.
- Older docs referencing `testnet-api.geobrowser.io` are stale — that host is
  retired.

Quickstart:

```bash
curl -s --compressed 'https://api-testnet.geobrowser.io/graphql' \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ entities(typeId: \"7ed45f2bc48b419e8e4664d5ff680b0d\", first: 5) { id name } }"}' | jq .
```

## The three things that go wrong most

1. **`entities` vs `entitiesConnection`.** Both list entities, but `entities`
   returns a flat array with offset pagination (offset capped at 1000) while
   `*Connection` variants return `{ nodes, pageInfo, totalCount }` with cursor
   pagination. Use `entities` for small bounded lookups, `*Connection` for
   anything unbounded. Don't wrap `entities` in `{ nodes }`, and pass
   `typeId`/`spaceId` as top-level args, not inside `filter`.
2. **Nesting cost.** Cost is `root first` × `nested first` — a big root page
   with unfiltered nested relations has OOM-killed the testnet API in
   production. Filter nested relations, select only needed properties, keep
   fat-noded root pages ≤ 100.
3. **Never assume an ID.** Discover schema (property/relation/type IDs) from
   the live graph before reasoning about or publishing to a type, and scope
   relation filters by `spaceId` (unscoped ones can 500).

The geo-read skill's querying reference carries the full filter grammar, the canonical client,
performance patterns, the well-known ID tables (including the Knowledge
Commons space and its 18 types), and the troubleshooting matrix.

## Safety rules (reads)

- Prefer server-side filters over N+1 loops — one filtered query beats
  hundreds of per-row follow-ups.
- Paginate politely: many small requests, not one that dies and retries.
- Resolve canonical spaces (the Knowledge Commons, `bd727a6ad6ec4a058f681ea9002a1fbf`,
  included) by their hardcoded verified IDs, never by fuzzy name matching — a
  fuzzy match silently scopes the whole query to the wrong space.

---

## Sources

- [geo-query SKILL.md](https://github.com/geobrowser/geo-skills/blob/main/geo-query/SKILL.md) — official querying skill (endpoint, core queries, gotchas)
- [geo-query reference.md](https://github.com/geobrowser/geo-skills/blob/main/geo-query/reference.md) — full filter grammar, nesting-cost measurements, well-known IDs, troubleshooting
- [@geoprotocol/geo-sdk](https://github.com/geobrowser/geo-sdk) — `geo.api.graphql` client surface
- [GRC-20 Knowledge Graph spec](https://github.com/yanivtal/graph-improvement-proposals/blob/new-ops/grcs/0020-knowledge-graph.md) — underlying data model (entities, relations, types, properties)
