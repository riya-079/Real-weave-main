from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional
from datetime import datetime

class Organization(BaseModel):
    id: str
    name: str
    type: str  # Supplier, Warehouse, Transporter, Manufacturer
    region: str
    trust_score: float

class Sentiment(BaseModel):
    label: str  # calm, stable, tense, fragile, deceptive, unstable, overheating, panic-prone, exhausted
    score: float
    description: str

class Event(BaseModel):
    id: str
    timestamp: datetime
    type: str  # Scan, Temp, Shock, Location, StatusChange
    location: str
    org_id: str
    value: Optional[float] = None
    metadata: Dict[str, str] = Field(default_factory=dict)

class Anomaly(BaseModel):
    id: str
    event_ids: List[str]
    type: str  # ImpossibleScoring, TempExcursion, RouteDeviation, SubstitutionSuspected
    severity: float
    explanation: str
    root_causes: List[str]
    confidence: float


class AnomalyWorkflow(BaseModel):
    anomaly_id: str
    status: str = "open"
    owner: str = ""
    note: str = ""
    archived: bool = False

class Shipment(BaseModel):
    id: str
    origin: str
    destination: str
    status: str
    created_at: datetime
    events: List[Event] = Field(default_factory=list)
    anomaly_ids: List[str] = Field(default_factory=list)
    trust_score: float

class FutureScenario(BaseModel):
    id: str
    name: str
    description: str
    probability: float
    impact_score: float
    ripple_effects: List[str] = Field(default_factory=list)

class DashboardSetting(BaseModel):
    key: str
    value: Dict[str, Any] = Field(default_factory=dict)


class SharedRiskPattern(BaseModel):
    id: str
    anomaly_id: Optional[str] = None
    title: str
    details: str
    shared_by: str = "network"
    visibility: str = "network"
    status: str = "shared"
    confidence: float = 0.0
    partner_count: int = 0
    created_at: Optional[datetime] = None

class TrustDNA(BaseModel):
    org_id: str
    punctuality: float
    quality: float
    disclosure: float
    honesty: float
    consistency: float
    stability: float

class GhostInventory(BaseModel):
    id: str
    shipment_id: str
    digital_count: int
    physical_prob: float
    delta: int
    confidence: float
    last_scan: datetime

class NegotiationSession(BaseModel):
    id: str
    anomaly_id: str
    partner_id: str
    status: str
    strategy: str
    history: List[Dict[str, Any]] = Field(default_factory=list)
    updated_at: Optional[datetime] = None
