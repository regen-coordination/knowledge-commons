# The craft of knowledge commoning

> Companion to [`mission.md`](./mission.md). The mission records the project's
> intent (owner-settled, distilled from the master doc); this page records the
> **craft**: what the knowledge-commons literature says a living commons
> requires, and how the Geo practice already expresses it. External references
> are input to the craft layer, **not an ontology to conform to** — the live
> space ([`ontology.md`](./ontology.md)) and the owner's intent remain the
> source of truth, and nothing here proposes changes to the space.

## What makes something a knowledge commons

Assembled from the references (Bollier; Hess & Ostrom; Grant; Gyuris):

- **A commons is** "a resource plus a defined community and the protocols,
  values and norms devised by the community to manage its resources"
  (Bollier).
- **A knowledge commons is that, for non-rivalrous knowledge**: the knowledge
  aspect of a **community of practice** — people who *use* the knowledge they
  curate — shared outward with a surrounding **community of interest**
  (Grant). A commons is governed by its users, not a remote authority
  (Ostrom).
- **Open ≠ commons.** An open repository serves a community of interest; the
  commons requires the community and governance layers too. The mission's
  "inclusion ≠ endorsement" and "peers, not link pools" draw the same line:
  a pool of accessible material is not yet a commons.
- **Information ≠ knowledge.** Gyuris: information only becomes a shared
  resource through "a complex set of institutions and practices" that let
  recipients internalize it. That is what review states, verification gates,
  and curation discipline are for — accessibility alone is not the commons.

Because knowledge is non-subtractible, supply is never the problem —
**attention, maintenance, and trust are**. The real design problems of a
knowledge commons are governance (who decides), resourcing (who maintains),
and integrity (what to trust).

## Craft principles → how the Geo practice expresses them

| Craft principle (from the literature) | Geo / repo practice | Where |
| --- | --- | --- |
| Governed by its users, not a remote authority (Ostrom) | The Knowledge Commons is a **DAO space**: every project write is a proposal → vote → execute | [`publishing.md`](./publishing.md) |
| **Link, don't copy.** Forking a well-governed commons makes the whole scene worse — copies drift, contradict, and split attention (Grant) | One canonical entity per thing: semantic-duplicate check before every publish; duplicates are **merged** back (via geo-write), never left as parallel forks | [`publishing.md`](./publishing.md), [`operations.md`](./operations.md) |
| Small, controlled type vocabulary; agree explicitly when a term is a mere concept vs something structured | 18 owner-curated types + the **minimum ontology rule** (add a type only when it changes routing/behavior); reuse-first advice in the geo-ontology agent | [`ontology.md`](./ontology.md), [`mission.md`](./mission.md) |
| Represent generic knowledge (types) and specific knowledge (instances) | Root types carry shared metadata; instances are typed; the space is foundational — other spaces extend the ontology and populate it | [`ontology.md`](./ontology.md) |
| **Patterns are nouns** (recurring structures; guidelines, not rules) **; practices are verbs** (enacted, transmitted through culture) — Grant, after *Patterns of Commoning* | `Pattern` (observed recurring structure) vs `Protocol` / `Playbook` (codified ways of acting); the mission's non-negotiable distinctions (`option≠deployment`, `claim≠evidence`, `AI-assisted≠human-reviewed`) are the same discipline | [`ontology.md`](./ontology.md), [`mission.md`](./mission.md) |
| **Not everything deserves its own page**: dates, point locations, and actions/transactions are properties and records, not entities (Grant) | Typed-value **properties** on entities; the onchain edit log is the tamper-evident record of actions; no per-date or per-transaction entities | [`publishing.md`](./publishing.md) |
| Provenance and versioning: stable identity, content-addressed history, "as it was at this time" | GRC-20 writes are immutable, content-addressed (IPFS) and onchain — every edit is auditable; this repo keeps its own extraction/provenance record | [`publishing.md`](./publishing.md), [`extraction.md`](./extraction.md) |
| **The use test**: it is only a commons if the people curating the knowledge also use it (Grant) | The mission's first practical test — can a real person arrive with their context and leave with clarity and a next step? | [`mission.md`](./mission.md) |
| Stewardship, not extraction: care and intrinsic worth, not only use value | The `Environment` type framing ("the living systems… that sustain"); the mission's regeneration claim boundary | [`ontology.md`](./ontology.md), [`mission.md`](./mission.md) |
| Quality gates are commons infrastructure — "published" ≠ "correct" | The safeguarded pipeline (validate → dedup → dry-run → confirm → verify); each gate exists because a real incident bypassed it | [`publishing.md`](./publishing.md) |
| Curated questions mark the growing edge — promote *shared, generative* questions; don't flood with personal ones (Grant) | No `Question` type yet; today gaps surface as geo-read discovery **findings** rather than durable commons entities — owner's call, not a repo action | §Gaps below |

