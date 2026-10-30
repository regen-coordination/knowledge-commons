import {
  assessmentBinding,
  digest,
  INTEGRITY_PROFILE,
  INTEGRITY_PROMPT,
  INTEGRITY_PROMPT_VERSION,
  IngestionError,
  type IngestionRecord,
  type IntegrityAssessment,
  type IntegrityOutput,
  integrityJsonSchema,
  integrityRequest,
  MODEL,
  type ProviderResponse,
  parseModelResponse,
  renderReport,
  type ValidationRequest,
  validateDraft,
  validateIntegrity,
} from "@knowledge-commons/pipeline";
import type { Runtime } from "./bindings";
import { CODE_REVISION } from "./build-info";
import { type Delivery, GitHubDelivery, type ReportDelivery } from "./github";
import { OpenAIProvider } from "./provider";
import { Store } from "./store";

export type ReviewRecord = {
  runId: string;
  candidateDigest: string;
  createdAt: string;
  assessment: {
    status: "pending" | "completed" | "blocked";
    artifactRef: string | null;
    digest: string | null;
    error: string | null;
  };
  edition: { ref: string; digest: string } | null;
  delivery: Delivery | null;
};
export type ReviewEdition = {
  runId: string;
  candidateDigest: string;
  assessmentDigest: string | null;
  markdown: string;
  markdownDigest: string;
};
export async function getReview(
  env: Runtime,
  runId: string,
): Promise<ReviewRecord | null> {
  const row = await env.DB.prepare("SELECT record FROM reviews WHERE run_id=?")
    .bind(runId)
    .first<{ record: string }>();
  return row ? JSON.parse(row.record) : null;
}
const safeError = (error: unknown) =>
  error instanceof IngestionError ? error.code : "review_step_failed";
