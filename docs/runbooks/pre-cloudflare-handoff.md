# Regen Knowledge Commons pre-Cloudflare handoff

The local API now verifies report approvals, creates private Geo previews, and ingests the new commitment-pooling demo source. The implementation baseline is in [draft code PR #4](https://github.com/regen-coordination/knowledge-commons/pull/4), with passing GitHub push and PR CI on implementation commit `93c794246da343ce43e768ce4bf9e936365faafa`. Hosted activation awaits Cloudflare access; Geo target details and authentic human calibration results remain pending.

## Implemented and exercised

- Approval evaluation: authenticated `POST /v1/ingestions/:runId/approvals` performs current GitHub readback. GET returns a labelled historical snapshot. Two distinct eligible approvals must name the current head; unresolved change requests block. There is no auto-merge, webhook installation or Geo authorization.
- Geo preparation: authenticated POST/GET at `/v1/ingestions/:runId/geo` preserves an immutable private preview and digest. The current target is null, symbolic property/type IDs are unresolved, and submission is disabled. Adapter recovery tests use simulated receipts; real SDK encoding and governance readback remain future work.
- Source selection: explicit topic allowlist 235/356, matching capture/run/report identity, neutral future export folders, and community-garden synthetic fixtures. CLI capture/ingest defaults to 356. Historical records remain unchanged.
- Human calibration: [independent worksheet](integrity-calibration.md) and evidence-based review procedure are ready. Two distinct human reviews have been requested; none supplied. No completed human calibration or ratings are claimed.
- Deployment/demo: [preflight](cloudflare-preflight.md) and [five-minute demo](tomorrow-demo.md) include secrets, migrations, remaining-budget carryover, recovery and saved fallback.

## Real demo evidence

Run `eba2a43f-caa7-4f88-a1d8-a21a595c7b17` used OpenAI `gpt-5.6-luna` for extraction and assessment. Native posts: 746, 750, 812, 830. The captured thread has no ReFi Toolkit title match; no linked pages were fetched. [Report PR #3](https://github.com/regen-coordination/knowledge-commons/pull/3) contains exactly one 321-line Markdown file and requests `durgadasji`, `MattyCompost`, `rathermercurial`, `luizfernandosg`, and `explorience` individually, excluding author `Oba-One`.

| Record | Verified value |
| --- | --- |
| Capture digest in the run | `sha256:b845d6ea60148eb3fd4435ef4f6afff2dc0698e9eb91b322cb54a28d0b7c2e55` |
| Candidate bundle | `sha256:e75aa050d3b1ace6a67866d0650b24aba8c197b031eec42474bd344b4e837a38` |
| Assessment | `sha256:e3698658107133d0c8b2377fb8bda451cd0292325ef59dcf13a1500f6497ce3c` |
| Scored report | `sha256:45a9ce3f3778152900d3ad9250b46ec092e2c6497432c0073b166ca357e88ede` |
| PR head | `f44a0c2473909663b5b532d6c57c85d683e1dcd1` |
| Geo preparation | `sha256:036d9ccf42f6b329a0b0dc96846fc9e20e48cd4a4e1e24f27528e62306bca718` |
| Symbolic operations | `sha256:60c7ec34ec3d1e7325e1b5015a844f14d3b76deead2f92a20a0bbeff796eebc7` |

The Article's machine score is 8/10. Source support is not assessed, so it has no total. Human results remain separate and pending. Agent inspection found a useful calibration question: Claim 5 is labelled disputed although the cited reply describes possible evolution and offers contribution. Another question is whether the assessor's Article-origin explanation penalizes a derived summary for lacking independence when its dependence on the source is expected. These are agent audit observations, not human calibration labels; preserve the saved output while reviewers examine them.

Fresh approval evaluations returned pending with zero approvals on PR #2 at `2026-09-10T01:58:17.053Z` and PR #3 at `2026-09-10T02:00:23.722Z`. These are dated snapshots, not ongoing monitoring. PR #3 remains draft. Its machine report's static approval count describes report generation, not current GitHub state.

Extraction recorded 1,659 input and 1,355 output tokens, including 146 reasoning tokens; estimated cost $0.0019578. Assessment recorded 9,983 input and 2,772 output tokens, including 201 reasoning tokens; estimated cost $0.005323. Combined new usage: **$0.0072808**. The cumulative local ledger now reserves **$0.35**, leaving **$6.65** of the approved $7; total known estimated model cost is **$0.0192902**. Reservations are conservative accounting, not invoice charges.

## Validation and continuation

Local checks passed: `bun run check`, `bun test` (65 tests, 309 assertions), `bun run build` (933.92 KiB / gzip 160.78 KiB), and authenticated smoke. All four local migrations applied. Real topic-356 capture, extraction, validation, assessment, automatic reviewer requests, repeat-key reuse, export, approval evaluation and Geo preparation succeeded. Submission code revision: `sha256:2db6adb8a5c90f0460b5d1ab7c5ead24f4612bdbc224fdc584e5c8b76f887eaf`.

After Cloudflare access, follow preflight and record actual deployment identity, remaining-budget handling, real remote ingestion and rollback evidence. After Geo details arrive, read the publication/ontology skills and [design decision](../architecture/0005-review-verification-and-geo-preparation.md), then resolve mappings and verify the intended SDK/runtime and proposal visibility before any external action. The agent never votes; two authenticated exact-scope human decisions and verified execution/indexing are still required for accepted knowledge.

Final packaging check: frozen installation passed after renaming the CLI command to `review:prepare` to avoid Bun's `prepare` lifecycle hook. Final code revision is `sha256:d716e864e03bc616edf3b7cd4c06a85230ac250a5e543e75e8d430e5c183ebc4`; the saved demo preserves its original submission revision. Generated runtime types and registry are marked as generated for PR review. Markdown hard-break whitespace and Wrangler-generated union formatting are intentionally permitted.

Remote verification: [push CI](https://github.com/regen-coordination/knowledge-commons/actions/runs/34428078114) and [PR CI](https://github.com/regen-coordination/knowledge-commons/actions/runs/34428115834) passed frozen install, checks, tests and the Worker dry-run build. This handoff-only follow-up does not change the implementation revision. Both demo Workflows recorded successful terminal results: ingestion at `2026-09-10 01:58:25.822` and review/PR delivery at `2026-09-10 01:58:55.724`. A local runtime cancellation warning also appeared; it did not prevent either recorded completion. PR #3 report bytes were independently compared with the saved file and matched exactly.

The local server is stopped. The temporary ignored `.dev.vars.pilot` containing the verification GitHub credential was removed; the user's original `.env.pilot`, private captures and D1/R2 evidence remain intact. No implementation or report PR was merged.
