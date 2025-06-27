from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, Enum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import enum

class QCStatus(str, enum.Enum):
    APPROVED = "approved"
    REJECTED = "rejected"
    CONDITIONAL = "conditional"

class QualityControl(Base):
    __tablename__ = "quality_controls"

    id = Column(Integer, primary_key=True, index=True)
    qc_number = Column(String, unique=True, nullable=False)
    batch_number = Column(String, nullable=False)
    product_type = Column(String, nullable=False)  # raw-material or finished-product
    item_id = Column(Integer, nullable=False)
    item_name = Column(String, nullable=False)
    test_date = Column(DateTime, server_default=func.now())
    test_results = Column(JSON)  # Store test results as JSON
    overall_status = Column(Enum(QCStatus), nullable=False)
    inspector = Column(String, nullable=False)
    remarks = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"))
    
    creator = relationship("User")