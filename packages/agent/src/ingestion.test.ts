import { Database } from "bun:sqlite";
import { describe, expect, test } from "bun:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  digest,
  renderReport,
  type ValidationRequest,
} from "@knowledge-commons/pipeline";
import { exportReport } from "../../../scripts/export-report";
import type { Runtime } from "./bindings";
import { FixtureProvider, fixtureCapture } from "./fixture";
import app from "./index";
import { executeJob, type Steps } from "./job";
import { Store } from "./store";

const token = "test-only-ingestion-".repeat(4);

test("alternate demo flows through export and private Geo preparation with caller isolation", async () => {
  const h = await harness();
  const response = await h.submit("alternate", {
    topicId: 356,
    provider: "fixture",
  });
  const { runId } = await response.json<{ runId: string }>();
  await executeJob(h.env, runId, h.steps);
  const { executeReview } = await import("./review");
  await executeReview(h.env, runId);
  const path = `/v1/ingestions/${runId}/geo`;
  const prepare = () =>
    app.request(
      path,
      { method: "POST", headers: { Authorization: `Bearer ${token}` } },
      h.env,
    );
  const a = await (await prepare()).json<{
    record: { preparationDigest: string; submission: string };
    recordDigest: string;
  }>();
  const b = await (await prepare()).json<typeof a>();
  expect(a.record.preparationDigest).toBe(b.record.preparationDigest);
  expect(a.record.submission).toBe("disabled");
  expect((await h.get(path)).status).toBe(200);
  expect(
    (await h.get(path, { ...h.env, PILOT_CALLER_ID: "other" })).status,
  ).toBe(404);
  expect((await app.request(path, { method: "POST" }, h.env)).status).toBe(401);
  const report = await (await h.get(`/v1/ingestions/${runId}/report`)).json<{
    topicId: number;
    markdown: string;
  }>();
  expect(report.topicId).toBe(356);
  expect(report.markdown).toContain("example.org/fixture/356");
  expect(report.markdown.toLowerCase()).not.toContain("toolkit");
  const approval = await app.request(
    `/v1/ingestions/${runId}/approvals`,
    { method: "POST", headers: { Authorization: `Bearer ${token}` } },
    h.env,
  );
  expect(approval.status).toBe(503);
  const failed = await approval.json<{
    record: { status: string; error: string };
  }>();
  expect(failed.record).toMatchObject({
    status: "blocked",
    error: "github_not_configured",
  });
  const different = await h.submit("alternate", {
    topicId: 235,
    provider: "fixture",
  });
  expect(different.status).toBe(409);
});

async function harness(mode = "fixture", budget = "0") {
  const db = new Database(":memory:");
  db.exec(
    await Bun.file(
      new URL("../migrations/0001_ingestion.sql", import.meta.url),
    ).text(),
  );
  db.exec(
    await Bun.file(
      new URL("../migrations/0002_resume_limit.sql", import.meta.url),
    ).text(),
  );
  db.exec(
    await Bun.file(
      new URL("../migrations/0003_reviews.sql", import.meta.url),
    ).text(),
  );
  db.exec(
    await Bun.file(
      new URL("../migrations/0004_preparations.sql", import.meta.url),
    ).text(),
  );
  const prepare = (sql: string) => {
    let values: (string | number | null)[] = [];
    return {
      bind(...args: (string | number | null)[]) {
        values = args;
        return this;
      },
      async first() {
        return db.query(sql).get(...values);
      },
      async all() {
        return { results: db.query(sql).all(...values) };
      },
      async run() {
        const result = db.query(sql).run(...values);
        return { meta: { changes: result.changes } };
      },
    };
  };
  const artifacts = new Map<string, string>();
  let dispatches = 0;
  const env = {
    DB: { prepare },
    ARTIFACTS: {
      async put(key: string, value: string) {
        artifacts.set(key, value);
        return {};
      },
      async get(key: string) {
        const value = artifacts.get(key);
        return value
          ? {
              async json() {
                return JSON.parse(value);
              },
            }
          : null;
      },
    },
    INGESTION: {
      async create() {
        dispatches++;
        return {};
      },
      async get() {
        return {
          async status() {
            return { status: "errored" };
          },
          async restart() {
            dispatches++;
          },
        };
      },
    },
    PILOT_API_TOKEN: token,
    PILOT_CALLER_ID: "alice",
    EXECUTION_MODE: mode,
    PILOT_BUDGET_USD: budget,
    OPENAI_API_KEY: mode === "live" ? "test-secret" : undefined,
  } as unknown as Runtime;
  const submit = (
    key = "one",
    payload: unknown = {
      topicId: 235,
      provider: mode === "fixture" ? "fixture" : "openai",
    },
  ) =>
    app.request(
      "/v1/ingestions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Idempotency-Key": key,
        },
        body: JSON.stringify(payload),
      },
      env,
    );
  const get = (path: string, e = env) =>
    app.request(path, { headers: { Authorization: `Bearer ${token}` } }, e);
  const steps: Steps = {
    async do(_name, _config, fn) {
      return fn();
    },
  };
  const store = new Store(env);
  return {
    db,
    env,
    submit,
    get,
    store,
    steps,
    artifacts,
    dispatches: () => dispatches,
  };
}

