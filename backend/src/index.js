import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { scansRouter } from "./routes/scans.js";
import { historyRouter } from "./routes/history.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CORS_ORIGIN } });

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());
app.set("io", io);

app.get("/api/health", (_, res) => res.json({ ok: true }));
app.use("/api/scans", scansRouter);
app.use("/api/history", historyRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`FirmXRay API on :${port}`));
