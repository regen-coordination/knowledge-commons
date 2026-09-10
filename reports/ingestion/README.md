# Regen Knowledge Commons ingestion reports

**Current demo:** [topic-356 scored report](reviews/eba2a43f-caa7-4f88-a1d8-a21a595c7b17-45a9ce3f3778.md), delivered as [PR #3](https://github.com/regen-coordination/knowledge-commons/pull/3). Future original exports use `topic-<id>` folders. Historical topic-235 records remain unchanged. Human calibration uses the [independent worksheet](../../docs/runbooks/integrity-calibration.md).

This folder is the review desk for Regen Knowledge Commons. Each ingested Hub thread gets a readable Markdown report showing what we learned, what is uncertain, how the models differed, and what the humans decided. Start with the [template](/Users/afo/Code/regen/knowledge-commons/reports/ingestion/_template.md).

Use one topic folder, named `<topic-id>-<short-slug>`, and one report per run, named `<date>-<run-id>.md`. Keep earlier reports when a source, model, prompt, or ontology changes. In a completed report, put the decision and the three most consequential findings first; aim for one or two pages before technical details.

The current layout (`commons-report/0.3`) uses a short overview, numbered claims with bold status labels, a five-row Integrity review table, and a checklist. Evidence tables and full run metadata sit in expandable Markdown details. Keep the main reading path free of long hashes and repeated provenance. OpenAI/Luna is the current extraction setup; additional models are deferred.

**Machine Integrity scoring is now a separate step after extraction.** It rates every proposed object against its frozen evidence, with 0–2 or null ratings, reasons, references, and a candidate-bound assessment record. The headline score belongs to the Article; individual Source/Claim scores remain in expandable details. These are provisional machine assessments, not calibrated acceptance thresholds. Human ratings stay pending. Missing or failed assessments show an explicit unavailable state, never an invented zero or total.

The scored edition is delivered automatically through a draft report PR, with eligible team members requested individually. The original extraction report stays immutable. See [review operations](../../docs/runbooks/automatic-review-delivery.md) for endpoints, credentials, and recovery.

Presentation updates to completed runs may be saved in `readers/topic-<id>-<run-id>.md`. Label these as reader editions, identify the renderer revision, and link the original report and its digest. They are presentation-only companions, not replacement API exports or new ingestions. Preserve the original report and saved run unchanged.

This is a deliberate September 9 addition to the repo’s scope: calibration reports belong in git. They are review records, not a mirror of accepted Geo content. Do not put credentials, private discussions, full source dumps, beneficiary identities, or restricted excerpts here. Raw captures and full model outputs live in private artifact storage; the report links their stable artifact references and digests. Public excerpts must respect source-specific reuse constraints.

## Integrity review: a declared pilot profile

Use profile **`commons-pilot-integrity/0.1-draft`**. It draws on the [Integrity Suite](https://github.com/coordination-structural-integrity-suite/suite), [ORE](https://github.com/CrossWalkri/ORE), and [STRUCK](https://github.com/CrossWalkri/STRUCK). This is a proposed Commons review instrument, **not an official Suite aggregate score or a conformance certification**. Afo should ratify its criteria alongside the ontology and calibration examples. Full CRAFT assessment remains conditional on the decision being assessed.

Score the proposed object, with its evidence packet, on five dimensions. A source can be useful even when it cannot support a stronger proposed claim.

| Dimension | 0 — inadequate | 1 — partial | 2 — sufficient for the stated use |
|---|---|---|---|
| Origin and independence | Origin missing or corroboration falsely treated as independent | Attribution known; dependency between sources unresolved | Origin and dependencies identified; limits of self-reporting explicit |
| Evidence traceability | Material assertion has no resolvable support | Some relevant references resolve; gaps remain | All material assertions trace to captured passages and revisions |
| Support and uncertainty | Output invents facts or strengthens the source | Material uncertainty or contradiction insufficiently explained | Claim strength matches evidence; uncertainty and abstention are explicit |
| Context and usefulness | Type or framing materially misleads the intended reader | Useful idea but relevant conditions are missing | Type, dates, scope, and applicability are clear for the intended task |
| Contest and public use | Known contest or exposure/reuse constraint ignored | Review, contest route, or use boundary incomplete | Disputes and corrections are visible; intended disclosure and reuse are documented |

Use `not assessed` for a missing assessment and give the reason. Show the full **0–10 total only when all five dimensions have been assessed**. Otherwise display `total not available; N/5 dimensions assessed` with individual results. Zero means assessed and inadequate; it never means missing. There is no pass threshold during calibration, and the total is never a probability of truth.

Record who assessed each output and the rubric revision. Keep model self-assessments separate from human ratings. Compare each model’s candidate under the same rubric; score the final human-edited candidate separately. Do not apply one source score to four different outputs. Hard checks for schema validity, required references, and authorized publication remain distinct from these editorial ratings.

## Two affirmative human approvals

Before knowledge is promoted, **two distinct authenticated humans must explicitly approve the same candidate revision and intended publication scope**. The record identifies each reviewer, YES/NO/ABSTAIN, timestamp, reviewed digest, and verifiable approval reference. Two names typed by an agent, model consensus, or one YES plus one ABSTAIN does not qualify. Changed content, operations, or publication scope requires fresh approvals.

During pre-Geo rehearsal, record real human decisions as rehearsal approvals. They can inform calibration but cannot be relabelled as Geo votes. Once using Geo, verify approval and execution evidence for the exact proposal version under the actual deployment’s rules. The ingestion agent never votes. Afo’s ontology pin is a separate decision from approval of a content object.

## Technical record beneath the review

Link a private run manifest containing: run ID and UTC time; code revision or working-tree digest; source native IDs and full-capture status; input digests; ontology/schema/prompt versions and digests; exact requested/returned model IDs and settings; raw/validated output references; validator results; attempt and repair history; latency; billed token categories and cost; evaluation labels; candidate and operation digests; human approval evidence; and any Geo proposal, execution, release, and website references.

The ingestion runner now renders Markdown reports from its run record. Continue to label manually authored source reviews and synthetic fixture runs explicitly. Never fill missing scores, durations, approvals, or model results with plausible values.

Current report: [Commitment-pooling source review — comparison not run](/Users/afo/Code/regen/knowledge-commons/reports/ingestion/356-commitment-pooling/2026-09-09-source-review.md).

Start here: [scored review in draft PR #2](https://github.com/regen-coordination/knowledge-commons/pull/2), also available as a [local scored report](reviews/f1c554cb-5a08-4014-b00a-4df51c512ba8-6a3f20c6efa5.md).

Earlier presentation-only [readable edition of the initial ingestion](readers/topic-235-f1c554cb-5a08-4014-b00a-4df51c512ba8.md).

Original verified real ingestion: [topic 235 with GPT-5.6 Luna](235-local-refi-toolkit/2026-09-10-f1c554cb-5a08-4014-b00a-4df51c512ba8.md). The local Workflow captured the full available thread and produced a validated Source, Article, and five Claims. Human ratings and approvals remain pending; the other three models are unrun.

Fixture proof remains separately labelled: [synthetic topic-235 ingestion](235-local-refi-toolkit/2026-09-10-652821f5-7899-4c10-8a02-2362a0290718.md). See the [handoff](../../docs/runbooks/first-deployment.md) for usage, failed attempts, and deployment prerequisites.
