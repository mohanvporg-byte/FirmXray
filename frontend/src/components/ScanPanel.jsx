import React, { useState } from "react";

export default function ScanPanel({ onNetwork, onFirmware, log, busy }) {
  const [target, setTarget] = useState("192.168.1.0/24");
  const [file, setFile] = useState(null);
  const btn = "px-4 py-2 bg-ink text-white text-sm disabled:opacity-40";
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <section className="border border-line p-4 space-y-3">
        <h2 className="font-display text-xl">Scan a network</h2>
        <input value={target} onChange={(e) => setTarget(e.target.value)} aria-label="Target IP or CIDR"
          className="w-full border border-line p-2 text-sm" />
        <button className={btn} disabled={busy || !target} onClick={() => onNetwork(target)}>Discover devices</button>
      </section>
      <section className="border border-line p-4 space-y-3">
        <h2 className="font-display text-xl">Analyze firmware</h2>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} aria-label="Firmware file" className="text-sm" />
        <button className={btn} disabled={busy || !file} onClick={() => onFirmware(file)}>Upload and analyze</button>
      </section>
      <pre className="md:col-span-2 bg-white border border-line p-3 text-xs h-40 overflow-auto">{log.join("\n") || "Scan output appears here."}</pre>
    </div>
  );
}
