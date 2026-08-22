# AIsploitable — Backend Engine

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

## ⚙️ Configuration (`.env`)

| Variable | Default | Description |
| :--- | :--- | :--- |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama service endpoint |
| `DEFAULT_MODEL` | `gemma4:e2b` | Primary fast triage model (Google Gemma 4 E2B) |
| `FALLBACK_MODEL` | `gemma4:e4b` | High-reasoning fallback model (Google Gemma 4 E4B) |
| `CONTEXT_SIZE` | `8192` | Model context window (`num_ctx` in Ollama options for multi-turn triage) |
| `MAX_PREDICT` | `4096` | Maximum generation tokens per agent response |
| `PORT` | `8000` | FastAPI server listener port |
| `DEMO_MODE` | `false` | Fallback deterministic simulation when Docker or Ollama are unavailable |

---

## 🧠 Explainability & Verification Architecture

1. **Threat Intelligence Mapping (MITRE ATT&CK & ATLAS)**:
   - Evaluates extracted vulnerability primitives against 755 offline techniques (590 ATT&CK + 165 ATLAS).
   - Generates an explicit `why_retrieved` rationale for every matched technique, explaining the exact token, primitive, or CVE mapping context.
   - Embeds detection opportunities and concrete mitigation guidelines directly into both the live UI and the final Markdown report.

2. **3-Phase PoC Verification Standard**:
   - `step_1_recon()`: Service reachability check, HTTP banner probing, and port validation against the victim target (`172.20.0.3:8080`).
   - `step_2_exploit()`: Delivery of structured vulnerability vector over isolated Docker bridge network (`triage-sandbox-net`).
   - `step_3_verify_artifact()`: Empirical state assertion checking process UID, file creation (`/tmp/pwned.txt`), or HTTP response codes.

3. **Report Generation & Evidence Synthesis**:
   - The `ReporterAgent` integrates the verified Python script snippet and dual-container terminal logs (`sandbox-attacker-node` @ `172.20.0.2` and `sandbox-victim-target` @ `172.20.0.3:8080`).
   - Produces executive summaries, CVSS breakdowns, MITRE correlation tables, and concrete mitigation steps:
     - Immediate containment & version thresholds
     - Network & egress boundary hardening
     - Container least-privilege enforcement
     - Ready-to-deploy **SIGMA** rules and **Snort/Suricata** network signatures.

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
4. **AST Python Syntax & Guardrail Validation**: Running `ast.parse` and abstract syntax tree verification on generated PoC scripts immediately flags syntax errors and illegal subcommands before container execution.
5. **Deterministic Customization Fallbacks**: Supporting immediate modifications (e.g. `Print Hello`, `Identify Yourself`, `Bearer Tokens`, `WAF bypass`, `Base64`) both through Gemma prompt engineering and AST fallback transformers ensures high reliability.
6. **Configurable Model Context Windows**: Supporting `8192` to `16384` context windows in `ollama.py` allows full multi-turn advisory Q&A and multi-page technical report generation without truncation.

---

## ⚠️ What Was Tried & Failed (Lessons Learned)

1. **Missing `blog_text` in Request Models**:
   - *Problem*: `CustomizePocRequest` and `ScriptGenerateRequest` originally lacked `blog_text` fields in `backend/models/state.py`. As a result, the backend relied solely on short `vulnerability_summary` strings, losing rich advisory details.
   - *Fix*: Added `blog_text` and `cve_url` to both Pydantic request models and wired them directly into LLM prompts.
2. **Error Strings Masked as LLM Stream Chunks**:
   - *Problem*: When Ollama was offline or timed out, `stream_generate` in `ollama.py` yielded `[LLM Stream Error: ...]`. The generator agent mistook this error string as successful content (`has_content = True`), skipping the smart fallback harness.
   - *Fix*: Refactored `ollama.py` to log stream errors without emitting them as model tokens, allowing the agent to detect empty streams and engage the tailored fallback generator.
3. **Hardcoded Scenario Presets in Generator Agent**:
   - *Problem*: The script generator previously had hardcoded branches only for Log4Shell, XZ, and BlueKeep, failing to produce customized harnesses for arbitrary custom CVEs.
   - *Fix*: Replaced static branches with dynamic heuristic analysis that extracts CVE IDs, affected endpoints, ports, and exploit primitives from the raw user blog text.
4. **Vague Remediation Guidance in Generated Reports**:
   - *Problem*: Initial report templates produced generic advice like "apply patches and monitor logs", lacking actionable value for SOC teams.
   - *Fix*: Overhauled `reporter.txt` and `reporter.py` to mandate root-cause analysis, specific version thresholds, network egress rules, container least-privilege configs, and formal SIGMA/Snort signatures.

---

## 🔮 What to Do Next & Optimizations

1. **Dynamic Target Container Provisioning**: Implement dynamic `Dockerfile` generation based on extracted software versions (e.g. automatically pulling Apache `log4j:2.14.1` or `xz:5.6.0` images on demand).
2. **Automated Exploit-Fix Loop**: Introduce a Remediation Agent that modifies the victim container's configuration/code, re-runs the PoC script, and proves the vulnerability is resolved (Empirical Patch Verification).
3. **Multi-Agent Voting / Consensus**: Use a multi-agent debate between `gemma4:e2b` (fast triage) and `gemma4:e4b` (deep reasoning) to confirm exploitability confidence scores before sandbox launch.
4. **Structured JSON Validation with Pydantic Retries**: Implement auto-repairing JSON parsers for structured agent outputs to handle edge-case schema drift from smaller local LLMs.
5. **Context Window Scaling to 32k+ Tokens**: Support Gemma 4 long-context modes (up to 32k/128k) for multi-file codebases, entire firmware blobs, and kernel crash dump analyses.

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

