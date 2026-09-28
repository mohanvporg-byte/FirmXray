import { io } from "socket.io-client";
export const socket = io({ autoConnect: true });
const json = (r) => (r.ok ? r.json() : r.json().then((e) => Promise.reject(new Error(e.error || r.statusText))));
export const startNetworkScan = (target) =>
  fetch("/api/scans/network", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ target }) }).then(json);
export const startFirmwareScan = (file) => {
  const fd = new FormData(); fd.append("firmware", file);
  return fetch("/api/scans/firmware", { method: "POST", body: fd }).then(json);
};
export const getHistory = () => fetch("/api/history").then(json);
export const getScan = (id) => fetch(`/api/history/${id}`).then(json);
export const getAudit = (id) => fetch(`/api/history/${id}/audit`).then(json);
