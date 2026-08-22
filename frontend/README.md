# CyberTriage AI — Frontend Mission Control

Next.js 15 (App Router) + React 19 + TailwindCSS interface designed with Google design aesthetics for autonomous cybersecurity triage, interactive Gemma PoC customization, and live Docker container observation.

---

## 🧭 3-Tab Interface Architecture

### Tab 1 — Vulnerability Analysis & PoC Workspace (`VulnerabilityAnalysisTab.tsx`)
- **Advisory & CVE Ingestion**: Accepts raw vulnerability writeups, security advisories, and CVE URLs. Includes 4 preset golden paths (Log4Shell, XZ Backdoor, AI Prompt Injection, BlueKeep) and dynamically detects custom CVEs and advisory titles.
- **Smart Intake Reset & Clean Workspace**: Automatically clears stale vulnerability parameters, old scripts, and chat history when pasting a new advisory (`onPaste`), with an explicit **"Clear All Materials"** button for a fresh triage start.
- **Interactive Gemma Q&A**: Stream technical answers to clarification questions regarding exploit primitives, CVSS parameters, and mitigation strategies based directly on the user's advisory text.
- **PoC Verification Script Workspace (`poc_verifier.py`)**:
  - In-place Python 3 code editor with syntax styling and real-time line count.
  - **Generate PoC with Gemma**: Streams verification scripts tailored to the user-inputted writeup without forcing premature page navigation.
  - **1-Click PoC Customization Actions**:
    - `👋 Print "Hello World" Greeting Banner`: Instant script edit verification.
    - `🆔 Identify Yourself & Operator Tag`: Injects agent identity and operator verification into recon logs.
    - `🛡️ Add Authorization Bearer Token`: Injects Authorization headers into probe/exploit requests.
    - `⚡ Bypass WAF with URL Encoding`: Adds `urllib.parse` payload encoding and evasion headers.
    - `🔒 Add Base64 Payload Transmutation`: Encodes test payloads with `base64.b64encode`.
    - `🎯 Set Target Port to 8080 & Host Probe`: Reconfigures target port definitions.
    - `⏱️ Add 3x Retry Loop with Backoff`: Robust retry error handling.
    - `🔍 Strict Assertion & Artifact Verification`: Validates exit codes and `/tmp/pwned.txt`.
  - **AST Syntax & Guardrail Feedback**: Displays real-time AST validation status, forbidden module flags, and applied transformation diffs.
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
  - Executive SOC classification headers (`RESTRICTED // TLP:AMBER`), CVSS scorecards, MITRE technique matrices (ATT&CK vs ATLAS), verification checklist badges, and syntax-highlighted code blocks.
  - **Actionable Defenses**: Renders concrete remediation steps, patch guidance, network/container hardening, and copy-paste-ready **SIGMA** rules & **Snort/Suricata** signatures.
- **Dual View Modes**: Seamless toggle between "Rendered Report" and "Raw Markdown".
- **Direct PDF Document Export (`pdfExport.ts`)**: Client-side multi-page A4 PDF generation with paginated headers and footers without browser print dialog popups.
- **Markdown Export & Sharing**: Direct `.md` download and clipboard copy.

---

## 💡 What Worked

1. **Persistent DOM State Mounting**: Keeping tabs mounted in the DOM (`className={activeTab === 'vulnerability' ? 'block' : 'hidden'}`) guarantees that user inputs, custom blog text, CVE URLs, Q&A responses, and in-progress scripts never disappear during navigation.
2. **Auto-Clean Intake Workspace**: Detecting paste operations on the advisory textarea automatically purges previous analysis materials, giving the analyst an instant clean slate for new CVE writeups.
3. **Context-Aware Script Synthesis**: Passing `blog_text` directly to `/api/scripts/generate/stream` and `/api/poc/customize/stream` ensures that Gemma synthesizes code based on the user's actual writeup rather than generic defaults.
4. **1-Click Presets with AST Validation**: Pairing simple customization triggers (like "Print Hello" and "Identify Yourself") with instant AST validation allows rapid verification of script modification pipelines.
5. **Client-Side High-Res PDF Export**: Using `jspdf` and `html2canvas` at 2x retina scale generates publication-ready PDF triage reports with automatic page splitting and running headers.

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
4. **Analysis Material Bleed Across Blogs**:
   - *Problem*: Pasting a second blog did not clear the first blog's extracted matrices or PoC script, causing cognitive friction for the user.
   - *Fix*: Bound `onPaste` to reset `vulnerability`, `chatHistory`, and previous instructions automatically, paired with a manual "Clear All Materials" button.

---

## 🔮 What to Do Next & Optimizations

1. **Monaco / CodeMirror Editor Integration**: Upgrade the raw `<textarea>` in the PoC workspace to a full Monaco/CodeMirror editor with Python auto-completion, linting, and side-by-side diff views.
2. **Multi-Turn Chat History for Gemma**: Expand the "Ask Gemma" panel to retain full multi-turn conversational history with branching clarification paths.
3. **Interactive Step-by-Step Debugger**: Add pause/step/resume controls to the Docker sandbox execution so analysts can step through PoC commands one by one.
4. **Custom Payload Template Library**: Provide a dropdown library of reusable exploit primitives (e.g. SSRF tunneling, JNDI lookups, SQLi error-based, JWT signature stripping).
5. **Real-Time Attack Tree Graph Visualizer**: Upgrade the static attack graph to an interactive D3/Cytoscape attack tree displaying live compromised state nodes as telemetry arrives.

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

