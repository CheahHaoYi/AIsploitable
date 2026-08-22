---
marp: true
theme: default
paginate: true
header: "CyberTriage AI — Evidence-Driven Security Investigation"
footer: "Powered by Gemma 3 & MITRE ATT&CK / ATLAS"
style: |
  @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Roboto+Mono:wght@400;500;700&family=Roboto:wght@300;400;500;700&display=swap');

  :root {
    --google-blue: #1a73e8;
    --google-blue-bg: #e8f0fe;
    --google-red: #d93025;
    --google-red-bg: #fce8e6;
    --google-yellow: #f9ab00;
    --google-yellow-bg: #fef7e0;
    --google-green: #1e8e3e;
    --google-green-bg: #e6f4ea;
    --google-white: #ffffff;
    --google-surface: #f8f9fa;
    --google-card: #ffffff;
    --google-border: #dadce0;
    --google-text: #202124;
    --google-subtext: #5f6368;
    --font-primary: 'Google Sans', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-mono: 'Roboto Mono', monospace;
  }

  section {
    background-color: var(--google-white);
    color: var(--google-text);
    font-family: var(--font-primary);
    font-size: 19px;
    line-height: 1.6;
    padding: 44px 52px;
    box-sizing: border-box;
    border-top: 5px solid var(--google-blue);
    position: relative;
  }

  /* Header & Footer */
  header {
    font-family: var(--font-primary);
    font-size: 12px;
    font-weight: 500;
    color: var(--google-subtext);
    letter-spacing: 0.5px;
    text-transform: uppercase;
    top: 18px;
    left: 52px;
  }

  footer {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--google-subtext);
    bottom: 18px;
    right: 52px;
  }

  /* Typography */
  h1, h2, h3, h4 {
    font-family: var(--font-primary);
    letter-spacing: -0.3px;
    margin: 0;
    font-weight: 700;
  }

  h1 {
    font-size: 44px;
    line-height: 1.2;
    color: var(--google-text);
  }

  h2 {
    font-size: 30px;
    color: var(--google-blue);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1.5px solid var(--google-border);
    padding-bottom: 10px;
  }

  h3 {
    font-size: 20px;
    color: var(--google-text);
    margin-top: 8px;
    margin-bottom: 6px;
  }

  p {
    margin: 0 0 12px 0;
    color: var(--google-text);
  }

  /* Lead / Title Slide */
  section.lead {
    background: linear-gradient(135deg, #ffffff 0%, #f1f3f4 100%);
    border-top: 6px solid var(--google-blue);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
  }

  section.lead h1 {
    font-size: 48px;
    color: #1a73e8;
    margin-bottom: 12px;
  }

  section.lead .tagline {
    font-size: 22px;
    color: var(--google-subtext);
    font-weight: 400;
    margin-bottom: 24px;
    line-height: 1.4;
  }

  /* Badges */
  .badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 14px;
    font-size: 12px;
    font-weight: 600;
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .badge-blue { background: var(--google-blue-bg); color: var(--google-blue); border: 1px solid rgba(26, 115, 232, 0.3); }
  .badge-green { background: var(--google-green-bg); color: var(--google-green); border: 1px solid rgba(30, 142, 62, 0.3); }
  .badge-red { background: var(--google-red-bg); color: var(--google-red); border: 1px solid rgba(217, 48, 37, 0.3); }
  .badge-yellow { background: var(--google-yellow-bg); color: #b06000; border: 1px solid rgba(249, 171, 0, 0.4); }

  /* Grids */
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; width: 100%; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; width: 100%; }
  .grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; width: 100%; }

  /* Cards */
  .card {
    background-color: var(--google-surface);
    border: 1px solid var(--google-border);
    border-radius: 10px;
    padding: 16px;
    box-sizing: border-box;
  }

  .card-highlight {
    border-color: rgba(26, 115, 232, 0.4);
    background: var(--google-blue-bg);
  }

  .stat-val {
    font-size: 34px;
    font-weight: 700;
    color: var(--google-blue);
    font-family: var(--font-primary);
    line-height: 1.1;
  }

  .stat-label {
    font-size: 13px;
    color: var(--google-subtext);
    margin-top: 4px;
    font-weight: 500;
  }

  /* Lists */
  ul {
    margin: 6px 0 12px 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 6px;
    color: var(--google-text);
    font-size: 17px;
  }

  li strong {
    color: #1a73e8;
  }

  /* Mermaid & Pre */
  pre {
    background-color: #f8f9fa;
    border: 1px solid var(--google-border);
    border-radius: 8px;
    padding: 12px;
    font-family: var(--font-mono);
    font-size: 13px;
    line-height: 1.4;
    color: var(--google-text);
  }

  code {
    font-family: var(--font-mono);
    background-color: #f1f3f4;
    color: var(--google-blue);
    padding: 2px 5px;
    border-radius: 4px;
    font-size: 0.9em;
  }
