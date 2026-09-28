from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc
from fastapi import HTTPException, status
from app.models import InfrastructureAsset, AssetHistory, Inspection, Maintenance
from app.models.asset import AssetStatus, AssetCondition, AssetType
from app.schemas.asset import AssetCreate, AssetUpdate, StatusChangeRequest
from app.schemas.inspection import InspectionCreate
from app.schemas.maintenance import MaintenanceCreate, MaintenanceUpdate
from datetime import datetime

class AssetService:
    @staticmethod
    def create_asset(db: Session, asset_in: AssetCreate) -> InfrastructureAsset:
        existing = db.query(InfrastructureAsset).filter(
            InfrastructureAsset.asset_code == asset_in.asset_code
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Asset code '{asset_in.asset_code}' already exists"
            )
        
        asset_data = asset_in.model_dump()
        asset = InfrastructureAsset(**asset_data)
        db.add(asset)
        db.commit()
        db.refresh(asset)

        # Record initial history
        history = AssetHistory(
            asset_id=asset.id,
            old_status=None,
            new_status=asset.status,
            changed_by="System",
            reason="Initial Asset Registration",
            remarks="Asset created in system"
        )
        db.add(history)
        db.commit()
        
        return asset

    @staticmethod
    def get_assets(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        department: Optional[str] = None,
        district: Optional[str] = None,
        asset_type: Optional[AssetType] = None,
        status_filter: Optional[AssetStatus] = None,
        condition_filter: Optional[AssetCondition] = None,
        zone: Optional[str] = None,
        search: Optional[str] = None,
        needs_attention: Optional[bool] = None
    ):
        query = db.query(InfrastructureAsset)

        if department:
            query = query.filter(InfrastructureAsset.department.ilike(f"%{department}%"))
        if district:
            query = query.filter(InfrastructureAsset.district.ilike(f"%{district}%"))
        if asset_type:
            query = query.filter(InfrastructureAsset.asset_type == asset_type)
        if status_filter:
            query = query.filter(InfrastructureAsset.status == status_filter)
        if condition_filter:
            query = query.filter(InfrastructureAsset.condition == condition_filter)
        if zone:
            query = query.filter(InfrastructureAsset.zone.ilike(f"%{zone}%"))
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    InfrastructureAsset.name.ilike(search_pattern),
                    InfrastructureAsset.asset_code.ilike(search_pattern),
                    InfrastructureAsset.department.ilike(search_pattern),
                    InfrastructureAsset.district.ilike(search_pattern),
                    InfrastructureAsset.location_address.ilike(search_pattern),
                    InfrastructureAsset.vendor.ilike(search_pattern)
                )
            )

        if needs_attention is not None:
            attention_filter = or_(
                InfrastructureAsset.condition.in_([AssetCondition.POOR, AssetCondition.CRITICAL]),
                InfrastructureAsset.maintenances.any(
                    Maintenance.status.in_(["REPORTED", "ASSIGNED", "IN_PROGRESS"])
                )
            )
            if needs_attention:
                query = query.filter(attention_filter)
            else:
                query = query.filter(~attention_filter)

        return query.order_by(desc(InfrastructureAsset.updated_at)).offset(skip).limit(limit).all()

    @staticmethod
    def get_asset_by_id(db: Session, asset_id: int) -> InfrastructureAsset:
        asset = db.query(InfrastructureAsset).filter(InfrastructureAsset.id == asset_id).first()
        if not asset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Infrastructure asset not found"
            )
        return asset

    @staticmethod
    def update_asset(db: Session, asset_id: int, asset_in: AssetUpdate) -> InfrastructureAsset:
        asset = AssetService.get_asset_by_id(db, asset_id)
        update_data = asset_in.model_dump(exclude_unset=True)

        # Do not allow direct status change via generic update
        if "status" in update_data:
            del update_data["status"]

        for field, value in update_data.items():
            setattr(asset, field, value)
        
        asset.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(asset)
        return asset

    @staticmethod
    def delete_asset(db: Session, asset_id: int):
        asset = AssetService.get_asset_by_id(db, asset_id)
        db.delete(asset)
        db.commit()

    @staticmethod
    def change_status(db: Session, asset_id: int, req: StatusChangeRequest) -> InfrastructureAsset:
        asset = AssetService.get_asset_by_id(db, asset_id)
        old_status = asset.status
        new_status = req.new_status

        if old_status == new_status:
            return asset

        asset.status = new_status
        asset.updated_at = datetime.utcnow()

        history = AssetHistory(
            asset_id=asset.id,
            old_status=old_status,
            new_status=new_status,
            changed_by=req.changed_by or "Operator",
            reason=req.reason,
            remarks=req.remarks
        )

        db.add(history)
        db.commit()
        db.refresh(asset)
        return asset

    @staticmethod
    def get_history(db: Session, asset_id: int):
        AssetService.get_asset_by_id(db, asset_id)
        return db.query(AssetHistory).filter(
            AssetHistory.asset_id == asset_id
        ).order_by(desc(AssetHistory.created_at)).all()

    @staticmethod
    def create_inspection(db: Session, asset_id: int, insp_in: InspectionCreate) -> Inspection:
        asset = AssetService.get_asset_by_id(db, asset_id)
        
        # Update asset condition directly based on inspection
        asset.condition = insp_in.condition
        asset.updated_at = datetime.utcnow()

        inspection = Inspection(
            asset_id=asset.id,
            inspected_by=insp_in.inspected_by,
            inspection_date=insp_in.inspection_date or datetime.utcnow(),
            condition=insp_in.condition,
            remarks=insp_in.remarks
        )
        db.add(inspection)
        db.commit()
        db.refresh(inspection)
        return inspection

    @staticmethod
    def get_inspections(db: Session, asset_id: int):
        AssetService.get_asset_by_id(db, asset_id)
        return db.query(Inspection).filter(
            Inspection.asset_id == asset_id
        ).order_by(desc(Inspection.inspection_date)).all()

    @staticmethod
    def create_maintenance(db: Session, maint_in: MaintenanceCreate) -> Maintenance:
        AssetService.get_asset_by_id(db, maint_in.asset_id)
        maint_data = maint_in.model_dump()
        maintenance = Maintenance(**maint_data)
        db.add(maintenance)
        db.commit()
        db.refresh(maintenance)
        return maintenance

    @staticmethod
    def get_maintenances(db: Session, skip: int = 0, limit: int = 100):
        return db.query(Maintenance).order_by(desc(Maintenance.created_at)).offset(skip).limit(limit).all()

    @staticmethod
    def get_maintenance_by_id(db: Session, maint_id: int) -> Maintenance:
        maint = db.query(Maintenance).filter(Maintenance.id == maint_id).first()
        if not maint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Maintenance record not found"
            )
        return maint

    @staticmethod
    def update_maintenance(db: Session, maint_id: int, maint_in: MaintenanceUpdate) -> Maintenance:
        maint = AssetService.get_maintenance_by_id(db, maint_id)
        update_data = maint_in.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(maint, field, value)
        
        maint.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(maint)
        return maint

    @staticmethod
    def get_dashboard_stats(db: Session, department: str = None, district: str = None):
        base_query = db.query(InfrastructureAsset)
        if department:
            base_query = base_query.filter(InfrastructureAsset.department == department)
        if district:
            base_query = base_query.filter(InfrastructureAsset.district == district)
            
        total_assets = base_query.count()

        # Stats by department
        by_dept_query = db.query(
            InfrastructureAsset.department, func.count(InfrastructureAsset.id)
        )
        if district:
            by_dept_query = by_dept_query.filter(InfrastructureAsset.district == district)
        if department:
            by_dept_query = by_dept_query.filter(InfrastructureAsset.department == department)
        by_dept_query = by_dept_query.group_by(InfrastructureAsset.department).all()
        by_department = {d or "Unassigned": count for d, count in by_dept_query}

        # Stats by district
        by_dist_query = db.query(
            InfrastructureAsset.district, func.count(InfrastructureAsset.id)
        )
        if department:
            by_dist_query = by_dist_query.filter(InfrastructureAsset.department == department)
        if district:
            by_dist_query = by_dist_query.filter(InfrastructureAsset.district == district)
        by_dist_query = by_dist_query.group_by(InfrastructureAsset.district).all()
        by_district = {d or "Unspecified": count for d, count in by_dist_query}

        # Stats by asset_type
        by_type_query = db.query(
            InfrastructureAsset.asset_type, func.count(InfrastructureAsset.id)
        )
        if department:
            by_type_query = by_type_query.filter(InfrastructureAsset.department == department)
        if district:
            by_type_query = by_type_query.filter(InfrastructureAsset.district == district)
        by_type_query = by_type_query.group_by(InfrastructureAsset.asset_type).all()
        by_type = {t.value if hasattr(t, 'value') else str(t): count for t, count in by_type_query}

        # Stats by status
        by_status_query = db.query(
            InfrastructureAsset.status, func.count(InfrastructureAsset.id)
        )
        if department:
            by_status_query = by_status_query.filter(InfrastructureAsset.department == department)
        if district:
            by_status_query = by_status_query.filter(InfrastructureAsset.district == district)
        by_status_query = by_status_query.group_by(InfrastructureAsset.status).all()
        by_status = {s.value if hasattr(s, 'value') else str(s): count for s, count in by_status_query}

        # Stats by condition
        by_condition_query = db.query(
            InfrastructureAsset.condition, func.count(InfrastructureAsset.id)
        )
        if department:
            by_condition_query = by_condition_query.filter(InfrastructureAsset.department == department)
        if district:
            by_condition_query = by_condition_query.filter(InfrastructureAsset.district == district)
        by_condition_query = by_condition_query.group_by(InfrastructureAsset.condition).all()
        by_condition = {c.value if hasattr(c, 'value') else str(c): count for c, count in by_condition_query}

        # Active maintenance cases (REPORTED, ASSIGNED, IN_PROGRESS)
        # Assuming we just do simple count for now for scoped assets
        active_maintenances = db.query(Maintenance).join(InfrastructureAsset)
        if department:
            active_maintenances = active_maintenances.filter(InfrastructureAsset.department == department)
        if district:
            active_maintenances = active_maintenances.filter(InfrastructureAsset.district == district)
        active_maintenances = active_maintenances.filter(
            Maintenance.status.in_(["REPORTED", "ASSIGNED", "IN_PROGRESS"])
        ).count()

        # Critical condition count
        critical_count = base_query.filter(
            InfrastructureAsset.condition == AssetCondition.CRITICAL
        ).count()
        
        # Poor condition count
        poor_count = base_query.filter(
            InfrastructureAsset.condition == AssetCondition.POOR
        ).count()

        # Needs attention unified logic
        attention_filter = or_(
            InfrastructureAsset.condition.in_([AssetCondition.POOR, AssetCondition.CRITICAL]),
            InfrastructureAsset.maintenances.any(
                Maintenance.status.in_(["REPORTED", "ASSIGNED", "IN_PROGRESS"])
            )
        )
        needs_attention_count = base_query.filter(attention_filter).count()

        # Recent inspections
        recent_inspections = db.query(Inspection).order_by(
            desc(Inspection.inspection_date)
        ).limit(5).all()

        # Recent lifecycle changes
        recent_history = db.query(AssetHistory).order_by(
            desc(AssetHistory.created_at)
        ).limit(5).all()

        # Maintenance expenditure
        est_cost_sum = db.query(func.sum(Maintenance.estimated_cost)).scalar() or 0.0
        act_cost_sum = db.query(func.sum(Maintenance.actual_cost)).scalar() or 0.0

        return {
            "total_assets": total_assets,
            "assets_by_department": by_department,
            "assets_by_district": by_district,
            "assets_by_type": by_type,
            "assets_by_asset_type": by_type,
            "assets_by_status": by_status,
            "assets_by_condition": by_condition,
            "active_maintenances": active_maintenances,
            "active_maintenance": active_maintenances,
            "critical_assets": critical_count,
            "poor_condition_assets": poor_count,
            "critical_poor_assets": critical_count + poor_count,
            "needs_attention_count": needs_attention_count,
            "recent_inspections": [
                {
                    "id": i.id,
                    "asset_id": i.asset_id,
                    "inspected_by": i.inspected_by,
                    "condition": i.condition,
                    "inspection_date": i.inspection_date,
                    "remarks": i.remarks
                } for i in recent_inspections
            ],
            "recent_lifecycle_changes": [
                {
                    "id": h.id,
                    "asset_id": h.asset_id,
                    "old_status": h.old_status,
                    "new_status": h.new_status,
                    "changed_by": h.changed_by,
                    "reason": h.reason,
                    "created_at": h.created_at
                } for h in recent_history
            ],
            "maintenance_expenditure": {
                "estimated_total": est_cost_sum,
                "actual_total": act_cost_sum
            }
        }
