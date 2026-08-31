---
id: geo_substrate
title: Geo substrate — Knowledge Commons space facts
content: DAO space bd727a6ad6ec4a058f681ea9002a1fbf on Geo testnet, 18 owner-curated types, writes via propose-vote-execute
importance: high
tags: geo, knowledge-commons, ontology, space
---

The Regen Knowledge Commons runs on Geo, in space
`bd727a6ad6ec4a058f681ea9002a1fbf` (testnet, DAO-governed). Snapshot as of
2026-08-31 (verified live; the live space is authoritative — mirror at
`docs/geo/ontology.md`):

- **18 types, owner-curated**, grouped in buckets; the meta-typed hierarchy is
  owner-curated — agents never create/rename/delete a Type.
- **Reads:** `POST https://api-testnet.geobrowser.io/graphql`, no auth.
  (`testnet-api.geobrowser.io` is retired.)
- **Writes:** ops → edit → IPFS → onchain; DAO spaces take propose → vote →
  execute, never direct publishes. All writes go through the geo-write skill's
  safeguarded flow.
- **Minimum ontology rule:** add a type only when it changes routing/behavior;
  reuse-first (Knowledge Commons tier 0 → Geo root → canonical domain spaces).
- **Toolkit:** `.agents/scripts/geo/` (geo-sdk v0.20+).
