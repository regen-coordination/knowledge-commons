import { z } from "zod";

export const ONTOLOGY_VERSION = "0.1.0-draft.2";
export const digestSchema = z.string().regex(/^sha256:[a-f0-9]{64}$/);
const id = z.uuid();
const text = z.string().min(1).max(20000).regex(/\S/);
const timestamp = z.iso.datetime();
const url = z.url({ protocol: /^https?$/ });
const ids = z.array(id).max(200);

export const evidenceSchema = z.strictObject({
  id,
  sourceId: id,
  sourceRevisionDigest: digestSchema,
  selector: z.strictObject({
    nativePostId: text,
    start: z.number().int().nonnegative(),
    end: z.number().int().positive(),
    exact: text,
  }),
  relation: z.enum(["supports", "contradicts", "context"]),
  limitations: z.array(text),
});

export const knowledgeObjectBaseSchema = z.strictObject({
  id,
  title: text,
  ontologyVersion: z.literal(ONTOLOGY_VERSION),
  revision: z.number().int().positive(),
  contentDigest: digestSchema,
  previousRevision: digestSchema.nullable(),
  createdAt: timestamp,
  updatedAt: timestamp,
  createdBy: text,
  runRef: id.nullable(),
  sourceRefs: ids,
  evidenceRefs: ids,
  uncertainties: z.array(text),
  summary: text,
  language: z.enum(["en", "und"]),
  audiences: z.array(z.enum(["contributors", "reviewers", "practitioners"])),
  topics: z.array(z.enum(["regenerative-finance", "knowledge-commons"])),
  maturity: z.enum(["draft", "developing", "established", "superseded"]),
  publicUseBoundary: z.strictObject({
    access: z.enum(["private", "restricted", "public"]),
    intendedUse: text,
    reuseStatus: z.enum(["unknown", "permission-required", "permitted"]),
    attributionRequirements: z.array(text),
  }),
  assessmentRefs: ids,
});

export const articleSchema = knowledgeObjectBaseSchema.extend({
  class: z.literal("Article"),
  body: text,
  purpose: text,
  sourceRefs: ids.min(1),
  evidenceRefs: ids.min(1),
});
export const sourceSchema = knowledgeObjectBaseSchema.extend({
  class: z.literal("Source"),
  url,
  sourceSystem: text,
  nativeIds: z.strictObject({
    topicId: text,
    postIds: z.array(text).min(1).max(500),
  }),
  retrievedAt: timestamp,
  captureDigest: digestSchema,
  captureRef: text,
  captureStatus: z.enum(["complete", "incomplete"]),
  reuseStatus: z.enum(["unknown", "permission-required", "permitted"]),
  authoredAt: timestamp.nullable(),
  sourceUpdatedAt: timestamp.nullable(),
});
export const claimSchema = knowledgeObjectBaseSchema.extend({
  class: z.literal("Claim"),
  statement: text,
  claimMode: z.enum(["planned", "reported", "observed", "disputed"]),
  scope: z.strictObject({
    attribution: text,
    startDate: timestamp.nullable(),
    endDate: timestamp.nullable(),
    basis: z.enum(["proposal", "self-report", "direct-observation", "dispute"]),
  }),
  evidence: z.array(evidenceSchema).min(1).max(200),
  sourceRefs: ids.min(1),
  evidenceRefs: ids.min(1),
});
export const knowledgeObjectSchema = z.discriminatedUnion("class", [
  articleSchema,
  sourceSchema,
  claimSchema,
]);

