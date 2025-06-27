from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    contact = Column(String)
    email = Column(String)
    address = Column(Text)
    city = Column(String)
    payment_terms = Column(String)
    rating = Column(Float, default=0)
    total_orders = Column(Integer, default=0)
    on_time_deliveries = Column(Integer, default=0)
    quality_score = Column(Float, default=0)
    credit_limit = Column(Float, default=0)
    outstanding_amount = Column(Float, default=0)
    ntn = Column(String)  # National Tax Number (Pakistan)
    strn = Column(String)  # Sales Tax Registration Number (Pakistan)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    raw_materials = relationship("RawMaterial", back_populates="supplier")
    purchase_orders = relationship("PurchaseOrder", back_populates="supplier")