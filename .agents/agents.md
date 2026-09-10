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
| look up / search / inspect / query the graph; gap-discovery pass | **geo-read** skill |
| publish / create / update / delete; clean, merge, dedupe; descriptions; banners | **geo-write** skill |
| research/enrich an entity with cited web sources (read-only drafts) | **geo-research** agent |
| turn "I want to X" into plan → script → dry-run → confirm → publish | **geo-curate** agent |
| modelling advice — type vs property vs relation, drift | **geo-ontology** agent |
| file the end-of-day daily update | **daily-report** task |
| review / lint a skill before shipping | **skill-quality-check** skill |

Geo hard rules in short (full list in `docs/geo/operations.md`): never write to
Geo by hand; deletion is the red line; never fabricate IDs; the Knowledge
Commons is a DAO space — propose → vote → execute; no type-structure writes;
never handle the private key; verify after publishing. The shared Geo toolkit is
`.agents/scripts/geo/`.

*(Other utilities, when the commons adopts them, get their own scoped section
here and their own skills/agents — they don't expand this one.)*
