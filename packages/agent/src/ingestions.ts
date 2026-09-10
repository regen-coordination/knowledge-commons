import {
  digest,
  extractionJsonSchema,
  getRegistry,
  type IngestionRecord,
  ingestionRequestSchema,
  MODEL,
  objectReportsDigest,
  PROMPT,
  PROMPT_VERSION,
  RESERVE_MICROUSD,
} from "@knowledge-commons/pipeline";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { type Bindings, decodeRun, runtime, type StoredRun } from "./bindings";
import { CODE_REVISION } from "./build-info";
import type { ReportArtifact } from "./job";
import { preparations } from "./preparations";
import {
  getReview,
  type ReviewEdition,
  reviewRun,
  reviewWorkflowId,
} from "./review";
import { Store } from "./store";

export const ingestions = new Hono<{ Bindings: Bindings }>();
const caller = (env: Bindings) => env.PILOT_CALLER_ID ?? "pilot-operator";
const validId = (id: string) =>
  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id);
ingestions.use("*", async (c, next) => {
  if (!c.env.DB || !c.env.ARTIFACTS || !c.env.INGESTION)
    return c.json({ error: "ingestion_not_configured" }, 503);
  await next();
});
ingestions.use(
  "*",
  bodyLimit({
    maxSize: 4096,
    onError: (c) => c.json({ error: "payload_too_large" }, 413),
  }),
);
ingestions.post("/", async (c) => {
  if (
    c.req.header("content-type")?.split(";")[0]?.trim() !== "application/json"
  )
    return c.json({ error: "application_json_required" }, 415);
  const key = c.req.header("Idempotency-Key");
  if (!key || !/^[A-Za-z0-9._-]{1,128}$/.test(key))
    return c.json({ error: "idempotency_key_required" }, 400);
  let input: unknown;
  try {
    input = await c.req.json();
  } catch {
    return c.json({ error: "invalid_json" }, 400);
  }
  const parsed = ingestionRequestSchema.safeParse(input);
  if (!parsed.success)
    return c.json(
      {
        error: "invalid_request_or_provider_unimplemented",
        enabledModels: [MODEL],
        enabledTopicIds: [235, 356],
      },
      422,
    );
  const env = runtime(c.env);
  const payload = parsed.data;
  const requestDigest = await digest(payload);
  let existing = await env.DB.prepare(
    "SELECT record FROM runs WHERE caller_id=? AND idempotency_key=?",
  )
    .bind(caller(env), key)
    .first<StoredRun>();
  if (existing && decodeRun(existing).requestDigest !== requestDigest)
    return c.json({ error: "idempotency_conflict" }, 409);
  if (!existing) {
    if ((payload.provider === "fixture") !== (env.EXECUTION_MODE === "fixture"))
      return c.json({ error: "provider_mode_mismatch" }, 422);
    if (payload.provider === "openai" && !env.OPENAI_API_KEY)
      return c.json({ error: "provider_not_configured" }, 503);
    if (payload.maxCostUsd * 1_000_000 < RESERVE_MICROUSD)
      return c.json(
        { error: "per_run_cap_below_reservation", requiredUsd: 0.05 },
        422,
      );
    if (
      payload.provider === "openai" &&
      !(Number(env.PILOT_BUDGET_USD) >= 0.05)
    )
      return c.json({ error: "approved_budget_required" }, 503);
    const registry = await getRegistry();
    const now = new Date().toISOString();
    const record: IngestionRecord = {
      id: crypto.randomUUID(),
      callerId: caller(env),
      idempotencyKey: key,
      requestDigest,
      ontologyVersion: registry.version,
      registryDigest: registry.digest,
      state: "queued",
      attempt: 0,
      createdAt: now,
      updatedAt: now,
      sourceDigests: [],
      candidateDigests: [],
      provider: payload.provider,
      model: null,
      usage: null,
      failure: null,
      topicId: payload.topicId,
      execution: payload.provider === "fixture" ? "fixture" : "live",
      requestedModel: payload.model,
      promptVersion: PROMPT_VERSION,
      promptDigest: await digest(PROMPT),
      extractionSchemaDigest: await digest(extractionJsonSchema),
      codeRevision: CODE_REVISION,
      captureRef: null,
      responseRef: null,
      candidateRef: null,
      reportRef: null,
      reportDigest: null,
      validation: null,
      providerRequestId: null,
      modelUsage: null,
      durationMs: null,
      capturedPosts: null,
      captureStatus: null,
      sourceTitle: null,
      resumable: false,
    };
    // Bound D1 rows and job count independently of model spending; concurrent inserts serialize in D1.
    await env.DB.prepare(
      "INSERT OR IGNORE INTO runs(id,caller_id,idempotency_key,request_digest,record) SELECT ?,?,?,?,? WHERE (SELECT COUNT(*) FROM runs)<100",
    )
      .bind(
        record.id,
        record.callerId,
        key,
        requestDigest,
        JSON.stringify(record),
      )
      .run();
    existing = await env.DB.prepare(
      "SELECT record FROM runs WHERE caller_id=? AND idempotency_key=?",
    )
      .bind(caller(env), key)
      .first<StoredRun>();
    if (!existing) return c.json({ error: "run_limit_reached" }, 429);
    if (decodeRun(existing).requestDigest !== requestDigest)
      return c.json({ error: "idempotency_conflict" }, 409);
  }
  const run = decodeRun(existing);
  let dispatch = "existing";
  if (run.state === "queued") {
    try {
      await env.INGESTION.create({ id: run.id, params: { runId: run.id } });
      dispatch = "created";
    } catch {
      try {
        await (await env.INGESTION.get(run.id)).status();
        dispatch = "existing";
      } catch {
        dispatch = "pending-retry";
      }
    }
  }
  c.header("Location", `/v1/ingestions/${run.id}`);
  return c.json(
    { runId: run.id, state: run.state, dispatch, execution: run.execution },
    202,
  );
});
ingestions.get("/:runId", async (c) => {
  const id = c.req.param("runId");
  if (!validId(id)) return c.json({ error: "not_found" }, 404);
  const env = runtime(c.env);
  const row = await env.DB.prepare(
    "SELECT record FROM runs WHERE id=? AND caller_id=?",
  )
    .bind(id, caller(env))
    .first<StoredRun>();
  if (!row) return c.json({ error: "not_found" }, 404);
  const run = decodeRun(row);
  let workflow = "unavailable";
  try {
    workflow = (await (await env.INGESTION.get(id)).status()).status;
  } catch {}
  const attempts = await env.DB.prepare(
    "SELECT status,reserved_microusd,started_at,completed_at FROM attempts WHERE run_id=?",
  )
    .bind(id)
    .all();
  // Omit private source text, response bodies, and caller credentials.
  return c.json({
    runId: id,
    state: run.state,
    execution: run.execution,
    workflow,
    failure: run.failure,
    resumable: run.resumable,
    executionRevisions: run.executionRevisions ?? [run.codeRevision],
    sourceDigests: run.sourceDigests,
    candidateDigests: run.candidateDigests,
    captureStatus: run.captureStatus,
    capturedPosts: run.capturedPosts,
    model: run.model,
    modelUsage: run.modelUsage,
    validation: run.validation,
    reportDigest: run.reportDigest,
    attempts: attempts.results,
  });
});
ingestions.post("/:runId/resume", async (c) => {
  const id = c.req.param("runId");
  if (!validId(id)) return c.json({ error: "not_found" }, 404);
  const env = runtime(c.env);
  const row = await env.DB.prepare(
    "SELECT record FROM runs WHERE id=? AND caller_id=?",
  )
    .bind(id, caller(env))
    .first<StoredRun>();
  if (!row) return c.json({ error: "not_found" }, 404);
  const run = decodeRun(row);
  if (run.state !== "failed" || !run.resumable)
    return c.json({ error: "run_not_safely_resumable" }, 409);
  const instance = await env.INGESTION.get(id);
  const status = await instance.status();
  if (status.status !== "errored")
    return c.json({ error: "workflow_not_errored" }, 409);
  const reservation = await env.DB.prepare(
    "UPDATE runs SET resume_count=resume_count+1 WHERE id=? AND resume_count<3",
  )
    .bind(id)
    .run();
  if (!reservation.meta.changes)
    return c.json({ error: "resume_limit_reached" }, 409);
  await instance.restart();
  return c.json({ runId: id, state: "resuming" }, 202);
});
ingestions.get("/:runId/report", async (c) => {
  const id = c.req.param("runId");
  if (!validId(id)) return c.json({ error: "not_found" }, 404);
  const env = runtime(c.env);
  const row = await env.DB.prepare(
    "SELECT record FROM runs WHERE id=? AND caller_id=?",
  )
    .bind(id, caller(env))
    .first<StoredRun>();
  if (!row) return c.json({ error: "not_found" }, 404);
  const run = decodeRun(row);
  if (run.state !== "completed" || !run.reportRef)
    return c.json({ error: "report_not_ready", state: run.state }, 409);
  const artifact = await new Store(env).get<ReportArtifact>(run.reportRef);
  if (
    !artifact ||
    (await digest(artifact.markdown)) !== run.reportDigest ||
    artifact.metadata.markdownDigest !== run.reportDigest ||
    artifact.metadata.runDigest !== (await digest(run))
  )
    return c.json({ error: "report_integrity_failure" }, 500);
  return c.json({
    topicId: run.topicId,
    execution: run.execution,
    ...artifact,
  });
});