---

<!-- _class: lead -->

<span class="badge badge-blue">Autonomous AI Security Platform</span>

# CyberTriage AI
### Evidence-Driven Vulnerability Investigation

<div class="tagline">
Turning threat intelligence into reproducible security proof using local Gemma 3 reasoning, offline MITRE RAG, and isolated Docker sandboxes.
</div>

<div style="display: flex; gap: 10px;">
  <span class="badge badge-green">100% Local Gemma 3</span>
  <span class="badge badge-yellow">755 Threat RAG Items</span>
  <span class="badge badge-blue">Dual-Node Docker Sandbox</span>
</div>

---

## 📑 Agenda

<div class="grid-4" style="margin-top: 20px;">
  <div class="card card-highlight">
    <div class="stat-val" style="color: var(--google-blue);">01</div>
    <h3>What It Is</h3>
    <p style="font-size: 14px; color: var(--google-subtext);">
      Autonomous triage engine with local Gemma multi-agent reasoning.
    </p>
  </div>

  <div class="card">
    <div class="stat-val" style="color: var(--google-red);">02</div>
    <h3>Why It Matters</h3>
    <p style="font-size: 14px; color: var(--google-subtext);">
      Solving triage alert fatigue, cloud leaks, and AI hallucinations.
    </p>
  </div>

  <div class="card">
    <div class="stat-val" style="color: var(--google-yellow);">03</div>
    <h3>How To Use It</h3>
    <p style="font-size: 14px; color: var(--google-subtext);">
      3-Tab Mission Control: Intake, Dual Sandbox, and Findings Hub.
    </p>
  </div>

  <div class="card">
    <div class="stat-val" style="color: var(--google-green);">04</div>
    <h3>The Impact</h3>
    <p style="font-size: 14px; color: var(--google-subtext);">
      &lt;15s triage latency, 100% data privacy, and verifiable proof.
    </p>
  </div>
</div>

---

<!-- SECTION 1: WHAT THE PRODUCT IS -->

## 01. What Is CyberTriage AI?

<div class="grid-2">
  <div class="card">
    <h3>🛡️ Autonomous Security Triage Engine</h3>
    <ul>
      <li><strong>Intake:</strong> Ingests CVE IDs, advisories, and blog posts.</li>
      <li><strong>Local Reasoning:</strong> <code>gemma4:e2b</code> / <code>e4b</code> orchestrates analysis and planning.</li>
      <li><strong>Empirical Proof:</strong> Runs controlled PoC tests in isolated sandboxes.</li>
    </ul>
  </div>

  <div class="card card-highlight">
    <h3>🧩 3 Foundation Pillars</h3>
    <ul>
      <li><strong>Privacy-First AI:</strong> 100% on-device Gemma via Ollama.</li>
      <li><strong>Offline Cyber RAG:</strong> 755 ATT&CK & ATLAS techniques (&lt;5ms).</li>
      <li><strong>Isolated Sandbox:</strong> Dual-node bridge (<code>172.20.0.2</code> ➔ <code>.3</code>).</li>
    </ul>
  </div>
</div>

---

## 01. How The Product Works (Architecture)

```mermaid
graph LR
    A[📄 Advisory / CVE Intake] --> B[🧠 Local Gemma 3 Agents]
    B <--> C[📚 Offline Threat RAG<br/>755 ATT&CK + ATLAS]
    B --> D[⚡ PoC Script Synthesis]
    D --> E[🐳 Dual Docker Sandbox<br/>172.20.0.2 ➔ 172.20.0.3]
    E --> F[📊 Empirical Evidence<br/>Exit Code 0 + Artifacts]
    F --> G[📋 Executive SOC Report<br/>PDF / Markdown]
```

<div class="grid-3" style="margin-top: 16px;">
  <div class="card"><strong>Analyzer & Planner</strong><br><span style="font-size: 14px; color: var(--google-subtext);">Extracts primitives & formulates hypothesis.</span></div>
  <div class="card"><strong>Script Generator</strong><br><span style="font-size: 14px; color: var(--google-subtext);">Synthesizes tailored Python PoC harness.</span></div>
  <div class="card"><strong>Verifier & Reporter</strong><br><span style="font-size: 14px; color: var(--google-subtext);">Validates evidence and compiles SOC report.</span></div>
</div>

---

<!-- SECTION 2: WHY IT IS IMPORTANT -->

## 02. Why It Matters: The Triage Crisis

