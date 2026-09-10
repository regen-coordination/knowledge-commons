import { getRegistry, validateDraft } from "@knowledge-commons/pipeline";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { bodyLimit } from "hono/body-limit";
import { HTTPException } from "hono/http-exception";

import type { Bindings } from "./bindings";
import { ingestions } from "./ingestions";

const app = new Hono<{ Bindings: Bindings }>();
app.use("*", async (c, next) => {
  c.header("Cache-Control", "no-store");
  c.header("X-Content-Type-Options", "nosniff");
  if (c.req.path === "/health" && c.req.method === "GET") return next();
  const token = c.env?.PILOT_API_TOKEN;
  if (!token || token.length < 32 || !/^[A-Za-z0-9._~+/-]+=*$/.test(token))
    return c.json({ error: "authentication_not_configured" }, 503);
  return bearerAuth<{ Bindings: Bindings }>({ token })(c, next);
});
app.get("/health", (c) => c.json({ ok: true }));
app.get("/ready", async (c) => {
  let completedLiveRuns = 0;
  let storageReady = false;
  if (c.env.DB && c.env.ARTIFACTS && c.env.INGESTION) {
    try {
      const row = await c.env.DB.prepare(
        "SELECT COUNT(*) AS count FROM runs WHERE json_extract(record, '$.execution') = 'live' AND json_extract(record, '$.state') = 'completed'",
      ).first<{ count: number }>();
      completedLiveRuns = row?.count ?? 0;
      storageReady = true;
    } catch {
      /* A missing migration is a readiness gap, not a public diagnostic. */
    }
  }
  return c.json({
    ready: true,
    scope: "foundation",
    authentication: "configured",
    ingestion: {
      implemented: true,
      configured:
        storageReady &&
        Boolean(
          c.env.EXECUTION_MODE === "fixture" ||
            (c.env.OPENAI_API_KEY && Number(c.env.PILOT_BUDGET_USD) >= 0.05),
        ),
      verified: completedLiveRuns > 0,
      completedLiveRuns,
      verification:
        "Historical completed live runs in this database; no provider call is made by readiness",
      providers: {
        openai: c.env.OPENAI_API_KEY ? "configured" : "unconfigured",
        gemini: "unimplemented",
        anthropic: "unimplemented",
        terra: "unimplemented",
      },
    },
    review: {
      implemented: true,
      workflowConfigured: Boolean(c.env.REVIEW),
      assessmentConfigured: Boolean(c.env.OPENAI_API_KEY),
      githubConfigured: Boolean(c.env.GITHUB_TOKEN),
    },
    ontology: "unratified",
    publication: "disabled",
  });
});
app.get("/v1/ontology", async (c) => c.json(await getRegistry()));
app.use(
  "/v1/validate",
  bodyLimit({
    maxSize: 256 * 1024,
    onError: (c) => c.json({ error: "payload_too_large" }, 413),
  }),
);
app.post("/v1/validate", async (c) => {
  if (
    c.req.header("content-type")?.split(";")[0]?.trim().toLowerCase() !==
    "application/json"
  )
    return c.json({ error: "application_json_required" }, 415);
  let input: unknown;
  try {
    input = await c.req.json();
  } catch {
    return c.json({ error: "invalid_json" }, 400);
  }
  const result = await validateDraft(input);
  // Do not echo raw captures, candidate contents, or submitted credentials.
  return c.json(
    { valid: result.valid, issues: result.issues },
    result.valid ? 200 : 422,
  );
});
app.route("/v1/ingestions", ingestions);
app.notFound((c) => c.json({ error: "not_found" }, 404));
app.onError((error, c) => {
  if (
    error instanceof HTTPException &&
    (error.status === 400 || error.status === 401)
  ) {
    c.header("WWW-Authenticate", 'Bearer realm="knowledge-commons-pilot"');
    return c.json({ error: "unauthorized" }, 401);
  }
  return c.json({ error: "internal_error" }, 500);
});
export default app;
