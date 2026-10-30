import { readBounded } from "../packages/pipeline/src/index";

const [runId, kind, flag] = process.argv.slice(2);
const token = process.env.PILOT_API_TOKEN;
if (
  !token ||
  !runId ||
  !/^[a-f0-9-]{36}$/.test(runId) ||
  !["geo", "approvals"].includes(kind ?? "") ||
  (flag && flag !== "--status")
)
  throw new Error(
    "Set PILOT_API_TOKEN; usage: bun run review:prepare <run-id> geo|approvals [--status]",
  );
const base = new URL(process.env.PILOT_BASE_URL ?? "http://127.0.0.1:8787");
if (
  base.protocol !== "https:" &&
  !(
    base.protocol === "http:" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname)
  )
)
  throw new Error("Use HTTPS outside loopback");
const response = await fetch(`${base.origin}/v1/ingestions/${runId}/${kind}`, {
  method: flag ? "GET" : "POST",
  headers: { Authorization: `Bearer ${token}` },
  redirect: "error",
  signal: AbortSignal.timeout(180_000),
});
const result = JSON.parse(await readBounded(response, 1024 * 1024));
// The authenticated API holds the private operation body; the CLI prints status only.
const record = flag ? result.record?.record : result.record;
console.info(
  JSON.stringify(
    {
      httpStatus: response.status,
      runId,
      kind,
      freshness: flag ? result.freshness : "evaluated-now",
      status: record?.status,
      error: record?.error ?? result.error,
      preparationDigest: record?.preparationDigest,
      operationDigest: record?.operationDigest,
      blockers: record?.blockers,
      evaluatedAt: record?.evaluatedAt,
      headSha: record?.headSha,
      approvals: record?.approvals,
      changesRequested: record?.changesRequested,
      knowledgeApproval: record?.knowledgeApproval,
      submission: record?.submission,
    },
    null,
    2,
  ),
);
if (!response.ok) process.exitCode = 1;
