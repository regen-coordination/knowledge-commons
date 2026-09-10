# Geo operations — skill routing & hard rules

How agents operate Geo (this repo's external data governance layer) here.
Geo skills live in `.agents/skills/` — two lifecycle skills (geo-read,
geo-write) plus skill-quality-check; delegation agents live in
`.agents/agents/`. The executable toolkit is
`.agents/scripts/geo/`. Conceptual background:
`docs/geo/{querying,publishing,ontology,commoning,plan}.md`.

## Skill routing — check this before doing anything

| If the user wants to… | Use |
| --- | --- |
| **publish / create / update / delete** entities, relations, or content; "add X to Geo"; "publish…"; submit a proposal; **clean / merge / deduplicate / fix data**; write entity descriptions; make banners | **geo-write** skill (`.agents/skills/geo-write/`) |
| **look up / search / inspect / query** the graph; "what type is…"; "show relations"; review or fact-check a submission; run a **gap-discovery pass**; find press sources for a topic+date | **geo-read** skill (`.agents/skills/geo-read/`) |
| turn "I want to X" into plan → script → dry-run → confirm → publish | **geo-curate** agent (`.agents/agents/geo-curate/`) |
| research/enrich an entity with cited web sources (read-only drafts) | **geo-research** agent (`.agents/agents/geo-research/`) |
| modelling advice — type vs property vs relation, ontology drift | **geo-ontology** agent (`.agents/agents/geo-ontology/`) |
| file the end-of-day daily update | **daily-report** task (`.agents/tasks/daily-report/`) |
| review / lint a skill before shipping | **skill-quality-check** skill |

**Do not hand-write scripts to do a job a skill covers.** The skills carry
mandatory safeguards (semantic-duplicate check, schema check, type-required
check, dry-run → explicit confirm), and bypassing them is how duplicates and
bad data reach Geo. If a request is ambiguous between skills, ask — don't
guess and improvise.

## Hard rules

1. **Never write to Geo by hand.** Any publish/create/update/delete goes
   through **geo-write** (or the geo-curate agent, which wraps it). No
   hand-rolled GraphQL mutations, no SDK shortcuts outside the skill scripts.
2. **Deletion is the red line.** Never hand-write a delete, never loop
   deletes. Any delete/merge/cleanup goes through geo-write's cleaning
   reference (orphan check
   + explicit human confirmation). `publishOps` refuses any batch removing
   data from >50 relations/values unless `CONFIRM_DESTRUCTIVE=1` — set it
   **only** on the confirmed publish run, never to route around a block.
3. **Never fabricate a schema/type/property ID.** If the skill doesn't have
   it, resolve it from the live graph via **geo-read**. Don't guess UUIDs,
   and don't treat the geo-ontology agent's `ONTOLOGY.md` reference as the live
   graph.
4. **Ontology is the live space's — we mirror it.** This repo never critiques,
   second-guesses, or reorganizes the Knowledge Commons space. Source of
   truth: `docs/geo/ontology.md` (+ the live space).
5. **The Knowledge Commons is a DAO space** (`bd727a6ad6ec4a058f681ea9002a1fbf`,
   testnet). Project writes go through proposals and voting — never direct
   personal-space writes unless the editor explicitly says so.
6. **Hierarchy is owner-curated — no type-structure writes.** Never emit ops
   that create/rename/delete a `Type` or rewire the meta-typed hierarchy.
   Cleanup and publishing fix *instances*, never the ontology structure.
7. **Secrets.** Never ask for, read, print, or accept the private key. The
   human fills `.agents/scripts/geo/.env.geo-publish` by hand (protocol:
   `docs/geo/publishing.md` → Credential handling). If a key is pasted into
   chat, tell the user to revoke it at
   <https://www.geobrowser.io/export-wallet> and create a fresh one.
   Read-only skills need no key.
8. **Verify after publishing** — `success: true` ≠ "correct on chain". Confirm
   indexing through the API before reporting done.

## Environment

- **API endpoint:** `https://api-testnet.geobrowser.io/graphql` (reads, no
  auth). Older docs referencing `testnet-api.geobrowser.io` are stale.
- **Toolkit:** `.agents/scripts/geo/` — `bun install` there; `.env` filled by
  the human (see its README).
- **Publish runtime:** Node 20.6+ preferred (`node --env-file=.env
  scripts/<file>.ts`); Bun also works but has hit a fetch bug against the API
  host in some environments.
- **SDK:** `@geoprotocol/geo-sdk` v0.20+ installed in `.agents/scripts/geo/node_modules`.
- **Wallet/key:** testnet `GEO_PRIVATE_KEY` in a gitignored `.env.geo-publish`,
  exported from geobrowser.io/export-wallet. The operator is responsible for the key.
- **Publish network hosts:** `api-testnet.geobrowser.io` (API + IPFS), the
  Conduit RPC + `rpc.zerodev.app` (sponsorship) — config-derived via
  `GeoTestnetConfig`, never hardcoded.
- **Research agent:** requires the research-agent standards in
  `.agents/agents/geo-research/references/` (source policy + allowlist) — it will not
  research without them.
