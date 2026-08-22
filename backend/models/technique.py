from typing import List, Optional
from pydantic import BaseModel, Field

class Technique(BaseModel):
    id: str = Field(description="Technique ID (e.g. AML.T0000, T1190, L1.1.1.1)")
    name: str = Field(description="Technique Name")
    tactic_id: Optional[str] = None
    tactic_name: Optional[str] = None
    description: str = ""
    attack_complexity: Optional[str] = None
    privileges_required: Optional[str] = None
    execution_context: List[str] = Field(default_factory=list)
    defenses: List[str] = Field(default_factory=list)
    detection_opportunities: List[str] = Field(default_factory=list)
    exploit_primitives: List[str] = Field(default_factory=list)
    code_patterns: List[str] = Field(default_factory=list)
    related_tools: List[str] = Field(default_factory=list)
    is_atlas: bool = False
    url: Optional[str] = None
    why_retrieved: Optional[str] = Field(default=None, description="Reasoning for mapping this technique to the incident")
    confidence: float = Field(default=0.85, description="Relevance confidence score 0.0 - 1.0")
