from pydantic import BaseModel, Field
from typing import List, Optional, Dict
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

class TrustDNA(BaseModel):
    org_id: str
    punctuality: float
    quality: float
    disclosure: float
    honesty: float
    consistency: float
    stability: float
