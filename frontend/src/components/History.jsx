import React from "react";
export default function History({ scans, onOpen }) {
  if (!scans.length) return <p className="text-sm text-ink/70">No scans recorded yet.</p>;
  return (
    <ul className="divide-y divide-line border border-line bg-white">
      {scans.map((s) => (
        <li key={s.id}>
          <button onClick={() => onOpen(s.id)} className="w-full text-left p-3 flex justify-between hover:bg-line/40">
            <span><b>{s.target}</b> ({s.kind})</span>
            <span className="text-sm text-ink/70">{s.status}, {new Date(s.created_at).toLocaleString()}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
