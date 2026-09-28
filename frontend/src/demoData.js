export const demoFindings = [
  { id: 1, component: "openssl", version: "1.0.1f", cve_id: "CVE-2014-0160", cvss: 7.5, severity: "HIGH", description: "Heartbleed: TLS heartbeat over-read leaks process memory.", triage: "Remotely exploitable without auth on any device exposing TLS. Private keys and session data can leak.", remediation: "Upgrade OpenSSL to 1.0.1g or later and rotate device certificates." },
  { id: 2, component: "busybox", version: "1.19.4", cve_id: "CVE-2016-2148", cvss: 9.8, severity: "CRITICAL", description: "Heap overflow in DHCP client (udhcpc).", triage: "Reachable from the local network via a malicious DHCP server, giving code execution as root on most IoT builds.", remediation: "Update BusyBox to 1.25+ or disable udhcpc if a static IP is used." },
  { id: 3, component: "dropbear", version: "2012.55", cve_id: "CVE-2016-7406", cvss: 9.8, severity: "CRITICAL", description: "Format string vulnerability in Dropbear SSH.", triage: "Pre-auth remote code execution when SSH is exposed. Common on routers with WAN SSH enabled.", remediation: "Upgrade Dropbear to 2016.74+ and disable WAN SSH." },
];
export const demoHistory = [
  { id: 3, kind: "firmware", target: "router_fw_v2.bin", status: "done", created_at: "2026-08-20T10:12:00Z", summary: { components: 6, findings: 3 } },
  { id: 2, kind: "network", target: "192.168.1.0/24", status: "done", created_at: "2026-08-19T15:40:00Z", summary: { hosts: 9, findings: 4 } },
];
