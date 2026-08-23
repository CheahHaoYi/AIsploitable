export const BLOG_INTAKE_PROMPT_TEMPLATE = `You are an expert Cyber Threat Intelligence and Security Research Analyst.
Your task is to ingest unstructured cybersecurity blog post content, vulnerability advisory, or threat intelligence writeup and distill it into a clean, highly structured, technically rigorous briefing suitable for automated triage and empirical PoC generation.

Source URL: {{source_url}}
Raw Blog / Advisory Content:
{{blog_content}}

Instructions:
1. Extract and structure the key threat intelligence elements.
2. Structure your briefing with these exact markdown sections:
   # [Vulnerability Name / Technical Title]
   ## 1. Threat Overview & CVE Identifiers
   - CVE IDs, CWE categories, and discovery context.
   ## 2. Affected Targets & Prerequisites
   - Affected software versions, operating systems, and deployment configurations.
   ## 3. Root Cause & Technical Flaw Mechanism
   - Deep explanation of the code-level flaw (e.g. unsafe deserialization, argument injection, race condition, parser confusion).
   ## 4. Exploit Primitives & Attack Vector
   - Network protocols, headers, parameters, and payload trigger strings.
   ## 5. Potential Impact & Verification Artifacts
   - Execution privilege level (root/user), state changes, or files created.
   ## 6. Defensive Mitigations & Indicators of Compromise (IoCs)
   - Patched versions, configuration workarounds, and log patterns.

Provide the structured briefing directly in clean markdown without conversational preamble.`;

export const ANALYZER_PROMPT_TEMPLATE = `You are an expert Autonomous Security Triage Analyst.
Analyze the following vulnerability advisory, CVE report, or security incident text.
Extract a structured JSON object representing the vulnerability details.

Output valid JSON ONLY matching this exact schema:
{
  "cve_id": "string or null (e.g. CVE-2024-XXXX)",
  "title": "string (succinct technical title)",
  "summary": "string (clear 2-3 sentence overview)",
  "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "cvss_score": float (e.g. 8.8),
  "attack_vector": "NETWORK" | "ADJACENT" | "LOCAL" | "PHYSICAL",
  "attack_complexity": "LOW" | "MEDIUM" | "HIGH",
  "privileges_required": "NONE" | "LOW" | "HIGH",
  "user_interaction": "NONE" | "REQUIRED",
  "affected_products": ["string"],
  "exploit_primitives": ["string", "string"],
  "potential_impact": "string (e.g. Remote Code Execution, Memory Corruption, Prompt Injection, Model Weight Extraction)"
}

Input Text:
{{input_text}}
`;

export const PLANNER_PROMPT_TEMPLATE = `You are an expert Security Exploit & Verification Planner.
Given the analyzed vulnerability and relevant MITRE ATT&CK / ATLAS techniques, design an attack verification plan for an isolated Docker sandbox test.

Vulnerability Info:
{{vulnerability_json}}

Retrieved Threat Intelligence Techniques:
{{techniques_json}}

Output valid JSON ONLY matching this schema:
{
  "hypothesis": "string explaining what condition proves vulnerability presence",
  "target_environment": "Isolated Container Environment",
  "prerequisites": ["string"],
  "steps": [
    {
      "step_id": 1,
      "title": "string",
      "stage": "RECON" | "EXPLOIT" | "PRIV_ESC" | "PERSIST" | "IMPACT",
      "description": "string",
      "target_component": "string",
      "command_to_run": "string",
      "expected_artifact": "string",
      "status": "PENDING"
    }
  ],
  "mitre_mappings": ["string"]
}
`;

export const GENERATOR_PROMPT_TEMPLATE = `You are an expert Security Engineer and Exploit Automation Specialist.
Your task is to generate a deterministic Python 3 PoC verification script to empirically test for the specified vulnerability in an isolated sandbox environment.

Vulnerability Details:
{{vulnerability_json}}

Attack Hypothesis:
{{hypothesis}}

Target Environment:
{{target_environment}}

Instructions for Explainable PoC Script Synthesis:
1. Write clean, self-contained Python 3 code bounded to the isolated container testbed (target at 172.20.0.3:8080 or 127.0.0.1:8080).
2. Structure the script into 3 distinct, well-commented functions to maximize analyst explainability:
   - \`step_1_recon()\`: Service reachability check, HTTP banner probing, or port availability validation.
   - \`step_2_exploit()\`: Crafting and delivering the specific payload tailored to the vulnerability primitives (e.g. JNDI string, memory payload, prompt injection).
   - \`step_3_verify_artifact()\`: Empirical assertion check verifying state mutation or execution artifact (e.g. proof file in /tmp, process UID, response status).
3. Include informative console logging with status tags:
   - \`[*]\` for informational status
   - \`[+]\` for positive milestone / successful assertion
   - \`[!]\` for warnings or verified exploit triggers
4. Provide the code clearly within a markdown code block (\`\`\`python ... \`\`\`).
`;

