import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { Graph, SystemIds, ContentIds, type Op } from "@geoprotocol/geo-sdk";
import { gql, queryTypeByName, publishOps, printOpsSummary } from "../src/functions.js";

// ─── CLI args ────────────────────────────────────────────────────────────────

const AI_SPACE_ID = "41e851610e13a19441c4d980f2f2ce6b";

interface Args {
  dataPath: string;
  schemaPath: string;
  spaceId: string;
  publish: boolean;
  verbose: boolean;
  outputPath: string;
}

function parseArgs(): Args {
  const args = process.argv.slice(2);
  const get = (flag: string) => {
    const i = args.indexOf(flag);
    return i !== -1 && args[i + 1] ? args[i + 1] : undefined;
  };
  const dataPath = get("--data");
  const schemaPath = get("--schema");
  if (!dataPath || !schemaPath) {
    console.error("Usage: npx tsx curator-courses/08-relations-from-data.ts --data <records.json> --schema <schema.json> [--space <id>] [--publish] [--verbose] [--output <report.json>]");
    console.error(`Try:   npx tsx curator-courses/08-relations-from-data.ts \\\n         --data data_to_publish/10-datasets-sample.json \\\n         --schema data_to_publish/10-datasets-schema.json`);
    process.exit(1);
  }
  return {
    dataPath,
    schemaPath,
    spaceId: get("--space") ?? AI_SPACE_ID,
    publish: args.includes("--publish"),
    verbose: args.includes("--verbose"),
    outputPath: get("--output") ?? "./output/relations-from-data-report.json",
  };
}

// ─── Schema types ────────────────────────────────────────────────────────────

interface FieldSchema {
  name: string;
  type: "text" | "relation";
  required?: boolean;
  targetTypeName?: string;  // only for relation fields
}

interface PublishSchema {
  entityType: string;  // e.g., "Dataset"
  fields: FieldSchema[];
}

// ─── Type resolution ─────────────────────────────────────────────────────────

// Map of well-known type names to SDK constants. Script checks SDK first
// (fast, no API round-trip) and falls back to queryTypeByName for the rest.
const SDK_TYPE_CONSTANTS: Record<string, string> = {
  Person: SystemIds.PERSON_TYPE,
  Topic: ContentIds.TOPIC_TYPE,
  Tag: ContentIds.TAG_TYPE,
  Skill: ContentIds.SKILL_TYPE,
  // NOT here: Organization, Dataset, Venue, Lab — these need API lookup.
};

async function resolveTypeId(name: string): Promise<string | null> {
  if (SDK_TYPE_CONSTANTS[name]) return SDK_TYPE_CONSTANTS[name];
  return queryTypeByName(name);
}

// ─── Space-scoped entity lookup (bulk) ───────────────────────────────────────

// Look up ALL relation target names in the space in a single query per field,
// not one query per target. For 50 records × 3 fields × 3 names = 450 lookups
// done as 3 queries instead of 450.
async function findEntitiesInSpace(
  names: string[],
  spaceId: string
): Promise<Map<string, string>> {
  const found = new Map<string, string>();
  if (names.length === 0) return found;

  for (const name of names) {
    const data = await gql(`{
      search(
        query: ${JSON.stringify(name)},
        spaceId: "${spaceId}",
        first: 5,
        filter: { name: { is: ${JSON.stringify(name)} } }
      ) { id name }
    }`);
    const hit = (data.search ?? []).find(
      (e: any) => e.name?.toLowerCase() === name.toLowerCase()
    );
    if (hit) found.set(name, hit.id);
  }
  return found;
}

// ─── Data loading ────────────────────────────────────────────────────────────

function loadRecords(path: string): Record<string, unknown>[] {
  const content = readFileSync(resolve(path), "utf-8");
  const parsed = JSON.parse(content);
  if (!Array.isArray(parsed)) throw new Error("records file must be a JSON array.");
  return parsed;
}

function loadSchema(path: string): PublishSchema {
  const schema = JSON.parse(readFileSync(resolve(path), "utf-8")) as PublishSchema;
  if (!schema.entityType) throw new Error("schema missing 'entityType'.");
  if (!Array.isArray(schema.fields)) throw new Error("schema missing 'fields' array.");
  return schema;
}

