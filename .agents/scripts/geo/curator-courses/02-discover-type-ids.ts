import { SystemIds, ContentIds } from "@geoprotocol/geo-sdk";
import { gql, queryPropertyByName, queryTypeByName, queryEntityByName } from "../src/functions.js";

// ─── CLI args ────────────────────────────────────────────────────────────────

function getFindArg(): string | null {
  const args = process.argv.slice(2);
  const idx = args.indexOf("--find");
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}

// ─── Lookup by name ──────────────────────────────────────────────────────────

async function lookupByName(name: string) {
  console.log(`\n--- Looking up: "${name}" ---\n`);

  // 1. Check if it's a Type entity
  const typeId = await queryTypeByName(name);
  if (typeId) {
    console.log(`  Found as TYPE`);
    console.log(`  ID: ${typeId}`);
    console.log(`  Use: types: ["${typeId}"] in Graph.createEntity()\n`);
  }

  // 2. Check if it's a Property entity
  const propId = await queryPropertyByName(name);
  if (propId) {
    console.log(`  Found as PROPERTY`);
    console.log(`  ID: ${propId}`);
    console.log(`  Use: { property: "${propId}", type: "text", value: "..." } in values\n`);
  }

  // 3. Check if it's a regular entity (not type, not property)
  if (!typeId && !propId) {
    const entityId = await queryEntityByName(name);
    if (entityId) {
      // Fetch its types to show what kind of entity it is
      const detail = await gql(`{
        entity(id: "${entityId}") { id name types { id name } }
      }`);
      const typeNames = (detail.entity?.types ?? []).map((t: any) => t.name).join(", ") || "untyped";
      console.log(`  Found as ENTITY (not a Type or Property)`);
      console.log(`  ID: ${entityId}`);
      console.log(`  Entity types: ${typeNames}`);
      console.log(`  Use: as a relation target with Graph.createRelation({ toEntity: "${entityId}" })\n`);
    } else {
      console.log(`  Not found in the knowledge graph.`);
      console.log(`  You may need to create it, or check spelling.\n`);
    }
  }
}

// ─── Show SDK built-in IDs ───────────────────────────────────────────────────

function showBuiltInIds() {
  console.log(`\n--- SDK Built-in IDs (no API lookup needed) ---`);
  console.log(`Import with: import { SystemIds, ContentIds } from "@geoprotocol/geo-sdk";\n`);

  console.log(`  Core Types:`);
  console.log(`    SystemIds.SCHEMA_TYPE          = ${SystemIds.SCHEMA_TYPE}    (meta-type for types)`);
  console.log(`    SystemIds.PROPERTY             = ${SystemIds.PROPERTY}    (meta-type for properties)`);
  console.log(`    SystemIds.PERSON_TYPE           = ${SystemIds.PERSON_TYPE}    (Person)`);
  console.log(`    SystemIds.PROJECT_TYPE          = ${SystemIds.PROJECT_TYPE}    (Project)`);
  console.log(`    ContentIds.TOPIC_TYPE           = ${ContentIds.TOPIC_TYPE}    (Topic)`);
  console.log(`    ContentIds.TAG_TYPE             = ${ContentIds.TAG_TYPE}    (Tag)`);

  console.log(`\n  Core Properties:`);
  console.log(`    SystemIds.NAME_PROPERTY         = ${SystemIds.NAME_PROPERTY}    (Name)`);
  console.log(`    SystemIds.DESCRIPTION_PROPERTY  = ${SystemIds.DESCRIPTION_PROPERTY}    (Description)`);
  console.log(`    ContentIds.WEBSITE_PROPERTY     = ${ContentIds.WEBSITE_PROPERTY}    (Website/URL)`);
  console.log(`    ContentIds.TOPICS_PROPERTY      = ${ContentIds.TOPICS_PROPERTY}    (Topics relation)`);
  console.log(`    ContentIds.AUTHORS_PROPERTY     = ${ContentIds.AUTHORS_PROPERTY}    (Authors relation)`);

  console.log(`\n  Block System:`);
  console.log(`    SystemIds.TEXT_BLOCK            = ${SystemIds.TEXT_BLOCK}    (Text block type)`);
  console.log(`    SystemIds.DATA_BLOCK            = ${SystemIds.DATA_BLOCK}    (Data block type)`);
  console.log(`    SystemIds.IMAGE_TYPE            = ${SystemIds.IMAGE_TYPE}    (Image type)`);
  console.log(`    SystemIds.BLOCKS                = ${SystemIds.BLOCKS}    (Blocks relation)`);
  console.log(`    SystemIds.MARKDOWN_CONTENT      = ${SystemIds.MARKDOWN_CONTENT}    (Markdown content)`);

  console.log(`\n  Views:`);
  console.log(`    SystemIds.TABLE_VIEW            = ${SystemIds.TABLE_VIEW}`);
  console.log(`    SystemIds.LIST_VIEW             = ${SystemIds.LIST_VIEW}`);
  console.log(`    SystemIds.GALLERY_VIEW          = ${SystemIds.GALLERY_VIEW}`);
  console.log(`    SystemIds.BULLETED_LIST_VIEW    = ${SystemIds.BULLETED_LIST_VIEW}`);

  console.log(`\n--- Space-specific IDs (must discover from API) ---`);
  console.log(`These are NOT in the SDK. Use --find to look them up:\n`);
  console.log(`  npx tsx curator-courses/02-discover-type-ids.ts --find "Dataset"`);
  console.log(`  npx tsx curator-courses/02-discover-type-ids.ts --find "Citation count"`);
  console.log(`  npx tsx curator-courses/02-discover-type-ids.ts --find "Ingredient"\n`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const findName = getFindArg();

  if (findName) {
    await lookupByName(findName);
  } else {
    showBuiltInIds();
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
