from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.inventory import StockStatus, QualityGrade

class RawMaterialBase(BaseModel):
    name: str
    supplier_id: int
    quantity: float
    unit: str
    cost_per_unit: float
    reorder_level: float
    max_stock_level: Optional[float] = None
    expiry_date: Optional[datetime] = None
    batch_number: str
    location: Optional[str] = None
    quality_grade: QualityGrade = QualityGrade.A

class RawMaterialCreate(RawMaterialBase):
    pass

class RawMaterialUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[float] = None
    cost_per_unit: Optional[float] = None
    reorder_level: Optional[float] = None
    location: Optional[str] = None

class RawMaterial(RawMaterialBase):
    id: int
    status: StockStatus
    wastage: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class FinishedProductBase(BaseModel):
    name: str
    sku: str
    quantity: float
    unit: str
    cost_price: float
    selling_price: float
    category: Optional[str] = None
    expiry_date: Optional[datetime] = None
    batch_number: str
    location: Optional[str] = None

class FinishedProductCreate(FinishedProductBase):
    pass

class FinishedProduct(FinishedProductBase):
    id: int
    status: StockStatus
    production_cost: Optional[float] = None
    profit_margin: Optional[float] = None
    demand_forecast: Optional[float] = None
    actual_sales: float
    overproduction: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True