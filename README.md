# CyberTriage AI (AIsploitable)
> **Autonomous Threat Intelligence & Evidence-Driven Empirical Sandbox Verification**

CyberTriage AI is an autonomous, privacy-preserving cybersecurity triage and verification platform powered by local **Gemma** models (`gemma4:e2b` / `gemma4:e4b` via Ollama), offline **MITRE ATT&CK & ATLAS RAG** threat intelligence (755 indexed techniques), and isolated **Docker dual-sandbox execution** with real-time streaming telemetry.

---

## 🌟 Key Features

- **3-Tab Mission Control UI**:
  - **Tab 1: CVE Intake & Blog Questioning**: Echoes target CVE URLs safely without premature scraping, accepts raw cybersecurity blog/incident writeups, and supports real-time streaming Q&A with local Gemma models.
  - **Tab 2: Docker Sandbox (Side-by-Side)**: Live real-time streaming of Gemma-synthesized Python PoC scripts and synchronized dual-container telemetry (`sandbox-attacker-node` at `172.20.0.2` vs `sandbox-victim-target` at `172.20.0.3:8080`), interactive attack graphs, and empirical verification assertions.
  - **Tab 3: Reports & Findings Hub**: Master-detail ledger with search, severity filters (`CRITICAL`, `HIGH`, `MEDIUM`), verdict indicators, and rich executive Markdown report rendering with dual view modes and direct PDF and Markdown export.
- **Local Gemma AI Agents**:
  - **Analyzer Agent**: Extracts CVE identifiers, CVSS metrics, attack vectors, and exploit primitives.
  - **Planner Agent**: Generates structured multi-step attack hypotheses mapped to MITRE tactics.
  - **Script Generator Agent**: Synthesizes safe, deterministic Python PoC verification scripts in real-time.
  - **Verifier & Reporter Agents**: Evaluates stdout/stderr evidence, exit codes, and generates executive reports.
- **Offline Threat Intel RAG (755 Techniques)**:
  - `590` MITRE ATT&CK Enterprise techniques across 10 tactic matrices.
  - `165` MITRE ATLAS AI Security techniques across 4 adversarial ML categories.
  - Sub-5ms in-memory token overlap, keyword matching, and Jaccard similarity scoring without external vector database dependencies.
- **Deterministic Dual-Container Isolation**:
  - Isolated Docker bridge network (`172.20.0.0/24`) with dropped raw socket capabilities (`CAP_NET_RAW` dropped).
  - Eliminates localhost loopback false positives by enforcing true network separation between attacker and victim.

---

## 🏗️ System Architecture

```text
                                [ User / SOC Analyst ]
                                          │
                                          ▼
                      ┌────────────────────────────────────────┐
                      │    Next.js 15 Mission Control UI       │
                      │  (Tab 1: Intake | Tab 2: Docker |      │
                      │   Tab 3: Security Reports Hub)         │
                      └───────────────────┬────────────────────┘
                                          │  REST / WebSocket (ws://)
                                          ▼
                      ┌────────────────────────────────────────┐
                      │        FastAPI Backend Engine          │
                      │   (Lifespan Pre-warm & API Routers)    │
                      └───────────────────┬────────────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
   ┌─────────────────────────────┐                 ┌─────────────────────────────┐
   │    Local Gemma (Ollama)     │                 │   Threat Intel RAG Store    │
   │  - Analyzer & Planner       │                 │  - 590 MITRE ATT&CK Techs   │
   │  - PoC Script Synthesizer   │                 │  - 165 MITRE ATLAS Techs    │
   │  - Verifier & Reporter      │                 │  - In-Memory Inverted Index │
   └──────────────┬──────────────┘                 └──────────────┬──────────────┘
                  │                                               │
                  └───────────────────────┬───────────────────────┘
                                          │
                                          ▼
                      ┌────────────────────────────────────────┐
                      │      Docker Dual-Container Sandbox     │
                      │  ┌──────────────────┐ ┌──────────────┐ │
                      │  │ Attacker Node    │ │ Victim Node  │ │
                      │  │ (172.20.0.2)     │ │ (172.20.0.3) │ │
                      │  │ PoC Script Agent │ │ Target App   │ │
                      │  └────────┬─────────┘ └──────┬───────┘ │
                      │           └─────────┬────────┘         │
                      │                     ▼                  │
                      │         Live Telemetry Streamer        │
                      └────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```text
