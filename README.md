# Real Weave – Cognitive Supply Chain Intelligence Platform

**"Weaving truth, memory, and foresight into every supply chain."**

Real Weave is a next-generation intelligence platform that goes beyond tracking. It detects logical impossibilities, remembers the full behavioral history of every product, and simulates alternate futures using advanced cognitive forensics.

## Key Modules
- **Impossible Event Detector**: Detects physically impossible scans and behavioral contradictions.
- **Product Memory Capsule**: Visualizes the "life story" and stress profile of every shipment.
- **Future Dreaming Lab**: Runs predictive simulations to identify hidden ripple effects.
- **Whisper Network**: Privacy-preserving risk signature sharing across organizations.
- **Digital Twin of Trust**: A high-level topology modeling trust and fragility in the network.
- **Ghost Inventory Forensics**: Detects the delta between digital records and probable physical reality.
- **Reverse Causality Explorer**: AI-driven root-cause investigator that reasons backward from outcomes.
- **Supplier Trust DNA**: Multi-dimensional behavioral profiling for partners.
- **Adaptive Negotiation Center**: Intelligent operations strategist for recovery recommendations.

## Tech Stack
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Framer Motion, Lucide, Recharts, React Flow.
- **Backend**: Python FastAPI, Pydantic, Uvicorn.

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- Python (v3.9+)

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
python main.py
```
The API will be available at `http://localhost:8000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The application will be available at `http://localhost:3000`.

## Architecture
The platform is built with a clear separation of concerns:
- `/frontend/src/app`: Page-based routing with module-specific intelligence views.
- `/frontend/src/components`: Reusable UI system with futuristic glassmorphic design.
- `/backend/models`: Data entities and Pydantic schemas.
- `/backend/services`: Intelligence engines and seed data generators.
- `/backend/routers`: API endpoints for all cognitive modules.

---
Developed as a world-class, production-grade supply chain intelligence platform.
