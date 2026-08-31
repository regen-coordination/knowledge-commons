import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { extname, resolve, dirname } from "path";
import { parse as parseCsv } from "csv-parse/sync";

// ─── CLI args ────────────────────────────────────────────────────────────────

interface Args {
  dataPath: string;
  schemaPath: string;
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
    console.error("Usage: npx tsx curator-courses/07-validate-data-before-publish.ts --data <records.json|.csv> --schema <schema.json> [--output <report.json>] [--verbose]");
    console.error(`Try:   npx tsx curator-courses/07-validate-data-before-publish.ts \\\n         --data data_to_publish/09-datasets-with-errors.json \\\n         --schema data_to_publish/09-datasets-schema.json`);
    process.exit(1);
  }

  return {
    dataPath,
    schemaPath,
    outputPath: get("--output") ?? "./output/validation-report.json",
    verbose: args.includes("--verbose"),
  };
}

// ─── Schema types ────────────────────────────────────────────────────────────

type FieldType = "text" | "date" | "integer" | "float" | "url" | "boolean" | "relation" | "enum";

interface FieldSchema {
  name: string;
  type: FieldType;
  required?: boolean;
  values?: string[];  // for enum
}

interface Schema {
  fields: FieldSchema[];
}

function loadSchema(path: string): Schema {
  const schema = JSON.parse(readFileSync(resolve(path), "utf-8")) as Schema;
  if (!Array.isArray(schema.fields)) throw new Error("Schema must have a 'fields' array.");
  return schema;
}

// ─── Data loading — JSON or CSV ──────────────────────────────────────────────

function loadRecords(path: string): Record<string, unknown>[] {
  const content = readFileSync(resolve(path), "utf-8");
  const ext = extname(path).toLowerCase();

  if (ext === ".json") {
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) throw new Error("JSON data must be an array.");
    return parsed;
  }
  if (ext === ".csv") {
    return parseCsv(content, { columns: true, skip_empty_lines: true, trim: true });
  }
  throw new Error(`Unsupported data format: ${ext}. Use .json or .csv`);
}

// ─── Individual validators — one per FieldType ───────────────────────────────

// Each validator returns null on success, or a short human-readable issue
// on failure. `undefined`/missing is handled by the `required` gate in the
// main validate() function, so these only need to judge present values.

const validators: Record<FieldType, (v: unknown, f: FieldSchema) => string | null> = {
  text(v) {
    if (typeof v !== "string") return `expected text, got ${typeOf(v)}`;
    if (v.trim() === "") return "empty text";
    return null;
  },

  date(v) {
    if (typeof v !== "string") return `expected date string, got ${typeOf(v)}`;
    // ISO 8601 calendar date — GRC-20 rejects anything else.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      return `expected "YYYY-MM-DD", got "${v}"`;
    }
    // Catch "2020-13-45" style errors — valid-looking but impossible dates.
    const d = new Date(v + "T00:00:00Z");
    if (isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v) {
      return `not a real calendar date: "${v}"`;
    }
    return null;
  },

  integer(v) {
    // Accept a real number integer, or a string that EXACTLY represents one.
    // Reject "16291130.0" — it parses to 16291130, but its string form implies
    // the source data was a float, and the curator probably meant a float field.
    if (typeof v === "number") {
      return Number.isInteger(v) ? null : `expected integer, got float ${v}`;
    }
    if (typeof v === "string") {
      if (!/^-?\d+$/.test(v.trim())) {
        return `expected integer, got "${v}" (strings with decimal points or letters are rejected)`;
      }
      return null;
    }
    return `expected integer, got ${typeOf(v)}`;
  },

  float(v) {
    if (typeof v === "number") {
      return Number.isFinite(v) ? null : "NaN or Infinity";
    }
    if (typeof v === "string") {
      const n = Number(v);
      if (Number.isFinite(n)) return null;
      return `expected numeric, got "${v}"`;
    }
    return `expected float, got ${typeOf(v)}`;
  },

  url(v) {
    if (typeof v !== "string") return `expected URL string, got ${typeOf(v)}`;
    try {
      const u = new URL(v);
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        return `URL must use http:// or https://, got ${u.protocol}`;
      }
      return null;
    } catch {
      return `malformed URL: "${v}"`;
    }
  },

  boolean(v) {
    if (typeof v === "boolean") return null;
    return `expected boolean, got ${typeOf(v)} ${JSON.stringify(v)} — CSV booleans need explicit coercion`;
  },

  relation(v) {
    // Accept: ["a", "b"]  or  "a, b"  — both are legitimate patterns in
    // bounty data files. Reject numbers, objects, null.
    if (Array.isArray(v)) {
      const allStrings = v.every((x) => typeof x === "string" && x.trim() !== "");
      return allStrings ? null : "relation array contains non-string or empty items";
    }
    if (typeof v === "string") {
      return v.trim() === "" ? "empty relation string" : null;
    }
    return `expected string[] or comma-separated string, got ${typeOf(v)}`;
  },

  enum(v, f) {
    if (!f.values || f.values.length === 0) return "enum has no allowed values";
    if (typeof v !== "string") return `expected one of [${f.values.join(", ")}], got ${typeOf(v)}`;
    return f.values.includes(v) ? null : `"${v}" not in allowed values [${f.values.join(", ")}]`;
  },
};

