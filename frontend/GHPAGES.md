# Frontend Instructions & Implementation Prompt — GitHub Pages & Multi-LLM Migration

> **Target Goal**: Transform the Next.js frontend of AIsploitable into a standalone, client-side application deployable to GitHub Pages with **Bring Your Own Key (BYOK)** support for Google Gemini, OpenAI, Anthropic, OpenRouter, and local Ollama/LM Studio models.

---

## 🎯 Developer Prompt & System Instructions

When implementing this migration in the `frontend/` directory, follow the instructions and architecture below.

```markdown
You are refactoring AIsploitable's Next.js 15 frontend into a fully decentralized, static-first web application.
All backend functionality (Threat Intel RAG, Agent Orchestration, Sandbox Simulation, and AST Validation)
is moving into TypeScript running directly in the user's browser, connected to user-supplied LLMs.
```

---

## 📁 Proposed Frontend Directory Structure Additions

```text
frontend/
├── app/
│   ├── layout.tsx
│   └── page.tsx                     # Updated to use Client Orchestrator
├── components/
│   ├── SettingsModal.tsx            # [NEW] BYOK API Keys & Model Endpoint configuration
│   ├── Header.tsx                   # Updated to add Settings gear button & Provider status
│   ├── VulnerabilityAnalysisTab.tsx # Unchanged UI, wired to client-side agent methods
│   ├── DockerSandboxTab.tsx         # Unchanged UI, wired to in-browser simulation events
│   └── ReportsTab.tsx               # Unchanged UI, loads and stores reports in IndexedDB/localStorage
├── lib/
│   ├── api.ts                       # Refactored: Routes to client orchestrator instead of localhost:8000
│   ├── types.ts                     # Extended with LLMProviderConfig and KeyVault types
│   ├── websocket.ts                 # Deprecated / Replaced by EventEmitter in lib/orchestrator/
│   ├── llm/                         # [NEW] Unified Client-Side LLM Gateway
│   │   ├── types.ts                 # Standard LLM request/response & stream interfaces
│   │   ├── gemini.ts                # Direct client Google Gemini (Gemini 2.5, Gemma) streaming
│   │   ├── openai.ts                # Direct client OpenAI / OpenRouter / Groq SSE streaming
│   │   ├── anthropic.ts             # Direct client Claude 3.5 streaming
│   │   ├── ollama.ts                # Local Ollama / LM Studio client fetch streaming
│   │   └── gateway.ts               # Unified router & fallback manager
│   ├── rag/                         # [NEW] In-Browser Threat Intel Engine
│   │   ├── indexer.ts               # In-memory inverted index & Jaccard similarity scorer
│   │   └── retriever.ts             # Hybrid BM25/keyword matcher for 755 ATT&CK + ATLAS techs
│   ├── agents/                      # [NEW] Client-Side Gemma / LLM Agent Pipeline
│   │   ├── prompts.ts               # System prompt templates ported from backend/prompts/
│   │   ├── analyzer.ts              # CVE & CVSS entity extraction agent
│   │   ├── planner.ts               # Attack hypothesis & step planner agent
│   │   ├── generator.ts             # Deterministic Python PoC synthesizer agent
│   │   ├── verifier.ts              # Evidence analyzer & verdict assertion agent
│   │   └── reporter.ts              # Markdown SOC report generator agent
│   ├── sandbox/                     # [NEW] Client-Side Sandbox Simulator
│   │   ├── simulator.ts             # Dual-terminal event streamer (Attacker + Victim)
│   │   └── astValidator.ts          # Pure TS/Regex/Pyodide AST syntax guardrails
│   └── storage/                     # [NEW] Persistence layer
│       ├── keyVault.ts              # Encrypted/Safe localStorage API key storage
│       └── reportStore.ts           # IndexedDB / localStorage report ledger
└── public/
    └── data/                        # Static threat intel JSON datasets
        ├── attack/
        └── atlas/
```

---

## 🛠️ Step-by-Step Implementation Guide

### Step 1: Create the BYOK Key Vault & Settings Modal (`components/SettingsModal.tsx`)

Users must be able to configure their preferred AI provider and enter API keys securely.

#### Supported Provider Configurations:
1. **Google Gemini (Recommended)**
   - API Key input (Link to Google AI Studio: `https://aistudio.google.com/`)
   - Model options: `gemini-2.5-flash` (fast triage), `gemini-2.5-pro` (deep reasoning), `gemma-2-9b-it`
2. **OpenAI / OpenRouter / Groq / DeepSeek**
   - API Key input
   - Base URL input (e.g. `https://api.openai.com/v1`, `https://openrouter.ai/api/v1`, `https://api.groq.com/openai/v1`)
   - Model name input (e.g. `gpt-4o`, `deepseek-chat`, `llama-3.3-70b`)
3. **Anthropic**
   - API Key input
   - Model options: `claude-3-5-sonnet-20241022`, `claude-3-5-haiku-20241022`
4. **Local Ollama / LM Studio**
   - Host URL (default `http://127.0.0.1:11434` or `http://127.0.0.1:1234`)
   - Model selection (e.g. `gemma4:e2b`, `gemma2:9b`, `qwen2.5-coder`)
   - Instructions for CORS (`OLLAMA_ORIGINS="*" ollama serve`)

