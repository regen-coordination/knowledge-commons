import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { SystemIds } from "@geoprotocol/geo-sdk";
import { gql, queryPropertyByName } from "../src/functions.js";

// ─── CLI args ────────────────────────────────────────────────────────────────

const AI_SPACE_ID = "41e851610e13a19441c4d980f2f2ce6b";

interface Args {
  dataPath: string;
  schemaPath: string;
  spaceId: string;
  outputPath: string;
  verbose: boolean;
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
    console.error("Usage: npx tsx curator-courses/09-verify-published-entities.ts --data <records.json> --schema <schema.json> [--space <id>] [--output <report.json>] [--verbose]");
    process.exit(1);
  }
  return {
    dataPath,
    schemaPath,
    spaceId: get("--space") ?? AI_SPACE_ID,
    outputPath: get("--output") ?? "./output/verification-report.json",
    verbose: args.includes("--verbose"),
  };
}

// ─── Schema types (compatible with script 10's schema) ───────────────────────

interface FieldSchema {
  name: string;
  type: "text" | "date" | "integer" | "float" | "boolean" | "url" | "relation";
  required?: boolean;
  targetTypeName?: string;
}

interface PublishSchema {
  entityType: string;
  fields: FieldSchema[];
}

function loadRecords(path: string): Record<string, unknown>[] {
  const parsed = JSON.parse(readFileSync(resolve(path), "utf-8"));
  if (!Array.isArray(parsed)) throw new Error("records file must be a JSON array.");
  return parsed;
}

function loadSchema(path: string): PublishSchema {
  const schema = JSON.parse(readFileSync(resolve(path), "utf-8")) as PublishSchema;
  if (!schema.entityType || !Array.isArray(schema.fields)) {
    throw new Error("schema missing 'entityType' or 'fields'.");
  }
  return schema;
}

// ─── Property ID resolution ──────────────────────────────────────────────────

// For VALUE fields we need a property ID so we can look up the stored value.
// `description` is a well-known SDK constant; everything else we discover by
// name. If a property can't be resolved, we mark its checks as SKIPPED rather
// than failing — the curator may have used a custom property not registered
// by name in the space.

const SDK_PROPERTY_CONSTANTS: Record<string, string> = {
  description: SystemIds.DESCRIPTION_PROPERTY,
};

async function resolveValueFieldPropertyIds(
  schema: PublishSchema
): Promise<Map<string, string | null>> {
  const map = new Map<string, string | null>();
  for (const field of schema.fields) {
    if (field.type === "relation" || field.name === "name") continue;
    const sdkId = SDK_PROPERTY_CONSTANTS[field.name];
    if (sdkId) {
      map.set(field.name, sdkId);
      continue;
    }
    const apiId = await queryPropertyByName(field.name);
    map.set(field.name, apiId);
  }
  return map;
}

// ─── Space-scoped entity fetch with values + relations ───────────────────────

interface EntitySnapshot {
  id: string;
  name: string | null;
  types: Array<{ id: string; name: string }>;
  values: Array<{ propertyId: string; text: string | null; integer: string | null; boolean: boolean | null; date: string | null; decimal: string | null }>;
  relationCount: number;
}

async function fetchEntityByName(
  name: string,
  spaceId: string
): Promise<EntitySnapshot | null> {
  const data = await gql(`{
    search(
      query: ${JSON.stringify(name)},
      spaceId: "${spaceId}",
      first: 5,
      filter: { name: { is: ${JSON.stringify(name)} } }
    ) { id name types { id name } }
  }`);
  const hit = (data.search ?? []).find(
    (e: any) => e.name?.toLowerCase() === name.toLowerCase()
  );
  if (!hit) return null;

  // Second round-trip to get values + relation count for the found entity.
  // The search query doesn't expose nested values cleanly, so we go direct.
  const detail = await gql(`{
    entity(id: "${hit.id}") {
      id name
      types { id name }
      values(first: 50) {
        nodes { propertyId text integer boolean date decimal }
      }
      relations(first: 1) { totalCount }
    }
  }`);
  if (!detail.entity) return null;

  return {
    id: detail.entity.id,
    name: detail.entity.name ?? null,
    types: detail.entity.types ?? [],
    values: detail.entity.values?.nodes ?? [],
    relationCount: detail.entity.relations?.totalCount ?? 0,
  };
}

// ─── Per-record verification ─────────────────────────────────────────────────

