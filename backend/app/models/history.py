from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from app.models.asset import AssetStatus

class AssetHistory(Base):
    __tablename__ = "asset_histories"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("infrastructure_assets.id"), nullable=False)
    old_status = Column(Enum(AssetStatus), nullable=True)
    new_status = Column(Enum(AssetStatus), nullable=False)
    changed_by = Column(String)
    reason = Column(String)
    remarks = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    asset = relationship("InfrastructureAsset", back_populates="histories")
