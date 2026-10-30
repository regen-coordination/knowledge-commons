# Regen Knowledge Commons naming audit

September 9, 2026 · Local repository audit · Renames not yet applied

**Use “Regen Knowledge Commons” as the product name.** Current documentation often omits “Regen,” while the saved ingestion report leads with the title of its source. That combination can make the source project look like the product being built. The runtime is a knowledge-ingestion service; no website or Toolkit product was implemented.

The requested absence of Toolkit mentions from the demo requires two changes: consistent product presentation and a different demo source. Relabelling the existing source or its extracted Claims as Regen Knowledge Commons would misattribute evidence. Preserve the existing run as historical verification and produce a new demo run from an explicitly selected source.

OpenAI with GPT-5.6 Luna remains the current provider/model. Other adapters and comparison runs are deferred, with no additional keys required for the present pilot.

## Scope and evidence

Inspected 67 first-party code, configuration, documentation, report, and lock files. Searched case-insensitive space/hyphen/underscore naming variants, then traced topic 235 through capture, validation, API responses, model input, report rendering, and export. The narrow Toolkit/title pattern matched 34 lines in 13 files; the broader product-name/identifier pattern matched 114 lines in 42 files. These are matching lines, not individual occurrences, and include paths and historical material. A separate search included generic “toolkit” and native topic ID 235 to expose indirect dependencies.

Excluded credentials, raw captures, private artifacts, Wrangler state, dependencies, compiled output, and git internals. Existing run metadata and exported reports establish the historical source identity; private source bodies were unnecessary for this audit. External Linear, Miro, Google Docs, repository hosting metadata, and cloud resources were not inspected. No live provider call, deployment, or external edit occurred.

## Findings and required updates

### 1. Product documentation is inconsistent

**Priority: before deployment/demo.** [README](../../README.md:1) introduces “Knowledge Commons”; [AGENTS](../../AGENTS.md:1) repeats it. The architecture research already uses the full name in its title, so the requested name is consistent with existing project direction.

Use Regen Knowledge Commons in the README title/description, current planning and runbook introductions, report index/template, owned website references, and project-specific skill descriptions. The affected prose also occurs in:

- `docs/architecture/0001-pilot-boundaries.md` (lines 5, 13).
- `docs/plans/2026-09-09-cycle-build-plan.md` (lines 19, 120).
- `docs/research/2026-09-08-discussion-brief.md` (lines 5, 13).
- `docs/research/2026-09-08-v1-architecture.md` (lines 6–14, 293, 324).
- `docs/research/2026-09-09-pilot-selection.md` (line 58).
- `agent/skills/commons-architecture`, `hub-intake`, `ontology-change`, and `publish-reconcile`.

Preserve titles of cited external documents and upstream skill attribution. Add a concise naming convention to the contributor guidance so future work uses the full product name.

### 2. Report presentation makes the source title the main heading

**Priority: before the next report.** [Renderer](../../packages/pipeline/src/report.ts:56) places `run.sourceTitle` in the H1. [Template](../../reports/ingestion/_template.md:1) teaches the same layout. The successful report therefore looks like a report belonging to the source project.

Give future reports a “Regen Knowledge Commons — ingestion review” heading and put source identity in its labelled provenance section. Use the full product name in “What the Commons would receive.” Keep source and candidate titles truthful. A branded heading alone will not remove Toolkit references from the body of a report about that source.

### 3. Export directories embed the source’s marketing title

**Priority: before the next export.** [Exporter](../../scripts/export-report.ts:57) hard-codes `235-local-refi-toolkit`; line 44 also restricts topic identity. New export paths should use a neutral native-ID convention, such as `reports/ingestion/topic-<id>/<date>-<run-id>.md`.

Update exporter checks, export tests, report-folder guidance, index links, and runbook examples together. Keep the existing historical files and links resolvable. If historical files are relocated later, preserve their bytes and digests and update all links; moving a file is different from rewriting its contents.

### 4. The initial ingestion is intentionally tied to the old demo source

**Priority: required for a demo without Toolkit mentions.** This is more than a display-name change:

| Area | Current dependency | Update needed |
| --- | --- | --- |
| Capture and request contracts | `packages/pipeline/src/ingestion.ts`: 31, 93, 170, 203, 224, 236, 266–272, 569 | Replace repeated topic-235 literals with an explicit bounded selection used consistently for URL, topic validation, stable identity, and capture references. |
| Model input | `packages/pipeline/src/ingestion.ts`: 370 | Remove the hard-coded source title; supply the captured title or neutral native-topic identification. Never substitute the product name for a source title. |
| API | `packages/agent/src/ingestions.ts`: 55, 103, 254 | Derive advertised, stored, and returned topic IDs from the selected/validated request and run. |
| Reports | `packages/pipeline/src/report.ts`: 56, 62 | Resolve source URL/topic from the run; eliminate hard-coded source routing. |
| Commands | `scripts/ingest.ts`: 27; `scripts/capture-topic.ts`: 5, 11, 16 | Use the same explicit selection for submission and capture output. |
| Proof | `packages/pipeline/src/capture.test.ts`, `packages/agent/src/ingestion.test.ts`, `scripts/ingestion-smoke.ts` | Verify source identity, wrong-topic rejection, complete capture, idempotency conflicts, and matching report/export identities for the selected source. |
| Plan | `docs/plans/2026-09-09-first-deployment-prompts.md`: 34, 60; pilot selection; architecture 0003; runbook | Record the new demo choice and preserve topic 235 as historical Prompt 2 evidence. |

Topic 356 is the plan’s explicit alternate and a possible next demo source. Its current full contents have not been inspected in this audit, so it is not yet verified to be free of unwanted mentions. Choose and inspect the replacement before a paid extraction; do not silently substitute it or describe a previous topic-235 run as a new source. This can remain a small allowlist rather than a general crawler.