export const captureSchema = z.strictObject({
  sourceId: id,
  sourceSystem: text,
  topicId: text,
  url,
  retrievedAt: timestamp,
  digest: digestSchema,
  captureRef: text,
  status: z.enum(["complete", "incomplete"]),
  depth: z.literal(0),
  expectedPostIds: z.array(text).min(1).max(500),
  posts: z
    .array(
      z.strictObject({
        nativePostId: text,
        postNumber: z.number().int().positive().optional(),
        author: text,
        createdAt: timestamp,
        updatedAt: timestamp.nullable(),
        text,
      }),
    )
    .min(1)
    .max(500),
});
export const validationRequestSchema = z.strictObject({
  objects: z.array(knowledgeObjectSchema).min(1).max(100),
  captures: z.array(captureSchema).min(1).max(20),
  evidence: z.array(evidenceSchema).max(200),
});
export const runSchema = z.strictObject({
  id,
  callerId: text,
  idempotencyKey: text,
  requestDigest: digestSchema,
  ontologyVersion: z.literal(ONTOLOGY_VERSION),
  registryDigest: digestSchema,
  state: z.enum([
    "queued",
    "capturing",
    "extracting",
    "validating",
    "completed",
    "failed",
  ]),
  attempt: z.number().int().nonnegative(),
  createdAt: timestamp,
  updatedAt: timestamp,
  sourceDigests: z.array(digestSchema),
  candidateDigests: z.array(digestSchema),
  provider: text.nullable(),
  model: text.nullable(),
  usage: z
    .strictObject({
      inputTokens: z.number().int().nonnegative(),
      outputTokens: z.number().int().nonnegative(),
      costUsd: z.number().nonnegative().nullable(),
    })
    .nullable(),
  failure: z.strictObject({ code: text, retryable: z.boolean() }).nullable(),
});
export const reportSchema = z.strictObject({
  runId: id,
  runDigest: digestSchema,
  ontologyVersion: z.literal(ONTOLOGY_VERSION),
  registryDigest: digestSchema,
  sourceDigests: z.array(digestSchema),
  candidateDigests: z.array(digestSchema),
  generatedAt: timestamp,
  markdownDigest: digestSchema,
  artifactRef: text,
  humanReview: z.literal("pending"),
  approval: z.literal("unapproved"),
  publication: z.literal("disabled"),
});

export type KnowledgeObject = z.infer<typeof knowledgeObjectSchema>;
export type Capture = z.infer<typeof captureSchema>;
export type Evidence = z.infer<typeof evidenceSchema>;
export type ValidationRequest = z.infer<typeof validationRequestSchema>;
export type Run = z.infer<typeof runSchema>;
export type Report = z.infer<typeof reportSchema>;

// JSON values only. Sorted object keys, preserved array order, UTF-8, no whitespace.
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    return `{${Object.entries(value)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([key, val]) => `${JSON.stringify(key)}:${canonicalJson(val)}`)
      .join(",")}}`;
  }
  const encoded = JSON.stringify(value);
  if (encoded === undefined) throw new Error("Canonical value must be JSON");
  return encoded;
}
export async function digest(value: unknown): Promise<string> {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(canonicalJson(value)),
  );
  return `sha256:${Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}
export function contentDigest(object: KnowledgeObject): Promise<string> {
  const {
    contentDigest: _digest,
    assessmentRefs: _assessments,
    ...payload
  } = object;
  return digest(payload);
}
export function captureDigest(capture: Capture): Promise<string> {
  const { digest: _digest, ...payload } = capture;
  return digest(payload);
}

export const registry = {
  version: ONTOLOGY_VERSION,
  status: "unratified",
  pin: null,
  enabledClasses: ["Article", "Source", "Claim"],
  predicates: [],
  geoMappings: null,
  conventions: {
    canonicalization:
      "Sorted JSON object keys; array order preserved; UTF-8; no whitespace",
    contentDigest:
      "SHA-256 of object excluding contentDigest and assessmentRefs",
    captureDigest: "SHA-256 of full capture excluding digest",
    sourceRevisionDigest: "Capture digest, not Source object contentDigest",
    selector:
      "UTF-16 start inclusive/end exclusive in captured post text; exact must match",
    vocabularies:
      "Provisional pilot terms, not ratified; other languages/topics require a versioned change",
  },
  schemas: Object.fromEntries(
    Object.entries({
      knowledgeObject: knowledgeObjectSchema,
      capture: captureSchema,
      evidence: evidenceSchema,
      validationRequest: validationRequestSchema,
      run: runSchema,
      report: reportSchema,
    }).map(([name, schema]) => [name, z.toJSONSchema(schema)]),
  ),
} as const;
export async function getRegistry() {
  return { ...registry, digest: await digest(registry) };
}
