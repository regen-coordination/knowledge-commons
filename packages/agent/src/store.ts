import {
  type CapturePacket,
  digest,
  IngestionError,
  type IngestionRecord,
  type KnowledgeObject,
  RESERVE_MICROUSD,
  sourceObject,
} from "@knowledge-commons/pipeline";
import { decodeRun, type Runtime, type StoredRun } from "./bindings";

export class Store {
  constructor(readonly env: Runtime) {}
  async run(id: string) {
    const row = await this.env.DB.prepare(
      "SELECT record FROM runs WHERE id = ?",
    )
      .bind(id)
      .first<StoredRun>();
    if (!row) throw new IngestionError("run_not_found");
    return decodeRun(row);
  }
  async save(run: IngestionRecord, touch = true) {
    if (touch) run.updatedAt = new Date().toISOString();
    await this.env.DB.prepare("UPDATE runs SET record = ? WHERE id = ?")
      .bind(JSON.stringify(run), run.id)
      .run();
  }
  async put(key: string, value: unknown) {
    const result = await this.env.ARTIFACTS.put(key, JSON.stringify(value), {
      httpMetadata: { contentType: "application/json" },
    });
    if (!result) throw new IngestionError("artifact_write_failed");
    return key;
  }
  async get<T>(key: string): Promise<T | null> {
    const item = await this.env.ARTIFACTS.get(key);
    return item ? await item.json<T>() : null;
  }
  async reserve(run: IngestionRecord) {
    const budget = Number(this.env.PILOT_BUDGET_USD ?? 0);
    const cap =
      Number.isFinite(budget) && budget > 0
        ? Math.floor(budget * 1_000_000)
        : 0;
    const reserve = run.execution === "fixture" ? 0 : RESERVE_MICROUSD;
    const result =
      await this.env.DB.prepare(`INSERT OR IGNORE INTO attempts (run_id,status,reserved_microusd,started_at)
      SELECT ?, 'started', ?, ? WHERE ? <= ? - (SELECT COALESCE(SUM(reserved_microusd),0) FROM attempts) - (SELECT COALESCE(SUM(reserved_microusd),0) FROM integrity_attempts)`)
        .bind(run.id, reserve, new Date().toISOString(), reserve, cap)
        .run();
    if (!result.meta.changes) {
      const previous = await this.env.DB.prepare(
        "SELECT status FROM attempts WHERE run_id = ?",
      )
        .bind(run.id)
        .first();
      throw new IngestionError(
        previous ? "provider_attempt_needs_reconciliation" : "budget_exhausted",
      );
    }
  }
  async source(
    packet: CapturePacket,
    run: IngestionRecord,
  ): Promise<KnowledgeObject> {
    const same = await this.env.DB.prepare(
      "SELECT object_json FROM source_revisions WHERE capture_digest = ?",
    )
      .bind(packet.capture.digest)
      .first<{ object_json: string }>();
    if (same) return JSON.parse(same.object_json);
    const latest = await this.env.DB.prepare(
      "SELECT object_json FROM source_revisions WHERE source_id = ? ORDER BY revision DESC LIMIT 1",
    )
      .bind(packet.capture.sourceId)
      .first<{ object_json: string }>();
    const source = await sourceObject(
      packet,
      run,
      latest ? JSON.parse(latest.object_json) : undefined,
    );
    await this.env.DB.prepare(
      "INSERT INTO source_revisions(source_id, revision, capture_digest, object_json) VALUES(?,?,?,?)",
    )
      .bind(
        source.id,
        source.revision,
        packet.capture.digest,
        JSON.stringify(source),
      )
      .run();
    return source;
  }
  async snapshot(run: IngestionRecord) {
    await this.put(`runs/${run.id}/manifest.json`, {
      run,
      digest: await digest(run),
    });
  }
}