function typeOf(v: unknown): string {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
}

// ─── Per-record validation ───────────────────────────────────────────────────

interface ValidationError {
  record: number;
  recordName?: string;
  field: string;
  value: unknown;
  issue: string;
}

function validateRecord(
  record: Record<string, unknown>,
  index: number,
  schema: Schema
): ValidationError[] {
  const errors: ValidationError[] = [];
  const name = typeof record.name === "string" ? record.name : undefined;

  for (const field of schema.fields) {
    const value = record[field.name];
    const isMissing = value === undefined || value === null || value === "";

    // `required` gate — the one check that runs first for every field type.
    if (isMissing) {
      if (field.required) {
        errors.push({
          record: index,
          recordName: name,
          field: field.name,
          value,
          issue: `required field is ${value === undefined ? "missing" : value === null ? "null" : "empty"}`,
        });
      }
      continue;  // Don't run typed validator on a missing field.
    }

    // Run the typed validator now that we know the value is present.
    const validator = validators[field.type];
    if (!validator) {
      errors.push({
        record: index,
        recordName: name,
        field: field.name,
        value,
        issue: `unknown validator type: "${field.type}"`,
      });
      continue;
    }

    const issue = validator(value, field);
    if (issue) {
      errors.push({ record: index, recordName: name, field: field.name, value, issue });
    }
  }

  return errors;
}

// ─── Report ──────────────────────────────────────────────────────────────────

function writeReport(args: Args, schema: Schema, records: Record<string, unknown>[], errors: ValidationError[]) {
  const errorsByField: Record<string, number> = {};
  for (const e of errors) errorsByField[e.field] = (errorsByField[e.field] ?? 0) + 1;

  const failedRecordIndexes = new Set(errors.map((e) => e.record));

  const report = {
    generatedAt: new Date().toISOString(),
    source: args.dataPath,
    schema: args.schemaPath,
    fieldsChecked: schema.fields.map((f) => `${f.name}:${f.type}${f.required ? "*" : ""}`),
    recordsIn: records.length,
    recordsPassed: records.length - failedRecordIndexes.size,
    recordsFailed: failedRecordIndexes.size,
    totalErrors: errors.length,
    errorsByField,
    errors,
  };
  const resolvedOutput = resolve(args.outputPath);
  mkdirSync(dirname(resolvedOutput), { recursive: true });
  writeFileSync(resolvedOutput, JSON.stringify(report, null, 2), "utf-8");
  return report;
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  const args = parseArgs();
  console.log(`\n--- Validate Data Before Publish ---`);
  console.log(`Data   : ${args.dataPath}`);
  console.log(`Schema : ${args.schemaPath}\n`);

  const schema = loadSchema(args.schemaPath);
  const records = loadRecords(args.dataPath);
  console.log(`Loaded ${records.length} records, ${schema.fields.length} fields to check.\n`);

  const allErrors: ValidationError[] = [];
  for (let i = 0; i < records.length; i++) {
    allErrors.push(...validateRecord(records[i], i, schema));
  }

  const report = writeReport(args, schema, records, allErrors);

  console.log(`── Validation Result ───────────────────────────────────────`);
  console.log(`  Records passed : ${report.recordsPassed} / ${report.recordsIn}`);
  console.log(`  Records failed : ${report.recordsFailed}`);
  console.log(`  Total errors   : ${report.totalErrors}\n`);

  if (report.totalErrors > 0) {
    console.log(`  Errors by field:`);
    for (const [field, count] of Object.entries(report.errorsByField)) {
      console.log(`    ${field.padEnd(20)} ${count}`);
    }
    console.log();

    const show = args.verbose ? allErrors : allErrors.slice(0, 20);
    console.log(`  ${args.verbose ? "All" : "First " + show.length} errors:`);
    for (const e of show) {
      const label = e.recordName ? `"${e.recordName}"` : `record[${e.record}]`;
      const valueStr = e.value === undefined ? "(missing)" : JSON.stringify(e.value);
      console.log(`    [${e.record}] ${label} · ${e.field}: ${e.issue}   value=${valueStr}`);
    }
    if (!args.verbose && allErrors.length > show.length) {
      console.log(`    ... ${allErrors.length - show.length} more — see ${args.outputPath} or run with --verbose`);
    }
  }

  console.log(`\n  Report saved: ${args.outputPath}`);

  if (report.totalErrors > 0) {
    console.log(`\n  Fix the source data and re-run. Do NOT pipe this file to a publisher.\n`);
    process.exit(1);
  }
  console.log(`\n  All records valid. Safe to proceed to script 06 (dry-run → publish).\n`);
}

main();
