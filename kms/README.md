# kms/ — the Regen Knowledge Commons as an org-os-kms instance (proposal)

Status: proposal, for the group's reaction (Linear KC-35). Not for merge as-is.

## What this is

A proposal: the Regen Knowledge Commons as an org-os-kms instance, in one folder. The framework is vendored under `packages/` at tag `kms-geo-v0.1`, the instance is configured in `kms.yaml`, and `federation.yaml` plus `data/kb/source-system.yaml` name its peers. Deleting `kms/` removes all of it.

## What it does not touch

- No file outside `kms/`.
- Not Afo's pipeline (PRs #4, #7, #8) or his ontology. Afo owns the ontology pin (KC-18).
- Not Rather's `.agents/` Geo layer.
- It publishes nothing (`publish.static: false`, `publish.apply: false`).

## How it fits the least-Geo path

Geo holds the shared ids and the indexing. Content stays in each instance's repo; this instance holds no content store of its own. An object's Geo id is its UUID without dashes, so git, AT Proto and Geo share one identity. `npm run geo:plan` runs `geo register` as a plan only: `geo.space` is null until the group confirms the Regen KC project space in Geo (CONNECTORS §13).

## Peers

- ReFi DAO Knowledge Commons: pulled over AT Proto from `did:plc:ie6nze3zltsffksdwlhl2hbw` (a dev identity, replaced at its Phase 3).
- regen-toolkit: pull-only today; it publishes nothing until its three gates hold.

Another instance joins with two things: a card in `data/kb/source-system.yaml` and one connector declaration in `kms.yaml` (one per peer host; the connector does not resolve DID documents).

## The crosswalk

`crosswalk/framework-to-geo-and-v1.yaml` relates the framework's object types to Rather's Geo space types and to Afo's v1 candidate classes. Status: proposal. Afo owns the ontology pin; nothing there ratifies anything.

## The fixture

Ten ReFi DAO encyclopedia entries pulled on 2026-09-30 with `npm run ingest` (scope: `types: [encyclopedia-entry]`, `limit: 10`). They arrive at raw maturity and are labelled test data, not accepted knowledge. Regenerate or delete `data/` at will. The fixture is the last commit on the branch and is pushed only after ReFi DAO's Council decides on public exposure.

## Open questions for the group

1. Which Geo space is the Regen KC project space (for the group to confirm).
2. Whether the V1 pipeline outputs should arrive here as a peer.
3. The NSID authority (`xyz.regencoordination.kb`) and the `kc.regencoordination.xyz` handle, moved here from regen-toolkit and not yet validated by any council.

## Framework docs

The Method parent of every instance is the framework's three cores:

- [ontology core](https://github.com/regen-coordination/org-os-template/blob/main/packages/toolkit-framework/architecture/ontology-core.md)
- [methodology core](https://github.com/regen-coordination/org-os-template/blob/main/packages/toolkit-framework/process/methodology-core.md)
- [publication policy core](https://github.com/regen-coordination/org-os-template/blob/main/packages/toolkit-framework/process/publication-policy-core.md)

They are referenced here, not copied.
