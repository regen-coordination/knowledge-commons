# Regen Coordination - Project Map and Research Lineage

This page helps people and AI agents navigate the related projects, knowledge spaces, source material, and enabling frameworks. It is a project map, not an ontology, an exhaustive ecosystem directory, or a decision on the final technical architecture.

[Knowledge Commons home](../README.md) | [About the Regen Knowledge Garden](regen-knowledge-garden.md)

## Main projects and knowledge spaces

| Name | Role | Start here |
| --- | --- | --- |
| Regen Knowledge Commons | The Regen workstream for knowledge-commoning methods, documentation, Geo tooling, and developing ingestion and review approaches. | [This repository](../README.md) |
| Knowledge Commons on Geo | A shared space combining knowledge about commoning with reusable types, properties, and semantic practices that other commons can build on. | [Shared Geo space](https://www.geobrowser.io/space/bd727a6ad6ec4a058f681ea9002a1fbf), [Geo documentation](geo/README.md) |
| Regen Knowledge Garden | The broader Regen-specific environment for connecting source-aware knowledge, concepts, people, organizations, projects, tools, and learning. Geo is one current representation. | [Garden introduction](regen-knowledge-garden.md), [Garden on Geo](https://www.geobrowser.io/space/b818ec4b89d949d88342249e3c649cd0) |
| Regen Toolkit | A distinct public education and practical resource product. It can contribute knowledge and learning to the Garden without becoming a subproject of it. | [Toolkit repository](https://github.com/regen-coordination/regen-toolkit) |
| Regen Coordination OS | Organizational memory, coordination, shared skills, and network knowledge. Its organizational practices and selective learning can connect to the Garden. | [Coordination OS repository](https://github.com/regen-coordination/regen-coordination-os) |

The [current Org OS framework](https://github.com/regen-coordination/org-os-template) is an enabling framework used by related organizational and knowledge-management work. It is not another public knowledge product in the map above.

## Two spaces, different scope

Knowledge Commons on Geo is shared commoning knowledge and a reusable semantic foundation. Regen Knowledge Garden applies and extends knowledge-commoning approaches to Regen-specific knowledge and relationships. The Garden is broader than its Geo space: it may draw on source systems, research, community stewardship, repositories, public interfaces, and other commons. This does not imply that all of those integrations already operate.

The name Regen Commons refers to a separate initiative. Do not use it interchangeably with this repository's Regen Knowledge Commons workstream.

## What belongs where

- Knowledge aggregated for discovery and learning: Source Systems, people, projects, organizations, tools, concepts, cases, movement and place-based knowledge, and conceptual lineages. These belong primarily in the Garden and the living source systems that steward them.

- Knowledge about commoning itself: methods, peer commons, governance patterns, ontology practice, provenance, review, and interoperability. This is particularly relevant to the shared Knowledge Commons space.

- Frameworks and tools used to build or steward the work: Geo agent tools, Org OS, CSIS, assessment methods, and other relevant infrastructure. Link them here when they explain an actual dependency or practice; do not treat them merely as entries in a resource directory.

The flow between projects is a potential knowledge relationship, not a claim that content is already synchronized or that one project owns another's records.

## July 2026 research and implementation lineage

The original July 2026 handoff preserved extensive research, architecture, source-system leads, conceptual lineages, cases, cautions, and implementation guidance. It remains valuable reference material, but its proposed models are not automatically the adopted architecture today.

Original packet: the July handoff includes an entry-point Guide, three governing specifications, four core files (Master Draft, Technical Handoff Guide, Canonical Database, and Discovery Pool), and twelve thematic annex workbooks. The complete research packet is maintained separately from the tracked integration branch; its stable, team-accessible link still needs confirmation. The GitHub records below are derived integration and structured outputs, not a replacement for the original source packet or its broader research context.

| Material | Why it matters | Location |
| --- | --- | --- |
| July handoff integration plan | Records how source material was crosswalked to framework and implementation work; contains dated decisions and unfinished items. | [Handoff integration](https://github.com/regen-coordination/regen-toolkit/blob/regen-toolkit-os/docs/plans/handoff-integration.md) |
| Framework-to-master crosswalk | Documents agreements, gaps, and differences between the research schema and framework models. It is a dated comparison, not current ratification. | [Crosswalk report](https://github.com/regen-coordination/regen-toolkit/blob/regen-toolkit-os/docs/reports/2026-07-15-framework-masterdoc-crosswalk.md) |
| Canonical database migration manifest | Records the structured migration, provenance, safeguards, and review needs. | [Migration manifest](https://github.com/regen-coordination/regen-toolkit/blob/regen-toolkit-os/docs/reports/2026-07-21-canonical-migration-manifest.md) |
| kb-handoff corpus | 3,058 migration objects: 2,787 raw primary records plus 271 public-use-boundary records. Raw objects were not automatically reviewed or published. | [Corpus index](https://github.com/regen-coordination/regen-toolkit/blob/regen-toolkit-os/kb-handoff/index.json) |
| toolkit-framework | Reusable methods, schemas, and implementation work operationalizing selected elements of the July architecture. The framework is designed to work independently of Org OS. | [Integration-branch framework](https://github.com/regen-coordination/regen-toolkit/tree/regen-toolkit-os/packages/toolkit-framework), [Org OS framework package](https://github.com/regen-coordination/org-os-template/tree/main/packages/toolkit-framework) |
| org-os-kms | Integration that connects toolkit-framework to Org OS; distinct from the framework and the original research packet. | [Org OS KMS package](https://github.com/regen-coordination/org-os-template/tree/main/packages/org-os-kms) |
| regen-toolkit-os | A long-lived Toolkit integration branch with July lineage and later experimentation. It is not simply an archive or a replacement for the Toolkit's public main branch. | [Integration branch](https://github.com/regen-coordination/regen-toolkit/tree/regen-toolkit-os), [September handoff](https://github.com/regen-coordination/regen-toolkit/blob/regen-toolkit-os/docs/plans/2026-09-18-org-os-kms-atproto-plane-closeout-handoff.md) |

Framework development and processing of Regen Toolkit content were already underway before the July 14, 2026 research handoff arrived. The original Toolkit content produced 722 derived objects, while the subsequent July research migration produced a separate corpus of 3,058 review-gated objects. These are distinct technical outputs, not one fully reviewed or published knowledge registry. Later V1 ingestion, Geo tooling, and Org OS/KMS work developed along partly separate paths. These approaches can be compared and linked without prematurely choosing one canonical model.

- [Ingestion and review pilot](https://github.com/regen-coordination/knowledge-commons/pull/4) - open implementation work, alongside [review-object changes](https://github.com/regen-coordination/knowledge-commons/pull/7) and [corrections](https://github.com/regen-coordination/knowledge-commons/pull/8).

- [KMS implementation proposal](https://github.com/regen-coordination/knowledge-commons/blob/proposal/org-os-kms-instance/kms/README.md) - a distinct proposal for group consideration; publication is disabled in its proposal configuration.

- [Geo documentation](geo/README.md) and [adapted tooling provenance](../.agents/UPSTREAM.md) - merged documentation and tools, with upstream credit.

## A few relevant frameworks and peer commons

These are selective orientation links, not a complete Source Systems catalog.

| Relationship | Reference | Why it is linked |
| --- | --- | --- |
| Enabling organizational framework | [Org OS framework](https://github.com/regen-coordination/org-os-template) | Related reusable framework and knowledge-management tooling. |
| Structural-integrity review lens | [Coordination Structural Integrity Suite](https://github.com/coordination-structural-integrity-suite/suite) | A source of methods and tools that can inform review; use does not imply formal assessment or conformance. |
| Geo tooling lineage | [Upstream adaptations](../.agents/UPSTREAM.md) | Exact source projects and adaptation record for the tools in this repository. |
| Review methods used in discussion | [Human review on PR #5](https://github.com/regen-coordination/knowledge-commons/pull/5) | Context for ORE/STRUCK-informed review of pilot material; comments do not equal acceptance. |
| Peer commons | [SuperBenefit Knowledge Base](https://github.com/superbenefit/knowledge-base) and [Knowledge Garden](https://knowledge.superbenefit.org/) | Examples of related knowledge stewardship and open documentation practices. |

ReFi DAO Knowledge Commons is another relevant peer. Add a direct public entry link once the maintainers confirm the correct location and sharing status. Other Source Systems and peer projects should be mapped through the Garden rather than duplicated here as an ever-growing manual directory.

## How to use this map

- To learn or teach practical material, start with [Regen Toolkit](https://github.com/regen-coordination/regen-toolkit).

- To explore Regen-specific relationships and sources, start with the [Garden](regen-knowledge-garden.md).

- To inspect Geo skills, queries, and publishing rules, start with [Geo documentation](geo/README.md).

- To understand organizational coordination and memory, start with [Regen Coordination OS](https://github.com/regen-coordination/regen-coordination-os).

- To review the current ingestion or KMS experiments, follow their branch and PR links above; neither is represented as the final architecture.

- To trace how the July research was used, follow the dated integration and migration records, then consult the original packet through its steward.

Keep this map small. Add a link when it materially helps readers find, understand, or build the work; put broader ecosystem discovery in the Garden.
