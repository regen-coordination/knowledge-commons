import { Graph, EmbeddingSubType, type Op } from "@geoprotocol/geo-sdk";

// ─── CLI args ────────────────────────────────────────────────────────────────

const VERBOSE = process.argv.includes("--verbose");

// ─── Op counter (tracks total ops built across the whole dry-run) ────────────

let totalOps = 0;
function track(ops: Op[]) {
  totalOps += ops.length;
  if (VERBOSE) console.log(`    ops: ${ops.length}`);
}

function header(title: string) {
  console.log(`\n── ${title} ${"─".repeat(Math.max(0, 70 - title.length - 4))}`);
}

// ─── 1. Common types (detailed treatment) ────────────────────────────────────

function showCommonTypes() {
  header("Common Types (you'll use these daily)");

  // ── TEXT ──
  console.log(`\n  TEXT  ↔  text`);
  console.log(`  Use case: names, descriptions, URLs, any free-form string`);
  console.log(`  Example:`);
  console.log(`    const prop = Graph.createProperty({ name: "Description", dataType: "TEXT" });`);
  console.log(`    const value = { property: prop.id, type: "text", value: "ImageNet is a dataset..." };`);
  {
    const prop = Graph.createProperty({ name: "Description", dataType: "TEXT" });
    track(prop.ops);
    const entity = Graph.createEntity({
      name: "ImageNet",
      types: [],
      values: [{ property: prop.id, type: "text", value: "ImageNet is a large-scale image dataset" }],
    });
    track(entity.ops);
  }
  console.log(`  Optional: { type: "text", value: "...", language: "en" } for i18n`);

  // ── INTEGER ──
  console.log(`\n  INTEGER  ↔  integer`);
  console.log(`  Use case: counts, years, ranks — any whole number`);
  console.log(`  Example:`);
  console.log(`    const prop = Graph.createProperty({ name: "Release year", dataType: "INTEGER" });`);
  console.log(`    const value = { property: prop.id, type: "integer", value: 2009 };`);
  {
    const prop = Graph.createProperty({ name: "Release year", dataType: "INTEGER" });
    track(prop.ops);
    const entity = Graph.createEntity({
      name: "ImageNet",
      types: [],
      values: [{ property: prop.id, type: "integer", value: 2009 }],
    });
    track(entity.ops);
  }
  console.log(`  Accepts number or bigint. Optional unit: { ..., unit: "USD" }`);
  console.log(`  ⚠  NOT "int64" (old v0.7 name). NOT string "2009". NOT float 2009.0.`);

  // ── FLOAT ──
  console.log(`\n  FLOAT  ↔  float`);
  console.log(`  Use case: ratings, percentages, measurements with decimal parts`);
  console.log(`  Example:`);
  console.log(`    const prop = Graph.createProperty({ name: "Accuracy", dataType: "FLOAT" });`);
  console.log(`    const value = { property: prop.id, type: "float", value: 0.763 };`);
  {
    const prop = Graph.createProperty({ name: "Accuracy", dataType: "FLOAT" });
    track(prop.ops);
    const entity = Graph.createEntity({
      name: "ResNet-50",
      types: [],
      values: [{ property: prop.id, type: "float", value: 0.763 }],
    });
    track(entity.ops);
  }
  console.log(`  ⚠  NOT "float64" (old v0.7 name). For exact math (money) use DECIMAL.`);

  // ── BOOLEAN ──
  console.log(`\n  BOOLEAN  ↔  boolean`);
  console.log(`  Use case: flags like "is open source", "is peer reviewed"`);
  console.log(`  Example:`);
  console.log(`    const prop = Graph.createProperty({ name: "Open source", dataType: "BOOLEAN" });`);
  console.log(`    const value = { property: prop.id, type: "boolean", value: true };`);
  {
    const prop = Graph.createProperty({ name: "Open source", dataType: "BOOLEAN" });
    track(prop.ops);
    const entity = Graph.createEntity({
      name: "ImageNet",
      types: [],
      values: [{ property: prop.id, type: "boolean", value: true }],
    });
    track(entity.ops);
  }
  console.log(`  ⚠  NOT "bool" (old v0.7 name). NOT string "true" / "false".`);

  // ── DATE ──
  console.log(`\n  DATE  ↔  date`);
  console.log(`  Use case: release dates, publication dates — calendar dates without time`);
  console.log(`  Example:`);
  console.log(`    const prop = Graph.createProperty({ name: "Published on", dataType: "DATE" });`);
  console.log(`    const value = { property: prop.id, type: "date", value: "2009-06-20" };`);
  {
    const prop = Graph.createProperty({ name: "Published on", dataType: "DATE" });
    track(prop.ops);
    const entity = Graph.createEntity({
      name: "ImageNet paper",
      types: [],
      values: [{ property: prop.id, type: "date", value: "2009-06-20" }],
    });
    track(entity.ops);
  }
  console.log(`  ⚠  MUST be YYYY-MM-DD. "2009-06" crashes the GRC-20 encoder (Ishita's bug).`);
  console.log(`     "June 2009", "06/20/2009", Date objects — all rejected.`);
}

