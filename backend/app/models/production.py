from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, Enum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import enum

class ProductionStatus(str, enum.Enum):
    PLANNED = "planned"
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Production(Base):
    __tablename__ = "productions"

    id = Column(Integer, primary_key=True, index=True)
    production_number = Column(String, unique=True, nullable=False)
    product_id = Column(Integer, ForeignKey("finished_products.id"))
    batch_number = Column(String, nullable=False)
    planned_quantity = Column(Float, nullable=False)
    actual_quantity = Column(Float, default=0)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    status = Column(Enum(ProductionStatus), default=ProductionStatus.PLANNED)
    raw_materials_used = Column(JSON)  # Store materials as JSON
    labor_cost = Column(Float, default=0)
    overhead_cost = Column(Float, default=0)
    total_cost = Column(Float, default=0)
    yield_percentage = Column(Float, default=0)
    quality_grade = Column(String, default="A")
    supervisor = Column(String)
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"))
    
    product = relationship("FinishedProduct")
    creator = relationship("User")