describe("durable ingestion", () => {
  test("fixture completes, exports digest-checked report, and repeated key reuses run", async () => {
    const h = await harness();
    const response = await h.submit();
    expect(response.status).toBe(202);
    const { runId } = await response.json<{ runId: string }>();
    await executeJob(h.env, runId, h.steps);
    const run = await h.store.run(runId);
    expect(run.state).toBe("completed");
    expect(run.validation?.valid).toBe(true);
    expect(run.attempt).toBe(1);
    const repeated = await h.submit();
    expect((await repeated.json<{ runId: string }>()).runId).toBe(runId);
    expect(h.dispatches()).toBe(1);
    const report = await (await h.get(`/v1/ingestions/${runId}/report`)).json<{
      metadata: { runDigest: string; markdownDigest: string };
      markdown: string;
    }>();
    expect(report.metadata.runDigest).toBe(await digest(run));
    expect(report.markdown).toContain("SYNTHETIC FIXTURE");
    expect(report.markdown).toContain("Not run");
    expect(report.markdown).not.toContain(
      "We propose a community garden and funding pool.",
    );
    const root = await mkdtemp(join(tmpdir(), "commons-export-test-"));
    const fetcher = (async (input: RequestInfo | URL, init?: RequestInit) =>
      app.request(String(input), init, h.env)) as typeof fetch;
    try {
      const exported = await exportReport(
        "http://localhost",
        token,
        runId,
        root,
        fetcher,
      );
      expect(await readFile(exported.path, "utf8")).toBe(report.markdown);
      expect(
        (await exportReport("http://localhost", token, runId, root, fetcher))
          .existing,
      ).toBe(true);
      const corrupt = JSON.parse(h.artifacts.get(run.reportRef!)!);
      corrupt.markdown += "tampered";
      h.artifacts.set(run.reportRef!, JSON.stringify(corrupt));
      await expect(
        exportReport("http://localhost", token, runId, root, fetcher),
      ).rejects.toThrow("HTTP 500");
    } finally {
      await rm(root, { recursive: true, force: true });
      h.db.close();
    }
  });
  test("idempotency conflicts, auth and caller isolation", async () => {
    const h = await harness();
    const { runId } = await (await h.submit()).json<{ runId: string }>();
    expect(
      (
        await h.submit("one", {
          topicId: 235,
          provider: "fixture",
          maxCostUsd: 0.02,
        })
      ).status,
    ).toBe(409);
    expect(
      (await app.request(`/v1/ingestions/${runId}`, {}, h.env)).status,
    ).toBe(401);
    const bob = { ...h.env, PILOT_CALLER_ID: "bob" };
    expect((await h.get(`/v1/ingestions/${runId}`, bob)).status).toBe(404);
    expect((await h.get(`/v1/ingestions/${runId}/report`, bob)).status).toBe(
      404,
    );
    expect((await h.get(`/v1/ingestions/${runId}/report`)).status).toBe(409);
    expect(
      (await h.submit("bad", { topicId: 999, provider: "fixture" })).status,
    ).toBe(422);
    h.db.close();
  });
  test("incomplete evidence fails before a provider call", async () => {
    const h = await harness();
    const { runId } = await (await h.submit()).json<{ runId: string }>();
    const packet = await fixtureCapture(new Date().toISOString());
    packet.capture.expectedPostIds.push("missing");
    let calls = 0;
    await expect(
      executeJob(h.env, runId, h.steps, {
        capture: async () => packet,
        provider: {
          async extract() {
            calls++;
            throw new Error("must not run");
          },
        },
      }),
    ).rejects.toThrow("incomplete_capture");
    expect(calls).toBe(0);
    expect((await h.store.run(runId)).state).toBe("failed");
    h.db.close();
  });
  test("malformed model evidence is retained and never reported as success", async () => {
    const h = await harness();
    const { runId } = await (await h.submit()).json<{ runId: string }>();
    const packet = await fixtureCapture(new Date().toISOString());
    const provider = {
      async extract() {
        const result = await new FixtureProvider().extract(packet.capture);
        result.body = result.body.replaceAll("p0001", "p9999");
        return result;
      },
    };
    await expect(
      executeJob(h.env, runId, h.steps, {
        capture: async () => packet,
        provider,
      }),
    ).rejects.toThrow("invalid_or_ambiguous_evidence");
    expect(h.artifacts.has(`runs/${runId}/response.json`)).toBe(true);
    expect((await h.store.run(runId)).reportRef).toBeNull();
    h.db.close();
  });
  test("uncertain provider outcome cannot spend twice on restart", async () => {
    const h = await harness();
    const { runId } = await (await h.submit()).json<{ runId: string }>();
    let calls = 0;
    const adapters = {
      capture: () => fixtureCapture(new Date().toISOString()),
      provider: {
        async extract() {
          calls++;
          throw new Error("private secret failure");
        },
      },
    };
    await expect(executeJob(h.env, runId, h.steps, adapters)).rejects.toThrow(
      "provider_attempt_needs_reconciliation",
    );
    await expect(executeJob(h.env, runId, h.steps, adapters)).rejects.toThrow(
      "provider_attempt_needs_reconciliation",
    );
    expect(calls).toBe(1);
    expect((await h.store.run(runId)).resumable).toBe(false);
    h.db.close();
  });
  test("global spending reservation stops a second run", async () => {
    const h = await harness("live", "0.05");
    const first = await (await h.submit("one")).json<{ runId: string }>();
    const second = await (await h.submit("two")).json<{ runId: string }>();
    const adapters = {
      capture: () => fixtureCapture(new Date().toISOString()),
      provider: new FixtureProvider(),
    };
    await executeJob(h.env, first.runId, h.steps, adapters);
    await expect(
      executeJob(h.env, second.runId, h.steps, adapters),
    ).rejects.toThrow("budget_exhausted");
    expect(
      h.db.query("SELECT SUM(reserved_microusd) AS total FROM attempts").get(),
    ).toEqual({ total: 50000 });
    h.db.close();
  });
  test("provider HTTP failure keeps original response and reservation", async () => {
    const h = await harness();
    const { runId } = await (await h.submit()).json<{ runId: string }>();
    const packet = await fixtureCapture(new Date().toISOString());
    await expect(
      executeJob(h.env, runId, h.steps, {
        capture: async () => packet,
        provider: {
          async extract() {
            return {
              status: 429,
              body: '{"error":"private detail"}',
              durationMs: 10,
              requestId: "request-fixture",
              requestedModel: "gpt-5.6-luna",
              fixture: true,
            };
          },
        },
      }),
    ).rejects.toThrow("provider_http_429");
    expect((await h.store.run(runId)).failure?.code).toBe("provider_http_429");
    expect(h.artifacts.has(`runs/${runId}/response.json`)).toBe(true);
    h.db.close();
  });
});

