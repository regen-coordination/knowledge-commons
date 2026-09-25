# Upstream — what came from where

This repository ports and adapts material from two upstream lineages,
both read-only. Nothing is written to the live Geo graph or to upstream
repos from this integration.

## Source toolkit

**[geo-explorers/content-management](https://github.com/geo-explorers/content-management)** @ `6191c3dd8233e59b85093cef3d1982f728154bc1` (2026-09-18).
Licence: MIT, (c) 2026 jwalkingjew.

| Ported from | Into this repo | Note |
|---|---|---|
| `skills/actionable/geo-publish` | `.agents/skills/actionable/geo-write/` (absorbed into composite) | publish gates; v0.11.0 dry-run table + safe key-file handling (`a2f9a153`) |
| `skills/actionable/geo-clean` | `.agents/skills/actionable/geo-write/` (absorbed into composite) | merge, delete, move, fix data types |
| `skills/non-actionable/geo-query` | `.agents/skills/non-actionable/geo-read/` | GraphQL queries, performance rules, canonical IDs; v0.2.9 adds space-scoped entity values/relations (`f5b443f1`) |
| `skills/non-actionable/geo-describe` | `.agents/skills/actionable/geo-write/` (absorbed into composite) | descriptions, copyright/accuracy gates |
| `skills/non-actionable/image-banner-recompose` | `.agents/skills/actionable/geo-write/` (absorbed into composite) | banner recompose |
| `skills/non-actionable/ontology-advisor` | `.agents/agents/geo-ontology/` | modelling reference + scripts |
| `skill-dev/skill-quality-check/` | `.agents/skills/non-actionable/skill-quality-check/` | authoring standard + linter |
| `src/`, `lib/`, `scripts/` | `.agents/scripts/geo/` | entity-ops toolkit |
| `agents/MD-FILES.md` | `docs/geo/md-files.md` | markdown manifest for this repo |
| `agents/geo-research.md` | `.agents/agents/geo-research/` | research agent (merged with existing) |
| `validate_migration.ts` | `.agents/scripts/geo/validate_migration.ts` | post-merge verifier |
| `skill-dev/skill_versions.py` | `.agents/scripts/geo/skill_versions.py` | integrity-manifest verifier |

## Curated distribution

**[geo-explorers/geo-editor-agent](https://github.com/geo-explorers/geo-editor-agent)** @ `875549162fc17804c08aa47feec4672ba9f48590` (2026-09-23).
Licence: MIT, (c) 2026 jwalkingjew.

| Ported from | Into this repo | Note |
|---|---|---|
| `.claude/agents/geo-agent.md` | `.agents/agents/geo-agent/` | generic Geo agent (boundary: dry-run ends authority) |
| `.claude/agents/geo-task.md` | `.agents/agents/geo-task/` | planning-only agent |
| `.claude/agents/geo-research.md` | `.agents/agents/geo-research/` (merged) | research improvements merged into existing |
| `SETUP.md` | `docs/geo/setup.md` | human-only setup steps |
| `src/functions.ts` | `.agents/scripts/geo/src/functions.ts` | reconciled, commons blocks preserved |
| `src/constants.ts` | `.agents/scripts/geo/src/constants.ts` | reconciled, commons blocks preserved |
| `skills/SKILL-VERSIONS.json` convention | `.agents/skills/SKILL-VERSIONS.json` | integrity manifest for commons skills |

## Not ported (with reasons)

- **`geo-mirror` skill (Geo ⇄ Notion)** — upstream's editors work inside Notion; this
  repository has no Notion workspace, so the mirror scripts have nothing to talk to.
  Removed from the integration rather than carried as dead code.
- **`agents/AGENT-WORKFLOW.md` (the Notion operating contract)** — same reason; its
  content described how an editing team runs its Notion pages.
- **`agents/geo-mirror-refresh.md`** — the agent that refreshed those mirrors.
- **Installer/doctor tooling** (`tools/install.mjs`, `tools/doctor.mjs`) — host deployment layer; this repo's `.agents/` protocol replaces it.
- **Host-based skill routing** (Claude Code/Codex/Cowork tables) — this repo routes by task, not by host.
- **CLAUDE.md self-heal rule** — supply-chain hazard (tells an agent to fetch and run remote install scripts); rejected per working agreement "use capabilities actually available in this environment".
- **Eval suites** — deferred to follow-up issue (per-skill eval suites).
- **Context pack** (`context/` files) — upstream's 6-file curated context is not ported; this repo uses live graph + docs layer instead.

## `.upstream-sha` pins

Each upstream lineage has a pinned SHA recorded in a `.upstream-sha` file at the repo root:

- `.upstream-sha-content-management` — content-management source toolkit
- `.upstream-sha-geo-editor-agent` — geo-editor-agent curated distribution

Integration date: 2026-09-23
