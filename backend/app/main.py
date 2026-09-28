from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
import app.models  # Ensures all models are registered with Base metadata
from app.routes import (
    assets_router,
    inspections_router,
    maintenance_router,
    dashboard_router,
)
from app.routes.auth import router as auth_router

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Infrastructure Asset Management System API",
    description="End-to-end Infrastructure Asset Inventory API to track assets across their lifecycle, inspections, and maintenance.",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(assets_router)
app.include_router(inspections_router)
app.include_router(maintenance_router)
app.include_router(dashboard_router)

@app.get("/", summary="Root Health Check")
def read_root():
    return {
        "system": "Infrastructure Asset Inventory API",
        "status": "Online",
        "docs_url": "/docs"
    }
