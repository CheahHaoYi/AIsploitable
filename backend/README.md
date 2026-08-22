# Backend Subsystem: CyberTriage AI (AIsploitable)

## 1. Main Goal
Build an autonomous FastAPI backend orchestration engine integrated with local Ollama (`gemma4:e2b` default, model selector support), MITRE ATT&CK and ATLAS threat intelligence RAG loaders, deterministic sandbox execution streaming, and live WebSocket telemetry.

## 2. Current Progress
- **Health Endpoint**: `GET /health` responding with service status and model configuration.
- **Model Discovery**: `GET /api/models` queries local Ollama tags API (detecting `gemma4:e2b` and `gemma4:e4b`).
- **Prompt & Investigation Routing**:
  - `POST /api/investigations`: Full autonomous investigation workflow.
  - `POST /api/prompt` & `POST /api/prompt/stream`: Fast direct prompt routing to Ollama server.
- **WebSocket Event Engine**: `/ws/{id}` broadcasting typed events (`STATUS`, `LOG`, `VULNERABILITY`, `KNOWLEDGE`, `PLAN`, `TERMINAL`, `EVIDENCE`, `VERIFICATION`, `REPORT`, `ERROR`).
- **Threat Intelligence RAG**: Pre-loaded ATT&CK (10 tactic files) and ATLAS (4 files) with hybrid scoring and rationale generation (`why_retrieved`).
- **Sandbox Lifecycle**: Simulated sandbox manager capturing stdout/stderr and producing verified evidence telemetry.

## 3. Execution & Testing Log
1. Installed FastAPI, Uvicorn, WebSockets, HTTPX, and Pydantic dependencies.
2. Implemented configuration module (`backend/config.py`) pointing to local Ollama on port 11434.
3. Created Pydantic domain models:
   - `backend/models/vulnerability.py`
   - `backend/models/technique.py`
   - `backend/models/attack_plan.py`
   - `backend/models/evidence.py`
   - `backend/models/state.py`
4. Created threat intel loader and retriever (`backend/rag/loader.py`, `backend/rag/retriever.py`) ingesting `data/attack/` and `data/atlas/`.
5. Created Ollama LLM provider (`backend/llm/ollama.py`) supporting structured JSON generation and streaming.
6. Created specialized agents (`analyzer.py`, `planner.py`, `verifier.py`, `reporter.py`) and orchestrator state machine (`orchestrator.py`).
7. Created REST endpoints & WebSocket live stream dispatcher (`backend/api/`).
8. Validated backend module compilation with zero errors.
