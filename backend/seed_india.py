from database import SessionLocal
from models import db as db_models
from datetime import datetime, timedelta
import random

def seed_india():
    db = SessionLocal()
    
    # Add Indian Organizations
    indian_orgs = [
        {"id": "org-in-1", "name": "Delhivery Logistics", "type": "Transporter", "region": "India", "trust": 0.90},
        {"id": "org-in-2", "name": "Blue Dart Express", "type": "Transporter", "region": "India", "trust": 0.94},
        {"id": "org-in-3", "name": "Mumbai Port Trust", "type": "Warehouse", "region": "India", "trust": 0.82},
    ]
    
    for org_data in indian_orgs:
        existing = db.query(db_models.Organization).filter(db_models.Organization.id == org_data["id"]).first()
        if not existing:
            db.add(db_models.Organization(
                id=org_data["id"], name=org_data["name"], type=org_data["type"], 
                region=org_data["region"], trust_score=org_data["trust"]))
    
    db.commit()
    print("Indian organizations indexed.")

    # Add Indian Shipments
    indian_shipments = [
        {"id": "RW-IN-001", "origin": "Mumbai Port Trust", "destination": "Nexus Logistics", "status": "In Transit", "tracking": "DEL12345678", "carrier": "delhivery"},
        {"id": "RW-IN-002", "origin": "Apex Manufacturing", "destination": "Delhi Logistics", "status": "In Transit", "tracking": "BD98765432", "carrier": "bluedart"},
        {"id": "RW-IN-003", "origin": "Mumbai Port Trust", "destination": "Bangalore Tech Hub", "status": "Pending", "tracking": "INP00112233", "carrier": "indiapost"},
    ]

    for s_data in indian_shipments:
        existing = db.query(db_models.Shipment).filter(db_models.Shipment.id == s_data["id"]).first()
        if not existing:
            db.add(db_models.Shipment(
                id=s_data["id"],
                origin=s_data["origin"],
                destination=s_data["destination"],
                status=s_data["status"],
                created_at=datetime.utcnow() - timedelta(days=1),
                trust_score=0.95,
                tracking_number=s_data["tracking"],
                carrier=s_data["carrier"],
                # Initial Indian coordinates (Mumbai)
                last_lat=18.9438,
                last_lon=72.8389
            ))
    
    db.commit()
    print("Indian shipments deployed to the weave.")
    db.close()

if __name__ == "__main__":
    seed_india()
