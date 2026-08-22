# CyberTriage AI — Backend Engine

FastAPI backend orchestrating local Gemma models via Ollama, offline Threat Intelligence RAG (755 ATT&CK and ATLAS techniques), and isolated Docker dual-container sandboxing.

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
- `POST /api/scripts/generate/stream`: Stream PoC verification script synthesized by Gemma using `blog_text` and `cve_id`.
- `POST /api/poc/customize/stream`: Stream iterative script refinement and clarification using active script, user instructions, and blog context.
- `WS /ws/{id}`: Real-time WebSocket event broadcaster (`STATUS`, `LOG`, `VULNERABILITY`, `KNOWLEDGE`, `PLAN`, `SCRIPT`, `DOCKER_LOG`, `TERMINAL`, `EVIDENCE`, `VERIFICATION`, `REPORT`).

### 3. Docker Sandbox Status & Live Isolation Lab
- `GET /api/sandbox/status`: Check Docker daemon availability, version, and active container counts.

### 4. Reports & Findings Hub
- `GET /api/reports`: List all generated security triage reports.
- `GET /api/reports/{id}`: Fetch specific Markdown report and metadata.

---

## 🐳 Docker Container Sandbox Architecture

The backend sandbox engine ([`backend/sandbox/manager.py`](manager.py)) manages real, ephemeral dual-container environments:

- **Isolated Bridge Network**: `triage-sandbox-net` (`172.20.0.0/24`).
- **Victim Container**: `sandbox-victim-target` (`172.20.0.3:8080`), pre-configured with the vulnerable daemon / target endpoint.
- **Attacker Container**: `sandbox-attacker-node` (`172.20.0.2`), executing the synthesized Gemma Python PoC script.
- **Real-Time Stream Multiplexer**: Asynchronous subprocess stdout/stderr capture streamed over WebSockets (`DOCKER_LOG` & `TERMINAL` events).
- **Graceful Fallback**: If the Docker daemon is not running on the host, automatically falls back to an in-memory execution harness.

---

## 💡 What Worked

1. **Context-Enriched Agent Prompts**: Adding explicit `VULNERABILITY / ADVISORY CONTEXT (FROM USER INPUT)` to the prompt engineering in `generator.py` and `investigations.py` enabled Gemma to write targeted verification harnesses directly addressing the user's specific vulnerability text.
2. **Deterministic Dual-Node Network Isolation**: Spawning separate attacker (`172.20.0.2`) and victim (`172.20.0.3`) containers eliminates localhost loopback false positives and provides genuine network traffic traces.
3. **Sub-5ms In-Memory Threat Intel RAG**: Loading 590 MITRE ATT&CK and 165 MITRE ATLAS techniques into an in-memory inverted index allows instant sub-5ms semantic matching without third-party vector DB overhead.
4. **Resilient Streaming Fallbacks**: If Ollama or Docker daemon experiences a transient failure, the system falls back gracefully to deterministic analysis without crashing the WebSocket pipeline.

---

## ⚠️ What Was Tried & Failed (Lessons Learned)

1. **Missing `blog_text` in Request Models**:
   - *Problem*: `CustomizePocRequest` and `ScriptGenerateRequest` originally lacked `blog_text` fields in `backend/models/state.py`. As a result, the backend relied solely on short `vulnerability_summary` strings, losing all rich advisory details.
   - *Fix*: Added `blog_text` and `cve_url` to both Pydantic request models and wired them directly into LLM prompts.
2. **Error Strings Masked as LLM Stream Chunks**:
   - *Problem*: When Ollama was offline or timed out, `stream_generate` in `ollama.py` yielded `[LLM Stream Error: ...]`. The generator agent mistook this error string as successful content (`has_content = True`), skipping the smart fallback harness.
   - *Fix*: Refactored `ollama.py` to log stream errors without emitting them as model tokens, allowing the agent to detect empty streams and engage the tailored fallback generator.
3. **Hardcoded Scenario Presets in Generator Agent**:
   - *Problem*: The script generator previously had hardcoded branches only for Log4Shell, XZ, and BlueKeep, failing to produce customized harnesses for arbitrary custom CVEs.
   - *Fix*: Replaced static branches with dynamic heuristic analysis that extracts CVE IDs, affected endpoints, ports, and exploit primitives from the raw user blog text.

---

## 🔮 What to Do Next

1. **Dynamic Target Container Provisioning**: Implement dynamic `Dockerfile` generation based on extracted software versions (e.g. automatically pulling Apache `log4j:2.14.1` or `xz:5.6.0` images on demand).
2. **Automated Exploit-Fix Loop**: Introduce a Remediation Agent that modifies the victim container's configuration/code, re-runs the PoC script, and proves the vulnerability is resolved (Empirical Patch Verification).
3. **Multi-Agent Voting / Consensus**: Use a multi-agent debate between `gemma4:e2b` (fast triage) and `gemma4:e4b` (deep reasoning) to confirm exploitability confidence scores before sandbox launch.
4. **Structured JSON Validation with Pydantic Retries**: Implement auto-repairing JSON parsers for structured agent outputs to handle edge-case schema drift from smaller local LLMs.

---

## 🧪 Testing & Verification

```bash
# 1. Verify backend import & core dependencies
python3 -c "import backend.main; print('Backend loaded successfully!')"

# 2. Test Docker Sandbox creation & container lifecycle
python3 -m backend.sandbox.test_sandbox

# 3. Check active containers from terminal while running
docker ps --filter "name=sandbox-"

# 4. Start FastAPI server
python3 -m backend.main
```

