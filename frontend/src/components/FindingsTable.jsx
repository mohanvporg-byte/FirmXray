import React, { useState } from "react";
const color = { CRITICAL: "text-crit", HIGH: "text-high", MEDIUM: "text-med", LOW: "text-low" };

export default function FindingsTable({ findings }) {
  const [open, setOpen] = useState(null);
  if (!findings.length) return <p className="text-sm text-ink/70">No findings yet. Start a scan to see CVEs here.</p>;
  return (
    <table className="w-full text-sm border border-line">
      <thead className="bg-ink text-white text-left">
        <tr><th className="p-2">CVE</th><th>Component</th><th>CVSS</th><th>Severity</th></tr>
      </thead>
      <tbody>
        {findings.map((f) => (
          <React.Fragment key={f.id ?? f.cve_id + f.component}>
            <tr className="border-t border-line cursor-pointer hover:bg-line/40" onClick={() => setOpen(open === f.cve_id ? null : f.cve_id)}>
              <td className="p-2 font-medium">{f.cve_id}</td>
              <td>{f.component} {f.version}</td>
              <td>{f.cvss}</td>
              <td className={`font-semibold ${color[f.severity]}`}>{f.severity}</td>
            </tr>
            {open === f.cve_id && (
              <tr className="bg-white"><td colSpan={4} className="p-3 space-y-2">
                <p>{f.description}</p>
                <p><b>Triage:</b> {f.triage}</p>
                <p><b>Fix:</b> {f.remediation}</p>
              </td></tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}
