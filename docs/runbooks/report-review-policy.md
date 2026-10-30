# Regen Knowledge Commons report review policy

Automatic ingestion-report PRs request individual members of the Knowledge Commons GitHub team. Two distinct eligible humans must approve the current report revision before it is eligible to merge. The policy configuration is in [report-review-policy.json](../../.github/report-review-policy.json).

**Status:** GitHub's [report review ruleset](https://github.com/regen-coordination/knowledge-commons/rules/22708247) is active. It requires **two Knowledge Commons team approvals for PRs changing `reports/ingestion/**`**. Other PRs have zero required approvals. New reviewable pushes dismiss stale approvals. GitHub requires changes into `main` to go through PRs; there are no configured bypass actors. Local desired configuration is [report-review-ruleset.json](../../.github/report-review-ruleset.json).

Automatic report delivery and individual reviewer requests are implemented and verified in [draft PR #2](https://github.com/regen-coordination/knowledge-commons/pull/2); see [operations](automatic-review-delivery.md). Current-head report approval verification is implemented through authenticated on-demand evaluation; exact Geo-scope approval verification remains pending. See [current handoff](pre-cloudflare-handoff.md). The native rule enforces the team count; it does not implement those application checks. No reviewer notifications or PR creation occurred during the earlier policy setup. The later delivery verification created report PR #2 and notified the five eligible individual members, excluding its author.

## Reviewer selection

Resolve members of `regen-coordination/knowledge-commons` at delivery time, including all API pages. Request each eligible member individually, excluding the PR author and bot accounts. Check repository access and use stable GitHub account IDs for identity; login spelling can change. Read back the requested reviewers and persist the result with the PR and report revision.

The team membership observed during setup was:

- `durgadasji`
- `MattyCompost`
- `rathermercurial`
- `Oba-One`
- `luizfernandosg`
- `explorience`

This list is a discovery snapshot, not a permanently hard-coded reviewer list. If membership or permissions cannot be resolved, keep the PR and mark reviewer delivery blocked; do not silently request unrelated people. If fewer than two eligible humans remain, show the shortage explicitly.

## Approval rules

- Count two **distinct current team members** with repository write access, excluding the author and automated identities.
- Use each person's latest submitted review. It must be `APPROVED`, not dismissed, and refer to the current PR head commit. A comment, pending review, team mention, or abstention is not an approval.
- Require fresh approvals after a new report revision or reviewable push. Any separately recorded content/operation scope change also invalidates the corresponding knowledge approvals.
- An unresolved eligible review requesting changes blocks report acceptance. A later approval by that reviewer can resolve it; another person's approval does not erase the objection.
- Keep automatic PRs in draft and do not auto-merge. Reviewers can discuss the report while the pipeline/Geo setup continues. A maintainer handles readiness and merging under the verified repository rules.
- A GitHub report approval or merge does not automatically authorize a Geo operation. Knowledge promotion still needs two affirmative human decisions bound to the exact candidate, operation digest, and intended scope under verified governance semantics.

## Enforcement implementation

Individual review requests alone do not enforce an approval count. The active native `required_reviewers` rule binds two approvals to team ID `19269143` and report file paths. This file-specific option is documented as beta. GitHub enforcement does not approve an exact Geo operation or replace application verification of the current head, candidate digest, and public-use scope.

Use authoritative GitHub readback for membership, PR author, head SHA, review state, and permissions. Reconcile duplicate review-delivery attempts and reevaluate after synchronize, submitted/dismissed reviews, and membership/access changes. Never run untrusted PR code with a privileged delivery credential. Keep the last evaluated SHA visible so an old successful check cannot imply acceptance of a new revision.

Tests must cover duplicate reviews by one person, author/bot reviews, stale commits, dismissed approvals, changes requested, permission/membership loss, API failure, and head changes during evaluation. Verify actual GitHub reviewer requests and merge blocking separately from local test success.

## References checked

- [Requesting reviews](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/requesting-a-pull-request-review): reviewers need repository access; requests notify individuals or teams.
- [Required reviews](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/approving-a-pull-request-with-required-reviews): authors cannot approve their own PRs; approval permission and stale-review behavior matter.
- [Protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches): native review requirements and stale-approval dismissal.

## Verification and recovery

GitHub API readback confirmed ruleset `22708247` is active and applies to `refs/heads/main`; the effective branch rule returned a global approval count of zero and a team minimum of two for `reports/ingestion/**`. Before setup, both repository rulesets and effective branch rules were empty. All six discovered member accounts have GitHub type `User`; their actual voting eligibility must be rechecked when evaluating reviews.

The creation request succeeded although the CLI response formatter failed. A subsequent list/effective-rule readback reconciled the result; no duplicate was created. No merge attempt or two-human review exercise was performed, so this is verified configuration, not an end-to-end governance demonstration.

For an explicitly authorized rollback, disable only ruleset `22708247` through repository Settings → Rules → Rulesets. Preserve unrelated rules added later. The JSON file alone neither updates nor removes live GitHub settings.

- [File-specific required reviewers API](https://docs.github.com/en/rest/repos/rules#create-a-repository-ruleset): `required_reviewers`, team identity, patterns, and minimum approvals.
