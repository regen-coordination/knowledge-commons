import { mkdir, open, readFile } from "node:fs/promises";
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
  return { directory, paths, digest: report.filesDigest };
}
