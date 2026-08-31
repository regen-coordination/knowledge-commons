# Regen Knowledge Commons — docs

This repo is the canonical source of truth for the **Regen Knowledge Commons**
(root `README.md`); `docs/geo/` is its documentation layer. The docs assume the
commons as the default context:

- **Space:** Knowledge Commons `bd727a6ad6ec4a058f681ea9002a1fbf` — a **DAO
  space on testnet**; all writes go through proposals and voting.
- **Geo is the substrate** — the canonical data governance layer for the core
  knowledge graph structure. GRC-20 is the ID convention.
- **Split rule:** procedural agent content lives in `.agents/` (skills +
  scripts); high-level human docs live here.

## Project docs (commons-specific)

| Doc | Contents |
| --- | --- |
| [`mission.md`](./mission.md) | Mission, scope, theory of change (synthesized from the Toolkit master doc) |
| [`commoning.md`](./commoning.md) | The craft of knowledge commoning: commons principles from the literature → how the Geo practice expresses them |
| [`plan.md`](./plan.md) | Work list for owner review: verified doc defects, remaining fixes, craft-reference improvements, and the re-runnable queries behind each fact |
| [`ontology.md`](./ontology.md) | Knowledge Commons space ontology: 18 types, buckets, meta-typed hierarchy, owner conventions |

## Operating docs (Geo substrate)

| Doc | Contents |
| --- | --- |
| [`operations.md`](./operations.md) | Agent operating manual: skill routing, hard rules, environment |
| [`querying.md`](./querying.md) | Reads, high-level: endpoint, entities vs connections, nesting cost, ID-verification rule |
| [`publishing.md`](./publishing.md) | Writes, high-level: how edits reach the graph, credential safety, safeguarded workflow, DAO path, safety rules |
| [`extraction.md`](./extraction.md) | Provenance: imported upstream material → repo locations, plus deleted-source audit trail |

## Open decisions

- **Ontology:** none — the space is the source of truth; structure as of
  2026-08-31 is recorded in [`ontology.md`](./ontology.md) §2–3 (buckets +
  meta-typing).
- **Plan:** [`plan.md`](./plan.md) is a **draft awaiting owner review** — a
  work list of verified defects and fixes (its §D records the live queries
  behind each fact). Its owner-decision items become settled decisions, not
  open debates, once the owner rules on them.

---

## Geo substrate reference

