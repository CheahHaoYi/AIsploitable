import json
import re
from pathlib import Path
from typing import Optional
from ..config import settings
from ..llm.ollama import ollama_client
from ..models.vulnerability import Vulnerability

PROMPTS_DIR = Path(__file__).resolve().parent.parent / "prompts"

class AnalyzerAgent:
    def __init__(self):
        self.llm = ollama_client

    async def analyze(self, input_text: str, model: str = settings.default_model) -> Vulnerability:
        template = ""
        prompt_file = PROMPTS_DIR / "analyzer.txt"
        if prompt_file.exists():
            template = prompt_file.read_text(encoding="utf-8")
        else:
            template = "Extract structured JSON vulnerability details for:\n{{input_text}}"

        prompt = template.replace("{{input_text}}", input_text)
        system = "You are a specialized cybersecurity vulnerability triage parser. Return valid JSON only."

        response = await self.llm.generate(prompt=prompt, model=model, system=system, format_json=True)
        
        parsed = self._extract_json(response)
        if parsed:
            try:
                return Vulnerability(**parsed)
            except Exception as e:
                print(f"Error instantiating Vulnerability from parsed JSON: {e}")

        # Fallback heuristic analysis if LLM output was unparseable or empty
        cve_match = re.search(r"CVE-\d{4}-\d{4,7}", input_text, re.IGNORECASE)
        cve_id = cve_match.group(0).upper() if cve_match else None
        
        # Simple extraction heuristics
        title = f"Vulnerability Investigation: {cve_id or 'Security Advisory'}"
        summary = input_text[:300].strip() + ("..." if len(input_text) > 300 else "")
        severity = "HIGH"
        if "critical" in input_text.lower():
            severity = "CRITICAL"
        elif "medium" in input_text.lower():
            severity = "MEDIUM"
        elif "low" in input_text.lower():
            severity = "LOW"

        return Vulnerability(
            cve_id=cve_id,
            title=title,
            summary=summary or "Analyzed security telemetry input.",
            severity=severity,
            cvss_score=8.5 if severity in ("CRITICAL", "HIGH") else 5.5,
            attack_vector="NETWORK",
            attack_complexity="LOW",
            privileges_required="NONE",
            user_interaction="NONE",
            affected_products=["Identified Component/Framework"],
            exploit_primitives=["Command Execution", "Input Validation Flaw"],
            potential_impact="Arbitrary Execution / System Compromise"
        )

    def _extract_json(self, text: str) -> Optional[dict]:
        if not text:
            return None
        # Try direct json loads
        try:
            return json.loads(text.strip())
        except Exception:
            pass

        # Try markdown json block
        match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1).strip())
            except Exception:
                pass

        # Try finding first { and last }
        first_brace = text.find("{")
        last_brace = text.rfind("}")
        if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
            try:
                return json.loads(text[first_brace:last_brace+1])
            except Exception:
                pass

        return None

analyzer_agent = AnalyzerAgent()
