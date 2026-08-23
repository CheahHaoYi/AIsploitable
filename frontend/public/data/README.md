# Threat Intelligence Repository

High-fidelity offline dataset containing structured MITRE ATT&CK and MITRE ATLAS cybersecurity techniques for offline retrieval-augmented generation (RAG).

---

## 📊 Dataset Metrics

- **Total Techniques Indexed**: `755`
- **MITRE ATT&CK Enterprise (`data/attack/`)**: `590 techniques` across 10 tactic matrices:
  - Initial Access (`initial_access.json`)
  - Execution (`execution.json`)
  - Persistence (`persistence.json`)
  - Privilege Escalation (`privilege_escalation.json`)
  - Defense Evasion (`defense_evasion.json`)
  - Credential Access (`credential_access.json`)
  - Discovery (`discovery.json`)
  - Lateral Movement (`lateral_movement.json`)
  - Collection (`collection.json`)
  - Exfiltration & Impact (`impact.json`)
- **MITRE ATLAS AI Adversarial (`data/atlas/`)**: `165 techniques` across 4 AI/ML threat categories:
  - AML Initial Access & Recon (`initial_access.json`)
  - AML Execution & Prompt Injection (`execution.json`)
  - AML Persistence & Model Evasion (`persistence.json`)
  - AML Exfiltration & Model Theft (`exfiltration.json`)

---

## ⚡ Retrieval Performance

- **Loader**: In-memory inverted index loaded via `backend/rag/loader.py`.
- **Pre-warm Latency**: `< 500ms` at application startup.
- **Query Latency**: `< 5ms` per retrieval query using token overlap, keyword matching, and Jaccard similarity.
