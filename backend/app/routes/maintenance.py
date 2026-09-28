from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.maintenance import MaintenanceCreate, MaintenanceUpdate, MaintenanceResponse
from app.services.asset_service import AssetService
from app.auth.dependencies import get_current_user, require_roles
from app.models.user import User, UserRole

router = APIRouter(prefix="/api/maintenance", tags=["Maintenance Management"])

def verify_asset_access(asset, current_user: User):
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    if current_user.department and asset.department != current_user.department:
        raise HTTPException(status_code=403, detail="Asset outside department scope")
    if current_user.district and asset.district != current_user.district:
        raise HTTPException(status_code=403, detail="Asset outside district scope")
    return asset

@router.get("", response_model=List[MaintenanceResponse], summary="List Maintenance Records")
def get_maintenances(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Depending on role, filter records
    records = AssetService.get_maintenances(db=db, skip=skip, limit=limit)
    # Simple post-filtering based on asset scope (for demo purposes)
    filtered = []
    for r in records:
        asset = AssetService.get_asset_by_id(db=db, asset_id=r.asset_id)
        if asset:
            if current_user.department and asset.department != current_user.department:
                continue
            if current_user.district and asset.district != current_user.district:
                continue
            filtered.append(r)
    return filtered

@router.post("", response_model=MaintenanceResponse, status_code=status.HTTP_201_CREATED, summary="Report Maintenance Issue")
def create_maintenance(
    maint_in: MaintenanceCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.DEPARTMENT_ADMIN, UserRole.DISTRICT_OFFICER]))
):
    asset = AssetService.get_asset_by_id(db=db, asset_id=maint_in.asset_id)
    verify_asset_access(asset, current_user)
    return AssetService.create_maintenance(db=db, maint_in=maint_in)

@router.get("/{maintenance_id}", response_model=MaintenanceResponse, summary="Get Maintenance Details")
def get_maintenance(maintenance_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    maint = AssetService.get_maintenance_by_id(db=db, maint_id=maintenance_id)
    asset = AssetService.get_asset_by_id(db=db, asset_id=maint.asset_id)
    verify_asset_access(asset, current_user)
    return maint

@router.put("/{maintenance_id}", response_model=MaintenanceResponse, summary="Update Maintenance Record")
def update_maintenance(
    maintenance_id: int, 
    maint_in: MaintenanceUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.DEPARTMENT_ADMIN, UserRole.MAINTENANCE_OFFICER, UserRole.CONTRACTOR]))
):
    maint = AssetService.get_maintenance_by_id(db=db, maint_id=maintenance_id)
    asset = AssetService.get_asset_by_id(db=db, asset_id=maint.asset_id)
    verify_asset_access(asset, current_user)
    return AssetService.update_maintenance(db=db, maint_id=maintenance_id, maint_in=maint_in)
