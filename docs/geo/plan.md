# docs/geo — improvement plan

> **Draft for owner review, 2026-08-31.** This is a work list, not a
> strategy. Every item names a file, the exact change, and where the fact
> comes from. Facts about the Geo space were checked against the live
> testnet API today (queries in §D, re-runnable). Nothing here writes to the
> Geo space except item 4, which needs owner approval first.

## A. Done 2026-08-31

| File | Change | Why / source |
| --- | --- | --- |
| `commoning.md` | **New file.** Maps knowledge-commons principles to what the repo already does; lists gaps as owner decisions | Owner request: improve docs using the knowledge-commons references (sources at the bottom of `commoning.md`) |
| `README.md` | Added `commoning.md` and this plan to the doc tables; added a "Commons-craft sources" section | Same |
| `README.md`, `mission.md` | Fixed dead links: `EXTRACTION.md` → `extraction.md` (file is lowercase — checked with `ls docs/geo/`) | Repo fact |
| `README.md`, `operations.md`, `extraction.md` | Fixed dead paths: `docs/geo/research-agent/` does not exist; the files are at `.agents/agents/geo-research/` (checked with `ls`) | Repo fact |
| `publishing.md` | Added two sentences naming the DAO vote path as the commons' governance rule and the dedup gate as "one canonical entity, don't fork copies" | [Grant 2023-09-09](https://wiki.simongrant.org/doku.php/d:2023-09-09): forking a well-governed commons makes it worse |
| `mission.md`, `ontology.md`, `operations.md` | Cross-links to `commoning.md` | Navigation |

## B. Remaining fixes (verified defects)

> **All items below executed 2026-08-31.** Item 4's on-space write (fixing
> the Person description) remains **parked for owner approval**; only the
> `ontology.md` note was updated.

1. **`operations.md`, line 6** — the doc list includes `docs/geo/reference.md`,
   which does not exist (`ls docs/geo/` shows 8 files, none named
   `reference.md`).
   *Change:* drop `reference` from the list. ✅
2. **`README.md`, "Geo substrate reference" paragraph** — the same GRC-20
   spec URL is linked twice in two consecutive sentences (lines 54 and 59).
   *Change:* keep the first link, drop the duplicate. ✅
3. **`README.md`, publish quickstart code** — `spaceId` is used on lines
   108–109 but never declared, so the snippet cannot run as written.
   *Change:* add one declaration line above `publishEdit`, e.g.
   `const spaceId = "0000…"; // your personal space ID`. ✅
4. **`ontology.md`, line 49** — the Person note says the description "was the
   baseball fixture (re-verify)". Re-verified today by direct query: the live
   description is still *"A person in baseball history — player, manager,
   coach, umpire, or official scorer"* (query in §D).
   *Change:* update the note to the verified fact, dated. ✅ (doc note only)
   *Separate owner action:* fixing the description on the space itself is a
   write to a Type entity — owner approval required, executed through
   geo-publish (hard rule 6, `operations.md`). **Parked.**
5. **`extraction.md` (caveats) and `ontology.md` (line 107)** — both say
   testnet pagination is broken past the first page (dated 2026-08-28).
   Re-tested today: both paths work — `entitiesConnection` with an `after`
   cursor returns a correct second page, and `entities` with `offset: 3`
   returns the next three entities (queries in §D).
   *Change:* replace the caveat with the re-test result and date. ✅
6. **`README.md`, "Official sources"** — missing the GRC-20 serialization
   spec, <https://github.com/geobrowser/grc-20/blob/main/spec.md>, which the
   imported toolkit itself cites (recorded in `extraction.md`).
   *Change:* add the link to the list. ✅

## C. Improvements from the knowledge-commons references (remaining)

7. **`.agents/skills/geo-describe/`** — Grant's page-structure advice
   ([2025-10-21](https://wiki.simongrant.org/doku.php/d:2025-10-21)) says the
   first thing on any page should tell the reader whether they're in the
   right place, and disambiguate near-misses. Entity descriptions on Geo are
   the equivalent of a page's first line.
   *Change:* read the skill's current description rules; if there is no
   lead/orientation rule, add one. ✅ **Done 2026-08-31** — added rule 7
   ("disambiguate early") + quick-check box in
   `references/description-rules.md`, updated the Stage 5 rules summary in
   `SKILL.md` (v0.2.0 → 0.2.1). Local deviation from upstream recorded in
   `extraction.md`.
8. **Question type, commentary records, resourcing** — recorded as owner
   decisions in `commoning.md` §Gaps, from
   [Grant 2025-10-20](https://wiki.simongrant.org/doku.php/d:2025-10-20)
   (questions as first-class entities) and
   [2025-10-21](https://wiki.simongrant.org/doku.php/d:2025-10-21)
   (commentary). *No change* until the owner rules on them.

## D. How the facts in §B were checked (2026-08-31)

All against `https://api-testnet.geobrowser.io/graphql` — re-run any of them:

```bash
# 4. Person type description (still the baseball fixture)
curl -s --compressed 'https://api-testnet.geobrowser.io/graphql' \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ entity(id: \"7ed45f2bc48b419e8e4664d5ff680b0d\") { id name description } }"}'

# Type count in the space (18 — matches ontology.md)
curl -s --compressed 'https://api-testnet.geobrowser.io/graphql' \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ entitiesConnection(typeId: \"e7d737c536764c609fa16aa64a8c90ad\", spaceId: \"bd727a6ad6ec4a058f681ea9002a1fbf\") { totalCount } }"}'

# 5. Pagination, offset path (was "broken" per 2026-08-28 note — now works)
curl -s --compressed 'https://api-testnet.geobrowser.io/graphql' \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ entities(typeId: \"5ef5a5860f274d8e8f6c59ae5b3e89e2\", first: 3, offset: 3) { id name } }"}'
```

File existence (`reference.md`, `research-agent/`) checked with `ls` on the
working tree, 2026-08-31.

## Sources

- Live space facts: `https://api-testnet.geobrowser.io/graphql` (queries in §D, 2026-08-31)
- [GRC-20 Knowledge Graph spec](https://github.com/yanivtal/graph-improvement-proposals/blob/new-ops/grcs/0020-knowledge-graph.md) — data model
- [GRC-20 serialization spec](https://github.com/geobrowser/grc-20/blob/main/spec.md) — ops/edits encoding (item 6)
- [geo-sdk README](https://github.com/geobrowser/geo-sdk) — SDK API used by the quickstart (item 3)
- Knowledge-commons references: [Wikipedia](https://en.wikipedia.org/wiki/Knowledge_commons); [Grant 2023-09-09](https://wiki.simongrant.org/doku.php/d:2023-09-09); [requirements-commons](https://wiki.simongrant.org/doku.php/wiki:requirements-commons); [2025-10-20](https://wiki.simongrant.org/doku.php/d:2025-10-20); [2025-10-21](https://wiki.simongrant.org/doku.php/d:2025-10-21); [2025-11-04](https://wiki.simongrant.org/doku.php/d:2025-11-04); [geo-explorers/content-management](https://github.com/geo-explorers/content-management)
