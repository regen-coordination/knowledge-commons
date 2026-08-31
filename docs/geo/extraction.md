# Provenance — imported material & deleted sources

This is the single provenance record for the repo's imported material: (1)
the upstream Geo extraction that seeded `.agents/` and these docs, and (2)
the project's own source material (master doc + space captures), which has
since been **removed from the repo** after distillation.

The original `docs/geo/source/` folder (and `docs/project/source/`) were
deleted 2026-08-31 once extraction/distillation was verified — the tables
below are the audit trail of where everything went.

**Path remapping applied to skill/toolkit copies** (upstream → here):

| Upstream (from a skill folder in `content-management/skills/<tier>/<name>/`) | Here |
| --- | --- |
| `skills/<tier>/<name>/` | `.agents/skills/<name>/` (flat, tier dropped) |
| repo-root `src/…`, `lib/…`, `scripts/…` | `.agents/scripts/geo/src|lib|scripts/…` |
| `../src/`, `../../src/`, `../../../src/` refs in skill docs | `../../scripts/geo/src/` (or `.agents/scripts/geo/src/` in prose) |
| `documentation/research-agent-*.md` | `.agents/agents/geo-research/` |
| `validate_migration.ts` (repo root) | `.agents/scripts/geo/validate_migration.ts` |
| `skill-dev/skill_versions.py` | `.agents/scripts/geo/skill_versions.py` |

## content-management → destination

| Source | Destination | Note |
| --- | --- | --- |
| `skills/actionable/{geo-clean,geo-discovery,geo-orchestrate,geo-publish}` | `.agents/skills/…` | verbatim + path remap |
| `skills/non-actionable/{daily-report,geo-describe,geo-press-review,geo-query,image-banner-recompose,ontology-advisor}` | `.agents/skills/…` | verbatim + path remap; **geo-describe locally modified 2026-08-31** (v0.2.1: added description-rules rule 7, disambiguate early) |
| `skill-dev/skill-quality-check/` | `.agents/skills/skill-quality-check/` | skill-authoring standard + linter |
| `agents/geo-research.md` | `.agents/skills/geo-research/SKILL.md` | agent def → folder skill |
| `src/`, `lib/`, `scripts/{press-review-coverage-map,check-space-list,inject-publish-example}.ts` | `.agents/scripts/geo/…` | entity-ops toolkit |
| `validate_migration.ts`, `package.json`, `tsconfig.json`, `LICENSE`, `.env.example` | `.agents/scripts/geo/…` | `.env.example` → `env.example.geo` |
| `knowledge-graph-ontology.md` | was `docs/geo/ontology.md`; **now dropped** | generic GRC-20 mechanics; skills carry what they need + link to the [GRC-20 spec](https://github.com/geobrowser/grc-20/blob/main/spec.md); `ontology.md` is now the commons ontology |
| `documentation/research-agent-{source-policy,allowlist,mvp}.md` | `.agents/agents/geo-research/` | research-agent standards |
| `CLAUDE.md`, `README.md`, `agents/README.md` | `docs/geo/operations.md` | distilled: routing, hard rules, env |
| `skills/versions.md` | was distilled to `docs/geo/skill-changelog.md`; **now dropped** | per-skill history not kept in-repo; git history + upstream repo cover it |
| `skill-dev/{README.md,skill_versions.py,sync-skills.sh}`, `skills/{README.md,SKILL-VERSIONS.json}` | README distilled into `docs/geo/operations.md`; `skill_versions.py` kept | `sync-skills.sh` + manifest dropped: they assume the upstream layout/CI |
| `01…11_*.ts` (one-off fix scripts), `testing.ts`, `scripts/2026-07-28-sdk-v020-migration-check.ts`, `todo.md` | **dropped** | historical incident fixes; lessons already captured in the upstream skill changelogs |

## geo-sdk-tutorial → destination

| Source | Destination |
| --- | --- |
| `curator-courses/*.ts` + `data_to_publish/` | `.agents/scripts/geo/curator-courses/` |
| `README.md` | `.agents/scripts/geo/curator-courses/README.md` |
| `package.json`, `tsconfig.json`, `.gitignore` | dropped (toolkit `package.json` pins SDK 0.20.x; courses are reference patterns) |

## agents-hub-space → destination

| Source | Destination |
| --- | --- |
| `export.py` | `.agents/scripts/geo/export_space.py` |
| `entities-all.json`, `pages.json`, `text-blocks.json` | **dropped** (point-in-time space snapshot; re-export with `export_space.py` when needed) |

## Project source material (deleted 2026-08-31, distilled first)

| Source | Was | Distilled into |
| --- | --- | --- |
| `toolkit/Regen Knowledge Commons Toolkit.md` | Google Doc export of the project's master doc (39.7k lines, June 2026 vintage). AI-assisted stabilization draft — explicitly non-canonical; owner intent wins. | **Deleted 2026-08-31** after distillation into [`mission.md`](./mission.md) (mission/scope synthesis). No in-repo analysis or type inventory kept. |
| `geo-space/2026-08-28/{types,relations,id-names}.json` | Raw GraphQL captures of the Knowledge Commons space (`bd727a6a…`, testnet): 18-type baseline, 733 relations, 138-entry id→name map. | **Deleted 2026-08-31** — superseded by [`ontology.md`](./ontology.md); regenerable via `.agents/scripts/geo/export_space.py`. |
| `geo-space/history.md` | Capture-session narrative: state timeline (initial → post-merge → post-fix) and what was discarded. | **Deleted 2026-08-31**; ontology state lives in [`ontology.md`](./ontology.md). |

Known caveats that outlived the captures: testnet indexer pagination is
broken past the first page (`entities`/`entitiesConnection` with
offset/cursor) — re-verify before relying on any "complete" pull; GraphQL
reads can return stale data.

## Updating from upstream

Fetch the upstream tarball and re-copy per the tables above, then re-apply
the path remapping. The toolkit `package.json` in `.agents/scripts/geo/`
pins the SDK version; check the upstream repo for updates first.
