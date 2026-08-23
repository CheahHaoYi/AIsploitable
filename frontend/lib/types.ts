export interface ModelInfo {
  id: string;
  name: string;
  size?: string;
  description?: string;
  is_default?: boolean;
  is_local?: boolean;
  provider?: string;
}

export interface Vulnerability {
  cve_id?: string | null;
  title: string;
  summary: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  cvss_score: number;
  attack_vector: string;
  attack_complexity: string;
  privileges_required: string;
  user_interaction: string;
  affected_products: string[];
  exploit_primitives: string[];
  potential_impact: string;
}

export interface Technique {
  id: string;
  name: string;
  tactic_id?: string;
  tactic_name?: string;
  description: string;
  attack_complexity?: string;
  privileges_required?: string;
  execution_context?: string[];
  defenses?: string[];
  detection_opportunities?: string[];
  exploit_primitives?: string[];
  code_patterns?: string[];
  related_tools?: string[];
  is_atlas?: boolean;
  url?: string;
  confidence?: number;
  why_retrieved?: string;
}

export interface PlanStep {
  step_id: number;
  title: string;
  stage: 'RECON' | 'EXPLOIT' | 'PRIV_ESC' | 'PERSIST' | 'IMPACT' | string;
  description: string;
  target_component: string;
  command_to_run?: string;
  expected_artifact?: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'SKIPPED' | string;
}

export interface AttackPlan {
  hypothesis: string;
  target_environment: string;
  prerequisites: string[];
  steps: PlanStep[];
  mitre_mappings: string[];
}

export interface EvidenceEvent {
  id?: string;
  step_id?: number;
  timestamp: string;
  container_name?: string;
  command: string;
  exit_code: number;
  stdout: string;
  stderr?: string;
  observed_artifacts?: string[];
  observed_artifact?: string;
  expected_artifacts?: string[];
  expected_artifact?: string;
  verified?: boolean;
  details?: Record<string, any>;
}

export interface VerificationResult {
  is_vulnerable: boolean;
  confidence_score: number;
  summary: string;
  verified_assertions: string[];
  failed_assertions: string[];
  evidence_events?: EvidenceEvent[];
}

export type StageType =
  | 'INTAKE'
  | 'ANALYZE'
  | 'RETRIEVE'
  | 'PLAN'
  | 'GENERATE_SCRIPT'
  | 'SANDBOX'
  | 'EXECUTE'
  | 'VERIFY'
  | 'REPORT'
  | 'COMPLETED'
  | 'ERROR';

export interface LogEntry {
  timestamp: string;
  stage: StageType;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'WARNING' | 'ERROR';
  message: string;
}

export interface ReportSummary {
  id: string;
  cve_id?: string | null;
  title: string;
  severity: string;
  cvss_score: number;
  verdict: string;
  confidence_score: number;
  created_at: string;
  model_used: string;
  summary: string;
  report_markdown: string;
}

export interface Investigation {
  id: string;
  created_at: string;
  source_url?: string;
  target_cve?: string;
  raw_input_text: string;
  model_used: string;
  current_stage: StageType;
  progress: number;
  vulnerability?: Vulnerability;
  techniques: Technique[];
  attack_plan?: AttackPlan;
  generated_script?: string;
  terminal_output: string;
  attacker_logs?: string;
  victim_logs?: string;
  evidence_events: EvidenceEvent[];
  verification?: VerificationResult;
  report_markdown?: string;
  logs: LogEntry[];
  error_message?: string;
}

export interface ValidateScriptResponse {
  valid?: boolean;
  is_valid?: boolean;
  syntax_valid?: boolean;
  error?: string | null;
  syntax_error?: string | null;
  line?: number | null;
  col?: number | null;
  ast_nodes_count?: number;
  has_target_config?: boolean;
  has_exit_assertions?: boolean;
  warnings?: string[];
  ast_summary?: any;
  guardrails: {
    ast_syntax_valid?: boolean;
    compilation_passed?: boolean;
    sandbox_network_bounded?: boolean;
    verification_structure_intact?: boolean;
    has_main_entrypoint?: boolean;
    has_proper_imports?: boolean;
    [key: string]: any;
  };
  summary?: string;
  cleaned_script?: string;
}

export interface PocCustomizationResult {
  model?: string;
  instruction?: string;
  prompt_sent?: string;
  explanation: string;
  raw_response?: string;
  script?: string;
  customized_script?: string;
  syntax_valid?: boolean;
  ast_diagnostics?: ValidateScriptResponse;
  guardrails?: Record<string, any>;
}