Geo is a decentralized knowledge graph built on [The Graph](https://thegraph.com).
Data lives both offchain and onchain: writes are encoded, uploaded to IPFS,
posted onchain, then exposed by an indexer via a GraphQL API
([GRC-20 spec](https://github.com/yanivtal/graph-improvement-proposals/blob/new-ops/grcs/0020-knowledge-graph.md)).
Spaces are containers for knowledge — **personal spaces** take direct writes;
**DAO spaces** (like the Knowledge Commons) take writes via proposals + voting.
Entities, types, properties, and relations are all themselves entities — the
schema is self-describing and exposed through a GraphQL indexer.

### Endpoints

| Network | GraphQL endpoint | Notes |
| --- | --- | --- |
| TESTNET (current) | `https://api-testnet.geobrowser.io/graphql` | Current host. Older docs saying `testnet-api.geobrowser.io` signal stale content. |
| MAINNET | `https://api.geobrowser.io/graphql` | |
| Wallet export | `https://www.geobrowser.io/export-wallet` | Source of `GEO_PRIVATE_KEY` for publishing. Human-only handling — see [`publishing.md`](./publishing.md#credential-handling-safety-protocol). |

SDK config: `GeoTestnetConfig` (built in, includes Geo's sponsored transaction
RPC) or `defineGeoNetworkConfig({...})` for custom/local chains. Pass the
**config object**, never the string `"TESTNET"`.

### Quickstart: query something (10 seconds, zero setup)

```bash
curl -s --compressed 'https://api-testnet.geobrowser.io/graphql' \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ entities(typeId: \"7ed45f2bc48b419e8e4664d5ff680b0d\", first: 5) { id name } }"}' | jq .
```

(`7ed45f2bc48b419e8e4664d5ff680b0d` is the commons **Person** type ID — the
full 18-type ID table is in [`ontology.md`](./ontology.md) and the geo-read
skill's querying reference (Well-known IDs). Verify IDs against the live graph before hardcoding —
see [`querying.md`](./querying.md).)

### Quickstart: publish something

Prerequisites: Node 20.6+, exact-pinned SDK, a testnet key in a gitignored
`.env.geo-publish` (human-only step — details in
[`publishing.md`](./publishing.md#prerequisites)).

```bash
npm install --save-exact @geoprotocol/geo-sdk@0.20.3 viem@2.37.6
```

```ts
import { GeoTestnetConfig, Ops, createGeoClient, createGeoWalletClient } from "@geoprotocol/geo-sdk";
import { privateKeyToAccount } from "viem/accounts";

const geo = createGeoClient({ network: GeoTestnetConfig });
const wallet = await createGeoWalletClient({
  signer: privateKeyToAccount(process.env.GEO_PRIVATE_KEY as `0x${string}`),
  network: GeoTestnetConfig,
});

const spaceId = "00000000000000000000000000000000"; // your personal space ID (from geobrowser.io/space/<id>)

const { id: entityId, ops } = Ops.entities.create({
  name: "Test Entity",
  description: "Created with the Geo SDK",
});

const tx = await geo.personalSpaces.publishEdit({
  name: "Create Test Entity",
  spaceId,            // your personal space ID
  author: spaceId,    // author = personal space ID, NOT a wallet address
  ops,
});

await wallet.sendTransaction({ to: tx.to, data: tx.calldata });
```

**This is the minimal skeleton, not the workflow.** Commons publishes go
through the DAO proposal path (see [`publishing.md`](./publishing.md)) and the
safeguarded pipeline (validate → dedup → dry-run → publish → verify) — read
[`publishing.md`](./publishing.md) before writing anything.

### Safety rules (summary)

1. Never write to Geo by hand — every write goes through the safeguarded flow.
2. Deletion is the red line: no hand-written deletes, no delete loops.
3. Never read, print, or accept the private key; the human fills `.env` by hand.
4. No scripts that publish at import time — `--publish` is an explicit flag.
5. Verify after publishing: `success: true` ≠ "correct on chain".

Full context: [`publishing.md`](./publishing.md#safety-rules).

---

## Agent-facing material (outside docs/)

Per the [.agents protocol](https://dotagentsprotocol.com): guidelines in
`.agents/agents.md`, agents in `.agents/agents/`, skills in `.agents/skills/`,
tasks in `.agents/tasks/`. Routing + rules: [`operations.md`](./operations.md).

- `.agents/agents/` — delegation agents: `geo-research` (source-quality policy,
  134-domain trusted-sources allowlist, MVP design — in `references/`),
  `geo-curate` (orchestration), `geo-ontology` (modelling advice, read-only).
- `.agents/skills/` — `geo-read` (querying, discovery), `geo-write`
  (publishing, cleaning, describing, banners), `skill-quality-check`.
- `.agents/tasks/daily-report/` — end-of-day editor report (manual task).
- `.agents/scripts/geo/` — entity-ops toolkit, GraphQL client, curator-course
  reference scripts (see its README).

## Official sources

- [geobrowser/geo-sdk](https://github.com/geobrowser/geo-sdk) — the SDK (`@geoprotocol/geo-sdk`, 0.20.3) + README/CHANGELOG
- [geobrowser/geo-skills](https://github.com/geobrowser/geo-skills) — official agent skills (`geo-query`, `geo-publish`)
- [GRC-20 Knowledge Graph spec](https://github.com/yanivtal/graph-improvement-proposals/blob/new-ops/grcs/0020-knowledge-graph.md) — the underlying data-model standard
- [GRC-20 serialization spec](https://github.com/geobrowser/grc-20/blob/main/spec.md) — ops/edits encoding (cited by the imported toolkit)
- [geobrowser.io](https://www.geobrowser.io) — the browser app + wallet export
- [The Graph blog: Introducing GRC-20](https://thegraph.com/blog/grc20-knowledge-graph/) — background on the standard
- [geo-explorers](https://github.com/geo-explorers) — community tooling ([geo-sdk-tutorial](https://github.com/geo-explorers/geo-sdk-tutorial) curator pipeline, [content-management](https://github.com/geo-explorers/content-management) entity-ops toolkit)

Each doc ends with its own Sources section listing the specific URLs cited.

## Sources

- [geo-sdk README](https://github.com/geobrowser/geo-sdk) — data flow, spaces/entities/relations, ops & edits, sponsored transactions
- [@geoprotocol/geo-sdk on npm](https://www.npmjs.com/package/@geoprotocol/geo-sdk) — version 0.20.3, MIT
- [GRC-20 spec](https://github.com/yanivtal/graph-improvement-proposals/blob/new-ops/grcs/0020-knowledge-graph.md) — core data model
- [geo-query SKILL.md](https://github.com/geobrowser/geo-skills/blob/main/geo-query/SKILL.md) — endpoint, Person type ID fixture
- [geo-publish SKILL.md](https://github.com/geobrowser/geo-skills/blob/main/geo-publish/SKILL.md) — minimal publish pattern, credential handling

### Commons-craft sources (inform [`commoning.md`](./commoning.md))

- [Wikipedia: Knowledge commons](https://en.wikipedia.org/wiki/Knowledge_commons) — Hess & Ostrom lineage; non-subtractibility; information vs knowledge
- [Simon Grant's wiki](https://wiki.simongrant.org/doku.php/t:knowledge_commons) — knowledge commons as the knowledge aspect of a community of practice ([2023-09-09](https://wiki.simongrant.org/doku.php/d:2023-09-09)); [page kinds](https://wiki.simongrant.org/doku.php/d:2025-10-20), [page structure](https://wiki.simongrant.org/doku.php/d:2025-10-21), and [patterns vs practices](https://wiki.simongrant.org/doku.php/d:2025-11-04) for a commons-serving wiki; [wiki requirements](https://wiki.simongrant.org/doku.php/wiki:requirements-commons)