### 5. Synthetic fixtures repeat the unwanted terminology

**Priority: with the source/presentation update.** [Agent fixture](../../packages/agent/src/fixture.ts:30) and [ontology fixture](../../packages/ontology/fixtures/draft.ts:18) repeatedly describe a toolkit/funding pool. `packages/agent/src/ingestion.test.ts:151` depends on that text. Use an unrelated, clearly synthetic community proposal and update expected evidence passages/offsets together.

Retain the behavioral tests: planned versus reported facts, incomplete evidence, malformed selectors, historical deadlines, and reply capture. Preserve previous synthetic reports as labelled historical output; future fixture reports should use the new presentation.

### 6. Deployment names omit “Regen”; internal identifiers need deliberate treatment

**Priority: decide cloud names before provisioning.** [Wrangler configuration](../../packages/agent/wrangler.jsonc:3) names the Worker, D1, R2, and Workflow `knowledge-commons*`. For new cloud resources, use a consistent `regen-knowledge-commons*` prefix and update the runbook and [authentication realm](../../packages/agent/src/index.ts:96). Actual cloud name availability is unverified.

Preserve and locate current local D1/R2 state before renaming environment resources; a rename must not make the successful run or conservative budget reservations disappear from the next environment. Deployment still needs the remaining allowance carried forward rather than a fresh $7.

Package scope `@knowledge-commons/*`, root package name, imports, lockfile entries, and the checkout directory are technical identifiers. They do not introduce Toolkit branding and need not change to fix display naming. If a package rename is desired, treat it as one coordinated manifest/import/lockfile change and rerun frozen installation and checks. Do not globally replace absolute filesystem paths or URLs.

The ontology topic enum `knowledge-commons` in `packages/ontology/src/index.ts:42`, its generated registry, and the rubric ID `commons-pilot-integrity/0.1-draft` are versioned contracts. Leave them stable for a presentation rename. Changing them would require compatibility/version handling and regenerated digests; never hand-edit the generated registry.

### 7. Current provider messaging should say OpenAI-only; comparison is follow-up

**Priority: documentation and future reports.** Runtime configuration already accepts the OpenAI key without requiring Gemini or Anthropic keys. The current readiness response explicitly reports the other adapters as unimplemented. It lists Terra under providers even though Terra is an OpenAI model; separate enabled models from provider status if this response is revised.

`packages/pipeline/src/report.ts:45–53,94–100` and the report template foreground a four-model comparison. For future reports, lead with the actual OpenAI/Luna run and its usage; retain a short deferred-comparison note or appendix. Do not erase historical “not run” records or imply comparative superiority.

The pilot-selection document still says provider availability has not been verified and proposes $10. Update its current-status note to distinguish the verified Luna run and approved $7 allowance from the unexecuted research comparison proposal. The discussion brief and architecture research also describe comparison as an early milestone; add a dated current-scope note rather than letting that become a deployment prerequisite.

## Historical records and acceptance checks

Three exported topic-235 reports contain source-derived or synthetic Toolkit references. The real report is bound to its saved run and Markdown digest. Keep these as historical evidence, outside the selected demo narrative. If “no mention” means physical deletion from every historical artifact, that is an archival/removal decision beyond a product rename; this audit has not deleted evidence or rewritten provenance.

Recommended implementation order:

1. Apply the full product name to current prose and future report headings; record OpenAI/Luna as the current setup.
2. Neutralize future export naming and fixture wording; decide cloud resource names before deployment.
3. Select and inspect a replacement demo source; update the bounded capture-to-export contract together.
4. Run `bun run code:generate`, `bun run check`, `bun test`, `bun run build`, and fixture endpoint/export checks. Verify report digests, same-key reuse, and documentation links. Do not regenerate historical reports in place.
5. Run one new real extraction within the remaining approved allowance only after confirming the source meets the demo requirement. Inspect the rendered report for product naming and unwanted source mentions. Then proceed with Prompt 3 deployment.

The audit added only this document. No runtime/configuration rename or source switch has been applied. Validation for this document: affected call sites read, local links checked, and `git diff --check`; runtime tests are unnecessary for an audit-only addition.

## Exact title-pattern inventory

Snapshot taken before this audit document was added. Numbers are matching source lines; paths are relative to the repository root.

| File | Matching lines |
| --- | --- |
| `docs/plans/2026-09-09-first-deployment-prompts.md` | 34 |
| `docs/research/2026-09-08-discussion-brief.md` | 19 |
| `docs/research/2026-09-09-pilot-selection.md` | 5, 13 |
| `docs/runbooks/first-deployment.md` | 13 |
| `packages/agent/src/fixture.ts` | 30, 45, 63, 64, 72 |
| `packages/agent/src/ingestion.test.ts` | 151 |
| `packages/ontology/fixtures/draft.ts` | 18, 66, 110 |
| `packages/pipeline/src/ingestion.ts` | 370 |
| `reports/ingestion/235-local-refi-toolkit/2026-09-09-37d5501d-1fdf-46fd-9664-f83a56a511c9.md` | 1, 7, 15, 19 |
| `reports/ingestion/235-local-refi-toolkit/2026-09-10-652821f5-7899-4c10-8a02-2362a0290718.md` | 1, 7, 15, 19 |
| `reports/ingestion/235-local-refi-toolkit/2026-09-10-f1c554cb-5a08-4014-b00a-4df51c512ba8.md` | 1, 5, 13, 15, 21, 22, 25, 35 |
| `reports/ingestion/README.md` | 41, 43 |
| `scripts/export-report.ts` | 57 |
