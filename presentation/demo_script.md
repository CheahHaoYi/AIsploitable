# AIsploitable — Demo Choreography & Speaker Script

> **Supported Formats:** 1-Minute Pitch Track (60 Seconds) & Deep Dive Track (180 Seconds)  
> **Speaker Roles:** 1 Presenter / Screen Pilot

---

## ⚡ 1-Minute Fast Track (60 Seconds) — Aligned with Marp Slides

| Time | Slide / Action | Key Talk Track |
| :--- | :--- | :--- |
| **0:00 - 0:15** | **Slide 1 (Title & Hook)** | *"Enterprise SOC teams spend 4 to 8 hours triaging every CVE, while cloud LLMs hallucinate exploits and leak zero-days. Meet **AIsploitable**: an autonomous, privacy-preserving security investigation engine."* |
| **0:15 - 0:30** | **Slide 2 (The Problem & Philosophy)** | *"Instead of asking an AI if an exploit works, our core breakthrough is **Evidence Over Assertion** — executing controlled experiments in isolated sandboxes to empirically prove exploitability."* |
| **0:30 - 0:45** | **Slide 3 (The 3-Step Loop)** | *"In under 15 seconds, local Gemma retrieves threat intel across 755 offline MITRE vectors, synthesizes a safe Python PoC with 1-click AST guardrails, and triggers our isolated dual-container testbed."* |
| **0:45 - 1:00** | **Slide 4 (Value & Closing)** | *"No localhost loopback false positives, 100% on-device privacy, and instant SIGMA rules with executive PDF reports. AIsploitable turns guesswork into empirical proof."* |

---

## ⏱️ 3-Minute Deep Dive Track (180 Seconds)

### 1. The Hook & The Problem (0:00 - 0:30)
- **Slide / UI:** Mission Control Tab 1 ("Vulnerability Analysis & PoC Workspace")
- **Action:** Open `http://localhost:3000`. Select the **Log4Shell (CVE-2021-44228)** preset.
- **Speaker Script:**
  > *"Every single day, enterprise SOC teams are flooded with dozens of critical CVEs and security advisories. The manual triage process takes hours, while typical AI tools merely hallucinate theoretical code and leak sensitive proprietary zero-days to cloud APIs.
  > 
  > *Meet **AIsploitable** — an autonomous, privacy-preserving threat intelligence and empirical verification engine powered entirely by local **Gemma 3** models, offline MITRE RAG, and isolated Docker sandboxes."*

---

### 2. Tab 1: Advisory Analysis, Gemma Q&A & PoC Customizer (0:30 - 1:15)
- **UI:** Tab 1 (`VulnerabilityAnalysisTab`)
- **Action:**
  1. Click **"Analyze & Summarize with Gemma"** (show structured CVSS & exploit extraction).
  2. In the *Ask Gemma* panel, show streaming answer on how JNDI LDAP lookup operates.
  3. In the PoC Workspace, click **"Generate PoC with Gemma"** (watch Python script stream live).
  4. Type in the customizer: *"Bypass WAF with URL encoded payload"* and click **"Apply to PoC Script"** to demonstrate in-place code modification.
  5. Click **"Launch Autonomous Verification"**.
- **Speaker Script:**
  > *"Here in Tab 1, we ingest an advisory. Notice how local Gemma instantly extracts CVSS parameters, maps exploit primitives, and synthesizes a deterministic Python verification harness tailored specifically to this advisory.
  > 
  > If we need adjustments — like bypassing a WAF or adding custom authorization tokens — we simply ask Gemma in natural language, and with one click, our active script is updated in place. Now, let's test it against a real live target."*

---

### 3. Tab 2: Dual-Container Docker Sandbox (1:15 - 2:15)
- **UI:** Tab 2 (`DockerSandboxTab`)
- **Action:**
  1. Observe the **Investigation Stepper** advancing from Intake ➔ Plan ➔ Sandbox.
  2. Point out the **Side-by-Side Dual Terminals**:
     - *Left*: `sandbox-attacker-node` (`172.20.0.2`) transmitting the payload.
     - *Right*: `sandbox-victim-target` (`172.20.0.3:8080`) showing the daemon receiving the request and triggering the LDAP resolution.
  3. Hover over the **Attack Graph** and open the **Evidence Panel** showing `Exit Code: 0` and HTTP 200 verification.
- **Speaker Script:**
  > *"The system transitions to our isolated Docker testbed. Notice our dual-container architecture: on the left, our attacker node at `172.20.0.2` dispatches the PoC; on the right, our victim target at `172.20.0.3` logs the incoming exploit in real time.
  > 
  > By testing across a real network bridge rather than a single localhost loopback, we eliminate false positives. The execution passes, and our evidence is logged with exact exit codes and network artifacts."*

---

### 4. Tab 3: Reports & Findings Hub & Closing (2:15 - 3:00)
- **UI:** Tab 3 (`ReportsTab`)
- **Action:**
  1. Click the newly generated report in the Master-Detail list.
  2. Scroll through the executive TLP:AMBER banner, CVSS scorecard, MITRE ATT&CK matrix, and remediation patch.
  3. Click **"Export PDF"** to trigger the instant client-side PDF download.
- **Speaker Script:**
  > *"Finally, Tab 3 presents our executive findings hub. Local Gemma compiles the empirical evidence into an actionable SOC report with TLP:AMBER classification, MITRE technique matrices, and verified mitigation steps.
  > 
  > With one click, we can export publication-ready PDF and Markdown reports for enterprise ticketing. 
  > 
  > AIsploitable transforms vulnerability management from theoretical guesswork into **empirical, privacy-preserving proof in under 15 seconds**. Thank you!"*
