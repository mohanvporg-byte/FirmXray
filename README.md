# FirmXRay

IoT Security Intelligence Platform. Discovers devices on a network, unpacks and scans firmware, correlates components against CVEs, and uses Claude to triage findings and write remediation steps.

## Modules
| Module | Path | What it does |
|---|---|---|
| NDE (Network Discovery Engine) | `backend/src/services/nde.js` | nmap service and version discovery |
| FAP (Firmware Analysis Pipeline) | `analyzer/fap_analyze.py` | Binwalk extraction, YARA rules, component fingerprinting |
| CCE (CVE Correlation Engine) | `backend/src/services/cce.js` | NVD lookup (cached in Redis) plus Claude triage |
| SHAM (Scan History and Audit Module) | `backend/src/services/sham.js` | PostgreSQL scan history and audit log |

## Stack
React 18, Vite, Tailwind | Node.js, Express, Socket.io | PostgreSQL, Redis | Python, Binwalk, YARA | Anthropic Claude API

## One-command start (Docker)
```bash
cp .env.example .env   # add your ANTHROPIC_API_KEY
docker compose up --build
```
Open http://localhost:8080. The backend image bundles nmap, Binwalk and YARA.

## Manual setup (Kali / Debian)
```bash
sudo apt update && sudo apt install -y nmap binwalk python3-pip docker.io docker-compose-plugin
pip install -r analyzer/requirements.txt --break-system-packages

cp .env.example .env        # add your ANTHROPIC_API_KEY
docker compose up -d        # PostgreSQL and Redis

cd backend && npm install && npm run dev      # API on :4000
cd frontend && npm install && npm run dev     # UI on :5173
```
The UI starts in **Demo mode** (sample data). Untick it to run real scans against the API.

## API
- `POST /api/scans/network` `{ "target": "192.168.1.0/24" }`
- `POST /api/scans/firmware` multipart field `firmware`
- `GET /api/history`, `GET /api/history/:id`, `GET /api/history/:id/audit`
- Socket.io events: `scan:log`, `scan:done`, `scan:error`

## Legal
Only scan networks and firmware you own or have written permission to test.
