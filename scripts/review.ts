import { digest, readBounded } from "../packages/pipeline/src/index";
import { exportObjectReports } from "./export-object-reports";

const runId = process.argv[2];
const token = process.env.PILOT_API_TOKEN;
if (!token || !runId || !/^[a-f0-9-]{36}$/.test(runId))
  throw new Error("Set PILOT_API_TOKEN and pass a run UUID");
const base = new URL(process.env.PILOT_BASE_URL ?? "http://127.0.0.1:8787");
if (
  base.protocol !== "https:" &&
  !(
    base.protocol === "http:" &&
    ["localhost", "127.0.0.1"].includes(base.hostname)
  )
)
  throw new Error("Use HTTPS outside loopback");
async function request(path: string, method = "GET") {
  const res = await fetch(`${base.origin}/v1/ingestions/${runId}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}` },
    redirect: "error",
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`Review request HTTP ${res.status}`);
  return JSON.parse(await readBounded(res, 256 * 1024));
}
if (process.argv.includes("--export")) {
  const report = await request("/review/report");
  if (report.runId !== runId) throw new Error("Review run identity mismatch");
  if (report.files) {
    console.info(
      await exportObjectReports(report, "reports/ingestion/objects"),
    );
  } else {
    if (
      report.runId !== runId ||
      (await digest(report.markdown)) !== report.markdownDigest
    )
      throw new Error("Review report digest mismatch");
    const { mkdir, open, readFile } = await import("node:fs/promises");
    const path = `reports/ingestion/reviews/${runId}-${report.markdownDigest.slice(7, 19)}.md`;
    await mkdir("reports/ingestion/reviews", { recursive: true });
    try {
      const handle = await open(path, "wx");
      try {
        await handle.writeFile(report.markdown);
      } finally {
        await handle.close();
      }
    } catch (error) {
      if (
        (error as NodeJS.ErrnoException).code !== "EEXIST" ||
        (await readFile(path, "utf8")) !== report.markdown
      )
        throw error;
    }
    console.info({ path, digest: report.markdownDigest });
  }
} else if (process.argv.includes("--status"))
  console.info(await request("/review"));
else console.info(await request("/review", "POST"));
