import {
  canonicalJson,
  captureDigest,
  contentDigest,
  type Evidence,
  validationRequestSchema,
} from "@knowledge-commons/ontology";

export { getRegistry } from "@knowledge-commons/ontology";

export type ValidationIssue = { path: string; code: string; message: string };

/** Validate the whole draft and its frozen evidence; no persistence or promotion. */
export async function validateDraft(input: unknown) {
  const parsed = validationRequestSchema.safeParse(input);
  if (!parsed.success)
    return {
      valid: false as const,
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        code: issue.code,
        message: issue.message,
      })),
    };
  const { objects, captures, evidence } = parsed.data;
  const issues: ValidationIssue[] = [];
  const fail = (path: string, code: string, message: string) =>
    issues.push({ path, code, message });
  const unique = (values: string[], path: string) => {
    if (new Set(values).size !== values.length)
      fail(path, "duplicate_identity", "Duplicate identifiers are not merged");
  };
  unique(
    objects.map((o) => o.id),
    "objects",
  );
  unique(
    evidence.map((e) => e.id),
    "evidence",
  );
  unique(
    captures.map((c) => `${c.sourceId}:${c.digest}`),
    "captures",
  );
  const objectMap = new Map(objects.map((o) => [o.id, o]));
  const evidenceMap = new Map(evidence.map((e) => [e.id, e]));
  for (const [i, capture] of captures.entries()) {
    const path = `captures.${i}`;
    unique(capture.expectedPostIds, `${path}.expectedPostIds`);
    unique(
      capture.posts.map((p) => p.nativePostId),
      `${path}.posts`,
    );
    if (
      capture.status !== "complete" ||
      canonicalJson([...capture.expectedPostIds].sort()) !==
        canonicalJson(capture.posts.map((p) => p.nativePostId).sort())
    )
      fail(
        path,
        "incomplete_capture",
        "Capture must contain exactly the expected native post IDs",
      );
    if ((await captureDigest(capture)) !== capture.digest)
      fail(
        `${path}.digest`,
        "digest_mismatch",
        "Capture digest does not match its frozen payload",
      );
    const source = objectMap.get(capture.sourceId);
    if (source?.class !== "Source")
      fail(path, "missing_source", "Capture requires a Source object");
  }
  const checkEvidence = (ref: Evidence, path: string) => {
    const source = objectMap.get(ref.sourceId);
    const capture = captures.find(
      (c) =>
        c.sourceId === ref.sourceId && c.digest === ref.sourceRevisionDigest,
    );
    if (
      source?.class !== "Source" ||
      source.captureDigest !== ref.sourceRevisionDigest ||
      !capture
    ) {
      fail(
        path,
        "unresolved_evidence",
        "Evidence must resolve to the exact Source capture revision",
      );
      return;
    }
    const post = capture.posts.find(
      (p) => p.nativePostId === ref.selector.nativePostId,
    );
    if (
      !post ||
      ref.selector.end <= ref.selector.start ||
      ref.selector.end > post.text.length ||
      post.text.slice(ref.selector.start, ref.selector.end) !==
        ref.selector.exact
    )
      fail(
        `${path}.selector`,
        "invalid_selector",
        "Selector must exactly match a stored post passage",
      );
  };
  evidence.forEach((ref, i) => {
    checkEvidence(ref, `evidence.${i}`);
  });
  for (const [i, object] of objects.entries()) {
    const path = `objects.${i}`;
    if ((await contentDigest(object)) !== object.contentDigest)
      fail(
        `${path}.contentDigest`,
        "digest_mismatch",
        "Object digest does not match its semantic payload",
      );
    if (
      (object.revision === 1) !== (object.previousRevision === null) ||
      object.previousRevision === object.contentDigest
    )
      fail(
        path,
        "invalid_revision",
        "Creation has null previousRevision; later revisions need a distinct prior digest",
      );
    if (Date.parse(object.updatedAt) < Date.parse(object.createdAt))
      fail(path, "invalid_dates", "updatedAt precedes createdAt");
    unique(object.sourceRefs, `${path}.sourceRefs`);
    unique(object.evidenceRefs, `${path}.evidenceRefs`);
    object.sourceRefs.forEach((ref) => {
      if (ref === object.id || objectMap.get(ref)?.class !== "Source")
        fail(
          `${path}.sourceRefs`,
          "invalid_source_ref",
          "Source references must resolve to distinct Source objects",
        );
    });
    object.evidenceRefs.forEach((ref) => {
      const entry = evidenceMap.get(ref);
      if (!entry || !object.sourceRefs.includes(entry.sourceId))
        fail(
          `${path}.evidenceRefs`,
          "invalid_evidence_ref",
          "Evidence must exist and cite a declared supporting Source",
        );
    });
    if (object.class === "Source") {
      const capture = captures.find(
        (c) => c.sourceId === object.id && c.digest === object.captureDigest,
      );
      if (
        !capture ||
        capture.url !== object.url ||
        capture.sourceSystem !== object.sourceSystem ||
        capture.topicId !== object.nativeIds.topicId ||
        capture.captureRef !== object.captureRef ||
        capture.retrievedAt !== object.retrievedAt ||
        capture.status !== object.captureStatus ||
        canonicalJson([...capture.expectedPostIds].sort()) !==
          canonicalJson([...object.nativeIds.postIds].sort())
      )
        fail(
          path,
          "capture_mismatch",
          "Source capture fields must match the frozen capture",
        );
      if (object.reuseStatus !== object.publicUseBoundary.reuseStatus)
        fail(
          path,
          "reuse_mismatch",
          "Source reuse status must agree with its use boundary",
        );
    }
    if (object.class === "Claim") {
      unique(
        object.evidence.map((e) => e.id),
        `${path}.evidence`,
      );
      if (
        canonicalJson(object.evidence.map((e) => e.id).sort()) !==
        canonicalJson([...object.evidenceRefs].sort())
      )
        fail(
          path,
          "claim_evidence_mismatch",
          "Claim evidence must match evidenceRefs",
        );
      object.evidence.forEach((ref, j) => {
        if (
          canonicalJson(ref) !== canonicalJson(evidenceMap.get(ref.id) ?? null)
        )
          fail(
            `${path}.evidence.${j}`,
            "claim_evidence_mismatch",
            "Claim evidence must match the declared evidence record",
          );
      });
      if (
        object.claimMode === "observed" &&
        object.scope.basis !== "direct-observation"
      )
        fail(
          `${path}.claimMode`,
          "unsupported_observation",
          "Self-reports and proposals cannot be labelled observed",
        );
      if (
        object.scope.startDate &&
        object.scope.endDate &&
        Date.parse(object.scope.endDate) < Date.parse(object.scope.startDate)
      )
        fail(`${path}.scope`, "invalid_dates", "Scope ends before it starts");
    }
  }
  return issues.length
    ? { valid: false as const, issues }
    : { valid: true as const, issues: [], objects };
}

export * from "./approvals";
export * from "./geo";
export * from "./ingestion";
export * from "./integrity";
export { renderReport } from "./report";