// Review artifacts are separate from the immutable extraction run and report.
ingestions.on(["GET", "POST"], "/:runId/review", async (c) => {
  const id = c.req.param("runId");
  if (!validId(id)) return c.json({ error: "not_found" }, 404);
  const env = runtime(c.env);
  const row = await env.DB.prepare(
    "SELECT record FROM runs WHERE id=? AND caller_id=?",
  )
    .bind(id, caller(env))
    .first<StoredRun>();
  if (!row) return c.json({ error: "not_found" }, 404);
  const run = decodeRun(row);
  if (c.req.method === "GET")
    return c.json({ runId: id, review: await getReview(env, id) });
  if (run.state !== "completed")
    return c.json({ error: "ingestion_not_completed" }, 409);
  if (!env.REVIEW) return c.json({ error: "review_not_configured" }, 503);
  const recorded = await getReview(env, id);
  if (
    recorded?.assessment.status === "completed" &&
    recorded.delivery?.status === "delivered" &&
    recorded.delivery.files
  )
    return c.json({ runId: id, dispatch: "existing" }, 202);

  let state: string | null = null;
  try {
    state = (await (await env.REVIEW.get(reviewWorkflowId(id))).status())
      .status;
  } catch {}
  if (state === "errored") {
    const retry = await env.DB.prepare(
      "UPDATE reviews SET resume_count=resume_count+1 WHERE run_id=? AND resume_count<3 AND lease_until<?",
    )
      .bind(id, Date.now())
      .run();
    if (!retry.meta.changes)
      return c.json({ error: "review_retry_limit_or_busy" }, 409);
    await (await env.REVIEW.get(reviewWorkflowId(id))).restart();
    return c.json({ runId: id, dispatch: "resumed" }, 202);
  }
  if (state !== null) return c.json({ runId: id, dispatch: "existing" }, 202);
  return c.json({ runId: id, dispatch: await reviewRun(env, run) }, 202);
});
ingestions.get("/:runId/review/report", async (c) => {
  const id = c.req.param("runId");
  if (!validId(id)) return c.json({ error: "not_found" }, 404);
  const env = runtime(c.env);
  const row = await env.DB.prepare(
    "SELECT record FROM runs WHERE id=? AND caller_id=?",
  )
    .bind(id, caller(env))
    .first<StoredRun>();
  if (!row) return c.json({ error: "not_found" }, 404);
  const review = await getReview(env, id);
  if (!review?.edition)
    return c.json({ error: "review_report_not_ready" }, 409);
  const edition = await new Store(env).get<ReviewEdition>(review.edition.ref);
  if (
    !edition ||
    edition.runId !== id ||
    edition.candidateDigest !== review.candidateDigest ||
    edition.assessmentDigest !== review.assessment.digest ||
    (edition.filesDigest ?? edition.markdownDigest) !== review.edition.digest ||
    (edition.files &&
      (await objectReportsDigest(edition.files)) !== edition.filesDigest) ||
    (await digest(edition.markdown)) !== edition.markdownDigest
  )
    return c.json({ error: "review_report_integrity_failure" }, 500);
  return c.json(edition);
});
ingestions.route("/", preparations);
