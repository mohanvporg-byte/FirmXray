import React, { useEffect, useState } from "react";
import ScanPanel from "./components/ScanPanel.jsx";
import FindingsTable from "./components/FindingsTable.jsx";
import History from "./components/History.jsx";
import { socket, startNetworkScan, startFirmwareScan, getHistory, getScan } from "./api.js";
import { demoFindings, demoHistory } from "./demoData.js";

const TABS = ["Scan", "Findings", "History"];

export default function App() {
  const [tab, setTab] = useState("Scan");
  const [demo, setDemo] = useState(true);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState([]);
  const [findings, setFindings] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const onLog = ({ line }) => setLog((l) => [...l.slice(-200), line]);
    const onDone = ({ findings }) => { setFindings(findings); setBusy(false); setTab("Findings"); };
    const onErr = ({ error }) => { setError(error); setBusy(false); };
    socket.on("scan:log", onLog); socket.on("scan:done", onDone); socket.on("scan:error", onErr);
    return () => { socket.off("scan:log", onLog); socket.off("scan:done", onDone); socket.off("scan:error", onErr); };
  }, []);

  useEffect(() => {
    if (tab !== "History") return;
    if (demo) return setHistory(demoHistory);
    getHistory().then(setHistory).catch((e) => setError(e.message));
  }, [tab, demo]);

  const run = async (fn) => {
    setError(""); setLog([]); setBusy(true);
    if (demo) {
      setLog(["[demo] Discovering devices...", "[demo] Extracting firmware with Binwalk...", "[demo] Correlating CVEs..."]);
      setTimeout(() => { setFindings(demoFindings); setBusy(false); setTab("Findings"); }, 1200);
      return;
    }
    try { await fn(); } catch (e) { setError(e.message); setBusy(false); }
  };

  const openScan = async (id) => {
    if (demo) { setFindings(demoFindings); return setTab("Findings"); }
    const { findings } = await getScan(id);
    setFindings(findings); setTab("Findings");
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="flex items-end justify-between border-b border-ink pb-3">
        <div>
          <h1 className="font-display text-4xl">FirmXRay</h1>
          <p className="text-sm text-ink/70">IoT security intelligence: find devices, unpack firmware, match CVEs.</p>
        </div>
        <label className="text-sm flex items-center gap-2">
          <input type="checkbox" checked={demo} onChange={(e) => setDemo(e.target.checked)} />
          Demo mode
        </label>
      </header>

      <nav className="flex gap-1" role="tablist">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm border border-line ${tab === t ? "bg-ink text-white" : "bg-white"}`}>{t}</button>
        ))}
      </nav>

      {error && <p role="alert" className="text-crit text-sm">Scan failed: {error}</p>}

      {tab === "Scan" && (
        <ScanPanel busy={busy} log={log}
          onNetwork={(t) => run(() => startNetworkScan(t))}
          onFirmware={(f) => run(() => startFirmwareScan(f))} />
      )}
      {tab === "Findings" && <FindingsTable findings={findings} />}
      {tab === "History" && <History scans={history} onOpen={openScan} />}
    </div>
  );
}
