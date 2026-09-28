import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { discover } from "../services/nde.js";
import { analyzeFirmware } from "../services/fap.js";
import { correlate } from "../services/cce.js";
import { createScan, finishScan, saveFindings } from "../services/sham.js";

export const scansRouter = Router();
const upload = multer({ dest: "uploads/", limits: { fileSize: 512 * 1024 * 1024 } });

// Network scan: POST /api/scans/network {target}
scansRouter.post("/network", async (req, res, next) => {
  try {
    const io = req.app.get("io");
    const scan = await createScan("network", req.body.target);
    res.status(202).json(scan);
    try {
      const hosts = await discover(req.body.target, (l) => io.emit("scan:log", { id: scan.id, line: l }));
      const comps = hosts.flatMap((h) => h.services.filter((s) => s.version).map((s) => ({ name: s.name, version: s.version })));
      const findings = await correlate(comps);
      await saveFindings(scan.id, findings);
      await finishScan(scan.id, "done", { hosts: hosts.length, findings: findings.length });
      io.emit("scan:done", { id: scan.id, hosts, findings });
    } catch (e) {
      await finishScan(scan.id, "failed", { error: e.message });
      io.emit("scan:error", { id: scan.id, error: e.message });
    }
  } catch (e) { next(e); }
});

// Firmware scan: POST /api/scans/firmware (multipart, field "firmware")
scansRouter.post("/firmware", upload.single("firmware"), async (req, res, next) => {
  try {
    const io = req.app.get("io");
    const scan = await createScan("firmware", req.file.originalname);
    res.status(202).json(scan);
    const outDir = path.resolve("extracted", String(scan.id));
    try {
      io.emit("scan:log", { id: scan.id, line: "Extracting with Binwalk..." });
      const report = await analyzeFirmware(req.file.path, outDir);
      io.emit("scan:log", { id: scan.id, line: `Found ${report.components.length} components, ${report.yara_hits.length} YARA hits` });
      const findings = await correlate(report.components);
      await saveFindings(scan.id, findings);
      await finishScan(scan.id, "done", { components: report.components.length, yara: report.yara_hits.length, findings: findings.length });
      io.emit("scan:done", { id: scan.id, report, findings });
    } catch (e) {
      await finishScan(scan.id, "failed", { error: e.message });
      io.emit("scan:error", { id: scan.id, error: e.message });
    } finally {
      fs.rm(req.file.path, { force: true }, () => {});
    }
  } catch (e) { next(e); }
});
