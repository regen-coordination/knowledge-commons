---
name: publish-reconcile
description: Prepare an authorized Geo proposal, verify its human approvals and execution, or publish and reconcile Knowledge Commons release artifacts. Use for exact-revision publication and recovery; skip source selection and model scoring.
---

# Proposal and publication

Read root `AGENTS.md`, the relevant publication design, and the exact candidate/run record. Distinguish preparation, upload, submission, voting, execution, indexing, export, and website deployment.

1. Establish the requested action and existing authorization. For submission, verify the target network/space, tested SDK mapping, stable entity IDs, candidate revision, operation digest, and intended public-use scope. A credential authenticates a caller; it is not evidence of human approval.
2. Persist intent and identifiers before external effects. On timeout, reconcile the recorded transaction or proposal before retrying. An unknown result stays unknown; do not regenerate IDs or submit a second edit to make the state look complete.
3. The agent never votes. Verify two distinct affirmative humans approving the exact proposal version and scope. Check actual deployed governance semantics; quorum 2 or two reviewer names is insufficient. Do not treat pre-Geo rehearsal approvals as onchain votes.
4. Publish accepted knowledge only after verified execution and matching indexed state. Record included edits and materialization checkpoint. An arbitrary current graph query is not proof of a historical snapshot.
5. Write immutable release artifacts, validate digests/contracts together, then advance the manifest monotonically. Preserve the last good release on failure. The website resolves one release and cannot mix artifacts from multiple revisions.
6. Verify the Knowledge Commons website’s observed deployed release, not just the R2 write. Reconcile correction/retraction and rollback through recorded history. Keep source evidence and stable identities across migrations.

Output actual proposal/version, approval, transaction, checkpoint, artifact, and website evidence relevant to the action. State which stages are unverified. Never claim production readiness from a testnet demonstration or from an API upload alone.
