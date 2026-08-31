# Geo SDK Curator Scripts

Practical, runnable scripts that solve the exact mistakes real curators shipped to production. Each script is standalone, focused on one concept, and keyed to a specific curator bug it prevents.

These are reference patterns — copy them into your own publishing project, adapt, and ship.

## Prerequisites

- Node 20+ and `npx` available
- SDK `@geoprotocol/geo-sdk` `^0.17.0` (already pinned in [package.json](./package.json))
- A `.env` file at the repo root with:
  ```
  PRIVATE_KEY=0x...
  ```
  Only needed for scripts that publish (05, 06, 08). Export your wallet from https://www.geobrowser.io/export-wallet.

Install once:
```bash
npm install
```

## Script Index

| # | Script | Purpose | Needs `PRIVATE_KEY` | Curator bugs prevented |
|---|--------|---------|---------------------|------------------------|
| 01 | [query-space-entities](./01-query-space-entities.ts) | Inspect what's already in a space | No | Publishing duplicates because the space was never inspected |
| 02 | [discover-type-ids](./02-discover-type-ids.ts) | Find correct type/property IDs from live schema | No | Hardcoded wrong IDs copied from stale docs |
| 03 | [check-duplicates](./03-check-duplicates.ts) | Space-scoped dedup check before publishing | No | Unscoped lookups matching entities in other spaces; no dedup at all |
| 04 | [typed-values-reference](./04-typed-values-reference.ts) | All 13 DataTypes / TypedValues with working examples | No | Old type names (`int64`, `bool`); everything stored as `text`; dates as `YYYY-MM` |
| 05 | [create-typed-relations](./05-create-typed-relations.ts) | Relations with correctly-typed target entities | Yes (with `--publish`) | Relation targets created with `types: []` — untyped orphan shells |
| 06 | [dry-run-publish](./06-dry-run-publish.ts) | Build ops → preview → publish flow | Yes (with `--publish`) | No dry-run — broken ops go straight to chain; demo scripts publish on first run |
| 07 | [validate-data-before-publish](./07-validate-data-before-publish.ts) | Schema-driven validation of JSON/CSV source data | No | Bad dates, `name: null`, stringified floats like `"16291130.0"`, no validation at all |
| 08 | [relations-from-data](./08-relations-from-data.ts) | Full pipeline: records → typed entities + typed relations | Yes (with `--publish`) | Relations stored as collection blocks or text values; high % of entities ending up disconnected |
| 09 | [verify-published-entities](./09-verify-published-entities.ts) | Post-publish verification against source data | No | Unnoticed publishes with null names; only a fraction of records actually landed; values stored in wrong format |

## Recommended Order

If you're learning, run them in sequence — each builds on patterns from the previous:

**Read-only exploration (no wallet needed)**
```bash
npx tsx curator-courses/01-query-space-entities.ts
npx tsx curator-courses/02-discover-type-ids.ts --find "Dataset"
npx tsx curator-courses/04-typed-values-reference.ts
```

**Pre-publish validation (no wallet needed)**
```bash
# 1. Validate your data before you touch the chain
npx tsx curator-courses/07-validate-data-before-publish.ts \
    --data data_to_publish/09-datasets-with-errors.json \
    --schema data_to_publish/09-datasets-schema.json

# 2. Check for duplicates in the target space
npx tsx curator-courses/03-check-duplicates.ts \
    --data data_to_publish/10-datasets-sample.json \
    --space <your-space-id>
```

**Publishing flow (wallet required)**
```bash
# 3. Dry run — inspect the ops without publishing
npx tsx curator-courses/08-relations-from-data.ts \
    --data data_to_publish/10-datasets-sample.json \
    --schema data_to_publish/10-datasets-schema.json

# 4. Review the JSON report on disk, then re-run with --publish
npx tsx curator-courses/08-relations-from-data.ts \
    --data data_to_publish/10-datasets-sample.json \
    --schema data_to_publish/10-datasets-schema.json --publish

# 5. Verify what actually landed on chain
npx tsx curator-courses/09-verify-published-entities.ts \
    --data data_to_publish/10-datasets-sample.json \
    --schema data_to_publish/10-datasets-schema.json \
    --space <spaceIdFromStep4>
```

