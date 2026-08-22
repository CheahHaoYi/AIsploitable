# CyberTriage AI — Technical Judge Defense & FAQ

Comprehensive technical defense and architectural justification for hackathon judges.

---

### Q1: Why use local Gemma 3 instead of cloud frontier models like GPT-4 or Claude 3.5 Sonnet?
**Answer:**
1. **Privacy & Air-Gapped Security:** Incident responders and red teams routinely handle proprietary source code, internal system architectures, and unpatched zero-day vulnerabilities. Sending these payloads to external cloud LLMs violates strict data privacy (GDPR, HIPAA, SOC 2) and presents severe supply-chain data leak risks.
2. **Speed & Zero Rate-Limits:** Local Gemma (`gemma4:e2b` / `gemma4:e4b`) runs entirely on local GPUs/CPUs via Ollama with zero network egress, zero API token cost, and sub-100ms first-token latency.
3. **Determinism & Control:** Local deployment allows custom temperature tuning, structured system prompt templating, and prompt context chaining without third-party model deprecation or silent updates.

---

### Q2: Why is the dual-container architecture necessary instead of running everything in a single Docker container?
**Answer:**
1. **Eliminating Localhost Loopback False Positives:** In single-container environments, PoC scripts communicate over `127.0.0.1`. Localhost loopbacks automatically bypass firewall routing rules, ingress filters, network address translation (NAT), and binding interface constraints (`0.0.0.0` vs `127.0.0.1`).
2. **Real Network Separation:** Dual containers simulate real adversarial conditions across a dedicated bridge (`172.20.0.0/24`), routing traffic from `sandbox-attacker-node` (`172.20.0.2`) to `sandbox-victim-target` (`172.20.0.3:8080`).
3. **Privilege Dropping & Safety:** The attacker node has dropped `CAP_NET_RAW` privileges to prevent raw packet sniffing or host breakout, while the victim node isolates vulnerable daemons from host resources.

---

### Q3: How does the Threat Intelligence RAG work without an external vector database?
**Answer:**
1. **755 Pre-Indexed MITRE Techniques:** We pre-structured 590 Enterprise ATT&CK techniques and 165 ATLAS AI security techniques in normalized JSON files (`data/attack/` and `data/atlas/`).
2. **In-Memory Inverted Index:** At FastAPI startup (`backend/rag/loader.py`), all technique descriptions, tactics, and mitigation IDs are indexed into memory in under 500ms.
3. **Hybrid Keyword & Jaccard Retrieval:** Queries are resolved in sub-5ms by computing token intersection, tactical tag weighting, and Jaccard similarity, eliminating the memory and compute overhead of heavyweight vector databases like ChromaDB or Pinecone.

---

### Q4: How do you prevent hallucinated or dangerous PoC code from harming the host?
**Answer:**
1. **Strict Container Sandboxing:** All script execution occurs inside an ephemeral Docker container with read-only root mounts (where feasible), non-root execution, strict memory/CPU limits, and a hard execution timeout (default 30 seconds).
2. **Pre-Flight Syntax Validation:** The backend parser checks that synthesized code conforms to safe Python 3 syntax before invoking subprocesses.
3. **Fallback Deterministic Harnesses:** If LLM streaming is interrupted or Ollama is unavailable, the system safely falls back to pre-verified golden-path validation harnesses for known CVE classes.

---

### Q5: How do you handle non-preset, arbitrary CVE writeups and blogs?
**Answer:**
1. **Dynamic Heuristic & LLM Extraction:** When a user pastes a custom advisory, the Analyzer Agent extracts the target service name, default port, HTTP endpoints, parameter names, and exploit primitives from the raw text.
2. **Context Injection:** This extracted context is explicitly passed to the PoC Generator Agent (`/api/scripts/generate/stream`), instructing Gemma to tailor the harness to the specific payload format described in the blog.
3. **Iterative Refinement:** The user can refine the generated script through natural-language prompts in the *Ask Gemma PoC Customizer* before triggering container execution.
