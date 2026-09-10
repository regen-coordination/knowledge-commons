# Regen Knowledge Commons human calibration

**Human calibration is pending.** The machine has scored the first report; two independent human reviews have been requested from the project owner but have not been supplied. This worksheet prepares that work without inventing ratings or approval.

Start with [object review PR #6](https://github.com/regen-coordination/knowledge-commons/pull/6) and its [individual object files](../../reports/ingestion/objects/f1c554cb-5a08-4014-b00a-4df51c512ba8-8e6fd44a4033). This is a historical calibration source, separate from the next demo's commitment-pooling topic. For an independent first pass, each reviewer should record their judgment before reading the machine-rating table.

## Exact review binding

- Run: `f1c554cb-5a08-4014-b00a-4df51c512ba8`.
- Candidate: `sha256:9dbb3793d8957c0358ff94426450b330afdf3dbf18c0c1480c0cb43ab6f6e7a7`.
- Object-file manifest: `sha256:8e6fd44a4033a1001ecb7b4fb951422719399181a2f01efa4b63c242c04f496e`. Each file records its object ID and revision.
- Profile: `commons-pilot-integrity/0.1-draft`.
- Scope: calibration of this report against frozen evidence; no knowledge-promotion approval.

## Independent worksheet

Each reviewer copies this section, identifies themselves, and records their own results. Start with the Article, then repeat the ratings for the Source and each Claim. Identify each object by its class and exact title within the candidate digest above; those labels are distinct in this report. Internal object IDs can be resolved from the private candidate if needed. Use its evidence labels and native post references when explaining a correction. An unread linked page cannot establish support.

Reviewer name / stable GitHub account ID: **pending**  
Review date and minutes spent: **pending**  
Object class / exact title: **pending**  
Candidate and report digest confirmed: **pending**

| Dimension | Human rating | Evidence and reason |
| --- | --- | --- |
| Origin & independence | Not assessed | Is attribution clear, and are dependent/self-reported sources identified? |
| Evidence traceability | Not assessed | Does every material assertion, including list items, have supporting evidence? |
| Support & uncertainty | Not assessed | Does wording preserve what is proposed, reported, disputed or unknown? |
| Context & usefulness | Not assessed | Are dates, scope and conditions sufficient for an organizer's intended use? |
| Contest & public use | Not assessed | Are correction routes, reuse conditions and disclosure limits clear? |

Use 0 for inadequate, 1 for partial, 2 for sufficient for the stated use, or “not assessed” when evidence is missing. A total requires all five numeric ratings. The total is not a truth probability or publication threshold.

Corrections to record:

- Unsupported or strengthened assertion, with the exact report wording and evidence reference.
- Material fact omitted from the summary.
- Wrong class or planned/reported distinction.
- Misleading source independence, identity merge, date or reuse claim.
- Useful abstention that should be retained.

## Compare and reconcile

After both reviewers finish independently, reveal the machine ratings. For each object/dimension, record human A, human B, the machine rating, and the evidence behind any difference. Count agreements only where both humans actually rated the dimension. Keep missing ratings separate; do not average them as zero.

Resolve disagreements by examining frozen evidence, preserving both original judgments and recording the agreed interpretation separately. If reviewers cannot resolve a disagreement, retain it. Record correction minutes and concrete extraction defects. This small pilot supports examples and counts, not statistical performance claims.

The current machine Article score is 8/10. Its flagged gaps—contributor-list citation coverage and incomplete reuse/contest conditions—are hypotheses for humans to check. Do not treat them as confirmed defects merely because the assessor named them.

Only after that review should we revise the prompt or rubric. Version any change and run OpenAI again against the same frozen evidence within the remaining allowance. Keep old outputs. Additional providers and four-model comparisons remain deferred.

GitHub report approvals and these calibration ratings serve different purposes. Neither supplies an exact-scope Geo approval automatically.
