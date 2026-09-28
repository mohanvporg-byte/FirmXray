// FAP: Firmware Analysis Pipeline (Binwalk + YARA + strings via Python)
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const script = path.resolve(here, "../../../analyzer/fap_analyze.py");

export function analyzeFirmware(filePath, outDir) {
  return new Promise((resolve, reject) => {
    const p = spawn(process.env.PYTHON_BIN || "python3", [script, filePath, outDir]);
    let out = "", err = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (code) => {
      if (code !== 0) return reject(new Error(err || "analyzer failed"));
      try { resolve(JSON.parse(out)); } catch { reject(new Error("bad analyzer output")); }
    });
  });
}
