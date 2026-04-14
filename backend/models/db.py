from sqlalchemy import Column, String, Float, DateTime, JSON, Integer
from sqlalchemy.sql import func
from database import Base
from datetime import datetime

class Organization(Base):
    __tablename__ = "organizations"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)
    region = Column(String)
    trust_score = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Shipment(Base):
    __tablename__ = "shipments"
    
    id = Column(String, primary_key=True, index=True)
    origin = Column(String)
    destination = Column(String)
    status = Column(String)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    trust_score = Column(Float)
    events = Column(JSON, default=list)
    anomaly_ids = Column(JSON, default=list)

class Event(Base):
    __tablename__ = "events"
    
    id = Column(String, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True))
    type = Column(String)
    location = Column(String)
    org_id = Column(String)
    value = Column(Float, nullable=True)
    event_metadata = Column(JSON, default=dict)
    shipment_id = Column(String)

class Anomaly(Base):
    __tablename__ = "anomalies"
    
    id = Column(String, primary_key=True, index=True)
    event_ids = Column(JSON)
    type = Column(String)
    severity = Column(Float)
    explanation = Column(String)
    root_causes = Column(JSON)
    confidence = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AnomalyWorkflow(Base):
    __tablename__ = "anomaly_workflows"

    anomaly_id = Column(String, primary_key=True, index=True)
    status = Column(String, default="open")
    owner = Column(String, default="")
    note = Column(String, default="")
    archived = Column(Integer, default=0)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Sentiment(Base):
    __tablename__ = "sentiments"
    
    id = Column(String, primary_key=True, index=True, default="current")
    label = Column(String)
    score = Column(Float)
    description = Column(String)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class FutureScenario(Base):
    __tablename__ = "future_scenarios"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)
    probability = Column(Float)
    impact_score = Column(Float)
    ripple_effects = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class DashboardSetting(Base):
    __tablename__ = "dashboard_settings"

    key = Column(String, primary_key=True, index=True)
    value = Column(JSON, default=dict)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class SharedRiskPattern(Base):
    __tablename__ = "shared_risk_patterns"

    id = Column(String, primary_key=True, index=True)
    anomaly_id = Column(String, nullable=True)
    title = Column(String)
    details = Column(String)
    shared_by = Column(String, default="network")
    visibility = Column(String, default="network")
    status = Column(String, default="shared")
    confidence = Column(Float, default=0.0)
    partner_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
