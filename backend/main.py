from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Any, List, Optional, cast
import uvicorn
from models import schemas
from models import db as db_models
from database import get_db, engine, Base
from init_db import init_db

# Initialize database
Base.metadata.create_all(bind=engine)
init_db()

app = FastAPI(title="Real Weave API", description="Cognitive Supply Chain Intelligence Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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


def serialize_scenario(scenario: db_models.FutureScenario) -> schemas.FutureScenario:
    return schemas.FutureScenario(
        id=str(getattr(scenario, "id")),
        name=str(getattr(scenario, "name")),
        description=str(getattr(scenario, "description")),
        probability=float(getattr(scenario, "probability", 0.0) or 0.0),
        impact_score=float(getattr(scenario, "impact_score", 0.0) or 0.0),
        ripple_effects=list(getattr(scenario, "ripple_effects", []) or []),
    )

# ==================== HEALTH CHECK ====================

@app.get("/")
async def root():
    return {"message": "Real Weave API is running", "status": "online", "version": "1.0.0"}

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
    return serialize_shipment(db_shipment)

@app.delete("/shipments/{shipment_id}")
async def delete_shipment(shipment_id: str, db: Session = Depends(get_db)):
    db_shipment = db.query(db_models.Shipment).filter(db_models.Shipment.id == shipment_id).first()
    if not db_shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    db.delete(db_shipment)
    db.commit()
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
    return serialize_anomaly(db_anomaly)

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
    return serialize_scenario(db_scenario)

@app.get("/events", response_model=List[schemas.Event])
async def get_events(shipment_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(db_models.Event)
    if shipment_id:
        query = query.filter(db_models.Event.shipment_id == shipment_id)
    return [serialize_event(event) for event in query.all()]

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
    return schemas.Sentiment(
        label=str(getattr(sentiment, "label", "")),
        score=float(getattr(sentiment, "score", 0.0) or 0.0),
        description=str(getattr(sentiment, "description", ""))
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
