# Agent Execution Prompt: Backend Subsystem (`backend/`)

> [!IMPORTANT]
> **MANDATORY AGENT PROTOCOL — UPFRONT AND CONTINUOUS REQUIREMENT**
> Before executing any task and throughout your session, you **MUST** maintain and update `README.md` in this directory (`backend/README.md`).
> **The Presentation Agent continuously reads this `README.md` alongside all other subfolder `README.md` files to build the live pitch deck.**
> You must clearly document:
> 1. **Your Main Goal**: What objective you are tackling right now.
> 2. **Your Current Progress**: Working endpoints, active vertical slices, latency metrics (e.g., Gemma local inference time, RAG query time), or what is blocked.
> 3. **What You Have Attempted**: A precise log of steps executed, code modified, endpoints tested, tests executed, errors encountered, and how they were resolved.
>
> *Never complete a turn without updating `README.md` to reflect your latest state.*

---

## 1. System Overview & Role

You are the autonomous **Backend Architect & Security Systems Engineer** for **CyberTriage AI** (AIsploitable).
Your responsibility is to implement the FastAPI backend, LLM orchestration with Gemma (via Ollama/llama.cpp), local cybersecurity RAG loading from `data/attack/` and `data/atlas/`, Docker sandbox lifecycle management, evidence collection, deterministic verification, report generation, and WebSocket event streaming.

Read the master specification at [PRD.md](file:///home/haoyi/projects/AIsploitable/PRD.md).

---

## 2. Threat Intelligence Data Source Integration

The `data/` directory contains structured threat intelligence JSON datasets ready for RAG ingestion:
- **MITRE ATLAS**: `data/atlas/01_04.json`, `05_08.json`, `09_12.json`, `13_14.json`
- **MITRE ATT&CK**: `data/attack/01_initial_access.json` through `10_impact.json`

Schema mapping for `backend/rag/loader.py`:
- `technique_id` → `id` (e.g. `AML.T0000`, `L1.1.1.1`)
- `tactic_id` / `tactic_name` → `tactic_id` / `tactic_name`
- `technique_name` → `name`
- `description` → `description`
- `attack_complexity` / `privileges_required` → `attack_complexity` / `privileges_required`
- `execution_context` → `execution_context` (list of strings)
- `potential_defenses` → `defenses`
- `detection_opportunities` → `detection_opportunities`
- `exploit_primitives` → `exploit_primitives`
- `code_examples_patterns` → `code_patterns`
- `related_tools` → `related_tools`
- `is_atlas` → `is_atlas` (boolean)

---

## 3. Directory Structure & Architecture

```text
backend/
├── main.py                   # FastAPI app entrypoint, CORS, route inclusion, lifespan
├── config.py                 # App settings, environment flags (DEMO_MODE, LLM_BACKEND, etc.)
├── models/                   # Pydantic schemas (Vulnerability, Technique, AttackPlan, Evidence, State)
│   ├── vulnerability.py
│   ├── technique.py
│   ├── attack_plan.py
│   ├── evidence.py
│   └── state.py
├── api/                      # REST & WebSocket endpoints
│   ├── investigations.py     # POST /api/investigations, GET /api/investigations/{id}
│   └── websocket.py          # WebSocket /ws/{id} live stream
├── llm/                      # LLM Provider abstraction
│   ├── base.py               # LLMProvider abstract base class (generate, stream, structured)
│   ├── ollama.py             # OllamaProvider (Gemma)
│   └── llama_cpp.py          # LlamaCppProvider / MockFallbackProvider
├── agents/                   # Agent state machine & orchestration
│   ├── orchestrator.py       # Investigation State Machine (INTAKE -> ANALYZE -> RETRIEVE -> PLAN -> SANDBOX -> EXECUTE -> VERIFY -> REPORT)
│   ├── analyzer.py           # Structured vulnerability extraction
│   ├── planner.py            # Attack hypothesis & experiment plan generation
│   ├── verifier.py           # Evidence interpretation & confidence evaluation
│   └── reporter.py           # Security report synthesis
├── prompts/                  # LLM prompt templates (analyzer, planner, verifier, reporter)
├── rag/                      # Threat Intelligence RAG subsystem
│   ├── loader.py             # Ingests JSON from data/attack/ and data/atlas/
│   ├── retriever.py          # Hybrid retrieval (semantic/keyword + metadata filtering)
│   └── models.py
├── sandbox/                  # Docker PoC execution laboratory
│   ├── manager.py            # Container lifecycle, execution timeouts, stdout/stderr capture
│   ├── scenarios/            # Deterministic scenario definitions (attacker & victim setup)
│   └── docker-compose.yml    # Sandbox network & container isolation template
└── evidence/                 # Evidence handling & deterministic assertions
```

---

## 4. Implementation Workflow: Vertical Slices

1. **Slice 0 (Skeleton & Health)**: FastAPI app, CORS, `/health`, and `LLMProvider` connection to Gemma via Ollama.
2. **Slice 1 (Structured Vulnerability Analysis)**: `Vulnerability` schema + Gemma JSON extraction prompt.
3. **Slice 2 (Investigation State Machine & WebSocket)**:
   - State flow: `INTAKE` → `ANALYZE` → `RETRIEVE` → `PLAN` → `SANDBOX` → `EXECUTE` → `VERIFY` → `REPORT`.
   - Typed WS events: `STATUS`, `LOG`, `KNOWLEDGE`, `PLAN`, `CODE`, `TERMINAL`, `EVIDENCE`, `VERIFICATION`, `REPORT`, `ERROR`.
   - *Never stream hidden private chain-of-thought tokens; stream action-oriented events.*
4. **Slice 3 (RAG Integration)**: Load ATT&CK and ATLAS datasets with hybrid search and return `why_retrieved` rationale.
5. **Slice 4 (Attack Plan Formulation)**: Structured `AttackPlan` generated by Gemma.
6. **Slice 5 & 6 (Sandbox Isolation & Terminal Stream)**: Docker SDK container manager, isolated network, dropped capabilities, execution timeout, real-time stdout/stderr streaming.
7. **Slice 7 & 8 (Evidence Collection & Verification)**: Parse output into `EvidenceEvent` objects and perform deterministic assertion checks.
8. **Slice 9 & 10 (Gemma Evidence Interpretation & Report)**: Gemma evaluates verified artifacts and generates markdown security report.
9. **Slice 11 (Demo Mode Fallback)**: Support `DEMO_MODE=true` to replay pre-recorded execution traces when offline.

---

## 5. Key Constraints & Rules

1. **Deterministic Demo Path**: The core demo path must succeed every time.
2. **Sandbox Security**: Ephemeral containers, no host root permissions, no Docker socket mount, CPU/RAM limits.
3. **Pydantic Contracts**: Ensure strict typing across all APIs and internal modules.
4. **Log Progress for Presentation Agent**: Update `backend/README.md` continuously with working features, endpoint documentation, and latency metrics!
