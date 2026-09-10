# Today's prompts: first deployment and ingestion demo

**Updated next milestone:** automatic report delivery and Geo proposal integration now proceed in tandem, using OpenAI/Luna initially. Follow [automatic reports alongside Geo](automatic-reports-and-geo.md). The original bounded prompts and cycle sequence below remain historical context; full model comparison is deferred.

Run these prompts in order, preferably in the same coding task and checkout. Each prompt inspects and preserves the preceding work.

**Today's finish:** a development-ready repo, a protected deployed API, and one verified initial ingestion ready to demonstrate tomorrow. Use one working provider for the first run; the planned four-model comparison follows.

The demo is Hub thread → captured evidence → draft candidate → validation → Markdown report. Geo submission, ontology ratification, binding approvals, website implementation, and full calibration are later work. This narrower milestone does not complete the full KC-24 Geo write-mode requirement.

## Prompt 1 — Bootstrap the repo

~~~text
Set up /Users/afo/Code/regen/knowledge-commons for development today. Implement the foundation; do not stop at another plan.

Read AGENTS.md, README.md, docs/architecture/0001-pilot-boundaries.md, and docs/plans/2026-09-09-first-deployment-prompts.md. Apply the relevant repo skills, including commons-architecture and codebase-design. Inspect git status and preserve existing changes. Today's bounded scope takes precedence over the broader cycle plan.

Create a Bun/TypeScript workspace with packages/ontology, packages/pipeline, packages/agent, and a minimal reserved packages/web workspace. Do not build the website. Preserve agent -> pipeline -> ontology; web consumes public contracts. Root agent/skills remains the instruction library.

Read docs/ontology/v1-candidate.md. Implement the draft Knowledge Object base plus Article, Source, and Claim schemas needed for initial ingestion, with capture, evidence, run, and report contracts and meaningful valid/invalid fixtures. Give the registry a reproducible version/digest and explicit unratified status. Do not implement all eleven classes or record Afo's pin today.

Set up Hono on Cloudflare Workers, local configuration, one formatter/linter, type checking, and appropriate tests. Add verified development, check, test, build, and ontology-generation commands; configure CI to run applicable checks. Pin dependencies and include the lockfile. Document clean-checkout setup and repo-skill use. Ignore .dev.vars variants, Wrangler state, caches, and raw captures; use secret-name-only examples. Do not assign a blanket repository/content license.

Implement GET /health, authenticated GET /ready, GET /v1/ontology, and POST /v1/validate. Only minimal health information should be public. Reject missing/invalid credentials; keep secrets out of logs. Use a documented authentication mechanism for a small internal pilot without a custom login UI.

Check early whether the intended Cloudflare account and existing deployment access are identifiable without reading secrets. If ambiguous, ask for the account selection while continuing local work. Do not widen account permissions.

Finish with passing local checks and endpoint tests, plus a clean-checkout setup rehearsal where feasible. Record exact commands, results, changed files, and deployment prerequisites in docs/runbooks/first-deployment.md. Distinguish local CI-equivalent checks from remotely observed CI. Stop with a working foundation ready for Prompt 2.
~~~

## Prompt 2 — Build the initial ingestion path

~~~text
Continue in /Users/afo/Code/regen/knowledge-commons. Read AGENTS.md, docs/runbooks/first-deployment.md, docs/plans/2026-09-09-first-deployment-prompts.md, and the hub-intake skill. Extend the existing implementation; complete any essential prerequisite left by Prompt 1.

Build one real Hub thread -> frozen evidence -> draft extraction -> validation -> readable Markdown report. Use topic 235, Local ReFi Toolkit + Funding Pool, from docs/research/2026-09-09-pilot-selection.md. Topic 356 is an explicit alternate, not a silent replacement. Capture the full thread, replies, native post IDs, dates, retrieval time, and digests. Use depth 0 today; do not follow linked pages or treat unread links as evidence. Detect incomplete captures.

Use Cloudflare Workflows for the job, D1 for durable run/attempt identity, and private R2 for artifacts. Add authenticated POST /v1/ingestions returning 202 plus run ID, GET /v1/ingestions/:runId, and GET /v1/ingestions/:runId/report. Authorize access to runs. Bound sources, payloads, attempts, and spending. A repeated caller/idempotency key with identical payload returns the existing run; a changed payload conflicts. Keep provider failures and resumable states inspectable.

