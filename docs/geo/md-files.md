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

## 4. Operating docs — `docs/geo/`

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
