# AIsploitable — GitHub Pages Architecture & Migration Guide

> **Vision**: Transform AIsploitable from a local multi-process application into a **decentralized, static-first, zero-install Web application** hosted on GitHub Pages. Allow users to bring their own LLMs (Google Gemini, OpenAI, Anthropic, OpenRouter) or connect directly to local models (Ollama, LM Studio), while running threat intelligence RAG and agent orchestration directly inside the browser.

---

## 1. Executive Architecture Overview

### Current State (Localhost-Coupled)
- **Frontend**: Next.js App Router UI expecting a local Node.js server to proxy `/api/*`.
- **Backend**: FastAPI (Python 3.10+) handling RAG token matching, agent prompt synthesis, AST parsing, and Docker container lifecycle.
- **LLM**: Local Ollama instance hardcoded to `http://localhost:11434`.
- **Hosting Limitation**: Cannot run on GitHub Pages because GitHub Pages only serves static assets (HTML, CSS, JS) with no Python server or Docker daemon.

```text
[ User Browser ]
       │
       ▼ (REST / WebSocket)
[ FastAPI Backend Engine (Python :8000) ]
  ├── In-Memory Threat Intel RAG (755 JSON files)
  ├── Agent Orchestrator (Analyzer, Planner, Generator, Verifier, Reporter)
  ├── AST Python Syntax Validator
  └── Docker Dual-Sandbox Manager (Attacker: 172.20.0.2 vs Victim: 172.20.0.3)
       │
       ▼ (HTTP)
[ Local Ollama Service (:11434) ]
```

---

### Target State (Client-Side Orchestrated on GitHub Pages)
- **Hosting**: Pure static export (`output: 'export'`) served from GitHub Pages (or any CDN).
- **RAG Engine**: MITRE ATT&CK and ATLAS dataset bundled and indexed directly in browser memory (Web Worker / TypeScript inverted index).
- **Agent Orchestrator**: Pure TypeScript implementation of the 5-agent state machine running in the browser.
- **LLM Connectivity**: Unified Client Gateway supporting:
  1. **Google Gemini API** (Direct client `fetch` using `@google/genai` or REST)
  2. **OpenAI / Anthropic / OpenRouter / Groq** (Direct client `fetch` with streaming SSE)
  3. **Local Ollama / LM Studio** (Direct browser-to-localhost `fetch` with CORS enabled)
- **Sandbox Execution**:
  - *Default Web Mode*: Deterministic, high-fidelity client-side terminal simulation engine (with optional Pyodide WebAssembly for genuine in-browser Python AST verification & sandboxing).
  - *Advanced / Local Mode (Optional)*: Connects to a locally running companion daemon if available.

```text
                               ┌────────────────────────────────────────────────────────┐
                               │             GitHub Pages (Static Web Host)             │
                               │  - Next.js Static Export Bundle (HTML / CSS / JS)      │
                               │  - Static Threat Intel Datasets (ATT&CK + ATLAS JSON)  │
                               └───────────────────────────┬────────────────────────────┘
                                                           │ (Loaded into Browser RAM)
                                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                  Client Browser Runtime                                                │
│                                                                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                            Mission Control 3-Tab UI                                              │  │
│  │   Tab 1: Vuln Analysis & PoC  │  Tab 2: Sandbox Isolation Lab  │  Tab 3: Reports & Findings Hub (PDF/MD Export)   │  │
│  └─────────────────────────────────────────────────────────┬────────────────────────────────────────────────────────┘  │
│                                                            │                                                           │
│  ┌─────────────────────────────────────────────────────────▼────────────────────────────────────────────────────────┐  │
│  │                                  Client-Side TypeScript Agent Orchestrator                                       │  │
│  │   Analyzer Agent  ──►  Planner Agent  ──►  PoC Generator  ──►  Sandbox Verifier  ──►  Reporter Agent             │  │
│  └───────────────┬─────────────────────────────────────────┬───────────────────────────────────────┬────────────────┘  │
│                  │                                         │                                       │                   │
│                  ▼                                         ▼                                       ▼                   │
│   ┌─────────────────────────────┐           ┌─────────────────────────────┐         ┌─────────────────────────────┐    │
│   │     In-Browser RAG Store    │           │    Execution Simulator      │         │   Unified LLM Gateway       │    │
│   │   - 590 ATT&CK Techniques   │           │   - Dual-Terminal Streamer  │         │   - BYOK Key Vault          │    │
│   │   - 165 ATLAS Techniques    │           │   - Pyodide WASM Engine     │         │   - Streaming SSE Parser    │    │
│   │   - Sub-2ms In-Memory Index │           │   - Empirical Assertions    │         │   - Model Selector          │    │
│   └─────────────────────────────┘           └─────────────────────────────┘         └──────────────┬──────────────┘    │
└────────────────────────────────────────────────────────────────────────────────────────────────────┼───────────────────┘
                                                                                                     │
                                          ┌──────────────────────────────────────────────────────────┴────────┐
                                          ▼                                                                   ▼
                         ┌─────────────────────────────────┐                                 ┌─────────────────────────────────┐
                         │       Cloud LLM Providers       │                                 │      Local LLM Endpoints        │
                         │  - Google Gemini 2.5 Flash/Pro  │                                 │  - Ollama (http://127.0.0.1)    │
                         │  - OpenAI (GPT-4o, GPT-4o-mini) │                                 │  - LM Studio / vLLM / LocalAI   │
                         │  - Anthropic (Claude 3.5 Sonnet)│                                 │  - (Requires OLLAMA_ORIGINS="*")│
                         │  - OpenRouter / Groq / DeepSeek │                                 └─────────────────────────────────┘
                         └─────────────────────────────────┘
```