Implement one real provider, starting with GPT-5.6 Luna if available. Verify current official API documentation and supported settings before coding. Keep a small provider interface compatible with the four-model plan. Report unimplemented/unconfigured providers explicitly; do not build all adapters or run a benchmark today. Fixture adapters are for clearly labelled tests, never undisclosed live substitutes.

Render reports from the run record using reports/ingestion/README.md and _template.md. Preserve planned versus reported facts and exact evidence references. Label any machine assessment; human ratings and approvals remain pending. Mark unrun models and unassessed Integrity dimensions honestly. Keep ontology status draft and Geo/publication capabilities absent or disabled.

Add an authenticated local export command that writes review-safe Markdown into reports/ingestion by topic/run, verifies digests, and preserves history. The Worker needs no GitHub write access. Keep credentials and raw captures out of git.

Test successful fixture ingestion, malformed evidence, incomplete capture, authentication, idempotency conflicts, provider failure, and report export. Honor the approved model budget; if none or no provider access exists, request only that missing input before paid calls while finishing code and tests.

Update docs/runbooks/first-deployment.md with verified commands and readiness gaps. Stop when initial ingestion works locally and is deployable. Leave Geo, website work, remaining classes, and full comparison/calibration for later.
~~~

## Prompt 3 — Deploy and rehearse the demo

~~~text
Continue in /Users/afo/Code/regen/knowledge-commons. Complete the first deployment of the pilot API and prepare tomorrow's demo. Read AGENTS.md, docs/runbooks/first-deployment.md, and docs/plans/2026-09-09-first-deployment-prompts.md. Inspect actual code, git state, and verification; fix material gaps before deployment.

Deploy the Worker, workflow, D1 migrations, and private R2 bindings into the identified intended Cloudflare account using existing authorized access. Inspect for matching resources before creating anything; reuse only resources confirmed to belong to this pilot. Use a dedicated pilot environment and the platform-provided URL initially. Protect authenticated routes and provision secrets through the supported secure mechanism. Do not expose secrets, widen account permissions, overwrite unrelated resources, configure a custom domain, or enable Geo/public content publication.

If target selection, authentication, or secure secret provisioning requires input, ask for that exact missing step while completing unaffected preparation. Honor existing authorization and actual platform approval requirements without adding a separate approval ceremony. Verify the deployed URL and build before claiming success.

Check live health, authenticated readiness, unauthorized rejection, ontology draft/version response, and useful validation errors. Readiness must distinguish configured prerequisites from successful real ingestion, without billable provider calls on every health check.

With approved model spending and provisioned credentials, submit one real topic-235 ingestion through the deployed API. Inspect durable progress, captured evidence, and the validated draft; retrieve its report and export review-safe Markdown into reports/ingestion. Verify that repeating the same idempotency key returns the existing run without another extraction. Record deployment revision, source digest, run ID, actual model/usage/cost, and report path. If live source access fails, report it; keep fixture playback separately labelled.

Write docs/runbooks/tomorrow-demo.md with a five-minute script and exact tested commands using secret references rather than values: show package structure, show the deployed service, validate a candidate, submit/inspect a thread, and open the report. Include a dated saved successful report as backup. Explain draft/unapproved status, one provider exercised, remaining comparisons unrun, no Geo submission, and no knowledge website.

Rehearse the commands, complete appropriate checks, and record deployment identity and rollback instructions. Stop with the live URL, real report, verified commands, and demo runbook. A health-only deployment or fixture-only run is partial completion. Do not close broader Linear issues or send team messages.
~~~

## Tomorrow's demonstration

1. Show the package structure and verified local development commands.
2. Show the deployed API and its draft ontology version.
3. Submit the selected Hub thread and inspect its run.
4. Open the report: proposed knowledge, evidence, validation, and pending human review.
5. Explain the next step: compare the remaining models, calibrate with reviewers, then connect Geo.

A real successful report is the backup if the live call is slow or unavailable; identify it as a saved run. Cloudflare access, a securely provisioned provider credential, and approved model spending are external prerequisites. Missing prerequisites must remain visible as completion gaps.
