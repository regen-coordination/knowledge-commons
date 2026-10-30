import { describe, expect, test } from "bun:test";
import {
  captureDigest,
  contentDigest,
  digest,
} from "@knowledge-commons/ontology";
import { invalidCases, validDraft } from "../../ontology/fixtures/draft";
import { validateDraft } from "./index";

describe("draft validation", () => {
  test("accepts evidenced synthetic Article, Source and planned Claim", async () => {
    expect((await validateDraft(await validDraft())).valid).toBe(true);
  });
  for (const fixture of invalidCases)
    test(`rejects ${fixture.name}`, async () => {
      const draft = await validDraft();
      fixture.mutate(draft);
      const result = await validateDraft(draft);
      expect(result.valid).toBe(false);
      expect(result.issues.map((i) => i.code)).toContain(fixture.code);
    });
  test("digest ignores key order but retains semantic and array changes", async () => {
    expect(await digest({ b: 2, a: 1 })).toBe(await digest({ a: 1, b: 2 }));
    expect(await digest([1, 2])).not.toBe(await digest([2, 1]));
    const object = (await validDraft()).objects[1]!;
    const original = object.contentDigest;
    object.assessmentRefs = ["00000000-0000-4000-8000-000000000009"];
    expect(await contentDigest(object)).toBe(original);
    object.title = "Changed";
    expect(await contentDigest(object)).not.toBe(original);
  });
});

test("preserves capture whitespace and UTF-16 evidence offsets", async () => {
  const draft = await validDraft();
  const capture = draft.captures[0]!;
  const post = capture.posts[0]!;
  post.text = `  🌱 ${post.text}\n`;
  capture.digest = await captureDigest(capture);
  const source = draft.objects[0]!;
  if (source.class !== "Source") throw new Error("Fixture requires Source");
  source.captureDigest = capture.digest;
  const ref = draft.evidence[0]!;
  ref.sourceRevisionDigest = capture.digest;
  ref.selector.start = 5;
  ref.selector.end = post.text.length - 1;
  for (const object of draft.objects)
    object.contentDigest = await contentDigest(object);
  expect((await validateDraft(draft)).valid).toBe(true);
});
