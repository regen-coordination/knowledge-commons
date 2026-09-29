# V1 architecture: decisions and next proof

8 September 2026 · Revised September 9 with Afo’s decisions

**Build toward the live Knowledge Commons website, starting with readable ingestion reports and a four-model comparison.** The proposed path remains Hub → validated candidate → two affirmative human approvals → Geo execution → R2 release → website. The [full proposal](2026-09-08-v1-architecture.md) preserves the technical research and its limits.

## What is settled

Use four packages: `ontology`, `pipeline`, `agent`, and `web`. `agent` is the Hono runtime package; root `agent/skills` holds development and contribution guidance. Keep a shared Knowledge Object metadata base with class-specific schemas. Afo owns the ontology pin.

Knowledge promotion requires two distinct affirmative human approvals of the exact revision and scope. The agent never votes. Pre-Geo reports record rehearsal decisions without presenting them as Geo votes. Once using Geo, verify actual governance and execution evidence; quorum 2 alone does not establish two YES votes. ([Inspected contract](https://github.com/geobrowser/geo-contracts-foundry/blob/f3af617985d70ab8cf62018060e19c0ab5fcd660/src/contracts/DAOSpace.sol))

Full v1 means a functional, live Knowledge Commons website and a demonstrated ingestion, review, calibration, publication, correction, and recovery flow. Greenpill and ReFi integrations move to follow-up work. A 3D graph is also a follow-up recommendation; readable discovery and provenance come first. This revises older project scope; Linear and Miro have not been changed.

## Where to start

The [pilot shortlist](2026-09-09-pilot-selection.md) recommends:

1. **Local ReFi Toolkit + Funding Pool:** useful introduction; test historical offers and draft resources.
2. **ReFi Colombia grant update:** distinguish reported results, targets, and planned activities.
3. **Commitment-pooling playbook proposal:** test whether models avoid inventing a finished guide.
4. **Tech & Sun, Greenpill Nigeria:** follow progress across dated posts.
5. **Kansas City local currency:** reserve for evaluation after obtaining a complete current capture.

“Organizer” means someone coordinating a chapter, node, community project, or shared initiative. Their practical questions are: What can we try? Under what conditions? Who has done it? What evidence supports the account? This is a proposed first reader focus, not a contribution restriction.

Compare **GPT-5.6 Luna, Gemini 3.5 Flash-Lite, Claude Sonnet 5, and GPT-5.6 Terra**. Current rates imply $0.0964 for all four per topic at 10,000 input and 2,000 billed output tokens each. Five topics with three passes would be $1.446 under that artificial scenario; reasoning, retries, source size, and different tokenization change the actual bill. Select using evidence errors, correction time, and measured cost. No comparison has run. ([OpenAI pricing](https://developers.openai.com/api/docs/pricing), [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing), [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing))

## Review artifacts now in the repo

The [ingestion report folder](../../reports/ingestion/README.md) has a template and a clearly labelled source-review example. Each run will show its conclusion, candidate objects, evidence limits, per-model results, Integrity review, and two human decisions. The draft Commons Integrity profile scores five dimensions; it is not an official Suite aggregate or conformance certification. Missing assessments stay missing, and no score automatically approves knowledge.

The [ontology candidate](../ontology/v1-candidate.md) proposes eleven variants, concrete shared metadata, predicate directions, and fixtures. It resolves Claim/Evidence as Claim with typed evidence records and gives Playbook its own validation variant. It is ready for review, not yet pinned.

[Repo skills](../../AGENTS.md) cover architecture, ontology change, Hub intake, and publication/recovery. Matt Pocock’s `codebase-design` is vendored at a fixed commit with its license. These are readable repo files; native harness discovery has not been configured.

## Geo credentials and the next proof

The SDK’s demonstrated path builds operations, uploads an edit/prepares transaction data, then uses a wallet client to submit. An API key may authenticate a hosted service, but an API-key-only route that also handles the required proposal/signing behavior is not verified. Confirm that service’s scope and identity if available; keep it behind our adapter. ([Geo SDK](https://github.com/geobrowser/geo-sdk/blob/2e76b9fb56d684b6500c49a32136e010a792dc69/README.md))

The next implementation starts with complete source captures and ontology fixtures, then the four-model report runner. In parallel within the work plan, verify Geo access and two-human governance. After Afo pins the ontology and two content reviewers are assigned, take one supported object through the entire path onto the owned website. Pre-Geo reports and previews are intermediate milestones; they do not prove Geo publication works.
