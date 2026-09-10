CREATE TABLE integrity_attempts (
  run_id TEXT PRIMARY KEY REFERENCES runs(id),
  status TEXT NOT NULL CHECK(status IN ('started','received','uncertain')),
  reserved_microusd INTEGER NOT NULL CHECK(reserved_microusd >= 0),
  started_at TEXT NOT NULL,
  response_ref TEXT,
  usage_json TEXT
);
CREATE TABLE reviews (
  run_id TEXT PRIMARY KEY REFERENCES runs(id),
  record TEXT NOT NULL,
  lease_owner TEXT,
  lease_until INTEGER NOT NULL DEFAULT 0,
  resume_count INTEGER NOT NULL DEFAULT 0
);
