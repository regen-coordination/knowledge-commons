# Regen Knowledge Commons

Shared knowledge infrastructure for regenerative communities. We are developing ways to organize and connect useful knowledge, preserve where it came from, distinguish raw material from reviewed work, and make it easier for people to learn from one another.

This repository brings together Geo documentation and agent tools and developing knowledge-ingestion, review, and organizational-knowledge approaches. It is a place to understand and build this work, not a claim that every component is deployed, every proposal is adopted, or all regenerative knowledge belongs in one repository.

## Start here

- [Project map](docs/MAP.md) - how Knowledge Commons, the Garden, Toolkit, and Coordination OS relate; where to find earlier research and implementation lineage.

- [Regen Knowledge Garden](docs/regen-knowledge-garden.md) - the Regen-specific knowledge environment and its current Geo entry point.

- [Geo documentation and tooling](docs/geo/README.md) - guidance for the shared Knowledge Commons space on Geo and its operating procedures.

- [Agent guidelines](.agents/agents.md) - the existing agent and skill layout and its safety rules; see the [upstream record](.agents/UPSTREAM.md) for the origins of adapted tools.

## How the parts fit

| Part | Scope |
| --- | --- |
| [Knowledge Commons on Geo](https://www.geobrowser.io/space/bd727a6ad6ec4a058f681ea9002a1fbf) | A shared space for knowledge-commoning practice and reusable semantic structures. It is intended to support other communities, not contain their entire knowledge environments. |
| [Regen Knowledge Garden](docs/regen-knowledge-garden.md) | The wider Regen-specific effort to find, connect, cultivate, review, and use knowledge from different sources. Its [Geo space](https://www.geobrowser.io/space/b818ec4b89d949d88342249e3c649cd0) is one current surface, not the whole Garden. |
| [Regen Toolkit](https://github.com/regen-coordination/regen-toolkit) | A separate public educational and practical knowledge product. Its material may inform the Garden. |
| [Regen Coordination OS](https://github.com/regen-coordination/regen-coordination-os) | A separate organizational coordination and memory project. Selected learning may inform the Garden without merging the projects. |

This naming also keeps Regen Commons, a separate initiative, distinct from the Regen Knowledge Commons workstream described here.

## Development status - 29 October 2026

These tracks are related, but they are not one ratified or fully deployed architecture.

| Work | What is available or proposed | Where to look |
| --- | --- | --- |
| Geo documentation and agent tools | Present on main: documentation, read/write skill routing, research and curation agents, and related tooling. Publishing to Geo has separate governance and safety gates. | [Geo docs](docs/geo/README.md), [agent guidelines](.agents/agents.md), [upstream record](.agents/UPSTREAM.md) |
| Ingestion and review pilot | Merged into main: authenticated ingestion, evidence validation, machine Integrity assessment, per-object reports, and exact-revision human-review checks. The pilot is locally verified; hosted deployment, knowledge acceptance, and Geo submission remain pending. | [Foundation PR #4](https://github.com/regen-coordination/knowledge-commons/pull/4) -> [Object review PR #7](https://github.com/regen-coordination/knowledge-commons/pull/7) -> [Corrections PR #8](https://github.com/regen-coordination/knowledge-commons/pull/8) |
| Review examples | Immutable calibration reports and their review index are on main. Report PRs #2, #3, #5 and #6 remain open at their original heads and base main. Topic 356 corrections and human calibration remain pending; merging the archive does not accept its knowledge or authorize publication. | [Review PR #5](https://github.com/regen-coordination/knowledge-commons/pull/5), [review PR #6](https://github.com/regen-coordination/knowledge-commons/pull/6) |
| Review tracking and project navigation | Merged into main: edition tracking, report disposition proposals, the project map and Garden introduction. | [Tracking PR #15](https://github.com/regen-coordination/knowledge-commons/pull/15), [navigation PR #16](https://github.com/regen-coordination/knowledge-commons/pull/16) |
| Knowledge Commons KMS instance proposal | A separate, unmerged proposal for organizing knowledge across peer repositories. Publication is disabled in its proposal configuration, and its own documentation says it is not ready to merge as-is. | [KMS proposal](https://github.com/regen-coordination/knowledge-commons/blob/proposal/org-os-kms-instance/kms/README.md) |

The ingestion pilot and KMS proposal make different architectural assumptions. Their relationship remains a design question. The ingestion implementation and runbooks are on main; KMS remains confined to its proposal branch with publication disabled.

## Working principles

- Sources and stewardship matter. A source system is more than a link; preserve attribution, context, reuse boundaries, and a way to correct mistakes.

- Visibility is not approval. Raw, AI-assisted, source-linked, and human-reviewed material are different states. A public graph entry is not automatically accepted knowledge.

- The repository is a map, not the Garden. This documentation should help people find the work, not duplicate a growing registry of people, projects, source systems, and ideas.

- Keep projects distinct and connected. Shared learning and interoperable tools do not require a single repository, ontology, or storage system.

## Contributing or finding the next step

For documentation corrections, source questions, or proposed changes, use this repository's [issues](https://github.com/regen-coordination/knowledge-commons/issues) or [pull requests](https://github.com/regen-coordination/knowledge-commons/pulls). For Geo reads and edits, begin with [Geo operations](docs/geo/operations.md) and its separate proposal, review, and publish rules. For the ingestion pilot, begin with [local setup](docs/runbooks/first-deployment.md) and [object-review operations](docs/runbooks/object-reviews.md).

Earlier architecture, the July 2026 research handoff, the structured migration corpus, and useful upstream and peer references are indexed in the [project map](docs/MAP.md). They are important lineage, not automatic authority for the current design.

## Working in this checkout

Main now includes the ingestion implementation from #4, #7 and #8, review tracking from #15, and project navigation from #16. The [consolidation record](docs/plans/2026-10-29-consolidation.md) preserves the preparation and review sequence; the [review index](reports/ingestion/INDEX.md) tracks the still-open report reviews.

| Path | Responsibility |
| --- | --- |
| `.agents/` | Geo operating agents, skills and standalone toolkit; start with its [guide](.agents/agents.md) |
| `agent/skills/` | Contributor guidance for developing the ingestion pilot |
| `packages/ontology` | Canonical draft contracts and generated schemas |
| `packages/pipeline` | Capture, validation, reports, approvals and private Geo preparation |
| `packages/agent` | Hono Worker, bindings and durable orchestration |
| `packages/web` | Reserved public-contract consumer; the website is not implemented |

Use Bun 1.4.2 and Node 24 for the ingestion workspace:

```sh
bun install --frozen-lockfile
bun run check
bun test
bun run build
```

`build` bundles the Worker without deploying. Geo's toolkit has its own dependencies and checks; root checks exclude `.agents/`. Read [AGENTS.md](AGENTS.md), the [architecture decisions](docs/architecture/0001-pilot-boundaries.md), and [local setup](docs/runbooks/first-deployment.md) before implementation or local execution. Use `bun run format` for Biome fixes, `bun run code:generate` after implementation edits, and `bun run ontology:generate` after changing canonical schemas.

The [review index](reports/ingestion/INDEX.md) records editions and human feedback. See [object-review operations](docs/runbooks/object-reviews.md), [automatic delivery](docs/runbooks/automatic-review-delivery.md), [pre-Cloudflare handoff](docs/runbooks/pre-cloudflare-handoff.md), [deployment preflight](docs/runbooks/cloudflare-preflight.md), and [calibration worksheet](docs/runbooks/integrity-calibration.md). Deployment, real Geo encoding/submission, ontology ratification, and completed human calibration remain pending.

The September [pilot selection](docs/research/2026-09-09-pilot-selection.md), [ontology candidate](docs/ontology/v1-candidate.md), [architecture research](docs/research/2026-09-08-v1-architecture.md), [discussion brief](docs/research/2026-09-08-discussion-brief.md), [cycle plan](docs/plans/2026-09-09-cycle-build-plan.md), and [first-deployment prompts](docs/plans/2026-09-09-first-deployment-prompts.md) preserve implementation context. Their changing choices and checkpoints are not fresh activation decisions.
