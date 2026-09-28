from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import date, datetime
from app.models.asset import AssetType, AssetStatus, AssetCondition

class AssetBase(BaseModel):
    asset_code: str = Field(..., min_length=2, max_length=50, example="RD-AHM-001")
    name: str = Field(..., min_length=2, max_length=150, example="SG Highway Section 1")
    asset_type: AssetType
    description: Optional[str] = None
    department: Optional[str] = Field(None, example="Public Works Department")
    district: Optional[str] = Field(None, example="Ahmedabad")
    location_address: Optional[str] = Field(None, example="S.G. Highway, Ahmedabad")
    zone: Optional[str] = Field(None, example="WEST_ZONE")
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    status: AssetStatus = AssetStatus.PLANNED
    condition: AssetCondition = AssetCondition.GOOD
    installation_date: Optional[date] = None
    acquisition_cost: Optional[float] = Field(None, ge=0)
    vendor: Optional[str] = None
    warranty_expiry: Optional[date] = None

class AssetCreate(AssetBase):
    pass

class AssetUpdate(BaseModel):
    name: Optional[str] = None
    asset_type: Optional[AssetType] = None
    description: Optional[str] = None
    department: Optional[str] = None
    district: Optional[str] = None
    location_address: Optional[str] = None
    zone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: Optional[AssetStatus] = None
    condition: Optional[AssetCondition] = None
    installation_date: Optional[date] = None
    acquisition_cost: Optional[float] = None
    vendor: Optional[str] = None
    warranty_expiry: Optional[date] = None

class StatusChangeRequest(BaseModel):
    new_status: AssetStatus
    reason: Optional[str] = Field(None, example="Scheduled resurfacing")
    changed_by: Optional[str] = Field(None, example="Field Engineer")
    remarks: Optional[str] = None

class AssetResponse(AssetBase):
    id: int
    created_at: datetime
    updated_at: datetime
    needs_attention: Optional[bool] = None
    attention_reasons: Optional[list[str]] = None

    class Config:
        from_attributes = True
