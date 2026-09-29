import { expect, test } from "bun:test";
import {
  digest,
  getRegistry,
  ONTOLOGY_VERSION,
  reportSchema,
  runSchema,
} from "./index";

test("run and report contracts preserve pending human authority", async () => {
  const hash = await digest({ fixture: true });
  const id = "00000000-0000-4000-8000-000000000001";
  const run = {
    id,
    callerId: "fixture",
    idempotencyKey: "fixture-1",
    requestDigest: hash,
    ontologyVersion: ONTOLOGY_VERSION,
    registryDigest: (await getRegistry()).digest,
    state: "queued",
    attempt: 0,
    createdAt: "2026-09-09T00:00:00Z",
    updatedAt: "2026-09-09T00:00:00Z",
    sourceDigests: [],
    candidateDigests: [],
    provider: null,
    model: null,
    usage: null,
    failure: null,
  };
  expect(runSchema.safeParse(run).success).toBe(true);
  expect(runSchema.safeParse({ ...run, state: "approved" }).success).toBe(
    false,
  );
  const report = {
    runId: id,
    runDigest: await digest(run),
    ontologyVersion: ONTOLOGY_VERSION,
    registryDigest: run.registryDigest,
    sourceDigests: [],
    candidateDigests: [],
    generatedAt: run.createdAt,
    markdownDigest: hash,
    artifactRef: "fixture:report",
    humanReview: "pending",
    approval: "unapproved",
    publication: "disabled",
  };
  expect(reportSchema.safeParse(report).success).toBe(true);
  expect(
    reportSchema.safeParse({ ...report, approval: "approved" }).success,
  ).toBe(false);
});
