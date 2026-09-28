from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from app.models.asset import AssetCondition

class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("infrastructure_assets.id"), nullable=False)
    inspected_by = Column(String, nullable=False)
    inspection_date = Column(DateTime, default=datetime.utcnow)
    condition = Column(Enum(AssetCondition), nullable=False)
    remarks = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    asset = relationship("InfrastructureAsset", back_populates="inspections")
