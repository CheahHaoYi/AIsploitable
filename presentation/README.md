# CyberTriage AI (AIsploitable) — Presentation & Pitch Subsystem

> **Autonomous Threat Intelligence & Evidence-Driven Empirical Sandbox Verification**
> Hackathon Pitch Strategy, Marp Presentation Deck, Demonstration Choreography, and Subsystem Intelligence Compendium.

---

## 🎯 Executive Summary & Learning Compendium

CyberTriage AI was constructed to solve the fundamental flaw in modern AI cybersecurity tooling: **LLMs assert without verifying, hallucinate exploit paths, and leak sensitive vulnerability disclosures to cloud APIs.** 

CyberTriage AI implements **"Evidence Over Assertion"**: combining local Gemma 3 reasoning (`gemma4:e2b` / `gemma4:e4b`), sub-5ms offline Threat Intelligence RAG (755 ATT&CK & ATLAS techniques), and an isolated dual-container Docker testbed (`172.20.0.2` ➔ `172.20.0.3:8080`) that produces empirical proof of vulnerability.

### 🧠 Cross-Subsystem Intelligence Summary

| Subsystem | Key Technologies & Architecture | Core Performance & Verified Metrics |
| :--- | :--- | :--- |
| **Data & Threat Intel**<br>([`data/README.md`](file:///home/haoyi/projects/AIsploitable/data/README.md)) | • 590 MITRE ATT&CK Enterprise Techniques<br>• 165 MITRE ATLAS AI Security Techniques<br>• In-memory inverted index | • **755 total indexed techniques**<br>• **&lt; 500ms** pre-warm at app startup<br>• **&lt; 5ms** query latency (BM25 + Jaccard) |
| **Backend Engine**<br>([`backend/README.md`](file:///home/haoyi/projects/AIsploitable/backend/README.md)) | • FastAPI async lifespan + WebSockets<br>• Local Gemma 3 via Ollama (`gemma4:e2b`)<br>• 5-Agent Pipeline (Analyzer, Planner, Generator, Verifier, Reporter) | • **100% On-device privacy** (air-gapped ready)<br>• Real-time token streaming over WS<br>• Zero external vector database overhead |
| **Dual-Container Sandbox**<br>([`backend/sandbox/manager.py`](file:///home/haoyi/projects/AIsploitable/backend/sandbox/manager.py)) | • Ephemeral bridge (`172.20.0.0/24`)<br>• `sandbox-attacker-node` (`172.20.0.2`)<br>• `sandbox-victim-target` (`172.20.0.3:8080`)<br>• Dropped `CAP_NET_RAW` privileges | • Eliminates localhost loopback false positives<br>• Live subprocess stdout/stderr capture<br>• Deterministic exit code & artifact assertions |
| **Frontend Mission Control**<br>([`frontend/README.md`](file:///home/haoyi/projects/AIsploitable/frontend/README.md)) | • Next.js 15 (App Router) + React 19<br>• 3-Tab Architecture with persistent DOM mounting<br>• Google Visual & Design Language<br>• Side-by-side terminal streams | • In-place Gemma PoC refinement & 1-click apply<br>• Dynamic visual attack graph & stepper timeline<br>• Direct client-side A4 PDF & Markdown export |

---

## 📽️ Presentation Deck (`presentation/slides.md`)

The official hackathon slide deck is authored in **Marp** using custom **Google Visual Design** CSS variables, Google Sans typography, card containers, and color accents.

### Narrative Arc (4 Key Pillars):

1. **What the Product Is (Slides 1–4)**:
   - Product Identity: Autonomous Threat Intelligence & Empirical Sandbox Verification.
   - Core Pillars: Local Gemma 3 Multi-Agent reasoning, 755 offline threat intel techniques, and deterministic Docker dual-node sandboxing.
   - Gemma Ensemble Architecture: Analyzer, Planner, PoC Generator, Verifier, and Reporter agents.
2. **Why It Matters (Slides 5–6)**:
   - The Triage Crisis: Alert fatigue (50+ CVEs daily), cloud LLM privacy leaks, and AI hallucination hazards.
   - Paradigm Shift: *"Evidence Over Assertion"* — replacing theoretical claims with empirical sandbox exit codes and network traces.
3. **How To Use It (Slides 7–10)**:
   - 3-Tab Mission Control Walkthrough:
     - **Tab 1 (Intake & PoC Workspace)**: CVE input, streaming Gemma Q&A, and natural-language PoC customizer.
     - **Tab 2 (Docker Sandbox Lab)**: Side-by-side terminals (`172.20.0.2` vs `172.20.0.3`), attack graph, and evidence inspector.
     - **Tab 3 (Reports & Findings Hub)**: Master-detail ledger, TLP:AMBER classification, and direct PDF/MD export.
4. **What Are The Impact (Slides 11–13)**:
   - Quantified Gains: Triage time reduced from hours to **&lt; 15 seconds** (95% efficiency gain).
   - Zero Data Leakage: Complete air-gapped compliance for sensitive enterprise code.
   - Future Horizon: Automated Exploit-Fix validation loops and CI/CD DevSecOps integration.

---

## 🎬 3-Minute Live Demo Choreography

```text
0:00 ─── 0:45 ─── 2:00 ─── 3:00
 │         │         │         │
 └─ Tab 1 ─┴─ Tab 2 ─┴─ Tab 3 ─┘
```

1. **0:00 - 0:45 | Tab 1: Advisory Intake & Gemma Interactive Customizer**
   - Select **Log4Shell (CVE-2021-44228)** or paste an arbitrary CVE blog advisory.
   - Click **"Ask Gemma"** to show instant on-device streaming answering exploit primitive questions.
   - Click **"Generate PoC with Gemma"** to synthesize the Python 3 verification script.
   - Use the natural language customizer (e.g. *"Bypass WAF with URL encoding"*) and click **"Apply to PoC Script"** to update in place.
   - Click **"Launch Autonomous Verification"**.

2. **0:45 - 2:00 | Tab 2: Isolated Docker Sandbox (Side-by-Side Terminals)**
   - Highlight the **Investigation Timeline** transitioning from Intake to Sandbox Execution.
   - Point out the **Side-by-Side Dual Container Terminals**:
     - *Left Pane*: `sandbox-attacker-node` (`172.20.0.2`) dispatching the payload.
     - *Right Pane*: `sandbox-victim-target` (`172.20.0.3:8080`) logging the JNDI lookup trigger.
   - Inspect the **Attack Graph** and empirical **Evidence Panel** (`Exit Code: 0`, HTTP 200 assertion).

3. **2:00 - 3:00 | Tab 3: Reports & Findings Hub**
   - Click into the generated report in the Master-Detail ledger.
   - Review executive CVSS scorecards, MITRE ATT&CK technique matrix, and remediation blueprints.
   - Click **"Export PDF"** to demonstrate instant client-side high-res PDF generation, and **"Export .MD"** for raw markdown export.

---

## 🛡️ Judge Defense & Technical FAQ

- **Q1: Why run local Gemma instead of cloud models like GPT-4 or Claude?**
  - *Answer*: Enterprise incident response deals with unpublished zero-days and proprietary code. Sending these to third-party cloud APIs creates compliance and security liabilities. Running Gemma 3 locally via Ollama ensures complete privacy and zero data leakage.
- **Q2: Why use a dual-container architecture rather than a single container?**
  - *Answer*: Single-container verification tests on `localhost` (127.0.0.1) often produce false positives because loopback interfaces bypass firewall rules, network namespaces, and binding restrictions. True dual-container isolation (`172.20.0.2` to `172.20.0.3`) proves genuine network exploitability.
- **Q3: How does the offline RAG operate without vector databases like Pinecone or Chroma?**
  - *Answer*: We pre-index 755 MITRE ATT&CK & ATLAS techniques in memory at application startup. Using inverted indices, token overlap, and Jaccard similarity, queries execute in sub-5ms with zero infrastructure overhead.
- **Q4: How do you prevent dangerous PoCs from escaping the sandbox?**
  - *Answer*: The sandbox runs in an isolated Docker bridge network with all external internet disabled, dropped raw socket capabilities (`CAP_NET_RAW`), read-only root filesystems where applicable, and deterministic timeouts.

---

## 📁 Presentation Deliverables Inventory

```text
presentation/
├── README.md           # This file — Compacted learnings, demo script, and system metrics
├── slides.md           # Complete Marp presentation deck (Google Visual Design styling)
├── demo_script.md      # Timed speaker script for 60s, 180s, and 5-min presentations
└── judge_faq.md        # Comprehensive technical defense and security assurance guide
```
