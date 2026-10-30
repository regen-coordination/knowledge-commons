# Regen Knowledge Commons: automatic reports alongside Geo

## Updated delivery decision

Build automatic report delivery and Geo proposal integration in tandem, so humans can review ingestion output while Geo Browser is being set up. Use OpenAI/Luna initially. Additional model adapters and the four-model comparison remain deferred.

This expands the upcoming work beyond the original deployment-only Prompt 3. Preserve completed Prompt 1 and Prompt 2 evidence. Do not interpret the earlier exclusion of Geo from those completed prompts as a reason to postpone integration indefinitely.

## Current implementation

Each completed ingestion already generates a Markdown report automatically, stores it with private artifacts, and exposes authenticated run/report endpoints. Local export is verified. GitHub delivery and machine Integrity scoring are implemented and verified through the local Worker, including real report PR #2 with individual reviewers. Private symbolic Geo mapping previews and current-revision report approval evaluation are now implemented locally. Actual SDK encoding/submission and deployed Cloudflare execution remain pending. See the [current handoff](../runbooks/pre-cloudflare-handoff.md). See [review operations](../runbooks/automatic-review-delivery.md). The ontology remains draft and unratified.

See the [handoff](../runbooks/first-deployment.md), [report guide](../../reports/ingestion/README.md), and [naming audit](../audits/2026-09-09-product-naming.md). The next demo source must satisfy the user's naming/content preference; historical topic-235 evidence remains unchanged.

## Next implementation milestone

1. Deploy the protected ingestion API and its Workflow, D1, and private R2 bindings to the confirmed Cloudflare account. Preserve the remaining approved model allowance when initializing the deployment.
2. Add durable automatic delivery of completed review-safe reports as draft GitHub PRs in `regen-coordination/knowledge-commons`, targeting `main`, and resolve `@regen-coordination/knowledge-commons` membership and explicitly request its eligible members individually. The user selected this delivery path. Authenticated API retrieval remains available, and report creation must not depend on Geo availability.
3. Add a separately recorded machine Integrity assessment using the existing OpenAI provider, within the same cumulative spending allowance. Bind the assessor/model, rubric revision, five ratings and reasons, evidence references, and usage to the exact candidate revision. Missing/failed assessments remain visible; they do not prevent reading the extraction report. Preserve human ratings separately and never substitute a score for approval.
4. Implement and test Geo preparation, mapping, and proposal submission against the confirmed network/space and authenticated proposing identity. Inspect actual proposal visibility and governance behavior before sending private or unapproved material. A proposal can be publicly visible even before it is accepted.
5. Associate the report, assessment, candidate revision, operation digest, and Geo proposal/version. Report delivery and Geo submission each have their own durable status and retry/reconciliation path.
6. Once two distinct affirmative human approvals of the exact revision and scope are verified under the applicable governance rules, track execution and indexed readback. Link verified Geo Browser entities when available. Proposal creation, execution, and Browser indexing must be shown as separate stages.

Implementation stays within `agent -> pipeline -> ontology`. Keep report delivery and Geo signing behind separate adapters and credential bindings. The extractor does not need repository credentials. Automatic GitHub PR delivery requires authorized repository write/PR access for its delivery adapter; the earlier statement that the API needs no GitHub credential applies only to local export.

## Confirmed GitHub delivery behavior

- Repository: `regen-coordination/knowledge-commons`; base branch: `main`.
- Reviewer source: `@regen-coordination/knowledge-commons` (display name: Knowledge Commons). Resolve current members and request them individually, excluding the PR author and bots. Follow the [report review policy](../runbooks/report-review-policy.md): two distinct eligible approvals of the current revision. The native report-path team-count rule is active; individual delivery is verified; current-revision application report verification is implemented; Geo-scope verification remains to implement.
- Create a `codex/` branch and draft PR containing review-safe report material; use the repository's conventional PR title format and `automated/codex` and `draft` labels. Do not auto-merge.
- Explicitly request the eligible individual members through the review-request API and verify the result. A PR body mention alone is not completion. [GitHub documents](https://docs.github.com/en/pull-requests/reference/pull-requests#draft-pull-requests) that draft PRs do not automatically request code-owner reviews; do not rely on CODEOWNERS for this path. If the request is rejected, record an inspectable delivery failure and reconcile the existing PR rather than creating another or silently changing its draft status.
- A team review request does not establish two approvals. Track the distinct humans and exact reviewed revision separately.

## Durable delivery and review behavior

- Persist delivery intent before an external write. Key it by run, candidate/report revision, and destination so retries cannot create duplicate PRs or Geo proposals.
- Keep extraction outputs immutable. Assessments, delivery status, approvals, and Geo progress are separately versioned records referencing the original candidate. Render later review editions without modifying the completed run or its original report digest.
- A GitHub PR is a report-review surface. A merge, comment, or review is not automatically a knowledge approval. Binding approval requires distinct authenticated identities, an affirmative decision, and the exact candidate/operation revision and public-use scope.
- If Geo is unavailable, continue delivering reports and show Geo as pending or blocked with a useful reason. If delivery fails after a successful Geo action, retry delivery without submitting the edit again. Reconcile uncertain external outcomes before retrying.
- The agent never votes. Failed, pending, or rejected proposals cannot appear as accepted knowledge. The owned knowledge website can follow this milestone.
- Raw captures and provider responses stay private. Publish only review-safe reports to the confirmed destination, with source reuse and intended disclosure checked for that destination.

## Inputs needed for external activation

- Cloudflare account/resource selection and authorized deployment access.
- Securely provision a credential for the GitHub delivery adapter. Repository `regen-coordination/knowledge-commons`, default branch `main`, and team slug `knowledge-commons` were verified through the GitHub API; the team has `push` access. The repository is public. Existing local CLI access does not provision credentials for the deployed service. Inspect supported current GitHub authentication before implementation; do not reuse unrelated credentials.
- Geo network/space, proposing identity, transaction funding, verified SDK/runtime path, and proposal visibility/governance semantics.
- Afo's activation of the exact ontology/mapping version before accepted-knowledge publication; the existing draft registry is not ratified by this plan.

A missing destination or credential does not block local adapter/contracts/tests or continued report review. Do not invent target IDs or claim external delivery from local tests.

## Completion evidence

- A real deployed ingestion generates a readable report and separately identifiable machine assessment, or an explicit inspectable assessment failure.
- A draft PR targeting `main` receives the report automatically, with no manual local export. Verify individual requests match eligible Knowledge Commons team members through GitHub readback. Record PR URL/number, head commit, report digest, and review-request status. Repeat execution preserves one delivery per revision.
- A permitted real candidate produces a verified Geo proposal/version under the intended deployment, with linked report/candidate/operation identifiers. If Geo setup is still blocked, label the milestone partial and keep report review operating.
- Negative tests cover delivery failure, assessment failure, Geo timeout/reconciliation, duplicate triggers, changed candidate revisions, and invalid/insufficient human approvals.
- Accepted/visible-in-Geo claims require verified execution and indexed readback. A staged proposal or testnet demonstration is labelled accordingly.

This document records the requested direction and implementation boundary. GitHub review ruleset `22708247` is now active for report paths; see the linked review policy. Report PR #2 and its machine assessment are verified. No Cloudflare deployment, Geo submission, ontology ratification, or human approval has been recorded.
