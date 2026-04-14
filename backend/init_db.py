import random
from datetime import datetime, timedelta
from database import Base, engine, SessionLocal
from models import db as db_models
from models import schemas

def init_db():
    """Create tables and seed initial data"""
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if data already exists
    if db.query(db_models.Organization).first():
        print("Database already initialized")
        if not db.query(db_models.Event).first():
            seeded_events = [
                db_models.Event(
                    id="e1",
                    timestamp=datetime.utcnow() - timedelta(hours=2),
                    type="Scan",
                    location="London",
                    org_id="org-2",
                    value=None,
                    event_metadata={},
                    shipment_id="RW-ERR-01"
                ),
                db_models.Event(
                    id="e2",
                    timestamp=datetime.utcnow() - timedelta(hours=1),
                    type="Scan",
                    location="New York",
                    org_id="org-1",
                    value=None,
                    event_metadata={},
                    shipment_id="RW-ERR-01"
                ),
                db_models.Event(
                    id="e3",
                    timestamp=datetime.utcnow() - timedelta(minutes=45),
                    type="StatusChange",
                    location="Hamburg",
                    org_id="org-4",
                    value=None,
                    event_metadata={"status": "In Transit"},
                    shipment_id="RW-1001"
                ),
            ]

            for event in seeded_events:
                db.add(event)

            db.commit()
            print("Seeded demo events")

        existing_workflows = {workflow.anomaly_id for workflow in db.query(db_models.AnomalyWorkflow).all()}
        for anomaly in db.query(db_models.Anomaly).all():
            if anomaly.id not in existing_workflows:
                db.add(
                    db_models.AnomalyWorkflow(
                        anomaly_id=anomaly.id,
                        status="open",
                        owner="",
                        note="",
                        archived=0,
                    )
                )
        db.commit()

        db.close()
        return
    
    # Create Organizations
    orgs_data = [
        {"id": "org-1", "name": "Nexus Logistics", "type": "Transporter", "region": "North America", "trust": 0.92},
        {"id": "org-2", "name": "Quantum Warehousing", "type": "Warehouse", "region": "Europe", "trust": 0.85},
        {"id": "org-3", "name": "Apex Manufacturing", "type": "Manufacturer", "region": "Asia", "trust": 0.78},
        {"id": "org-4", "name": "Global Freight X", "type": "Transporter", "region": "Global", "trust": 0.65},
        {"id": "org-5", "name": "Silk Road Systems", "type": "Supplier", "region": "Asia", "trust": 0.88},
    ]
    
    for org_data in orgs_data:
        org = db_models.Organization(
            id=org_data["id"],
            name=org_data["name"],
            type=org_data["type"],
            region=org_data["region"],
            trust_score=org_data["trust"]
        )
        db.add(org)
    
    db.commit()
    
    # Create Shipments
    for i in range(1, 11):
        shipment_id = f"RW-{1000 + i}"
        shipment = db_models.Shipment(
            id=shipment_id,
            origin=random.choice(orgs_data)["name"],
            destination=random.choice(orgs_data)["name"],
            status=random.choice(["In Transit", "Delivered", "Delayed", "Pending"]),
            created_at=datetime.utcnow() - timedelta(days=random.randint(1, 10)),
            trust_score=round(random.uniform(0.6, 0.99), 2),
            events=[],
            anomaly_ids=[]
        )
        db.add(shipment)
    
    db.commit()
    
    # Create impossible event shipment with events
    imp_shipment = db_models.Shipment(
        id="RW-ERR-01",
        origin="London Hub",
        destination="New York Port",
        status="In Transit",
        created_at=datetime.utcnow(),
        trust_score=0.15,
        events=[
            {
                "id": "e1",
                "timestamp": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
                "type": "Scan",
                "location": "London",
                "org_id": "org-2",
                "value": None,
                "event_metadata": {}
            },
            {
                "id": "e2",
                "timestamp": (datetime.utcnow() - timedelta(hours=1)).isoformat(),
                "type": "Scan",
                "location": "New York",
                "org_id": "org-1",
                "value": None,
                "event_metadata": {}
            }
        ],
        anomaly_ids=["anom-01"]
    )
    db.add(imp_shipment)
    db.commit()

    # Create Events for the anomaly shipment and a live in-transit shipment
    events = [
        db_models.Event(
            id="e1",
            timestamp=datetime.utcnow() - timedelta(hours=2),
            type="Scan",
            location="London",
            org_id="org-2",
            value=None,
            event_metadata={},
            shipment_id="RW-ERR-01"
        ),
        db_models.Event(
            id="e2",
            timestamp=datetime.utcnow() - timedelta(hours=1),
            type="Scan",
            location="New York",
            org_id="org-1",
            value=None,
            event_metadata={},
            shipment_id="RW-ERR-01"
        ),
        db_models.Event(
            id="e3",
            timestamp=datetime.utcnow() - timedelta(minutes=45),
            type="StatusChange",
            location="Hamburg",
            org_id="org-4",
            value=None,
            event_metadata={"status": "In Transit"},
            shipment_id="RW-1001"
        ),
    ]

    for event in events:
        db.add(event)

    db.commit()
    
    # Create Anomalies
    anomaly = db_models.Anomaly(
        id="anom-01",
        event_ids=["e1", "e2"],
        type="ImpossibleScoring",
        severity=0.95,
        explanation="Shipment scanned in London and New York within 1 hour. Physically impossible travel time.",
        root_causes=["Data Error", "Unauthorized Substitution", "Location Spoofing"],
        confidence=0.99
    )
    db.add(anomaly)
    
    # More anomalies
    for i in range(2, 5):
        anom = db_models.Anomaly(
            id=f"anom-{i:02d}",
            event_ids=[],
            type=random.choice(["TempExcursion", "RouteDeviation", "SubstitutionSuspected"]),
            severity=round(random.uniform(0.5, 0.95), 2),
            explanation=f"Potential anomaly detected in shipment tracking.",
            root_causes=random.sample(["Data Error", "Network Issue", "System Malfunction", "Manual Override"], 2),
            confidence=round(random.uniform(0.7, 0.99), 2)
        )
        db.add(anom)
    
    db.commit()

    for anomaly in db.query(db_models.Anomaly).all():
        db.add(
            db_models.AnomalyWorkflow(
                anomaly_id=anomaly.id,
                status="open",
                owner="",
                note="",
                archived=0,
            )
        )

    db.commit()
    
    # Create Sentiment
    sentiment = db_models.Sentiment(
        id="current",
        label="tense",
        score=0.72,
        description="Global supply chain showing signs of stress due to regional port congestion."
    )
    db.add(sentiment)
    db.commit()
    
    # Create Future Scenarios
    scenarios = [
        {
            "id": "fs-1",
            "name": "Suez Blockage Ripple",
            "description": "A temporary blockage leads to a 20-day backlog in Mediterranean ports.",
            "probability": 0.15,
            "impact_score": 0.88,
            "ripple_effects": ["Fuel price spike", "Empty container shortage", "Component delay in EU manufacturing"]
        },
        {
            "id": "fs-2",
            "name": "AI Routing Strike",
            "description": "Automated port systems face synchronization failure due to cyber anomaly.",
            "probability": 0.08,
            "impact_score": 0.92,
            "ripple_effects": ["Manual fallback delays", "Trust degradation", "Insurance claim spike"]
        }
    ]
    
    for scenario_data in scenarios:
        scenario = db_models.FutureScenario(
            id=scenario_data["id"],
            name=scenario_data["name"],
            description=scenario_data["description"],
            probability=scenario_data["probability"],
            impact_score=scenario_data["impact_score"],
            ripple_effects=scenario_data["ripple_effects"]
        )
        db.add(scenario)
    
    db.commit()
    db.close()
    
    print("Database initialized successfully!")

if __name__ == "__main__":
    init_db()
