# Pilot architecture and authority

9 September 2026 · User decisions recorded; technical implementation proposed

The pilot needs to turn a small set of Hub discussions into knowledge people can inspect and use on the Knowledge Commons website. The team must learn from actual ingestion reports before relying on automated filtering or a broad Geo rollout.

## Decisions confirmed by Afo

- Name the four proposed packages `ontology`, `pipeline`, `agent`, and `web`; use `agent` instead of `api` for the runtime package.
- Afo owns the ontology pin. Use a shared Knowledge Object metadata base and class-specific schemas.
- Require two distinct affirmative human approvals of the reviewed content. Model assessments cannot supply those approvals.
- Keep readable per-thread ingestion reports in the repo, including Integrity review and model comparisons before full Geo integration.
- The v1 finish line is the functional, live Knowledge Commons website with a demonstrated and calibrated source-to-surface flow. Partner websites are follow-up integrations.

## Recommended implementation

Use Hono with Cloudflare Workflows for bounded ingestion and publication jobs. Keep domain operations in `pipeline` and shared semantics in `ontology`; `agent` handles HTTP, bindings, and durable orchestration. `web` consumes public release contracts. This makes validation reusable without coupling source interpretation to Hono or the website to transaction signing.

Geo remains the proposed accepted-knowledge authority, with immutable R2 releases for the website. Repo reports are calibration and review records, not an alternative accepted-content database. Start calibration before Geo integration is ready; label rehearsal approvals separately from Geo governance evidence.

Compare Luna, Gemini Flash-Lite, Sonnet, and Terra on the same frozen evidence. Choose from measured evidence errors, human correction effort, and actual cost. The [comparison plan](../research/2026-09-09-pilot-selection.md) owns changing model and source details.

## Alternatives and revisit triggers

Flue is worth revisiting when editors need to steer persistent conversations and maintaining that state becomes substantial work. The current jobs have bounded inputs and inspectable outputs, so a second orchestration framework adds little to the first proof.

A broad GitHub mirror would create competing accepted-content stores. Keep only review-safe reports in git and derive public content through the declared publication path. Revisit this only if the team explicitly changes the source-of-truth decision.

A separate package per provider or consumer would add coordination before independent release cycles exist. Introduce packages when actual ownership, release cadence, or reusable contracts justify them.

## Evidence still required

The [Prompt 1 foundation](0002-draft-validation-foundation.md) now implements a local Hono service and a draft executable Article/Source/Claim ontology. No model runner, Geo transaction, deployment, or website is implemented yet. Verify package/runtime compatibility, complete source capture, model access, ratified ontology fixtures, authenticated two-human approval semantics, and the live deployed release through the vertical proof. No API-key-only Geo publication route has been established by the inspected SDK.