test("safe resume reuses the stored provider response and keeps report immutable", async () => {
  const h = await harness();
  const { runId } = await (await h.submit()).json<{ runId: string }>();
  let calls = 0;
  const packet = await fixtureCapture(new Date().toISOString());
  const adapters = {
    capture: async () => packet,
    provider: {
      async extract() {
        calls++;
        return new FixtureProvider().extract(packet.capture);
      },
    },
  };
  const interrupted: Steps = {
    async do(name, _config, fn) {
      if (name === "validate-and-report")
        throw new Error("transient storage outage");
      return fn();
    },
  };
  await expect(executeJob(h.env, runId, interrupted, adapters)).rejects.toThrow(
    "ingestion_step_failed",
  );
  expect((await h.store.run(runId)).resumable).toBe(true);
  const resume = await app.request(
    `/v1/ingestions/${runId}/resume`,
    { method: "POST", headers: { Authorization: `Bearer ${token}` } },
    h.env,
  );
  expect(resume.status).toBe(202);
  await executeJob(h.env, runId, h.steps, adapters);
  expect(calls).toBe(1);
  const before = await h.store.run(runId);
  await executeJob(h.env, runId, h.steps, adapters);
  expect(await h.store.run(runId)).toEqual(before);
  expect(calls).toBe(1);
  h.db.close();
});