<div class="grid-2">
  <div class="card" style="border-left: 4px solid var(--google-red);">
    <h3 style="color: var(--google-red);">⚠️ Industry Pain Points</h3>
    <ul>
      <li><strong>Alert Fatigue:</strong> 50+ CVEs daily; manual repro takes hours.</li>
      <li><strong>Cloud LLM Leaks:</strong> Sending zero-days to cloud APIs breaches policy.</li>
      <li><strong>Hallucinations:</strong> LLMs guess exploitability without testing.</li>
    </ul>
  </div>

  <div class="card" style="border-left: 4px solid var(--google-green);">
    <h3 style="color: var(--google-green);">✅ CyberTriage Solution</h3>
    <ul>
      <li><strong>Sub-15s Automation:</strong> Instant end-to-end triage pipeline.</li>
      <li><strong>Air-Gapped Privacy:</strong> Zero telemetry or data egress.</li>
      <li><strong>Evidence Over Assertion:</strong> Real exit codes and network proof.</li>
    </ul>
  </div>
</div>

---

## 02. Paradigm Shift: Evidence Over Assertion

<div class="grid-2" style="margin-top: 10px;">
  <div class="card">
    <h3>Conventional Security Tools</h3>
    <ul>
      <li>Static scanners match version strings blindly.</li>
      <li>LLM chatbots generate untested theoretical advice.</li>
      <li>High rate of false positives wasting analyst hours.</li>
    </ul>
  </div>

  <div class="card card-highlight">
    <h3>CyberTriage Verification Engine</h3>
    <ul>
      <li>Executes isolated PoC against live target daemons.</li>
      <li>Captures exact stdout/stderr and network response tokens.</li>
      <li>Delivers deterministic proof before raising critical alerts.</li>
    </ul>
  </div>
</div>

<div style="margin-top: 16px; text-align: center;">
  <span class="badge badge-green">Principle: Never declare a vulnerability without reproducible empirical evidence.</span>
</div>

---

<!-- SECTION 3: HOW TO USE IT -->

## 03. How To Use It: 3-Tab Mission Control

```mermaid
graph LR
    T1[Tab 1: Intake & Gemma Q&A<br/>- Advisory text & CVE presets<br/>- In-place PoC customizer] --> T2[Tab 2: Docker Sandbox<br/>- Dual terminals 172.20.0.2 vs .3<br/>- Live attack graph & timeline]
    T2 --> T3[Tab 3: Reports Hub<br/>- Master-detail ledger<br/>- 1-Click PDF & MD export]
```

<div class="grid-3" style="margin-top: 16px;">
  <div class="card card-highlight">
    <strong>1. Intake & Customize</strong>
    <p style="font-size: 13px; color: var(--google-subtext);">Query Gemma on exploit primitives and refine PoC script with natural language prompts.</p>
  </div>
  <div class="card">
    <strong>2. Observe Sandbox</strong>
    <p style="font-size: 13px; color: var(--google-subtext);">Watch live side-by-side terminal telemetry across attacker and victim containers.</p>
  </div>
  <div class="card">
    <strong>3. Export Findings</strong>
    <p style="font-size: 13px; color: var(--google-subtext);">Review executive TLP:AMBER summaries and download high-resolution PDF reports.</p>
  </div>
</div>

---

## 03. Tab 1 & 2: Hands-On Workflow

<div class="grid-2">
  <div class="card">
    <span class="badge badge-blue">Tab 1: PoC Workspace</span>
    <h3>Interactive Customization</h3>
    <ul>
      <li>Select preset or paste raw advisory text.</li>
      <li>Click <strong>"Generate PoC with Gemma"</strong>.</li>
      <li>Prompt customizer: <em>"Bypass WAF with URL encoding"</em>.</li>
      <li>Click <strong>"Apply to PoC Script"</strong> in place.</li>
    </ul>
  </div>

  <div class="card card-highlight">
    <span class="badge badge-green">Tab 2: Sandbox Execution</span>
    <h3>Dual-Container Observation</h3>
    <ul>
      <li><code>sandbox-attacker-node</code> (<code>172.20.0.2</code>).</li>
      <li><code>sandbox-victim-target</code> (<code>172.20.0.3:8080</code>).</li>
      <li>Investigation Stepper Timeline (8 stages).</li>
      <li>Evidence Inspector (Exit Code 0, HTTP 200).</li>
    </ul>
  </div>
</div>

---

## 03. Tab 3: Reports & Findings Hub

