from typing import List, Optional
from pydantic import BaseModel, Field

class PlanStep(BaseModel):
    step_id: int
    title: str
    stage: str = Field(description="e.g. RECON, EXPLOIT, PRIV_ESC, PERSIST, IMPACT")
    description: str
    target_component: str
    command_to_run: Optional[str] = None
    expected_artifact: Optional[str] = None
    status: str = Field(default="PENDING", description="PENDING, RUNNING, SUCCESS, FAILED, SKIPPED")

class AttackPlan(BaseModel):
    hypothesis: str = Field(description="Security hypothesis being verified in the sandbox")
    target_environment: str = Field(default="Isolated Docker Container Lab", description="Target container setup")
    prerequisites: List[str] = Field(default_factory=list)
    steps: List[PlanStep] = Field(default_factory=list)
    mitre_mappings: List[str] = Field(default_factory=list)
