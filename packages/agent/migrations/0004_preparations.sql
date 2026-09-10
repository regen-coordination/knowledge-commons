CREATE TABLE preparation_records (
  run_id TEXT NOT NULL REFERENCES runs(id),
  kind TEXT NOT NULL CHECK(kind IN ('approvals', 'geo')),
  record TEXT NOT NULL,
  PRIMARY KEY(run_id, kind)
);