// ─── 2. Relation (not a TypedValue, but a DataType) ──────────────────────────

function showRelation() {
  header("Relations (different flow — not a value)");

  console.log(`\n  RELATION  ↔  (no TypedValue — use Graph.createRelation)`);
  console.log(`  Use case: linking entities — authors, organizations, topics`);
  console.log(`  Example:`);
  console.log(`    // Step 1: declare the relation type as a Property with dataType RELATION`);
  console.log(`    const rel = Graph.createProperty({ name: "Created by", dataType: "RELATION" });`);
  console.log(`    // Step 2: create the relation between two entity IDs`);
  console.log(`    const link = Graph.createRelation({`);
  console.log(`      fromEntity: datasetId,`);
  console.log(`      toEntity: organizationId,`);
  console.log(`      type: rel.id,`);
  console.log(`    });`);
  {
    const rel = Graph.createProperty({ name: "Created by", dataType: "RELATION" });
    track(rel.ops);
    const org = Graph.createEntity({ name: "Stanford Vision Lab", types: [] });
    track(org.ops);
    const dataset = Graph.createEntity({ name: "ImageNet", types: [] });
    track(dataset.ops);
    const link = Graph.createRelation({ fromEntity: dataset.id, toEntity: org.id, type: rel.id });
    track(link.ops);
  }
  console.log(`  ⚠  Do NOT store "Stanford Vision Lab" as a text value. It becomes a dead string,`);
  console.log(`     not a traversable graph edge. (This is Maxim's and Ishita's mistake.)`);
}

// ─── 3. Exotic types (brief treatment) ───────────────────────────────────────

function showExoticTypes() {
  header("Exotic Types (rare but available)");

  // ── DECIMAL ──
  console.log(`\n  DECIMAL  ↔  decimal`);
  console.log(`  When: exact arithmetic (money, prices). Stores mantissa × 10^exponent.`);
  console.log(`  Example — $12.34:`);
  console.log(`    const prop = Graph.createProperty({ name: "Price", dataType: "DECIMAL" });`);
  console.log(`    const value = {`);
  console.log(`      property: prop.id,`);
  console.log(`      type: "decimal",`);
  console.log(`      exponent: -2,                              // 10^-2 = 0.01`);
  console.log(`      mantissa: { type: "i64", value: 1234n },   // 1234 × 0.01 = 12.34`);
  console.log(`      unit: "USD",`);
  console.log(`    };`);
  {
    const prop = Graph.createProperty({ name: "Price", dataType: "DECIMAL" });
    track(prop.ops);
  }
  console.log(`  Use FLOAT if you don't need exact precision.`);

  // ── TIME / DATETIME / SCHEDULE ──
  console.log(`\n  TIME / DATETIME / SCHEDULE  ↔  time / datetime / schedule`);
  console.log(`  When: precise time ranges, timestamps, recurring events.`);
  console.log(`  time     — "14:30:00Z"                       (ISO 8601 time, needs timezone)`);
  console.log(`  datetime — "2024-01-15T14:30:00Z"            (ISO 8601 combined)`);
  console.log(`  schedule — "FREQ=WEEKLY;BYDAY=MO,WE,FR"      (iCalendar RRULE)`);
  {
    const t = Graph.createProperty({ name: "Start time", dataType: "TIME" });
    track(t.ops);
    const dt = Graph.createProperty({ name: "Created at", dataType: "DATETIME" });
    track(dt.ops);
    const sch = Graph.createProperty({ name: "Meeting pattern", dataType: "SCHEDULE" });
    track(sch.ops);
  }
  console.log(`  For dataset curation you almost always want DATE, not these.`);

  // ── POINT ──
  console.log(`\n  POINT  ↔  point`);
  console.log(`  When: geographic coordinates — { lon, lat, alt? }`);
  console.log(`  Example:`);
  console.log(`    const prop = Graph.createProperty({ name: "Headquarters", dataType: "POINT" });`);
  console.log(`    const value = { property: prop.id, type: "point", lon: -122.4194, lat: 37.7749 };`);
  {
    const prop = Graph.createProperty({ name: "Headquarters", dataType: "POINT" });
    track(prop.ops);
  }
  console.log(`  No "value" field — lon/lat are top-level. Optional alt (altitude).`);

  // ── BYTES ──
  console.log(`\n  BYTES  ↔  bytes`);
  console.log(`  When: raw binary data — file hashes, small binary blobs`);
  console.log(`  Example:`);
  console.log(`    const prop = Graph.createProperty({ name: "SHA-256", dataType: "BYTES" });`);
  console.log(`    const value = { property: prop.id, type: "bytes", value: new Uint8Array([0xde, 0xad]) };`);
  {
    const prop = Graph.createProperty({ name: "SHA-256", dataType: "BYTES" });
    track(prop.ops);
  }
  console.log(`  For IPFS CIDs or URLs, prefer TEXT — don't cram strings into BYTES.`);

  // ── EMBEDDING ──
  console.log(`\n  EMBEDDING  ↔  embedding`);
  console.log(`  When: ML vector embeddings — semantic search, similarity`);
  console.log(`  Example — 384-dim float32 embedding:`);
  console.log(`    const prop = Graph.createProperty({ name: "Semantic vector", dataType: "EMBEDDING" });`);
  console.log(`    const value = {`);
  console.log(`      property: prop.id,`);
  console.log(`      type: "embedding",`);
  console.log(`      subType: EmbeddingSubType.Float32,  // 0=Float32, 1=Int8, 2=Binary`);
  console.log(`      dims: 384,`);
  console.log(`      data: new Uint8Array(384 * 4),     // 4 bytes per Float32 dim`);
  console.log(`    };`);
  {
    const prop = Graph.createProperty({ name: "Semantic vector", dataType: "EMBEDDING" });
    track(prop.ops);
  }
  console.log(`  data.length MUST match subType × dims. Float32=4b, Int8=1b, Binary=1/8b.`);
}

