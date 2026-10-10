from pydantic import BaseModel
from typing import List, Optional

class AnalyzeRequest(BaseModel):
    images: List[str]
    note: str
    asset: str
    coordinates: Optional[dict] = None
    water_level: Optional[str] = None

class AnalyzeResponse(BaseModel):
    issue_detected: str
    issue_category: str
    severity: str
    evidence_strength: str
    evidence_reason: str
    visual_evidence: List[str]
    recommended_action: str
    escalation: str
    data_gaps: List[str]
    checklist: List[str]

class CompareRequest(BaseModel):
    old_image: str
    new_image: str
    old_note: str
    new_note: str

class CompareResponse(BaseModel):
    change_detected: bool
    change_summary: str
    changes: List[dict]
    updated_severity: str
    recommended_action: str