test("resume count is bounded and failed report retrieval stays private", async () => {
  const h = await harness();
  const { runId } = await (await h.submit()).json<{ runId: string }>();
  const run = await h.store.run(runId);
  run.state = "failed";
  run.resumable = true;
  await h.store.save(run);
  const request = () =>
    app.request(
      `/v1/ingestions/${runId}/resume`,
      { method: "POST", headers: { Authorization: `Bearer ${token}` } },
      h.env,
    );
  for (let i = 0; i < 3; i++) expect((await request()).status).toBe(202);
  expect((await request()).status).toBe(409);
  h.db.close();
});

test("unconfigured provider and absent approved budget reject before queueing", async () => {
  const h = await harness("live", "0");
  expect((await h.submit()).status).toBe(503);
  delete h.env.OPENAI_API_KEY;
  expect((await h.submit()).status).toBe(503);
  expect(h.db.query("SELECT COUNT(*) AS count FROM runs").get()).toEqual({
    count: 0,
  });
  h.db.close();
});

test("provider quota error survives Workflow Error serialization", async () => {
  const h = await harness();
  const { runId } = await (await h.submit()).json<{ runId: string }>();
  const serialized: Steps = {
    async do(_name, _config, fn) {
      try {
        return await fn();
      } catch (error) {
        throw new Error((error as Error).message);
      }
    },
  };
  const packet = await fixtureCapture(new Date().toISOString());
  await expect(
    executeJob(h.env, runId, serialized, {
      capture: async () => packet,
      provider: {
        async extract() {
          return {
            status: 429,
            body: JSON.stringify({
              error: {
                code: "credit_balance_exhausted",
                type: "insufficient_quota",
              },
            }),
            durationMs: 1,
            requestId: "fixture-quota",
            requestedModel: "gpt-5.6-luna",
            fixture: true,
          };
        },
      },
    }),
  ).rejects.toThrow("provider_credit_balance_exhausted");
  const run = await h.store.run(runId);
  expect(run.failure?.code).toBe("provider_credit_balance_exhausted");
  expect(run.resumable).toBe(false);
  expect(run.reportRef).toBeNull();
  h.db.close();
});