interface VerificationIssue {
  record: number;
  recordName: string;
  field: string;
  issue: string;
}

interface RecordResult {
  index: number;
  name: string;
  status: "pass" | "missing" | "incomplete";
  entityId?: string;
  issues: VerificationIssue[];
}

function compareValue(
  sourceValue: unknown,
  value: EntitySnapshot["values"][number],
  fieldType: FieldSchema["type"]
): string | null {
  // Return null if the stored value matches the source, or a short issue
  // describing the mismatch. `value` is one row from entity.values whose
  // propertyId matched the field.
  switch (fieldType) {
    case "text":
    case "url":
      if (value.text == null) return "stored value is null";
      if (String(sourceValue) !== value.text) {
        return `stored "${value.text.slice(0, 40)}..." ≠ source "${String(sourceValue).slice(0, 40)}..."`;
      }
      return null;
    case "date":
      if (value.date == null) return "stored date is null";
      // API returns ISO — source is expected to be "YYYY-MM-DD" after validation.
      if (String(value.date).slice(0, 10) !== String(sourceValue)) {
        return `stored date ${value.date} ≠ source ${sourceValue}`;
      }
      return null;
    case "integer":
      if (value.integer == null) return "stored integer is null";
      if (String(value.integer) !== String(sourceValue)) {
        return `stored ${value.integer} ≠ source ${sourceValue}`;
      }
      return null;
    case "float":
      if (value.decimal == null) return "stored float is null";
      if (Number(value.decimal) !== Number(sourceValue)) {
        return `stored ${value.decimal} ≠ source ${sourceValue}`;
      }
      return null;
    case "boolean":
      if (value.boolean == null) return "stored boolean is null";
      if (value.boolean !== Boolean(sourceValue)) {
        return `stored ${value.boolean} ≠ source ${sourceValue}`;
      }
      return null;
    default:
      return null;  // Unhandled field types pass silently.
  }
}

async function verifyRecord(
  record: Record<string, unknown>,
  index: number,
  schema: PublishSchema,
  spaceId: string,
  propertyIds: Map<string, string | null>,
  expectedTypeName: string
): Promise<RecordResult> {
  const name = String(record.name ?? "");
  const issues: VerificationIssue[] = [];

  if (!name) {
    return {
      index,
      name: "(blank)",
      status: "missing",
      issues: [{ record: index, recordName: "(blank)", field: "name", issue: "source record has no name — cannot look up" }],
    };
  }

  const entity = await fetchEntityByName(name, spaceId);
  if (!entity) {
    return {
      index,
      name,
      status: "missing",
      issues: [{ record: index, recordName: name, field: "_exists", issue: "entity not found in space — never published, wrong space, or name mismatch" }],
    };
  }

  if (!entity.name) {
    issues.push({ record: index, recordName: name, field: "name", issue: "entity exists but stored name is null" });
  }

  const hasExpectedType = entity.types.some((t) => t.name?.toLowerCase() === expectedTypeName.toLowerCase());
  if (!hasExpectedType) {
    const actual = entity.types.map((t) => t.name).join(", ") || "(untyped)";
    issues.push({ record: index, recordName: name, field: "_types", issue: `expected type "${expectedTypeName}", got [${actual}]` });
  }

  // Value fields — compare each one where we have a known property ID.
  for (const field of schema.fields) {
    if (field.name === "name" || field.type === "relation") continue;
    const sourceValue = record[field.name];
    if (sourceValue === undefined || sourceValue === null || sourceValue === "") continue;

    const propId = propertyIds.get(field.name);
    if (!propId) {
      issues.push({ record: index, recordName: name, field: field.name, issue: `no known property ID for "${field.name}" — cannot verify (skipped)` });
      continue;
    }

    const stored = entity.values.find((v) => v.propertyId === propId);
    if (!stored) {
      issues.push({ record: index, recordName: name, field: field.name, issue: "property exists in schema but no value found on the published entity" });
      continue;
    }

    const mismatch = compareValue(sourceValue, stored, field.type);
    if (mismatch) {
      issues.push({ record: index, recordName: name, field: field.name, issue: mismatch });
    }
  }

  // Relation fields — compare total expected count vs actual relation count.
  // We don't attribute relations to specific schema fields here; see the
  // header note for why.
  let expectedRelations = 0;
  for (const field of schema.fields) {
    if (field.type !== "relation") continue;
    const raw = record[field.name];
    if (Array.isArray(raw)) expectedRelations += raw.filter((x) => typeof x === "string" && x.trim()).length;
  }
  if (expectedRelations > 0 && entity.relationCount < expectedRelations) {
    issues.push({
      record: index,
      recordName: name,
      field: "_relations",
      issue: `expected ≥${expectedRelations} relations, found ${entity.relationCount}`,
    });
  }

  const status: RecordResult["status"] = issues.length === 0 ? "pass" : "incomplete";
  return { index, name, status, entityId: entity.id, issues };
}

