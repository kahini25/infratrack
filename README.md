# InfraTrack: State Infrastructure Management System

InfraTrack is a comprehensive, full-stack infrastructure asset management system designed for government officials, maintenance teams, and contractors to monitor, inspect, and maintain state-wide infrastructure assets.

## 🚀 Features
- **Geospatial Dashboard**: Live Leaflet-based interactive maps displaying all state infrastructure assets.
- **Needs Attention AI Engine**: Automatically flags infrastructure assets based on poor/critical conditions or unresolved high-priority maintenance requests.
- **Role-Based Access Control (RBAC)**: Secure access tailored to Super Admins, District Officers, Finance Desk, and Field Inspectors.
- **Asset Lifecycle Tracking**: Full tracking of assets from procurement to retirement, including complete historical logs of inspections and maintenance.
- **RESTful API**: Fast and scalable backend powered by Python FastAPI.

## 🛠 Tech Stack
### Frontend
- React (Vite)
- Tailwind CSS
- Axios & React Router

### Backend
- Python FastAPI
- SQLAlchemy ORM
- Pydantic
- SQLite (Local) / PostgreSQL (Production)
- JWT Authentication (Bcrypt + Passlib)

## 📦 Local Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kahini25/infratrack.git
   cd infratrack
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   python -m venv venv
   source venv/Scripts/activate  # Or venv/bin/activate on Mac/Linux
   pip install -r requirements.txt
   
   # Run the seed script to populate demo data
   python seed.py
   
   # Start the API server
   uvicorn app.main:app --reload
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

## 🌐 Deployment
This project is configured for seamless deployment:
- **Frontend**: Ready for **Vercel** (`vercel.json` included for routing).
- **Backend**: Ready for **Render** Web Services (Free Tier).

## 🔑 Demo Accounts
- **Super Admin**: `super.admin@infratrack.demo`
- **District Officer**: `ahmedabad.officer@infratrack.demo`
- **Maintenance**: `maintenance@infratrack.demo`
- **Finance**: `finance@infratrack.demo`
- **Password (for all)**: `Demo@123`
