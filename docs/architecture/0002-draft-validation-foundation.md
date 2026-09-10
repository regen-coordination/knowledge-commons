# Draft validation foundation

9 September 2026 · Executable pilot subset; unratified

The bootstrap lets an internal caller inspect the draft ontology and validate an Article, Source, and Claim against frozen passages. `ontology` owns strict Zod contracts, inferred TypeScript types, canonical digests, and the generated JSON Schema registry. `pipeline.validateDraft(input)` owns reference resolution and semantic checks. `agent` handles HTTP and authentication. The reserved `web` workspace exports only a public ontology type.

A single-object shape endpoint was considered, but it cannot detect missing posts, incorrect source revisions, or references to the wrong object class. The chosen interface accepts `{ objects, captures, evidence }` and returns either validated objects or issues with paths and codes. HTTP returns only validity and issues; raw captures remain private. No provider or storage adapter is needed until ingestion exists.

## Draft conventions and compatibility

The initial version is `0.1.0-draft.1`. There is no previous executable version to migrate and no active pin. Afo's ratification remains separate from implementation. Only Article, Source, and Claim are enabled. All other classes and domain predicates are absent; Geo mappings are null. Unknown fields and versions fail validation. Evolving these contracts requires a version change, examples, and compatibility review before activation.

The provisional language, audience, and topic enums are deliberately small and declared in the registry. Empty classification arrays and `und` language represent unclassified/unknown content. These terms are implementation proposals, not a ratified vocabulary. Capital lenses, extensions, additional languages, predicates, and Geo IDs require later definition.

Stable UUID object identity, semantic content digest, capture digest, and run identity remain separate. SHA-256 uses sorted JSON object keys, preserved array order, UTF-8, and no insignificant JSON whitespace. Captured text whitespace is preserved. Object hashing excludes `contentDigest` and later `assessmentRefs`; capture hashing excludes only `digest`. Evidence `sourceRevisionDigest` means the capture digest, not the Source object's content digest. A revision is a positive sequence number; `previousRevision` is the prior content digest, null only on creation. Historical predecessor existence cannot be checked without storage.

The envelope represents one revision per stable object ID. Duplicate IDs fail rather than merging. Source fields must match their capture. Capture completeness requires explicit `complete` status and exactly the expected unique native post IDs. This checks internal consistency; Prompt 2 must independently obtain the full post manifest from the source system. Digests detect modification, not source authenticity.

Evidence selectors use native post IDs and UTF-16 offsets (start inclusive, end exclusive) into frozen post text, plus an exact passage. They never resolve through display post numbers or fetched links. Base `evidenceRefs` resolve envelope evidence IDs; Claim `evidence` contains those same typed records and must agree exactly. Source refs resolve Source objects. Claim `observed` requires `direct-observation` basis; human review must still judge whether that basis is warranted. A synthetic proposal is accepted as an Article/planned Claim; a fabricated finished Playbook or self-report labelled observed is rejected.

Run and report contracts are initial shapes for Prompt 2, not an implemented state machine. Reports fix run/source/candidate digests and retain pending human review, unapproved status, and disabled publication. No approval or promotion operation exists.

## Pilot access

Only `GET /health` is public. Other routes require a bearer token in `Authorization`, using Hono's timing-safe comparison. Missing/invalid credentials return 401 when configured. Missing or malformed token configuration returns 503 and fails closed. The token must be at least 32 characters in bearer-token syntax; generate a random 32-byte value rather than choosing a password.

A shared token is sufficient for this bounded internal validation pilot. It provides no per-person identity and cannot authorize human approval votes. Prompt 2 must bind run ownership/idempotency to an authenticated caller; revisit this mechanism before introducing multiple independent callers or human reviews. Rotate the Worker secret to revoke access. HTTPS is required for deployed use. No login UI, request-body logging, or automatic publication is included.

Validation is bounded to 256 KiB per HTTP request, 100 objects, 20 captures, 200 evidence records, 500 posts per capture, and 20,000 characters per text field. Bigger inputs fail rather than being silently truncated. Readiness means the foundation can serve authenticated requests; it explicitly reports ingestion as unimplemented/unverified.

See the [deployment runbook](../runbooks/first-deployment.md) for verification. Revisit this interface when persisted captures, historical revisions, real source capture, or larger inputs become necessary.
