---
name: geo-write
description: Write to the Geo knowledge graph — publish/create/update/delete entities, relations, and page blocks via the GRC-20 SDK; clean the graph (find/merge duplicates, delete orphans, move/copy entities between spaces, fix data types, find blank properties, fix stale or duplicate-type relations, delete space data); write rules-compliant entity descriptions at scale; and recompose images into 2364x640 banners. Runs mandatory safeguards (ontology/correct-type check, semantic-duplicate check, schema check, type-required check, two-phase dry-run/confirm) before any write. Triggers on "publish", "create entity", "add person", "add to geo", "add to my space", "submit proposal", "create relation", "update entity", "delete entity", "find duplicates", "merge", "deduplicate", "delete orphan", "move entity", "copy entity", "delete space data", "fix data type", "find blank properties", "fix stale relations", "clean", "cleanup", "write descriptions", "describe these entities", "make a banner", "header image".
metadata:
  author: geobrowser
  version: 0.1.0
---

# Geo Knowledge Graph — Writing (publish · clean · describe · banners)

Every graph-mutating procedure for this repo, in one place. Three references and
one rule: nothing reaches the graph without the safeguarded flow.

## Shared invariants (apply to everything below)

- **Default target:** Knowledge Commons `bd727a6ad6ec4a058f681ea9002a1fbf` — a
  **DAO space** (testnet). Project writes go propose → vote → execute, never a
  direct personal-space write unless the editor explicitly says so.
- **Safeguarded flow (never skipped):** validate data (local) → space-scoped
  dedup check → build ops → dry-run report → review → publish → verify on-chain.
  Each step exists because a real production publish skipped it.
- **Deletion is the red line.** Destructive ops additionally run the cleaning
  gates (orphan check, both-scored escalation, explicit human confirmation;
  `publishOps` refuses batches removing data from >50 relations/values unless
  `CONFIRM_DESTRUCTIVE=1` — set it only on the confirmed run).
- **Secrets:** the human fills `.agents/scripts/geo/.env.geo-publish` by hand.
  Never read, print, or accept the key; verify existence only. Rotate on exposure.
- **Never fabricate IDs.** Resolve schema from the live graph (geo-read), and
  consult the **geo-ontology agent** for the *correct* type before proposing one
  (Gate 0 — "a type" is not "the right type").
- **No type-structure writes.** The ontology is owner-curated; fix instances,
  never the structure.
- **Toolkit:** `.agents/scripts/geo/` — `@geoprotocol/geo-sdk` v0.20+; Node 20.6+
  preferred (`node --env-file=.env scripts/<file>.ts`).
- **Browser-only assistants cannot publish** (no local runtime) — send them to
  geo-read.

## Routing — which reference to load

| Task | Load |
| --- | --- |
| Publish / create / update / delete entities, relations, page blocks (text, media, data, tabs); inject mode for a pasted URL; personal vs DAO space flows | [`references/publishing.md`](references/publishing.md) |
| Find/merge duplicates, delete orphans, move/copy entities, fix data types, find blank properties, stale or duplicate-type relations, delete space data | [`references/cleaning.md`](references/cleaning.md) · deep refs: [`references/cleaning-reference.md`](references/cleaning-reference.md), [`references/big-merge.md`](references/big-merge.md) |
| Write rules-compliant entity descriptions at scale (extract → verify → compose → gate → queue for review) | [`references/describing.md`](references/describing.md) · rules: `references/description-rules.md` and siblings |
| Recompose an uploaded image into a 2364 × 640 banner (cover/header) | [`references/banner-recompose.md`](references/banner-recompose.md) |

## What this skill never does

- Raw GraphQL mutations or SDK shortcuts outside `.agents/scripts/geo/`.
- Scripts that publish at import time — `--publish` is an explicit flag; unattended
  runs stop at the dry-run report.
- Turning an authorization failure into a skipped write — fail closed; keep
  transaction/edit IDs.

## Files

- `references/publishing.md` — ops, gates (incl. Gate 0 ontology consult),
  typed-value mapping, block publishing + well-known block IDs, DAO vs personal
  flows, inject mode.
- `references/cleaning.md` — every cleaning operation with its gates and plan
  templates. `references/cleaning-reference.md`, `references/big-merge.md`.
- `references/describing.md` + `references/description-rules.md`,
  `references/accuracy-verification.md`,
  `references/closeness-and-accuracy-checks.md`,
  `references/copyright-and-licensing.md`.
- `references/banner-recompose.md` — strategies, API endpoints, QA.
- `scripts/check_similarity.py` — description-closeness gate.
