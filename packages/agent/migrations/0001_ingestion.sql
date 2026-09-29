CREATE TABLE runs (
  id TEXT PRIMARY KEY,
  caller_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  request_digest TEXT NOT NULL,
  record TEXT NOT NULL,
  UNIQUE(caller_id, idempotency_key)
);
CREATE TABLE attempts (
  run_id TEXT PRIMARY KEY REFERENCES runs(id),
  status TEXT NOT NULL CHECK(status IN ('started', 'received', 'uncertain')),
  reserved_microusd INTEGER NOT NULL CHECK(reserved_microusd >= 0),
  started_at TEXT NOT NULL,
  completed_at TEXT,
  response_ref TEXT,
  usage_json TEXT
);
CREATE TABLE source_revisions (
  source_id TEXT NOT NULL,
  revision INTEGER NOT NULL,
  capture_digest TEXT NOT NULL UNIQUE,
  object_json TEXT NOT NULL,
  PRIMARY KEY(source_id, revision)
);
