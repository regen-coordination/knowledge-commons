# Automatic report PRs and Integrity assessment

**Current continuation:** [pre-Cloudflare handoff](pre-cloudflare-handoff.md) records report PR #3, approval evaluation, private Geo preparation, and the remaining $6.65 conservative allowance. Historical results below retain their original run/budget context.

## Current result

The local Worker has assessed the saved real ingestion and automatically delivered its scored report in [draft PR #2](https://github.com/regen-coordination/knowledge-commons/pull/2). The Article's machine Integrity score is **8/10**, with separate per-object ratings and reasons for the Source and five Claims. Human ratings and approvals are still pending.

The assessor flagged incomplete citation coverage for the contributor list and incomplete reuse/contest conditions. These are model findings for human review, not established human judgments or a pass threshold.

GitHub readback confirmed:

- Repository: `regen-coordination/knowledge-commons`; base: `main`; draft: true.
- Branch: `codex/report-f1c554cb-5a08-4014-b00a-4df51c512ba8-6a3f20c6efa5`.
- Commit: `546aac51610204c51534e47b769b11f5a3b5f210`.
- Exactly one added Markdown file under `reports/ingestion/topic-235/`; no raw captures or unrelated checkout changes.
- Labels: `automated/codex`, `draft`.
- Individual reviewers: `durgadasji`, `MattyCompost`, `rathermercurial`, `luizfernandosg`, `explorience`. Author `Oba-One` was excluded.

The original extraction report remains unchanged. [Local scored edition](../../reports/ingestion/reviews/f1c554cb-5a08-4014-b00a-4df51c512ba8-6a3f20c6efa5.md) matches the automatically delivered Markdown. The historical source identity is retained; replacing the demo source and the remaining naming-audit items are separate work.

## Configure and run

Apply all local migrations before starting the new code. `0003_reviews.sql` adds the review/assessment records and the shared budget dependency. The live environment needs the existing `OPENAI_API_KEY`, `PILOT_API_TOKEN`, `PILOT_BUDGET_USD`, and a **`GITHUB_TOKEN`** secret. Keep values in ignored `packages/agent/.env.pilot` or provision them securely as Worker secrets for deployment. Never put them in this runbook, PRs, or command arguments.

The delivery token needs access to this repository for contents and pull-request writes, metadata/readback, labels, and Knowledge Commons organization team membership reads. Choose supported repository-scoped authentication with the organization owner. The current adapter accepts a bearer token; it does not mint or refresh GitHub App installation tokens. An external credential manager must refresh expiring tokens. Local verification used the existing signed-in GitHub identity via a temporary ignored file, not a new production credential. That file is removed after verification; the original `.env.pilot` is preserved.

```sh
bun run db:migrate:local
bun run dev
```

A **new successful ingestion automatically dispatches ReviewWorkflow**. No separate export or GitHub command is required for that delivery path. Extraction completion and review/PR delivery status are separate, so a missing provider/GitHub credential or delivery failure does not hide the extraction report.

For an existing completed ingestion, securely load the pilot API token into the client process, then:

```sh
bun run review f1c554cb-5a08-4014-b00a-4df51c512ba8
bun run review f1c554cb-5a08-4014-b00a-4df51c512ba8 --status
bun run review f1c554cb-5a08-4014-b00a-4df51c512ba8 --export
```

`review` queues the workflow or restarts an errored review, at most three times. Completed assessment+delivery returns `existing`. `--status` reads the saved state and PR link. `--export` is an optional digest-checked local copy of the scored report; PR delivery does not depend on it. `PILOT_BASE_URL` overrides localhost and requires HTTPS outside loopback.

If a transient storage failure occurred before the review record was created, retry the same command after storage recovers. Recovery initializes the missing record from the validated candidate, then applies the same caller, lease and restart limits.

Authenticated endpoints:

| Endpoint | Behavior |
| --- | --- |
| `POST /v1/ingestions/:runId/review` | Dispatch/recover review for a completed ingestion; 202 |
| `GET /v1/ingestions/:runId/review` | Assessment and delivery state, error, digest, PR and reviewers |
| `GET /v1/ingestions/:runId/review/report` | Scored/unscored review edition and digest; 409 until available |
| `GET /v1/ingestions/:runId/report` | Original immutable extraction report |

The original caller owns the review endpoints; another caller gets 404. Reports are bounded and checked against their stored digest. The shared pilot token is one internal identity, not per-human authentication.

## Spending and failures

A live extraction reserves $0.05 and its automatic assessment reserves another $0.05 against the **same cumulative allowance**. The ingestion request's existing `maxCostUsd` is the extraction cap. Do not replenish the allowance accidentally when deploying into a new database.

After this verification, four extraction reservations total $0.20 and one assessment reservation totals $0.05. The ledger therefore retains **$0.25**, leaving **$6.75** of the approved $7. Recorded estimated provider usage is **$0.0120094** overall; reservations are not invoice charges.

Assessment result:

- Run: `f1c554cb-5a08-4014-b00a-4df51c512ba8`.
- Assessment: `integrity-f1c554cb-5a08-4014-b00a-4df51c512ba8`, machine, created `2026-09-10T01:30:50.740Z`.
- Requested/returned model: `gpt-5.6-luna`; input 13,677 tokens; output 3,451 including 239 reasoning; no cached input.
- Provider duration: 27.42 seconds (rounded). Estimated assessment cost: **$0.0068766**.
- Provider request: `req_9117b57f709540fab4735c26db1a7e01`.
- Candidate bundle: `sha256:9dbb3793d8957c0358ff94426450b330afdf3dbf18c0c1480c0cb43ab6f6e7a7`.
- Assessment digest: `sha256:9ff432e39fa024cacb7725e400004e28a02fce52fd4136358a1dc86f31b656db`.
- Scored Markdown digest: `sha256:6a3f20c6efa53272db9a55d83f091c038f2dc07b7ae13b350527a334c3fe7330`.
- Private assessment and original provider response: `runs/<run-id>/integrity.json` and `runs/<run-id>/integrity-response.json`. The saved request is private `integrity-input.json`.

`github_not_configured` is recoverable after provisioning the token. A GitHub timeout is reconciled through the deterministic branch/PR. Changed branches or non-draft/closed PRs block automatic edits. `integrity_attempt_needs_reconciliation` means a paid attempt has no saved response: inspect provider evidence before separately authorizing another run. Never clear the attempt to retry blindly. Schema/evidence failures retain the raw response and expose a blocked assessment; they do not fabricate a score.

A fixture run never publishes to GitHub, even if a token is present. Its assessment is labelled synthetic, and `fixture_github_delivery_disabled` is expected. Report review can continue while Geo is unavailable. PR approvals and Integrity scores do not publish knowledge.

## Verification and deployment limits

Local checks cover exact assessment object/reference validation, null versus zero scores, shared spending, immutable extraction records, uncertain-attempt blocking, authentication, edition tampering, GitHub response-loss reconciliation, branch/content changes, individual reviewer selection, and reviewer-request failure. Fixture run `2230e381-491f-4e13-b3e9-5bff4f0be92e` automatically dispatched assessment after ingestion through the real local Workflows/D1/R2 runtime.

The real run was first assessed with GitHub unconfigured, then safely resumed with delivery access; only one assessment attempt exists. The local Workflow journal records successful completion at `2026-09-10 01:33:45.104` with PR #2 as its result. Local runtime cancellation warnings did not prevent that completion. Repeated report delivery/request reuses the same PR and assessment. The live rule requires two team approvals for report paths, but no two-human review/merge test or Geo governance execution was performed.

Cloudflare deployment still awaits account access and production secrets. GitHub report PR #2 is real; no implementation-code push, merge, Geo submission, or website deployment occurred. See the [architecture decision](../architecture/0004-assessment-and-report-delivery.md) for recovery and authority boundaries.

Final local verification: `bun run check` passed; `bun test` passed **57 tests / 257 assertions**; `bun run build` passed at **923.95 KiB / gzip 158.48 KiB**. Final code revision: `sha256:7e85ffd7eaaba5cf0956b8202efea0701dacfa9a7c960338e8c4ba09889ae886`. Authenticated smoke and fixture ingestion/export passed. The scored report's bytes were independently verified through GitHub contents readback; exactly one matching PR exists. Both local servers were stopped, and the temporary `.dev.vars.pilot` and `.env.fixture` files were removed. The user's `.env.pilot` and private D1/R2 evidence remain intact. Remote implementation CI was not run because implementation code has not been pushed.
