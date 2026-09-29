import {
  type Capture,
  captureDigest,
  contentDigest,
  type KnowledgeObject,
  ONTOLOGY_VERSION,
  type ValidationRequest,
} from "../src/index";

// Synthetic community garden proposal. This is not captured Hub evidence.
export async function validDraft(): Promise<ValidationRequest> {
  const sourceId = "00000000-0000-4000-8000-000000000001";
  const articleId = "00000000-0000-4000-8000-000000000002";
  const claimId = "00000000-0000-4000-8000-000000000003";
  const evidenceId = "00000000-0000-4000-8000-000000000004";
  const time = "2026-09-09T00:00:00Z";
  const placeholder = `sha256:${"0".repeat(64)}`;
  const passage = "We propose a community garden and funding pool.";
  const capture: Capture = {
    sourceId,
    sourceSystem: "synthetic-fixture",
    topicId: "235",
    url: "https://example.org/fixtures/topic-235",
    retrievedAt: time,
    digest: placeholder,
    captureRef: "fixture:topic-235-v1",
    status: "complete",
    depth: 0,
    expectedPostIds: ["fixture-post-9001"],
    posts: [
      {
        nativePostId: "fixture-post-9001",
        author: "Synthetic contributor",
        createdAt: time,
        updatedAt: null,
        text: passage,
      },
    ],
  };
  capture.digest = await captureDigest(capture);
  const evidence = {
    id: evidenceId,
    sourceId,
    sourceRevisionDigest: capture.digest,
    selector: {
      nativePostId: "fixture-post-9001",
      start: 0,
      end: passage.length,
      exact: passage,
    },
    relation: "supports" as const,
    limitations: ["Synthetic fixture; no live capture"],
  };
  const base = {
    ontologyVersion: ONTOLOGY_VERSION as typeof ONTOLOGY_VERSION,
    revision: 1,
    contentDigest: placeholder,
    previousRevision: null,
    createdAt: time,
    updatedAt: time,
    createdBy: "fixture:bootstrap",
    runRef: null,
    sourceRefs: [sourceId],
    evidenceRefs: [evidenceId],
    uncertainties: ["Implementation has not been demonstrated"],
    summary: "Synthetic proposed community garden and funding pool",
    language: "en" as const,
    audiences: ["reviewers" as const],
    topics: ["regenerative-finance" as const],
    maturity: "draft" as const,
    publicUseBoundary: {
      access: "private" as const,
      intendedUse: "Local validation tests",
      reuseStatus: "unknown" as const,
      attributionRequirements: [],
    },
    assessmentRefs: [],
  };
  const objects: KnowledgeObject[] = [
    {
      ...base,
      id: sourceId,
      class: "Source",
      title: "Synthetic source",
      sourceRefs: [],
      evidenceRefs: [],
      url: capture.url,
      sourceSystem: capture.sourceSystem,
      nativeIds: { topicId: "235", postIds: capture.expectedPostIds },
      retrievedAt: time,
      captureDigest: capture.digest,
      captureRef: capture.captureRef,
      captureStatus: "complete",
      reuseStatus: "unknown",
      authoredAt: null,
      sourceUpdatedAt: null,
    },
    {
      ...base,
      id: articleId,
      class: "Article",
      title: "Toolkit proposal",
      body: passage,
      purpose: "Describe a proposal without asserting delivery",
    },
    {
      ...base,
      id: claimId,
      class: "Claim",
      title: "Proposed funding pool",
      statement: passage,
      claimMode: "planned",
      scope: {
        attribution: "Synthetic contributor",
        startDate: null,
        endDate: null,
        basis: "proposal",
      },
      evidence: [evidence],
    },
  ];
  for (const object of objects)
    object.contentDigest = await contentDigest(object);
  return { objects, captures: [capture], evidence: [evidence] };
}

export const invalidCases = [
  {
    name: "finished Playbook fabricated from a proposal",
    code: "invalid_union",
    mutate: (d: ValidationRequest) => {
      Object.assign(d.objects[1]!, { class: "Playbook" });
    },
  },
  {
    name: "self-report labelled observed",
    code: "unsupported_observation",
    mutate: (d: ValidationRequest) => {
      Object.assign(d.objects[2]!, {
        claimMode: "observed",
        scope: {
          attribution: "Synthetic contributor",
          startDate: null,
          endDate: null,
          basis: "self-report",
        },
      });
    },
  },
  {
    name: "unread post cited",
    code: "invalid_selector",
    mutate: (d: ValidationRequest) => {
      d.evidence[0]!.selector.nativePostId = "unread-post";
    },
  },
  {
    name: "changed passage",
    code: "invalid_selector",
    mutate: (d: ValidationRequest) => {
      d.evidence[0]!.selector.exact = "The pool is operational.";
    },
  },
  {
    name: "edited source retains old capture digest",
    code: "digest_mismatch",
    mutate: (d: ValidationRequest) => {
      d.captures[0]!.posts[0]!.text += " Edited.";
    },
  },
  {
    name: "missing reply",
    code: "incomplete_capture",
    mutate: (d: ValidationRequest) => {
      d.captures[0]!.expectedPostIds.push("missing-reply");
    },
  },
  {
    name: "explicit incomplete capture",
    code: "incomplete_capture",
    mutate: (d: ValidationRequest) => {
      d.captures[0]!.status = "incomplete";
    },
  },
  {
    name: "wrong source revision",
    code: "unresolved_evidence",
    mutate: (d: ValidationRequest) => {
      d.evidence[0]!.sourceRevisionDigest = `sha256:${"f".repeat(64)}`;
    },
  },
  {
    name: "duplicate object identity",
    code: "duplicate_identity",
    mutate: (d: ValidationRequest) => {
      d.objects.push(structuredClone(d.objects[1]!));
    },
  },
  {
    name: "reference points to Article instead of Source",
    code: "invalid_source_ref",
    mutate: (d: ValidationRequest) => {
      d.objects[2]!.sourceRefs = [d.objects[1]!.id];
    },
  },
  {
    name: "mutable approval injected into object",
    code: "unrecognized_keys",
    mutate: (d: ValidationRequest) => {
      Object.assign(d.objects[1]!, { approved: true });
    },
  },
  {
    name: "unsupported ontology version",
    code: "invalid_value",
    mutate: (d: ValidationRequest) => {
      Object.assign(d.objects[1]!, { ontologyVersion: "0.1.0" });
    },
  },
  {
    name: "creation points to previous revision",
    code: "invalid_revision",
    mutate: (d: ValidationRequest) => {
      d.objects[1]!.previousRevision = d.objects[1]!.contentDigest;
    },
  },
  {
    name: "claim evidence changed independently",
    code: "claim_evidence_mismatch",
    mutate: (d: ValidationRequest) => {
      d.evidence = structuredClone(d.evidence);
      d.evidence[0]!.limitations.push("Changed");
    },
  },
];