<div class="grid-2">
  <div class="card card-highlight">
    <h3>📊 Executive SOC Deliverables</h3>
    <ul>
      <li><strong>Standardized Classification:</strong> TLP:AMBER classification & CVSS 3.1 scorecard.</li>
      <li><strong>MITRE Matrix Mapping:</strong> Automatic linkage to ATT&CK & ATLAS techniques.</li>
      <li><strong>Actionable Remediation:</strong> Step-by-step mitigation code synthesized by Gemma.</li>
    </ul>
  </div>

  <div class="card">
    <h3>📄 Direct Publishing</h3>
    <ul>
      <li><strong>Client-Side PDF Export:</strong> Instant paginated A4 PDF generated via <code>jspdf</code>.</li>
      <li><strong>Raw Markdown Download:</strong> Ready for GitHub & Jira issue tracking.</li>
      <li><strong>Dual-Mode View:</strong> Toggle between executive UI and raw markdown.</li>
    </ul>
  </div>
</div>

---

<!-- SECTION 4: WHAT ARE THE IMPACT -->

## 04. What Is The Impact?

<div class="grid-4" style="margin-top: 14px;">
  <div class="card">
    <div class="stat-val">&lt; 15s</div>
    <div class="stat-label">End-to-End Triage</div>
    <p style="font-size: 13px; color: var(--google-subtext); margin-top: 6px;">From advisory to verified report.</p>
  </div>

  <div class="card card-highlight">
    <div class="stat-val" style="color: var(--google-green);">100%</div>
    <div class="stat-label">On-Device Privacy</div>
    <p style="font-size: 13px; color: var(--google-subtext); margin-top: 6px;">Zero data sent to cloud APIs.</p>
  </div>

  <div class="card">
    <div class="stat-val" style="color: var(--google-yellow);">755</div>
    <div class="stat-label">Threat Techniques</div>
    <p style="font-size: 13px; color: var(--google-subtext); margin-top: 6px;">590 ATT&CK + 165 ATLAS RAG.</p>
  </div>

  <div class="card">
    <div class="stat-val" style="color: var(--google-red);">0</div>
    <div class="stat-label">Loopback Errors</div>
    <p style="font-size: 13px; color: var(--google-subtext); margin-top: 6px;">Real dual-container bridge.</p>
  </div>
</div>

<div class="grid-2" style="margin-top: 16px;">
  <div class="card">
    <strong>Operational Efficiency</strong>
    <ul>
      <li>95% reduction in manual verification time.</li>
      <li>Eliminates manual lab setup and exploit debugging.</li>
    </ul>
  </div>
  <div class="card">
    <strong>Enterprise Compliance</strong>
    <ul>
      <li>Air-gapped SOC ready for sensitive zero-days.</li>
      <li>Integrates into CI/CD for automated patch verification.</li>
    </ul>
  </div>
</div>

---

## 04. Strategic Roadmap

<div class="grid-3">
  <div class="card">
    <span class="badge badge-blue">Phase 1 (Live Now)</span>
    <h3>Autonomous Verification</h3>
    <p style="font-size: 13px; color: var(--google-subtext); margin-top: 6px;">
      Local Gemma reasoning, 3-tab UI, offline threat RAG, and dual Docker sandbox.
    </p>
  </div>

  <div class="card card-highlight">
    <span class="badge badge-yellow">Phase 2</span>
    <h3>Automated Patch-Fix Loop</h3>
    <p style="font-size: 13px; color: var(--google-subtext); margin-top: 6px;">
      Remediation agent modifies victim container and re-tests PoC to prove fix.
    </p>
  </div>

  <div class="card">
    <span class="badge badge-green">Phase 3</span>
    <h3>Multi-Agent Debate & CI/CD</h3>
    <p style="font-size: 13px; color: var(--google-subtext); margin-top: 6px;">
      Consensus between <code>e2b</code> and <code>e4b</code> with native GitHub Actions webhooks.
    </p>
  </div>
</div>

<div style="margin-top: 20px; text-align: center; font-size: 16px; color: var(--google-subtext);">
  <strong>CyberTriage AI:</strong> Making cybersecurity triage empirical, fast, and privacy-preserving.
</div>

---

<!-- _class: lead -->

<span class="badge badge-green">Empirical Security Investigation</span>

# Thank You!
### Questions & Live Demonstration

<div class="grid-3" style="margin-top: 24px; width: 100%;">
  <div class="card" style="text-align: center;">
    <strong>Repository</strong>
    <p style="font-family: var(--font-mono); font-size: 13px; color: var(--google-blue); margin-top: 4px;">CheahHaoYi/AIsploitable</p>
  </div>
  <div class="card" style="text-align: center;">
    <strong>AI Core</strong>
    <p style="font-family: var(--font-mono); font-size: 13px; color: var(--google-green); margin-top: 4px;">Gemma 3 (Local via Ollama)</p>
  </div>
  <div class="card" style="text-align: center;">
    <strong>Stack</strong>
    <p style="font-family: var(--font-mono); font-size: 13px; color: var(--google-blue); margin-top: 4px;">Next.js 15 + FastAPI + Docker</p>
  </div>
</div>