// ─── Report ──────────────────────────────────────────────────────────────────

function writeReport(args: Args, schema: PublishSchema, results: RecordResult[]) {
  const passed = results.filter((r) => r.status === "pass").length;
  const missing = results.filter((r) => r.status === "missing").length;
  const incomplete = results.filter((r) => r.status === "incomplete").length;
  const allIssues = results.flatMap((r) => r.issues);

  const report = {
    generatedAt: new Date().toISOString(),
    source: args.dataPath,
    schema: args.schemaPath,
    targetSpace: args.spaceId,
    entityType: schema.entityType,
    recordsChecked: results.length,
    passed,
    missing,
    incomplete,
    totalIssues: allIssues.length,
    issuesByField: allIssues.reduce<Record<string, number>>((acc, i) => {
      acc[i.field] = (acc[i.field] ?? 0) + 1;
      return acc;
    }, {}),
    results,
  };
  const resolvedOutput = resolve(args.outputPath);
  mkdirSync(dirname(resolvedOutput), { recursive: true });
  writeFileSync(resolvedOutput, JSON.stringify(report, null, 2), "utf-8");
  return { passed, missing, incomplete, allIssues };
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs();
  console.log(`\n--- Verify Published Entities ---`);
  console.log(`Data        : ${args.dataPath}`);
  console.log(`Schema      : ${args.schemaPath}`);
  console.log(`Target space: ${args.spaceId}\n`);

  const schema = loadSchema(args.schemaPath);
  const records = loadRecords(args.dataPath);
  console.log(`Loaded ${records.length} source records, entityType = "${schema.entityType}".`);
  console.log(`Resolving property IDs for value fields...`);
  const propertyIds = await resolveValueFieldPropertyIds(schema);

  const skipped: string[] = [];
  const resolved: string[] = [];
  for (const [name, id] of propertyIds) {
    if (id) resolved.push(`${name}=${id.slice(0, 8)}...`);
    else skipped.push(name);
  }
  if (resolved.length > 0) console.log(`  Resolved: ${resolved.join(", ")}`);
  if (skipped.length > 0) console.log(`  Skipped (no property ID found): ${skipped.join(", ")}`);

  console.log(`\nVerifying ${records.length} entities...`);

  const results: RecordResult[] = [];
  for (let i = 0; i < records.length; i++) {
    const r = await verifyRecord(records[i], i, schema, args.spaceId, propertyIds, schema.entityType);
    results.push(r);
    if (args.verbose) {
      const tag = r.status === "pass" ? "PASS " : r.status === "missing" ? "MISS " : "PART ";
      console.log(`  [${tag}] ${r.name}  (${r.issues.length} issues)`);
    }
  }

  const summary = writeReport(args, schema, results);

  console.log(`\n── Verification Result ─────────────────────────────────────`);
  console.log(`  Passed     : ${summary.passed} / ${results.length}`);
  console.log(`  Missing    : ${summary.missing}`);
  console.log(`  Incomplete : ${summary.incomplete}`);
  console.log(`  Issues     : ${summary.allIssues.length}\n`);

  if (summary.allIssues.length > 0) {
    const show = args.verbose ? summary.allIssues : summary.allIssues.slice(0, 20);
    console.log(`  ${args.verbose ? "All" : "First " + show.length} issues:`);
    for (const i of show) {
      console.log(`    [${i.record}] "${i.recordName}" · ${i.field}: ${i.issue}`);
    }
    if (!args.verbose && summary.allIssues.length > show.length) {
      console.log(`    ... ${summary.allIssues.length - show.length} more — see ${args.outputPath} or --verbose`);
    }
  }

  console.log(`\n  Report saved: ${args.outputPath}`);

  if (summary.missing > 0 || summary.incomplete > 0) {
    console.log(`\n  Verification FAILED. Review issues, investigate, republish missing/incomplete records.\n`);
    process.exit(1);
  }
  console.log(`\n  All published entities verified against source. Graph integrity confirmed.\n`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
