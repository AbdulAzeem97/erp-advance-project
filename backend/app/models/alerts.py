from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import enum

class AlertType(str, enum.Enum):
    LOW_STOCK = "low-stock"
    EXPIRY = "expiry"
    OVERSTOCK = "overstock"
    QUALITY = "quality"
    FINANCIAL = "financial"
    PRODUCTION = "production"

class AlertSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(AlertType), nullable=False)
    severity = Column(Enum(AlertSeverity), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    acknowledged = Column(Boolean, default=False)
    acknowledged_by = Column(Integer, ForeignKey("users.id"))
    acknowledged_at = Column(DateTime)
    action_required = Column(Boolean, default=False)
    related_id = Column(String)
    created_at = Column(DateTime, server_default=func.now())
    
    acknowledger = relationship("User")