import { mkdir, open, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  digest,
  readBounded,
  reportSchema,
} from "../packages/pipeline/src/index";

export async function exportReport(
  base: string,
  token: string,
  runId: string,
  root: string,
  fetcher: typeof fetch = fetch,
) {
  if (!/^[a-f0-9-]{36}$/.test(runId)) throw new Error("Invalid run ID");
  const url = new URL(base);
  if (
    url.protocol !== "https:" &&
    !(
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
    )
  )
    throw new Error("Use HTTPS outside loopback");
  const response = await fetcher(
    `${url.origin}/v1/ingestions/${runId}/report`,
    {
      headers: { Authorization: `Bearer ${token}` },
      redirect: "error",
      signal: AbortSignal.timeout(30_000),
    },
  );
  if (!response.ok)
    throw new Error(`Report request failed: HTTP ${response.status}`);
  const result = JSON.parse(await readBounded(response, 256 * 1024)) as {
    topicId: number;
    execution: string;
    metadata: unknown;
    markdown: string;
  };
  const metadata = reportSchema.parse(result.metadata);
  if (
    ![235, 356].includes(result.topicId) ||
    metadata.runId !== runId ||
    typeof result.markdown !== "string" ||
    (await digest(result.markdown)) !== metadata.markdownDigest
  )
    throw new Error("Report digest or identity mismatch");
  if (!["live", "fixture"].includes(result.execution))
    throw new Error("Unknown report execution mode");
  if (
    result.execution === "fixture" &&
    !result.markdown.includes("SYNTHETIC FIXTURE")
  )
    throw new Error("Fixture label missing");
  const directory = resolve(root, `topic-${result.topicId}`);
  await mkdir(directory, { recursive: true });
  const path = resolve(
    directory,
    `${metadata.generatedAt.slice(0, 10)}-${runId}.md`,
  );
  let file: Awaited<ReturnType<typeof open>>;
  try {
    file = await open(path, "wx", 0o644);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    if ((await readFile(path, "utf8")) !== result.markdown)
      throw new Error("Existing report differs; refusing to overwrite history");
    return { path, digest: metadata.markdownDigest, existing: true };
  }
  try {
    await file.writeFile(result.markdown);
  } finally {
    await file.close();
  }
  return { path, digest: metadata.markdownDigest, existing: false };
}
if (import.meta.main) {
  const token = process.env.PILOT_API_TOKEN;
  const id = process.argv[2];
  if (!token || !id) throw new Error("Set PILOT_API_TOKEN and pass the run ID");
  console.info(
    await exportReport(
      process.env.PILOT_BASE_URL ?? "http://127.0.0.1:8787",
      token,
      id,
      resolve(import.meta.dir, "../reports/ingestion"),
    ),
  );
}
