from sqlmodel import SQLModel, Field
from typing import List, Optional
from sqlalchemy import Column, JSON

class InspectionReport(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    issue_detected: str
    issue_category: str
    severity: str
    evidence_strength: str
    evidence_reason: str
    visual_evidence: List[str] = Field(sa_column=Column(JSON))
    recommended_action: str
    escalation: str
    data_gaps: List[str] = Field(sa_column=Column(JSON))
    checklist: List[str] = Field(sa_column=Column(JSON))
    timestamp: str  # ISO format timestamp for when the report was created

class Asset(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    asset_type: str
    state: str
    latitude: float
    longitude: float