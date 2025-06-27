from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import enum

class StockStatus(str, enum.Enum):
    IN_STOCK = "in-stock"
    LOW_STOCK = "low-stock"
    OUT_OF_STOCK = "out-of-stock"
    EXPIRED = "expired"
    NEAR_EXPIRY = "near-expiry"

class QualityGrade(str, enum.Enum):
    A = "A"
    B = "B"
    C = "C"

class RawMaterial(Base):
    __tablename__ = "raw_materials"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    quantity = Column(Float, default=0)
    unit = Column(String, nullable=False)
    cost_per_unit = Column(Float, nullable=False)
    reorder_level = Column(Float, nullable=False)
    max_stock_level = Column(Float)
    expiry_date = Column(DateTime)
    batch_number = Column(String, nullable=False)
    status = Column(Enum(StockStatus), default=StockStatus.IN_STOCK)
    location = Column(String)
    wastage = Column(Float, default=0)
    quality_grade = Column(Enum(QualityGrade), default=QualityGrade.A)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"))
    
    supplier = relationship("Supplier", back_populates="raw_materials")
    creator = relationship("User")

class FinishedProduct(Base):
    __tablename__ = "finished_products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    sku = Column(String, unique=True, nullable=False)
    quantity = Column(Float, default=0)
    unit = Column(String, nullable=False)
    cost_price = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)
    category = Column(String)
    expiry_date = Column(DateTime)
    batch_number = Column(String, nullable=False)
    status = Column(Enum(StockStatus), default=StockStatus.IN_STOCK)
    location = Column(String)
    production_cost = Column(Float)
    profit_margin = Column(Float)
    demand_forecast = Column(Float)
    actual_sales = Column(Float, default=0)
    overproduction = Column(Float, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"))
    
    creator = relationship("User")