// ─── WRONG way: relations stored as text values ──────────────────────────────
// This is what Maxim and Ishita did. Relation target names get flattened into
// a comma-separated string and stored as a text value — no graph edges, no
// typed entities, no traversability. We build the ops here ONLY for the
// comparison; they are never published.

function buildWrongOps(
  records: Record<string, unknown>[],
  schema: PublishSchema
): Op[] {
  const ops: Op[] = [];
  const descProp = SystemIds.DESCRIPTION_PROPERTY;

  for (const rec of records) {
    const values: any[] = [];

    if (typeof rec.description === "string" && rec.description) {
      values.push({ property: descProp, type: "text", value: rec.description });
    }

    for (const field of schema.fields) {
      if (field.type !== "relation") continue;
      const raw = rec[field.name];
      if (!Array.isArray(raw) || raw.length === 0) continue;
      // Create a PROPERTY on the fly just to store the flattened string.
      // (In real WRONG-way code curators often invent properties named "authors_text".)
      const fakeProp = Graph.createProperty({ name: `${field.name}_text`, dataType: "TEXT" });
      ops.push(...fakeProp.ops);
      values.push({ property: fakeProp.id, type: "text", value: raw.join(", ") });
    }

    const e = Graph.createEntity({ name: String(rec.name), types: [], values });
    ops.push(...e.ops);
  }
  return ops;
}

// ─── RIGHT way: typed entities + typed relations ─────────────────────────────

interface BuildResult {
  ops: Op[];
  datasetCount: number;
  relationsCreated: number;
  targetsReused: number;
  targetsCreated: number;
  typeResolution: Array<{ fieldName: string; typeName: string; typeId: string | null; source: "sdk" | "api" | "missing" }>;
}

