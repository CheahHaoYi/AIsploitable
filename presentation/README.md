# CyberTriage AI — Hackathon Presentation & Live Demo

Pitch strategy, demonstration choreography, and judge defense guides for CyberTriage AI.

---

## 🎬 3-Tab Live Demo Flow (3 Minutes)

1. **Minute 0:00 - 0:45 | Tab 1: CVE Intake & Blog Questioning**
   - Show CVE Link input echoing the URL safely (ready for intake, no background scraping).
   - Select the **Log4Shell (CVE-2021-44228)** preset or paste raw advisory text.
   - Click **"Ask Gemma"** to show real-time streaming answers from local `gemma4:e2b` explaining the JNDI LDAP exploit primitive.
   - Click **"Launch Autonomous Verification"** (or "Stream PoC Script with Gemma").

2. **Minute 0:45 - 2:00 | Tab 2: Docker Sandbox (Side-by-Side)**
   - Highlight the **Investigation Timeline** stepping through stages in real time.
   - Point out the **Gemma Synthesized PoC Script** streaming live into the editor.
   - Showcase the **Side-by-Side Dual Container Terminals**:
     - Left terminal: `sandbox-attacker-node` dispatching the PoC payload.
     - Right terminal: `sandbox-victim-target` daemon receiving the connection and triggering the vulnerable path.
   - Inspect the **Attack Graph** and **Evidence Assertions** (Exit Code 0, Observed Artifacts).

3. **Minute 2:00 - 3:00 | Tab 3: Reports & Findings Hub**
   - Click into the generated report from the master list.
   - Walk through the structured executive findings, MITRE ATT&CK mapping, and remediation steps.
   - Demonstrate the **Export / Download MD** button.

---

## 🛡️ Judge Defense FAQ

- **Q: Why run local Gemma instead of cloud APIs?**
  *A: Enterprise incident response handles sensitive proprietary code and undisclosed zero-days. Air-gapped local Gemma ensures zero data leakage and strict compliance.*
- **Q: Why dual Docker containers?**
  *A: Single-container tests create false positives (e.g., localhost loopbacks bypass firewalls). Dual containers simulate real network topology (`172.20.0.2` ➔ `172.20.0.3`) in an isolated bridge with dropped privileges.*
- **Q: How does offline RAG work without vector databases?**
  *A: 755 MITRE ATT&CK & ATLAS techniques are indexed into a high-speed in-memory hybrid matcher that evaluates token intersections and semantic relevance in sub-5ms.*
