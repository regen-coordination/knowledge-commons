import {
  assembleDraft,
  type CapturePacket,
  captureDigest,
  captureTopic,
  digest,
  IngestionError,
  type IngestionRecord,
  type KnowledgeObject,
  type ProviderResponse,
  parseProvider,
  renderReport,
  reportSchema,
  type ValidationRequest,
  validateDraft,
  verifyCapture,
} from "@knowledge-commons/pipeline";
import type { Runtime } from "./bindings";
import { CODE_REVISION } from "./build-info";
import { extractionInput, verifyExtractionRevision } from "./extraction-input";
import { FixtureProvider, fixtureCapture } from "./fixture";
import { type ExtractionProvider, OpenAIProvider } from "./provider";
import { Store } from "./store";
export interface Steps {
  do<T>(
    name: string,
    config: {
      retries: { limit: number; delay: "1 second" };
      timeout: "2 minutes";
    },
    fn: () => Promise<T>,
  ): Promise<T>;
}
const safe = {
  retries: { limit: 2, delay: "1 second" as const },
  timeout: "2 minutes" as const,
};
const once = { ...safe, retries: { limit: 0, delay: "1 second" as const } };
export async function executeJob(
  env: Runtime,
  runId: string,
  step: Steps,
  adapters?: {
    capture: () => Promise<CapturePacket>;
    provider: ExtractionProvider;
  },
) {
  const store = new Store(env);
  let run = await store.run(runId);
  const prefix = `runs/${run.id}`;
  if (run.state === "completed") return;
  run.executionRevisions = [
    ...new Set([
      ...(run.executionRevisions ?? [run.codeRevision]),
      CODE_REVISION,
    ]),
  ];
  await store.save(run);
  const phase = <T>(
    name: string,
    config: Parameters<Steps["do"]>[1],
    fn: () => Promise<T>,
  ) =>
    step.do(name, config, async () => {
      try {
        return await fn();
      } catch (error) {
        // Workflow error serialization discards custom Error properties. Persist a safe code before crossing that seam.
        const failed = await store.run(runId);
        const code =
          error instanceof IngestionError
            ? error.code
            : "ingestion_step_failed";
        failed.failure = { code, retryable: false };
        await store.save(failed);
        throw new Error(code);
      }
    });
  try {
    await verifyExtractionRevision(run);
    await phase("capture", safe, async () => {
      run = await store.run(runId);
      run.state = "capturing";
      await store.save(run);
      const key = `${prefix}/capture.json`;
      let packet = await store.get<CapturePacket>(key);
      if (!packet) {
        packet = await (adapters?.capture() ??
          (run.execution === "fixture"
            ? fixtureCapture(run.createdAt, run.topicId)
            : captureTopic(fetch, new Date().toISOString(), run.topicId)));
        packet.capture.captureRef = key;
        packet.capture.digest = await captureDigest(packet.capture);
        await store.put(key, packet);
      }
      await verifyCapture(packet.capture);
      if (packet.capture.topicId !== String(run.topicId))
        throw new IngestionError("source_topic_mismatch");
      if (packet.capture.status !== "complete")
        throw new IngestionError("incomplete_capture");
      const source = await store.source(packet, run);
      await store.put(`${prefix}/source.json`, source);
      run.captureRef = key;
      run.sourceDigests = [packet.capture.digest];
      run.captureStatus = packet.capture.status;
      run.capturedPosts = packet.capture.posts.length;
      run.sourceTitle = packet.title;
      await store.save(run);
      return key;
    });
    await phase("extract", once, async () => {
      run = await store.run(runId);
      run.state = "extracting";
      await store.save(run);
      const key = `${prefix}/response.json`;
      let response = await store.get<ProviderResponse>(key);
      const packet = await store.get<CapturePacket>(`${prefix}/capture.json`);
      if (!packet) throw new IngestionError("capture_missing");
      const input = await extractionInput(
        store,
        run,
        packet.capture,
        !response,
      );
      if (!response) {
        if (run.execution === "live" && !env.OPENAI_API_KEY)
          throw new IngestionError("provider_not_configured");
        await store.reserve(run); // At most one provider request, even after an uncertain Workflow restart.
        run.attempt = 1;
        await store.save(run);
        const provider =
          adapters?.provider ??
          (run.execution === "fixture"
            ? new FixtureProvider()
            : new OpenAIProvider(env.OPENAI_API_KEY ?? ""));
        try {
          response = await provider.extract(packet.capture, input.request);
        } catch {
          await env.DB.prepare(
            "UPDATE attempts SET status='uncertain' WHERE run_id=?",
          )
            .bind(run.id)
            .run();
          throw new IngestionError("provider_attempt_needs_reconciliation");
        }
        await store.put(key, response); // Persist raw response before parsing, including provider errors.
      }
      run.responseRef = key;
      run.durationMs = response.durationMs;
      run.providerRequestId = response.requestId;
      await env.DB.prepare(
        "UPDATE attempts SET status='received',completed_at=?,response_ref=? WHERE run_id=?",
      )
        .bind(new Date().toISOString(), key, run.id)
        .run();
      await store.save(run);
      return key;
    });
    await phase("validate-and-report", safe, async () => {
      run = await store.run(runId);
      run.state = "validating";
      await store.save(run);
      const packet = await store.get<CapturePacket>(`${prefix}/capture.json`);
      const source = await store.get<KnowledgeObject>(`${prefix}/source.json`);
      const response = await store.get<ProviderResponse>(
        `${prefix}/response.json`,
      );
      if (!packet || !source || !response)
        throw new IngestionError("artifact_missing");
      await extractionInput(store, run, packet.capture, false);
      let parsed: ReturnType<typeof parseProvider>;
      try {
        parsed = parseProvider(response);
      } catch (error) {
        throw error instanceof IngestionError
          ? error
          : new IngestionError("provider_invalid_response");
      }
      run.model = parsed.model;
      run.modelUsage = parsed.usage;
      run.usage = {
        inputTokens: parsed.usage.inputTokens,
        outputTokens: parsed.usage.outputTokens,
        costUsd: parsed.usage.costUsd,
      };
      await store.save(run);
      await env.DB.prepare("UPDATE attempts SET usage_json=? WHERE run_id=?")
        .bind(JSON.stringify(parsed.usage), run.id)
        .run();
      const draft = await assembleDraft(
        packet.capture,
        source,
        parsed.extraction,
        run,
      );
      run.candidateRef = await store.put(`${prefix}/candidate.json`, draft);
      const validation = await validateDraft(draft);
      run.validation = { valid: validation.valid, issues: validation.issues };
      await store.put(`${prefix}/validation.json`, run.validation);
      await store.save(run);
      if (!validation.valid)
        throw new IngestionError("candidate_validation_failed");
      run.candidateDigests = draft.objects.map((o) => o.contentDigest);
      // Freeze report timestamp to the run identity so a replay produces identical bytes.
      run.state = "completed";
      run.failure = null;
      run.resumable = false;
      const markdown = renderReport(run, draft);
      run.reportDigest = await digest(markdown);
      run.reportRef = `${prefix}/report.json`;
      const metadata = reportSchema.parse({
        runId: run.id,
        runDigest: await digest(run),
        ontologyVersion: run.ontologyVersion,
        registryDigest: run.registryDigest,
        sourceDigests: run.sourceDigests,
        candidateDigests: run.candidateDigests,
        generatedAt: run.createdAt,
        markdownDigest: run.reportDigest,
        artifactRef: run.reportRef,
        humanReview: "pending",
        approval: "unapproved",
        publication: "disabled",
      });
      await store.put(run.reportRef, { metadata, markdown });
      await store.save(run, false);
      await store.snapshot(run);
      return run.reportRef;
    });
  } catch (error) {
    run = await store.run(runId);
    if (run.state === "capturing") run.captureStatus = "incomplete";
    run.state = "failed";
    const code =
      error instanceof IngestionError
        ? error.code
        : (run.failure?.code ?? "ingestion_step_failed");
    const attempts = await env.DB.prepare(
      "SELECT status FROM attempts WHERE run_id=?",
    )
      .bind(run.id)
      .first<{ status: string }>();
    const responseExists = await store.get<ProviderResponse>(
      `${prefix}/response.json`,
    );
    const uncertain = attempts && !responseExists;
    run.resumable =
      !uncertain &&
      ![
        "candidate_validation_failed",
        "invalid_or_ambiguous_evidence",
        "provider_invalid_response",
        "provider_refusal",
        "provider_credit_balance_exhausted",
        "extraction_revision_mismatch",
        "extraction_input_revision_mismatch",
        "extraction_input_missing",
      ].includes(code) &&
      !code.startsWith("provider_http_");
    run.failure = {
      code: uncertain ? "provider_attempt_needs_reconciliation" : code,
      retryable: run.resumable,
    };
    await store.save(run);
    await store.snapshot(run);
    throw new Error(run.failure.code); // Only stable error codes reach Workflow logs.
  }
}
export type ReportArtifact = {
  metadata: ReturnType<typeof reportSchema.parse>;
  markdown: string;
};
export type { IngestionRecord, ValidationRequest };
