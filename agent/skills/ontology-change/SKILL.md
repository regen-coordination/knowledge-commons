---
name: ontology-change
description: Change or activate a Knowledge Commons class, predicate, shared metadata field, evidence rule, or Geo ontology mapping. Produce examples, compatibility analysis, and a reviewable ontology pin or migration.
---

# Ontology change

Read `docs/ontology/v1-candidate.md` and the active pin record when one exists. A candidate document is not an active pin. Afo is the pin owner.

1. Identify the competency question affected and whether the request changes meaning, shape, identity, or presentation only.
2. Give one supported example and one rejected near-miss from the pilot. Compose common Knowledge Object metadata with class-specific requirements; do not flatten everything into a generic property bag.
3. Change the canonical registry/schemas when implemented. Regenerate derived types, JSON Schema, agent context, reference docs, and Geo mappings from their actual source. Do not independently edit generated definitions.
4. Check endpoint types, evidence-selector resolution, cycles/inverses, duplicate identity handling, enabled classes, and old-version compatibility. Separate source IDs, stable object IDs, and revision hashes.
5. Describe migration and activation. Record the exact version/digest Afo has approved, using an existing decision if available. Never infer ratification from a request to draft or from a code merge. Geo mapping activation also needs the verified deployment path.

Output the semantic change, examples, compatibility effects, verified checks, and pin status. Reuse the ingestion report for empirical model errors instead of embedding transient scores in the ontology definition.
