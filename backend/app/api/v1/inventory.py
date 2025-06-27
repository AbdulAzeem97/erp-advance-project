from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.inventory import RawMaterial, FinishedProduct
from app.schemas.inventory import (
    RawMaterial as RawMaterialSchema,
    RawMaterialCreate,
    RawMaterialUpdate,
    FinishedProduct as FinishedProductSchema,
    FinishedProductCreate
)

router = APIRouter()

# Raw Materials
@router.get("/raw-materials", response_model=List[RawMaterialSchema])
def get_raw_materials(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    materials = db.query(RawMaterial).offset(skip).limit(limit).all()
    return materials

@router.post("/raw-materials", response_model=RawMaterialSchema)
def create_raw_material(
    material: RawMaterialCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_material = RawMaterial(**material.dict(), created_by=current_user.id)
    db.add(db_material)
    db.commit()
    db.refresh(db_material)
    return db_material

@router.get("/raw-materials/{material_id}", response_model=RawMaterialSchema)
def get_raw_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    material = db.query(RawMaterial).filter(RawMaterial.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Raw material not found")
    return material

@router.put("/raw-materials/{material_id}", response_model=RawMaterialSchema)
def update_raw_material(
    material_id: int,
    material_update: RawMaterialUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    material = db.query(RawMaterial).filter(RawMaterial.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Raw material not found")
    
    update_data = material_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(material, field, value)
    
    db.commit()
    db.refresh(material)
    return material

# Finished Products
@router.get("/finished-products", response_model=List[FinishedProductSchema])
def get_finished_products(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    products = db.query(FinishedProduct).offset(skip).limit(limit).all()
    return products

@router.post("/finished-products", response_model=FinishedProductSchema)
def create_finished_product(
    product: FinishedProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_product = FinishedProduct(**product.dict(), created_by=current_user.id)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.put("/finished-products/{product_id}/stock")
def update_stock(
    product_id: int,
    quantity_change: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(FinishedProduct).filter(FinishedProduct.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product.quantity = max(0, product.quantity + quantity_change)
    db.commit()
    return {"message": "Stock updated successfully", "new_quantity": product.quantity}