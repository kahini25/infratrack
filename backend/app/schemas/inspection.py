from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.asset import AssetCondition

class InspectionCreate(BaseModel):
    inspected_by: str = Field(..., min_length=2, example="Inspector Rajesh Patel")
    condition: AssetCondition
    remarks: Optional[str] = None
    inspection_date: Optional[datetime] = None

class InspectionResponse(BaseModel):
    id: int
    asset_id: int
    inspected_by: str
    inspection_date: datetime
    condition: AssetCondition
    remarks: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
