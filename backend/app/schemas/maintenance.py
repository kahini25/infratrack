from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.maintenance import MaintenancePriority, MaintenanceStatus

class MaintenanceCreate(BaseModel):
    asset_id: int
    issue: str = Field(..., min_length=3, example="Potholes and bitumen wear")
    priority: MaintenancePriority = MaintenancePriority.MEDIUM
    status: MaintenanceStatus = MaintenanceStatus.REPORTED
    reported_by: Optional[str] = Field(None, example="Citizen Hotline / Officer")
    assigned_to: Optional[str] = Field(None, example="Roads Division Team B")
    estimated_cost: Optional[float] = Field(None, ge=0)
    actual_cost: Optional[float] = Field(None, ge=0)
    remarks: Optional[str] = None

class MaintenanceUpdate(BaseModel):
    issue: Optional[str] = None
    priority: Optional[MaintenancePriority] = None
    status: Optional[MaintenanceStatus] = None
    assigned_to: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    estimated_cost: Optional[float] = None
    actual_cost: Optional[float] = None
    remarks: Optional[str] = None

class MaintenanceResponse(BaseModel):
    id: int
    asset_id: int
    issue: str
    priority: MaintenancePriority
    status: MaintenanceStatus
    reported_by: Optional[str] = None
    assigned_to: Optional[str] = None
    reported_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    estimated_cost: Optional[float] = None
    actual_cost: Optional[float] = None
    remarks: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
