# Publishing to Geo

How writes to Geo work, and the safety rules that keep bad data off the graph.
This is the high-level layer — the gates, op builders, typed-value tables, and
script templates live in the **geo-write skill** (`.agents/skills/geo-write/`,
full reference at `.agents/skills/geo-write/references/publishing.md`),
which agents must follow rather than improvising.

> Namespaced under `docs/geo/` — see [`README.md`](./README.md) for the
> overview and [`querying.md`](./querying.md) for reads.

Primary sources: the official
[geo-publish skill](https://github.com/geobrowser/geo-skills/blob/main/geo-publish/SKILL.md)
and its [reference](https://github.com/geobrowser/geo-skills/blob/main/geo-publish/reference.md),
and the [geo-sdk README](https://github.com/geobrowser/geo-sdk).

---

## How a write reaches the graph

Writes are **ops** (set/delete a triple or relation) grouped into an **edit**,
encoded to binary, uploaded to IPFS, then posted onchain and exposed by the
indexer. Personal spaces take direct `publishEdit` calls; **DAO spaces take
proposals + voting** (propose → vote → explicit execute after the vote passes).

## Prerequisites

- Node 20.6+ (or Bun) and `@geoprotocol/geo-sdk` v0.20+ (exact-pinned).
- A testnet key: export at [geobrowser.io/export-wallet](https://www.geobrowser.io/export-wallet)
  (press **Copy key** — a different value from the wallet-address copy), then
  the human puts `GEO_PRIVATE_KEY=0x…` in a gitignored `.env.geo-publish`.
- A personal space for the signer; DAO writes additionally require editor role
  or voting authorization in the target DAO space.

## Credential handling (safety protocol)

- Use a dedicated, least-privilege **testnet** key.
- The human creates the env file in an editor or terminal the assistant cannot
  see. Verify existence only (`test -f .env.geo-publish`); never read or print
  contents.
- Never place the key in chat, command arguments, repository files, fork-PR CI,
  build artifacts, or debug output. Redact errors before logging.
- Rotate the key immediately on actual or suspected exposure. If a key was
  pasted into chat: revoke at geobrowser.io/export-wallet and create a fresh one.

## The safeguarded workflow

Every publish goes through the gated pipeline the geo-write skill enforces:

```
validate data (local) → space-scoped dedup check → build ops → dry-run report
→ review → publish → verify on-chain
```

Each step exists because a real production publish skipped it: unvalidated
data shipped hundreds of broken entities; unscoped dedup checks missed real
duplicates; publishes without dry-runs hid broken ops behind `success: true`;
"published" has repeatedly turned out not to mean "correct on chain" without a
verification pass.

**For this project**, writes target the **Knowledge Commons** — a DAO space
(`bd727a6ad6ec4a058f681ea9002a1fbf`, testnet) — so the default path is
propose → vote → execute, not a direct personal-space publish. The ontology is
the live space's (mirrored in `docs/geo/ontology.md`); never create or
restructure types, and resolve all schema IDs from the live graph rather than
guessing.

In commons terms ([`commoning.md`](./commoning.md)): the DAO path *is* the
governance layer — the community's protocols, values and norms — and the
dedup gate is the craft rule of **one canonical entity: link, don't fork
copies**. The gates are not workflow overhead; they are the commons'
integrity infrastructure.

## Safety rules

1. **Never write to Geo by hand.** Every create/update/delete goes through
   the safeguarded flow (semantic-duplicate check, schema check, type-required
   check, dry-run → explicit confirm). Raw scripts skip all of it.
2. **Deletion is the red line.** No hand-written deletes, no delete loops, no
   routing around destructive-op backstops — cleanup goes through geo-write's
   cleaning reference.
3. **Secrets:** never read, print, or accept the private key. Verify `.env`
   exists at most; the human fills it by hand. Rotate on exposure.
4. **No demo scripts that publish at import time.** `--publish` must be an
   explicit flag; unattended runs stop at the dry-run report. Keep live
   credentialed writes out of deterministic CI.
5. **Treat errors as distinct.** Transport, GraphQL, authorization, and
   sponsorship failures are different errors — never turn an authorization
   failure into a skipped write. Fail closed; keep transaction/edit IDs.
6. **Verify after publishing.** Submit each transaction once, record the hash
   and edit/proposal IDs, and confirm indexing through the API.

Routing and the full hard-rule list: [`operations.md`](./operations.md).

---

## Sources

- [geo-publish SKILL.md](https://github.com/geobrowser/geo-skills/blob/main/geo-publish/SKILL.md) — official publishing skill (quickstart, ops, DAO flow, safety)
- [geo-publish reference.md](https://github.com/geobrowser/geo-skills/blob/main/geo-publish/reference.md) — full SDK setup, typed values, personal-space creation, failure paths
- [geo-sdk README](https://github.com/geobrowser/geo-sdk) — Ops API, client API, sponsored wallet, full flows
- [geo-explorers/geo-sdk-tutorial](https://github.com/geo-explorers/geo-sdk-tutorial) — safeguarded curator pipeline (validate → dedup → dry-run → publish → verify)
- [EIP-7702: Set Code for EOAs](https://eips.ethereum.org/EIPS/eip-7702) — sponsored-transaction mechanism used by `createGeoWalletClient`
- [GRC-20 Knowledge Graph spec](https://github.com/yanivtal/graph-improvement-proposals/blob/new-ops/grcs/0020-knowledge-graph.md) — ops/edits data model
