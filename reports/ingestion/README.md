# Regen Knowledge Commons ingestion reports

Start with the [review index](INDEX.md) for runs, immutable editions, human feedback and proposed PR disposition. It distinguishes the two pilot runs from the four delivered editions and their copies in the code stack.

Current delivery uses **one knowledge object per Markdown file** (`commons-object-report/0.1`), with that object's content, evidence, provisional machine Integrity ratings and revision. One ingestion produces one PR containing the complete file set. The PR's exact revision remains the review scope; separate files do not create individual approvals. See [object-review operations](../../docs/runbooks/object-reviews.md).

Future delivered exports use `topic-<id>/<run-id>-<edition>/`. Existing copies under `objects/` and grouped editions under `reviews/` are immutable archives; follow the index instead of creating duplicate copies. Original per-run reports, synthetic fixtures and presentation-only `readers/` editions keep their historical paths.

Human review of topic 356 has identified a classification error and calibration questions. No affirmative approvals were returned at the October 29 checkpoint. The review index records the findings; scores are provisional and the original outputs remain inspectable.

The [template](_template.md) and [independent calibration worksheet](../../docs/runbooks/integrity-calibration.md) guide review. Historical grouped layouts (`commons-report/0.3`) showed the Article headline and collapsed other objects; that presentation is retained in old editions only. Current files show each object's own ratings. The draft five-dimension rubric below is preserved pending human calibration and explicit ratification.

Reports are review-safe calibration records, not an accepted-content store. Keep credentials, raw captures, provider responses, restricted excerpts and private discussions out of git. The [automatic-delivery runbook](../../docs/runbooks/automatic-review-delivery.md) describes artifact storage, recovery and review readback. Older handoffs are dated evidence rather than live approval status.

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

Historical source review: [Commitment-pooling source review — comparison not run](356-commitment-pooling/2026-09-09-source-review.md).

Historical grouped edition: [scored review in PR #2](https://github.com/regen-coordination/knowledge-commons/pull/2), also available as a [local scored report](reviews/f1c554cb-5a08-4014-b00a-4df51c512ba8-6a3f20c6efa5.md).

Earlier presentation-only [readable edition of the initial ingestion](readers/topic-235-f1c554cb-5a08-4014-b00a-4df51c512ba8.md).

Original verified real ingestion: [topic 235 with GPT-5.6 Luna](235-local-refi-toolkit/2026-09-10-f1c554cb-5a08-4014-b00a-4df51c512ba8.md). The local Workflow captured the full available thread and produced a validated Source, Article, and five Claims. Human ratings and approvals remain pending; the other three models are unrun.

Fixture proof remains separately labelled: [synthetic topic-235 ingestion](235-local-refi-toolkit/2026-09-10-652821f5-7899-4c10-8a02-2362a0290718.md). See the [handoff](../../docs/runbooks/first-deployment.md) for usage, failed attempts, and deployment prerequisites.
