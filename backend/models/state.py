from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

from .vulnerability import Vulnerability
from .technique import Technique
from .attack_plan import AttackPlan
from .evidence import VerificationResult, EvidenceEvent

class InvestigationStage(str, Enum):
    INTAKE = "INTAKE"
    ANALYZE = "ANALYZE"
    RETRIEVE = "RETRIEVE"
    PLAN = "PLAN"
    GENERATE_SCRIPT = "GENERATE_SCRIPT"
    SANDBOX = "SANDBOX"
    EXECUTE = "EXECUTE"
    VERIFY = "VERIFY"
    REPORT = "REPORT"
    COMPLETED = "COMPLETED"
    ERROR = "ERROR"

class LogEntry(BaseModel):
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    stage: InvestigationStage
    level: str = "INFO" # INFO, SUCCESS, WARN, ERROR
    message: str

class Investigation(BaseModel):
    id: str
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    source_url: Optional[str] = None
    raw_input_text: str = ""
    model_used: str = "gemma4:e2b"
    current_stage: InvestigationStage = InvestigationStage.INTAKE
    progress: int = 0 # 0 - 100
    vulnerability: Optional[Vulnerability] = None
    techniques: List[Technique] = Field(default_factory=list)
    attack_plan: Optional[AttackPlan] = None
    generated_script: Optional[str] = None
    terminal_output: str = ""
    attacker_logs: str = ""
    victim_logs: str = ""
    evidence_events: List[EvidenceEvent] = Field(default_factory=list)
    verification: Optional[VerificationResult] = None
    report_markdown: Optional[str] = None
    logs: List[LogEntry] = Field(default_factory=list)
    error_message: Optional[str] = None

class CreateInvestigationRequest(BaseModel):
    source_url: Optional[str] = None
    input_text: str
    model: Optional[str] = "gemma4:e2b"
    custom_script: Optional[str] = None
    custom_vulnerability: Optional[Vulnerability] = None

class AnalyzeVulnerabilityRequest(BaseModel):
    input_text: str
    source_url: Optional[str] = None
    model: Optional[str] = "gemma4:e2b"

class CustomizePocRequest(BaseModel):
    current_script: str
    instruction: str
    vulnerability_summary: Optional[str] = None
    blog_text: Optional[str] = None
    cve_url: Optional[str] = None
    model: Optional[str] = "gemma4:e2b"

class ModelInfo(BaseModel):
    id: str
    name: str
    size: Optional[str] = None
    description: Optional[str] = None
    is_default: bool = False

class ReportSummary(BaseModel):
    id: str
    cve_id: Optional[str] = None
    title: str
    severity: str = "HIGH"
    cvss_score: float = 7.5
    verdict: str = "CONFIRMED VULNERABLE"
    confidence_score: float = 0.95
    created_at: str
    model_used: str = "gemma4:e2b"
    summary: str = ""
    report_markdown: str = ""

class BlogQuestionRequest(BaseModel):
    blog_text: str
    question: str
    cve_url: Optional[str] = None
    model: Optional[str] = "gemma4:e2b"

class ScriptGenerateRequest(BaseModel):
    cve_id: Optional[str] = None
    title: Optional[str] = None
    description: str
    blog_text: Optional[str] = None
    target_environment: Optional[str] = "Debian 12 Target Container"
    model: Optional[str] = "gemma4:e2b"

