import { expect, test } from "bun:test";
import { validDraft } from "../../ontology/fixtures/draft";
import {
  type IntegrityOutput,
  integrityRequest,
  integrityTotal,
  validateIntegrity,
} from "./integrity";

test("Integrity requires exact object coverage and known supporting evidence; partial ratings have no total", async () => {
  const draft = await validDraft();
  const output: IntegrityOutput = {
    objects: draft.objects.map((o) => ({
      objectId: o.id,
      ratings: {
        origin: {
          score: 2,
          reason: "Origin and attribution are recorded in supplied evidence.",
          evidenceRefs: o.evidenceRefs,
        },
        traceability: {
          score: 1,
          reason: "Some supporting passages are present; review gaps remain.",
          evidenceRefs: o.evidenceRefs,
        },
        support: {
          score: 1,
          reason: "Claims need further review of the supplied evidence.",
          evidenceRefs: o.evidenceRefs,
        },
        context: {
          score: 2,
          reason: "Dates and historical conditions are explicit in the object.",
          evidenceRefs: [],
        },
        publicUse: {
          score: null,
          reason: "Public reuse has not been assessed for this object.",
          evidenceRefs: [],
        },
      },
    })),
  };
  expect(validateIntegrity(output, draft)).toEqual(output);
  expect(integrityTotal(output.objects[0]!.ratings)).toEqual({
    assessed: 4,
    total: null,
  });
  output.objects[0]!.ratings.publicUse.score = 0;
  expect(integrityTotal(output.objects[0]!.ratings)).toEqual({
    assessed: 5,
    total: 6,
  });
  const invalid = structuredClone(output);
  invalid.objects[0]!.ratings.origin.evidenceRefs = ["fabricated"];
  expect(() => validateIntegrity(invalid, draft)).toThrow(
    "integrity_unknown_evidence",
  );
  invalid.objects = [output.objects[0]!, output.objects[0]!];
  expect(() => validateIntegrity(invalid, draft)).toThrow(
    "integrity_object_mismatch",
  );
  const noSupport = structuredClone(output);
  const target = noSupport.objects.find(
    (o) => draft.objects.find((d) => d.id === o.objectId)?.class !== "Source",
  )!;
  target.ratings.support.evidenceRefs = [];
  expect(() => validateIntegrity(noSupport, draft)).toThrow(
    "integrity_missing_support",
  );
  expect(integrityRequest(draft).max_output_tokens).toBe(8192);
  const oversized = structuredClone(draft);
  oversized.captures[0]!.posts[0]!.text = "x".repeat(65536);
  expect(() => integrityRequest(oversized)).toThrow(
    "integrity_input_limit_exceeded",
  );
});
