---
name: geo-mirror
description: Mirror Geo entities into Notion (Part 1) and publish changes back from Notion tables carrying a Geo ID column (Part 2). Part 1 is read-only on Geo; Part 2 needs the wallet key. Triggers on "mirror to notion", "geo to notion", "export space to notion", "sync geo into notion", "refresh the mirrors", "update the mirrors".
metadata:
  version: "0.12.0"
  author: geobrowser
---

# Geo ⇄ Notion mirror

// Provenance: adapted from geo-explorers/content-management
// Source: skills/actionable/geo-mirror/SKILL.md
// Pinned SHA: 6191c3dd8233e59b85093cef3d1982f728154bc1
// Date: 2026-09-23

Two directions, gated separately:

- **Part 1 — Geo → Notion.** Pull a space's entities into linked Notion databases,
  each row keyed by its **Geo ID**. Read-only on Geo. Re-runs update rows in place.
- **Part 2 — Notion → Geo.** Diff the editor's Notion edits against the current Geo
  version and publish the changed fields back through geo-write's two-phase gate
  (diff → review → dry-run → publish).

## Prerequisites

1. **Notion token** in `.env` as `NOTION_TOKEN`.
2. **Wallet key** in `.env` as `GEO_PRIVATE_KEY` (Part 2 only).
3. **Integration connected** to the parent Notion page (page → ⋯ → Connections).

## Part 1 — Geo → Notion

### Claims + Topics mirror

```bash
# dry run (default)
node --env-file=.env .agents/skills/actionable/geo-mirror/scripts/mirror-claims-topics.mjs \
  --space <SPACE_ID> --parent <NOTION_PAGE_ID> --out /tmp/extract.json
# publish after editor confirms
node --env-file=.env .agents/skills/actionable/geo-mirror/scripts/mirror-claims-topics.mjs \
  --space <SPACE_ID> --parent <NOTION_PAGE_ID> --publish
```

### Accepted sources mirror

```bash
node --env-file=.env .agents/skills/actionable/geo-mirror/scripts/mirror-sources.mjs \
  --parent <NOTION_PAGE_ID> --out /tmp/sources.json
node --env-file=.env .agents/skills/actionable/geo-mirror/scripts/mirror-sources.mjs \
  --parent <NOTION_PAGE_ID> --publish
```

### Generic entity mirror

```bash
# extract (read-only)
node .agents/skills/actionable/geo-mirror/scripts/extract-space.mjs <SPACE_ID> \
  --since YYYY-MM-DD --out mirror.json
# mirror to Notion (dry-run default; add --publish after review)
node --env-file=.env .agents/skills/actionable/geo-mirror/scripts/mirror-to-notion.mjs \
  mirror.json --parent <NOTION_PAGE_ID>
```

## Part 2 — Notion → Geo

```bash
# plan (read-only)
node --env-file=.env .agents/skills/actionable/geo-mirror/scripts/plan-notion-changes.mjs \
  --page <PAGE_ID> --out plan.json
# dry run (default)
node --env-file=.env .agents/skills/actionable/geo-mirror/scripts/sync-to-geo.mjs plan.json
# publish after editor confirms
node --env-file=.env .agents/skills/actionable/geo-mirror/scripts/sync-to-geo.mjs \
  plan.json --publish
```

## Rules

1. **Dry run first, always.** Show counts and wait for editor "go".
2. **Never delete a Notion row** that fell out of Geo scope — report it.
3. **Scope is required** — never mirror a whole space without narrowing
   (date range, topic, limit, or ids-file).
4. **Geo ID is the key** — never edit or remove the Geo ID column.
5. **Part 2 two-phase gate** — dry-run → editor review → `--publish`. The script uses the canonical `publishOps` from `.agents/scripts/geo/src/functions.ts` (personal-vs-DAO routing + circuit-breaker). The editor's Notion review replaces geo-write's per-entity ontology/duplicate checks for this flow; scoped changes to known entities only.

## What this skill does NOT do

- Skip the dry-run gate.
- Publish without editor confirmation.
- Mirror an unbounded space (thousands of entities).
- Write to Geo in Part 1.
