# Geo toolkit — scripts

Non-skill tooling for operating [Geo](https://geobrowser.io) (the external data
governance layer of this repo). Companion to the Geo skills in
`.agents/skills/` — the skills reference the helpers here and assume this
directory exists. Human-readable background lives in `docs/geo/`.

All material extracted from the upstream [`geo-explorers/content-management`](https://github.com/geo-explorers/content-management)
and [`geo-explorers/geo-sdk-tutorial`](https://github.com/geo-explorers/geo-sdk-tutorial)
repos (MIT — see `LICENSE`). Extraction map: `docs/geo/EXTRACTION.md`.

## Layout

| Path | What it is |
| --- | --- |
| `src/entity_ops.ts` | Battle-tested op builders: `mergeEntities`, `deleteEntity`, `changeEntityId`, `moveEntity`, `OpsBatch` |
| `src/functions.ts` | `gql`, `publishOps`, `printOps`, wallet clients, `getAnchoredEntityIds` |
| `src/constants.ts` | Canonical/dataset space IDs, excluded voting/anchored property & relation IDs |
| `src/select_canonical.ts` | Deterministic canonical-entity selection (used by geo-clean merges) |
| `src/xlsx-to-csv.cjs` | Spreadsheet → CSV converter (publish path reads CSV/JSON) |
| `lib/gql.mjs`, `lib/gql-cli.mjs` | Zero-dep GraphQL client with retry/backoff + shell one-liner |
| `lib/inject.ts` | Inject-mode publish from a pasted URL (used by geo-publish) |
| `scripts/` | Working scripts: press-review coverage map, space list check, inject-publish example |
| `validate_migration.ts` | Post-merge verification CLI (used by geo-clean) |
| `skill_versions.py` | Skill integrity manifest generator/verifier (see note below) |
| `curator-courses/` | 9 standalone SDK reference scripts keyed to real curator bugs (+ sample data). Written against SDK `^0.17.0` — patterns still valid, this dir's `package.json` pins 0.20.x |
| `export_space.py` | Export a Geo space's entities/pages/text-blocks to JSON |
| `env.example.geo` | Env template — copy to `.env` here |

## Setup

```bash
cd .agents/scripts/geo
bun install            # or npm install
cp env.example.geo .env
```

The human fills `.env` by hand (never the agent — see `docs/geo/publishing.md`
§2 for the credential protocol): `GEO_PRIVATE_KEY`, `DEMO_SPACE_ID`, and the
inject API values if used. Read-only skills and scripts need no key.

`.env` is gitignored. Generated cleanup scripts write exports to
`scripts/*.json` (keep) — `*.csv`/`*.txt` outputs are throwaway.

## Network

Current endpoint: `https://api-testnet.geobrowser.io/graphql`. Anything
referring to `testnet-api.geobrowser.io` is stale. Endpoints always come from
the SDK config (`GeoTestnetConfig`) or `lib/gql.mjs` — never hardcoded in
generated scripts.
