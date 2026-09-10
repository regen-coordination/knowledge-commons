import { expect, test } from "bun:test";
import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  symlink,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { exportObjectReports } from "../../../scripts/export-object-reports";
import { validDraft } from "../../ontology/fixtures/draft";
import { contentDigest } from "../../ontology/src/index";
import type { IngestionRecord } from "./ingestion";
import { objectReportsDigest, renderObjectReports } from "./object-reports";

test("each review file contains only its object's content, evidence and identity; export is immutable", async () => {
  const draft = await validDraft();
  const run = {
    id: "11111111-1111-4111-8111-111111111111",
    topicId: 356,
    execution: "fixture",
    registryDigest: "test",
    candidateDigests: draft.objects.map((o) => o.contentDigest),
    requestedModel: "fixture",
  } as IngestionRecord;
  const files = await renderObjectReports(run, draft);
  expect(files).toHaveLength(draft.objects.length);
  for (const file of files) {
    const object = draft.objects.find((o) => o.id === file.objectId)!;
    expect(file.markdown).toContain(`**Object ID:** ${object.id}`);
    expect(file.markdown).toContain("## Integrity assessment");
    expect(file.markdown).toContain("## Evidence");
    expect(file.markdown).toContain("SYNTHETIC FIXTURE");
    for (const other of draft.objects.filter((o) => o.id !== object.id))
      expect(file.markdown).not.toContain(`**Object ID:** ${other.id}`);
    if (object.class === "Claim")
      expect(file.markdown).not.toContain("## Article");
  }
  const root = await mkdtemp(join(tmpdir(), "commons-objects-"));
  try {
    const bundle = {
      runId: run.id,
      files,
      filesDigest: await objectReportsDigest(files),
    };
    const exported = await exportObjectReports(bundle, root);
    expect(await readdir(exported.directory)).toHaveLength(3);
    expect(await exportObjectReports(bundle, root)).toEqual(exported);
    expect(await readFile(exported.paths[0]!, "utf8")).toBe(files[0]!.markdown);
    const extra = join(exported.directory, "claim-unreviewed.md");
    await Bun.write(extra, "Unreviewed material");
    await expect(exportObjectReports(bundle, root)).rejects.toThrow(
      "directory membership mismatch",
    );
    expect(await readFile(extra, "utf8")).toBe("Unreviewed material");
    await rm(extra);
    await mkdir(extra);
    await expect(exportObjectReports(bundle, root)).rejects.toThrow(
      "directory membership mismatch",
    );
    await rm(extra, { recursive: true });
    await rm(exported.paths[0]!);
    await symlink(exported.paths[1]!, exported.paths[0]!);
    await expect(exportObjectReports(bundle, root)).rejects.toThrow(
      "directory membership mismatch",
    );
    await rm(exported.paths[0]!);
    // An interrupted export with a valid subset can complete without changing existing files.
    expect(await exportObjectReports(bundle, root)).toEqual(exported);
    expect(await readdir(exported.directory)).toHaveLength(files.length);
    const tampered = structuredClone(bundle);
    tampered.files[0]!.markdown += "changed";
    await expect(exportObjectReports(tampered, root)).rejects.toThrow(
      "object_report_integrity_failure",
    );
    const traversal = structuredClone(bundle);
    traversal.files[0]!.name = "../../escape.md";
    await expect(exportObjectReports(traversal, root)).rejects.toThrow(
      "object_report_integrity_failure",
    );
    await expect(objectReportsDigest([files[0]!, files[0]!])).rejects.toThrow(
      "object_report_membership_invalid",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("object report filenames redact the same contact and address text as the body", async () => {
  for (const [title, slug] of [
    ["person@example.com", "contact-redacted"],
    ["0x1234567890123456789012345678901234567890", "address-redacted"],
    ["Community garden proposal", "community-garden-proposal"],
  ]) {
    const draft = await validDraft();
    const article = draft.objects.find((object) => object.class === "Article")!;
    article.title = title!;
    article.contentDigest = await contentDigest(article);
    const run = {
      id: "11111111-1111-4111-8111-111111111111",
      topicId: 356,
      execution: "fixture",
      registryDigest: "test",
      candidateDigests: draft.objects.map((object) => object.contentDigest),
      requestedModel: "fixture",
    } as IngestionRecord;
    const files = await renderObjectReports(run, draft);
    const file = files.find((item) => item.objectId === article.id)!;
    expect(file.name).toBe(`article-${slug}-${article.id}.md`);
    if (slug!.endsWith("redacted")) expect(file.markdown).not.toContain(title!);
    const root = await mkdtemp(join(tmpdir(), "commons-redacted-"));
    try {
      const exported = await exportObjectReports(
        { runId: run.id, files, filesDigest: await objectReportsDigest(files) },
        root,
      );
      expect(await readdir(exported.directory)).toContain(file.name);
      expect(await readFile(join(exported.directory, file.name), "utf8")).toBe(
        file.markdown,
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }
});
