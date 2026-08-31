import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { Graph, ContentIds, SystemIds, type Op } from "@geoprotocol/geo-sdk";
import { queryTypeByName, publishOps, printOpsSummary } from "../src/functions.js";

// ─── CLI args ────────────────────────────────────────────────────────────────

interface Args {
  dataPath: string;
  publish: boolean;
  verbose: boolean;
  spaceId?: string;
  outputPath: string;
}

function parseArgs(): Args {
  const args = process.argv.slice(2);
  const get = (flag: string) => {
    const i = args.indexOf(flag);
    return i !== -1 && args[i + 1] ? args[i + 1] : undefined;
  };

  const dataPath = get("--data");
  if (!dataPath) {
    console.error("Usage: npx tsx curator-courses/06-dry-run-publish.ts --data <records.json> [--publish] [--verbose] [--space <id>] [--output <report.json>]");
    console.error(`Try: npx tsx curator-courses/06-dry-run-publish.ts --data data_to_publish/06-datasets-sample.json`);
    process.exit(1);
  }

  return {
    dataPath,
    publish: args.includes("--publish"),
    verbose: args.includes("--verbose"),
    spaceId: get("--space"),
    outputPath: get("--output") ?? "./output/dry-run-report.json",
  };
}

// ─── Data loading ────────────────────────────────────────────────────────────

interface DatasetRecord {
  name: string;
  description?: string;
  topics?: string[];
}

function loadRecords(path: string): DatasetRecord[] {
  const content = readFileSync(resolve(path), "utf-8");
  const parsed = JSON.parse(content);
  if (!Array.isArray(parsed)) throw new Error("Data file must be a JSON array.");
  return parsed as DatasetRecord[];
}

// ─── Op building ─────────────────────────────────────────────────────────────

interface BuildResult {
  ops: Op[];
  entitySummaries: Array<{ name: string; description: boolean; topicCount: number }>;
  warnings: Array<{ record: number; issue: string }>;
  topicsTouched: number;
}

/**
 * Build all ops for a batch of dataset records. Does NOT publish — returns
 * the op array and a structured summary for the report.
 */
async function buildOps(records: DatasetRecord[]): Promise<BuildResult> {
  const ops: Op[] = [];
  const entitySummaries: BuildResult["entitySummaries"] = [];
  const warnings: BuildResult["warnings"] = [];
  const seenTopics = new Set<string>();

  // Resolve type IDs. Prefer SDK constants where available.
  //   - "Dataset" is NOT in the SDK — look up from API (may not exist → we create it).
  //   - "Topic" IS in the SDK via ContentIds.TOPIC_TYPE.
  let datasetTypeId = await queryTypeByName("Dataset");
  if (!datasetTypeId) {
    const datasetType = Graph.createType({ name: "Dataset" });
    ops.push(...datasetType.ops);
    datasetTypeId = datasetType.id;
  }
  const topicTypeId = ContentIds.TOPIC_TYPE;

  // Reuse well-known canonical properties rather than creating duplicates.
  //   - SystemIds.DESCRIPTION_PROPERTY (text)
  //   - ContentIds.TOPICS_PROPERTY (relation)
  const descriptionPropId = SystemIds.DESCRIPTION_PROPERTY;
  const topicsPropId = ContentIds.TOPICS_PROPERTY;

  // For each record: create the dataset entity + its topic relations.
  for (let i = 0; i < records.length; i++) {
    const rec = records[i];

    if (!rec.name || typeof rec.name !== "string" || rec.name.trim() === "") {
      warnings.push({ record: i, issue: "missing or empty 'name' field — skipped" });
      continue;
    }

    const values = rec.description
      ? [{ property: descriptionPropId, type: "text" as const, value: rec.description }]
      : [];

    const dataset = Graph.createEntity({
      name: rec.name,
      types: [datasetTypeId],
      values,
    });
    ops.push(...dataset.ops);

    const topics = Array.isArray(rec.topics) ? rec.topics : [];
    for (const topicName of topics) {
      if (!topicName || typeof topicName !== "string") continue;

      // Create topic entity with correct type (NOT types: []).
      // In a real pipeline, you'd look up existing topics first — see script 05.
      const topic = Graph.createEntity({
        name: topicName,
        types: [topicTypeId],
        values: [],
      });
      ops.push(...topic.ops);
      seenTopics.add(topicName);

      const link = Graph.createRelation({
        fromEntity: dataset.id,
        toEntity: topic.id,
        type: topicsPropId,
      });
      ops.push(...link.ops);
    }

    entitySummaries.push({
      name: rec.name,
      description: Boolean(rec.description),
      topicCount: topics.length,
    });
  }

  return { ops, entitySummaries, warnings, topicsTouched: seenTopics.size };
}

// ─── Preview + report ────────────────────────────────────────────────────────

function countByOpType(ops: Op[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const op of ops) {
    const t = (op as any).type ?? "unknown";
    counts[t] = (counts[t] ?? 0) + 1;
  }
  return counts;
}

