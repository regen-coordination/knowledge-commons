import { expect, test } from "bun:test";
import { validDraft } from "../../ontology/fixtures/draft";
import { type GeoProgress, prepareGeo, reconcileGeo } from "./geo";

const binding = {
  runId: "run",
  reportDigest: `sha256:${"1".repeat(64)}`,
  assessmentDigest: null,
  target: null,
  publicUseScope: "Private preparation",
};
test("Geo preview preserves identities, references and meaning without raw capture or external effects", async () => {
  const draft = await validDraft();
  const a = await prepareGeo(draft, binding),
    b = await prepareGeo(draft, binding);
  expect(a).toEqual(b);
  expect(a.submission).toBe("disabled");
  expect(a.operations.entities).toHaveLength(3);
  expect(
    a.operations.relations.every((r) =>
      a.operations.entities.some((e) => e.entityId === r.to),
    ),
  ).toBe(true);
  expect(JSON.stringify(a)).not.toContain("posts");
  expect(a.mapping.geoIds).toBeNull();
  expect(a.blockers).toContain("ontology_and_mapping_unratified");
  const scoped = await prepareGeo(draft, {
    ...binding,
    publicUseScope: "Public proposal",
  });
  expect(scoped.preparationDigest).not.toBe(a.preparationDigest);
  expect(scoped.operationDigest).toBe(a.operationDigest);
  const target = await prepareGeo(draft, {
    ...binding,
    target: { network: "fixture", spaceId: "fixture", proposer: "fixture" },
  });
  expect(target.preparationDigest).not.toBe(a.preparationDigest);
  draft.objects[0]!.title = "tampered";
  await expect(prepareGeo(draft, binding)).rejects.toThrow(
    "geo_candidate_invalid",
  );
});
test("Geo reconciliation keeps uncertain intent and separates proposal, execution and indexing", () => {
  const initial: GeoProgress = {
    intentDigest: "intent",
    operationDigest: "ops",
    stage: "intent",
    proposalId: null,
    transactionId: null,
    checkpoint: null,
  };
  const identity = { intentDigest: "intent", operationDigest: "ops" };
  const uncertain = reconcileGeo(initial, { ...identity, stage: "uncertain" });
  expect(uncertain.intentDigest).toBe(initial.intentDigest);
  const proposed = reconcileGeo(uncertain, {
    ...identity,
    stage: "proposed",
    proposalId: "p1",
  });
  expect(
    reconcileGeo(proposed, {
      ...identity,
      stage: "proposed",
      proposalId: "p1",
    }),
  ).toEqual(proposed);
  expect(() =>
    reconcileGeo(proposed, {
      ...identity,
      stage: "proposed",
      proposalId: "p2",
    }),
  ).toThrow("geo_proposal_conflict");
  expect(() =>
    reconcileGeo(proposed, {
      ...identity,
      stage: "indexed",
      transactionId: "t1",
      checkpoint: "c1",
    }),
  ).toThrow("geo_index_unverified");
  const executed = reconcileGeo(proposed, {
    ...identity,
    stage: "executed",
    transactionId: "t1",
  });
  const indexed = reconcileGeo(executed, {
    ...identity,
    stage: "indexed",
    checkpoint: "c1",
  });
  expect(indexed.stage).toBe("indexed");
  expect(reconcileGeo(indexed, { ...identity, stage: "uncertain" })).toEqual(
    indexed,
  );
  expect(() =>
    reconcileGeo(indexed, {
      ...identity,
      operationDigest: "changed",
      stage: "indexed",
    }),
  ).toThrow("geo_receipt_revision_mismatch");
});
