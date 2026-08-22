from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class EvidenceEvent(BaseModel):
    id: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    container_name: str
    command: str
    exit_code: int
    stdout: str
    stderr: str = ""
    observed_artifacts: List[str] = Field(default_factory=list)
    expected_artifacts: List[str] = Field(default_factory=list)
    verified: bool = False
    details: Optional[Dict[str, Any]] = None

class VerificationResult(BaseModel):
    is_vulnerable: bool = False
    confidence_score: float = Field(default=0.0, description="0.0 - 1.0 confidence score")
    summary: str = ""
    verified_assertions: List[str] = Field(default_factory=list)
    failed_assertions: List[str] = Field(default_factory=list)
    evidence_events: List[EvidenceEvent] = Field(default_factory=list)