```typescript
// lib/storage/keyVault.ts
export interface ProviderSettings {
  activeProvider: 'gemini' | 'openai' | 'anthropic' | 'ollama';
  geminiKey?: string;
  geminiModel: string;
  openaiKey?: string;
  openaiBaseUrl?: string;
  openaiModel: string;
  anthropicKey?: string;
  anthropicModel: string;
  ollamaUrl: string;
  ollamaModel: string;
}

export function loadSettings(): ProviderSettings {
  if (typeof window === 'undefined') return defaultSettings;
  const stored = localStorage.getItem('aisploitable_settings');
  return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
}

export function saveSettings(settings: ProviderSettings) {
  localStorage.setItem('aisploitable_settings', JSON.stringify(settings));
}
```

---

### Step 2: Implement Unified LLM Streaming Gateway (`lib/llm/`)

Implement direct client streaming with SSE (Server-Sent Events) for each provider.

#### Example: Google Gemini Streamer (`lib/llm/gemini.ts`)
```typescript
export async function streamGemini(
  prompt: string,
  systemPrompt: string | undefined,
  apiKey: string,
  model: string,
  onChunk: (chunk: string) => void
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`;
  
  const contents = [
    ...(systemPrompt ? [{ role: 'user', parts: [{ text: `SYSTEM INSTRUCTION: ${systemPrompt}` }] }, { role: 'model', parts: [{ text: 'Understood.' }] }] : []),
    { role: 'user', parts: [{ text: prompt }] }
  ];

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents }),
  });

  if (!res.ok) throw new Error(`Gemini API Error: ${res.statusText}`);

  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const json = JSON.parse(line.slice(6));
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (text) {
            fullText += text;
            onChunk(text);
          }
        } catch {}
      }
    }
  }
  return fullText;
}
```

---

### Step 3: Implement In-Browser Threat Intel RAG (`lib/rag/retriever.ts`)

Port [`backend/rag/retriever.py`](file:///home/haoyi/projects/AIsploitable/backend/rag/retriever.py) into TypeScript.

1. Fetch `/data/threat_intel.json` (or individual tactic JSONs from `public/data/`).
2. Build an inverted index `Map<string, Set<string>>` of keywords to technique IDs.
3. Compute Jaccard token overlap between user advisory text and techniques.
4. Return top-K matched ATT&CK and ATLAS techniques with formatted `why_retrieved` justifications.

```typescript
export interface ThreatTechnique {
  id: string;
  name: string;
  framework: 'ATT&CK' | 'ATLAS';
  tactic: string;
  description: string;
  mitigation?: string;
  detection?: string;
  score?: number;
  why_retrieved?: string;
}

export class InBrowserRetriever {
  private techniques: ThreatTechnique[] = [];
  private index = new Map<string, string[]>();

  async initialize(baseUrl = '') {
    const res = await fetch(`${baseUrl}/data/threat_intel.json`);
    this.techniques = await res.json();
    this.buildIndex();
  }

  search(query: string, topK = 5): ThreatTechnique[] {
    const tokens = query.toLowerCase().match(/\b[a-z0-9_-]{3,}\b/g) || [];
    // Compute term overlap and Jaccard scoring
    return this.techniques
      .map(tech => ({ ...tech, score: this.calculateScore(tokens, tech) }))
      .filter(tech => (tech.score || 0) > 0.1)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, topK);
  }
}
```

---

### Step 4: Implement Client-Side Agent Pipeline (`lib/agents/`)

Port the 5 agents from Python to TypeScript:
1. `analyzer.ts`: Extracts CVE ID, CVSS score, vector, and summary from the advisory text.
2. `planner.ts`: Formulates an attack hypothesis and 3-stage plan mapped to retrieved MITRE techniques.
3. `generator.ts`: Synthesizes safe, isolated Python PoC script.
4. `verifier.ts`: Analyzes stdout/stderr from the sandbox simulator and assigns a confirmed or refuted verdict.
5. `reporter.ts`: Synthesizes executive Markdown triage report with CVSS breakdown, MITRE matrices, and SIGMA/Snort rules.

---

### Step 5: Replace WebSocket with In-Browser Event Dispatcher

Replace `InvestigationWebSocket` in [`frontend/lib/websocket.ts`](file:///home/haoyi/projects/AIsploitable/frontend/lib/websocket.ts) with an in-memory subscription model:

```typescript
export type EventCallback = (eventType: string, data: any) => void;

export class ClientInvestigationOrchestrator {
  private listeners: EventCallback[] = [];

  public subscribe(cb: EventCallback) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private emit(eventType: string, data: any) {
    this.listeners.forEach(cb => cb(eventType, data));
  }

  public async runInvestigation(params: {
    inputText: string;
    sourceUrl?: string;
    customVuln?: Vulnerability;
    customScript?: string;
  }) {
    this.emit('STATUS', { stage: 'INTAKE', progress: 10 });
    // Run Analyzer -> RAG -> Planner -> Generator -> Sandbox Sim -> Verifier -> Reporter
  }
}
```

---

### Step 6: Static Export Build Configuration (`next.config.js`)

Ensure `next.config.js` is configured for static export:

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

## 🔍 Validation & Testing Checklist

- [ ] **Static Build**: Running `npm run build` inside `frontend/` succeeds and outputs static HTML files in `frontend/out/`.
- [ ] **No Server APIs**: All `/api/*` backend dependencies in `lib/api.ts` replaced with local client orchestrator calls.
- [ ] **BYOK Settings**: User can enter a Google Gemini API Key and successfully stream PoC script generation.
- [ ] **Local Ollama**: User with `OLLAMA_ORIGINS="*"` can run investigations against their local `gemma4:e2b`.
- [ ] **RAG Execution**: Threat intel technique matching runs in `<5ms` in the browser without server requests.
- [ ] **Reports Export**: Markdown reports and PDF export work completely client-side in the browser.
