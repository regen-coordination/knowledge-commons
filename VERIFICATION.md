# Verification output for issue #10

## 1. Zero yanivtal in README, querying, publishing

```
$ grep -rn "yanivtal" docs/
docs/geo/ontology.md:12:> [GRC-20 Knowledge Graph spec](https://github.com/yanivtal/graph-improvement-proposals/blob/new-ops/grcs/0020-knowledge-graph.md).
docs/geo/plan.md:103:- [GRC-20 Knowledge Graph spec](https://github.com/yanivtal/graph-improvement-proposals/blob/new-ops/grcs/0020-knowledge-graph.md) — data model
```

Only `ontology.md` and `plan.md` retain the old link (records, intentionally untouched).

## 2. Export count unchanged in entity_ops.ts

```
$ grep -c "export" .agents/scripts/geo/src/entity_ops.ts
21
```

Key exports verified:
- `export type OpsBatch`
- `export async function deleteEntity`
- `export async function changeEntityId`
- `export async function moveEntity`
- `export async function changeSpace`
- `export async function mergeEntities`

## 3. TypeScript compilation clean

```
$ cd .agents/scripts/geo && npx tsc --noEmit
(no output — compiles cleanly)
```

## 4. Changed files (no .personal/ paths)

```
$ git diff --name-only
.agents/agents.md
.agents/scripts/geo/src/entity_ops.ts
docs/geo/README.md
docs/geo/extraction.md
docs/geo/operations.md
docs/geo/publishing.md
docs/geo/querying.md
```

## 5. No new publish/sendTransaction/GraphQL-mutation lines

```
$ git diff | grep -i "publishOps\|sendTransaction\|graphql.*mutation" | grep "^+" | grep -v "^+++" | wc -l
0
```

## 6. New grc-0020 link present in required files

```
$ grep -n "grc-0020" docs/geo/README.md docs/geo/querying.md docs/geo/publishing.md
docs/geo/README.md:49:([GRC-20 spec](https://github.com/geobrowser/grcs/blob/main/grcs/grc-0020.md)).
docs/geo/README.md:153:- [GRC-20 Knowledge Graph spec](https://github.com/geobrowser/grcs/blob/main/grcs/grc-0020.md) (GRC-20, Final, `908dca8`, 2026-02-12) — the underlying data-model standard
docs/geo/README.md:165:- [GRC-20 spec](https://github.com/geobrowser/grcs/blob/main/grcs/grc-0020.md) (GRC-20, Final, `908dca8`, 2026-02-12) — core data model
docs/geo/querying.md:76:- [GRC-20 Knowledge Graph spec](https://github.com/geobrowser/grcs/blob/main/grcs/grc-0020.md) (GRC-20, Final, `908dca8`, 2026-02-12) — underlying data model (entities, relations, types, properties)
docs/geo/publishing.md:104:- [GRC-20 Knowledge Graph spec](https://github.com/geobrowser/grcs/blob/main/grcs/grc-0020.md) (GRC-20, Final, `908dca8`, 2026-02-12) — ops/edits data model
```
