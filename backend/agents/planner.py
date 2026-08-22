import json
import re
from pathlib import Path
from typing import List, Optional
from ..config import settings
from ..llm.ollama import ollama_client
from ..models.vulnerability import Vulnerability
from ..models.technique import Technique
from ..models.attack_plan import AttackPlan, PlanStep

PROMPTS_DIR = Path(__file__).resolve().parent.parent / "prompts"

class PlannerAgent:
    def __init__(self):
        self.llm = ollama_client

    async def plan(self, vulnerability: Vulnerability, techniques: List[Technique], model: str = settings.default_model) -> AttackPlan:
        prompt_file = PROMPTS_DIR / "planner.txt"
        template = prompt_file.read_text(encoding="utf-8") if prompt_file.exists() else "Design attack plan for: {{vulnerability_json}}"

        vuln_json = vulnerability.model_dump_json(indent=2)
        tech_json = json.dumps([t.model_dump() for t in techniques[:4]], indent=2)

        prompt = template.replace("{{vulnerability_json}}", vuln_json).replace("{{techniques_json}}", tech_json)
        system = "You are a cyber attack verification engineer. Formulate an actionable verification plan in JSON format."

        response = await self.llm.generate(prompt=prompt, model=model, system=system, format_json=True)
        parsed = self._extract_json(response)

        if parsed:
            try:
                return AttackPlan(**parsed)
            except Exception as e:
                print(f"Error instantiating AttackPlan from parsed JSON: {e}")

        # Fallback plan
        return AttackPlan(
            hypothesis=f"Verification of {vulnerability.cve_id or vulnerability.title}: Attacker can exploit input validation primitives to execute arbitrary logic in container environment.",
            target_environment="Isolated Target Sandbox Container (Debian 12 + Python runtime)",
            prerequisites=[
                "Target container reachable over local bridge network",
                "Crafted exploit payload generator initialized"
            ],
            steps=[
                PlanStep(
                    step_id=1,
                    title="Service Discovery & Banner Grabbing",
                    stage="RECON",
                    description="Probe target service endpoint to verify running version and response headers.",
                    target_component="target_service:8080",
                    command_to_run="curl -i -s http://127.0.0.1:8080/health",
                    expected_artifact="HTTP/1.1 200 OK or banner confirmation",
                    status="PENDING"
                ),
                PlanStep(
                    step_id=2,
                    title="Payload Injection & PoC Delivery",
                    stage="EXPLOIT",
                    description="Deliver exploit primitive to trigger vulnerability in isolated container.",
                    target_component="target_service:8080/api/process",
                    command_to_run="curl -X POST -H 'Content-Type: application/json' -d '{\"input\": \"; id; whoami > /tmp/pwned.txt\"}' http://127.0.0.1:8080/api/process",
                    expected_artifact="Payload accepted and processed by vulnerable endpoint",
                    status="PENDING"
                ),
                PlanStep(
                    step_id=3,
                    title="Evidence & Artifact Extraction",
                    stage="VERIFY",
                    description="Verify execution artifact creation and privileges in target context.",
                    target_component="target_filesystem",
                    command_to_run="cat /tmp/pwned.txt && ls -la /tmp",
                    expected_artifact="uid=0(root) or file /tmp/pwned.txt exists",
                    status="PENDING"
                )
            ],
            mitre_mappings=[t.id for t in techniques[:3]]
        )

    def _extract_json(self, text: str) -> Optional[dict]:
        if not text:
            return None
        try:
            return json.loads(text.strip())
        except Exception:
            pass
        match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1).strip())
            except Exception:
                pass
        first_brace = text.find("{")
        last_brace = text.rfind("}")
        if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
            try:
                return json.loads(text[first_brace:last_brace+1])
            except Exception:
                pass
        return None

planner_agent = PlannerAgent()
