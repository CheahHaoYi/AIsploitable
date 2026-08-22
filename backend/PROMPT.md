# Agent Execution Prompt: Backend Subsystem (`backend/`)

> [!IMPORTANT]
> **MANDATORY AGENT PROTOCOL — UPFRONT AND CONTINUOUS REQUIREMENT**
> Before executing any task and throughout your session, you **MUST** maintain and update `README.md` in this directory (`backend/README.md`).
> You must clearly document:
> 1. **Your Main Goal**: What objective you are tackling right now.
> 2. **Your Current Progress**: What is currently working, complete, or blocked.
> 3. **What You Have Attempted**: A precise log of steps executed, code modified, endpoints tested, tests executed, errors encountered, and how they were resolved.
>
> *Never complete a turn without updating `README.md` to reflect your latest state.*

---

## 1. System Overview & Role

You are the autonomous **Backend Architect & Security Systems Engineer** for **CyberTriage AI** (AIsploitable).
Your responsibility is to implement the core FastAPI backend, LLM orchestration with Gemma (via Ollama/llama.cpp), local cybersecurity RAG, Docker sandbox lifecycle management, evidence collection, deterministic verification, report generation, and WebSocket event streaming.

Read the master specification at [PRD.md](file:///home/haoyi/projects/AIsploitable/PRD.md).

---

## 2. Architecture & Directory Structure

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
├── prompts/                  # LLM prompt templates
│   ├── analyzer.txt
│   ├── planner.txt
│   ├── verifier.txt
│   └── reporter.txt
├── rag/                      # Threat Intelligence RAG subsystem
│   ├── loader.py             # Loads ATT&CK & ATLAS data from data/
│   ├── retriever.py          # Hybrid retrieval (semantic/keyword + metadata filtering)
│   └── models.py
├── sandbox/                  # Docker PoC execution laboratory
│   ├── manager.py            # Container lifecycle, execution timeouts, stdout/stderr capture
│   ├── scenarios/            # Deterministic scenario definitions (attacker & victim setup)
│   └── docker-compose.yml    # Sandbox network & container isolation template
└── evidence/                 # Evidence handling
    ├── collector.py          # Parses container stdout/stderr/artifacts into EvidenceEvents
    └── verifier.py           # Deterministic assertion check (expected vs observed)
```

---

## 3. Implementation Workflow: Vertical Slices

Follow the strict vertical slice discipline outlined in PRD Section 19–31:

### Slice 0: Skeleton & Health
- Establish FastAPI app, basic CORS, and `/health` endpoint.
- Connect `LLMProvider` -> `OllamaProvider` (Gemma) and verify connectivity.

### Slice 1: Structured Vulnerability Analysis
- Implement Pydantic `Vulnerability` schema.
- Implement `analyzer.py` prompt & structured LLM JSON extraction.
- Expose `POST /api/analyze` or `POST /api/investigations`.

### Slice 2: Investigation State Machine & WebSocket Streaming
- Implement `InvestigationState` lifecycle:
  `INTAKE` -> `ANALYZE` -> `RETRIEVE` -> `PLAN` -> `SANDBOX` -> `EXECUTE` -> `VERIFY` -> `REPORT`.
- Implement WebSocket `/ws/{id}` broadcaster with typed event payloads:
  `STATUS`, `LOG`, `KNOWLEDGE`, `PLAN`, `CODE`, `TERMINAL`, `EVIDENCE`, `VERIFICATION`, `REPORT`, `ERROR`.
- **Constraint**: Never stream raw private LLM chain-of-thought; stream clean action-oriented events.

### Slice 3: Cybersecurity RAG (ATT&CK + ATLAS)
- Implement `rag/loader.py` to ingest normalized records from `../data/`.
- Implement `rag/retriever.py` with hybrid scoring (tag filtering + metadata matching + semantic search).
- Include `why_retrieved` explanation in retrieved items.

### Slice 4: Attack Hypothesis & Plan Generation
- Implement `AttackPlan` Pydantic model (objective, techniques, execution steps, expected verification condition).
- Implement Gemma planning prompt in `agents/planner.py`.

### Slice 5 & 6: Sandbox Isolation & Live Terminal Streaming
- Build `sandbox/manager.py` using Docker SDK.
- Isolate containers: dedicated non-host bridge network, dropped Linux capabilities, no host mounts, memory/CPU limits, 30s execution timeout.
- Stream container stdout/stderr chunks in real-time over WebSocket (`TERMINAL` events).

### Slice 7 & 8: Evidence Collection & Deterministic Verification
- Capture structured `EvidenceEvent` records (timestamp, container, action, exit code, stdout, stderr, artifact).
- Run deterministic rule verification (expected condition vs observed evidence) before LLM evaluation.

### Slice 9 & 10: Gemma Evidence Interpretation & Report Generation
- Gemma analyzes verified evidence and provides risk summary, confidence score, and remediation steps.
- `reporter.py` compiles the full executive/technical report into Markdown.

### Slice 11: Demo Mode & Fallback System
- Add `DEMO_MODE=true` support to replay pre-recorded execution traces if Docker or local LLM is unavailable during demonstrations.

---

## 4. Key Constraints & Rules

1. **Deterministic Demo Path**: The core demo path must succeed every time. Do not rely on unconstrained LLM code generation.
2. **Sandbox Safety**: Ephemeral containers only, no Docker socket mounts, no root privileges on host, auto-cleanup on complete/error.
3. **Pydantic Contracts**: All inter-module communication and API inputs/outputs must be strictly typed.
4. **Action-Oriented Logging**: Keep logs concise, timestamped, and stage-attributed.
5. **Continuous Documentation**: Update `backend/README.md` at every step!
