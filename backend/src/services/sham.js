// SHAM: Scan History and Audit Module
import { q } from "../db.js";

export async function createScan(kind, target) {
  const { rows } = await q("INSERT INTO scans(kind,target) VALUES($1,$2) RETURNING *", [kind, target]);
  await audit(rows[0].id, "scan_started", { kind, target });
  return rows[0];
}
export async function finishScan(id, status, summary = {}) {
  await q("UPDATE scans SET status=$2, summary=$3, finished_at=now() WHERE id=$1", [id, status, summary]);
  await audit(id, "scan_" + status, summary);
}
export async function saveFindings(scanId, findings) {
  for (const f of findings) {
    await q(
      `INSERT INTO findings(scan_id,component,version,cve_id,cvss,severity,description,triage,remediation)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [scanId, f.component, f.version, f.cve_id, f.cvss, f.severity, f.description, f.triage, f.remediation]
    );
  }
}
export const audit = (scanId, action, detail = {}) =>
  q("INSERT INTO audit_log(scan_id,action,detail) VALUES($1,$2,$3)", [scanId, action, detail]);
