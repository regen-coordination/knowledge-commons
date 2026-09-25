# MD file manifest — Regen Knowledge Commons

// Provenance: adapted from geo-explorers/content-management
// Source: agents/MD-FILES.md
// Pinned SHA: 6191c3dd8233e59b85093cef3d1982f728154bc1
// Date: 2026-09-23

Every Markdown file in this repository: what it contains, who reads it, and
when it is loaded.

**The repository is the canonical source.** Where a Notion row and a file
disagree, the file wins.

## 1. Entry points — read first

| File | Contents | Read by | Trigger |
|---|---|---|---|
| `.agents/agents.md` | Repo guidelines + Geo routing table + skill tier guidance | Every agent | On routing |
| `docs/geo/README.md` | Geo orientation: what the commons is, how to use it, official sources | Humans + agents | On routing |

## 2. Agent contracts — `.agents/agents/`

| File | Contents | Read by | Trigger |
|---|---|---|---|
| `.agents/agents/geo-research/agent.md` | Research agent: research a question under the trusted-sources allowlist and return a cited draft | Loaded as an agent | On routing |
| `.agents/agents/geo-mirror-refresh/agent.md` | Mirror-refresh agent: refresh Notion mirrors or mirror a space into a Notion page | Loaded as an agent | On routing |
| `.agents/agents/geo-agent/agent.md` | Generic Geo agent: works any Geo task end to end up to the dry-run | Loaded as an agent | On routing |
| `.agents/agents/geo-task/agent.md` | Planning agent: prepares a Geo-work task up to but not including execution | Loaded as an agent | On routing |
| `.agents/agents/geo-curate/agent.md` | Curation agent: plan → script → dry-run → confirm → publish | Loaded as an agent | On routing |
| `.agents/agents/geo-ontology/agent.md` | Ontology agent: modelling advice — type vs property vs relation | Loaded as an agent | On routing |

## 3. Skills — `.agents/skills/`

Each skill is one `SKILL.md` with YAML frontmatter (`name`, `version`,
`description`).

| Skill | Version | Contents | Key needed |
|---|---|---|---|
| `.agents/skills/non-actionable/geo-read/SKILL.md` | 0.2.9 | Query the graph over GraphQL: lookups, type/space scoping, relations, schema discovery, performance rules, canonical space IDs | no |
| `.agents/skills/non-actionable/skill-quality-check/SKILL.md` | — | Skill-authoring standard + linter | no |
| `.agents/skills/actionable/geo-write/SKILL.md` | 0.11.0 | Create, update and delete entities and relations. Mandatory gates and two-phase dry-run → publish | **yes** |
| `.agents/skills/actionable/geo-mirror/SKILL.md` | 0.12.0 | Geo ⇄ Notion. Part 1 mirrors any entity type into Notion; Part 2 publishes changes back from any table with a `Geo ID` column | **yes** (Part 2) |

## 4. Skill references — `.agents/skills/`

Paths are repo-relative, so each row resolves from the repository root.

