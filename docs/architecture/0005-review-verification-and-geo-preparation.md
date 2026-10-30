# Report approval verification and local Geo preparation

The API can evaluate the current report's GitHub reviews and prepare a private Geo operation preview from the same frozen candidate. These are separate records. Neither operation merges a PR, uploads data, signs transactions, votes, or promotes knowledge.

## Report decision

`GitHubDelivery.evaluate` reads the saved PR and exact report bytes, resolves current team members and repository permissions, and evaluates each person's latest submitted review. It excludes the author, bots, stale commits and dismissed approvals. Two distinct current eligible humans must approve. An unresolved request for changes remains blocking even after a later comment; that reviewer must approve the current revision to resolve it. Membership, permissions, reviews and head are read again before returning. A changing snapshot or failed API read blocks evaluation.

The result records the evaluated head, report/candidate digests, review IDs, stable account IDs, evaluation time and evidence digest. GET returns an explicitly historical snapshot; POST performs fresh readback. A previously successful snapshot is never a continuing authorization. There is no webhook/check-run installation in this milestone, and this endpoint is not a GitHub merge gate. Native repository rules continue to enforce merging. The future promotion caller must reevaluate and independently establish exact Geo scope approvals.

Keeping verification inside the existing GitHub adapter shares bounded HTTP handling and pagination. A separate general approval service would duplicate those reads while hiding the report revision the caller needs to verify.

## Geo preview

`prepareGeo` validates Article, Source and Claim drafts and maps their stable IDs into a deterministic entity/relation preview. It preserves claim mode, scope, content/capture digests, source links, evidence references and public-use conditions. Source posts, raw captures and provider responses are excluded. Candidate bodies can still contain sensitive material: the preview remains private.

The mapping is `commons-geo-preview/0.1`, unratified, with symbolic property/type names. It is **not an encoded GRC-20 edit**, and it contains no invented destination or existing Geo ontology IDs. The preparation digest binds the candidate, report, assessment, registry, mapping, operation digest, target and intended scope. Repeated preparation preserves identity; changing scope or destination changes the preparation digest. Preparing a new candidate never overwrites the original report.

Supported example: a proposed commitment-pooling resource remains an Article with planned Claims and source relations. Rejected near-miss: a proposal cannot become a finished Playbook or observed outcome. Existing draft schemas and registry digests remain unchanged; no migration or ontology activation is implied. Afo must ratify the exact ontology/mapping, and the real destination must be checked before encoding/submission is enabled.

The tested `reconcileGeo` function rehearses intent → uncertain/proposed → executed → indexed using simulated adapter receipts. It preserves operation identity, rejects conflicting proposal/transaction IDs, and requires separate execution and indexing evidence. It does not verify real receipts or human votes; no public route accepts these simulated observations. The future adapter must persist intent before upload and independently verify authoritative receipts. An uncertain write requires reconciliation, never automatic resubmission with a new identity.

## Runtime and activation

Migration `0004_preparations.sql` stores the latest record pointer for each run and kind. Immutable digest-addressed snapshots stay in private R2. Original ingestion caller authorization covers both endpoints. API failures replace the latest evaluation with a blocked record, retaining earlier evidence for inspection.

Geo network, space and proposer are unavailable, as confirmed by Afo. Preparation therefore records a null target and explicit blockers. Remaining work is actual property/type mapping, verified SDK encoding, destination visibility/governance checks, authenticated proposal transport, authoritative receipt readback, and two exact-scope human approvals. Report approval is not a Geo vote.

References checked September 9: [GitHub submitted reviews](https://docs.github.com/en/rest/pulls/reviews?apiVersion=2022-11-28), [Geo SDK operations and configured clients](https://github.com/geobrowser/geo-sdk/blob/main/README.md), and [GRC-20 specification](https://github.com/geobrowser/grc-20/blob/main/spec.md). SDK documentation has evolved from older Graph examples to an Ops/client API; no unverified SDK version has been added to the Worker.
