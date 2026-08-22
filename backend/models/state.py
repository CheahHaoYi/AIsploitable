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
    terminal_output: str = ""
    evidence_events: List[EvidenceEvent] = Field(default_factory=list)
    verification: Optional[VerificationResult] = None
    report_markdown: Optional[str] = None
    logs: List[LogEntry] = Field(default_factory=list)
    error_message: Optional[str] = None

class CreateInvestigationRequest(BaseModel):
    source_url: Optional[str] = None
    input_text: str
    model: Optional[str] = "gemma4:e2b"

class ModelInfo(BaseModel):
    id: str
    name: str
    size: Optional[str] = None
    description: Optional[str] = None
    is_default: bool = False
