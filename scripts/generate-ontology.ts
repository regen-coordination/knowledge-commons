import { getRegistry } from "../packages/ontology/src/index";

const target = new URL(
  "../packages/ontology/generated/registry.json",
  import.meta.url,
);
const output = `${JSON.stringify(await getRegistry(), null, 2)}\n`;
if (process.argv.includes("--check")) {
  if (
    !(await Bun.file(target).exists()) ||
    (await Bun.file(target).text()) !== output
  ) {
    throw new Error("Registry is stale; run bun run ontology:generate");
  }
  console.info("Generated ontology matches canonical schemas");
} else {
  await Bun.write(target, output);
  console.info("Generated draft ontology registry");
}
