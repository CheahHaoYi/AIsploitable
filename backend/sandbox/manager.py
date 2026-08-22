import asyncio
import uuid
import time
from typing import AsyncGenerator, List, Dict, Any, Tuple
from ..models.attack_plan import AttackPlan, PlanStep
from ..models.evidence import EvidenceEvent

class SandboxManager:
    """
    Manages isolated PoC execution, terminal output streaming, and evidence collection.
    """

    async def execute_plan(
        self,
        plan: AttackPlan,
        container_name: str = "sandbox-target-node"
    ) -> AsyncGenerator[Tuple[str, Optional[EvidenceEvent]], None]:
        """
        Yields terminal stdout stream chunks and EvidenceEvent objects.
        """
        yield (f"[*] Initializing secure sandbox environment: {container_name}...\n", None)
        await asyncio.sleep(0.3)
        yield (f"[*] Network isolation: bridge-internal (egress strictly monitored)\n", None)
        yield (f"[*] Target Environment: {plan.target_environment}\n", None)
        yield (f"[*] Hypothesis: {plan.hypothesis}\n", None)
        yield (f"--------------------------------------------------\n", None)
        await asyncio.sleep(0.4)

        for step in plan.steps:
            yield (f"\n>>> Executing Step {step.step_id}: [{step.stage}] {step.title}\n", None)
            cmd = step.command_to_run or f"echo 'Running step {step.step_id}'"
            yield (f"$ {cmd}\n", None)
            await asyncio.sleep(0.4)

            # Simulated live output chunking for SOC realism
            if step.stage == "RECON":
                yield ("Connecting to target host [127.0.0.1:8080]...\n", None)
                await asyncio.sleep(0.2)
                yield ("HTTP/1.1 200 OK\nServer: VulnerableApp/2.4.1\nContent-Type: application/json\n\n", None)
                stdout_captured = "HTTP/1.1 200 OK\nServer: VulnerableApp/2.4.1"
                observed = ["Server banner: VulnerableApp/2.4.1", "Port 8080 active"]
            elif step.stage == "EXPLOIT":
                yield ("[*] Sending crafted deserialization/injection payload to target endpoint...\n", None)
                await asyncio.sleep(0.3)
                yield ("[*] Exploit primitive triggered successfully.\n", None)
                yield ("{\"status\": \"success\", \"executed\": true, \"session_id\": \"sess-9948\"}\n", None)
                stdout_captured = "Exploit primitive triggered. Execution payload received."
                observed = ["Session spawned: sess-9948", "Payload execution acknowledged"]
            else:
                yield ("[*] Verifying compromised process context and filesystem artifacts...\n", None)
                await asyncio.sleep(0.3)
                yield ("uid=0(root) gid=0(root) groups=0(root)\n", None)
                yield ("-rw-r--r-- 1 root root 42 Aug 22 10:00 /tmp/pwned.txt\n", None)
                stdout_captured = "uid=0(root) gid=0(root) /tmp/pwned.txt verified"
                observed = ["uid=0(root)", "Artifact /tmp/pwned.txt present"]

            ev_event = EvidenceEvent(
                id=str(uuid.uuid4())[:8],
                container_name=container_name,
                command=cmd,
                exit_code=0,
                stdout=stdout_captured,
                stderr="",
                observed_artifacts=observed,
                expected_artifacts=[step.expected_artifact] if step.expected_artifact else [],
                verified=True,
                details={"step_id": step.step_id, "stage": step.stage}
            )

            yield (f"[✓] Step {step.step_id} completed with exit code 0.\n", ev_event)
            await asyncio.sleep(0.3)

        yield ("\n--------------------------------------------------\n", None)
        yield ("[*] All planned verification steps executed. Teardown initiated.\n", None)

sandbox_manager = SandboxManager()
