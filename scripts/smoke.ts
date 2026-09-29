import { validDraft } from "../packages/ontology/fixtures/draft";

const base = process.env.PILOT_BASE_URL ?? "http://127.0.0.1:8787";
const token = process.env.PILOT_API_TOKEN;
if (!token) throw new Error("Set PILOT_API_TOKEN in the calling environment");
const auth = { Authorization: `Bearer ${token}` };
async function request(path: string, init: RequestInit, expected: number) {
  const response = await fetch(`${base}${path}`, init);
  if (response.status !== expected)
    throw new Error(
      `${path}: expected ${expected}, received ${response.status}`,
    );
  console.info(`${init.method ?? "GET"} ${path}: ${expected}`);
  return response;
}
const health = await request("/health", {}, 200);
if (JSON.stringify(await health.json()) !== '{"ok":true}')
  throw new Error("Unexpected public health details");
for (const path of ["/ready", "/v1/ontology", "/v1/validate"]) {
  await request(
    path,
    { method: path.endsWith("validate") ? "POST" : "GET" },
    401,
  );
  await request(path, { headers: { Authorization: "Bearer invalid" } }, 401);
}
const ready = await (await request("/ready", { headers: auth }, 200)).json<{
  scope: string;
  ingestion: { verified: boolean; completedLiveRuns: number };
  status: string;
  pin: null;
  digest: string;
}>();
if (
  ready.scope !== "foundation" ||
  !Number.isInteger(ready.ingestion.completedLiveRuns) ||
  ready.ingestion.completedLiveRuns < 0 ||
  ready.ingestion.verified !== ready.ingestion.completedLiveRuns > 0
)
  throw new Error("Unexpected readiness claim");
const ontology = await (
  await request("/v1/ontology", { headers: auth }, 200)
).json<{ status: string; pin: null; digest: string }>();
if (ontology.status !== "unratified" || ontology.pin !== null)
  throw new Error("Unexpected ontology activation");
const post = (body: string) => ({
  method: "POST",
  headers: { ...auth, "Content-Type": "application/json" },
  body,
});
await request("/v1/validate", post(JSON.stringify(await validDraft())), 200);
await request("/v1/validate", post('{"objects":[]}'), 422);
await request("/v1/validate", post("{"), 400);
await request("/v1/validate", post("x".repeat(256 * 1024 + 1)), 413);
console.info(`Worker smoke passed; registry ${ontology.digest}`);
