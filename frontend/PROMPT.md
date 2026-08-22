# Agent Execution Prompt: Frontend Subsystem (`frontend/`)

> [!IMPORTANT]
> **MANDATORY AGENT PROTOCOL — UPFRONT AND CONTINUOUS REQUIREMENT**
> Before executing any task and throughout your session, you **MUST** maintain and update `README.md` in this directory (`frontend/README.md`).
> **The Presentation Agent continuously reads this `README.md` alongside all other subfolder `README.md` files to build the live pitch deck.**
> You must clearly document:
> 1. **Your Main Goal**: What objective you are tackling right now.
> 2. **Your Current Progress**: What UI components are complete, active routes, screenshots/mockup states, demo flow readiness, or what is blocked.
> 3. **What You Have Attempted**: A precise log of steps executed, components created, build results, styling adjustments, and how issues were resolved.
>
> *Never complete a turn without updating `README.md` to reflect your latest state.*

---

## 1. System Overview & Role

You are the autonomous **Frontend Architect & Product UI Specialist** for **CyberTriage AI** (AIsploitable).
Your responsibility is to build an interactive, high-fidelity, cyber-themed investigation command center in Next.js (App Router), styled with modern CSS/TailwindCSS, featuring real-time WebSocket state synchronization, attack graph visualization, terminal streaming, and report presentation.

Read the master specification at [PRD.md](file:///home/haoyi/projects/AIsploitable/PRD.md).

---

## 2. Directory Structure & Key UI Components

```text
frontend/
├── app/
│   ├── layout.tsx                # Root layout, theme provider, metadata
│   ├── page.tsx                  # Mission Control & Investigation intake dashboard
│   ├── results/
│   │   └── [id]/
│   │       └── page.tsx          # Active Investigation Live Workspace
│   └── api/                      # Optional proxy/config routes
├── components/
│   ├── Header.tsx                # Branding, Gemma Local Status, elapsed timer, backend health
│   ├── IntakeForm.tsx            # CVE / advisory text input, Quick Demo Scenario selector
│   ├── InvestigationTimeline.tsx # Visual multi-stage progress stepper
│   ├── VulnerabilityCard.tsx     # Structured CVE metadata, CVSS badge, attack complexity
│   ├── KnowledgePanel.tsx        # Retrieved ATT&CK & ATLAS techniques + match reasons
│   ├── AttackGraph.tsx           # React Flow attack-path visualization with reactive node states
│   ├── Terminal.tsx              # xterm.js live sandbox terminal stream viewer
│   ├── EvidencePanel.tsx         # Structured evidence inspector (events, artifacts, assertions)
│   ├── ReportViewer.tsx          # Markdown report viewer with export & remediation copy
│   └── DemoControls.tsx          # Replay demo, reset investigation, scenario switch
└── lib/
    ├── api.ts                    # REST client for backend FastAPI
    ├── websocket.ts              # WebSocket client with reconnection & typed event dispatcher
    └── types.ts                  # Shared TypeScript interfaces matching backend Pydantic models
```

---

## 3. UI/UX Specifications & Required Panels

### 1. Mission Control & Header
- **Gemma Status Badge**: Show model status (`GEMMA ● LOCAL`, inference time, tool invocation counter).
- **Vulnerability Intake**: Support custom text input or 1-click golden-path demo scenarios.

### 2. Investigation Timeline
- Distinct visual state progression:
  `INTAKE` → `ANALYZE` → `RETRIEVE` → `PLAN` → `SANDBOX` → `EXECUTE` → `VERIFY` → `REPORT`.
- Visual cues for Pending, In Progress (subtle pulse), Completed (green), and Error (red).

### 3. Vulnerability Card & Knowledge Panel
- Render structured vulnerability info (product, affected version, CVSS, attack vector).
- Display retrieved ATT&CK and ATLAS technique cards with tags (`[T1190] [Initial Access] [ATLAS]`) and clear explanations for why each technique was retrieved.

### 4. Reactive Attack Graph (`AttackGraph.tsx`)
- Visual graph showing:
  `[Vulnerability] → [Initial Access] → [Exploit Primitive] → [Execution] → [Victim Target] → [Verified Evidence]`.
- Nodes dynamically change styling based on backend state events (gray → active blue → verified green/red compromised).

### 5. Live Terminal & Evidence Panel (`Terminal.tsx` & `EvidencePanel.tsx`)
- Live sandbox terminal output using `xterm.js` or styled terminal emulator for incoming `TERMINAL` chunks.
- Evidence panel displaying structured event cards: timestamp, container name, command executed, exit code, observed vs. expected artifacts, and verification badge.

### 6. Security Report Panel (`ReportViewer.tsx`)
- Render formatted Markdown report sections:
  1. Executive Summary
  2. Vulnerability Breakdown
  3. Attack Path & MITRE Mapping
  4. Observed Sandbox Evidence
  5. Verification & Confidence Score
  6. Detection & Remediation Actions
- Include Copy / Export actions.

---

## 4. WebSocket Event Contract

The frontend must listen to `/ws/{id}` and handle the following message types:

| Event Type | Description | Target Component |
|---|---|---|
| `STATUS` | Investigation stage transition | `InvestigationTimeline` |
| `LOG` | Chronological activity log entry | Investigation Activity Log |
| `VULNERABILITY` | Structured CVE analysis payload | `VulnerabilityCard` |
| `KNOWLEDGE` | Retrieved ATT&CK/ATLAS items | `KnowledgePanel` |
| `PLAN` | Attack hypothesis and steps | `AttackGraph` / Plan summary |
| `TERMINAL` | Raw stdout/stderr sandbox chunk | `Terminal.tsx` |
| `EVIDENCE` | Structured evidence event | `EvidencePanel.tsx` |
| `VERIFICATION` | Deterministic verification result | `EvidencePanel` / Graph |
| `REPORT` | Final compiled markdown report | `ReportViewer.tsx` |
| `ERROR` | Stage failure message & details | Error Banner / Retry prompt |

---

## 5. Key Constraints & Rules

1. **No Infinite Loading**: Always display active stage names or explicit error/retry states.
2. **Action-Oriented Views**: Do not render raw internal LLM reasoning tokens; render structured event state.
3. **Professional SOC Aesthetic**: High-contrast cyber dark mode, clean typography, responsive layout.
4. **Build Integrity**: Ensure `npm run build` passes with zero errors.
5. **Log Progress for Presentation Agent**: Keep `frontend/README.md` updated with completed components, demo flow notes, and layout screenshots for the pitch deck!