AIsploitable/
├── package.json            # Root runner (delegates npm commands to frontend)
├── requirements.txt        # Python backend dependencies
├── README.md               # Master project overview and execution guide
├── PRD.md                  # Comprehensive product requirements & architecture spec
├── backend/                # FastAPI backend & autonomous agent orchestration
│   ├── README.md           # Backend API documentation, models, and latency metrics
│   ├── main.py             # FastAPI entrypoint, lifespan, CORS, and routers
│   ├── config.py           # Application settings & Ollama configurations
│   ├── api/                # REST & WebSocket endpoints (models, investigations, reports, ws)
│   ├── agents/             # Gemma agent implementations (analyzer, planner, generator, etc.)
│   ├── rag/                # Threat intelligence loader & semantic hybrid retriever
│   ├── sandbox/            # Dual-container Docker sandbox manager & telemetry streamer
│   ├── prompts/            # Tuned system prompt templates for Gemma models
│   └── models/             # Pydantic schemas for state, evidence, and investigations
├── frontend/               # Next.js 15 (App Router) + React 19 + TailwindCSS
│   ├── package.json        # Frontend dependencies & Next.js scripts
│   ├── README.md           # Frontend layout, 3-tab architecture, and component inventory
│   ├── app/                # App Router pages (page.tsx, results/[id], layout.tsx)
│   ├── components/         # IntakeTab, DockerSandboxTab, ReportsTab, DualTerminal, etc.
│   └── lib/                # API client, WebSocket manager, and TypeScript definitions
├── data/                   # MITRE Threat Intelligence repository
│   ├── README.md           # Threat intelligence statistics (590 ATT&CK + 165 ATLAS)
│   ├── attack/             # 10 MITRE ATT&CK enterprise tactic datasets (JSON)
│   └── atlas/              # 4 MITRE ATLAS AI security tactic datasets (JSON)
└── presentation/           # Hackathon pitch deck, demo script, and judge FAQ
    ├── README.md           # Presentation choreography and judge defense FAQ
    └── PROMPT.md           # Presentation guidelines
```

---

## 🚀 How to Get It Running

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Python 3.10+**
- **Node.js 18+ & npm**
- **Docker** (daemon running)
- **Ollama** installed and running with a Gemma model:
  ```bash
  # Start Ollama service (if not already running)
  ollama serve

  # Pull Gemma model (e.g. gemma4:e2b or gemma2:2b)
  ollama pull gemma4:e2b
  ```

---

### 2. Single-Command Quick Start (From Project Root)

You can launch both the backend and frontend simultaneously with a single command:

```bash
# In project root: /home/haoyi/projects/AIsploitable
./start.sh
```
*(Or run `npm start`)*

This starts:
- 🛡️ **FastAPI Backend**: `http://localhost:8000` (Docs: `http://localhost:8000/docs`)
- 💻 **Next.js Frontend**: `http://localhost:3000`

---

### 3. Running Services Individually (Alternative)

#### Terminal 1 — Start the Backend Server (Port 8000)
```bash
pip install -r requirements.txt
python3 -m backend.main
```

#### Terminal 2 — Start the Next.js Frontend (Port 3000)
```bash
npm run dev
```
*(Or `cd frontend && npm run dev`)*

Open your browser at:
```text
http://localhost:3000
```

---

### 3. Build & Test Commands

| Task | Command (from Root) | Alternative (from Subdirectory) |
| :--- | :--- | :--- |
| **Install Python Deps** | `pip install -r requirements.txt` | `cd backend && pip install -r ../requirements.txt` |
| **Install Frontend Deps**| `npm --prefix frontend install` | `cd frontend && npm install` |
| **Start Backend** | `python3 -m backend.main` | `python3 -m backend.main` |
| **Start Frontend Dev** | `npm run dev` | `cd frontend && npm run dev` |
| **Build Frontend** | `npm run build` | `cd frontend && npm run build` |
| **Verify Backend** | `python3 -c "import backend.main; print('OK')"` | `python3 -c "import backend.main; print('OK')"` |

---

## 🎬 Step-by-Step Live Demo Walkthrough

Once both servers are running, follow this 3-minute interactive workflow:

### Step 1 — Vulnerability Analysis, Ask Gemma & PoC Workspace (Tab 1)
1. In **Tab 1 ("1. Vulnerability Analysis")**, click on a preset scenario or paste any security blog/advisory text.
2. Click **"Analyze & Summarize with Gemma"** to extract CVSS vectors, severity, affected assets, and exploit primitives.
3. In the *"Ask Gemma / Customize"* strip, query the model or request clarification on mitigation strategies with real-time streaming answers.
4. In the **PoC Verification Script Workspace**, click **"Generate PoC with Gemma"** to synthesize a custom Python verification script directly for the advisory.
5. Use the **Ask Gemma PoC Customizer** (e.g. *"Bypass WAF / URL encode payload"*, *"Add Authorization Bearer header"*) and click **"Apply to PoC Script"** to update the editable script in place.
6. Click **"Launch Autonomous Verification"** to spin up the container testbed.

### Step 2 — Side-by-Side Docker Containers (Tab 2)
1. The UI transitions to **Tab 2 ("2. Docker Sandbox (Side-by-Side)")**.
2. Watch the live **PoC Verification Script** and side-by-side terminal consoles:
   - **Left Pane (`sandbox-attacker-node` at `172.20.0.2`)**: Transmits the synthesized payload and verifies assertions.
   - **Right Pane (`sandbox-victim-target` at `172.20.0.3:8080`)**: Logs the incoming connection, target service traces, and daemon responses.
3. Review the **Investigation Timeline**, visual **Attack Graph**, and **Evidence Events**.

### Step 3 — Reports & Findings Hub (Tab 3)
1. Switch to **Tab 3 ("3. Reports & Findings Hub")** (or click *"View Generated Report"*).
2. Browse through the report ledger with severity badges (`CRITICAL`, `HIGH`, `MEDIUM`) and verdicts (`CONFIRMED VULNERABLE`).
3. Read the synthesized executive report complete with CVSS vectors, MITRE ATT&CK mappings, and remediation guidance.
4. Click **"Export PDF"** to directly download a multi-page PDF document, or **"Export .MD"** / **"Copy MD"** to export or copy the raw markdown.

---

## 🛡️ Key Technical Differentiators

| Capability | Standard Triage / LLM Scrapers | CyberTriage AI (AIsploitable) |
| :--- | :--- | :--- |
| **Privacy & Compliance** | Sends code & zero-days to cloud APIs | **100% Local Gemma via Ollama (Air-gapped ready)** |
| **Threat Intelligence** | Generic hallucinated MITRE mappings | **755 Indexed ATT&CK + ATLAS Techniques (Offline RAG)** |
| **Verification Method** | Theoretical LLM assertion | **Deterministic Dual-Container Docker Sandbox** |
| **Network Realism** | Single localhost loopback | **Dual-node bridge isolation (`172.20.0.2` ➔ `172.20.0.3`)** |
| **Interface** | Basic single-prompt chat | **3-Tab Mission Control with Side-by-Side Terminals** |
| **Explainability** | Black-box output | **3-Phase Verification, Telemetry Traces & Root-Cause Analysis** |
| **Actionable Defense** | Vague high-level suggestions | **Concrete Mitigations, Hardening & SIGMA/Snort Rules** |
| **Speed** | Slow multi-step manual reproduction | **Automated end-to-end triage in < 15 seconds** |

---

## 🧠 Engineering Retrospective & Learnings

### 1. What We've Done
- **Explainability-First Architecture**: Transformed raw vulnerability summaries into fully explainable, empirical security intelligence with explicit root-cause breakdowns, MITRE ATT&CK & ATLAS technique mapping rationales, and dual-container stdout/stderr telemetry logs.
- **3-Phase PoC Verification Standard**: Enforced an industry-standard 3-phase harness structure (`step_1_recon` ➔ `step_2_exploit` ➔ `step_3_verify_artifact`) across both local Gemma prompts and fallback generators.
- **1-Click PoC Customization Engine**: Built instant-apply modifications for rapid verification (e.g. `👋 Print Hello Greeting`, `🆔 Identify Yourself & Operator Tag`, `🛡️ Bearer Authentication`, `⚡ WAF Evasion`, `🔒 Base64 Transmutation`, `🎯 Port Configuration`, `⏱️ Retry Loops`, and `🔍 Strict Assertion Verification`) backed by AST syntax validation.
- **Automated Clean Intake Workspace**: Implemented smart clipboard paste detection and a dedicated "Clear All Materials" action so analysts can paste new advisories without stale context lingering from previous CVEs.
- **Publication-Grade Reporting with Actionable Defense**: Overhauled the report generator to provide CVSS scoring, attack chain graphs, telemetry logs, containment steps, patch guidelines, network/container hardening, and copy-paste-ready **SIGMA** rules and **Snort/Suricata** network signatures.

