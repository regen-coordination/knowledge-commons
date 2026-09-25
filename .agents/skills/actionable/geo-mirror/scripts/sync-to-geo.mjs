// Provenance: ported from geo-explorers/content-management
// Source: skills/actionable/geo-mirror/scripts/sync-to-geo.mjs
// Pinned SHA: 6191c3dd8233e59b85093cef3d1982f728154bc1
// Date: 2026-09-23
// Adapted here 2026-09-25: the value-type mapping now follows this repo's
// publishing reference (Date, Datetime, Checkbox, Integer, Float, Decimal and
// Point all have their own type — the earlier version collapsed them), an
// unmapped property type stops the run instead of defaulting to text, and the
// dry run prints the gate summary the editor is approving.
//
// geo-mirror Part 2 — SYNC (plan → Geo). Publishes reviewed Notion edits back to
// Geo as updateEntity ops, through the repo's canonical publishOps (personal-vs-DAO
// routing + the destructive-batch circuit-breaker). DRY_RUN by default — flip to
// publish only after the editor reviews the diff (geo-write's two-phase gate:
// dry-run → confirm → publish → verify on-chain).
//
// Every op here updates an entity that already exists: nothing is created, nothing
// is deleted, and relations are not written as values. So geo-write's correct-type
// and type-required gates cannot apply to this path; the data-type gate does, and
// it is enforced below rather than assumed.
//
// Run (Node, NOT Bun — Bun's fetch hits a bug on the geo API host):
//   node --env-file=.env scripts/sync-to-geo.mjs <plan.json>              # dry-run
//   node --env-file=.env scripts/sync-to-geo.mjs <plan.json> --publish    # write
import { readFileSync } from 'node:fs';
import { Graph, publishOps } from '../../../../scripts/geo/src/functions.ts';

const args = process.argv.slice(2);
const planFile = args[0];
const DRY_RUN = !args.includes('--publish');
if (!planFile || planFile.startsWith('--')) { console.error('usage: node --env-file=.env sync-to-geo.mjs <plan.json> [--publish]'); process.exit(1); }

const { space, plan, previewOnly } = JSON.parse(readFileSync(planFile, 'utf8'));
if (!plan?.length) { console.log('Plan is empty — nothing to sync.'); process.exit(0); }
if (previewOnly && !DRY_RUN) {
  console.error('This plan was built with --preview-all (unapproved proposals). Approve rows and build a real plan before publishing.');
  process.exit(2);
}

// GRC-20 value type for a Geo dataTypeName. This is the mapping table in
// .agents/skills/actionable/geo-write/references/publishing.md. A value whose type
// does not match its property's dataTypeName publishes and then silently fails to
// render, so an unmapped type stops the run instead of guessing.
const VALUE_TYPE = {
  Text: 'text',            // URLs too — the SDK has no url value type
  Date: 'date',
  Datetime: 'datetime',    // not date: setting a datetime as date does not render
  Time: 'time',
  Checkbox: 'boolean',     // not text
  Integer: 'integer',
  Float: 'float',
  Decimal: 'decimal',
  Point: 'point',
  Schedule: 'schedule',
};

function valueType(dataType) {
  const mapped = VALUE_TYPE[dataType];
  if (mapped) return mapped;
  if (dataType === 'Relation') {
    throw new Error('relations are not values — build them with Graph.createRelation (geo-write, Relations)');
  }
  throw new Error(dataType
    ? `"${dataType}" is not in the mapping table — inspect a live instance instead of guessing`
    : 'the plan carries no dataTypeName for this property');
}

// build one updateEntity op per changed entity (all its changed values in one op)
const bySpace = new Map();
const problems = [];
let opCount = 0;
let valuesChecked = 0;
for (const p of plan) {
  const values = [];
  for (const c of p.changes) {
    if (!c.propertyId) continue;
    try {
      values.push({ property: c.propertyId, type: valueType(c.dataType), value: c.new });
      valuesChecked++;
    } catch (err) {
      problems.push(`${p.geoId} · ${c.property}: ${err.message}`);
    }
  }
  if (!values.length) continue;
  const { ops } = Graph.updateEntity({ id: p.geoId, values });
  if (!bySpace.has(p.spaceId)) bySpace.set(p.spaceId, []);
  bySpace.get(p.spaceId).push(...ops);
  opCount += ops.length;
}

console.log(`\n${DRY_RUN ? 'DRY RUN' : 'PUBLISH'} — sync ${plan.length} entities (${opCount} ops) back to Geo`);
for (const p of plan.slice(0, 20)) {
  console.log(`  [${p.db}] ${p.geoId}`);
  for (const c of p.changes) console.log(`    ${c.property}: → "${String(c.new).slice(0, 60)}"`);
}
if (plan.length > 20) console.log(`  … ${plan.length - 20} more`);

console.log('\nGates (this path only updates entities that already exist):');
console.log(problems.length
  ? `  data type       — STOP: ${problems.length} value(s) cannot be typed safely`
  : `  data type       — PASS: ${valuesChecked} value(s) checked against the property schema`);
console.log('  duplicate       — not applicable: no entity is created');
console.log('  correct type    — not applicable: no entity is created');
console.log('  type required   — not applicable: no entity is created');
console.log('  relation target — not applicable: relations are refused as values above');

if (problems.length) {
  console.error('\nNothing to publish until these are resolved:');
  for (const p of problems) console.error(`  ${p}`);
  process.exit(2);
}

if (DRY_RUN) {
  console.log('\n(DRY RUN — nothing written. Re-run with --publish after the editor confirms.)');
  process.exit(0);
}

for (const [spaceId, ops] of bySpace) {
  console.log(`\nPublishing ${ops.length} ops to space ${spaceId}…`);
  const result = await publishOps(ops, `Notion sync — ${space?.name ?? spaceId}`, spaceId);
  console.log(result ? `  ✅ ${result}` : '  ⚠ skipped (space not yours / not an editor)');
}
console.log('\nNow verify on-chain: open the space and confirm the edited fields render.');
console.log(`View: https://www.geobrowser.io/space/${space?.id ?? [...bySpace.keys()][0]}`);
