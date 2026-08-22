import asyncio
import uuid
from datetime import datetime
from typing import Callable, Awaitable, Optional, Dict, Any
from ..config import settings
from ..models.state import Investigation, InvestigationStage, LogEntry, ReportSummary
from ..rag.retriever import retriever
from .analyzer import analyzer_agent
from .planner import planner_agent
from .generator import script_generator_agent
from .verifier import verifier_agent
from .reporter import reporter_agent
from ..sandbox.manager import sandbox_manager
from ..api.reports import save_report

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
            await log(InvestigationStage.INTAKE, f"Received investigation intake (Model: {investigation.model_used})")
            await asyncio.sleep(0.3)

            # 2. ANALYZE (Gemma Structured CVE Extraction)
            investigation.current_stage = InvestigationStage.ANALYZE
            investigation.progress = 25
            await emit("STATUS", {"stage": investigation.current_stage, "progress": investigation.progress})
            await log(InvestigationStage.ANALYZE, f"Gemma analyzing vulnerability advisory & extracting attack primitives...")

            vuln = await analyzer_agent.analyze(investigation.raw_input_text, model=investigation.model_used)
            investigation.vulnerability = vuln
            await emit("VULNERABILITY", vuln.model_dump())
            await log(InvestigationStage.ANALYZE, f"Identified {vuln.title} (Severity: {vuln.severity}, CVSS: {vuln.cvss_score})", "SUCCESS")
            await asyncio.sleep(0.3)

            # 3. RETRIEVE (ATT&CK and ATLAS RAG)
            investigation.current_stage = InvestigationStage.RETRIEVE
            investigation.progress = 35
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
            investigation.progress = 48
            await emit("STATUS", {"stage": investigation.current_stage, "progress": investigation.progress})
            await log(InvestigationStage.PLAN, "Formulating empirical verification hypothesis and plan steps...")

            plan = await planner_agent.plan(vuln, techniques, model=investigation.model_used)
            investigation.attack_plan = plan
            await emit("PLAN", plan.model_dump())
            await log(InvestigationStage.PLAN, f"Verification plan generated with {len(plan.steps)} steps", "SUCCESS")
            await asyncio.sleep(0.3)

            # 5. GENERATE SCRIPT (Gemma Code Synthesis)
            investigation.current_stage = InvestigationStage.GENERATE_SCRIPT
            investigation.progress = 60
            await emit("STATUS", {"stage": investigation.current_stage, "progress": investigation.progress})
            await log(InvestigationStage.GENERATE_SCRIPT, f"Gemma synthesizing Python PoC verification script...")

            generated_script = await script_generator_agent.generate_script(vuln, plan, model=investigation.model_used)
            investigation.generated_script = generated_script
            await emit("SCRIPT", {"script": generated_script, "container": "attacker"})
            await log(InvestigationStage.GENERATE_SCRIPT, "PoC verification script synthesized successfully.", "SUCCESS")
            await asyncio.sleep(0.3)

            # 6. SANDBOX & EXECUTE (Side-by-Side Attacker & Victim Streams)
            investigation.current_stage = InvestigationStage.SANDBOX
            investigation.progress = 70
            await emit("STATUS", {"stage": investigation.current_stage, "progress": investigation.progress})
            await log(InvestigationStage.SANDBOX, f"Deploying dual-container isolated testbed: {plan.target_environment}")

            investigation.current_stage = InvestigationStage.EXECUTE
            investigation.progress = 75
            await emit("STATUS", {"stage": investigation.current_stage, "progress": investigation.progress})

            collected_evidence = []
            async for event in sandbox_manager.execute_plan(plan, generated_script):
                ev_type = event.get("type")
                chunk = event.get("chunk", "")
                container = event.get("container", "system")
                ev = event.get("evidence")

                if ev_type == "COMPOSITE":
                    investigation.terminal_output += chunk
                    await emit("TERMINAL", {"chunk": chunk})
                elif ev_type == "ATTACKER":
                    investigation.attacker_logs += chunk
                    await emit("DOCKER_LOG", {"container": "attacker", "chunk": chunk})
                elif ev_type == "VICTIM":
                    investigation.victim_logs += chunk
                    await emit("DOCKER_LOG", {"container": "victim", "chunk": chunk})

                if ev:
                    collected_evidence.append(ev)
                    investigation.evidence_events.append(ev)
                    await emit("EVIDENCE", ev.model_dump())
                    await log(InvestigationStage.EXECUTE, f"Evidence confirmed: {ev.command} -> Exit 0", "SUCCESS")

            # 7. VERIFY
            investigation.current_stage = InvestigationStage.VERIFY
            investigation.progress = 85
            await emit("STATUS", {"stage": investigation.current_stage, "progress": investigation.progress})
            await log(InvestigationStage.VERIFY, "Executing deterministic assertion evaluation and confidence scoring...")

            verif = await verifier_agent.verify(plan.hypothesis, collected_evidence, model=investigation.model_used)
            investigation.verification = verif
            await emit("VERIFICATION", verif.model_dump())
            await log(InvestigationStage.VERIFY, f"Verdict: {'CONFIRMED VULNERABLE' if verif.is_vulnerable else 'REFUTED'} (Confidence: {int(verif.confidence_score * 100)}%)", "SUCCESS")
            await asyncio.sleep(0.3)

            # 8. REPORT
            investigation.current_stage = InvestigationStage.REPORT
            investigation.progress = 95
            await emit("STATUS", {"stage": investigation.current_stage, "progress": investigation.progress})
            await log(InvestigationStage.REPORT, "Synthesizing executive triage report with Gemma...")

            report_md = await reporter_agent.report(vuln, techniques, plan, verif, model=investigation.model_used)
            investigation.report_markdown = report_md
            await emit("REPORT", {"report": report_md})

            # Save report to persistent database
            rep_summary = ReportSummary(
                id=f"rep-{investigation.id}",
                cve_id=vuln.cve_id or "CVE-CUSTOM",
                title=vuln.title,
                severity=vuln.severity,
                cvss_score=vuln.cvss_score,
                verdict="CONFIRMED VULNERABLE" if verif.is_vulnerable else "REFUTED",
                confidence_score=verif.confidence_score,
                created_at=datetime.utcnow().isoformat(),
                model_used=investigation.model_used,
                summary=vuln.summary,
                report_markdown=report_md
            )
            save_report(rep_summary)
            await log(InvestigationStage.REPORT, "Investigation report generated and archived in ledger.", "SUCCESS")

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