---

## Script Details

### 01 — Query a Space's Entities

Inspect what types, properties, and entities already exist in a space. Every curator should run this first on their target space.

**Usage**
```bash
npx tsx curator-courses/01-query-space-entities.ts                  # AI space (default)
npx tsx curator-courses/01-query-space-entities.ts --space <id>     # custom space
```

Read-only. No `PRIVATE_KEY` needed.

---

### 02 — Discover Type & Property IDs

Look up the correct ID for any Type or Property by name. Use when building your publishing config — never hardcode IDs from someone else's code or stale docs.

**Usage**
```bash
npx tsx curator-courses/02-discover-type-ids.ts --find "Dataset"
npx tsx curator-courses/02-discover-type-ids.ts --find "Citation count"
npx tsx curator-courses/02-discover-type-ids.ts                     # shows SDK built-in IDs
```

Read-only. No `PRIVATE_KEY` needed.

**Bug prevented:** An unscoped `search("Creator")` can return a `Role` entity instead of the `Property` entity you wanted — whichever matches the search ranking first. This script uses type-filtered lookups so you always get back what you asked for.

---

### 03 — Check for Duplicates Before Publishing

Space-scoped dedup check. Run before publishing to see which entities already exist in your target space. Supports single-name or bulk JSON.

**Usage**
```bash
# Single entity
npx tsx curator-courses/03-check-duplicates.ts --name "GPT-4" --space <id>

# Bulk from JSON
npx tsx curator-courses/03-check-duplicates.ts --data records.json --space <id>

# Scope by type (recommended — avoids name collisions across types)
npx tsx curator-courses/03-check-duplicates.ts --data records.json --space <id> --type <typeId>
```

Input JSON should be an array with a `name` field: `[{ "name": "GPT-4", ... }, ...]`

Read-only. No `PRIVATE_KEY` needed.

---

### 04 — Typed Values Reference (All 13 Data Types)

Dry-run demo of every `DataType` / `TypedValue` in GRC-20 v2. Builds real ops via `Graph.createProperty` and `Graph.createEntity` so you see the exact structure — but never publishes.

**The gotcha it teaches:**
```typescript
Graph.createProperty({ dataType: "INTEGER" })     // UPPERCASE (enum form)
{ property, type: "integer", value: 42 }          // lowercase (value form)
```

**Usage**
```bash
npx tsx curator-courses/04-typed-values-reference.ts
npx tsx curator-courses/04-typed-values-reference.ts --verbose
```

No `PRIVATE_KEY` needed — builds ops but never publishes.

**Bugs prevented:** Using old SDK type names (`int64`/`float64`/`bool` — gone in v0.17). Storing every value as `"text"` regardless of its actual type. Dates stored as `"YYYY-MM"` — crashes GRC-20 (needs full `YYYY-MM-DD`). Numeric IDs like `"16291130.0"` stored as text when they should have been integers.

---

### 05 — Create Typed Relations

Relations whose target entities have **correct types**, not `types: []` orphan shells.

**Two patterns demonstrated:**
- **Pattern A:** Target already exists → look up its ID, relate to it
- **Pattern B:** Target doesn't exist → create WITH the right type, relate to it

Also shows that SDK constants can be incomplete — `Organization` is not in `SystemIds` or `ContentIds`, so it must be discovered via the API. Always verify SDK constants against live data before trusting them.

**Usage**
```bash
npx tsx curator-courses/05-create-typed-relations.ts                # dry-run (default)
npx tsx curator-courses/05-create-typed-relations.ts --publish      # publish to personal space
npx tsx curator-courses/05-create-typed-relations.ts --space <id>   # scope lookup to specific space
```

`PRIVATE_KEY` only required with `--publish`.

**Bug prevented:** `Graph.createEntity({ name: v, types: [], values: [] })` for relation targets — every target published as an untyped orphan, discoverable by name but not classifiable by type.

