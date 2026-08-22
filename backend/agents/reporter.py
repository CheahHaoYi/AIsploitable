import json
from pathlib import Path
from typing import List, Optional
from ..config import settings
from ..llm.ollama import ollama_client
from ..models.vulnerability import Vulnerability
from ..models.technique import Technique
from ..models.attack_plan import AttackPlan
from ..models.evidence import VerificationResult

PROMPTS_DIR = Path(__file__).resolve().parent.parent / "prompts"

class ReporterAgent:
    def __init__(self):
        self.llm = ollama_client

    async def report(
        self,
        vulnerability: Vulnerability,
        techniques: List[Technique],
        plan: AttackPlan,
        verification: VerificationResult,
        model: str = settings.default_model
    ) -> str:
        prompt_file = PROMPTS_DIR / "reporter.txt"
        template = prompt_file.read_text(encoding="utf-8") if prompt_file.exists() else "Generate report for: {{vulnerability_json}}"

        vuln_json = vulnerability.model_dump_json(indent=2)
        tech_json = json.dumps([t.model_dump() for t in techniques[:4]], indent=2)
        plan_json = plan.model_dump_json(indent=2)
        verif_json = verification.model_dump_json(indent=2)

        prompt = (
            template.replace("{{vulnerability_json}}", vuln_json)
            .replace("{{techniques_json}}", tech_json)
            .replace("{{plan_json}}", plan_json)
            .replace("{{verification_json}}", verif_json)
        )
        system = "You are a senior Incident Response Lead. Generate an executive and technical Markdown report."

        response = await self.llm.generate(prompt=prompt, model=model, system=system)
        if response and len(response.strip()) > 100:
            return response

        # Fallback structured markdown report
        mitre_list = "\n".join([f"- **[{t.id}] {t.name}** ({'ATLAS' if t.is_atlas else 'ATT&CK'}): {t.why_retrieved or t.description[:100]}" for t in techniques[:4]])
        verif_items = "\n".join([f"- [x] {a}" for a in verification.verified_assertions])
        
        return f"""# Security Triage & Empirical Verification Report

## 1. Executive Summary
- **Target / Identifier**: {vulnerability.cve_id or vulnerability.title}
- **Severity**: {vulnerability.severity} (CVSS {vulnerability.cvss_score})
- **Empirical Exploitation Verdict**: **{'CONFIRMED VULNERABLE' if verification.is_vulnerable else 'UNVERIFIED / PROTECTED'}**
- **Confidence Score**: **{int(verification.confidence_score * 100)}%**
- **Executive Summary**: {vulnerability.summary}

---

## 2. Vulnerability Breakdown
- **Attack Vector**: `{vulnerability.attack_vector}`
- **Attack Complexity**: `{vulnerability.attack_complexity}`
- **Privileges Required**: `{vulnerability.privileges_required}`
- **Affected Products**: {", ".join(vulnerability.affected_products) or "Target Components"}
- **Exploit Primitives**: {", ".join(vulnerability.exploit_primitives) or "Arbitrary Command Execution"}
- **Potential Impact**: {vulnerability.potential_impact or "System Takeover / Data Exfiltration"}

---

## 3. Threat Intelligence & MITRE Mapping
The following MITRE ATT&CK and MITRE ATLAS techniques were matched against telemetry:
{mitre_list}

---

## 4. Empirical Sandbox Verification
- **Hypothesis Tested**: {plan.hypothesis}
- **Execution Target**: {plan.target_environment}
- **Verified Assertions**:
{verif_items}

---

## 5. Risk & Remediation Actions
1. **Immediate Patch Deployment**: Upgrade affected dependencies to the latest patched release.
2. **Egress Filtering & Network Segmentation**: Restrict outbound container connectivity to minimize lateral movement.
3. **Input Sanitization**: Enforce strict schema validation and parameter binding to neutralize injection vectors.
4. **Telemetry & Detection Rules**: Implement SIGMA alerts for anomalous child processes spawned from the service runtime.
"""

reporter_agent = ReporterAgent()
