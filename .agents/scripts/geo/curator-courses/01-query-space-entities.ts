import { gql } from "../src/functions.js";

// ─── CLI args ────────────────────────────────────────────────────────────────

const AI_SPACE_ID = "41e851610e13a19441c4d980f2f2ce6b";

function getSpaceArg(): string {
  const args = process.argv.slice(2);
  const idx = args.indexOf("--space");
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : AI_SPACE_ID;
}

// ─── Queries ─────────────────────────────────────────────────────────────────

async function main() {
  const spaceId = getSpaceArg();

  // 1. Space overview — name, type, entity count
  console.log(`\n--- Space Overview ---`);
  console.log(`Space ID: ${spaceId}\n`);

  const overview = await gql(`{
    space(id: "${spaceId}") {
      type
      page { name description }
    }
  }`);

  if (!overview.space) {
    console.error(`Space "${spaceId}" not found. Check the ID and try again.`);
    process.exit(1);
  }

  console.log(`Name : ${overview.space.page?.name ?? "(no name)"}`);
  console.log(`Type : ${overview.space.type}`);

  // 2. What types exist in this space?
  console.log(`\n--- Entity Types in Space ---`);

  const typesData = await gql(`{
    entities(
      spaceId: "${spaceId}",
      typeId: "e7d737c536764c609fa16aa64a8c90ad",
      first: 50
    ) { id name }
  }`);

  const types = typesData.entities ?? [];
  if (types.length === 0) {
    console.log("  No type definitions found in this space.");
  } else {
    for (const t of types) {
      console.log(`  ${t.name} (${t.id})`);
    }
  }

  // 3. What properties exist in this space?
  console.log(`\n--- Properties in Space ---`);

  const propsData = await gql(`{
    entities(
      spaceId: "${spaceId}",
      typeId: "808a04ceb21c4d888ad12e240613e5ca",
      first: 50
    ) { id name }
  }`);

  const props = propsData.entities ?? [];
  if (props.length === 0) {
    console.log("  No property definitions found in this space.");
  } else {
    for (const p of props) {
      console.log(`  ${p.name} (${p.id})`);
    }
  }

  // 4. Sample entities — first 10, showing types and value count
  console.log(`\n--- Sample Entities (first 10) ---`);

  const entitiesData = await gql(`{
    entities(spaceId: "${spaceId}", first: 10) {
      id
      name
      types { id name }
      valueConnection: values { totalCount }
      relationConnection: relations { totalCount }
    }
  }`);

  const entities = entitiesData.entities ?? [];
  if (entities.length === 0) {
    console.log("  No entities found in this space.");
  } else {
    for (const e of entities) {
      const typeNames = (e.types ?? []).map((t: any) => t.name).join(", ") || "untyped";
      const valCount = e.valueConnection?.totalCount ?? 0;
      const relCount = e.relationConnection?.totalCount ?? 0;
      console.log(`  ${e.name ?? "(no name)"}`);
      console.log(`    ID: ${e.id}`);
      console.log(`    Types: ${typeNames} | Values: ${valCount} | Relations: ${relCount}`);
    }
  }

  // 5. Entity count by type — the most useful overview
  console.log(`\n--- Entity Counts by Type ---`);

  for (const t of types) {
    const entityList = await gql(`{
      entities(
        spaceId: "${spaceId}",
        typeId: "${t.id}",
        first: 500
      ) { id }
    }`);
    console.log(`  ${t.name}: ${entityList.entities?.length ?? 0} entities`);
  }

  console.log(`\n--- Done ---`);
  console.log(`Use these type/property IDs in your publishing config.`);
  console.log(`Never hardcode IDs — always discover them from the live space.\n`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