function fixtureResponse(draft: ValidationRequest): ProviderResponse {
  const output: IntegrityOutput = {
    objects: draft.objects.map((o) => ({
      objectId: o.id,
      ratings: {
        origin: {
          score: null,
          reason:
            "Synthetic fixture has no real source independence assessment.",
          evidenceRefs: [],
        },
        traceability: {
          score: 1,
          reason:
            "Synthetic fixture rating only; not a real evidence assessment.",
          evidenceRefs: o.evidenceRefs,
        },
        support: {
          score: 1,
          reason:
            "Synthetic fixture rating only; planned claims require human review.",
          evidenceRefs: o.evidenceRefs,
        },
        context: {
          score: 1,
          reason:
            "Synthetic fixture context used to test the assessment contract.",
          evidenceRefs: [],
        },
        publicUse: {
          score: null,
          reason: "Synthetic fixture has no public-use assessment.",
          evidenceRefs: [],
        },
      },
    })),
  };
  return {
    status: 200,
    body: JSON.stringify({
      status: "completed",
      model: MODEL,
      output: [
        {
          type: "message",
          content: [{ type: "output_text", text: JSON.stringify(output) }],
        },
      ],
      usage: { input_tokens: 0, output_tokens: 0 },
    }),
    requestId: "fixture-assessment",
    requestedModel: MODEL,
    durationMs: 0,
    fixture: true,
  };
}
export async function executeReview(
  env: Runtime,
  runId: string,
  adapters?: {
    assess?: (request: unknown) => Promise<ProviderResponse>;
    delivery?: ReportDelivery;
  },
): Promise<ReviewRecord> {
  const store = new Store(env);
  const run = await store.run(runId);
  if (run.state !== "completed" || !run.candidateRef)
    throw new IngestionError("ingestion_not_completed");
  const draft = await store.get<ValidationRequest>(run.candidateRef);
  if (
    !draft ||
    !(await validateDraft(draft)).valid ||
    JSON.stringify(draft.objects.map((o) => o.contentDigest)) !==
      JSON.stringify(run.candidateDigests)
  )
    throw new IngestionError("review_candidate_invalid");
  const candidateDigest = await assessmentBinding(draft);
  const initial: ReviewRecord = {
    runId,
    candidateDigest,
    createdAt: new Date().toISOString(),
    assessment: {
      status: "pending",
      artifactRef: null,
      digest: null,
      error: null,
    },
    edition: null,
    delivery: null,
  };
  await env.DB.prepare(
    "INSERT OR IGNORE INTO reviews(run_id,record) VALUES(?,?)",
  )
    .bind(runId, JSON.stringify(initial))
    .run();
  const owner = crypto.randomUUID();
  const lease = await env.DB.prepare(
    "UPDATE reviews SET lease_owner=?,lease_until=? WHERE run_id=? AND lease_until<?",
  )
    .bind(owner, Date.now() + 600_000, runId, Date.now())
    .run();
  if (!lease.meta.changes) throw new IngestionError("review_in_progress");
  const review = await getReview(env, runId);
  if (!review) throw new IngestionError("review_missing");
  const save = async () => {
    const result = await env.DB.prepare(
      "UPDATE reviews SET record=? WHERE run_id=? AND lease_owner=? AND lease_until>?",
    )
      .bind(JSON.stringify(review), runId, owner, Date.now())
      .run();
    if (!result.meta.changes) throw new IngestionError("review_lease_lost");
  };
  try {
    if (review.candidateDigest !== candidateDigest)
      throw new IngestionError("review_revision_mismatch");
    let assessment: IntegrityAssessment | undefined;
    if (review.assessment.status === "completed") {
      assessment =
        (await store.get<IntegrityAssessment>(
          review.assessment.artifactRef ?? "",
        )) ?? undefined;
      if (
        !assessment ||
        (await digest(assessment)) !== review.assessment.digest ||
        assessment.candidateDigest !== candidateDigest
      )
        throw new IngestionError("assessment_integrity_failure");
    } else {
      try {
        const request = integrityRequest(draft);
        const key = `runs/${runId}/integrity-response.json`;
        let response = await store.get<ProviderResponse>(key);
        if (!response) {
          if (
            run.execution === "live" &&
            !env.OPENAI_API_KEY &&
            !adapters?.assess
          )
            throw new IngestionError("provider_not_configured");
          const cap = Math.floor(Number(env.PILOT_BUDGET_USD ?? 0) * 1_000_000);
          const amount = run.execution === "fixture" ? 0 : 50_000;
          const reservation =
            await env.DB.prepare(`INSERT OR IGNORE INTO integrity_attempts(run_id,status,reserved_microusd,started_at)
            SELECT ?,'started',?,? WHERE ? <= ? - (SELECT COALESCE(SUM(reserved_microusd),0) FROM attempts) - (SELECT COALESCE(SUM(reserved_microusd),0) FROM integrity_attempts)`)
              .bind(
                runId,
                amount,
                review.createdAt,
                amount,
                Number.isFinite(cap) ? cap : 0,
              )
              .run();
          if (!reservation.meta.changes) {
            const exists = await env.DB.prepare(
              "SELECT status FROM integrity_attempts WHERE run_id=?",
            )
              .bind(runId)
              .first();
            throw new IngestionError(
              exists
                ? "integrity_attempt_needs_reconciliation"
                : "budget_exhausted",
            );
          }
          // Persist input identity before the paid call. An uncertain attempt is never automatically repeated.
          await store.put(`runs/${runId}/integrity-input.json`, {
            candidateDigest,
            request,
            codeRevision: CODE_REVISION,
          });
          try {
            response = await (adapters?.assess
              ? adapters.assess(request)
              : run.execution === "fixture"
                ? Promise.resolve(fixtureResponse(draft))
                : new OpenAIProvider(env.OPENAI_API_KEY ?? "").request(
                    request,
                  ));
            await store.put(key, response);
          } catch {
            await env.DB.prepare(
              "UPDATE integrity_attempts SET status='uncertain' WHERE run_id=?",
            )
              .bind(runId)
              .run();
            throw new IngestionError("integrity_attempt_needs_reconciliation");
          }
        }
        await env.DB.prepare(
          "UPDATE integrity_attempts SET status='received',response_ref=? WHERE run_id=?",
        )
          .bind(key, runId)
          .run();
        const input = await store.get<{
          candidateDigest: string;
          request: unknown;
          codeRevision: string;
        }>(`runs/${runId}/integrity-input.json`);
        if (
          !input ||
          input.candidateDigest !== candidateDigest ||
          (await digest(input.request)) !== (await digest(request))
        )
          throw new IngestionError("integrity_input_revision_mismatch");
        const parsed = parseModelResponse(response);
        await env.DB.prepare(
          "UPDATE integrity_attempts SET usage_json=? WHERE run_id=?",
        )
          .bind(JSON.stringify(parsed.usage), runId)
          .run();
        const output = validateIntegrity(parsed.output, draft);
        assessment = {
          id: `integrity-${runId}`,
          runId,
          candidateDigest,
          candidateDigests: run.candidateDigests,
          sourceDigests: run.sourceDigests,
          createdAt: review.createdAt,
          assessor: "machine",
          fixture: run.execution === "fixture",
          requestedModel: MODEL,
          returnedModel: parsed.model,
          profile: INTEGRITY_PROFILE,
          promptVersion: INTEGRITY_PROMPT_VERSION,
          promptDigest: await digest(INTEGRITY_PROMPT),
          schemaDigest: await digest(integrityJsonSchema),
          codeRevision: input.codeRevision,
          requestId: response.requestId,
          durationMs: response.durationMs,
          usage: parsed.usage,
          output,
        };
        review.assessment = {
          status: "completed",
          artifactRef: `runs/${runId}/integrity.json`,
          digest: await digest(assessment),
          error: null,
        };
        await store.put(review.assessment.artifactRef ?? "", assessment);
      } catch (error) {
        assessment = undefined;
        review.assessment = {
          status: "blocked",
          artifactRef: null,
          digest: null,
          error: safeError(error),
        };
      }
      await save();
    }
    let markdown = renderReport(run, draft, assessment);
    if (!assessment)
      markdown = markdown.replace(
        "## Integrity score",
        `**Assessment attempt:** blocked (${review.assessment.error}). Extraction remains available.\n\n## Integrity score`,
      );
    const markdownDigest = await digest(markdown);
    if (review.edition?.digest !== markdownDigest) {
      const ref = `runs/${runId}/reviews/${markdownDigest.slice(7)}.json`;
      const edition: ReviewEdition = {
        runId,
        candidateDigest,
        assessmentDigest: review.assessment.digest,
        markdown,
        markdownDigest,
      };
      await store.put(ref, edition);
      review.edition = { ref, digest: markdownDigest };
      review.delivery = {
        branch: `codex/report-${runId}-${markdownDigest.slice(7, 19)}`,
        path: `reports/ingestion/topic-${run.topicId}/${runId}-${markdownDigest.slice(7, 19)}.md`,
        markdownDigest,
        baseSha: null,
        commitSha: null,
        prNumber: null,
        prUrl: null,
        reviewers: [],
        status: "pending",
        error: null,
      };
      await save();
    }
    if (review.delivery?.status !== "delivered") {
      const delivery = review.delivery;
      if (!delivery) throw new IngestionError("delivery_missing");
      try {
        if (run.execution === "fixture" && !adapters?.delivery)
          throw new IngestionError("fixture_github_delivery_disabled");
        if (!env.GITHUB_TOKEN && !adapters?.delivery)
          throw new IngestionError("github_not_configured");
        await (
          adapters?.delivery ?? new GitHubDelivery(env.GITHUB_TOKEN ?? "")
        ).deliver(markdown, delivery, save);
      } catch (error) {
        delivery.status = "blocked";
        delivery.error = safeError(error);
        await save();
      }
    }
    return review;
  } finally {
    await env.DB.prepare(
      "UPDATE reviews SET lease_owner=NULL,lease_until=0 WHERE run_id=? AND lease_owner=?",
    )
      .bind(runId, owner)
      .run();
  }
}
export async function reviewRun(env: Runtime, run: IngestionRecord) {
  if (!env.REVIEW) return "pending-retry";
  const existing = await getReview(env, run.id);
  if (
    existing?.assessment.status === "completed" &&
    existing.delivery?.status === "delivered"
  )
    return "existing";

  try {
    await env.REVIEW.create({ id: run.id, params: { runId: run.id } });
    return "created";
  } catch {
    try {
      await (await env.REVIEW.get(run.id)).status();
      return "existing";
    } catch {
      return "pending-retry";
    }
  }
}
