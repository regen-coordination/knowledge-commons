# October 29 consolidation for review

The ingestion stack and the Geo toolkit can coexist without changing runtime or publication contracts. The remaining preparation is report tracking, current navigation, and an explicit merge sequence. All changes stay in review branches; no merge, deployment, model call, knowledge acceptance or Geo write is authorized by this record.

## Review sequence

1. Refresh #4 (`codex/ingestion-review-foundation`) from main `8c0dafe72e8089ccc021537a75eb04250cfabfdb`.
2. Refresh #7 (`codex/ingestion-review-object-files`) from the refreshed #4.
3. Refresh #8 (`codex/ingestion-review-fixes`) from the refreshed #7. Treat these recovery/provenance fixes as part of the baseline before runtime activation.
4. Review `codex/consolidate-review-tracking` above #8: this record, the [review index](../../reports/ingestion/INDEX.md), corrected current/historical instructions, and the previously local shared-engineering guidance from `561baa7`.
5. Review `codex/commons-navigation` above the tracking branch: Matt's three connected Commons pages and seven scoped documentation annotations. Recheck the status table when merging.
6. Review independent organization-profile, public-Toolkit and Coordination-OS documentation PRs after their Commons map destination is available. Review the Toolkit integration README on `regen-toolkit-os` separately.

Use merge commits to refresh the code stack without rewriting existing work. Before a remote update, verify the expected head; stop on concurrent changes. If a maintainer later squash-merges a lower PR, retarget/restack the remaining code branches and rerun checks. Preserve delivered report PR heads and their base `main`.

## Review gates and records

Code PRs #4 and #7 include calibration artifacts. Apply the repository's actual review rules to them, while keeping implementation review distinct from acceptance of the knowledge recorded in those files. The [review index](../../reports/ingestion/INDEX.md) records the duplicate artifacts and proposed disposition. The topic-356 classification issue remains unresolved; historical bytes are retained for calibration.

Two distinct affirmative humans must approve the exact candidate revision and publication scope before promotion. COMMENTED reviews, machine scores, code merges, visibility in GitHub, and this consolidation do not satisfy that requirement. The ingestion agent never votes.

## Documentation ownership

- Root `AGENTS.md` routes development work; `agent/skills` contains contributor guidance; `packages/agent` is the runtime.
- `.agents/agents.md` and `docs/geo/operations.md` route the standalone Geo toolkit and preserve its safeguards.
- `reports/ingestion/INDEX.md` owns edition/review tracking; dated reports and handoffs remain historical evidence.
- `docs/MAP.md` on the navigation branch owns cross-project orientation and source lineage.

Root checks intentionally exclude the Geo toolkit. Its TypeScript, skill lint and manifest checks remain separate verification responsibilities. A green ingestion suite does not cover all Geo tools.

## Maintainer discussion

Confirm the public naming and map steward, one stable July source-packet location, Garden visibility/review/reuse status, the ReFi DAO public entry point, supported OS commands, and the Toolkit learning-path count before asserting new facts. Historical Geo records receive dated annotations rather than rewritten evidence.

KMS stays on `proposal/org-os-kms-instance` with publishing disabled. Its peer-owned content/indexing model differs from the pilot's proposed Geo authority/R2 projection model. A future integration proposal must demonstrate identity, evidence, consent, revision and approval preservation for a concrete object. This consolidation does not choose between those models or ratify the ontology.

## Validation baseline

The combined tree of current main and #4 → #7 → #8 merged without conflicts. Frozen dependency installation, `bun run check`, 75 tests / 446 assertions and a Worker dry-run build passed in an isolated checkout. All 16 files from #2/#3/#5/#6 matched copies in the stack by Git blob identity. Geo read/write skill lint and all three manifest content hashes passed. These results are local evidence; remote CI and required human reviews still govern merge readiness.

No paid calls, saved pilot-data changes, deployment or live Geo writes were used. Real Geo encoding/submission, Cloudflare activation, ontology ratification and completed human calibration remain pending.