---

## 2. Core Architectural Pillars

### Pillar 1: Unified Client-Side LLM Gateway
Create a modular provider abstraction in `lib/llm/` that standardizes prompt execution and text streaming across all cloud and local model providers.

#### Supported Providers & Connection Protocols:
1. **Google Gemini**:
   - Direct HTTP POST to `https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent?key={API_KEY}&alt=sse`
   - Supports native Google Gemma hosted models and Gemini 2.5 Flash / Pro.
2. **OpenAI / OpenRouter / Groq / DeepSeek**:
   - Direct HTTP POST to standard `/v1/chat/completions` endpoints with `stream: true` using Server-Sent Events (SSE).
3. **Anthropic Claude**:
   - Direct HTTP POST to `https://api.anthropic.com/v1/messages` (with `anthropic-dangerous-direct-browser-access: true` header).
4. **Local Ollama / LM Studio**:
   - Direct HTTP POST to `http://127.0.0.1:11434/api/generate` or `http://127.0.0.1:1234/v1/chat/completions`.

#### Secure "Bring Your Own Key" (BYOK) Storage:
- Keys are saved in the user's browser `localStorage` or `sessionStorage`.
- Keys never leave the user's browser; requests are dispatched directly from the client to the respective provider's API.

---

### Pillar 2: In-Browser Threat Intelligence RAG Engine
Currently, `backend/rag/loader.py` loads 755 techniques into an in-memory inverted index.

#### Browser Porting Strategy:
1. **Dataset Static Bundling**:
   - Bundle all 590 MITRE ATT&CK and 165 MITRE ATLAS JSON techniques into `public/data/threat_intel.json` (compressed size ~380 KB).
2. **TypeScript Inverted Index**:
   - On initial app load, the browser fetches `threat_intel.json` and builds an inverted word index in JavaScript memory.
   - Keyword overlap, token frequency, and Jaccard similarity scoring execute in `<2ms` directly on the main thread or inside a dedicated Web Worker.
3. **Offline / Zero-Network Capable**:
   - Once the static page is loaded or cached by the browser Service Worker, the entire threat intel lookup functions 100% offline.

---

### Pillar 3: Client-Side Agent Orchestrator & Event Dispatcher
Currently, `backend/agents/orchestrator.py` coordinates the 5-agent pipeline and pushes updates over WebSockets.

#### Browser Porting Strategy:
1. **In-Memory Event Bus**:
   - Replace the WebSocket client/server layer with a lightweight browser event dispatcher (`EventEmitter` or RxJS-style subject).
   - Emits the exact same event protocol (`STATUS`, `LOG`, `KNOWLEDGE`, `PLAN`, `SCRIPT`, `DOCKER_LOG`, `EVIDENCE`, `REPORT`).
2. **Agent Porting**:
   - Port `analyzer.py`, `planner.py`, `generator.py`, `verifier.py`, and `reporter.py` prompt templates into TypeScript modules in `lib/agents/`.
   - Each agent calls the `LLMGateway` for streaming inference and uses the `ClientRAG` engine for contextual retrieval.