---

### 06 — Dry-Run → Publish Flow

The preview-then-publish pattern every curator should adopt. Build ops from data, inspect them with a dry run, save a JSON report, and only publish once reviewed.

**Two-step workflow (not an interactive prompt):**
1. `npx tsx curator-courses/06-dry-run-publish.ts --data records.json` → builds ops, prints preview, saves report, exits.
2. Review the report. If satisfied, re-run with `--publish`.

The `--publish` flag **is** the confirmation. Scripts should run unattended in CI, not babysit a human.

**Usage**
```bash
npx tsx curator-courses/06-dry-run-publish.ts --data records.json
npx tsx curator-courses/06-dry-run-publish.ts --data records.json --verbose
npx tsx curator-courses/06-dry-run-publish.ts --data records.json --publish
npx tsx curator-courses/06-dry-run-publish.ts --data records.json --publish --space <daoSpaceId>
```

Example dataset provided: [`data_to_publish/06-datasets-sample.json`](./data_to_publish/06-datasets-sample.json).

`PRIVATE_KEY` only required with `--publish`.

**Bugs prevented:** No dry-run step — broken ops go straight to the chain. Demo / example scripts that call `publishEdit` at module load time, so running the file *is* the publish — no safety gate, no review.

---

### 07 — Validate Data Before Publish

Catches bad data **before** any ops are built. No API calls, no publishing — pure local schema validation. Run first, fix your source file, then build ops with 06/08.

**Validators cover exactly the bugs that have shipped to production:**

| Validator | Rule | Real-world failure mode it catches |
|-----------|------|------------------------------------|
| `required` | non-null, non-empty | Hundreds of entities published with `name: null` — discovered months later |
| `date` | `YYYY-MM-DD` only | Partial dates like `"YYYY-MM"` — crashes the GRC-20 encoder |
| `integer` | true integer, rejects `"16291130.0"` | Stringified floats in ID-shaped columns stored as text |
| `float` | finite numeric | `NaN` / `Infinity` / non-numeric strings |
| `url` | `http://` or `https://` only | `"TBD"`, empty strings, or protocol-less URLs |
| `boolean` | real booleans, not `"yes"`/`"true"` strings | Mixed-type columns where only some rows are real booleans |
| `relation` | array of strings OR comma-separated | Relation columns that are actually `null` or the wrong shape |
| `text` | non-empty string | Whitespace-only or empty string values that should be meaningful |
| `enum` | value in allowed list | Free-text drift where a closed vocabulary was assumed |

**Usage**
```bash
npx tsx curator-courses/07-validate-data-before-publish.ts \
    --data data_to_publish/09-datasets-with-errors.json \
    --schema data_to_publish/09-datasets-schema.json

# --verbose shows ALL errors (default: first 20)
# --output ./report.json to override default report location
# Accepts .json (array of objects) and .csv (with header row)
```

**Exit code:** `0` if valid, `1` if any errors — safe for CI pipelines.

---

### 08 — Relations From Data (Full Pipeline)

The full bulk pipeline: `records.json` + `schema.json` → typed entities with typed relations to shared target entities. Shows **wrong** (dead text values) vs **right** (traversable graph edges) side-by-side with real op counts.

**Key techniques demonstrated:**
1. Schema drives the pipeline — fields with `type: "relation"` declare a `targetTypeName` (e.g., `"Organization"`) so the builder knows what type to tag targets with.
2. Unique-name deduplication — `"Stanford Vision Lab"` appears in 2 records but creates **one** entity, both datasets link to it.
3. Space-scoped existing-entity lookup — reuse entities already in the target space instead of creating duplicates.
4. Type resolution — `Person` and `Topic` come from SDK constants; `Organization` isn't in the SDK, so it's discovered via the API (see script 05).

**Two-step workflow:**
```bash
# Step 1: dry-run, review the report
npx tsx curator-courses/08-relations-from-data.ts \
    --data data_to_publish/10-datasets-sample.json \
    --schema data_to_publish/10-datasets-schema.json

# Step 2: publish if satisfied
npx tsx curator-courses/08-relations-from-data.ts \
    --data data_to_publish/10-datasets-sample.json \
    --schema data_to_publish/10-datasets-schema.json --publish
```