export const VERIFIER_PROMPT_TEMPLATE = `You are a Security Verification & Assertion Specialist.
Evaluate the executed commands, terminal stdout/stderr logs, and observed artifacts against the expected attack hypothesis.

Attack Hypothesis:
{{hypothesis}}

Observed Execution & Evidence:
{{evidence_json}}

Output valid JSON ONLY matching this schema:
{
  "is_vulnerable": true | false,
  "confidence_score": float (0.0 to 1.0),
  "summary": "string explaining why the vulnerability is confirmed or refuted",
  "verified_assertions": ["string"],
  "failed_assertions": ["string"]
}
`;

export const REPORTER_PROMPT_TEMPLATE = `You are a Principal Cybersecurity Incident Responder and Threat Intelligence Lead.
Synthesize a comprehensive, executive and technical Security Investigation Report based on the following verified triage telemetry.

Vulnerability Analysis:
{{vulnerability_json}}

Retrieved Threat Intelligence (MITRE ATT&CK & ATLAS):
{{techniques_json}}

Attack Plan & Hypothesis:
{{plan_json}}

PoC Verification Script Used:
{{script_code}}

Dual-Container Telemetry (Attacker & Victim Terminals):
{{terminal_telemetry}}

Observed Evidence & Assertion Verdict:
{{verification_json}}

Write an exhaustive, publication-grade Markdown report containing the following exact sections with deep technical clarity:

# Security Investigation & Empirical Verification Report

## 1. Executive Summary & Threat Landscape
- Incident / CVE identifier and succinct overview.
- Severity rating, CVSS 3.1 score breakdown, and business impact assessment.
- Empirical verification verdict: **CONFIRMED VULNERABLE** or **REFUTED / MITIGATED** with confidence score.

## 2. CVE Root-Cause & Technical Breakdown
- Detailed explanation of what the vulnerability is about and the underlying flaw mechanism.
- Attack vector, complexity, privileges required, and user interaction requirements.
- Affected products, versions, libraries, and components.
- Root-cause exploit primitives and payload execution flow.

## 3. Threat Intelligence & MITRE Framework Mapping
- Provide a detailed markdown table mapping matched MITRE ATT&CK Enterprise and MITRE ATLAS AI Security techniques:
| Technique ID | Technique Name | Matrix (ATT&CK / ATLAS) | Tactic | Mapping Rationale | Detection Opportunity |
- Detail why each technique was correlated based on observed primitives and tokens.

## 4. Empirical Demonstration Methodology & PoC Execution Logic
- Explain the systematic 3-phase verification methodology:
  1. Reconnaissance (\`step_1_recon\`): Service banner probing and port accessibility.
  2. Payload Delivery (\`step_2_exploit\`): Marshaling and transmitting the specific exploit vector.
  3. State Assertion (\`step_3_verify_artifact\`): Verifying deterministic state changes (UID, file tokens, exit codes).
- Include the key verified Python 3 PoC verification script inside a \`\`\`python ... \`\`\` block.

## 5. Dual-Container Sandbox Telemetry & Evidence Analysis
- Provide the console output logs from the Attacker Node (\`sandbox-attacker-node\` @ 172.20.0.2) in a code block.
- Provide the daemon logs from the Victim Target (\`sandbox-victim-target\` @ 172.20.0.3:8080) in a code block.
- Checklist of verified assertions versus failed assertions.

## 6. Comprehensive Mitigation, Containment & Security Hardening
- **Immediate Containment & Patching**: Specific upgrade instructions and version thresholds.
- **Network Segmentation & Egress Control**: Firewall rules, egress port restrictions, and subnet isolation.
- **Application & Runtime Hardening**: Input sanitization, parameterization, unprivileged container execution, dropping Linux capabilities (\`CAP_NET_RAW\`, \`CAP_SYS_ADMIN\`).
- **Detection Engineering & Threat Hunting**:
  - Concrete SIGMA detection rule for anomalous process trees.
  - Concrete Snort / Suricata network inspection signature.
- **Continuous Validation**: Recommendations for automated regression testing and security ledger audits.
`;
