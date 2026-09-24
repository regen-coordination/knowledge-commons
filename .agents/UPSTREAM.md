# Upstream — what came from where

This repository ports and adapts material from two upstream lineages,
both read-only. Nothing is written to the live Geo graph or to upstream
repos from this integration.

## Source toolkit

**[geo-explorers/content-management](https://github.com/geo-explorers/content-management)** @ `6191c3dd8233e59b85093cef3d1982f728154bc1` (2026-09-18).
Licence: MIT, (c) 2026 jwalkingjew.

| Ported from | Into this repo | Note |
|---|---|---|
| `skills/actionable/geo-publish` | `.agents/skills/geo-write/` (absorbed into composite) | publish gates, dry-run → confirm flow |
| `skills/actionable/geo-clean` | `.agents/skills/geo-write/` (absorbed into composite) | merge, delete, move, fix data types |
| `skills/actionable/geo-mirror` | `.agents/skills/geo-mirror/` | Geo ⇄ Notion mirror (Part 1 + Part 2) |
| `skills/non-actionable/geo-query` | `.agents/skills/geo-read/` | GraphQL queries, performance rules, canonical IDs |
| `skills/non-actionable/geo-describe` | `.agents/skills/geo-write/` (absorbed into composite) | descriptions, copyright/accuracy gates |
| `skills/non-actionable/image-banner-recompose` | `.agents/skills/geo-write/` (absorbed into composite) | banner recompose |
| `skills/non-actionable/ontology-advisor` | `.agents/agents/geo-ontology/` | modelling reference + scripts |
| `skill-dev/skill-quality-check/` | `.agents/skills/skill-quality-check/` | authoring standard + linter |
| `src/`, `lib/`, `scripts/` | `.agents/scripts/geo/` | entity-ops toolkit |
| `agents/AGENT-WORKFLOW.md` | `docs/geo/agent-workflow.md` | Notion operating contract (upstream refs) |
| `agents/MD-FILES.md` | `docs/geo/md-files.md` | markdown manifest for this repo |
| `agents/geo-research.md` | `.agents/agents/geo-research/` | research agent (merged with existing) |
| `agents/geo-mirror-refresh.md` | `.agents/agents/geo-mirror-refresh/` | mirror-refresh agent |
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
| `.claude/agents/geo-mirror-refresh.md` | `.agents/agents/geo-mirror-refresh/` | mirror-refresh agent |
| `SETUP.md` | `docs/geo/setup.md` | human-only setup steps |
| `src/functions.ts` | `.agents/scripts/geo/src/functions.ts` | reconciled, commons blocks preserved |
| `src/constants.ts` | `.agents/scripts/geo/src/constants.ts` | reconciled, commons blocks preserved |
| `skills/SKILL-VERSIONS.json` convention | `.agents/SKILL-VERSIONS.json` | integrity manifest for commons skills |

## Not ported (with reasons)

- **Installer/doctor tooling** (`tools/install.mjs`, `tools/doctor.mjs`) — host deployment layer; this repo's `.agents/` protocol replaces it.
- **Host-based skill routing** (Claude Code/Codex/Cowork tables) — this repo routes by task, not by host.
- **CLAUDE.md self-heal rule** — supply-chain hazard (tells an agent to fetch and run remote install scripts); rejected per working agreement "use capabilities actually available in this environment".
- **Eval suites** — deferred to follow-up issue (per-skill eval suites).
- **Context pack** (`context/` files) — upstream's 6-file curated context is not ported; this repo uses live graph + docs layer instead.

Integration date: 2026-09-23
