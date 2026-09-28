import { Router } from "express";
import { q } from "../db.js";
export const historyRouter = Router();

historyRouter.get("/", async (_, res, next) => {
  try { res.json((await q("SELECT * FROM scans ORDER BY created_at DESC LIMIT 100")).rows); } catch (e) { next(e); }
});
historyRouter.get("/:id", async (req, res, next) => {
  try {
    const scan = (await q("SELECT * FROM scans WHERE id=$1", [req.params.id])).rows[0];
    if (!scan) return res.status(404).json({ error: "Not found" });
    const findings = (await q("SELECT * FROM findings WHERE scan_id=$1 ORDER BY cvss DESC", [req.params.id])).rows;
    res.json({ scan, findings });
  } catch (e) { next(e); }
});
historyRouter.get("/:id/audit", async (req, res, next) => {
  try { res.json((await q("SELECT * FROM audit_log WHERE scan_id=$1 ORDER BY at", [req.params.id])).rows); } catch (e) { next(e); }
});
