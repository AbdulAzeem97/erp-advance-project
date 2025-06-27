from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import enum

class WasteReason(str, enum.Enum):
    EXPIRED = "expired"
    DAMAGED = "damaged"
    CONTAMINATED = "contaminated"
    PRODUCTION_LOSS = "production-loss"
    SPILLAGE = "spillage"
    OTHER = "other"

class WasteRecord(Base):
    __tablename__ = "waste_records"

    id = Column(Integer, primary_key=True, index=True)
    waste_number = Column(String, unique=True, nullable=False)
    item_id = Column(Integer, nullable=False)
    item_name = Column(String, nullable=False)
    item_type = Column(String, nullable=False)  # raw-material or finished-product
    waste_quantity = Column(Float, nullable=False)
    waste_reason = Column(Enum(WasteReason), nullable=False)
    waste_value = Column(Float, nullable=False)
    date = Column(DateTime, server_default=func.now())
    reported_by = Column(String, nullable=False)
    approved = Column(Boolean, default=False)
    approved_by = Column(Integer, ForeignKey("users.id"))
    disposal_method = Column(String)
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"))
    
    approver = relationship("User", foreign_keys=[approved_by])
    creator = relationship("User", foreign_keys=[created_by])