---
marp: true
theme: default
size: 16:9
paginate: true
header: "AIsploitable • Autonomous Security Investigation"
footer: "Powered by Local Gemma & MITRE ATT&CK/ATLAS • 1-Minute Pitch"
style: |
  @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

  :root {
    --bg: #ffffff;
    --surface: #f8f9fa;
    --surface-hover: #f1f3f4;
    --border: #dadce0;
    --text: #202124;
    --text-muted: #5f6368;
    --google-blue: #1a73e8;
    --google-blue-bg: #e8f0fe;
    --google-red: #d93025;
    --google-red-bg: #fce8e6;
    --google-green: #188038;
    --google-green-bg: #e6f4ea;
    --google-yellow: #f29900;
    --google-yellow-bg: #fef7e0;
  }

  section {
    background-color: var(--bg);
    color: var(--text);
    font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 19px;
    line-height: 1.5;
    padding: 44px 56px;
    box-sizing: border-box;
  }

  h1, h2, h3 {
    font-family: 'Google Sans', sans-serif;
    font-weight: 700;
    margin: 0;
    padding: 0;
    letter-spacing: -0.01em;
  }

  h1 {
    font-size: 42px;
    color: var(--text);
    line-height: 1.2;
  }

  h2 {
    font-size: 28px;
    color: var(--google-blue);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  header {
    font-size: 11px;
    font-weight: 500;
    color: var(--text-muted);
    top: 18px;
    left: 56px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  footer {
    font-size: 11px;
    font-weight: 500;
    color: var(--text-muted);
    bottom: 18px;
    right: 56px;
    font-family: 'Google Sans', sans-serif;
  }

  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 8px;
  }

  .grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
    margin-top: 8px;
  }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 20px 22px;
    box-shadow: 0 1px 3px rgba(60,64,67,0.08);
  }

  .card-blue { border-top: 4px solid var(--google-blue); }
  .card-green { border-top: 4px solid var(--google-green); }
  .card-red { border-top: 4px solid var(--google-red); }
  .card-yellow { border-top: 4px solid var(--google-yellow); }

  .card h3 {
    font-size: 18px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .card p {
    font-size: 14.5px;
    color: var(--text-muted);
    margin: 0;
    line-height: 1.45;
  }

  .badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  .badge-blue { background: var(--google-blue-bg); color: var(--google-blue); }
  .badge-green { background: var(--google-green-bg); color: var(--google-green); }
  .badge-red { background: var(--google-red-bg); color: var(--google-red); }
  .badge-yellow { background: var(--google-yellow-bg); color: var(--google-yellow); }

  .flow-box {
    background: #ffffff;
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 12px 16px;
    text-align: center;
    font-size: 13.5px;
    font-weight: 600;
  }

  .hero-tag {
    color: var(--google-blue);
    font-size: 20px;
    font-weight: 500;
    margin-top: 8px;
    margin-bottom: 24px;
  }

  .stat-num {
    font-size: 32px;
    font-weight: 700;
    color: var(--google-blue);
    line-height: 1;
    margin-bottom: 4px;
  }
---

<!-- _class: lead -->
<div style="margin-top: 20px;">
  <span class="badge badge-blue">Google Gemma Hackathon</span>
  <h1 style="margin-top: 14px; font-size: 46px;">🛡️ AIsploitable</h1>
  <div class="hero-tag">Evidence-Driven Autonomous Vulnerability Investigation</div>
  
  <p style="font-size: 18px; color: var(--text-muted); max-width: 820px; margin-bottom: 28px;">
    Transforming raw security advisories into <strong>empirical proof of exploitability</strong> and actionable defense rules in under 15 seconds.
  </p>

  <div class="grid-3">
    <div class="card card-blue">
      <div class="stat-num">100%</div>
      <p><strong>On-Device Privacy</strong><br>Zero cloud API leaks for critical zero-days</p>
    </div>
    <div class="card card-green">
      <div class="stat-num">755</div>
      <p><strong>MITRE Techniques</strong><br>590 ATT&CK + 165 ATLAS in offline RAG</p>
    </div>
    <div class="card card-yellow">
      <div class="stat-num">&lt; 15s</div>
      <p><strong>End-to-End Triage</strong><br>From raw writeup to verified patch report</p>
    </div>
  </div>
</div>

---

## ⚠️ The Problem: Triage Delay & LLM Hallucination

<div class="grid-2">
  <div class="card card-red">
    <h3 style="color: var(--google-red);">❌ The Enterprise SOC Bottleneck</h3>
    <ul style="font-size: 15px; color: var(--text-muted); padding-left: 20px; margin: 8px 0;">
      <li><strong>4 to 8 Hours Manual Triage:</strong> Analyzing advisories and setting up test harnesses is painfully slow.</li>
      <li><strong>AI Hallucination Risk:</strong> Cloud LLMs invent theoretical attack steps without empirical testing.</li>
      <li><strong>Zero-Day Leakage:</strong> Sending unpatched vulnerability code to public cloud APIs exposes proprietary systems.</li>
    </ul>
  </div>

  <div class="card card-green">
    <h3 style="color: var(--google-green);">💡 Our Philosophy: Evidence Over Assertion</h3>
    <ul style="font-size: 15px; color: var(--text-muted); padding-left: 20px; margin: 8px 0;">
      <li><strong>Autonomous Hypothesis:</strong> Local Gemma extracts primitives & plans targeted verification.</li>
      <li><strong>Live Sandbox Experiment:</strong> Dual-container Docker lab executes real network payloads.</li>
      <li><strong>Empirical Verification:</strong> Conclusions are backed by stdout/stderr, exit codes, and artifacts.</li>
    </ul>
  </div>
</div>

<div style="background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 12px 20px; margin-top: 16px; text-align: center;">
  <span style="font-size: 14px; font-weight: 600; color: var(--google-blue);">
    "We don't merely ask an LLM if a vulnerability exists — we run a safe, isolated experiment to prove it."
  </span>
</div>

---

## ⚡ How It Works: The 3-Step Autonomous Loop

<div class="grid-3">
  <div class="card card-blue">
    <span class="badge badge-blue">Stage 1</span>
    <h3 style="margin-top: 10px; color: var(--google-blue);">Intake & Offline RAG</h3>
    <p>
      • Accepts raw CVE writeups & URLs<br>
      • Maps to 755 ATT&CK / ATLAS vectors<br>
      • Sub-5ms in-memory retrieval<br>
      • Context-rich exploit parameter parsing
    </p>
  </div>

  <div class="card card-yellow">
    <span class="badge badge-yellow">Stage 2</span>
    <h3 style="margin-top: 10px; color: var(--google-yellow);">Gemma PoC Synthesis</h3>
    <p>
      • Streams safe 3-phase Python harnesses<br>
      • In-place 1-click customization (WAF, Auth)<br>
      • Real-time AST syntax guardrails<br>
      • Deterministic fallback safety nets
    </p>
  </div>

  <div class="card card-green">
    <span class="badge badge-green">Stage 3</span>
    <h3 style="margin-top: 10px; color: var(--google-green);">Dual-Node Lab & Report</h3>
    <p>
      • Isolated bridge (<code>172.20.0.2 ➔ .3</code>)<br>
      • True network packet isolation<br>
      • Live side-by-side terminal streams<br>
      • Auto SIGMA rules & PDF exports
    </p>
  </div>
</div>

<div style="display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; gap: 8px; align-items: center; margin-top: 16px;">
  <div class="flow-box">Advisory Intake</div>
  <div style="color: var(--google-blue); font-weight: bold;">➔</div>
  <div class="flow-box">Gemma Reasoning</div>
  <div style="color: var(--google-blue); font-weight: bold;">➔</div>
  <div class="flow-box">Docker Sandbox</div>
  <div style="color: var(--google-blue); font-weight: bold;">➔</div>
  <div class="flow-box" style="background: var(--google-green-bg); color: var(--google-green); border-color: var(--google-green);">Verified Defense</div>
</div>

---

## 🎯 Value Proposition & SOC Impact

<div class="grid-2">
  <div class="card card-blue">
    <h3 style="color: var(--google-blue);">🏢 Immediate Enterprise Value</h3>
    <ul style="font-size: 15px; color: var(--text-muted); padding-left: 20px; margin: 8px 0;">
      <li><strong>95% Reduction in Triage Time:</strong> Resolves CVE uncertainty from hours down to seconds.</li>
      <li><strong>Zero Network False Positives:</strong> Dual-container routing ensures real firewall & NAT parity.</li>
      <li><strong>Turnkey Defense Artifacts:</strong> Instantly outputs SIGMA detection rules, Snort signatures, and executive PDFs.</li>
    </ul>
  </div>

  <div class="card card-green">
    <h3 style="color: var(--google-green);">🚀 Built with Google Technology</h3>
    <ul style="font-size: 15px; color: var(--text-muted); padding-left: 20px; margin: 8px 0;">
      <li><strong>Gemma 4 Orchestration:</strong> Powers intake analysis, hypothesis generation, and report synthesis.</li>
      <li><strong>Air-Gapped & Sovereign:</strong> Completely runnable offline with zero external telemetry.</li>
      <li><strong>Clean Modern UI:</strong> Next.js 15 App Router styled with Google visual design language.</li>
    </ul>
  </div>
</div>

<div style="margin-top: 24px; text-align: center;">
  <span class="badge badge-green" style="font-size: 14px; padding: 6px 18px;">
    ✓ Live & Fully Operational on Localhost
  </span>
</div>
