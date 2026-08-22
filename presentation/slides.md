---
marp: true
theme: default
paginate: true
header: "CyberTriage AI (AIsploitable) • 1-Minute Pitch"
footer: "Google Gemma 4 • Offline MITRE RAG • Dual Docker Sandbox"
style: |
  @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;600;700&display=swap');

  :root {
    --bg-dark: #0f172a;
    --card-bg: #1e293b;
    --text-light: #f8fafc;
    --text-dim: #94a3b8;
    --accent-blue: #38bdf8;
    --accent-green: #4ade80;
    --accent-red: #f87171;
    --accent-amber: #fbbf24;
    --border: #334155;
  }

  section {
    background-color: var(--bg-dark);
    color: var(--text-light);
    font-family: 'Google Sans', -apple-system, sans-serif;
    font-size: 18px;
    line-height: 1.5;
    padding: 36px 48px;
    border-top: 4px solid var(--accent-blue);
  }

  h1, h2 {
    font-family: 'Google Sans', sans-serif;
    font-weight: 700;
    color: var(--accent-blue);
    margin-bottom: 12px;
  }

  h1 { font-size: 34px; line-height: 1.2; }
  h2 { font-size: 26px; border-bottom: 1px solid var(--border); padding-bottom: 6px; }

  header { font-size: 11px; color: var(--text-dim); top: 14px; left: 48px; }
  footer { font-size: 10px; color: var(--text-dim); bottom: 14px; right: 48px; font-family: 'JetBrains Mono', monospace; }

  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 10px;
  }

  .grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
    margin-top: 10px;
  }

  .card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px 16px;
  }

  .card h3 {
    margin: 0 0 4px 0;
    font-size: 16px;
    color: var(--accent-green);
  }

  pre {
    background: #020617;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 10px 14px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12.5px;
    line-height: 1.35;
    color: var(--accent-blue);
    margin: 8px 0;
  }

  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: bold;
    font-family: 'JetBrains Mono', monospace;
  }
  .badge-blue { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
  .badge-green { background: rgba(74, 222, 128, 0.15); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.3); }
  .badge-red { background: rgba(248, 113, 113, 0.15); color: #f87171; border: 1px solid rgba(248, 113, 113, 0.3); }
---

<!-- _class: lead -->
# 🛡️ CyberTriage AI (AIsploitable)
### Autonomous Threat Intelligence & Empirical Sandbox Verification

```text
[ Raw Security Advisory ] ➔ [ Local Gemma 4 + Offline MITRE RAG ] ➔ [ Dual Docker Sandbox ] ➔ [ Defense Report ]
```

<div class="grid-3" style="margin-top: 20px;">
  <div class="card">
    <h3>🔒 100% Local & Private</h3>
    <p style="font-size: 13px; margin: 0; color: var(--text-dim);">Gemma 4 via Ollama. Zero external API leaks for zero-day advisories.</p>
  </div>
  <div class="card">
    <h3>🧠 755 MITRE Techniques</h3>
    <p style="font-size: 13px; margin: 0; color: var(--text-dim);">Offline in-memory RAG: 590 ATT&CK + 165 ATLAS AI security vectors.</p>
  </div>
  <div class="card">
    <h3>🐳 True Dual Isolation</h3>
    <p style="font-size: 13px; margin: 0; color: var(--text-dim);">Attacker (172.20.0.2) vs Victim (172.20.0.3). No loopback false positives.</p>
  </div>
</div>

---

## ⚡ The Challenge vs. The Solution

<div class="grid-2">
  <div class="card" style="border-color: rgba(248, 113, 113, 0.4);">
    <h3 style="color: var(--accent-red);">❌ The Problem: Slow & Hallucinatory</h3>
    <ul style="font-size: 13.5px; padding-left: 18px; margin: 6px 0;">
      <li><strong>Manual Triage:</strong> 4–8 hours to analyze and reproduce CVEs.</li>
      <li><strong>Black-Box LLMs:</strong> Generic hallucinated MITRE mappings.</li>
      <li><strong>Loopback Flaws:</strong> Testing on <code>127.0.0.1</code> fails network reality.</li>
      <li><strong>Data Leakage:</strong> Sending exploits to public cloud models.</li>
    </ul>
  </div>

  <div class="card" style="border-color: rgba(74, 222, 128, 0.4);">
    <h3 style="color: var(--accent-green);">✅ CyberTriage AI: Empirical & Fast</h3>
    <ul style="font-size: 13.5px; padding-left: 18px; margin: 6px 0;">
      <li><strong>&lt; 15s Triage:</strong> Auto extraction, PoC synthesis & testbed.</li>
      <li><strong>Explainable RAG:</strong> Sub-5ms matching with <code>why_retrieved</code>.</li>
      <li><strong>Empirical Proof:</strong> Dual containers capture real network traffic.</li>
      <li><strong>Actionable Defense:</strong> Auto SIGMA rules & Snort signatures.</li>
    </ul>
  </div>
</div>

```text
  [ Raw Advisory ] ──▶ [ Gemma Triage ] ──▶ [ PoC Synthesis ] ──▶ [ Dual Sandbox ] ──▶ [ SIGMA & PDF Report ]
     (Advisory Text)       (Extract Primitives)    (AST Validated)        (172.20.0.2 ➔ .3)       (Remediation)
```

---

## 🏗️ 3-Tab Architecture & Execution Flow

```text
┌───────────────────────────────── 3-Tab Mission Control UI ─────────────────────────────────┐
│                                                                                            │
│  [ Tab 1: Vulnerability & PoC ]   [ Tab 2: Docker Sandbox ]    [ Tab 3: Reports & Hub ]    │
│  • Auto-clean intake on paste     • Side-by-side terminal logs • Executive CVSS scorecard  │
│  • 1-Click PoC Customization      • Attacker (172.20.0.2)      • MITRE ATT&CK & ATLAS      │
│  • Live AST Syntax Diagnostics    • Target (172.20.0.3:8080)   • SIGMA & Snort Rules       │
│  • Real-time Gemma Q&A streaming  • Interactive Attack Graph   • Direct PDF / .MD Export   │
│                                                                                            │
└──────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                               ▼
             ┌──────────────────────────────────────────────────────────────────┐
             │       FastAPI Orchestration + Gemma 4 Local Agent Swarm          │
             │   [ Analyzer ] ➔ [ Threat RAG ] ➔ [ PoC Gen ] ➔ [ Verifier ]     │
             └──────────────────────────────────────────────────────────────────┘
```

- **Clean Intake Workspace:** Auto-clears stale context when pasting new blog advisories.
- **1-Click PoC Modifiers:** `👋 Print Hello`, `🆔 Identify Operator`, `🛡️ Bearer Token`, `⚡ WAF Evasion`.

---

## 🔬 Empirical 3-Phase Verification Pipeline

<div class="grid-3">
  <div class="card">
    <span class="badge badge-blue">PHASE 1</span>
    <h3 style="margin-top: 6px;">1. Reconnaissance</h3>
    <p style="font-size: 13px; color: var(--text-dim); margin-bottom: 4px;"><code>step_1_recon()</code></p>
    <ul style="font-size: 12px; padding-left: 16px; margin: 0;">
      <li>HTTP banner probing</li>
      <li>Target port verification</li>
      <li>Network health checks</li>
    </ul>
  </div>
  <div class="card">
    <span class="badge badge-amber">PHASE 2</span>
    <h3 style="margin-top: 6px; color: var(--accent-amber);">2. Payload Delivery</h3>
    <p style="font-size: 13px; color: var(--text-dim); margin-bottom: 4px;"><code>step_2_exploit()</code></p>
    <ul style="font-size: 12px; padding-left: 16px; margin: 0;">
      <li>Isolated bridge exploit</li>
      <li>WAF / Base64 bypass</li>
      <li>Rate-limiting handling</li>
    </ul>
  </div>
  <div class="card">
    <span class="badge badge-green">PHASE 3</span>
    <h3 style="margin-top: 6px;">3. Assertion Check</h3>
    <p style="font-size: 13px; color: var(--text-dim); margin-bottom: 4px;"><code>step_3_verify()</code></p>
    <ul style="font-size: 12px; padding-left: 16px; margin: 0;">
      <li>Process UID verification</li>
      <li><code>/tmp/pwned.txt</code> artifact</li>
      <li>Confidence scoring</li>
    </ul>
  </div>
</div>

```text
Attacker (172.20.0.2) ───[ HTTP POST Payload: Log4j / Spring / XZ ]───▶ Target (172.20.0.3:8080)
Attacker (172.20.0.2) ◀───[ Telemetry: HTTP 200 + UID Evidence ]────── Target (172.20.0.3:8080)
```

---

## 📊 Summary: Publication-Grade Actionable Output

<div class="grid-2">
  <div class="card">
    <h3>📋 Verifiable Intelligence</h3>
    <ul style="font-size: 13.5px; padding-left: 18px; margin: 4px 0;">
      <li><strong>Empirical Verdict:</strong> <code>CONFIRMED VULNERABLE</code> vs <code>REFUTED</code>.</li>
      <li><strong>Root-Cause Analysis:</strong> Deep technical CVE breakdown.</li>
      <li><strong>Dual Telemetry:</strong> Attacker & Victim synchronized logs.</li>
      <li><strong>MITRE RAG:</strong> ATT&CK Enterprise + ATLAS AI mappings.</li>
    </ul>
  </div>

  <div class="card">
    <h3>🛡️ Instant Remediation Rules</h3>
    <ul style="font-size: 13.5px; padding-left: 18px; margin: 4px 0;">
      <li><strong>Immediate Containment:</strong> Exact patch thresholds.</li>
      <li><strong>Container Hardening:</strong> Drop <code>CAP_NET_RAW</code>, read-only rootfs.</li>
      <li><strong>SIGMA Detection:</strong> Ready-to-deploy SIEM hunting rule.</li>
      <li><strong>Snort Signatures:</strong> Live NIDS packet inspection rule.</li>
    </ul>
  </div>
</div>

<div style="text-align: center; margin-top: 14px;">
  <span class="badge badge-green" style="font-size: 13px; padding: 6px 14px;">
    🚀 Automated, Air-Gapped Cybersecurity Triage in &lt; 15 Seconds
  </span>
</div>