test("readable reports preserve evidence, distinguish missing ratings, and escape source markup", async () => {
  const h = await harness();
  try {
    const { runId } = await (await h.submit()).json<{ runId: string }>();
    await executeJob(h.env, runId, h.steps);
    const run = await h.store.run(runId);
    const draft = JSON.parse(
      h.artifacts.get(run.candidateRef!)!,
    ) as ValidationRequest;
    const before = JSON.stringify(draft);
    const report = renderReport(run, draft);
    expect(report).toContain("# 🌱 Regen Knowledge Commons");
    expect(report).toContain("Integrity score: not assessed yet");
    expect(report).toContain("0 of 5 dimensions assessed");
    expect(report).not.toContain("0/10");
    expect(report).toContain("0 of 2 recorded");
    expect(report).toContain("SYNTHETIC FIXTURE");
    expect(report).not.toContain("| gemini-");
    for (const evidence of draft.evidence) {
      expect(report).toContain(
        `| ${evidence.selector.nativePostId} | ${evidence.selector.start}–${evidence.selector.end} | ${evidence.relation} |`,
      );
      expect(report).toContain(evidence.sourceRevisionDigest);
    }
    for (const value of run.candidateDigests) expect(report).toContain(value);
    expect(JSON.stringify(draft)).toBe(before);

    run.modelUsage = null;
    run.durationMs = null;
    run.validation = null;
    run.sourceTitle =
      "</details><script>alert(1)</script>![leak](https://example.com)";
    const article = draft.objects.find((o) => o.class === "Article")!;
    article.summary =
      "Contact person@example.com\n</details>\n# forged heading";
    const untrusted = renderReport(run, draft);
    expect(untrusted).toContain("Estimated cost:** Not available");
    expect(untrusted).toContain("Provider time:** Not available");
    expect(untrusted).toContain("Automated checks:** Not checked");
    expect(untrusted).not.toContain("Ready for human review");
    expect(untrusted).not.toContain("person@example.com");
    expect(untrusted).not.toContain("<script>");
    expect(untrusted).not.toContain("![leak](");
    expect(untrusted).not.toContain("\n# forged heading");
    expect(untrusted.match(/<\/details>/g)?.length).toBe(2);
  } finally {
    h.db.close();
  }
});

test("Integrity assessment is separate, missing scores stay missing, and delivery recovery cannot spend twice", async () => {
  const { executeReview } = await import("./review");
  const h = await harness();
  try {
    const { runId } = await (await h.submit()).json<{ runId: string }>();
    await executeJob(h.env, runId, h.steps);
    const original = await h.store.run(runId);
    const first = await executeReview(h.env, runId);
    expect(first.assessment.status).toBe("completed");
    expect(first.delivery?.error).toBe("fixture_github_delivery_disabled");
    const assessment = JSON.parse(
      h.artifacts.get(first.assessment.artifactRef!)!,
    );
    expect(assessment.assessor).toBe("machine");
    expect(assessment.fixture).toBe(true);
    const edition = JSON.parse(h.artifacts.get(first.edition!.ref)!);
    expect(edition.markdown).toContain("3/5 dimensions assessed");
    expect(edition.markdown).not.toContain("3/10");
    expect(edition.markdown).toContain("Human ratings pending");
    let deliveries = 0;
    const delivery = {
      async deliver(
        _markdown: string,
        d: import("./github").Delivery,
        save: () => Promise<void>,
      ) {
        deliveries++;
        d.status = "delivered";
        d.error = null;
        await save();
      },
    };
    await executeReview(h.env, runId, {
      delivery,
      assess: async () => {
        throw new Error("must not call twice");
      },
    });
    await executeReview(h.env, runId, { delivery });
    expect(deliveries).toBe(1);
    expect(
      h.db.query("SELECT count(*) AS count FROM integrity_attempts").get(),
    ).toEqual({ count: 1 });
    expect(await h.store.run(runId)).toEqual(original);
    expect((await h.get(`/v1/ingestions/${runId}/review/report`)).status).toBe(
      200,
    );
    expect(
      (
        await h.get(`/v1/ingestions/${runId}/review`, {
          ...h.env,
          PILOT_CALLER_ID: "bob",
        })
      ).status,
    ).toBe(404);
    expect(
      (
        await h.get(`/v1/ingestions/${runId}/review/report`, {
          ...h.env,
          PILOT_CALLER_ID: "bob",
        })
      ).status,
    ).toBe(404);
    edition.markdown += "tamper";
    h.artifacts.set(first.edition!.ref, JSON.stringify(edition));
    expect((await h.get(`/v1/ingestions/${runId}/review/report`)).status).toBe(
      500,
    );
  } finally {
    h.db.close();
  }
});

