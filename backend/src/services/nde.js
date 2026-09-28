// NDE: Network Discovery Engine (wraps nmap; requires nmap installed)
import { spawn } from "child_process";

const SAFE_TARGET = /^[a-zA-Z0-9.\-\/]+$/; // blocks shell metacharacters

export function discover(target, onLine) {
  return new Promise((resolve, reject) => {
    if (!SAFE_TARGET.test(target)) return reject(new Error("Invalid target"));
    const p = spawn("nmap", ["-sV", "-T4", "--top-ports", "100", "-oG", "-", target]);
    const hosts = [];
    let buf = "";
    p.stdout.on("data", (d) => {
      buf += d.toString();
      const lines = buf.split("\n");
      buf = lines.pop();
      for (const l of lines) {
        onLine?.(l);
        const m = l.match(/^Host: (\S+) \(([^)]*)\)\s+Ports: (.*)$/);
        if (!m) continue;
        const services = m[3].split(", ").map((s) => {
          const [port, state, proto, , name, , version] = s.split("/");
          return { port: +port, state, proto, name, version: (version || "").trim() };
        }).filter((s) => s.state === "open");
        hosts.push({ ip: m[1], hostname: m[2], services });
      }
    });
    p.on("error", reject);
    p.on("close", (code) => (code === 0 ? resolve(hosts) : reject(new Error("nmap exit " + code))));
  });
}
