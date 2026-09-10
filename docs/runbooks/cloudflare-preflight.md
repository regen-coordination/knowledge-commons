# Regen Knowledge Commons deployment preflight

The Worker can be built and rehearsed locally. Cloudflare deployment awaits the intended account and authorized access. Geo network/space/proposer details are also unavailable; that does not block report review or private Geo preparation.

## Before provisioning

1. Confirm the intended account and inspect its existing Worker, Workflow, D1 and R2 resources. Reuse only resources verified to belong to this pilot. The checked-in zero D1 ID is a local placeholder.
2. Prepare a deployment-specific Wrangler configuration from `packages/agent/wrangler.jsonc`. Use the full `regen-knowledge-commons` product prefix for newly provisioned resources. Keep local binding/resource names unchanged so existing evidence and spending reservations remain visible.
3. Configure INGESTION and REVIEW workflows, private ARTIFACTS R2, and DB. Apply migrations 0001–0004 before serving traffic. Do not enable public R2 access.
4. Provision `PILOT_API_TOKEN`, `OPENAI_API_KEY`, `GITHUB_TOKEN` and `PILOT_BUDGET_USD` through supported secrets handling. Use secret values through stdin or the dashboard, never arguments, documentation or PRs. `PILOT_CALLER_ID` remains the internal pilot identity. No other model key is required.
5. Carry forward the remaining budget. On a fresh remote database, use the remaining conservative allowance from the latest handoff—not a fresh $7—and stop paid local runs. If importing the local attempt ledger instead, retain the original cumulative cap and avoid subtracting the ledger twice. Record which approach was used. Keep the zero default until this is settled.
6. Use a repository-scoped GitHub credential with content/PR writes and required team membership reads. Provisioning it locally does not provision the Worker. Expiring tokens need external refresh; the adapter does not mint GitHub App tokens.

## Activation checks

After access is supplied, verify current Wrangler help and execute the deployment through the confirmed account. These remote commands are **not yet run**:

```sh
bunx wrangler d1 migrations apply DB --config <deployment-config> --env pilot --remote
bunx wrangler deploy --config <deployment-config> --env pilot
```

Record the deployed URL, account/resource identities, version ID, commit and code revision. Set `PILOT_BASE_URL` to that HTTPS URL and use the smoke and demo commands in [tomorrow-demo.md](tomorrow-demo.md). Verify real ingestion, separate assessment, automatic PR delivery, repeated-key reuse and fresh approval evaluation. A health-only result is not the full deployment milestone.

The pilot token is shared internal authentication, not individual reviewer authentication. Human approvals are read from GitHub. Geo submission remains disabled until its separate mapping, destination and governance requirements are met.

## Rollback and recovery

Before the first update, record the last known-good Worker version and test the current `wrangler rollback --help` interface. Roll back only the intended Worker's code version. Do not reset D1, delete artifacts, clear paid attempts, or delete report branches. Additive migrations remain in place; restore data only from a separately verified backup plan.

Pause new ingestion by removing its spending allowance if needed; inspect in-flight workflows separately. A reserved paid attempt may already be in progress. Failed extraction or assessment with a saved response can reuse it; an uncertain attempt with no saved response needs reconciliation. Review delivery reconciles the existing deterministic PR. Private Geo preview has no external effects to roll back.

Extraction recovery now also requires its saved, digest-bound `extraction-input.json` and compatible prompt/schema/registry revisions. `extraction_revision_mismatch`, `extraction_input_revision_mismatch` and `extraction_input_missing` require reconciliation; do not clear attempts or reconstruct provenance for historical responses. Completed historical runs stay unchanged. See the [request identity decision](../architecture/0007-review-recovery-and-extraction-provenance.md).

The first deployment has no previous hosted version to roll back to. If it fails, stop new requests and fix/redeploy from the verified local baseline while preserving remote evidence and reservations.
