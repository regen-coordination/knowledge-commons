import {
  assessmentBinding,
  digest,
  IngestionError,
  prepareGeo,
  type ValidationRequest,
} from "@knowledge-commons/pipeline";
import { Hono } from "hono";
import { type Bindings, decodeRun, runtime, type StoredRun } from "./bindings";
import { GitHubDelivery } from "./github";
import { getReview } from "./review";
import { Store } from "./store";

export const preparations = new Hono<{ Bindings: Bindings }>();
preparations.on(["GET", "POST"], "/:runId/:kind", async (c) => {
  const id = c.req.param("runId"),
    kind = c.req.param("kind");
  if (!/^[a-f0-9-]{36}$/.test(id) || !["approvals", "geo"].includes(kind))
    return c.json({ error: "not_found" }, 404);
  const env = runtime(c.env);
  const row = await env.DB.prepare(
    "SELECT record FROM runs WHERE id=? AND caller_id=?",
  )
    .bind(id, env.PILOT_CALLER_ID ?? "pilot-operator")
    .first<StoredRun>();
  if (!row) return c.json({ error: "not_found" }, 404);
  if (c.req.method === "GET") {
    const saved = await env.DB.prepare(
      "SELECT record FROM preparation_records WHERE run_id=? AND kind=?",
    )
      .bind(id, kind)
      .first<{ record: string }>();
    return c.json({
      runId: id,
      kind,
      freshness: "historical-snapshot; POST to reevaluate",
      record: saved ? JSON.parse(saved.record) : null,
    });
  }
  const run = decodeRun(row);
  const review = await getReview(env, id);
  if (run.state !== "completed" || !review?.edition || !run.candidateRef)
    return c.json({ error: "review_not_ready" }, 409);
  const store = new Store(env);
  const draft = await store.get<ValidationRequest>(run.candidateRef);
  if (!draft || (await assessmentBinding(draft)) !== review.candidateDigest)
    return c.json({ error: "candidate_revision_mismatch" }, 409);
  let record: unknown;
  let status: 200 | 503 = 200;
  try {
    if (kind === "approvals") {
      if (!env.GITHUB_TOKEN) throw new IngestionError("github_not_configured");
      if (!review.delivery || run.execution === "fixture")
        throw new IngestionError("report_not_delivered");
      record = {
        ...(await new GitHubDelivery(env.GITHUB_TOKEN).evaluate(
          review.delivery,
        )),
        candidateDigest: review.candidateDigest,
      };
    } else {
      record = await prepareGeo(draft, {
        runId: id,
        reportDigest: review.edition.digest,
        assessmentDigest: review.assessment.digest,
        target: null,
        publicUseScope:
          "Private preparation only; no upload, submission, or accepted-knowledge publication",
      });
    }
  } catch (error) {
    record = {
      status: "blocked",
      evaluatedAt: new Date().toISOString(),
      candidateDigest: review.candidateDigest,
      error:
        error instanceof IngestionError ? error.code : "preparation_failed",
      knowledgeApproval: "not-granted",
    };
    status = 503;
  }
  const recordDigest = await digest(record);
  const ref = `runs/${id}/${kind}/${recordDigest.slice(7)}.json`;
  await store.put(ref, record);
  const saved = { record, recordDigest, artifactRef: ref };
  await env.DB.prepare(
    "INSERT INTO preparation_records(run_id,kind,record) VALUES(?,?,?) ON CONFLICT(run_id,kind) DO UPDATE SET record=excluded.record",
  )
    .bind(id, kind, JSON.stringify(saved))
    .run();
  return c.json(saved, status);
});