**Tip:** Run script 07 first to validate records — this script assumes the input is structurally sound.

`PRIVATE_KEY` only required with `--publish`.

**Bugs prevented:** Multi-value fields (Authors, Venues, Labs, Contributors, Categories) stored as collection blocks or as plain text values instead of typed graph relations. Large fractions of entities ending up with zero outbound connections because relation fields were never modeled as relations.

---

### 09 — Verify Published Entities

The step every reviewed curator skipped. After publishing, query the space and check that what landed matches what you sent.

**Checks performed per record (using the same schema script 08 uses):**
1. Entity with matching name exists in the target space.
2. Entity has the expected type (e.g., `Dataset`) in its `types[]`.
3. Each value field (description, dates, etc.) has a non-null value under the expected property, and the stored value equals the source.
4. For relation fields: total relation count ≥ expected total from source. (Individual relation types aren't matched here — script 08 already handled target dedup and typing. Count parity catches the "0 connections" failure mode without requiring exact property-ID alignment.)

**Usage**
```bash
# Step 1: publish with script 08
npx tsx curator-courses/08-relations-from-data.ts \
    --data   data_to_publish/10-datasets-sample.json \
    --schema data_to_publish/10-datasets-schema.json --publish

# Step 2: verify (space ID is in script 08's output)
npx tsx curator-courses/09-verify-published-entities.ts \
    --data   data_to_publish/10-datasets-sample.json \
    --schema data_to_publish/10-datasets-schema.json \
    --space  <spaceIdFromStep1>
```

**Exit code:** `0` if all pass, `1` if any record fails — CI-safe.

**Bugs prevented:** Large publishes with `name: null` on every entity — undetected for months. Partial publishes where only a small fraction of records actually landed on chain — never verified. Values present but in the wrong format (dates, numerics) so they exist but can't be queried correctly. In general: `success: true` from the publish call is not the same as "the data is correct on chain."

---

## Shared Helpers

The scripts import from [`src/functions.ts`](./src/functions.ts) and [`src/constants.ts`](./src/constants.ts):

- `gql(query, variables?)` — GraphQL against the Geo API
- `queryPropertyByName(name)` — **type-filtered** lookup for Property entities
- `queryTypeByName(name)` — **type-filtered** lookup for Type entities
- `queryEntityByName(name, spaceId?)` — general entity lookup, optionally space-scoped
- `publishOps({ ops, editName, privateKey, spaceId?, useSmartAccount? })` — personal/DAO publish flow
- `printOpsSummary(ops)` — human-readable op breakdown for dry runs

Copy these into your own project as needed. The `queryPropertyByName` / `queryTypeByName` implementations here use type-filtered lookups, so `search("Creator")` can't accidentally return a `Role` entity (or any other non-Property type) — you always get back what you asked for.

## Data Files

Sample data sits in [`./data_to_publish/`](./data_to_publish/):

- `06-datasets-sample.json` — clean sample for script 06
- `07-datasets-schema.json` + `07-datasets-with-errors.json` — deliberately broken data so you can see validators fire (used with script 07; files are named `09-*.json` in the data folder due to legacy numbering)
- `10-datasets-sample.json` + `10-datasets-schema.json` — clean sample + schema for scripts 08 and 09 (legacy numbering)

## Troubleshooting

- **`PRIVATE_KEY is not set`** — add to `.env` at repo root. Only required for `--publish`.
- **`No personal space found for <address>`** — your wallet hasn't created a personal space yet. Running any `--publish` command will auto-create one on first use.
- **`search(...) returned a wrong entity type`** — if you see this outside of the provided scripts, you're probably using an unscoped search. Script 02 shows the type-filtered pattern.
- **Old SDK types (`int64`, `FLOAT64`)** — the SDK was renamed in v0.17.0. See script 04 for the new names.
