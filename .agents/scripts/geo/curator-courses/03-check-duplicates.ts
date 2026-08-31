import { readFileSync } from "fs";
import { resolve } from "path";
import { gql } from "../src/functions.js";

// ─── CLI args ────────────────────────────────────────────────────────────────

const AI_SPACE_ID = "41e851610e13a19441c4d980f2f2ce6b";

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag: string) => {
    const i = args.indexOf(flag);
    return i !== -1 && args[i + 1] ? args[i + 1] : undefined;
  };

  const name = get("--name");
  const dataFile = get("--data");
  const spaceId = get("--space") ?? AI_SPACE_ID;
  const typeId = get("--type");

  if (!name && !dataFile) {
    console.log("Usage:");
    console.log("  npx tsx curator-courses/03-check-duplicates.ts --name \"GPT-4\" --space <id>");
    console.log("  npx tsx curator-courses/03-check-duplicates.ts --data records.json --space <id>");
    console.log("  npx tsx curator-courses/03-check-duplicates.ts --data records.json --space <id> --type <typeId>");
    console.log(`\nDefault space: AI space (${AI_SPACE_ID})`);
    process.exit(0);
  }

  return { name, dataFile, spaceId, typeId };
}

// ─── Dedup check ─────────────────────────────────────────────────────────────

interface DedupResult {
  name: string;
  found: boolean;
  entity?: {
    id: string;
    name: string;
    types: string[];
    valueCount: number;
    relationCount: number;
  };
}

/**
 * Check if an entity with the given name exists in a specific space.
 * Optionally filter by type ID for precise matching.
 *
 * Uses the `entities` query with `spaceId` for space-scoped lookup,
 * NOT the global `search` query (which returns entities from all spaces).
 */
async function checkEntity(
  name: string,
  spaceId: string,
  typeId?: string
): Promise<DedupResult> {
  // Use `search` with spaceId + filter for space-scoped name lookup.
  // The `entities` query has a server-side bug when combining spaceId + name filters.
  const typeFilter = typeId
    ? `typeIds: { anyEqualTo: "${typeId}" },`
    : "";

  const data = await gql(`{
    search(
      query: ${JSON.stringify(name)},
      spaceId: "${spaceId}",
      first: 10,
      filter: { ${typeFilter} name: { is: ${JSON.stringify(name)} } }
    ) {
      id
      name
      types { name }
      values { totalCount }
      relations { totalCount }
    }
  }`);

  const entities = data.search ?? [];

  // Find exact match (case-insensitive)
  const exact = entities.find(
    (e: any) => e.name?.toLowerCase() === name.toLowerCase()
  );

  if (!exact) {
    return { name, found: false };
  }

  return {
    name,
    found: true,
    entity: {
      id: exact.id,
      name: exact.name,
      types: (exact.types ?? []).map((t: any) => t.name),
      valueCount: exact.values?.totalCount ?? 0,
      relationCount: exact.relations?.totalCount ?? 0,
    },
  };
}

// ─── Load names from JSON ────────────────────────────────────────────────────

function loadNamesFromFile(filePath: string): string[] {
  const content = readFileSync(resolve(filePath), "utf-8");
  const parsed = JSON.parse(content);

  if (!Array.isArray(parsed)) {
    throw new Error("JSON file must be an array of objects with a 'name' field");
  }

  const names = parsed
    .map((r: any) => r.name ?? r.Name ?? r.title ?? r.Title)
    .filter((n: any): n is string => typeof n === "string" && n.trim() !== "");

  if (names.length === 0) {
    throw new Error("No names found in JSON file. Expected objects with 'name', 'Name', 'title', or 'Title' field.");
  }

  return names;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const { name, dataFile, spaceId, typeId } = parseArgs();

  const names: string[] = name ? [name] : loadNamesFromFile(dataFile!);

  console.log(`\n--- Duplicate Check ---`);
  console.log(`Space  : ${spaceId}`);
  console.log(`Type   : ${typeId ?? "(all types)"}`);
  console.log(`Checking: ${names.length} name${names.length === 1 ? "" : "s"}\n`);

  let existCount = 0;
  let newCount = 0;
  const duplicates: DedupResult[] = [];

  for (const n of names) {
    const result = await checkEntity(n, spaceId, typeId);

    if (result.found) {
      existCount++;
      duplicates.push(result);
      const e = result.entity!;
      const types = e.types.length > 0 ? e.types.join(", ") : "untyped";
      console.log(`  EXISTS: "${n}"`);
      console.log(`    ID: ${e.id}`);
      console.log(`    Types: ${types} | Values: ${e.valueCount} | Relations: ${e.relationCount}`);
    } else {
      newCount++;
      console.log(`  NEW: "${n}"`);
    }
  }

  // Summary
  console.log(`\n--- Summary ---`);
  console.log(`  Total checked : ${names.length}`);
  console.log(`  Already exist : ${existCount}`);
  console.log(`  New (safe)    : ${newCount}`);

  if (existCount > 0) {
    console.log(`\n  ${existCount} duplicate${existCount === 1 ? "" : "s"} found. Review before publishing.`);
    console.log(`  Publishing these names will create duplicate entities in the space.`);
  } else {
    console.log(`\n  No duplicates found. Safe to publish.`);
  }

  console.log();
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
