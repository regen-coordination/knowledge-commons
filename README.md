# Regen Knowledge Commons

The website, agent, ontology, and pipeline for capturing and exploring regenerative knowledge.

## V1 planning

For today's narrower delivery, run the [first-deployment prompts](docs/plans/2026-09-09-first-deployment-prompts.md) in order: repo foundation, initial ingestion, then deployment and demo rehearsal.

For the next implementation cycle, use the [build plan and team questions](docs/plans/2026-09-09-cycle-build-plan.md). It maps researched Linear issues to build steps and closure evidence; current cycle membership still needs confirmation.

Start with the [updated discussion brief](docs/research/2026-09-08-discussion-brief.md). The v1 finish line is a functional, live Knowledge Commons website, with a demonstrated source-to-surface flow and calibrated ingestion. Reports and model comparisons come first; Geo remains the proposed accepted-knowledge layer and R2 supplies public releases.

- [Pilot topics and four-model comparison](docs/research/2026-09-09-pilot-selection.md)
- [Knowledge Object metadata and eleven-class ontology candidate](docs/ontology/v1-candidate.md) — Afo owns the pin; candidate not yet ratified
- [Ingestion reports and template](reports/ingestion/README.md)
- [Architecture research and proposal](docs/research/2026-09-08-v1-architecture.md) — researched September 8, revised September 9
- [Pilot boundaries and rationale](docs/architecture/0001-pilot-boundaries.md)
- [Agent instructions and repo skills](AGENTS.md)

Workspace packages: `ontology`, `pipeline`, `agent`, and reserved `web`. Root `agent/skills` contains development and contribution guidance, including Matt Pocock’s pinned `codebase-design` skill. Reports are review records, not a mirror of accepted content.

Current state: Bun/TypeScript workspace with a Hono Worker, draft ontology validation, and an initial ingestion implementation using Cloudflare Workflows, D1, and private R2. Prompt 2 is complete locally: real topic-235 capture, GPT-5.6 Luna extraction, evidence validation, and Markdown report export have passed through the local Workflow, D1, and private R2. The approved cumulative model budget is $7; the four-model comparison remains follow-up. The web workspace is reserved; deployment, Geo submission, and the knowledge website remain later work.

Automatic review is now implemented locally: each completed ingestion dispatches machine Integrity assessment and report PR delivery. [Draft PR #2](https://github.com/regen-coordination/knowledge-commons/pull/2) contains the first real scored edition with individual team reviewer requests. The Article received a provisional machine score of 8/10; human review remains pending. See [review operations](docs/runbooks/automatic-review-delivery.md) for `GITHUB_TOKEN`, the shared budget, and deployment requirements.

## Development

Use Bun 1.4.2 and Node 24. From the repository root:

```sh
bun install --frozen-lockfile
bun run check
bun test
bun run build
```

`bun run build` bundles the Worker without deploying. For `bun run dev`, secret configuration, endpoint checks, and the Prompt 2 handoff, follow the [first-deployment runbook](docs/runbooks/first-deployment.md). Use `bun run format` for Biome formatting/lint fixes and `bun run ontology:generate` after changing canonical schemas. Root `agent/skills` remains the contributor instruction library; read the relevant skill through [AGENTS.md](AGENTS.md).

The pre-Cloudflare work now includes current-revision GitHub approval evaluation, private Geo operation previews, and a complete topic-356 demo delivered in [report PR #3](https://github.com/regen-coordination/knowledge-commons/pull/3). See the [current handoff](docs/runbooks/pre-cloudflare-handoff.md), [demo script](docs/runbooks/tomorrow-demo.md), and [human calibration worksheet](docs/runbooks/integrity-calibration.md). Geo encoding/submission and authentic human calibration remain pending.

Current review delivery uses **one Article, Source or Claim per Markdown file**, with each object's own evidence and Integrity assessment. See [object-review operations](docs/runbooks/object-reviews.md).