| File | Skill | Contents |
|---|---|---|
| `.agents/skills/non-actionable/geo-read/references/querying.md` | geo-read | GraphQL grammar, core queries, performance patterns, well-known IDs |
| `.agents/skills/non-actionable/geo-read/references/discovery.md` | geo-read | 6-stage gap-discovery procedure, guardrails, press source-discovery |
| `.agents/skills/non-actionable/geo-read/references/discovery-schema.md` | geo-read | Gap-finding ontology schema |
| `.agents/skills/non-actionable/geo-read/references/drafting-conventions.md` | geo-read | Discovery output drafting conventions |
| `.agents/skills/non-actionable/geo-read/references/ner_prompt.md` | geo-read | NER extraction prompt |
| `.agents/skills/actionable/geo-write/references/publishing.md` | geo-write | Publishing mechanics, DAO propose→vote, SDK gotchas |
| `.agents/skills/actionable/geo-write/references/cleaning.md` | geo-write | Clean operations: merge, delete, move, fix data types |
| `.agents/skills/actionable/geo-write/references/cleaning-reference.md` | geo-write | Extended cleaning reference |
| `.agents/skills/actionable/geo-write/references/describing.md` | geo-write | Entity description procedures |
| `.agents/skills/actionable/geo-write/references/description-rules.md` | geo-write | Description authoring rules |
| `.agents/skills/actionable/geo-write/references/accuracy-verification.md` | geo-write | Accuracy and closeness checks |
| `.agents/skills/actionable/geo-write/references/closeness-and-accuracy-checks.md` | geo-write | Closeness and accuracy verification |
| `.agents/skills/actionable/geo-write/references/copyright-and-licensing.md` | geo-write | Copyright and licensing rules |
| `.agents/skills/actionable/geo-write/references/banner-recompose.md` | geo-write | Banner image recompose procedures |
| `.agents/skills/actionable/geo-write/references/big-merge.md` | geo-write | Large merge operations |
| `.agents/skills/actionable/geo-write/references/stage6-publish.md` | geo-write | DAO publish mechanics for gap findings (uses geo-write primitives) |
| `.agents/skills/non-actionable/skill-quality-check/references/skill-quality-standard.md` | skill-quality-check | Agent Skill authoring standard |

## 5. Agent references — `.agents/agents/*/references/`

| File | Agent | Contents |
|---|---|---|
| `.agents/agents/geo-curate/references/orchestration.md` | geo-curate | 5-step orchestrator algorithm, Discovery + Gates + Plan template |
| `.agents/agents/geo-ontology/references/ONTOLOGY.md` | geo-ontology | Modelling reference: type vs property vs relation |
| `.agents/agents/geo-ontology/references/README.md` | geo-ontology | Ontology agent orientation |
| `.agents/agents/geo-research/references/research-agent-source-policy.md` | geo-research | Trusted-sources policy |
| `.agents/agents/geo-research/references/research-agent-allowlist.md` | geo-research | Source allowlist |
| `.agents/agents/geo-research/references/research-agent-mvp.md` | geo-research | MVP research agent spec |

## 6. Toolkit docs — `.agents/scripts/geo/`

| File | Contents |
|---|---|
| `.agents/scripts/geo/README.md` | Toolkit orientation + SDK pin |
| `.agents/scripts/geo/curator-courses/README.md` | Curator course reference patterns |

## 7. Task docs — `.agents/tasks/`

| File | Contents |
|---|---|
| `.agents/tasks/daily-report/task.md` | End-of-day daily update task |

## 8. Operating docs — `docs/geo/`

| File | Contents |
|---|---|
| `docs/geo/operations.md` | Skill routing & hard rules for Geo work |
| `docs/geo/setup.md` | Human-only setup: wallet key, Notion token, network allowlist |
| `docs/geo/agent-workflow.md` | Operating contract: task lifecycle, hard rules, upstream references |
| `docs/geo/md-files.md` | This manifest |
| `docs/geo/querying.md` | GraphQL querying guide (conceptual background) |
| `docs/geo/publishing.md` | Publishing mechanics and governance (conceptual background) |
| `docs/geo/ontology.md` | Live-space mirror — commons ontology (owner-curated) |
| `docs/geo/extraction.md` | Import audit trail + upstream lineage tracking |
| `docs/geo/plan.md` | Owner-review work list (record) |
| `docs/geo/commoning.md` | Commoning craft notes |
| `docs/geo/mission.md` | Mission/scope synthesis |

## 9. Repo root

| File | Contents |
|---|---|
| `README.md` | Repository orientation |
| `.agents/agents.md` | Repo guidelines + Geo routing table + skill tier guidance |
| `.agents/system-prompt.md` | Working persona for agents in this repo |
| `.agents/UPSTREAM.md` | Upstream lineage tracking |