The alignment is not a coincidence: the upstream toolkit
([geo-explorers/content-management](https://github.com/geo-explorers/content-management))
was built around governance-by-default ("every write to Geo is a proposal
that goes through space governance") and dry-run gating, which are commons
practice in protocol form.

## Reading the 18 types through the craft lens (non-binding)

A mapping to Grant's proposed page kinds, for orientation only. The live
space is the source of truth; this table proposes **no changes**.

| Grant's page kind | Closest commons types |
| --- | --- |
| Resource (natural / artefact / immaterial) | `Resource` (root) → `Knowledge`, `Article`, `Tool`, `Organization` |
| Concept | `Topic` (and the type system itself) |
| Person / Group | `Person`, `Organization`, `Agent` (root), `Network` |
| Place | `Bioregion`, `Environment` (root) |
| Gathering | `Event` |
| Story | `Article` / `Knowledge` (no dedicated story type — deliberate) |
| Pattern / Practice | `Pattern` / `Protocol`, `Playbook` |
| Question | — (absent; see gaps) |

The deliberate divergences are owner-settled and stay as they are: a single
`Knowledge` type rather than concept/story splits, `Topic` as the flexible
concept layer, hierarchy via meta-typing rather than categories-as-pages.

## Gaps the craft literature suggests (owner's call — not open decisions)

- **Questions as first-class entities.** Grant gives shared, generative
  questions their own pages as "the growing edge of knowledge," with a
  promotion path (individual comment → question on the page → its own page).
  Today gaps live in skill outputs, not on the graph. If the owner ever wants
  this, a single `Question` type plus promotion discipline would carry it;
  nothing in this repo should act on it.
- **Perspective and commentary.** Grant's commentary section (registered
  contributors, visible plurality of views, questions without forcing them
  into the article body) has no direct Geo equivalent; Claim/Evidence plus
  review states cover part of the need.
- **Resourcing.** The literature is blunt: an ungoverned or unfunded
  maintenance layer is how knowledge commons die — wiki rot, splinter copies,
  abandoned pages. The mission's "AI-assisted but human-governed" model needs
  a deliberately resourced curation practice to outlive individual
  enthusiasm.

## Sources

- [Wikipedia: Knowledge commons](https://en.wikipedia.org/wiki/Knowledge_commons) — non-subtractibility; Hess & Ostrom's two intellectual histories; Gyuris on information vs knowledge; copyleft as commons-supporting institution
- [Simon Grant: What IS a knowledge commons? (2023-09-09)](https://wiki.simongrant.org/doku.php/d:2023-09-09) — community of practice vs interest; the use test; linking vs copying; forking makes well-governed commons worse
- [Simon Grant: Requirements for a wiki supporting a living knowledge commons](https://wiki.simongrant.org/doku.php/wiki:requirements-commons) — page-class vocabulary, semantic links, metadata separation, versioning APIs
- [Simon Grant: Types of knowledge commons wiki pages (2025-10-20)](https://wiki.simongrant.org/doku.php/d:2025-10-20) — page kinds; Bollier's definition; what does not merit its own page
- [Simon Grant: Inside a knowledge commons wiki page (2025-10-21)](https://wiki.simongrant.org/doku.php/d:2025-10-21) — lead sections, commentary, questions-arising, page-structure craft
- [Simon Grant: Comparing and refining types (2025-11-04)](https://wiki.simongrant.org/doku.php/d:2025-11-04) — patterns vs practices; Ostrom's principles as a pattern set
- [geo-explorers/content-management](https://github.com/geo-explorers/content-management) — upstream of this repo's safeguarded toolkit; governance-by-default publishing