// ─── 4. Summary — correspondence table + mistakes ────────────────────────────

function showSummary() {
  header("DataType ↔ TypedValue Correspondence");

  console.log(`
  DataType (createProperty)       TypedValue (entity values)
  ─────────────────────────       ──────────────────────────
  BOOLEAN                   ↔     boolean
  INTEGER                   ↔     integer        (number | bigint)
  FLOAT                     ↔     float
  DECIMAL                   ↔     decimal        (exponent + mantissa)
  TEXT                      ↔     text           (optional language)
  BYTES                     ↔     bytes          (Uint8Array)
  DATE                      ↔     date           (YYYY-MM-DD only)
  TIME                      ↔     time           (HH:MM:SSZ)
  DATETIME                  ↔     datetime       (ISO 8601)
  SCHEDULE                  ↔     schedule       (iCalendar RRULE)
  POINT                     ↔     point          (lon, lat, alt?)
  EMBEDDING                 ↔     embedding      (subType, dims, data)
  RELATION                  ↔     (no value — use Graph.createRelation)

  Rule of thumb: DataType is UPPERCASE, TypedValue is lowercase.`);

  header("Common Curator Mistakes");

  console.log(`
  1. Old SDK v0.7 value names — these no longer exist in v0.17:
       "int64"   →  "integer"
       "float64" →  "float"
       "bool"    →  "boolean"
       "INT64"   →  "INTEGER"
       "FLOAT64" →  "FLOAT"

  2. Everything stored as text:
       WRONG:  { property, type: "text", value: "2009" }
       RIGHT:  { property, type: "integer", value: 2009 }
       (Thomas did this for Lesson number, Web URL, Duration — all as text.)

  3. Date without day:
       WRONG:  { property, type: "date", value: "2009-06" }       // crashes encoder
       WRONG:  { property, type: "date", value: "June 2009" }
       RIGHT:  { property, type: "date", value: "2009-06-20" }
       (Ishita had 195/198 dates as "YYYY-MM" — none were publishable.)

  4. Numeric-looking strings stored as text:
       WRONG:  { property, type: "text", value: "16291130.0" }
       RIGHT:  { property, type: "integer", value: 16291130 }
       (Maxim stored block numbers as "16291130.0" text.)

  5. Relations stored as text values:
       WRONG:  { property, type: "text", value: "Google, DeepMind" }
       RIGHT:  Graph.createRelation({ fromEntity, toEntity: googleId, type: creatorRelId });
              Graph.createRelation({ fromEntity, toEntity: deepmindId, type: creatorRelId });
       (Maxim, Ishita, and Kevin all made this mistake.)

  6. Missing required name:
       WRONG:  Graph.createEntity({ types: [typeId], values: [...] })   // no name!
       RIGHT:  Graph.createEntity({ name: "ImageNet", types: [typeId], values: [...] })
       (Kevin published 650 entities with name: null.)`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  console.log(`\n--- Typed Values Reference (Dry Run) ---`);
  console.log(`Builds ops via Graph.createProperty / createEntity / createRelation.`);
  console.log(`Nothing is published. Pass --verbose to print op counts per example.\n`);

  showCommonTypes();
  showRelation();
  showExoticTypes();
  showSummary();

  console.log(`\n--- Done ---`);
  console.log(`Total ops built (not published): ${totalOps}`);
  console.log(`Next: use 05-create-typed-relations.ts to learn typed relation targets.\n`);
}

main();
