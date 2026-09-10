import { Graph, ContentIds, SystemIds, type Op } from "@geoprotocol/geo-sdk";
import { gql, queryTypeByName, publishOps, printOpsSummary } from "../src/functions.js";

// ─── CLI args ────────────────────────────────────────────────────────────────

const AI_SPACE_ID = "41e851610e13a19441c4d980f2f2ce6b";

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag: string) => {
    const i = args.indexOf(flag);
    return i !== -1 && args[i + 1] ? args[i + 1] : undefined;
  };
  return {
    publish: args.includes("--publish"),
    spaceId: get("--space") ?? AI_SPACE_ID,
  };
}

// ─── Type resolution helpers ─────────────────────────────────────────────────

/**
 * Look up a Type entity by name (type-filtered) and return all matches.
 * Unlike queryTypeByName which returns only the first, this returns all
 * so the caller can see when ambiguity exists.
 */
async function findTypesByName(
  name: string
): Promise<Array<{ id: string; name: string }>> {
  const data = await gql(`{
    search(
      query: ${JSON.stringify(name)},
      first: 10,
      filter: { typeIds: { anyEqualTo: "${SystemIds.SCHEMA_TYPE}" } }
    ) { id name }
  }`);
  return (data.search ?? []).filter(
    (e: any) => e.name?.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Resolve a type ID with visible trail: SDK constant first, fall back to API.
 * Prints what it's doing so curators understand each step.
 */
async function resolveTypeWithTrail(
  typeName: string,
  sdkConstant: string | undefined
): Promise<string | null> {
  console.log(`\n  Resolving type: "${typeName}"`);

  if (sdkConstant) {
    console.log(`    SDK has a constant: ${sdkConstant}`);
    // Verify it against the API — SDK constants can drift.
    const api = await gql(`{
      entity(id: "${sdkConstant}") { id name types { id name } }
    }`);
    if (api.entity && api.entity.name?.toLowerCase() === typeName.toLowerCase()) {
      const isTypeEntity = (api.entity.types ?? []).some(
        (t: any) => t.id === SystemIds.SCHEMA_TYPE
      );
      if (isTypeEntity) {
        console.log(`    API verified: matches name AND is a Type entity`);
        return sdkConstant;
      }
      console.log(`    API mismatch: SDK id exists but is NOT a Type entity — ignoring`);
    } else {
      console.log(`    API mismatch: SDK id resolves to "${api.entity?.name ?? "(not found)"}"`);
    }
  } else {
    console.log(`    No SDK constant for "${typeName}" — falling back to API lookup`);
  }

  const matches = await findTypesByName(typeName);
  if (matches.length === 0) {
    console.log(`    API: no Type entities named "${typeName}" — you'd need to create one`);
    return null;
  }
  if (matches.length > 1) {
    console.log(`    API: ${matches.length} Type entities named "${typeName}":`);
    for (const m of matches) console.log(`      ${m.id}  ${m.name}`);
    console.log(`    Picking first. In production, pin to your team's canonical space.`);
  } else {
    console.log(`    API: 1 match found`);
  }
  return matches[0].id;
}

// ─── Space-scoped entity lookup ──────────────────────────────────────────────

async function findEntityInSpace(
  name: string,
  spaceId: string
): Promise<{ id: string; name: string; types: string[] } | null> {
  const data = await gql(`{
    search(
      query: ${JSON.stringify(name)},
      spaceId: "${spaceId}",
      first: 5,
      filter: { name: { is: ${JSON.stringify(name)} } }
    ) { id name types { id name } }
  }`);
  const match = (data.search ?? []).find(
    (e: any) => e.name?.toLowerCase() === name.toLowerCase()
  );
  if (!match) return null;
  return {
    id: match.id,
    name: match.name,
    types: (match.types ?? []).map((t: any) => t.name),
  };
}

// ─── Main walkthrough ────────────────────────────────────────────────────────

async function main() {
  const { publish, spaceId } = parseArgs();

  console.log(`\n--- Create Typed Relations (${publish ? "PUBLISH" : "DRY RUN"}) ---`);
  console.log(`Space for lookups: ${spaceId}\n`);

  // ── Step 1: Resolve the relation target type ───────────────────────────────
  // Scenario: we're creating an AI dataset entity "ImageNet" that needs a
  // "Created by" relation pointing to an Organization entity ("Stanford Vision Lab").
  // First we need the ID of the "Organization" Type entity.
  console.log(`── Step 1: Resolve target entity type ───────────────────────`);

  // The SDK has some type constants (TOPIC_TYPE, TAG_TYPE, PUBLISHER_TYPE...)
  // but NOT Organization. Show this clearly.
  const orgTypeId = await resolveTypeWithTrail("Organization", undefined);
  if (!orgTypeId) {
    console.error(`\nCannot continue without an Organization type. Exiting.`);
    process.exit(1);
  }

  // Contrast: Topic IS in the SDK — show the verification flow
  const topicTypeId = await resolveTypeWithTrail("Topic", ContentIds.TOPIC_TYPE);
  if (!topicTypeId) {
    console.error(`\nSDK TOPIC_TYPE constant no longer matches API. Investigate.`);
    process.exit(1);
  }

  // ── Step 2: Build the relation property (RELATION dataType) ────────────────
  console.log(`\n── Step 2: Declare the relation property ────────────────────`);

  const createdByProp = Graph.createProperty({ name: "Created by", dataType: "RELATION" });
  console.log(`  Graph.createProperty({ name: "Created by", dataType: "RELATION" })`);
  console.log(`    id: ${createdByProp.id}`);
  console.log(`    (${createdByProp.ops.length} ops)`);

  const ops: Op[] = [...createdByProp.ops];

  // ── Step 3: Create the source entity (the dataset) ─────────────────────────
  console.log(`\n── Step 3: Create the dataset entity ────────────────────────`);

  const datasetTypeId = await queryTypeByName("Dataset");
  if (!datasetTypeId) {
    console.log(`  "Dataset" type not found in knowledge graph.`);
    console.log(`  In a real script you'd create it with Graph.createType(...).`);
    console.log(`  For this demo, using an untyped dataset so we focus on relation targets.`);
  }

  const dataset = Graph.createEntity({
    name: "ImageNet",
    types: datasetTypeId ? [datasetTypeId] : [],
    values: [],
  });
  console.log(`  Graph.createEntity({ name: "ImageNet", types: [${datasetTypeId ? '"Dataset"' : ""}] })`);
  console.log(`    id: ${dataset.id}`);
  ops.push(...dataset.ops);

  // ── Step 4 — Pattern A: target ALREADY EXISTS ──────────────────────────────
  console.log(`\n── Step 4a: Pattern A — target already exists ───────────────`);
  console.log(`  Looking up "Stanford University" in space ${spaceId.slice(0, 8)}...`);

  const existing = await findEntityInSpace("Stanford University", spaceId);
  let stanfordId: string;
  if (existing) {
    stanfordId = existing.id;
    const typeLabel = existing.types.length > 0 ? existing.types.join(", ") : "untyped";
    console.log(`    FOUND: ${existing.id}  types: [${typeLabel}]`);
    console.log(`    Reusing this entity — no creation needed.`);
  } else {
    console.log(`    NOT FOUND. Would fall through to Pattern B to create it.`);
    const newStanford = Graph.createEntity({
      name: "Stanford University",
      types: [orgTypeId],  // ← the type we resolved in Step 1
      values: [],
    });
    stanfordId = newStanford.id;
    ops.push(...newStanford.ops);
    console.log(`    Created: ${stanfordId}  types: [Organization]`);
  }

  const stanfordRel = Graph.createRelation({
    fromEntity: dataset.id,
    toEntity: stanfordId,
    type: createdByProp.id,
  });
  ops.push(...stanfordRel.ops);
  console.log(`  Relation: ImageNet ─[Created by]→ Stanford University  (${stanfordRel.ops.length} ops)`);

  // ── Step 4 — Pattern B: target DOES NOT EXIST ──────────────────────────────
  console.log(`\n── Step 4b: Pattern B — target does not exist ───────────────`);
  const newOrgName = `Stanford Vision Lab ${Date.now()}`;  // unique for demo
  console.log(`  Looking up "${newOrgName}" (intentionally unique to demonstrate creation)...`);

  const maybe = await findEntityInSpace(newOrgName, spaceId);
  let visionLabId: string;
  if (maybe) {
    visionLabId = maybe.id;
    console.log(`    FOUND (unexpected): ${maybe.id}`);
  } else {
    console.log(`    NOT FOUND — creating WITH type: [Organization]`);
    console.log(`\n    WRONG (Hasnat's bug):`);
    console.log(`      Graph.createEntity({ name: "${newOrgName}", types: [], values: [] })`);
    console.log(`      → orphan shell, no type, not classifiable in the graph`);
    console.log(`\n    RIGHT:`);
    console.log(`      Graph.createEntity({ name: "${newOrgName}", types: ["${orgTypeId.slice(0, 8)}..."], values: [] })`);
    console.log(`      → typed Organization entity, discoverable by type queries`);

    const visionLab = Graph.createEntity({
      name: newOrgName,
      types: [orgTypeId],  // ← THIS is the fix
      values: [],
    });
    visionLabId = visionLab.id;
    ops.push(...visionLab.ops);
    console.log(`\n    Created: ${visionLabId}  types: [Organization]`);
  }

  const visionLabRel = Graph.createRelation({
    fromEntity: dataset.id,
    toEntity: visionLabId,
    type: createdByProp.id,
  });
  ops.push(...visionLabRel.ops);
  console.log(`  Relation: ImageNet ─[Created by]→ ${newOrgName}  (${visionLabRel.ops.length} ops)`);

  // ── Step 5: Dry-run summary or publish ─────────────────────────────────────
  console.log(`\n── Step 5: ${publish ? "Publish" : "Dry-run summary"} ──────────────────────────────`);
  printOpsSummary(ops);

  if (!publish) {
    console.log(`\n  Dry run — nothing published. Run with --publish to commit to your personal space.`);
    console.log(`\n--- Done ---\n`);
    return;
  }

  const privateKey = process.env.PRIVATE_KEY as `0x${string}` | undefined;
  if (!privateKey) {
    console.error(`\n  --publish requires PRIVATE_KEY in .env`);
    console.error(`  Export your wallet: https://www.geobrowser.io/export-wallet`);
    process.exit(1);
  }

  console.log(`\n  Publishing ${ops.length} ops to personal space...`);
  const result = await publishOps({
    ops,
    editName: "Demo: typed relation targets (script 05)",
    privateKey,
    useSmartAccount: true,
    network: "TESTNET",
  });

  if (result.success) {
    console.log(`\n  Published!`);
    console.log(`    Space: ${result.spaceId}`);
    console.log(`    Edit:  ${result.editId}`);
    console.log(`    TX:    ${result.transactionHash}`);
  } else {
    console.error(`\n  Publish failed: ${result.error}`);
    process.exit(1);
  }

  console.log(`\n--- Done ---\n`);
}

// ─── Summary shown after main completes ──────────────────────────────────────

function summary() {
  console.log(`── Key takeaways ────────────────────────────────────────────`);
  console.log(`  1. Never use types: [] when creating relation targets.`);
  console.log(`     An untyped entity is a dead-end shell — name only, not classifiable.`);
  console.log(``);
  console.log(`  2. SDK constants are not exhaustive. "Organization" isn't in SystemIds`);
  console.log(`     or ContentIds — you must discover it via API. Others like TOPIC_TYPE,`);
  console.log(`     PUBLISHER_TYPE, SKILL_TYPE, TAG_TYPE ARE in the SDK.`);
  console.log(``);
  console.log(`  3. When API returns multiple Type entities with the same name,`);
  console.log(`     pick deliberately — the "right" one is the one your team or`);
  console.log(`     space already uses. Check with script 01 first.`);
  console.log(``);
  console.log(`  4. When relating to existing entities, always look up in your target`);
  console.log(`     space first (space-scoped) to avoid linking to an unrelated entity`);
  console.log(`     from a different space that happens to share a name.\n`);
}

main()
  .then(summary)
  .catch((err) => {
    console.error("Error:", err.message);
    process.exit(1);
  });