test("assessment and extraction share the cumulative budget", async () => {
  const { executeReview } = await import("./review");
  const h = await harness("live", "0.05");
  try {
    const { runId } = await (await h.submit()).json<{ runId: string }>();
    await executeJob(h.env, runId, h.steps, {
      capture: () => fixtureCapture(new Date().toISOString()),
      provider: new FixtureProvider(),
    });
    let calls = 0;
    const review = await executeReview(h.env, runId, {
      assess: async () => {
        calls++;
        throw new Error("must not spend");
      },
    });
    expect(calls).toBe(0);
    expect(review.assessment.error).toBe("budget_exhausted");
    expect(review.edition).not.toBeNull();
    expect((await h.store.run(runId)).state).toBe("completed");
    expect(
      h.db.query("SELECT count(*) AS count FROM integrity_attempts").get(),
    ).toEqual({ count: 0 });
  } finally {
    h.db.close();
  }
});

test("uncertain assessment attempts are never repeated and a live lease prevents concurrent delivery", async () => {
  const { executeReview } = await import("./review");
  const h = await harness();
  try {
    const { runId } = await (await h.submit()).json<{ runId: string }>();
    await executeJob(h.env, runId, h.steps);
    let calls = 0;
    const assess = async () => {
      calls++;
      throw new Error("lost response");
    };
    const first = await executeReview(h.env, runId, { assess });
    expect(first.assessment.error).toBe(
      "integrity_attempt_needs_reconciliation",
    );
    await executeReview(h.env, runId, { assess });
    expect(calls).toBe(1);
    h.db
      .query("UPDATE reviews SET lease_until=? WHERE run_id=?")
      .run(Date.now() + 60000, runId);
    await expect(executeReview(h.env, runId)).rejects.toThrow(
      "review_in_progress",
    );
    expect((await h.store.run(runId)).state).toBe("completed");
  } finally {
    h.db.close();
  }
});

test("malformed and changed assessment responses do not become scores", async () => {
  const { executeReview } = await import("./review");
  const h = await harness();
  try {
    const { runId } = await (await h.submit()).json<{ runId: string }>();
    await executeJob(h.env, runId, h.steps);
    const packet = await fixtureCapture(new Date().toISOString());
    const review = await executeReview(h.env, runId, {
      assess: () => new FixtureProvider().extract(packet.capture),
    });
    expect(review.assessment.status).toBe("blocked");
    expect(review.assessment.digest).toBeNull();
    expect(review.edition).not.toBeNull();
    const inputKey = `runs/${runId}/integrity-input.json`;
    const input = JSON.parse(h.artifacts.get(inputKey)!);
    input.candidateDigest = "changed";
    h.artifacts.set(inputKey, JSON.stringify(input));
    const retry = await executeReview(h.env, runId);
    expect(retry.assessment.error).toBe("integrity_input_revision_mismatch");
  } finally {
    h.db.close();
  }
});

test("completed review submissions reuse delivery without dispatching and enforce caller access", async () => {
  const { executeReview } = await import("./review");
  const h = await harness();
  try {
    const { runId } = await (await h.submit()).json<{ runId: string }>();
    await executeJob(h.env, runId, h.steps);
    await executeReview(h.env, runId, {
      delivery: {
        async deliver(_markdown, d, save) {
          d.status = "delivered";
          await save();
        },
      },
    });
    let creates = 0;
    h.env.REVIEW = {
      async create() {
        creates++;
        return {};
      },
      async get() {
        throw new Error("Workflow history unavailable");
      },
    } as unknown as Runtime["REVIEW"];
    const request = (env = h.env) =>
      app.request(
        `/v1/ingestions/${runId}/review`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } },
        env,
      );
    const response = await request();
    expect(response.status).toBe(202);
    expect(await response.json<{ runId: string; dispatch: string }>()).toEqual({
      runId,
      dispatch: "existing",
    });
    expect(creates).toBe(0);
    expect((await request({ ...h.env, PILOT_CALLER_ID: "bob" })).status).toBe(
      404,
    );
  } finally {
    h.db.close();
  }
});