### 2. What Worked
- **Context-Enriched Agent Prompts**: Injecting raw `blog_text` directly into the agent prompts enables Gemma to extract accurate exploit primitives, target ports, and parameters for arbitrary custom CVEs.
- **Sub-5ms In-Memory Threat Intel RAG**: Loading 590 ATT&CK and 165 ATLAS techniques into an in-memory inverted index delivers instant semantic and keyword retrieval with zero database dependencies.
- **Dual-Container Isolation (`172.20.0.2` ➔ `172.20.0.3:8080`)**: True Docker bridge network separation eliminates localhost loopback false positives and provides authentic network packet telemetry.
- **Persistent DOM State in Next.js**: Rendering tabs conditionally with CSS visibility (`block`/`hidden`) preserves draft scripts, chat history, and analysis parameters across tab navigation.
- **Client-Side High-Res PDF Export**: Direct A4 paginated PDF rendering via `jspdf` and `html2canvas` at 2x retina scale generates pristine downloadable reports without browser print dialogs.
- **Deterministic Agent Fallbacks**: Ensuring every agent has an intelligent offline fallback prevents UI crashes if Ollama or Docker is temporarily busy or unavailable.

### 3. What Did Not Work & Lessons Learned
- **Stale Context Carryover Across Advisories**:
  - *Symptom*: When users switched from one advisory (e.g., Log4Shell) to another, old summaries and script fragments remained in memory, causing Gemma to reference the previous CVE.
  - *Solution*: Added an `onPaste` event handler on the advisory input that detects fresh intake writeups and resets vulnerability metadata, scripts, and chat history automatically.
- **Request Model Parameter Omission**:
  - *Symptom*: `CustomizePocRequest` originally omitted `blog_text`, forcing the backend to rely on lossy one-line summaries.
  - *Solution*: Added `blog_text` and `cve_url` across all Pydantic schemas and frontend API calls.
- **Error Strings Masked as LLM Stream Chunks**:
  - *Symptom*: Ollama stream timeouts emitted error text strings that the generator mistook for valid Python code.
  - *Solution*: Separated stream transport error logging from token emission so the engine cleanly triggers fallback routines when an LLM fails.
- **Conditional Tab Unmounting**:
  - *Symptom*: Using `{activeTab === 'vulnerability' && <Component />}` unmounted state and erased user input.
  - *Solution*: Switched to persistent DOM container mounting.

### 4. What Else Could Be Optimized
- **Dynamic Vulnerable Container Synthesis**: Automatically generate and build tailored `Dockerfile` recipes matching the exact vulnerable software versions mentioned in the advisory (e.g., `log4j:2.14.1` or `tomcat:9.0.58`).
- **Empirical Patch Verification Loop**: Introduce a Remediation Agent that applies code/config patches to the victim container, re-executes the PoC script, and proves that the vulnerability is mitigated (proving `CONFIRMED VULNERABLE` ➔ `SECURED & PATCHED`).
- **Multi-Agent Consensus & Debate**: Orchestrate a multi-agent review between `gemma4:e2b` (speed) and `gemma4:e4b` (reasoning) to cross-examine attack hypotheses before execution.
- **Integrated Monaco Code Editor**: Upgrade the PoC workspace from a `<textarea>` to a full Monaco/CodeMirror editor with Python syntax highlighting, autocomplete, and inline diff viewing.
- **Extended Context Window Scaling**: Scale the local model context window from `8192` up to `32k`/`128k` tokens for large multi-file security advisories and kernel crash dump analyses.

---

## 👥 Contributors & Hackathon Team
- **Project**: CyberTriage AI (`AIsploitable`)
- **Engine**: Gemma 4 e2b / e4b + FastAPI + Next.js 15

