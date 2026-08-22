# CyberTriage AI — Frontend Mission Control

Next.js 15 (App Router) + React 19 + TailwindCSS interface designed with Google design aesthetics for autonomous cybersecurity triage, interactive Gemma PoC customization, and live Docker container observation.

---

## 🧭 3-Tab Interface Architecture

### Tab 1 — Vulnerability Analysis & PoC Workspace (`VulnerabilityAnalysisTab.tsx`)
- **Advisory & CVE Ingestion**: Accepts raw vulnerability writeups, security advisories, and CVE URLs. Includes 4 preset golden paths (Log4Shell, XZ Backdoor, AI Prompt Injection, BlueKeep) and dynamically detects custom CVEs and advisory titles.
- **Interactive Gemma Q&A**: Stream technical answers to clarification questions regarding exploit primitives, CVSS parameters, and mitigation strategies based directly on the user's advisory text.
- **PoC Verification Script Workspace (`poc_verifier.py`)**:
  - In-place Python 3 code editor with syntax styling and real-time line count.
  - **Generate PoC with Gemma**: Streams verification scripts tailored to the user-inputted writeup without forcing premature page navigation.
  - **Ask Gemma: PoC Clarification & Customizer**: Allows arbitrary natural language instructions (e.g. bypass WAF, add Auth Bearer tokens, change target ports, add retry loops). Streams Gemma's explanations and revised code.
  - **Apply to PoC Script**: One-click extraction of the updated code block into the active editor, synchronized with top-level state.
- **Launch Autonomous Verification**: Seamlessly starts background container orchestration and transitions to Tab 2.

### Tab 2 — Docker Sandbox Isolation Lab (`DockerSandboxTab.tsx` & `DualTerminal.tsx`)
- **Dual-Container Live Telemetry**: Side-by-side terminal consoles:
  - `sandbox-attacker-node` (`172.20.0.2`): Executes the reviewed Gemma Python PoC script, network probes, and assertions.
  - `sandbox-victim-target` (`172.20.0.3:8080`): Logs incoming requests, target daemon traces, and impact events.
- **Gemma Script Stream Viewer (`ScriptStreamViewer.tsx`)**: Live streaming display of the active PoC script.
- **Investigation Stepper Timeline (`InvestigationTimeline.tsx`)**: 8-stage progress tracker from Intake to Final Report.
- **Interactive Attack Chain Graph (`AttackGraph.tsx`)**: Visual node-edge execution flow.
- **Evidence & Verification Inspector (`EvidencePanel.tsx`)**: Raw exit codes, stdout/stderr, observed artifacts, and confidence scoring.

### Tab 3 — Reports & Findings Hub (`ReportsTab.tsx` & `MarkdownReportRenderer.tsx`)
- **Master-Detail Ledger**: Searchable list of generated reports filtered by severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) and verdict (`CONFIRMED VULNERABLE`, `REFUTED`).
- **Rich Executive Report Rendering (`MarkdownReportRenderer.tsx`)**:
  - Executive SOC classification headers (`RESTRICTED // TLP:AMBER`), CVSS scorecards, MITRE technique matrices, verification checklist badges, and syntax-highlighted code blocks.
- **Dual View Modes**: Seamless toggle between "Rendered Report" and "Raw Markdown".
- **Direct PDF Document Export (`pdfExport.ts`)**: Client-side multi-page A4 PDF generation with paginated headers and footers without browser print dialog popups.
- **Markdown Export & Sharing**: Direct `.md` download and clipboard copy.

---

## 💡 What Worked

1. **Persistent DOM State Mounting**: Keeping tabs mounted in the DOM (`className={activeTab === 'vulnerability' ? 'block' : 'hidden'}`) guarantees that user inputs, custom blog text, CVE URLs, Q&A responses, and in-progress scripts never disappear during navigation.
2. **Context-Aware Script Synthesis**: Passing `blog_text` directly to `/api/scripts/generate/stream` and `/api/poc/customize/stream` ensures that Gemma synthesizes code based on the user's actual writeup rather than generic defaults.
3. **One-Click Script Application**: Regex-based extraction of ` ```python ... ``` ` code blocks from Gemma's streaming customization allows seamless, in-place script updates with zero copy-paste friction.
4. **Client-Side High-Res PDF Export**: Using `jspdf` and `html2canvas` at 2x retina scale generates publication-ready PDF triage reports with automatic page splitting and running headers.

---

## ⚠️ What Was Tried & Failed (Lessons Learned)

1. **Conditional Tab Unmounting (`{activeTab === 'vulnerability' && <Tab />}`)**:
   - *Problem*: When users navigated to the Docker Sandbox or Reports tab, React unmounted the component, destroying all local `useState` variables (pasted blog text, custom vulnerability parameters, and drafted PoC scripts).
   - *Fix*: Switched to persistent DOM container rendering with CSS visibility toggling (`block`/`hidden`).
2. **Premature Tab Navigation in `handleScriptGenerated`**:
   - *Problem*: The callback immediately called `setActiveTab('docker')` as soon as the script started/finished streaming, preventing users from reviewing or customizing the script on Tab 1.
   - *Fix*: Decoupled script generation from navigation; users remain on Tab 1 to inspect and customize, and only transition to Tab 2 upon clicking "Launch Autonomous Verification" or manually selecting the tab.
3. **Stale Preset Summary Overriding Custom Blog Text**:
   - *Problem*: If the user pasted a new blog without clicking "Analyze & Summarize", the PoC generator used `vulnerability.summary` which still held the previous preset's data (e.g. Log4Shell).
   - *Fix*: The generator now prioritizes the actual `blogText` (and extracts the CVE and title dynamically) whenever a custom blog is present.

---

## 🔮 What to Do Next

1. **Monaco / CodeMirror Editor Integration**: Upgrade the raw `<textarea>` in the PoC workspace to a full Monaco/CodeMirror editor with Python auto-completion, linting, and diff views.
2. **Multi-Turn Chat History for Gemma**: Expand the "Ask Gemma" panel to retain full multi-turn conversational history with branching clarification paths.
3. **Interactive Step-by-Step Debugger**: Add pause/step/resume controls to the Docker sandbox execution so analysts can step through PoC commands one by one.
4. **Custom Payload Template Library**: Provide a dropdown library of reusable exploit primitives (e.g. SSRF tunneling, JNDI lookups, SQLi error-based, JWT signature stripping).

---

## 🛠️ Build & Dev

```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm run dev

# Create optimized production build
npm run build
```

