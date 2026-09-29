# V1 ontology candidate

9 September 2026 · Owner: Afo · Status: proposed, not pinned

**Use one Knowledge Object metadata base with eleven class-specific variants.** “Knowledge Object” is the shared contract, not an additional content class. This resolves the combined labels in the [v1 brief](https://docs.google.com/document/d/1-1kuPml2Dz6W8E5Ib8ruigJwK6FvqRgjtyhvJ_TUCgw/edit) into a concrete starting proposal for Afo’s [ontology pin](https://linear.app/regen-coordination/issue/KC-18/ratify-and-pin-v0-ontology-11-classes-12-predicates-metadata-baseline).

The first executable release can use version `0.1.0` while serving the product’s v1. This document proposes semantics; it is not a Zod implementation or an assertion that a version has been ratified. Implement the fixtures, review the results, and record Afo’s explicit pin with the registry digest before marking it active.

## Shared metadata

| Field group | Proposed required contents | Meaning |
|---|---|---|
| Identity | `id`, `class`, `title` | Opaque stable UUID; one concrete class; human-readable title. Slug is an optional alias. |
| Revision | `ontologyVersion`, `revision`, `contentDigest`, `previousRevision` | A digest of the canonical semantic payload, excluding the digest itself and later review records. Previous revision is null only for creation. |
| Provenance | `createdAt`, `updatedAt`, `createdBy`, `runRef`, `sourceRefs` | UTC times, human/process identity, extraction record if applicable, captured supporting sources. No invented authorship. |
| Evidence | `evidenceRefs`, `uncertainties` | Resolvable passage references, their role and limitations; explicit empty arrays where appropriate. |
| Editorial context | `summary`, `language`, `audiences`, `topics`, `maturity` | Plain-language summary; controlled terms; maturity describes content development rather than workflow success. |
| Use boundary | `publicUseBoundary` | Access level, intended use, source-specific reuse status and attribution requirements; unknown rights remain explicit. |
| Assessment references | `assessmentRefs` | Versioned assessments of this exact candidate; an empty list means unassessed. Scores are not intrinsic truth attributes. |

Keep `capitalLenses` optional and multi-valued, drawing from the brief’s eight-capital vocabulary once its exact terms and mappings are pinned. Absence means unclassified, not “no value.” Put organization-specific tags in a declared extension namespace rather than expanding the common base for one use case.

Proposed maturity values: `draft`, `developing`, `established`, `superseded`. These describe the knowledge resource. A Claim separately identifies whether its subject is planned, reported, observed, or disputed; a draft Article may accurately describe an established practice.

Keep **operational state**, **approval state**, and **publication state** in their own run/review/release records. Do not embed mutable votes into the payload they approve, which would change its digest. Expose derived status in the website projection. ORE/CRAFT/STRUCK assessment profiles are not successive workflow states, and model self-confidence is not evidence reliability.

Source objects are the root of provenance: their `sourceRefs` may be empty because their own capture fields identify the original material. Other extracted objects require at least one supporting Source. Human-authored ontology definitions carry explicit authorship and rationale instead of fabricated external evidence.

## Eleven class-specific schemas

Each row is a discriminated variant composed with the base. Reject unknown top-level fields; validate referenced types and graph semantics separately from JSON shape.

| Class | Class-specific required shape | Boundary to preserve |
|---|---|---|
| `Article` | `body`, `purpose`, `sourceRefs` | Attributed explanation or synthesis. A proposal can be described without being treated as implemented. |
| `Playbook` | `purpose`, `prerequisites`, ordered `steps`, `expectedOutputs`, `limitations`, `sourceRefs` | Conceptually a kind of Article; separate validation variant. Each step needs an action and observable completion condition. A proposal to write it is insufficient. |
| `Pattern` | `context`, `problem`, `solution`, `tradeoffs`, `exampleRefs` | Generalization requires supporting examples and limits, not a single anecdote rewritten as universal advice. |
| `CaseStudy` | `context`, `actors`, `intervention`, `period`, `outcomeClaims`, `limitations` | Describes an actual intervention. Outcomes may be self-reported if labelled; predicted outcomes do not count as observations. |
| `Organization` | `organizationKind`, `description`, `identityEvidence` | Network, chapter, local node, DAO, nonprofit, and informal group are subtypes. A matching name is not enough to merge entities. |
| `Person` | `displayName`, `identityEvidence` | Include only public, relevant attribution. Do not infer wallet ownership or legal identity from handles. |
| `Tool` | `toolKind`, `purpose`, `referenceUrl`, `versionContext` | Protocol is a subtype. Unknown version is explicit; an old tutorial does not certify current operation. |
| `FundingMechanism` | `mechanismKind`, `allocationRules`, `eligibility`, `referencePeriod`, `sourceRefs` | Distinguish allocation design from individual awards and from currently available funding. |
| `Place` | `placeKind`, `description`, `identityEvidence` | Bioregion is a subtype. Geometry is optional; do not equate overlapping ecological and political boundaries. |
| `Source` | `url`, `sourceSystem`, `nativeIds`, `retrievedAt`, `captureDigest`, `captureRef`, `captureStatus`, `reuseStatus` | A captured source revision, not an endorsement. Authored/updated time can be explicitly unknown. Native post ID differs from its display number. |
| `Claim` | `statement`, `claimMode`, `scope`, `evidence` | Resolve “Claim & Evidence” as a Claim with typed evidence records. Evidence refers to Source passages; it is not a twelfth publishable class in this candidate. |

An evidence record contains `sourceId`, `sourceRevisionDigest`, a stable `selector`, `relation` (`supports`, `contradicts`, or `context`), and `limitations`. The selector must resolve against the stored capture. It may also carry a short permitted quotation. Source identity remains stable across captures; the digest fixes the revision used. `Claim.claimMode` is one of `planned`, `reported`, `observed`, or `disputed`, with attribution and dates in its scope. Do not use `observed` when the only evidence is a project’s own report.

Class-specific schemas do not need every possible optional field at launch. Support explicit unknowns for historical versions, dates, and access details where they cannot be established; do not substitute guesses to pass validation.

## Relationships: store meaning once

The brief’s twelve groups contain multiple directions and concepts. Preserve those groups in human documentation while pinning the actual machine predicates and allowed endpoints. Do not constrain the implementation to exactly twelve strings by flattening different meanings.

| Group | Proposed stored form | Constraints |
|---|---|---|
| Implementation | `Organization implements Pattern/Playbook/Tool` | A source must establish actual use; planned use stays in a Claim. |
| Documentation | `Article/Playbook/CaseStudy documents KnowledgeObject` | Target must exist; no self-reference. |
| Example | `CaseStudy exemplifies Pattern` | Requires an evidenced intervention and a stated fit. |
| Funding | `Organization funds Organization/CaseStudy`, with `mechanismRef` | Relation attributes retain amount/currency/date when evidenced. Derive `fundedBy`; do not lose the third participant. |
| Use | `Organization/Playbook/CaseStudy uses Tool` | Attach temporal/version context when material. |
| Location | `Organization/CaseStudy locatedIn Place` | Scope and dates as needed; avoid personal location in the initial pilot. |
| Evidence | Evidence record with `supports`, `contradicts`, `context`; `cites` points to Source | Do not reduce contradiction to generic relatedness or count copies as independent support. |
| Derivation/adaptation | `derivedFrom` plus optional `adaptedBy` Organization/Person | Derivation points to an earlier resource; adapter identity does not imply original authorship. |
| Replacement | `supersedes` | Same semantic role, explicit reason; acyclic. Revision history remains separate. |
| Dependency | `downstreamOf` | Derive `upstreamOf`; require a stated kind of dependency, not mere similarity. |
| Association | `relatedTo` | Symmetric canonical pair; explain the relationship. Does not imply identity. |
| Hierarchy | `broaderThan` between controlled topic concepts | Derive `narrowerThan`; acyclic. Concepts begin as a vocabulary registry, outside the eleven content variants. |

Every material domain relation needs provenance. The Geo mapping can represent evidence and funding as relation entities without forcing the public content taxonomy to add more top-level classes. Event and Journey remain supporting concepts or views until a real fixture demonstrates a need for their own content schema.

## Activation and pin

First enable creation of **Article, Source, and Claim**. Review fixtures for all eleven classes to settle the metadata and distinctions; enable CaseStudy next using the Colombia and Nigeria threads. Enable Playbook only when an actual actionable guide is captured. Reserved classes can appear in reference fixtures, but the extractor must not emit them into proposals while disabled.

Before Afo pins the candidate, inspect these examples and counterexamples:

- Commitment-pooling proposal → Article; reject a fabricated finished Playbook.
- Colombia report → attributed Claims; preserve targets and future activities as planned. Do not turn attendance records into ecological outcome proof.
- Nigeria updates → dated progress account; avoid a claim of sustained operation from readiness language.
- Two organizations with similar names → distinct IDs until identity evidence supports a merge.
- Edited source → new capture digest, stable Source ID; old Claim retains its original evidence reference.
- Funding → preserve funder, recipient, mechanism, and any evidenced period/amount.

The pin record should state version, registry digest, enabled classes, predicate definitions, fixtures, public-use defaults, migration policy, and Afo’s explicit decision reference. The proposed `Claim` representation and subtype choices above are ready for that decision; they have not been approved by silence. Geo property/type IDs and network mapping are a separate compatibility artifact that must be verified before submission.
