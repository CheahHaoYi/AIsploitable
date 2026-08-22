# CyberTriage AI — Backend Engine

FastAPI backend orchestrating local Gemma models, offline Threat Intelligence RAG, and isolated Docker dual-container sandboxing.

---

## 🏗️ Architecture Overview

```text
[ Client (Next.js / WebSocket / REST) ]
                  │
                  ▼
         [ FastAPI Router (main.py) ]
                  │
   ┌──────────────┼──────────────────────────────┐
   ▼              ▼                              ▼
[ /api/models ] [ /api/reports ]       [ /api/investigations & /api/ws ]
                        │                        │
                        │                        ▼
                        │          [ InvestigationOrchestrator ]
                        │                        │
                        │          ┌─────────────┴─────────────┐
                        │          ▼                           ▼
                        │   [ Gemma Agents ]          [ Threat Intel RAG ]
                        │   - Analyzer Agent          - 590 ATT&CK Techniques
                        │   - Planner Agent           - 165 ATLAS Techniques
                        │   - Script Generator        - Hybrid BM25/Jaccard
                        │   - Verifier Agent
                        │   - Reporter Agent
                        │          │
                        │          ▼
                        │   [ SandboxManager ]
                        │   - Attacker Container (172.20.0.2)
                        │   - Victim Container (172.20.0.3:8080)
                        │   - Dual-stream WebSocket broadcaster
                        ▼
                [ Reports Database ]
```

---

## 📡 API Endpoints

### 1. Model Discovery & Routing
- `GET /api/models`: List available Ollama models (`gemma4:e2b`, `gemma4:e4b`).
- `POST /api/prompt`: One-shot prompt routing to local Gemma.
- `POST /api/prompt/stream`: Chunked text streaming from local Gemma.
- `POST /api/blog/question/stream`: Interactive cybersecurity blog Q&A stream.

### 2. Autonomous Investigation & PoC Script Generation
- `POST /api/investigations`: Start background autonomous triage run.
- `GET /api/investigations/{id}`: Fetch investigation state snapshot.
- `POST /api/scripts/generate/stream`: Stream PoC verification script synthesized by Gemma.
- `WS /ws/{id}`: Real-time WebSocket event broadcaster (`STATUS`, `LOG`, `VULNERABILITY`, `KNOWLEDGE`, `PLAN`, `SCRIPT`, `DOCKER_LOG`, `TERMINAL`, `EVIDENCE`, `VERIFICATION`, `REPORT`).

### 3. Reports & Findings Hub
- `GET /api/reports`: List all generated security triage reports.
- `GET /api/reports/{id}`: Fetch specific Markdown report and metadata.

---

## 🧪 Testing

```bash
# Run backend import validation
python3 -c "import backend.main; print('Backend loaded successfully!')"

# Run FastAPI dev server
python3 -m backend.main
```
