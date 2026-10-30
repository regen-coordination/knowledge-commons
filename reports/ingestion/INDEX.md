# Ingestion review index

Status checked October 29, 2026. This index tracks editions and review disposition; it does not grant approval or replace the private run manifest. Raw captures and provider responses remain private.

## Two runs, four delivered editions

| Run / topic | Edition | Immutable copy in this stack | Delivered review | Review state |
| --- | --- | --- | --- | --- |
| `f1c554cb-5a08-4014-b00a-4df51c512ba8` / 235 | Grouped, `6a3f20c6efa5` | [Historical report](reviews/f1c554cb-5a08-4014-b00a-4df51c512ba8-6a3f20c6efa5.md) | [#2](https://github.com/regen-coordination/knowledge-commons/pull/2), head `546aac51610204c51534e47b769b11f5a3b5f210` | Superseded for current review by #6; no submitted reviews at checkpoint |
| `eba2a43f-caa7-4f88-a1d8-a21a595c7b17` / 356 | Grouped, `45a9ce3f3778` | [Historical report](reviews/eba2a43f-caa7-4f88-a1d8-a21a595c7b17-45a9ce3f3778.md) | [#3](https://github.com/regen-coordination/knowledge-commons/pull/3), head `f44a0c2473909663b5b532d6c57c85d683e1dcd1` | Superseded for current review by #5; no submitted reviews at checkpoint |
| `f1c554cb-5a08-4014-b00a-4df51c512ba8` / 235 | Seven object files, `8e6fd44a4033` | [Object edition](objects/f1c554cb-5a08-4014-b00a-4df51c512ba8-8e6fd44a4033) | [#6](https://github.com/regen-coordination/knowledge-commons/pull/6), head `926c7126914c99082e4e93172af3104f7af3871c` | Human review pending; no submitted reviews at checkpoint |
| `eba2a43f-caa7-4f88-a1d8-a21a595c7b17` / 356 | Seven object files, `56100aa9c028` | [Object edition](objects/eba2a43f-caa7-4f88-a1d8-a21a595c7b17-56100aa9c028) | [#5](https://github.com/regen-coordination/knowledge-commons/pull/5), head `306e794320f4ec2e4bd88ea25b9f1cd2876c709c` | Two COMMENTED reviews by the same human, September 28 and October 7 Pacific time; corrections pending, no approvals |

Edition suffixes abbreviate the report or manifest digest; run IDs, object IDs, digests and Git heads identify different things. Full digests remain in each report and PR.

## Duplicate tracking and proposed disposition

All 16 delivered Markdown files have byte-identical copies in the code stack. PR #4 includes the two grouped editions under `reviews/`; #7 includes the fourteen object files under `objects/`. The four report PRs add those bytes again under `topic-235/` and `topic-356/` paths.

Use the copies linked above as the archive in this stack and the existing PRs as review discussions. Do not merge a second copy merely to record a review. Future delivered editions keep the existing exporter layout, `topic-<id>/<run-id>-<edition>/`; the archive paths above remain immutable. No exporter or approval contract changes are implied.

Proposed for maintainer review after this index lands:

- Close #2 and #3 as superseded by #6 and #5, linking their archived bytes. Their historical content remains available.
- Keep #5 and #6 open while their content review is unresolved. Once the review outcome and any replacement edition are linked here, close redundant delivery PRs with an explicit disposition rather than duplicating their files.
- Label implementation review of #4/#7 separately from acceptance of the included calibration records. Repository rules still apply to files in those PRs.

Closing or merging a PR does not mark knowledge accepted, authorize Geo publication, or supply human approvals. This index does not close any PR. Report PR heads and bases remain unchanged so exact-revision review evidence stays inspectable.

## Topic 356 correction and calibration backlog

The [review on #5](https://github.com/regen-coordination/knowledge-commons/pull/5) identifies a substantive issue in “Possible network and funding evolution”: a forecast and offer to contribute are classified as disputed. The stored assessment repeats that classification. This edition remains evidence of the pilot's behavior and must not be presented as approved knowledge.

Prepare a new candidate revision and bound assessment/review edition for any correction. Do not edit the historical Markdown to disagree with its recorded candidate digest. Fresh affirmative approvals must bind the corrected revision and intended scope.

Other review questions belong in calibration: attribution of post 750 and its reply; repetitive uncertainties and scores; provenance versus independence; combined rubric dimensions and totals; per-object refutation conditions; point-of-use source freshness; unassessed limitations; and source visibility versus private capture/reuse scope. The reviewer offered these as calibration input, not an adopted replacement rubric.

## Scoped correction prepared October 29, 2026

A [new correction edition](corrections/2026-10-29-topic-356-classification-correction.md) prepares Claim `151b3276-7203-81ae-8099-3d4e272df3b4` revision 2, with its unchanged Source as evidence context. It uses `reported` / `self-report` for an attributed statement that RifaiSicilia expressed an expectation and offered help. It does not assert that the forecast happened, that the offer was fulfilled, or that the comment disputed the proposal.

This is a scoped correction, not a replacement or reassessment of the original seven-object edition. The other five objects retain their historical review state. All five Integrity dimensions are unassessed for both files in the new edition; the old 8/10 rating is not reused. Human approval remains pending and Geo publication remains disabled.

- Corrected Claim digest: `sha256:a6af0117e0d847d6713ddd3fa8da98a27334ecbb190c686d205458043096f90a`
- Scoped candidate digest: `sha256:336901f9074177d30e4ab72f3c277e5d8efed1dff6980019a3e23eb53e098de5`
- File-set digest: `sha256:cbe6e84526a4e5105211c4b30f4315e09b096c312b7277c1048bfb595c542918`
- [Bound edition manifest](corrections/2026-10-29-topic-356-cd79d38da98c.json)

The original reports and PR heads are unchanged. Review this new revision before deciding the disposition of the historical PRs; no closure or knowledge acceptance is recorded here.

## Updating this index

Update review state only from verified submitted reviews or an explicit recorded human decision. Keep dated checkpoints distinct from current authorization. Record a replacement edition, its digest, review link and disposition without rewriting earlier files. See [object-review operations](../../docs/runbooks/object-reviews.md) and the [consolidation plan](../../docs/plans/2026-10-29-consolidation.md).
