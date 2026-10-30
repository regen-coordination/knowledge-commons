# First deployment handoff

**Current continuation:** [pre-Cloudflare handoff](pre-cloudflare-handoff.md) records report PR #3, approval evaluation, private Geo preparation, and the remaining $6.65 conservative allowance. Historical results below retain their original run/budget context.

**Prompt 2 is complete locally.** A real Hub topic-235 capture passed through GPT-5.6 Luna extraction, validation, and Markdown export using local Cloudflare Workflows, D1, and private R2. External Hub and OpenAI requests were real. Deployment remains Prompt 3. Use [hub-intake](../../agent/skills/hub-intake/SKILL.md) and the [bounded prompts](../plans/2026-09-09-first-deployment-prompts.md).

## Automatic PR delivery and Integrity assessment completed locally

[Draft report PR #2](https://github.com/regen-coordination/knowledge-commons/pull/2) was created by the local ReviewWorkflow from the saved real candidate. Its machine assessment rated the Article 8/10 and each other object separately, with evidence-based reasons and pending human review. Five eligible individual team members were requested; the author was excluded. [Operations, exact evidence, and remaining deployment inputs](automatic-review-delivery.md).

Final verification: 57 tests / 257 assertions, lint/types/digest checks, dry-run build, authenticated endpoint smoke, fixture automatic assessment, and real GitHub PR/content/reviewer readback passed. Local servers and temporary verification secrets were removed; the user’s `.env.pilot` is preserved.

The new `0003_reviews.sql` migration is applied locally for pilot and fixture. Original ingestion/report records remain unchanged. One assessment cost an estimated $0.0068766; total recorded model usage is $0.0120094, with $0.25 conservatively reserved from the $7 allowance. Production Cloudflare deployment and a production GitHub delivery credential remain prerequisites for hosted automation. Geo integration is not implemented.

## Next milestone: automatic reports alongside Geo

The user wants automatic report delivery while Geo Browser is being set up. Follow the [revised milestone](../plans/automatic-reports-and-geo.md), which adds delivery, Integrity assessment, and Geo proposal integration alongside deployment. OpenAI/Luna remains the initial provider. Report generation/API retrieval already work; automatic GitHub delivery is locally verified; Geo submission is not yet implemented. Delivery is confirmed: automatic draft PRs to `regen-coordination/knowledge-commons`, base `main`, resolving `@regen-coordination/knowledge-commons` and requesting its eligible members individually. The [report review policy](report-review-policy.md) requires two distinct current-revision approvals. Native ruleset `22708247` now requires two team approvals for report paths only; automatic individual requests are locally verified; strict application approval-revision checks remain to implement. GitHub API readback confirmed the team has write access and the repository is public. A deployed delivery credential is still needed; local CLI access does not provision one. Keep report review available independently of Geo progress and preserve the two-human approval requirement for promotion.

## Earlier report readability update

The [reader edition](../../reports/ingestion/readers/topic-235-f1c554cb-5a08-4014-b00a-4df51c512ba8.md) presents the saved successful run with Regen Knowledge Commons branding, a quick overview, numbered claims, explicit Integrity status, a review checklist, and expandable evidence/run details. Future runs use this layout through the shared report renderer. OpenAI/Luna is foregrounded; comparisons remain deferred.

No new extraction or scored Integrity assessment was performed. The original run, candidate, and exported report are unchanged; the reader edition links their provenance and records the rendering revision. Scoring remains a separate missing assessment step, not a zero score.

Verification: `bun run check`; `bun test` (**47 tests / 195 assertions**); `bun run build` (dry run, 894.05 KiB / gzip 151.58 KiB). Tests exercise report/export digest binding, immutable completed runs, retained evidence references, missing score/usage handling, and source-markup escaping. The saved candidate passed validation again, the original report digest matched, and the new Markdown parsed with tables, blockquotes, and two details sections. No local server or paid model call was needed. Renderer code revision: `sha256:7f8ffd0dd348971e86b4edde04b788320cfdd686a6388bba1b04379c0288c348`.

## Prompt 2 current handoff

The new [ingestion decision](../architecture/0003-initial-ingestion.md) owns capture, identity, provider, spending, and recovery behavior. `packages/agent/src/worker.ts` exports the Hono app and `IngestionWorkflow`. `pilot` is live mode; `fixture` is a separate synthetic mode. Both have Workflows, D1, and private R2 configuration. D1 IDs are explicit local placeholders; replace only after confirming actual account/resource identities in Prompt 3. R2 public access has not been provisioned.

The ontology is now `0.1.0-draft.2`, digest `sha256:60e19036db0a5dda223f7d285be4bb5356acfdf92d189a7a8a54b4ad0eaa67b2`, still unratified with a null pin. The draft change adds separate post numbers to capture metadata; prior draft.1 reports remain historical records.

### Verified outcome — September 9, 2026 PDT

Successful live run: `f1c554cb-5a08-4014-b00a-4df51c512ba8`, created `2026-09-10T00:23:46.433Z`, idempotency key `topic-235-live-v5`. [Saved Markdown report](../../reports/ingestion/235-local-refi-toolkit/2026-09-10-f1c554cb-5a08-4014-b00a-4df51c512ba8.md).

- Full depth-0 capture of Hub topic 235 contained one native post, `466`, display number `1`; no replies appeared in its complete manifest. Linked pages were not fetched. Capture digest: `sha256:9f9ffbf09ceb476f72b11481223ede9c539cb2a16cb8e6752aeecc623bbac989`.
- Requested and returned model: `gpt-5.6-luna`. One received provider attempt; 3,551 input tokens, zero cached input, 1,989 output tokens, including 88 reasoning tokens. Provider latency: 14,553 ms. Estimated cost: **$0.003097**. Request ID: `req_9bb3b2d3d4534bd09ec53884d55d0300`.
- Result: Source, Article, and five Claims (two planned, three reported). Schema and exact evidence validation passed with zero issues. Run and Workflow completed. Human judgment of whether each passage supports the full assertion remains pending; selector validation does not establish truth.
- Report digest: `sha256:718f6f7d0610147140bf5a374425b41f6f41367d99607a9a189dcddd1601caac`. Repeated export returned identical content. Repeating the same ingest key returned the same completed run with `dispatch: existing`, without another extraction.
- Authenticated readiness returned implemented/configured/verified ingestion and one completed live run. Health/readiness do not call the provider.
- Private artifacts remain in local R2 under `runs/<run-id>/`: capture, source, response, candidate, validation, report, and manifest JSON. Credentials remain in ignored `packages/agent/.env.pilot`.
- Both local D1 environments applied `0001_ingestion.sql` and `0002_resume_limit.sql`. Synthetic Workflow run `652821f5-7899-4c10-8a02-2362a0290718` also completed and has a separately labelled report. Fixture smoke verified idempotency, conflict rejection, and repeated export.
- `bun run check` passed lint, strict types, ontology freshness, and code-revision freshness. `bun test` passed **46 tests / 171 assertions**, covering capture completeness/revisions, malformed evidence, auth, caller isolation, budget reservations, provider failures, safe recovery, and export integrity. `bun run build` passed its deployment dry run at 891.43 KiB (gzip 150.71 KiB).

The successful live run used code digest `sha256:3767da8b6eaf625082799ba113386f9dca04d1e79f93459511ef5c2c04eac89e` and extraction prompt `commons-extract/0.2`. It cites deterministic passage IDs; the pipeline resolves them to exact captured offsets. A subsequent smoke-script correction accepts readiness after a completed live run; saved run/report revisions remain immutable.

Final verification after the smoke correction: `bun run check`, `bun test` (46 tests / 171 assertions), `bun run build`, and authenticated `bun run smoke` passed. Smoke verified health, readiness after successful ingestion, authentication failures, ontology draft status, and valid/invalid/malformed/oversized validation requests without provider calls. Final code digest: `sha256:7ed9b2c3c0412a011de753b0f4ea3009837214ccc718f86aa3287176664b01ab`. Local servers were stopped; the temporary fixture token file was removed. The user’s `.env.pilot` and local D1/R2 state remain intact.

### Budget and preserved failure history

The user configured all pilot variables, approved **$7 cumulative spending**, and added provider credits after a quota failure. Earlier credential, budget, execution-credit, and migration blockers are resolved. Four attempt reservations total **$0.20**, leaving $6.80 in the conservative local allowance. Recorded model usage estimates total **$0.0051328** across two returned generations. Reservations are not invoice charges; missing usage is not assumed zero.

- `e17c3f6e-0a9d-440d-8889-73b585939270`: capture failed before any provider attempt because workerd rejects redirect mode `error`. Fixed using manual redirect handling without following redirects.
- `b980b9f0-954c-4a41-b1e4-c5c74dcab6dd`: reserved attempt without a persisted response, retained as uncertain. An isolated workerd probe reproduced an illegal fetch receiver before network dispatch. Fixed by invoking the injected fetch function without the class receiver; no usage was invented or reservation refunded.
- `19194e95-c6db-42b9-9ad4-1b6b4e500c5e`: persisted provider HTTP 429, `provider_credit_balance_exhausted`. Resumed once to interpret its saved response after fixing error-code persistence across Workflow serialization; no second provider call. Provider credits were subsequently added.
- `03ddd3ed-6658-4b18-8de2-3c37a48c80eb`: model returned output, but exact quotation validation rejected normalized Markdown. Usage: 2,085 input / 1,349 output tokens, including 81 reasoning; estimated $0.0020358. Prompt 0.2 replaced model-written quotations with passage IDs while retaining strict evidence validation. The next run succeeded.

No deployment, remote resource creation, commit, push, or remote CI observation occurred. Integrity dimensions are unassessed, human approvals pending, and the ontology remains unratified. Prompt 2 stops here; account selection, cloud provisioning, deployed verification, Geo, website work, and full comparison/calibration remain outside this completion.

### Commands for continuation

From the repository root, with the pinned Bun/Node setup below:

```sh
bun install --frozen-lockfile
bun run worker:types
bun run format
bun run code:generate
bun run check
bun test
bun run build
```

`code:generate` records a digest of runtime source, migrations, scripts, configuration, and lockfile; tests and the generated digest file are excluded. `dev`, `dev:fixture`, and `build` refresh it automatically. Generate again after implementation changes before `check`.

For the isolated fixture environment, securely configure only `PILOT_API_TOKEN` in ignored `packages/agent/.env.fixture`, then:

```sh
bun run db:migrate:fixture
bun run dev:fixture
```

In another terminal, securely load that same `PILOT_API_TOKEN` into the process environment:

```sh
bun run smoke
bun run ingestion:smoke
```

This creates another clearly labelled fixture report and makes no model calls. Stop the server before switching environments on the same port.

For a live local run, configure `PILOT_API_TOKEN`, `OPENAI_API_KEY`, and the approved `PILOT_BUDGET_USD` in ignored `packages/agent/.env.pilot`. `PILOT_CALLER_ID` is the configured internal principal; all holders of its shared bearer token act as that principal. Then:

```sh
bun run db:migrate:local
bun run dev
```

From a second terminal with the pilot API token loaded securely:

```sh
bun run ingest topic-235-live-v5
```

The live submit command always requests topic 235, OpenAI Luna, and a USD 0.05 maximum reservation. Reusing the key must return the same run. Inspect `GET /v1/ingestions/<run-id>` with bearer authentication, then export the completed run:

```sh
bun run report:export <run-id>
```

The key above retrieves the saved successful run in the existing local pilot database. Use a new key only when intentionally authorizing another extraction within the remaining budget. Fixture reports remain separate from live evidence.

### Ingestion endpoints and failure handling

All require the pilot bearer token. `POST /v1/ingestions` takes `{ "topicId": 235, "provider": "openai", "model": "gpt-5.6-luna", "maxCostUsd": 0.05 }` and an `Idempotency-Key` header; 202 returns the run ID. Omitted provider/model/cost fields use those defaults. Invalid topic/model/provider returns 422. Missing credentials/budget/bindings returns 503 before a new live run is queued. Payloads over 4096 bytes return 413.

`GET /v1/ingestions/:runId` returns state, Workflow status, validation, source/candidate digests, usage when available, and attempt reservation/status. Another principal receives 404. `GET /v1/ingestions/:runId/report` returns the review-safe Markdown and digest metadata only after completion; unfinished runs return 409.

`POST /v1/ingestions/:runId/resume` restarts only an errored Workflow whose run is marked safely resumable, up to three restarts. A saved provider response is reused. If D1 records an attempt but R2 has no response, the run returns `provider_attempt_needs_reconciliation`; inspect provider billing/request evidence before any separately authorized new run. No automatic retries, repairs, or refunds can trigger another paid call. A queued run with `dispatch: pending-retry` is recovered by repeating its original submit request/key.

Successful completion does not imply publication or approval. Integrity dimensions remain unassessed and both human decisions pending. Gemini Flash-Lite, Sonnet, and Terra remain follow-up adapters/comparisons.

### Prompt 2 changed files

Added agent bindings, store, provider, fixture, job, Workflow, ingestion routes, Worker entrypoint, generated runtime/code declarations, two D1 migrations, and provider/ingestion tests. Added pipeline ingestion/capture/extraction contracts, report renderer, and capture tests. Added capture, authenticated ingest/export, fixture smoke, and code-revision scripts. Updated manifests/lockfile, Wrangler/Biome configuration, ontology/generated registry, readiness tests/smoke types, README/AGENTS, this runbook, architecture decision, and report index. The saved fixture report is review-safe; raw captures, credentials, and Wrangler state remain ignored. Existing work was preserved.

## Prompt 1 foundation reference

The following setup and historical verification record is retained from Prompt 1. Where it describes ingestion as absent or draft.1 as current, use the Prompt 2 handoff above.

## Clean-checkout setup

Use Bun **1.4.2** and Node **24** (verified locally with Node 24.19.0). From the repository root:

```sh
bun install --frozen-lockfile
bun run check
bun test
bun run build
```

`check` runs Biome, strict TypeScript checking, and generated-registry freshness. `build` uses Wrangler's dry run and writes the Worker bundle to root `dist/agent`; it does not deploy. Dependencies are exact in the manifests and transitive resolutions are in `bun.lock`. No repository/content license has been assigned.

For local development, securely populate `packages/agent/.env.pilot` with the `PILOT_API_TOKEN` secret. This file and all `.dev.vars` variants are ignored. Use a random 32-byte token encoded as hex or another valid bearer-token value. The only required secret name today is:

```text
PILOT_API_TOKEN
```

Then run:

```sh
bun run dev
```

Wrangler runs the `pilot` environment locally at `http://localhost:8787`. In another terminal, load the same `PILOT_API_TOKEN` into the shell environment through your secret manager, then run:

```sh
bun run smoke
```

`PILOT_BASE_URL` optionally overrides the smoke-test URL. The smoke command uses synthetic evidence and makes no provider call. Stop the dev process with Ctrl-C. Do not place secret values in command arguments, examples, logs, or git. Private captures belong in ignored `raw-captures/` or `artifacts/private/`, not review reports.

Other verified commands:

```sh
bun run format
bun run lint
bun run typecheck
bun run ontology:generate
bun run ontology:check
```

Implementation references checked: [Hono bearer authentication](https://hono.dev/docs/middleware/builtin/bearer-auth), [Wrangler dry-run build](https://developers.cloudflare.com/workers/wrangler/commands/workers/), and [named environments](https://developers.cloudflare.com/workers/wrangler/environments/).

The canonical schemas live in `packages/ontology/src/index.ts`. Generation writes `packages/ontology/generated/registry.json`, containing the version, digest, status, conventions, and JSON Schemas. TypeScript types are inferred from those schemas. There are no active Geo mappings or separately generated agent definitions to keep in sync. Do not hand-edit the generated registry.

Read root [AGENTS.md](../../AGENTS.md) and the relevant skill under root `agent/skills`; `packages/agent` is the runtime, while root `agent/skills` remains the instruction library. The [foundation decision](../architecture/0002-draft-validation-foundation.md) documents draft semantics and migration limits.

## HTTP contract

| Route | Access | Result |
| --- | --- | --- |
| `GET /health` | Public | 200, `{ "ok": true }` only |
| `GET /ready` | Bearer token | 200; foundation readiness, ingestion unimplemented/unverified |
| `GET /v1/ontology` | Bearer token | Draft registry, schemas, version, reproducible digest, null pin |
| `POST /v1/validate` | Bearer token | `{ objects, captures, evidence }` JSON; 200 valid or 422 with issue paths/codes |

Missing/invalid authentication returns 401; missing/weak token configuration returns 503. Malformed JSON returns 400, unsupported media type 415, and bodies over 256 KiB return 413. Responses use `Cache-Control: no-store`. Authenticated unknown routes return 404. The validation response does not return the submitted captures or candidate body. Machine validation does not establish truth, rights, human approval, or publication authority.

Use `packages/ontology/fixtures/draft.ts` for a complete synthetic request and rejected near-misses. It is explicitly not a real capture of topic 235. The body must contain the cited Source objects and exact frozen captures; isolated candidates without evidence context fail.

## Verification record — 9 September 2026

Local evidence, not remotely observed CI:

- `bun install`: installed 46 packages and generated `bun.lock`.
- `bun run format`: formatted implementation/configuration; Biome ignores generated output and the pre-existing instruction/research archive.
- `bun run check`: passed formatter/linter, strict typecheck, and registry freshness.
- `bun test`: 29 passed, 0 failed, 94 assertions. Tests cover valid Article/Source/Claim drafts, disabled classes, unknown fields/version, edited captures, missing replies, wrong source revisions/types, duplicate IDs, selectors including whitespace/UTF-16 offsets, self-report versus observation, revision metadata, digest stability, run/report authority, endpoint auth, readiness, JSON/media/size failures.
- `bun run dev` followed by `bun run smoke`: passed against the actual local workerd runtime. Observed 200 health/ready/ontology/valid request, 401 missing/wrong credentials, 422 invalid draft, 400 malformed JSON, and 413 oversized request.
- `bun run build`: passed; final bundle 845.89 KiB, gzip 138.33 KiB, no remote bindings or deployment.
- Clean-directory rehearsal at `/private/tmp/knowledge-commons-bootstrap-qjkfxync`: copied the current git-visible files (including existing uncommitted documents), without `.git`, dependencies, build output, caches, or secrets. `bun install --frozen-lockfile`, `bun run check`, `bun test`, and `bun run build` all passed; 29 tests / 94 assertions. This rehearses the current worktree snapshot, not a committed clone. The lockfile was unchanged.
- `git diff --check`, local documentation-link resolution, and `git check-ignore` for `.dev.vars` variants, Wrangler state, and private captures passed. The local dev server was stopped and the generated temporary test secret was removed.
- `.github/workflows/check.yml` runs frozen install, check, tests, and dry-run build. Remote CI has **not** been observed; this work has not been pushed.

Registry version: `0.1.0-draft.1`, status `unratified`, pin null. Registry digest: `sha256:821eb1faaa66975a6aa267eba6bf44f147d0d95ff47f1a7e32133827ade323b8`.

Environment-specific notes: this Mac's default PATH contained duplicate dev-machine shims and `bun --version` stalled. Verification used this PATH prefix, without changing the user's runtime configuration:

```sh
export PATH=/Users/afo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/afo/.bun/bin:/usr/bin:/bin
export WRANGLER_LOG_PATH=.wrangler/logs
export WRANGLER_SEND_METRICS=false
```

The sandbox proxy blocked npm access and loopback requests, and local socket binding required an approved escalation. Dependency installation and local HTTP verification succeeded through those approvals. An initial `whoami` also reported a sandbox denial writing Wrangler's default log directory; subsequent commands used the ignored local log path. No permissions were widened for Cloudflare accounts.

## Deployment prerequisites and historical Prompt 1 boundary

Wrangler `whoami` reported **not authenticated** in this checkout. No intended Cloudflare account was present in the repo; account selection was requested and is still unresolved. No credentials were printed or manually inspected, and no login was initiated. Do not infer access from another project's resources.

Before Prompt 3, confirm the intended account name/ID and establish authorized Wrangler access. Use a dedicated `pilot` environment (`knowledge-commons-pilot`) and its platform URL. Confirm account identity before adding an account ID or making external changes. The base environment disables workers.dev; the named pilot enables it for the later deployment. Securely provision `PILOT_API_TOKEN` for that environment. A shared token cannot identify individual human approvers.

At the Prompt 1 boundary, real capture, provider access/budget, Workflow/D1/R2 ingestion, and report export were absent. Prompt 2 has now implemented and verified these locally, as recorded above. Readiness must continue to distinguish configured prerequisites from a verified real ingestion. Geo submission, ontology ratification, additional classes, website implementation, calibration, and publication remain later work.

## Changed files

Pre-existing work was preserved: README edits and the untracked AGENTS.md, root agent skills, docs, and reports existed before bootstrap. This task adds or changes:

- Root: `package.json`, `bun.lock`, `tsconfig.json`, `biome.json`, `.gitignore`, `README.md`, and the verified-command paragraph in `AGENTS.md`.
- CI: `.github/workflows/check.yml`.
- Ontology: `packages/ontology/package.json`, `src/index.ts`, `src/index.test.ts`, `fixtures/draft.ts`, `generated/registry.json`.
- Pipeline: `packages/pipeline/package.json`, `src/index.ts`, `src/index.test.ts`.
- Agent: `packages/agent/package.json`, `wrangler.jsonc`, `src/index.ts`, `src/index.test.ts`.
- Reserved web: `packages/web/package.json`, `src/index.ts`.
- Scripts: `scripts/generate-ontology.ts`, `scripts/smoke.ts`.
- Documentation: this runbook, `docs/architecture/0002-draft-validation-foundation.md`, and a dated update to `0001-pilot-boundaries.md`'s implementation evidence.

No commit, push, team message, or broader issue closure was performed. The bootstrap stops here, ready for Prompt 2's implementation.
