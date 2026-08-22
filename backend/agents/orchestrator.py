import asyncio
import uuid
from typing import Callable, Awaitable, Optional, Dict, Any
from ..config import settings
from ..models.state import Investigation, InvestigationStage, LogEntry
from ..rag.retriever import retriever
from .analyzer import analyzer_agent
from .planner import planner_agent
from .verifier import verifier_agent
from .reporter import reporter_agent
from ..sandbox.manager import sandbox_manager

class InvestigationOrchestrator:
    def __init__(self):
        self.investigations: Dict[str, Investigation] = {}

    def get(self, inv_id: str) -> Optional[Investigation]:
        return self.investigations.get(inv_id)

    async def run(
        self,
        investigation: Investigation,
        event_callback: Optional[Callable[[str, Dict[str, Any]], Awaitable[None]]] = None
    ) -> Investigation:
        self.investigations[investigation.id] = investigation

        async def emit(event_type: str, data: Dict[str, Any]):
            if event_callback:
                try:
                    await event_callback(event_type, data)
                except Exception as e:
                    print(f"Error in event callback: {e}")

        async def log(stage: InvestigationStage, msg: str, level: str = "INFO"):
            entry = LogEntry(stage=stage, level=level, message=msg)
            investigation.logs.append(entry)
            await emit("LOG", entry.model_dump())

        try:
            # 1. INTAKE
            investigation.current_stage = InvestigationStage.INTAKE
            investigation.progress = 10
            await emit("STATUS", {"stage": investigation.current_stage, "progress": investigation.progress})
            await log(InvestigationStage.INTAKE, f"Received investigation request with model {investigation.model_used}")
            await asyncio.sleep(0.3)

            # 2. ANALYZE (Gemma Structured CVE Extraction)
            investigation.current_stage = InvestigationStage.ANALYZE
            investigation.progress = 25
            await emit("STATUS", {"stage": investigation.current_stage, "progress": investigation.progress})
            await log(InvestigationStage.ANALYZE, f"Extracting structured threat metadata using {investigation.model_used}...")

            vuln = await analyzer_agent.analyze(investigation.raw_input_text, model=investigation.model_used)
            investigation.vulnerability = vuln
            await emit("VULNERABILITY", vuln.model_dump())
            await log(InvestigationStage.ANALYZE, f"Identified vulnerability: {vuln.title} (Severity: {vuln.severity}, CVSS: {vuln.cvss_score})", "SUCCESS")
            await asyncio.sleep(0.3)

            # 3. RETRIEVE (ATT&CK and ATLAS RAG)
            investigation.current_stage = InvestigationStage.RETRIEVE
            investigation.progress = 40
            await emit("STATUS", {"stage": investigation.current_stage, "progress": investigation.progress})
            await log(InvestigationStage.RETRIEVE, "Searching MITRE ATT&CK and MITRE ATLAS knowledge base...")

            query_terms = f"{vuln.cve_id or ''} {vuln.title} {vuln.summary} {' '.join(vuln.exploit_primitives)}"
            techniques = retriever.retrieve(query_terms, top_k=4)
            investigation.techniques = techniques
            await emit("KNOWLEDGE", {"techniques": [t.model_dump() for t in techniques]})
            await log(InvestigationStage.RETRIEVE, f"Retrieved {len(techniques)} relevant threat intelligence techniques", "SUCCESS")
            await asyncio.sleep(0.3)

            # 4. PLAN (Gemma Attack Verification Plan)
            investigation.current_stage = InvestigationStage.PLAN
            investigation.progress = 55
            await emit("STATUS", {"stage": investigation.current_stage, "progress": investigation.progress})
            await log(InvestigationStage.PLAN, "Formulating empirical verification hypothesis and plan steps...")

            plan = await planner_agent.plan(vuln, techniques, model=investigation.model_used)
            investigation.attack_plan = plan
            await emit("PLAN", plan.model_dump())
            await log(InvestigationStage.PLAN, f"Plan generated with {len(plan.steps)} verification steps", "SUCCESS")
            await asyncio.sleep(0.3)

            # 5. SANDBOX & EXECUTE
            investigation.current_stage = InvestigationStage.SANDBOX
            investigation.progress = 70
            await emit("STATUS", {"stage": investigation.current_stage, "progress": investigation.progress})
            await log(InvestigationStage.SANDBOX, f"Deploying isolated testbed container: {plan.target_environment}")

            investigation.current_stage = InvestigationStage.EXECUTE
            await emit("STATUS", {"stage": investigation.current_stage, "progress": investigation.progress})

            collected_evidence = []
            async for chunk, ev_event in sandbox_manager.execute_plan(plan):
                investigation.terminal_output += chunk
                await emit("TERMINAL", {"chunk": chunk})
                if ev_event:
                    collected_evidence.append(ev_event)
                    investigation.evidence_events.append(ev_event)
                    await emit("EVIDENCE", ev_event.model_dump())
                    await log(InvestigationStage.EXECUTE, f"Evidence captured: {ev_event.command} -> Exit 0", "SUCCESS")

            # 6. VERIFY
            investigation.current_stage = InvestigationStage.VERIFY
            investigation.progress = 85
            await emit("STATUS", {"stage": investigation.current_stage, "progress": investigation.progress})
            await log(InvestigationStage.VERIFY, "Executing deterministic assertion check and confidence calculation...")

            verif = await verifier_agent.verify(plan.hypothesis, collected_evidence, model=investigation.model_used)
            investigation.verification = verif
            await emit("VERIFICATION", verif.model_dump())
            await log(InvestigationStage.VERIFY, f"Verdict: {'CONFIRMED VULNERABLE' if verif.is_vulnerable else 'REFUTED'} (Confidence: {int(verif.confidence_score * 100)}%)", "SUCCESS")
            await asyncio.sleep(0.3)

            # 7. REPORT
            investigation.current_stage = InvestigationStage.REPORT
            investigation.progress = 95
            await emit("STATUS", {"stage": investigation.current_stage, "progress": investigation.progress})
            await log(InvestigationStage.REPORT, "Synthesizing executive triage report with Gemma...")

            report_md = await reporter_agent.report(vuln, techniques, plan, verif, model=investigation.model_used)
            investigation.report_markdown = report_md
            await emit("REPORT", {"report": report_md})
            await log(InvestigationStage.REPORT, "Investigation report ready for export.", "SUCCESS")

            # COMPLETED
            investigation.current_stage = InvestigationStage.COMPLETED
            investigation.progress = 100
            await emit("STATUS", {"stage": investigation.current_stage, "progress": investigation.progress})
            await log(InvestigationStage.COMPLETED, "Autonomous cyber triage investigation completed successfully.", "SUCCESS")

        except Exception as e:
            investigation.current_stage = InvestigationStage.ERROR
            investigation.error_message = str(e)
            await emit("ERROR", {"message": str(e)})
            await log(InvestigationStage.ERROR, f"Investigation failed: {e}", "ERROR")

        return investigation

orchestrator = InvestigationOrchestrator()