async function buildRightOps(
  records: Record<string, unknown>[],
  schema: PublishSchema,
  spaceId: string
): Promise<BuildResult> {
  const ops: Op[] = [];
  const descProp = SystemIds.DESCRIPTION_PROPERTY;

  // Resolve the dataset entity type itself.
  let datasetTypeId = await queryTypeByName(schema.entityType);
  if (!datasetTypeId) {
    const t = Graph.createType({ name: schema.entityType });
    ops.push(...t.ops);
    datasetTypeId = t.id;
  }

  // Resolve the target type for each relation field. Also track WHERE each
  // type came from (SDK constant vs API lookup) so the report can show it.
  const typeResolution: BuildResult["typeResolution"] = [];
  const fieldToTargetType = new Map<string, string>();

  for (const field of schema.fields) {
    if (field.type !== "relation" || !field.targetTypeName) continue;
    const source: "sdk" | "api" | "missing" = SDK_TYPE_CONSTANTS[field.targetTypeName]
      ? "sdk"
      : "api";
    const typeId = await resolveTypeId(field.targetTypeName);
    typeResolution.push({ fieldName: field.name, typeName: field.targetTypeName, typeId, source: typeId ? source : "missing" });
    if (!typeId) {
      console.warn(`  WARNING: target type "${field.targetTypeName}" not found for field "${field.name}" — skipping its relations.`);
      continue;
    }
    fieldToTargetType.set(field.name, typeId);
  }

  // Declare one RELATION property per relation field. In production you'd
  // look these up (ContentIds.AUTHORS_PROPERTY exists for "authors", for
  // example) — for clarity we create them inline here.
  const fieldToRelProp = new Map<string, string>();
  for (const field of schema.fields) {
    if (field.type !== "relation") continue;
    const prop = Graph.createProperty({ name: field.name, dataType: "RELATION" });
    ops.push(...prop.ops);
    fieldToRelProp.set(field.name, prop.id);
  }

  // Unique-name dedup: for each relation field, collect ALL target names
  // across ALL records, uppercase-trimmed, then look them up once.
  const uniqueNamesByField = new Map<string, Set<string>>();
  for (const field of schema.fields) {
    if (field.type !== "relation") continue;
    const names = new Set<string>();
    for (const rec of records) {
      const raw = rec[field.name];
      if (!Array.isArray(raw)) continue;
      for (const n of raw) {
        if (typeof n === "string" && n.trim()) names.add(n.trim());
      }
    }
    uniqueNamesByField.set(field.name, names);
  }

  // For each field, look up existing entities in the target space. Cache
  // the resolved IDs. For not-found names, create a typed entity.
  const nameToEntityId = new Map<string, string>();  // "field::name" → id
  let targetsReused = 0;
  let targetsCreated = 0;

  for (const [fieldName, names] of uniqueNamesByField) {
    const targetTypeId = fieldToTargetType.get(fieldName);
    if (!targetTypeId) continue;  // skipped — missing type

    const existing = await findEntitiesInSpace([...names], spaceId);

    for (const name of names) {
      const key = `${fieldName}::${name}`;
      const existingId = existing.get(name);
      if (existingId) {
        nameToEntityId.set(key, existingId);
        targetsReused++;
      } else {
        const entity = Graph.createEntity({
          name,
          types: [targetTypeId],  // ← correct type, NOT types: []
          values: [],
        });
        ops.push(...entity.ops);
        nameToEntityId.set(key, entity.id);
        targetsCreated++;
      }
    }
  }

  // Now build the dataset entities and their relations.
  let relationsCreated = 0;
  let datasetCount = 0;

  for (const rec of records) {
    if (typeof rec.name !== "string" || !rec.name.trim()) continue;

    const values: any[] = [];
    if (typeof rec.description === "string" && rec.description) {
      values.push({ property: descProp, type: "text", value: rec.description });
    }

    const dataset = Graph.createEntity({
      name: rec.name,
      types: [datasetTypeId],
      values,
    });
    ops.push(...dataset.ops);
    datasetCount++;

    for (const field of schema.fields) {
      if (field.type !== "relation") continue;
      const relPropId = fieldToRelProp.get(field.name);
      if (!relPropId) continue;
      const raw = rec[field.name];
      if (!Array.isArray(raw)) continue;

      for (const targetName of raw) {
        if (typeof targetName !== "string" || !targetName.trim()) continue;
        const key = `${field.name}::${targetName.trim()}`;
        const toId = nameToEntityId.get(key);
        if (!toId) continue;  // target type was missing — already warned

        const rel = Graph.createRelation({
          fromEntity: dataset.id,
          toEntity: toId,
          type: relPropId,
        });
        ops.push(...rel.ops);
        relationsCreated++;
      }
    }
  }

  return { ops, datasetCount, relationsCreated, targetsReused, targetsCreated, typeResolution };
}

// ─── Report + preview ────────────────────────────────────────────────────────

function countOpsByType(ops: Op[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const op of ops) {
    const t = (op as any).type ?? "unknown";
    counts[t] = (counts[t] ?? 0) + 1;
  }
  return counts;
}

function printComparison(wrongOps: Op[], right: BuildResult) {
  const wrongEntities = countOpsByType(wrongOps).createEntity ?? 0;
  const rightEntities = countOpsByType(right.ops).createEntity ?? 0;
  const rightTotalRelOps = countOpsByType(right.ops).createRelation ?? 0;

  console.log(`\n── WRONG vs RIGHT ──────────────────────────────────────────`);
  console.log(`  WRONG (text values)`);
  console.log(`    ${wrongOps.length} ops · ${wrongEntities} entities · 0 data relations`);
  console.log(`    "Fei-Fei Li, Jia Deng, Kai Li" sits as a dead string on the dataset entity.`);
  console.log(`    No way to query "datasets by Fei-Fei Li" — the name is not an entity.`);
  console.log(``);
  console.log(`  RIGHT (typed relations)`);
  console.log(`    ${right.ops.length} ops · ${rightEntities} entities · ${right.relationsCreated} data relations`);
  console.log(`    ${right.targetsReused} target entities reused from the space, ${right.targetsCreated} newly created.`);
  console.log(`    (Total createRelation ops: ${rightTotalRelOps} — the extra ${rightTotalRelOps - right.relationsCreated} are schema`);
  console.log(`    relations that define the property/type structure. Data relations are the`);
  console.log(`    ${right.relationsCreated} edges that connect your datasets to authors/orgs/topics.)`);
  console.log(``);
  console.log(`  The RIGHT approach costs more ops but gives you a real graph — queries`);
  console.log(`  like "all datasets by Stanford Vision Lab" become a single traversal.`);
}

