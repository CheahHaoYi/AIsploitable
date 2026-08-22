# Frontend Subsystem: CyberTriage AI (AIsploitable)

## 1. Main Goal
Build an interactive, high-fidelity, Google visual design-inspired autonomous cyber triage command center in Next.js (App Router), featuring model selection for local Gemma models (`gemma4:e2b` default, `gemma4:e4b`), URL intake routing, large-text vulnerability ingestion, real-time WebSocket state synchronization, reactive attack graph visualization, live sandbox terminal streaming, and executive Markdown report presentation.

## 2. Current Progress
- **Routes Active**:
  - `/`: Main Mission Control dashboard with Header, Intake Form, Direct Prompt runner, and Live Investigation Workspace.
  - `/results/[id]`: Dedicated live workspace permalink for active or historical investigation sessions.
- **UI Components Complete**:
  - `Header.tsx`: Google visual design navbar with dynamic Ollama model selector dropdown (default `gemma4:e2b`), live SOC status indicator, and ATT&CK/ATLAS RAG capability badges.
  - `IntakeForm.tsx`: Web URL input with 1-click text box insertion, expandable high-capacity advisory text area with character counter, 4 pre-configured golden-path scenario presets (Windows RDP, Log4Shell, Probllama, MITRE ATLAS), and dual action triggers (Autonomous Triage vs Fast Direct Prompt).
  - `InvestigationTimeline.tsx`: Multi-stage progression stepper (`INTAKE` → `ANALYZE` → `RETRIEVE` → `PLAN` → `SANDBOX` → `EXECUTE` → `VERIFY` → `REPORT` → `COMPLETED`).
  - `VulnerabilityCard.tsx`: Structured CVE metadata, CVSS base score badge, attack vector matrix, and exploit primitives tags.
  - `KnowledgePanel.tsx`: Retrieved MITRE ATT&CK & ATLAS technique cards with confidence meters and `Why retrieved:` contextual explanations.
  - `AttackGraph.tsx`: Reactive attack chain node flow (`[Vulnerability] → [Initial Access] → [Exploit Primitive] → [Execution] → [Victim Target] → [Verified Evidence]`).
  - `Terminal.tsx`: High-contrast live streaming terminal emulator with ANSI formatting, autoscroll toggle, and log copying.
  - `EvidencePanel.tsx`: Structured telemetry and evidence inspector with exit code badges, command logs, and verified assertion results.
  - `ReportViewer.tsx`: Clean Markdown report viewer with copy and download actions.
  - `DirectPromptView.tsx`: Dedicated instant response panel for fast direct Ollama model routing.
- **Build Status**: Production build `npm run build` passing with zero errors (Route /: 5.68 kB, Route /results/[id]: 1.68 kB).

## 3. Execution & Implementation Log
1. Configured Next.js 15, React 19, TailwindCSS, PostCSS, and TypeScript in `frontend/`.
2. Defined Google design tokens in `tailwind.config.js` (clean `#ffffff` white background, `#1a73e8` Google Blue, subtle `#dadce0` borders, `#f8f9fa` surface backgrounds, and Google card elevation shadows).
3. Built TypeScript schemas in `frontend/lib/types.ts` mirroring backend Pydantic models.
4. Implemented REST API client (`frontend/lib/api.ts`) and auto-reconnecting typed WebSocket client (`frontend/lib/websocket.ts`).
5. Assembled all components into `frontend/app/page.tsx` and `frontend/app/results/[id]/page.tsx`.
6. Verified complete production build and compilation.
