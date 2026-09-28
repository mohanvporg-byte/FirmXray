CREATE TABLE IF NOT EXISTS scans (
  id SERIAL PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('network','firmware')),
  target TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  summary JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS findings (
  id SERIAL PRIMARY KEY,
  scan_id INT REFERENCES scans(id) ON DELETE CASCADE,
  component TEXT, version TEXT,
  cve_id TEXT, cvss NUMERIC(3,1), severity TEXT,
  description TEXT, triage TEXT, remediation TEXT
);
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  scan_id INT REFERENCES scans(id) ON DELETE SET NULL,
  action TEXT NOT NULL, detail JSONB DEFAULT '{}',
  at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_findings_scan ON findings(scan_id);