function printPreview(right: BuildResult, verbose: boolean) {
  console.log(`\n── RIGHT-way preview ───────────────────────────────────────`);
  printOpsSummary(right.ops);

  console.log(`\n  Type resolution:`);
  for (const t of right.typeResolution) {
    const tag = t.source === "sdk" ? "SDK" : t.source === "api" ? "API" : "MISSING";
    console.log(`    ${t.fieldName.padEnd(16)} → ${t.typeName.padEnd(14)} [${tag}]  ${t.typeId ?? "(not found — relations skipped)"}`);
  }

  if (verbose) {
    console.log(`\n  Op dump (--verbose):`);
    for (let i = 0; i < right.ops.length; i++) {
      const op: any = right.ops[i];
      console.log(`    [${i}] ${op.type ?? "?"}`);
    }
  }
}

function writeReport(args: Args, schema: PublishSchema, wrongOps: Op[], right: BuildResult) {
  const report = {
    generatedAt: new Date().toISOString(),
    source: args.dataPath,
    schema: args.schemaPath,
    targetSpace: args.spaceId,
    entityType: schema.entityType,
    comparison: {
      wrong: { totalOps: wrongOps.length, breakdown: countOpsByType(wrongOps), relationsCreated: 0 },
      right: {
        totalOps: right.ops.length,
        breakdown: countOpsByType(right.ops),
        datasetsCreated: right.datasetCount,
        relationsCreated: right.relationsCreated,
        targetsReused: right.targetsReused,
        targetsCreated: right.targetsCreated,
      },
    },
    typeResolution: right.typeResolution,
  };
  const resolvedOutput = resolve(args.outputPath);
  mkdirSync(dirname(resolvedOutput), { recursive: true });
  writeFileSync(resolvedOutput, JSON.stringify(report, null, 2), "utf-8");
  console.log(`\n  Report saved: ${args.outputPath}`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs();
  console.log(`\n--- Relations From Data (${args.publish ? "PUBLISH" : "DRY RUN"}) ---`);
  console.log(`Data        : ${args.dataPath}`);
  console.log(`Schema      : ${args.schemaPath}`);
  console.log(`Target space: ${args.spaceId}`);

  const schema = loadSchema(args.schemaPath);
  const records = loadRecords(args.dataPath);
  console.log(`\nLoaded ${records.length} records, entityType = "${schema.entityType}".\n`);

  const wrongOps = buildWrongOps(records, schema);
  const right = await buildRightOps(records, schema, args.spaceId);

  printComparison(wrongOps, right);
  printPreview(right, args.verbose);
  writeReport(args, schema, wrongOps, right);

  if (!args.publish) {
    console.log(`\n  Dry run — nothing published. Re-run with --publish to commit the RIGHT ops to your space.\n`);
    return;
  }

  const privateKey = process.env.PRIVATE_KEY as `0x${string}` | undefined;
  if (!privateKey) {
    console.error(`\n  --publish requires PRIVATE_KEY in .env`);
    process.exit(1);
  }

  console.log(`\n  Publishing ${right.ops.length} RIGHT ops (${right.datasetCount} datasets, ${right.relationsCreated} relations)...`);
  const result = await publishOps({
    ops: right.ops,
    editName: `${schema.entityType} batch with typed relations (script 10)`,
    privateKey,
    useSmartAccount: true,
    network: "TESTNET",
    spaceId: args.spaceId === AI_SPACE_ID ? undefined : args.spaceId,
  });

  if (!result.success) {
    console.error(`\n  Publish failed: ${result.error}`);
    process.exit(1);
  }

  console.log(`\n  Published!`);
  console.log(`    Space: ${result.spaceId}`);
  console.log(`    Edit:  ${result.editId}`);
  console.log(`    TX:    ${result.transactionHash}\n`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
