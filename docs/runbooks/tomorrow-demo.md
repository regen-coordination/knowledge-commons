# Regen Knowledge Commons five-minute demo

**Rehearsed locally; hosted URL pending Cloudflare access.** Use topic 356, the Commitment Pooling proposal. Its four posts were captured completely. Linked pages were not followed. The new source and report do not contain the previous demo's Toolkit title.

The saved successful run is `eba2a43f-caa7-4f88-a1d8-a21a595c7b17`. [Draft report PR #3](https://github.com/regen-coordination/knowledge-commons/pull/3) is the live review destination; the [saved scored report](../../reports/ingestion/reviews/eba2a43f-caa7-4f88-a1d8-a21a595c7b17-45a9ce3f3778.md) is the fallback. This is an existing run, not a freshly generated result each time the demo is shown.

## Start locally

From the repository root, use the existing ignored pilot environment file. A deployed service will need its own secrets; local CLI access is not a Worker credential.

```sh
bun install --frozen-lockfile
bun run db:migrate:local
bun run dev
```

In a second terminal:

```sh
bun --env-file=packages/agent/.env.pilot scripts/smoke.ts
bun --env-file=packages/agent/.env.pilot scripts/ingest.ts demo-356-2026-09-09 356
bun --env-file=packages/agent/.env.pilot scripts/review.ts eba2a43f-caa7-4f88-a1d8-a21a595c7b17 --status
bun --env-file=packages/agent/.env.pilot scripts/review.ts eba2a43f-caa7-4f88-a1d8-a21a595c7b17 --export
bun --env-file=packages/agent/.env.pilot scripts/prepare.ts eba2a43f-caa7-4f88-a1d8-a21a595c7b17 geo
bun --env-file=packages/agent/.env.pilot scripts/prepare.ts eba2a43f-caa7-4f88-a1d8-a21a595c7b17 approvals
```

These commands were tested against the local pilot. The submit command reused the existing completed run and did not make a second model call. Fresh approval evaluation needs `GITHUB_TOKEN` in the Worker. The temporary credential used during rehearsal was removed; without a configured replacement, that final command returns an inspectable `github_not_configured` result. Existing report retrieval still works.

For deployment, set `PILOT_BASE_URL` to the verified HTTPS Worker URL and use the securely provisioned pilot token. The new remote database will not contain the local run unless explicitly migrated. Record its new run ID and budget before changing the demonstration commands; do not imply the local UUID proves remote ingestion.

## Five minutes

1. **0:00–0:45 — What exists.** Show `agent -> pipeline -> ontology` and the reserved web package. This is a protected ingestion/review API; the knowledge website is later work.
2. **0:45–1:30 — Service and validation.** Show smoke results: public liveness, rejected unauthorized requests, authenticated readiness, draft ontology and useful validation failures. State that this rehearsal is local.
3. **1:30–2:45 — Source to report.** Show topic 356, its four native posts and the saved report. The source proposes a resource; it does not establish that a finished playbook exists. The source's linked documents were not read.
4. **2:45–3:45 — Integrity and human review.** Expand the Article's five dimensions: machine score 8/10, with reasons. Show per-object ratings and the two-review requirement. The new verifier observed zero approvals. The Claim labelled “Disputed” deserves review: the cited reply appears to discuss possible changes rather than dispute an assertion. Present this as an agent audit observation, not a supplied human rating.
5. **3:45–5:00 — Geo preparation and next step.** Show the private preparation's digest and blockers. It has symbolic mappings and stable IDs; no SDK encoding, Geo upload, proposal, execution or indexing has occurred. Explain the pending human calibration, Geo setup and Cloudflare deployment.

If the local service is slow or unavailable, open the saved report and PR. Do not repeatedly create new ingestion keys as a demo retry. The machine extraction and assessment together reserved $0.10 and recorded approximately $0.00728 estimated usage for this run.

The historical topic-235 reports remain unchanged for provenance. Additional models, human approvals, ontology ratification, accepted-knowledge publication and a deployed website are not demonstrated.
