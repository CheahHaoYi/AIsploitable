# CyberTriage AI — Frontend Mission Control

Next.js 15 (App Router) + React 19 + TailwindCSS interface designed with Google design aesthetics for autonomous cybersecurity triage and live Docker container observation.

---

## 🧭 3-Tab Interface Overview

### Tab 1 — CVE Intake & Blog Questioning (`IntakeTab.tsx`)
- **CVE Link Ingestion Card**: Input CVE URL with live echo preview card. Explicitly informs the analyst that the link is queued/stored without executing premature scraping.
- **Cybersecurity Advisory Text Area**: Accepts vulnerability descriptions, writeups, and blog text. Includes 4 instant preset scenarios (Log4Shell, XZ Backdoor, AI Prompt Injection, BlueKeep).
- **Interactive Gemma Q&A**: Stream answers to specific questions about the advisory in real time using local Gemma.
- **Action Triggers**: One-click buttons to "Stream PoC Script with Gemma" or "Launch Autonomous Verification".

### Tab 2 — Docker Sandbox (Side-by-Side) (`DockerSandboxTab.tsx` & `DualTerminal.tsx`)
- **Dual-Container Live Telemetry**: Side-by-side terminal panes for:
  - `sandbox-attacker-node` (`172.20.0.2`): PoC Agent executing network payloads, process spawns, and assertions.
  - `sandbox-victim-target` (`172.20.0.3:8080`): Target service logging incoming connections, daemon traces, and impact events.
- **Gemma Script Stream Viewer (`ScriptStreamViewer.tsx`)**: Live streaming display of the synthesized Python PoC script with syntax styling, line numbers, and copy actions.
- **Investigation Stepper Timeline (`InvestigationTimeline.tsx`)**: 8-stage progress tracker from Intake to Final Report.
- **Interactive Attack Chain Graph (`AttackGraph.tsx`)**: Visual node-edge execution flow.
- **Evidence & Verification Inspector (`EvidencePanel.tsx`)**: Raw exit codes, stdout/stderr, observed artifacts, and confidence scoring.

### Tab 3 — Reports & Findings Hub (`ReportsTab.tsx`)
- **Master-Detail Ledger**: Searchable list of generated reports filtered by severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) and verdict (`CONFIRMED VULNERABLE`, `REFUTED`).
- **Markdown Report Renderer**: Formatted executive summaries, CVSS scorecards, MITRE technique matrices, empirical container evidence logs, and actionable remediation steps.
- **Export & Sharing**: One-click Markdown copy and `.md` file download.

---

## 🛠️ Build & Dev

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Create optimized production build
npm run build
```
