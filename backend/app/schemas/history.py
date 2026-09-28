from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.asset import AssetStatus

class AssetHistoryResponse(BaseModel):
    id: int
    asset_id: int
    old_status: Optional[AssetStatus] = None
    new_status: AssetStatus
    changed_by: Optional[str] = None
    reason: Optional[str] = None
    remarks: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
