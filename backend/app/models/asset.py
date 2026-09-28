from sqlalchemy import Column, Integer, String, Text, Float, Date, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from app.database import Base

class AssetType(str, enum.Enum):
    ROAD = "ROAD"
    BRIDGE = "BRIDGE"
    GOVERNMENT_BUILDING = "GOVERNMENT_BUILDING"
    SCHOOL = "SCHOOL"
    HOSPITAL = "HOSPITAL"
    STREETLIGHT = "STREETLIGHT"
    TRAFFIC_SIGNAL = "TRAFFIC_SIGNAL"
    WATER_PIPELINE = "WATER_PIPELINE"
    CCTV = "CCTV"
    PUBLIC_FACILITY = "PUBLIC_FACILITY"
    OTHER = "OTHER"

class AssetStatus(str, enum.Enum):
    PLANNED = "PLANNED"
    PROCURED = "PROCURED"
    UNDER_CONSTRUCTION = "UNDER_CONSTRUCTION"
    ACTIVE = "ACTIVE"
    UNDER_MAINTENANCE = "UNDER_MAINTENANCE"
    RETIRED = "RETIRED"
    DISPOSED = "DISPOSED"

class AssetCondition(str, enum.Enum):
    EXCELLENT = "EXCELLENT"
    GOOD = "GOOD"
    FAIR = "FAIR"
    POOR = "POOR"
    CRITICAL = "CRITICAL"

class InfrastructureAsset(Base):
    __tablename__ = "infrastructure_assets"

    id = Column(Integer, primary_key=True, index=True)
    asset_code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    asset_type = Column(Enum(AssetType), index=True, nullable=False)
    description = Column(Text)
    department = Column(String, index=True)
    state = Column(String, default="Gujarat", index=True, nullable=False)
    district = Column(String, index=True)
    location_address = Column(String)
    zone = Column(String, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    status = Column(Enum(AssetStatus), index=True, default=AssetStatus.PLANNED, nullable=False)
    condition = Column(Enum(AssetCondition), index=True, default=AssetCondition.GOOD, nullable=False)
    installation_date = Column(Date)
    acquisition_cost = Column(Float)
    vendor = Column(String)
    warranty_expiry = Column(Date)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    histories = relationship("AssetHistory", back_populates="asset", cascade="all, delete-orphan")
    inspections = relationship("Inspection", back_populates="asset", cascade="all, delete-orphan")
    maintenances = relationship("Maintenance", back_populates="asset", cascade="all, delete-orphan")

    @property
    def attention_reasons(self) -> list[str]:
        reasons = []
        if self.condition == AssetCondition.CRITICAL:
            reasons.append("Critical condition")
        elif self.condition == AssetCondition.POOR:
            reasons.append("Poor condition")
            
        for m in self.maintenances:
            if m.status in ["REPORTED", "ASSIGNED", "IN_PROGRESS"]:
                if m.priority == "CRITICAL" and "Critical priority maintenance" not in reasons:
                    reasons.append("Critical priority maintenance")
                elif m.priority == "HIGH" and "High priority maintenance" not in reasons:
                    reasons.append("High priority maintenance")
                    
                if m.status == "REPORTED" and "Maintenance reported" not in reasons:
                    reasons.append("Maintenance reported")
                elif m.status == "ASSIGNED" and "Maintenance assigned" not in reasons:
                    reasons.append("Maintenance assigned")
                elif m.status == "IN_PROGRESS" and "Maintenance in progress" not in reasons:
                    reasons.append("Maintenance in progress")
                    
        return reasons

    @property
    def needs_attention(self) -> bool:
        return len(self.attention_reasons) > 0
