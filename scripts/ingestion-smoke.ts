import { resolve } from "node:path";
import { exportReport } from "./export-report";

const base = process.env.PILOT_BASE_URL ?? "http://127.0.0.1:8787";
const token = process.env.PILOT_API_TOKEN;
if (!token) throw new Error("Set PILOT_API_TOKEN");
const key = `fixture-${crypto.randomUUID()}`;
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
  "Idempotency-Key": key,
};
const submit = () =>
  fetch(`${base}/v1/ingestions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ topicId: 235, provider: "fixture" }),
  });
const response = await submit();
if (response.status !== 202)
  throw new Error(`Expected 202, received ${response.status}`);
const { runId } = await response.json<{ runId: string }>();
let completed = false;
for (let i = 0; i < 60; i++) {
  const status = await (
    await fetch(`${base}/v1/ingestions/${runId}`, { headers })
  ).json<{ state: string; failure: unknown; attempts: unknown[] }>();
  if (status.state === "failed")
    throw new Error(`Fixture failed: ${JSON.stringify(status.failure)}`);
  if (status.state === "completed") {
    if (status.attempts.length !== 1)
      throw new Error("Expected exactly one provider attempt");
    completed = true;
    break;
  }
  await Bun.sleep(500);
}
if (!completed) throw new Error(`Fixture timed out; inspect run ${runId}`);
const repeated = await submit();
if ((await repeated.json<{ runId: string }>()).runId !== runId)
  throw new Error("Idempotency failed");
const conflict = await fetch(`${base}/v1/ingestions`, {
  method: "POST",
  headers,
  body: JSON.stringify({ topicId: 235, provider: "fixture", maxCostUsd: 0.02 }),
});
if (conflict.status !== 409) throw new Error("Expected idempotency conflict");
const report = await exportReport(
  base,
  token,
  runId,
  resolve(import.meta.dir, "../reports/ingestion"),
);
const again = await exportReport(
  base,
  token,
  runId,
  resolve(import.meta.dir, "../reports/ingestion"),
);
if (!again.existing)
  throw new Error("Expected repeat export to preserve existing report");
console.info(
  JSON.stringify({
    runId,
    execution: "fixture",
    report,
    checks: "Workflow, D1, R2, validation, idempotency, export passed",
  }),
);
await Bun.write(
  new URL("../.wrangler/ingestion-smoke.json", import.meta.url),
  JSON.stringify({ runId, key, report }),
);
