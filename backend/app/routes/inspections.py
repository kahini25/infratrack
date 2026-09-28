from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.inspection import InspectionCreate, InspectionResponse
from app.services.asset_service import AssetService
from app.auth.dependencies import get_current_user, require_roles
from app.models.user import User, UserRole

router = APIRouter(prefix="/api/assets", tags=["Inspections"])

def verify_asset_access(asset, current_user: User):
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    if current_user.department and asset.department != current_user.department:
        raise HTTPException(status_code=403, detail="Asset outside department scope")
    if current_user.district and asset.district != current_user.district:
        raise HTTPException(status_code=403, detail="Asset outside district scope")
    return asset

@router.get("/{asset_id}/inspections", response_model=List[InspectionResponse], summary="Get Asset Inspection History")
def get_inspections(asset_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    asset = AssetService.get_asset_by_id(db=db, asset_id=asset_id)
    verify_asset_access(asset, current_user)
    return AssetService.get_inspections(db=db, asset_id=asset_id)

@router.post("/{asset_id}/inspections", response_model=InspectionResponse, status_code=status.HTTP_201_CREATED, summary="Log Asset Inspection")
def create_inspection(
    asset_id: int, 
    insp_in: InspectionCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.DEPARTMENT_ADMIN, UserRole.DISTRICT_OFFICER, UserRole.FIELD_INSPECTOR]))
):
    asset = AssetService.get_asset_by_id(db=db, asset_id=asset_id)
    verify_asset_access(asset, current_user)
    return AssetService.create_inspection(db=db, asset_id=asset_id, insp_in=insp_in)
