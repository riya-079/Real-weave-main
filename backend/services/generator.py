import random
from datetime import datetime, timedelta
from typing import List, Dict
from models import schemas

ORGS = [
    {"id": "org-1", "name": "Nexus Logistics", "type": "Transporter", "region": "North America", "trust": 0.92},
    {"id": "org-2", "name": "Quantum Warehousing", "type": "Warehouse", "region": "Europe", "trust": 0.85},
    {"id": "org-3", "name": "Apex Manufacturing", "type": "Manufacturer", "region": "Asia", "trust": 0.78},
    {"id": "org-4", "name": "Global Freight X", "type": "Transporter", "region": "Global", "trust": 0.65},
    {"id": "org-5", "name": "Silk Road Systems", "type": "Supplier", "region": "Asia", "trust": 0.88},
]

MOODS = ["calm", "stable", "tense", "fragile", "deceptive", "unstable", "overheating", "panic-prone", "exhausted"]

def generate_demo_data():
    organizations = [schemas.Organization(**org, trust_score=org["trust"]) for org in ORGS]
    
    shipments = []
    for i in range(1, 11):
        shipment_id = f"RW-{1000 + i}"
        shipments.append(schemas.Shipment(
            id=shipment_id,
            origin=random.choice(ORGS)["name"],
            destination=random.choice(ORGS)["name"],
            status=random.choice(["In Transit", "Delivered", "Delayed", "Pending"]),
            created_at=datetime.now() - timedelta(days=random.randint(1, 10)),
            trust_score=round(random.uniform(0.6, 0.99), 2)
        ))
        
    # Special case: Impossible Event
    imp_shipment = shipments[0]
    imp_shipment.id = "RW-ERR-01"
    imp_shipment.events = [
        schemas.Event(id="e1", timestamp=datetime.now() - timedelta(hours=2), type="Scan", location="London", org_id="org-2"),
        schemas.Event(id="e2", timestamp=datetime.now() - timedelta(hours=1), type="Scan", location="New York", org_id="org-1")
    ]
    
    anomalies = [
        schemas.Anomaly(
            id="anom-01",
            event_ids=["e1", "e2"],
            type="ImpossibleScoring",
            severity=0.95,
            explanation="Shipment scanned in London and New York within 1 hour. Physically impossible travel time.",
            root_causes=["Data Error", "Unauthorized Substitution", "Location Spoofing"],
            confidence=0.99
        )
    ]
    
    return {
        "organizations": organizations,
        "shipments": shipments,
        "anomalies": anomalies,
        "mood": schemas.Sentiment(
            label="tense",
            score=0.72,
            description="Global supply chain showing signs of stress due to regional port congestion."
        )
    }
