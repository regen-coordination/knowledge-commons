import { getRegistry, validateDraft } from "./index";
import {
  digest,
  IngestionError,
  stableId,
  type ValidationRequest,
} from "./ingestion";
import { assessmentBinding } from "./integrity";

export const GEO_MAPPING = {
  version: "commons-geo-preview/0.1",
  status: "unratified",
  format: "symbolic-operation-preview",
  classes: ["Article", "Source", "Claim"],
  properties: [
    "title",
    "contentDigest",
    "summary",
    "body",
    "statement",
    "claimMode",
    "scope",
    "url",
    "captureDigest",
    "publicUseBoundary",
  ],
  relations: ["sourceRefs"],
  geoIds: null,
} as const;
export type GeoTarget = { network: string; spaceId: string; proposer: string };

/** Private, deterministic preview. Symbolic property names are never Geo ontology IDs. */
export async function prepareGeo(
  draft: ValidationRequest,
  binding: {
    runId: string;
    reportDigest: string;
    assessmentDigest: string | null;
    target: GeoTarget | null;
    publicUseScope: string;
  },
) {
  if (!(await validateDraft(draft)).valid)
    throw new IngestionError("geo_candidate_invalid");
  if (!binding.publicUseScope.trim())
    throw new IngestionError("geo_scope_required");
  const registry = await getRegistry();
  const entities = [...draft.objects]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((o) => ({
      entityId: o.id.replaceAll("-", ""),
      commonsId: o.id,
      class: o.class,
      properties: {
        title: o.title,
        contentDigest: o.contentDigest,
        publicUseBoundary: o.publicUseBoundary,
        ...(o.class === "Article"
          ? { summary: o.summary, body: o.body }
          : o.class === "Claim"
            ? { statement: o.statement, claimMode: o.claimMode, scope: o.scope }
            : { url: o.url, captureDigest: o.captureDigest }),
      },
      evidenceRefs: [...o.evidenceRefs].sort(),
    }));
  const relations = [];
  for (const o of [...draft.objects].sort((a, b) => a.id.localeCompare(b.id))) {
    for (const source of [...o.sourceRefs].sort())
      relations.push({
        relationId: (
          await stableId(`commons-geo:source:${o.id}:${source}`)
        ).replaceAll("-", ""),
        from: o.id.replaceAll("-", ""),
        property: "sourceRefs",
        to: source.replaceAll("-", ""),
      });
  }
  const operations = { entities, relations };
  const operationDigest = await digest(operations);
  const identity = {
    ...binding,
    candidateDigest: await assessmentBinding(draft),
    registryDigest: registry.digest,
    mappingDigest: await digest(GEO_MAPPING),
    operationDigest,
  };
  return {
    ...identity,
    preparationDigest: await digest(identity),
    mapping: GEO_MAPPING,
    operations,
    status: "prepared-locally" as const,
    submission: "disabled" as const,
    blockers: [
      ...(!binding.target ? ["geo_target_not_configured"] : []),
      "geo_property_and_type_ids_unmapped",
      "ontology_and_mapping_unratified",
      "proposal_visibility_and_governance_unverified",
      "sdk_encoding_unverified",
      "public_use_scope_unapproved",
      "two_exact_scope_human_approvals_pending",
    ],
  };
}
export type GeoPreparation = Awaited<ReturnType<typeof prepareGeo>>;

// Adapter contract rehearsal: the future transport must resolve authoritative receipts.
// No production route accepts these events or fabricates verification from this state.
export type GeoProgress = {
  intentDigest: string;
  operationDigest: string;
  stage: "intent" | "uncertain" | "proposed" | "executed" | "indexed";
  proposalId: string | null;
  transactionId: string | null;
  checkpoint: string | null;
};
export function reconcileGeo(
  state: GeoProgress,
  observed: {
    intentDigest: string;
    operationDigest: string;
    stage: "uncertain" | "proposed" | "executed" | "indexed";
    proposalId?: string;
    transactionId?: string;
    checkpoint?: string;
  },
): GeoProgress {
  if (
    state.intentDigest !== observed.intentDigest ||
    state.operationDigest !== observed.operationDigest
  )
    throw new IngestionError("geo_receipt_revision_mismatch");
  if (
    state.proposalId &&
    observed.proposalId &&
    state.proposalId !== observed.proposalId
  )
    throw new IngestionError("geo_proposal_conflict");
  if (
    state.transactionId &&
    observed.transactionId &&
    state.transactionId !== observed.transactionId
  )
    throw new IngestionError("geo_transaction_conflict");
  const rank = {
    intent: 0,
    uncertain: 1,
    proposed: 2,
    executed: 3,
    indexed: 4,
  };
  if (rank[observed.stage] < rank[state.stage]) return state;
  const next = { ...state, ...observed };
  if (rank[next.stage] >= 2 && !next.proposalId)
    throw new IngestionError("geo_proposal_missing");
  if (rank[next.stage] >= 3 && (!next.transactionId || rank[state.stage] < 2))
    throw new IngestionError("geo_execution_unverified");
  if (next.stage === "indexed" && (!next.checkpoint || rank[state.stage] < 3))
    throw new IngestionError("geo_index_unverified");
  return next;
}
