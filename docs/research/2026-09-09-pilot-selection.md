# First Hub topics and model comparison

**Current pilot:** OpenAI/Luna is verified. Topic 356 is the selected next demo and has completed a four-post capture, extraction, assessment and automatic report PR. The approved cumulative allowance is $7; four-model comparison remains deferred. See the [current handoff](../runbooks/pre-cloudflare-handoff.md). The research proposal below is historical context.

9 September 2026 · Proposed pilot, ready for review

**Start with three threads: the Local ReFi Toolkit introduction, ReFi Colombia’s grant update, and the commitment-pooling proposal.** Together they test useful discovery, evidence-backed reporting, and restraint when work is still proposed. Add Tech & Sun for updates across posts; reserve Kansas City for evaluation after the first prompt revision.

The first collection should answer: **“How are regenerative communities organizing and funding local work, and what can I learn from their experience?”** Here, an organizer means someone running a chapter, local node, community project, or shared initiative. Their jobs include finding an applicable approach, understanding prerequisites, identifying collaborators, and checking what has actually happened. This is a proposed audience focus, not an eligibility rule for contributors.

## Recommended source manifest

| Order | Thread | Useful first object | What the comparison must catch |
|---|---|---|---|
| 1 | [Introducing the Local ReFi Toolkit + Funding Pool · 235](https://hub.regencoordination.xyz/t/introducing-the-local-refi-toolkit-funding-pool/235) | Article explaining the toolkit and its contribution route | The post describes drafts and a historical funding offer. Do not present linked playbooks as completed or the pool as currently open without checking. |
| 2 | [ReFi Colombia - Grant Update · 403](https://hub.regencoordination.xyz/t/refi-colombia-grant-update/403) | Article with bounded Claims; candidate CaseStudy after its schema is enabled | Separate reported results from targets and planned activities. Preserve attribution; linked dashboards and attendance records need their own inspection. |
| 3 | [Proposal to Develop a Commitment Pooling Playbook for Regen Coordination Network · 356](https://hub.regencoordination.xyz/t/proposal-to-develop-a-commitment-pooling-playbook-for-regen-coordination-network/356) | Article about a proposal, with Sources | Do not invent a finished Playbook. Replies raise changing technology and future updates; a linked document is not evidence until fetched. |
| 4 | [Tech & Sun Round by Greenpill Nigeria · 393](https://hub.regencoordination.xyz/t/tech-sun-round-by-greenpill-nigeria/393) | Article or candidate CaseStudy with a dated progress account | Keep initial plans separate from later construction reports. “Ready for activation” does not establish sustained operation or measured energy reliability. |
| 5 | [Piloting a Kansas City Local Currency Program for Economic Development · 379](https://hub.regencoordination.xyz/t/piloting-a-kansas-city-local-currency-program-for-economic-development/379) | Evaluation holdout: Article about a developing initiative | Distinguish plans, collaborator interest, and a reported tool release from deployment of the currency program. Do not merge organizations because they discuss collaboration. |

These are editorial recommendations based on the readable public posts, not model benchmark results or an endorsement of project claims. The page snapshots were inspected on September 9, but some were crawled months earlier. In particular, the Kansas City category listing advertises more replies than the rendered topic snapshot exposes. A fresh, complete capture is required before scoring that thread. This is a useful ingestion completeness test.

Keep [GEN Ukraine — Localism Fund Implementation Report · 412](https://hub.regencoordination.xyz/t/gen-ukraine-localism-fund-implementation-report/412) in reserve: the category listing is visible, but its body could not be retrieved in this research. Do not select it on the strength of its title alone. The onboarding topic “Starting a ReFi Local Node in Your Community” is another promising reserve whose body needs retrieval.

## Capture boundaries

Select these five native topic IDs explicitly. Do not recursively ingest their categories, related-topic recommendations, user profiles, or entire linked websites. The selected topics span Projects & Partnerships and Localism Fund; they do not represent the whole Hub or every partner community.

For the first comparison, freeze the complete readable thread text, including replies and post dates, as depth 0. Then run a separately labelled enrichment pass with up to three explicitly selected supporting pages per topic at depth 1. Default limits: 20 posts, 5 MB fetched text per topic, and no depth 2 traversal. If a limit truncates evidence, mark the capture incomplete and split or revise the bound before evaluating; never silently score a truncated source as complete. These limits are starting operational choices, not Discourse limits.

Record native post IDs and post numbers separately, retrieval time, source update time, capture digest, missing posts, redirects, and linked-source access outcomes. Use private artifact storage for full captures; commit only review-safe report material. A public URL does not establish unrestricted reuse rights.

## Four affordable comparison candidates

| Model ID | Role to test | USD per million input / output tokens | Scenario per topic |
|---|---|---:|---:|
| `gpt-5.6-luna` | Cheapest extraction baseline | $0.20 / $1.20 | $0.0044 |
| `gemini-3.5-flash-lite` | Low-cost comparison from another provider | $0.30 / $2.50 | $0.0080 |
| `claude-sonnet-5` | Stronger cross-provider candidate for careful synthesis | $2.00 / $10.00 | $0.0400 |
| `gpt-5.6-terra` | Stronger comparison within the OpenAI family | $2.00 / $12.00 | $0.0440 |

Rates checked September 9 against [OpenAI pricing](https://developers.openai.com/api/docs/pricing), [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing), and [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing). Roles are hypotheses to test. Provider availability for this project has not been verified.

The scenario assumes 10,000 uncached input and 2,000 total billed output tokens at standard short-context paid rates, without tools, retries, cache writes, or additional reasoning tokens. Identical text has different token counts across providers. All four total **$0.0964 per topic per pass**; five topics with three passes total **$1.446** under these assumptions. This is arithmetic, not a spending quote. Track actual billed usage, including reasoning, failures, and repairs. Begin with a proposed $10 evaluation cap enforced by the runner, rather than relying on this estimate.

Use the same captured evidence, task instructions, ontology revision, and output contract. Record provider-specific settings rather than forcing identical unsupported parameters. For example, [Sonnet 5](https://platform.claude.com/docs/en/models/sonnet-5/overview) defaults to adaptive thinking and rejects non-default sampling parameters; a universal `temperature: 0` setting would be incorrect. Pin snapshots where documented; otherwise log the requested and returned identifiers and date.

## Comparison method

1. Two people independently label expected claims, source references, class choices, and appropriate abstentions; reconcile disagreements before treating labels as evaluation targets. Afo owns the ontology pin; that does not automatically make Afo both reviewers.
2. Develop the first prompt using topics 235, 403, and 356. Use 393 as a validation topic and 379 as a held-out topic after a fresh complete capture. The holdout is excluded from prompt tuning, not claimed to be unknown to the research team.
3. Run all four models once, then repeat the fixed configuration three times for the comparison batch. Retain failed attempts. Any prompt, evidence, or schema change creates a new batch; do not pool incompatible scores.
4. Review outputs with model names hidden where practical. Record unsupported factual claims, missing material facts, invalid evidence references, wrong class choices, false merges, and useful abstentions. Measure human correction minutes, latency, and actual cost.
5. Select the lowest-cost model that meets the evidence gates without increasing correction work materially. Model agreement is not corroboration. With five topics, report counts and examples; do not claim statistical superiority.

Every evaluated thread gets a [Markdown ingestion report](../../reports/ingestion/README.md), with separate model results and Integrity review. The current [source-selection example](../../reports/ingestion/356-commitment-pooling/2026-09-09-source-review.md) shows the format with unrun fields explicitly marked. No paid comparison has been run.

## What this unlocks

The first milestone is a small set of comprehensible reports, a calibrated rubric, and the [ontology candidate](../ontology/v1-candidate.md) ready for Afo’s pin. Next, implement the first supported object through Geo and onto the Knowledge Commons website. The pre-Geo reports let the team improve ingestion before depending on that integration; they do not authorize publication by themselves.
