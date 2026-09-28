// CCE: CVE Correlation Engine (NVD lookup + Claude triage)
import Anthropic from "@anthropic-ai/sdk";
import { redis } from "../db.js";

const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;
const NVD = "https://services.nvd.nist.gov/rest/json/cves/2.0";

const sev = (s) => (s >= 9 ? "CRITICAL" : s >= 7 ? "HIGH" : s >= 4 ? "MEDIUM" : "LOW");

async function nvdLookup(component, version) {
  const key = `cve:${component}:${version}`;
  try { const c = await redis.get(key); if (c) return JSON.parse(c); } catch {}
  const url = `${NVD}?keywordSearch=${encodeURIComponent(component + " " + version)}&resultsPerPage=10`;
  const res = await fetch(url, { headers: process.env.NVD_API_KEY ? { apiKey: process.env.NVD_API_KEY } : {} });
  if (!res.ok) throw new Error("NVD " + res.status);
  const data = await res.json();
  const out = (data.vulnerabilities || []).map(({ cve }) => {
    const m = cve.metrics?.cvssMetricV31?.[0]?.cvssData || cve.metrics?.cvssMetricV30?.[0]?.cvssData;
    return {
      cve_id: cve.id,
      cvss: m?.baseScore ?? 0,
      severity: sev(m?.baseScore ?? 0),
      description: cve.descriptions?.find((d) => d.lang === "en")?.value ?? "",
    };
  });
  try { await redis.set(key, JSON.stringify(out), "EX", 86400); } catch {}
  return out;
}

async function triage(component, version, cve) {
  if (!anthropic) return { triage: "AI triage disabled (no API key)", remediation: "" };
  const msg = await anthropic.messages.create({
    model: process.env.CLAUDE_MODEL || "claude-sonnet-5",
    max_tokens: 400,
    messages: [{
      role: "user",
      content: `You are an IoT security analyst. Component: ${component} ${version}. ${cve.cve_id} (CVSS ${cve.cvss}): ${cve.description}
Reply as JSON only: {"triage":"<2 sentences on real-world exploitability for embedded/IoT devices>","remediation":"<concrete fix steps>"}`,
    }],
  });
  try { return JSON.parse(msg.content[0].text.replace(/```json|```/g, "").trim()); }
  catch { return { triage: msg.content[0].text, remediation: "" }; }
}

export async function correlate(components) {
  const findings = [];
  for (const { name, version } of components) {
    let cves = [];
    try { cves = await nvdLookup(name, version); } catch (e) { console.warn(e.message); }
    for (const cve of cves.filter((c) => c.cvss >= 4).slice(0, 5)) {
      const t = await triage(name, version, cve);
      findings.push({ component: name, version, ...cve, ...t });
    }
  }
  return findings.sort((a, b) => b.cvss - a.cvss);
}
