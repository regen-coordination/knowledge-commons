import {
  type Capture,
  digest,
  extractionJsonSchema,
  getRegistry,
  IngestionError,
  type IngestionRecord,
  MODEL,
  PROMPT,
  PROMPT_VERSION,
  providerRequest,
  verifyCapture,
} from "@knowledge-commons/pipeline";
import { CODE_REVISION } from "./build-info";
import type { Store } from "./store";

export type ExtractionRequest = ReturnType<typeof providerRequest>;
type ExtractionInput = {
  runId: string;
  captureDigest: string;
  request: ExtractionRequest;
  requestDigest: string;
  codeRevision: string;
};

/** Reject incompatible queued/restarted runs before spending or interpreting output. */
export async function verifyExtractionRevision(run: IngestionRecord) {
  const registry = await getRegistry();
  if (
    run.ontologyVersion !== registry.version ||
    run.registryDigest !== registry.digest ||
    run.requestedModel !== MODEL ||
    run.promptVersion !== PROMPT_VERSION ||
    run.promptDigest !== (await digest(PROMPT)) ||
    run.extractionSchemaDigest !== (await digest(extractionJsonSchema))
  )
    throw new IngestionError("extraction_revision_mismatch");
}

/** Save the exact request before reservation; never reconstruct provenance for an old response. */
export async function extractionInput(
  store: Store,
  run: IngestionRecord,
  capture: Capture,
  allowCreate: boolean,
) {
  await verifyExtractionRevision(run);
  await verifyCapture(capture);
  if (run.sourceDigests.length !== 1 || run.sourceDigests[0] !== capture.digest)
    throw new IngestionError("extraction_input_revision_mismatch");
  const ref = `runs/${run.id}/extraction-input.json`;
  const request = providerRequest(capture); // Enforce input bounds before reservation.
  const requestDigest = await digest(request);
  let input = await store.get<ExtractionInput>(ref);
  if (!input) {
    const attempt = await store.env.DB.prepare(
      "SELECT status FROM attempts WHERE run_id=?",
    )
      .bind(run.id)
      .first();
    if (!allowCreate || run.extractionInput || attempt)
      throw new IngestionError("extraction_input_missing");
    input = {
      runId: run.id,
      captureDigest: capture.digest,
      request,
      requestDigest,
      codeRevision: CODE_REVISION,
    };
    await store.put(ref, input);
  }
  const inputDigest = await digest(input);
  if (
    input.runId !== run.id ||
    input.captureDigest !== capture.digest ||
    input.requestDigest !== requestDigest ||
    (await digest(input.request)) !== requestDigest ||
    !/^sha256:[a-f0-9]{64}$/.test(input.codeRevision) ||
    (run.extractionInput &&
      (run.extractionInput.ref !== ref ||
        run.extractionInput.digest !== inputDigest))
  )
    throw new IngestionError("extraction_input_revision_mismatch");
  if (!run.extractionInput) {
    if (!allowCreate) throw new IngestionError("extraction_input_missing");
    run.extractionInput = { ref, digest: inputDigest };
    await store.save(run);
  }
  return input;
}
