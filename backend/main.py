from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Any, List, Optional, cast
from datetime import datetime, timezone
import asyncio
import uvicorn
import random
from models import schemas
from models import db as db_models
from database import get_db, engine, Base
from init_db import init_db
import os
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
NEWS_API_KEY = os.getenv("NEWS_API_KEY")

# Global News Cache
news_cache = []

# Initialize database logic will be handled in startup_event to avoid blocking uvicorn
# Base.metadata.create_all(bind=engine)
# init_db()

app = FastAPI(title="Real Weave API", description="Cognitive Supply Chain Intelligence Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

live_clients: set[WebSocket] = set()


async def broadcast_live_update(payload: dict[str, Any]) -> None:
    disconnected: list[WebSocket] = []
    for client in live_clients:
        try:
            await client.send_json(payload)
        except Exception:
            disconnected.append(client)

    for client in disconnected:
        live_clients.discard(client)


async def notify_live_update(topic: str, action: str, entity_id: str) -> None:
    await broadcast_live_update(
        {
            "type": "refresh",
            "topic": topic,
            "action": action,
            "entity_id": entity_id,
            "at": datetime.now(timezone.utc).isoformat(),
        }
    )


def serialize_stored_event(stored_event: dict[str, Any]) -> schemas.Event:
    return schemas.Event(
        id=str(stored_event.get("id", "")),
        timestamp=stored_event["timestamp"],
        type=str(stored_event.get("type", "")),
        location=str(stored_event.get("location", "")),
        org_id=str(stored_event.get("org_id", "")),
        value=stored_event.get("value"),
        metadata=dict(stored_event.get("metadata") or stored_event.get("event_metadata") or {}),
    )


def serialize_event(event: db_models.Event) -> schemas.Event:
    return schemas.Event(
        id=str(getattr(event, "id")),
        timestamp=getattr(event, "timestamp"),
        type=str(getattr(event, "type")),
        location=str(getattr(event, "location")),
        org_id=str(getattr(event, "org_id")),
        value=getattr(event, "value"),
        metadata=dict(getattr(event, "event_metadata", {}) or {}),
    )


def serialize_shipment(shipment: db_models.Shipment) -> schemas.Shipment:
    raw_events: list[Any] = list(getattr(shipment, "events", []) or [])
    normalized_events = [serialize_stored_event(cast(dict[str, Any], event)) if isinstance(event, dict) else serialize_event(event) for event in raw_events]

    return schemas.Shipment(
        id=str(getattr(shipment, "id")),
        origin=str(getattr(shipment, "origin")),
        destination=str(getattr(shipment, "destination")),
        status=str(getattr(shipment, "status")),
        created_at=getattr(shipment, "created_at"),
        events=normalized_events,
        anomaly_ids=list(getattr(shipment, "anomaly_ids", []) or []),
        trust_score=float(getattr(shipment, "trust_score", 0.0) or 0.0),
    )


def serialize_anomaly(anomaly: db_models.Anomaly) -> schemas.Anomaly:
    return schemas.Anomaly(
        id=str(getattr(anomaly, "id")),
        event_ids=list(getattr(anomaly, "event_ids", []) or []),
        type=str(getattr(anomaly, "type")),
        severity=float(getattr(anomaly, "severity", 0.0) or 0.0),
        explanation=str(getattr(anomaly, "explanation")),
        root_causes=list(getattr(anomaly, "root_causes", []) or []),
        confidence=float(getattr(anomaly, "confidence", 0.0) or 0.0),
    )


def serialize_organization(organization: db_models.Organization) -> schemas.Organization:
    return schemas.Organization(
        id=str(getattr(organization, "id")),
        name=str(getattr(organization, "name")),
        type=str(getattr(organization, "type")),
        region=str(getattr(organization, "region")),
        trust_score=float(getattr(organization, "trust_score", 0.0) or 0.0),
    )


def serialize_anomaly_workflow(workflow: db_models.AnomalyWorkflow) -> schemas.AnomalyWorkflow:
    return schemas.AnomalyWorkflow(
        anomaly_id=str(getattr(workflow, "anomaly_id")),
        status=str(getattr(workflow, "status", "open") or "open"),
        owner=str(getattr(workflow, "owner", "") or ""),
        note=str(getattr(workflow, "note", "") or ""),
        archived=bool(getattr(workflow, "archived", 0)),
    )


def serialize_scenario(scenario: db_models.FutureScenario) -> schemas.FutureScenario:
    return schemas.FutureScenario(
        id=str(getattr(scenario, "id")),
        name=str(getattr(scenario, "name")),
        description=str(getattr(scenario, "description")),
        probability=float(getattr(scenario, "probability", 0.0) or 0.0),
        impact_score=float(getattr(scenario, "impact_score", 0.0) or 0.0),
        ripple_effects=list(getattr(scenario, "ripple_effects", []) or []),
    )


def serialize_dashboard_setting(setting: db_models.DashboardSetting) -> schemas.DashboardSetting:
    return schemas.DashboardSetting(
        key=str(getattr(setting, "key")),
        value=dict(getattr(setting, "value", {}) or {}),
    )


def serialize_shared_risk_pattern(pattern: db_models.SharedRiskPattern) -> schemas.SharedRiskPattern:
    return schemas.SharedRiskPattern(
        id=str(getattr(pattern, "id")),
        anomaly_id=getattr(pattern, "anomaly_id"),
        title=str(getattr(pattern, "title", "")),
        details=str(getattr(pattern, "details", "")),
        shared_by=str(getattr(pattern, "shared_by", "network") or "network"),
        visibility=str(getattr(pattern, "visibility", "network") or "network"),
        status=str(getattr(pattern, "status", "shared") or "shared"),
        confidence=float(getattr(pattern, "confidence", 0.0) or 0.0),
        partner_count=int(getattr(pattern, "partner_count", 0) or 0),
        created_at=getattr(pattern, "created_at", None),
    )


def serialize_ghost_inventory(item: db_models.GhostInventory) -> schemas.GhostInventory:
    return schemas.GhostInventory(
        id=str(item.id),
        shipment_id=str(item.shipment_id),
        digital_count=int(item.digital_count),
        physical_prob=float(item.physical_prob),
        delta=int(item.delta),
        confidence=float(item.confidence),
        last_scan=item.last_scan
    )


def serialize_negotiation(session: db_models.NegotiationSession) -> schemas.NegotiationSession:
    return schemas.NegotiationSession(
        id=str(session.id),
        anomaly_id=str(session.anomaly_id),
        partner_id=str(session.partner_id),
        status=str(session.status),
        strategy=str(session.strategy),
        history=list(session.history or []),
        updated_at=session.updated_at
    )


def serialize_trust_dna(dna: db_models.TrustDNA) -> schemas.TrustDNA:
    return schemas.TrustDNA(
        org_id=str(dna.org_id),
        punctuality=float(dna.punctuality),
        quality=float(dna.quality),
        disclosure=float(dna.disclosure),
        honesty=float(dna.honesty),
        consistency=float(dna.consistency),
        stability=float(dna.stability)
    )

# ==================== HEALTH CHECK ====================

@app.get("/")
async def root():
    return {"message": "Real Weave API is running", "status": "online", "version": "1.0.0"}


@app.websocket("/ws/live")
async def live_updates_socket(websocket: WebSocket):
    await websocket.accept()
    live_clients.add(websocket)

    try:
        await websocket.send_json(
            {
                "type": "connected",
                "message": "Signal link established with Real-Weave Global Intelligence Relay",
                "at": datetime.now(timezone.utc).isoformat()
            }
        )
        # Keep the connection open indefinitely with a heart-beat
        while True:
            try:
                # Wait for any message from client OR timeout for heartbeat
                await asyncio.wait_for(websocket.receive_text(), timeout=20.0)
            except asyncio.TimeoutError:
                # Send heartbeat if no message received
                await websocket.send_json({"type": "heartbeat", "at": datetime.now(timezone.utc).isoformat()})
            
    except WebSocketDisconnect:
        live_clients.discard(websocket)
    except Exception:
        live_clients.discard(websocket)

# ==================== OVERVIEW ====================

@app.get("/overview")
async def get_overview(db: Session = Depends(get_db)) -> dict[str, Any]:
    organizations = db.query(db_models.Organization).all()
    shipments = db.query(db_models.Shipment).all()
    anomalies = db.query(db_models.Anomaly).all()
    sentiment = db.query(db_models.Sentiment).first()
    
    trust_scores = [float(getattr(organization, "trust_score", 0.0) or 0.0) for organization in organizations]
    trust_avg = sum(trust_scores) / len(trust_scores) if trust_scores else 0.0
    
    return {
        "mood": {
            "label": str(getattr(sentiment, "label", "unknown")) if sentiment else "unknown",
            "score": float(getattr(sentiment, "score", 0.0) or 0.0) if sentiment else 0.0,
            "description": str(getattr(sentiment, "description", "")) if sentiment else ""
        },
        "anomaly_count": len(anomalies),
        "trust_avg": round(trust_avg, 2),
        "active_shipments": len([shipment for shipment in shipments if str(getattr(shipment, "status", "")) == "In Transit"])
    }

# ==================== SHIPMENTS ====================

@app.get("/shipments", response_model=List[schemas.Shipment])
async def get_shipments(db: Session = Depends(get_db)):
    shipments = db.query(db_models.Shipment).all()
    return [serialize_shipment(shipment) for shipment in shipments]

@app.get("/shipments/{shipment_id}", response_model=schemas.Shipment)
async def get_shipment(shipment_id: str, db: Session = Depends(get_db)):
    shipment = db.query(db_models.Shipment).filter(db_models.Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return serialize_shipment(shipment)

@app.post("/shipments", response_model=schemas.Shipment)
async def create_shipment(shipment_data: schemas.Shipment, db: Session = Depends(get_db)):
    db_shipment = db_models.Shipment(
        id=shipment_data.id,
        origin=shipment_data.origin,
        destination=shipment_data.destination,
        status=shipment_data.status,
        created_at=shipment_data.created_at,
        trust_score=shipment_data.trust_score,
        events=shipment_data.events,
        anomaly_ids=shipment_data.anomaly_ids
    )
    db.add(db_shipment)
    db.commit()
    db.refresh(db_shipment)
    await notify_live_update("shipments", "created", str(db_shipment.id))
    return serialize_shipment(db_shipment)

@app.put("/shipments/{shipment_id}", response_model=schemas.Shipment)
async def update_shipment(shipment_id: str, shipment_data: schemas.Shipment, db: Session = Depends(get_db)):
    db_shipment = db.query(db_models.Shipment).filter(db_models.Shipment.id == shipment_id).first()
    if not db_shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    setattr(db_shipment, "origin", shipment_data.origin)
    setattr(db_shipment, "destination", shipment_data.destination)
    setattr(db_shipment, "status", shipment_data.status)
    setattr(db_shipment, "trust_score", shipment_data.trust_score)
    setattr(db_shipment, "events", [event.model_dump() for event in shipment_data.events])
    setattr(db_shipment, "anomaly_ids", shipment_data.anomaly_ids)
    
    db.commit()
    db.refresh(db_shipment)
    await notify_live_update("shipments", "updated", str(db_shipment.id))
    return serialize_shipment(db_shipment)

@app.delete("/shipments/{shipment_id}")
async def delete_shipment(shipment_id: str, db: Session = Depends(get_db)):
    db_shipment = db.query(db_models.Shipment).filter(db_models.Shipment.id == shipment_id).first()
    if not db_shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    db.delete(db_shipment)
    db.commit()
    await notify_live_update("shipments", "deleted", shipment_id)
    return {"message": "Shipment deleted"}

# ==================== ANOMALIES ====================

@app.get("/anomalies", response_model=List[schemas.Anomaly])
async def get_anomalies(db: Session = Depends(get_db)):
    anomalies = db.query(db_models.Anomaly).all()
    return [serialize_anomaly(anomaly) for anomaly in anomalies]

@app.get("/anomalies/{anomaly_id}", response_model=schemas.Anomaly)
async def get_anomaly(anomaly_id: str, db: Session = Depends(get_db)):
    anomaly = db.query(db_models.Anomaly).filter(db_models.Anomaly.id == anomaly_id).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly not found")
    return serialize_anomaly(anomaly)

@app.post("/anomalies", response_model=schemas.Anomaly)
async def create_anomaly(anomaly_data: schemas.Anomaly, db: Session = Depends(get_db)):
    db_anomaly = db_models.Anomaly(
        id=anomaly_data.id,
        event_ids=anomaly_data.event_ids,
        type=anomaly_data.type,
        severity=anomaly_data.severity,
        explanation=anomaly_data.explanation,
        root_causes=anomaly_data.root_causes,
        confidence=anomaly_data.confidence
    )
    db.add(db_anomaly)
    db.commit()
    db.refresh(db_anomaly)
    await notify_live_update("anomalies", "created", str(db_anomaly.id))
    return serialize_anomaly(db_anomaly)

@app.delete("/anomalies/{anomaly_id}")
async def delete_anomaly(anomaly_id: str, db: Session = Depends(get_db)):
    anomaly = db.query(db_models.Anomaly).filter(db_models.Anomaly.id == anomaly_id).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly not found")

    db.delete(anomaly)
    db.commit()
    await notify_live_update("anomalies", "deleted", anomaly_id)
    return {"message": "Anomaly deleted"}


@app.get("/anomaly-workflows", response_model=List[schemas.AnomalyWorkflow])
async def get_anomaly_workflows(db: Session = Depends(get_db)):
    workflows = db.query(db_models.AnomalyWorkflow).all()
    return [serialize_anomaly_workflow(workflow) for workflow in workflows]


@app.get("/anomaly-workflows/{anomaly_id}", response_model=schemas.AnomalyWorkflow)
async def get_anomaly_workflow(anomaly_id: str, db: Session = Depends(get_db)):
    workflow = db.query(db_models.AnomalyWorkflow).filter(db_models.AnomalyWorkflow.anomaly_id == anomaly_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Anomaly workflow not found")
    return serialize_anomaly_workflow(workflow)


@app.put("/anomaly-workflows/{anomaly_id}", response_model=schemas.AnomalyWorkflow)
async def upsert_anomaly_workflow(anomaly_id: str, workflow_data: schemas.AnomalyWorkflow, db: Session = Depends(get_db)):
    anomaly = db.query(db_models.Anomaly).filter(db_models.Anomaly.id == anomaly_id).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly not found")

    workflow = db.query(db_models.AnomalyWorkflow).filter(db_models.AnomalyWorkflow.anomaly_id == anomaly_id).first()
    if not workflow:
        workflow = db_models.AnomalyWorkflow(anomaly_id=anomaly_id)
        db.add(workflow)

    setattr(workflow, "status", workflow_data.status)
    setattr(workflow, "owner", workflow_data.owner)
    setattr(workflow, "note", workflow_data.note)
    setattr(workflow, "archived", 1 if workflow_data.archived else 0)

    db.commit()
    db.refresh(workflow)
    await notify_live_update("anomaly-workflows", "updated", anomaly_id)
    return serialize_anomaly_workflow(workflow)

# ==================== ORGANIZATIONS ====================

@app.get("/organizations", response_model=List[schemas.Organization])
async def get_organizations(db: Session = Depends(get_db)):
    organizations = db.query(db_models.Organization).all()
    return [serialize_organization(organization) for organization in organizations]

@app.get("/organizations/{organization_id}", response_model=schemas.Organization)
async def get_organization(organization_id: str, db: Session = Depends(get_db)):
    organization = db.query(db_models.Organization).filter(db_models.Organization.id == organization_id).first()
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    return serialize_organization(organization)

@app.post("/organizations", response_model=schemas.Organization)
async def create_organization(org_data: schemas.Organization, db: Session = Depends(get_db)):
    db_org = db_models.Organization(
        id=org_data.id,
        name=org_data.name,
        type=org_data.type,
        region=org_data.region,
        trust_score=org_data.trust_score
    )
    db.add(db_org)
    db.commit()
    db.refresh(db_org)
    await notify_live_update("organizations", "created", str(db_org.id))
    return serialize_organization(db_org)

# ==================== FUTURE SCENARIOS ====================

@app.get("/future-scenarios", response_model=List[schemas.FutureScenario])
async def get_scenarios(db: Session = Depends(get_db)):
    scenarios = db.query(db_models.FutureScenario).all()
    return [serialize_scenario(scenario) for scenario in scenarios]

@app.post("/future-scenarios", response_model=schemas.FutureScenario)
async def create_scenario(scenario_data: schemas.FutureScenario, db: Session = Depends(get_db)):
    db_scenario = db_models.FutureScenario(
        id=scenario_data.id,
        name=scenario_data.name,
        description=scenario_data.description,
        probability=scenario_data.probability,
        impact_score=scenario_data.impact_score,
        ripple_effects=scenario_data.ripple_effects
    )
    db.add(db_scenario)
    db.commit()
    db.refresh(db_scenario)
    await notify_live_update("future-scenarios", "created", str(db_scenario.id))
    return serialize_scenario(db_scenario)

@app.put("/future-scenarios/{scenario_id}", response_model=schemas.FutureScenario)
async def update_scenario(scenario_id: str, scenario_data: schemas.FutureScenario, db: Session = Depends(get_db)):
    scenario = db.query(db_models.FutureScenario).filter(db_models.FutureScenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    setattr(scenario, "name", scenario_data.name)
    setattr(scenario, "description", scenario_data.description)
    setattr(scenario, "probability", scenario_data.probability)
    setattr(scenario, "impact_score", scenario_data.impact_score)
    setattr(scenario, "ripple_effects", scenario_data.ripple_effects)

    db.commit()
    db.refresh(scenario)
    await notify_live_update("future-scenarios", "updated", str(scenario.id))
    return serialize_scenario(scenario)

@app.get("/events", response_model=List[schemas.Event])
async def get_events(shipment_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(db_models.Event)
    if shipment_id:
        query = query.filter(db_models.Event.shipment_id == shipment_id)
    return [serialize_event(event) for event in query.all()]

# ==================== DASHBOARD SETTINGS ====================

@app.get("/dashboard-settings", response_model=List[schemas.DashboardSetting])
async def get_dashboard_settings(db: Session = Depends(get_db)):
    settings = db.query(db_models.DashboardSetting).all()
    return [serialize_dashboard_setting(setting) for setting in settings]

@app.get("/dashboard-settings/{setting_key}", response_model=schemas.DashboardSetting)
async def get_dashboard_setting(setting_key: str, db: Session = Depends(get_db)):
    setting = db.query(db_models.DashboardSetting).filter(db_models.DashboardSetting.key == setting_key).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Dashboard setting not found")
    return serialize_dashboard_setting(setting)

@app.put("/dashboard-settings/{setting_key}", response_model=schemas.DashboardSetting)
async def upsert_dashboard_setting(setting_key: str, setting_data: schemas.DashboardSetting, db: Session = Depends(get_db)):
    setting = db.query(db_models.DashboardSetting).filter(db_models.DashboardSetting.key == setting_key).first()
    if not setting:
        setting = db_models.DashboardSetting(key=setting_key, value=setting_data.value)
        db.add(setting)
    else:
        setattr(setting, "value", setting_data.value)

    db.commit()
    db.refresh(setting)
    await notify_live_update("dashboard-settings", "updated", setting_key)
    return serialize_dashboard_setting(setting)

# ==================== SHARED RISK PATTERNS ====================

@app.get("/shared-risk-patterns", response_model=List[schemas.SharedRiskPattern])
async def get_shared_risk_patterns(db: Session = Depends(get_db)):
    patterns = db.query(db_models.SharedRiskPattern).order_by(db_models.SharedRiskPattern.created_at.desc()).all()
    return [serialize_shared_risk_pattern(pattern) for pattern in patterns]


@app.post("/shared-risk-patterns", response_model=schemas.SharedRiskPattern)
async def create_shared_risk_pattern(pattern_data: schemas.SharedRiskPattern, db: Session = Depends(get_db)):
    db_pattern = db_models.SharedRiskPattern(
        id=pattern_data.id,
        anomaly_id=pattern_data.anomaly_id,
        title=pattern_data.title,
        details=pattern_data.details,
        shared_by=pattern_data.shared_by,
        visibility=pattern_data.visibility,
        status=pattern_data.status,
        confidence=pattern_data.confidence,
        partner_count=pattern_data.partner_count,
    )
    db.add(db_pattern)
    db.commit()
    db.refresh(db_pattern)
    await notify_live_update("shared-risk-patterns", "created", str(db_pattern.id))
    return serialize_shared_risk_pattern(db_pattern)


@app.put("/shared-risk-patterns/{pattern_id}", response_model=schemas.SharedRiskPattern)
async def update_shared_risk_pattern(pattern_id: str, pattern_data: schemas.SharedRiskPattern, db: Session = Depends(get_db)):
    pattern = db.query(db_models.SharedRiskPattern).filter(db_models.SharedRiskPattern.id == pattern_id).first()
    if not pattern:
        raise HTTPException(status_code=404, detail="Shared risk pattern not found")

    setattr(pattern, "title", pattern_data.title)
    setattr(pattern, "details", pattern_data.details)
    setattr(pattern, "shared_by", pattern_data.shared_by)
    setattr(pattern, "visibility", pattern_data.visibility)
    setattr(pattern, "status", pattern_data.status)
    setattr(pattern, "confidence", pattern_data.confidence)
    setattr(pattern, "partner_count", pattern_data.partner_count)

    db.commit()
    db.refresh(pattern)
    await notify_live_update("shared-risk-patterns", "updated", str(pattern.id))
    return serialize_shared_risk_pattern(pattern)

# ==================== SENTIMENT ====================

@app.get("/sentiment", response_model=schemas.Sentiment)
async def get_sentiment(db: Session = Depends(get_db)):
    sentiment = db.query(db_models.Sentiment).first()
    if not sentiment:
        raise HTTPException(status_code=404, detail="Sentiment not found")
    return schemas.Sentiment(
        label=str(getattr(sentiment, "label", "")),
        score=float(getattr(sentiment, "score", 0.0) or 0.0),
        description=str(getattr(sentiment, "description", ""))
    )

@app.put("/sentiment")
async def update_sentiment(sentiment_data: schemas.Sentiment, db: Session = Depends(get_db)):
    sentiment = db.query(db_models.Sentiment).first()
    if not sentiment:
        raise HTTPException(status_code=404, detail="Sentiment not found")
    
    setattr(sentiment, "label", sentiment_data.label)
    setattr(sentiment, "score", sentiment_data.score)
    setattr(sentiment, "description", sentiment_data.description)
    
    db.commit()
    db.refresh(sentiment)
    await notify_live_update("sentiment", "updated", "current")
    return schemas.Sentiment(
        label=str(getattr(sentiment, "label", "")),
        score=float(getattr(sentiment, "score", 0.0) or 0.0),
        description=str(getattr(sentiment, "description", ""))
    )

# ==================== GHOST INVENTORY ====================

@app.get("/ghost-inventory", response_model=List[schemas.GhostInventory])
async def get_ghost_inventory(db: Session = Depends(get_db)):
    items = db.query(db_models.GhostInventory).all()
    return [serialize_ghost_inventory(item) for item in items]

@app.post("/ghost-inventory", response_model=schemas.GhostInventory)
async def create_ghost_inventory(item_data: schemas.GhostInventory, db: Session = Depends(get_db)):
    db_item = db_models.GhostInventory(**item_data.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    await notify_live_update("ghost-inventory", "created", str(db_item.id))
    return serialize_ghost_inventory(db_item)

# ==================== NEGOTIATIONS ====================

@app.get("/negotiations", response_model=List[schemas.NegotiationSession])
async def get_negotiations(db: Session = Depends(get_db)):
    sessions = db.query(db_models.NegotiationSession).all()
    return [serialize_negotiation(session) for session in sessions]

@app.post("/negotiations", response_model=schemas.NegotiationSession)
async def create_negotiation(session_data: schemas.NegotiationSession, db: Session = Depends(get_db)):
    db_session = db_models.NegotiationSession(**session_data.model_dump())
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    await notify_live_update("negotiations", "created", str(db_session.id))
    return serialize_negotiation(db_session)

@app.put("/negotiations/{session_id}", response_model=schemas.NegotiationSession)
async def update_negotiation(session_id: str, session_data: schemas.NegotiationSession, db: Session = Depends(get_db)):
    session = db.query(db_models.NegotiationSession).filter(db_models.NegotiationSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Negotiation session not found")
    
    for key, value in session_data.model_dump().items():
        if key != "id":
            setattr(session, key, value)
    
    db.commit()
    db.refresh(session)
    await notify_live_update("negotiations", "updated", session_id)
    return serialize_negotiation(session)

# ==================== TRUST DNA ====================

@app.get("/trust-dna", response_model=List[schemas.TrustDNA])
async def get_all_trust_dna(db: Session = Depends(get_db)):
    dnas = db.query(db_models.TrustDNA).all()
    return [serialize_trust_dna(dna) for dna in dnas]

@app.get("/trust-dna/{org_id}", response_model=schemas.TrustDNA)
async def get_trust_dna(org_id: str, db: Session = Depends(get_db)):
    dna = db.query(db_models.TrustDNA).filter(db_models.TrustDNA.org_id == org_id).first()
    if not dna:
        raise HTTPException(status_code=404, detail="Trust DNA not found")
    return serialize_trust_dna(dna)

@app.post("/trust-dna", response_model=schemas.TrustDNA)
async def create_trust_dna(dna_data: schemas.TrustDNA, db: Session = Depends(get_db)):
    db_dna = db_models.TrustDNA(**dna_data.model_dump())
    db.add(db_dna)
    db.commit()
    db.refresh(db_dna)
    await notify_live_update("trust-dna", "updated", str(db_dna.org_id))
    return serialize_trust_dna(db_dna)

async def fetch_real_news():
    """Fetch actual supply chain news from NewsAPI."""
    global news_cache
    if not NEWS_API_KEY:
        return
    
    try:
        async with httpx.AsyncClient() as client:
            # Query for logistics/supply chain news
            url = f"https://newsapi.org/v2/everything?q=supply+chain+OR+logistics+OR+shipping+port&sortBy=publishedAt&pageSize=10&apiKey={NEWS_API_KEY}"
            response = await client.get(url, timeout=5.0)
            if response.status_code == 200:
                articles = response.json().get("articles", [])
                if articles:
                    news_cache = [
                        {
                            "title": a["title"],
                            "severity": "Critical" if any(k in a["title"].lower() for k in ["strike", "block", "delay", "disrupt", "crisis"]) else "Elevated",
                            "impact": random.randint(20, 50),
                            "source": a["source"]["name"]
                        } for a in articles
                    ]
    except Exception as e:
        print(f"Failed to fetch news: {e}")

async def telemetry_sim_loop():
    """Background task to simulate live telemetry and global intelligence signals."""
    disruption_types = ["Network Congestion", "Consensus Shift", "Digital Twin Sync", "Sensor Recalibration"]
    locations = ["Global Node", "Regional Hub", "Data Center", "Edge Perimeter"]
    
    whisper_patterns = [
        "Observed abnormal latency in APAC customs clearing nodes.",
        "Unconfirmed report of major strike preparations at Mediterranean terminals.",
        "Detected slight temperature variance across all Batch-42 containers in the Atlantic.",
        "Minor consensus drift noticed in Partner Scorecard ledger. Investigating."
    ]
    
    # Initial news fetch
    await fetch_real_news()
    news_index = 0
    fetch_counter = 0

    while True:
        try:
            if live_clients:
                # 1. Telemetry Pulse (Every 5 seconds)
                await broadcast_live_update({
                    "type": "telemetry",
                    "signals": [
                        {"id": "RW-1002", "metric": "GPS", "value": f"{34.05 + random.uniform(-0.02, 0.02):.2f}, {-118.24:.2f}", "status": "Healthy"},
                        {"id": "RW-1005", "metric": "TEMP", "value": f"{4.2 + random.uniform(-0.5, 0.5):.1f}°C", "status": "Warning" if random.random() > 0.8 else "Healthy"},
                        {"id": "RW-1012", "metric": "SHOCK", "value": f"{random.uniform(0.1, 0.8):.2f}G", "status": "Healthy"}
                    ],
                    "at": datetime.now(timezone.utc).isoformat()
                })

                # 2. Global Intelligence Event (Real news if available, fallback to sim)
                if random.random() > 0.6:
                    event_data = None
                    if news_cache:
                        event_data = news_cache[news_index % len(news_cache)]
                        news_index += 1
                    else:
                        event_data = {
                            "title": f"{random.choice(disruption_types)}: {random.choice(locations)}",
                            "severity": random.choice(["Critical", "Elevated", "Stable"]),
                            "impact": random.randint(15, 65),
                            "source": "Predictive AI Engine"
                        }

                    await broadcast_live_update({
                        "type": "intelligence",
                        "event": event_data,
                        "at": datetime.now(timezone.utc).isoformat()
                    })

                # 3. Ghost Inventory Anomaly (Random chance every 10 seconds)
                if random.random() > 0.9:
                    await broadcast_live_update({
                        "type": "refresh",
                        "topic": "ghost-inventory",
                        "action": "created",
                        "entity_id": f"GHOST-{random.randint(100, 999)}",
                        "at": datetime.now(timezone.utc).isoformat()
                    })

                # 4. Anonymous Whisper (Random chance every 5 seconds)
                if random.random() > 0.6:
                    await broadcast_live_update({
                        "type": "whisper",
                        "signal": {
                            "id": f"0x{random.getrandbits(64):x}",
                            "type": "Anonymous Shared Ledger",
                            "origin": "Hidden Peer [SHA256]",
                            "confidence": random.uniform(0.65, 0.98),
                            "details": random.choice(whisper_patterns)
                        },
                        "at": datetime.now(timezone.utc).isoformat()
                    })

                # Refresh news every 12 loops (~60 seconds)
                fetch_counter += 1
                if fetch_counter >= 12:
                    await fetch_real_news()
                    fetch_counter = 0

        except Exception as e:
            print(f"Real-time API error: {e}")
        await asyncio.sleep(5)

@app.on_event("startup")
async def startup_event():
    # Run DB init in a thread to keep the event loop free
    def sync_init():
        Base.metadata.create_all(bind=engine)
        init_db()
    
    # Run heavy IO in background thread without blocking events
    asyncio.create_task(asyncio.to_thread(sync_init))
    
    # Start the real-time simulation loop
    asyncio.create_task(telemetry_sim_loop())

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