function printPreview(
  args: Args,
  records: DatasetRecord[],
  build: BuildResult
) {
  console.log(`\n── Dry-Run Preview ──────────────────────────────────────────`);
  console.log(`  Source       : ${args.dataPath}`);
  console.log(`  Records in   : ${records.length}`);
  console.log(`  Entities out : ${build.entitySummaries.length}  (datasets)`);
  console.log(`  Topics seen  : ${build.topicsTouched}  (each creates one typed entity)`);
  console.log(`  Warnings     : ${build.warnings.length}`);
  console.log(`  Target space : ${args.spaceId ?? "(personal space — auto-detected)"}\n`);

  printOpsSummary(build.ops);

  // Medium preview — first N entity names
  const preview = build.entitySummaries.slice(0, 10);
  console.log(`\n  Entities (first ${preview.length} of ${build.entitySummaries.length}):`);
  for (const e of preview) {
    const desc = e.description ? "desc" : "no-desc";
    console.log(`    • ${e.name}  [${desc}, ${e.topicCount} topics]`);
  }
  if (build.entitySummaries.length > preview.length) {
    console.log(`    ... ${build.entitySummaries.length - preview.length} more — see report file`);
  }

  if (build.warnings.length > 0) {
    console.log(`\n  Warnings:`);
    for (const w of build.warnings.slice(0, 10)) {
      console.log(`    record[${w.record}]: ${w.issue}`);
    }
    if (build.warnings.length > 10) console.log(`    ... ${build.warnings.length - 10} more`);
  }

  if (args.verbose) {
    console.log(`\n  Full op dump (--verbose):`);
    for (let i = 0; i < build.ops.length; i++) {
      const op: any = build.ops[i];
      console.log(`    [${i}] ${describeOp(op)}`);
    }
  }
}

// Render a single op as a short human-readable line. Byte-array IDs
// in the raw op are converted to 8-char hex prefixes so curators can
// cross-reference with the preview list without wading through JSON.
function describeOp(op: any): string {
  const shortId = (b: any): string => {
    if (!b) return "?";
    if (typeof b === "string") return b.slice(0, 8);
    if (typeof b === "object") {
      const bytes = Object.values(b).slice(0, 4) as number[];
      return bytes.map((n) => n.toString(16).padStart(2, "0")).join("");
    }
    return "?";
  };
  switch (op?.type) {
    // Raw GRC-20 op field names differ from the SDK builder API:
    //   createEntity  → id
    //   createRelation → id, entity, from, to (relation metadata)
    case "createEntity":
      return `createEntity    id=${shortId(op.id)}`;
    case "createRelation":
      return `createRelation  id=${shortId(op.id)}  ${shortId(op.from)} → ${shortId(op.to)}`;
    case "updateEntity":
      return `updateEntity    id=${shortId(op.id)}`;
    default:
      return `${op?.type ?? "unknown"}  ${JSON.stringify(op).slice(0, 80)}`;
  }
}

function writeReport(args: Args, records: DatasetRecord[], build: BuildResult) {
  const report = {
    generatedAt: new Date().toISOString(),
    source: args.dataPath,
    targetSpace: args.spaceId ?? "personal",
    recordsIn: records.length,
    entitiesOut: build.entitySummaries.length,
    topicsTouched: build.topicsTouched,
    totalOps: build.ops.length,
    opBreakdown: countByOpType(build.ops),
    entities: build.entitySummaries,
    warnings: build.warnings,
  };
  const resolvedOutput = resolve(args.outputPath);
  mkdirSync(dirname(resolvedOutput), { recursive: true });
  writeFileSync(resolvedOutput, JSON.stringify(report, null, 2), "utf-8");
  console.log(`\n  Report saved: ${args.outputPath}`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs();

  console.log(`\n--- Dry-Run → Publish Flow (${args.publish ? "PUBLISH" : "DRY RUN"}) ---`);

  const records = loadRecords(args.dataPath);
  console.log(`Loaded ${records.length} records from ${args.dataPath}`);

  const build = await buildOps(records);

  // DRY RUN PATH — show preview, save report, exit.
  if (!args.publish) {
    printPreview(args, records, build);
    writeReport(args, records, build);
    console.log(`\n  Dry run complete. No ops published.`);
    console.log(`  To publish: re-run with --publish\n`);
    return;
  }

  // PUBLISH PATH — still print a concise summary, but go ahead and publish.
  console.log(`\n  Publishing ${build.ops.length} ops (${build.entitySummaries.length} entities, ${build.topicsTouched} topics)...`);

  if (build.warnings.length > 0) {
    console.log(`  ${build.warnings.length} warning${build.warnings.length === 1 ? "" : "s"} — affected records were skipped.`);
  }

  const privateKey = process.env.PRIVATE_KEY as `0x${string}` | undefined;
  if (!privateKey) {
    console.error(`\n  --publish requires PRIVATE_KEY in .env`);
    console.error(`  Export your wallet: https://www.geobrowser.io/export-wallet`);
    process.exit(1);
  }

  const result = await publishOps({
    ops: build.ops,
    editName: `Dataset batch: ${build.entitySummaries.length} records (script 06)`,
    privateKey,
    useSmartAccount: true,
    network: "TESTNET",
    spaceId: args.spaceId,
  });

  if (!result.success) {
    console.error(`\n  Publish failed: ${result.error}`);
    process.exit(1);
  }

  console.log(`\n  Published!`);
  console.log(`    Space: ${result.spaceId}`);
  console.log(`    Edit:  ${result.editId}`);
  console.log(`    TX:    ${result.transactionHash}`);
  console.log();
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
