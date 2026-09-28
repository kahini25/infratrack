from sqlalchemy import Column, Integer, String, Boolean, Enum, DateTime
from datetime import datetime
from app.database import Base
import enum

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    DEPARTMENT_ADMIN = "DEPARTMENT_ADMIN"
    DISTRICT_OFFICER = "DISTRICT_OFFICER"
    FIELD_INSPECTOR = "FIELD_INSPECTOR"
    MAINTENANCE_OFFICER = "MAINTENANCE_OFFICER"
    FINANCE_OFFICER = "FINANCE_OFFICER"
    CONTRACTOR = "CONTRACTOR"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(Enum(UserRole), default=UserRole.FIELD_INSPECTOR)
    department = Column(String, nullable=True)
    district = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
