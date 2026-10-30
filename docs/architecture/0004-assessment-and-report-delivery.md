# Machine Integrity assessment and automatic report PRs

## Decision

A completed Regen Knowledge Commons ingestion dispatches a separate ReviewWorkflow. It assesses the exact frozen candidate through OpenAI/Luna, renders a new scored review edition, and delivers that edition as a draft report PR. The original ingestion, candidate, and exported report stay immutable. Geo is independent and remains unimplemented.

A single enlarged ingestion job would turn GitHub outages into apparent extraction failures and complicate paid-call retries. A separate workflow and D1 review record let either stage fail visibly while the original report remains available. No new deployable package is needed: pipeline owns assessment contracts and rendering; agent owns Workflow/D1/R2 and provider/GitHub transports.

## Assessment

The machine assesses each Source, Article, and Claim separately against the full candidate and its frozen evidence. The five dimensions use `commons-pilot-integrity/0.1-draft`, scores 0–2 or null with a reason, and supplied evidence IDs. Code validates exact object coverage and reference membership and computes totals only for five assessed dimensions. The report headline is the Article's score, not a global average. Other object scores remain available in expandable details.

The input is untrusted evidence, not instructions. The provider has no tools and cannot select another source, vote, or publish. Reasons are paraphrases intended for public review; report rendering escapes markup and redacts common contact/address patterns. These controls do not constitute a general sensitive-data classifier. This pilot's selected public source and report must fit the intended destination.

Assessment provenance records candidate bundle digest, object and capture digests, machine identity, actual returned model, prompt/schema/code revisions, request ID, raw response reference, usage and duration. Human ratings stay pending. An assessment is not a probability of truth, a calibrated pass threshold, an ontology pin, or either of the required human approvals.

One assessment attempt reserves $0.05. Input is bounded to 64 KiB and output to 8,192 tokens at the verified Luna rates. Extraction and assessment reservations share the same cumulative allowance across two D1 attempt tables; existing extraction reservations survive migration. Per-ingestion `maxCostUsd` remains the extraction cap; automated assessment reserves an additional $0.05 from the approved cumulative budget. A normal full live path reserves $0.10 total. Actual usage remains separately recorded; failures do not automatically refund reservations.

The raw response is persisted before parsing. Restart reuses it and verifies its saved input identity, so a response from a different prompt cannot be relabelled. An attempt without a saved response requires reconciliation and cannot silently incur a second paid call. Assessment failures leave an unscored edition with an explicit failure code; report delivery can still proceed.

## Delivery and recovery

GitHub delivery targets `regen-coordination/knowledge-commons`, base `main`, with a deterministic `codex/report-<run>-<revision>` branch. The PR contains only its review-safe Markdown under `reports/ingestion/topic-<id>/`. Git trees and commits are created through the GitHub API; no local checkout or raw artifacts are pushed.

Persist the original base commit, generated commit, PR identity, and delivery state. The branch and report digest are verified on readback; changed branches or report contents block delivery rather than overwriting reviewer edits. A lost PR response is reconciled by querying all PR states for the exact branch. Closed or non-draft PRs are not reopened or replaced automatically. No auto-merge or main-branch write is performed.

Resolve team membership at delivery time, paginate with bounds, deduplicate stable account IDs, exclude bots and the PR author, and require repository write/maintain/admin access for eligible reviewers. Request eligible humans individually and verify requested-reviewer readback. Already requested reviewers or people who submitted a review of this commit are not repeatedly notified by a delivery retry. At least two eligible humans must remain. Membership failures and request rejection remain visible.

The existing GitHub ruleset enforces two team approvals for report paths. This delivery workflow does not itself evaluate or supply GitHub/Geo approval, and does not silently change draft status. See the [review policy](../runbooks/report-review-policy.md).

A ten-minute D1 lease prevents overlapping execution for a review. Workflow execution is bounded to five minutes, external calls have timeouts, and authenticated restarts are limited to three. Review status and scored-report retrieval enforce the original ingestion caller identity. Missing credentials do not block retrieval of existing reports. Fixture assessments remain synthetic and GitHub delivery is disabled for fixture runs.

## Activation and evidence

Apply `0003_reviews.sql` before running the new code: the extraction budget query now includes assessment reservations. Configure the REVIEW Workflow binding alongside INGESTION, D1, and private R2. Use `OPENAI_API_KEY` and `PILOT_BUDGET_USD` for assessment, and a separate `GITHUB_TOKEN` binding for delivery. Missing GitHub credentials produce `github_not_configured` and a resumable review.

Read [automatic review operations](../runbooks/automatic-review-delivery.md) for commands, credentials, and verified live results. Remote Cloudflare deployment awaits account access. No Geo mapping or publication capability is activated by this change.

Official references checked: [OpenAI Luna](https://developers.openai.com/api/docs/models/gpt-5.6-luna), [GitHub trees](https://docs.github.com/en/rest/git/trees), [PR creation](https://docs.github.com/en/rest/pulls/pulls#create-a-pull-request), [review requests](https://docs.github.com/en/rest/pulls/review-requests), and [team members](https://docs.github.com/en/rest/teams/members#list-team-members).
