---
kind: agents
---

# Regen Commons — agent guidelines

Project instructions for any AI agent working in this repo (AGENTS.md-compatible
per the [.agents protocol](https://dotagentsprotocol.com); workspace layer).

## What this repo is

The canonical source of truth for the **Regen Knowledge Commons** — shared
knowledge infrastructure for regenerative coordination. The repo has two layers:

- **Docs layer** (`docs/`, root `README.md`) — high-level, human-facing: mission,
  commoning craft, plans, and the operating docs for the tools the commons runs on.
- **Agent layer** (`.agents/`) — procedural, machine-facing: agents, skills,
  tasks, and the executable toolkit.

The repo's content is broader than any one tool. **Geo** — a decentralized
knowledge-graph substrate (GRC-20) — is the utility the commons currently builds
on; it gets a scoped section below, not the whole file.

## .agents/ map

| Path | Contents |
| --- | --- |
| `agents.md` | this file — repo guidelines + orientation |
| `system-prompt.md` | working persona for agents in this repo |
| `mcp.json` | MCP server config |
| `memories/` | persistent memory entries |
| `agents/` | delegation agents (sub-agent profiles) |
| `skills/` | procedural skills (Anthropic `SKILL.md` format) |
| `tasks/` | repeatable / scheduled tasks |
| `scripts/` | executable toolkits shared by skills and agents |

Skill definition files are `SKILL.md` (Anthropic Agent Skills standard,
uppercase) — the .agents protocol maps Anthropic skills into `skills/*/skill.md`;
the naming difference is intentional and compatible. Agent and task definition
files use the protocol's lowercase `agent.md` / `task.md`.

Skill tiers (safety-critical distinction per upstream):
- **`skills/actionable/`** — skills that can change Geo: geo-write.
  These need the wallet key and run behind the two-phase dry-run → publish gate.
- **`skills/non-actionable/`** — read-only skills: geo-read, skill-quality-check.
  No key needed; safe to run anywhere.

Upstream lineage: `.agents/UPSTREAM.md`.

## General working conventions

- **Respect the layer split.** Procedural how-to content lives in `.agents/`;
  high-level context and rationale live in `docs/`. Link between the layers —
  never duplicate.
- **Don't rewrite history.** `docs/geo/extraction.md` and `docs/geo/plan.md` are
  records (import audit trail; owner-review work list). Their contents are
  provenance, not live references to update.
- **Ask when ambiguous.** If a request is ambiguous between skills, agents, or
  layers — ask; don't guess and improvise.
- **Human gates stay human.** Drafts, dry-runs, and reviews precede any
  irreversible action, wherever that action lands.

## Geo — knowledge-graph substrate (scoped)

The commons currently runs on **Geo** (GRC-20): a decentralized knowledge graph
with a GraphQL API for reads and an onchain propose/vote path for writes. All
Geo-specific routing, hard rules, and environment detail live in
**`docs/geo/operations.md`** — read it before acting on Geo. Orientation only:

| For Geo work, the user wants to… | Use |
| --- | --- |
| look up / search / inspect / query the graph; gap-discovery pass | **geo-read** skill (`.agents/skills/non-actionable/geo-read/`) |
| publish / create / update / delete; clean, merge, dedupe; descriptions; banners | **geo-write** skill (`.agents/skills/actionable/geo-write/`) |
| research/enrich an entity with cited web sources (read-only drafts) | **geo-research** agent (`.agents/agents/geo-research/`) |
| turn "I want to X" into plan → script → dry-run → confirm → publish | **geo-curate** agent (`.agents/agents/geo-curate/`) |
| modelling advice — type vs property vs relation, drift | **geo-ontology** agent (`.agents/agents/geo-ontology/`) |
| generic Geo task — lookups, audits, duplicates, "what needs doing" | **geo-agent** agent (`.agents/agents/geo-agent/`) |
| plan a Geo task up to but not including execution | **geo-task** agent (`.agents/agents/geo-task/`) |
| file the end-of-day daily update | **daily-report** task (`.agents/tasks/daily-report/`) |
| review / lint a skill before shipping | **skill-quality-check** skill (`.agents/skills/non-actionable/skill-quality-check/`) |

**Which skills to give whom:**
- Non-technical curators: **non-actionable only** (geo-read, skill-quality-check).
- Trained editors: **both tiers** with the key handoff (geo-write).
- Browser-only users: **read-only queries** with nothing installed.

**Reading order:** `agents.md` → `operations.md` → `setup.md`.

Geo hard rules in short (full list in `docs/geo/operations.md`): never write to
Geo by hand; deletion is the red line; never fabricate IDs; the Knowledge
Commons is a DAO space — propose → vote → execute; no type-structure writes;
never handle the private key; verify after publishing. The agent runs everything
up to the dry-run and stops there; the human types the publish. The shared Geo
toolkit is `.agents/scripts/geo/`.

*(Other utilities, when the commons adopts them, get their own scoped section
here and their own skills/agents — they don't expand this one.)*
