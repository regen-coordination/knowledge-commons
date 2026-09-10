---
name: commons-architecture
description: Design or review Knowledge Commons package structure and implementation interfaces, including changes to ingestion, model adapters, ontology consumers, or publication. Use for concrete architecture and coding work; skip content-only reviews.
---

# Commons architecture

Read root `AGENTS.md`, the relevant design decision under `docs/architecture`, and [codebase-design](../codebase-design/SKILL.md). Matt Pocock’s module depth and interface vocabulary supplies the design method; project records supply domain meaning.

1. State the user-visible behavior and the smallest source-to-surface slice the change serves. Inspect affected code and call sites. If implementation does not yet exist, propose its interface; do not manufacture refactor findings.
2. Preserve `agent -> pipeline -> ontology`, with `web` using public contracts. Keep Hono transport and durable orchestration in `packages/agent`; keep root `agent/skills` as instruction content. Avoid a new package or framework for a single hypothetical caller.
3. Design one small interface that hides the actual complexity: capture completeness, validation, stable identity, evidence, or resumable publication. Use the deletion test. Introduce adapters where a real provider/runtime difference or test dependency exists; do not layer pass-through wrappers.
4. For consequential design choices, compare two plausible interface shapes against real callers, error outcomes, and revision/idempotency requirements. Work locally unless parallel design work is warranted and authorized by applicable instructions. Follow established user decisions without restarting their approval discussion.
5. Implement within the requested scope and test observable outcomes through the interface. Include relevant malformed evidence, retries, uncertain external effects, and unauthorized promotion cases. Do not replace a meaningful test with one that merely repeats implementation details.
6. Record a short design decision when it prevents future ambiguity: problem, chosen interface/ownership, rationale, rejected alternative, revisit trigger, and validation. Report actual commands and results; label planned checks as unrun.

Output a concrete design or change with files, behavior, and evidence. Use a diagram only when it makes dependencies or state transitions clearer. Do not create an architecture report or additional approval loop for every small edit.