---

### Pillar 4: Dual-Container Sandbox Simulation & Pyodide Engine
In `backend/sandbox/manager.py`, `_execute_simulation()` produces realistic dual-node telemetry:
- `sandbox-attacker-node` (`172.20.0.2`): Script compilation, probe execution, assertion tracking.
- `sandbox-victim-target` (`172.20.0.3:8080`): Daemon initialization, request arrival, vulnerability trigger trace.

#### Browser Implementation:
1. **Deterministic Telemetry Streamer**:
   - Port the simulation timeline to TypeScript with realistic asynchronous pacing (`requestAnimationFrame` / `setTimeout`).
2. **Optional Pyodide (Python in WebAssembly)**:
   - Run a sandboxed Python runtime directly in the browser via Pyodide.
   - Allows genuine Python AST parsing, syntax validation, and safe local execution of recon assertions without external servers.

---

## 3. Handling Browser Security & CORS Limitations

When calling APIs directly from a GitHub Pages domain (`https://<username>.github.io`), the following browser security constraints apply:

| Connection Target | Potential Constraint | Solution |
| :--- | :--- | :--- |
| **Local Ollama** (`http://127.0.0.1:11434`) | CORS origin rejection | Run Ollama with `OLLAMA_ORIGINS="*"` (e.g. `OLLAMA_ORIGINS="*" ollama serve`). |
| **Local Ollama via HTTPS Page** | Mixed Content Warning (HTTPS calling HTTP) | Modern Chromium & Firefox permit `http://127.0.0.1` and `http://localhost` from HTTPS origins as private network targets. Alternatively, provide a toggle to use Web Crypto / HTTPS proxies. |
| **Google Gemini API** | None (Native CORS enabled) | Official Google Gemini REST API explicitly supports client-side browser CORS when authenticated via API Key. |
| **OpenAI / OpenRouter / Groq** | None / Provider Config | OpenRouter and Groq support browser requests directly. OpenAI supports direct API key calls. |
| **Anthropic Claude** | Browser header requirement | Include `anthropic-dangerous-direct-browser-access: true` header in client requests. |

---

## 4. GitHub Pages Static Build Configuration

### `next.config.js` Static Export Settings
```javascript
/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const repoName = 'AIsploitable';

const nextConfig = {
  output: 'export',
  basePath: isProd ? `/${repoName}` : '',
  assetPrefix: isProd ? `/${repoName}/` : '',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  reactStrictMode: true,
};

module.exports = nextConfig;
```

---

## 5. Automated CI/CD GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy AIsploitable to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: 'frontend/package-lock.json'

      - name: Prepare Static Threat Intel Data
        run: |
          mkdir -p frontend/public/data
          cp -r data/* frontend/public/data/

      - name: Install Frontend Dependencies
        working-directory: frontend
        run: npm ci

      - name: Build Next.js Static Export
        working-directory: frontend
        run: npm run build

      - name: Upload Pages Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: frontend/out

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 6. Implementation Roadmap

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Settings & BYOK LLM Gateway                                                   │
│   ├── Create SettingsModal.tsx (API Keys for Gemini, OpenAI, Claude, Ollama URL)       │
│   └── Implement lib/llm/ (GeminiClient, OpenAIClient, OllamaClient, UnifiedGateway)    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Phase 2: In-Browser Threat Intel RAG                                                   │
│   ├── Bundle data/attack and data/atlas into public/data/                              │
│   └── Implement lib/rag/ (ThreatIntelStore, InvertedIndex, HybridRetriever)            │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Phase 3: Client-Side Agent Orchestrator                                                │
│   ├── Port agents/ (analyzer, planner, generator, verifier, reporter) to TypeScript    │
│   └── Implement lib/orchestrator/ (EventEmitter, PipelineRunner, StateStore)           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Phase 4: In-Browser Sandbox Simulation & AST Validation                                │
│   ├── Port manager.py _execute_simulation() to lib/sandbox/simulator.ts                │
│   └── Add client-side AST validator / optional Pyodide WASM integration                │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Phase 5: Static Export & GitHub Pages Deployment                                       │
│   ├── Configure next.config.js for output: 'export'                                    │
│   └── Configure .github/workflows/deploy.yml for automated GitHub Pages publishing     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```
