import type { IngestionRecord } from "@knowledge-commons/pipeline";
export type Bindings = {
  PILOT_API_TOKEN?: string;
  PILOT_CALLER_ID?: string;
  OPENAI_API_KEY?: string;
  GITHUB_TOKEN?: string;
  REVIEW?: Workflow<{ runId: string }>;
  PILOT_BUDGET_USD?: string;
  EXECUTION_MODE?: string;
  CODE_REVISION?: string;
  DB?: D1Database;
  ARTIFACTS?: R2Bucket;
  INGESTION?: Workflow<{ runId: string }>;
};
export type Runtime = Bindings & {
  DB: D1Database;
  ARTIFACTS: R2Bucket;
  INGESTION: Workflow<{ runId: string }>;
};
export type StoredRun = { record: string };
export const decodeRun = (row: StoredRun): IngestionRecord =>
  JSON.parse(row.record);
export function runtime(env: Bindings): Runtime {
  if (!env.DB || !env.ARTIFACTS || !env.INGESTION)
    throw new Error("ingestion_bindings_missing");
  return env as Runtime;
}
