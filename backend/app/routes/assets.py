from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.asset import AssetCreate, AssetUpdate, StatusChangeRequest, AssetResponse
from app.schemas.history import AssetHistoryResponse
from app.models.asset import AssetType, AssetStatus, AssetCondition
from app.services.asset_service import AssetService
from app.auth.dependencies import get_current_user, require_roles
from app.models.user import User, UserRole

router = APIRouter(prefix="/api/assets", tags=["Infrastructure Assets"])

@router.get("", response_model=List[AssetResponse], summary="List & Filter Infrastructure Assets")
def get_assets(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    department: Optional[str] = Query(None, description="Filter by department"),
    district: Optional[str] = Query(None, description="Filter by district (e.g. Ahmedabad, Gandhinagar)"),
    asset_type: Optional[AssetType] = Query(None, description="Filter by asset type"),
    status: Optional[AssetStatus] = Query(None, description="Filter by status"),
    condition: Optional[AssetCondition] = Query(None, description="Filter by condition"),
    zone: Optional[str] = Query(None, description="Filter by zone"),
    search: Optional[str] = Query(None, description="Search keyword in code, name, department, district, address, vendor"),
    needs_attention: Optional[bool] = Query(None, description="Filter by assets needing attention"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Enforce data scope
    if current_user.department:
        department = current_user.department
    if current_user.district:
        district = current_user.district

    return AssetService.get_assets(
        db=db,
        skip=skip,
        limit=limit,
        department=department,
        district=district,
        asset_type=asset_type,
        status_filter=status,
        condition_filter=condition,
        zone=zone,
        search=search,
        needs_attention=needs_attention
    )

@router.post("", response_model=AssetResponse, status_code=status.HTTP_201_CREATED, summary="Register New Infrastructure Asset")
def create_asset(
    asset_in: AssetCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.DEPARTMENT_ADMIN, UserRole.DISTRICT_OFFICER]))
):
    if current_user.department and asset_in.department != current_user.department:
        raise HTTPException(status_code=403, detail="Cannot create asset outside your department")
    if current_user.district and asset_in.district != current_user.district:
        raise HTTPException(status_code=403, detail="Cannot create asset outside your district")
    
    return AssetService.create_asset(db=db, asset_in=asset_in)

def verify_asset_access(asset, current_user: User):
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    if current_user.department and asset.department != current_user.department:
        raise HTTPException(status_code=403, detail="Asset outside department scope")
    if current_user.district and asset.district != current_user.district:
        raise HTTPException(status_code=403, detail="Asset outside district scope")
    return asset

@router.get("/{asset_id}", response_model=AssetResponse, summary="Get Infrastructure Asset Details")
def get_asset(asset_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    asset = AssetService.get_asset_by_id(db=db, asset_id=asset_id)
    return verify_asset_access(asset, current_user)

@router.put("/{asset_id}", response_model=AssetResponse, summary="Update Infrastructure Asset Details")
def update_asset(
    asset_id: int, 
    asset_in: AssetUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.DEPARTMENT_ADMIN, UserRole.DISTRICT_OFFICER]))
):
    asset = AssetService.get_asset_by_id(db=db, asset_id=asset_id)
    verify_asset_access(asset, current_user)
    return AssetService.update_asset(db=db, asset_id=asset_id, asset_in=asset_in)

@router.delete("/{asset_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Infrastructure Asset")
def delete_asset(
    asset_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN]))
):
    asset = AssetService.get_asset_by_id(db=db, asset_id=asset_id)
    verify_asset_access(asset, current_user)
    AssetService.delete_asset(db=db, asset_id=asset_id)

@router.post("/{asset_id}/status", response_model=AssetResponse, summary="Update Lifecycle Status & Log History")
def change_asset_status(
    asset_id: int, 
    req: StatusChangeRequest, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.DEPARTMENT_ADMIN, UserRole.DISTRICT_OFFICER, UserRole.FIELD_INSPECTOR, UserRole.MAINTENANCE_OFFICER]))
):
    asset = AssetService.get_asset_by_id(db=db, asset_id=asset_id)
    verify_asset_access(asset, current_user)
    return AssetService.change_status(db=db, asset_id=asset_id, req=req)

@router.get("/{asset_id}/history", response_model=List[AssetHistoryResponse], summary="Get Asset Lifecycle Audit History")
def get_asset_history(asset_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    asset = AssetService.get_asset_by_id(db=db, asset_id=asset_id)
    verify_asset_access(asset, current_user)
    return AssetService.get_history(db=db, asset_id=asset_id)
