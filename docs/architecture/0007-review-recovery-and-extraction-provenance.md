# Recoverable review setup and bound extraction requests

The PR #4 review found failures in review initialization, extraction provenance, filename redaction and export membership. These corrections preserve the existing package ownership, spending ledger and human approval requirements.

## Recovery and request identity

Review initialization validates the frozen candidate and inserts the initial record through one function shared by execution and recovery. If an errored Workflow has no review row because an earlier storage read failed, the authenticated recovery route initializes it after storage recovers. It then uses the existing lease and three-restart limit. Retrying never replaces an existing assessment or delivery record. A separate recovery table was unnecessary for this case.

Before capture or extraction resumes, the agent compares the run's ontology, registry, requested model, prompt and extraction schema with the current implementation. An incompatible run fails with `extraction_revision_mismatch` before spending or interpreting saved output. Compatible code changes remain recorded in `executionRevisions`.

Before reserving a provider attempt, the agent saves `runs/<run-id>/extraction-input.json` in private R2 and binds its digest into the run. The artifact contains the exact provider request, request digest, capture digest, run ID and code revision that prepared the request. The OpenAI adapter sends that request without rebuilding it from the capture. Recovery and validation check both the saved request and its run binding, including when the Workflow reuses a cached extraction step.

Reconstructing a request after receiving a response would invent provenance. An incomplete historical run without the saved input therefore requires reconciliation (`extraction_input_missing`); changed bindings fail with `extraction_input_revision_mismatch`. Neither condition clears an attempt or authorizes another paid call. Completed historical runs return without mutation, and their existing reports and assessments remain available. No ontology activation or data migration is introduced.

## Reports and exports

Grouped and object reports share the same contact/address filtering. Object filenames apply that filtering before slug generation. Ordinary titles retain their filenames; a redacted title produces a different manifest and cannot inherit approvals for an earlier file set. Existing delivered editions are not rewritten automatically.

Export checks directory membership before writing and again before returning success. Unexpected files, directories and symbolic links fail explicitly without being removed. A valid partial export may resume, and existing files must still match their expected bytes. These checks detect inconsistent local exports; they do not lock the directory against other filesystem writers.

Regression tests cover pre-initialization storage failure, caller/lease/retry enforcement, incompatible extraction revisions, exact request transmission, altered or missing saved input, cached steps, historical completion, redacted filenames and unexpected export entries.
