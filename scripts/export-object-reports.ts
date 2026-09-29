import { mkdir, open, readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  type ObjectReport,
  objectReportsDigest,
} from "../packages/pipeline/src/index";

export async function exportObjectReports(
  report: { runId: string; files: ObjectReport[]; filesDigest: string },
  root: string,
) {
  if (
    !/^[a-f0-9-]{36}$/.test(report.runId) ||
    (await objectReportsDigest(report.files)) !== report.filesDigest
  )
    throw new Error("Object report bundle mismatch");
  const directory = resolve(
    root,
    `${report.runId}-${report.filesDigest.slice(7, 19)}`,
  );
  await mkdir(directory, { recursive: true });
  const expected = new Set(report.files.map((file) => file.name));
  const checkMembership = async (complete: boolean) => {
    const entries = await readdir(directory, { withFileTypes: true });
    if (
      entries.some((entry) => !entry.isFile() || !expected.has(entry.name)) ||
      (complete && entries.length !== expected.size)
    )
      throw new Error("Object report directory membership mismatch");
  };
  await checkMembership(false); // Allow resuming a partial export, but never mix editions.
  const paths: string[] = [];
  for (const file of report.files) {
    const path = resolve(directory, file.name);
    try {
      const handle = await open(path, "wx", 0o644);
      try {
        await handle.writeFile(file.markdown);
      } finally {
        await handle.close();
      }
    } catch (error) {
      if (
        (error as NodeJS.ErrnoException).code !== "EEXIST" ||
        (await readFile(path, "utf8")) !== file.markdown
      )
        throw error;
    }
    paths.push(path);
  }
  await checkMembership(true);
  return { directory, paths, digest: report.filesDigest };
}
