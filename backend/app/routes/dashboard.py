from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.asset_service import AssetService
from app.auth.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard & Statistics"])

@router.get("/stats", summary="Get Dashboard Overview & Asset Statistics")
def get_dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    department = current_user.department
    district = current_user.district
    return AssetService.get_dashboard_stats(db=db, department=department, district=district)
