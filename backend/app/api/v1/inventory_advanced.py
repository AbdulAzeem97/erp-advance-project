from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.inventory import RawMaterial, FinishedProduct
from app.models.production import Production
from app.models.waste import WasteRecord
from typing import List, Optional
import pandas as pd
import io
from datetime import datetime, date, timedelta

router = APIRouter()

@router.post("/bulk-import/raw-materials")
async def bulk_import_raw_materials(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Bulk import raw materials from CSV/Excel file"""
    
    if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="File must be CSV or Excel format")
    
    try:
        # Read file content
        content = await file.read()
        
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        else:
            df = pd.read_excel(io.BytesIO(content))
        
        # Validate required columns
        required_columns = ['name', 'supplier', 'quantity', 'unit', 'cost_per_unit', 'reorder_level', 'batch_number']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required columns: {', '.join(missing_columns)}"
            )
        
        # Process and validate data
        imported_materials = []
        errors = []
        
        for index, row in df.iterrows():
            try:
                # Validate data
                if pd.isna(row['name']) or pd.isna(row['supplier']):
                    errors.append(f"Row {index + 1}: Name and supplier are required")
                    continue
                
                if row['quantity'] < 0 or row['cost_per_unit'] < 0:
                    errors.append(f"Row {index + 1}: Quantity and cost must be positive")
                    continue
                
                # Check if material already exists
                existing = db.query(RawMaterial).filter(
                    and_(
                        RawMaterial.name == row['name'],
                        RawMaterial.batch_number == row['batch_number']
                    )
                ).first()
                
                if existing:
                    errors.append(f"Row {index + 1}: Material with same name and batch already exists")
                    continue
                
                # Determine status
                status = 'in-stock'
                if row['quantity'] <= row['reorder_level']:
                    status = 'low-stock'
                elif row['quantity'] == 0:
                    status = 'out-of-stock'
                
                # Create material
                material = RawMaterial(
                    name=row['name'],
                    supplier=row['supplier'],
                    quantity=float(row['quantity']),
                    unit=row['unit'],
                    cost_per_unit=float(row['cost_per_unit']),
                    reorder_level=float(row['reorder_level']),
                    max_stock_level=float(row.get('max_stock_level', row['reorder_level'] * 5)),
                    expiry_date=pd.to_datetime(row['expiry_date']).date() if not pd.isna(row.get('expiry_date')) else None,
                    batch_number=row['batch_number'],
                    status=status,
                    location=row.get('location', 'Warehouse'),
                    quality_grade=row.get('quality_grade', 'A'),
                    created_by=current_user.id
                )
                
                db.add(material)
                imported_materials.append(material)
                
            except Exception as e:
                errors.append(f"Row {index + 1}: {str(e)}")
        
        # Commit successful imports
        if imported_materials:
            db.commit()
        
        return {
            "success": True,
            "imported_count": len(imported_materials),
            "error_count": len(errors),
            "errors": errors,
            "imported_materials": [
                {
                    "id": m.id,
                    "name": m.name,
                    "supplier": m.supplier,
                    "quantity": m.quantity
                } for m in imported_materials
            ]
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")

@router.get("/export/raw-materials")
def export_raw_materials(
    format: str = "csv",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export raw materials to CSV or Excel"""
    
    materials = db.query(RawMaterial).all()
    
    data = []
    for material in materials:
        data.append({
            "id": material.id,
            "name": material.name,
            "supplier": material.supplier,
            "quantity": material.quantity,
            "unit": material.unit,
            "cost_per_unit": material.cost_per_unit,
            "reorder_level": material.reorder_level,
            "max_stock_level": material.max_stock_level,
            "expiry_date": material.expiry_date,
            "batch_number": material.batch_number,
            "status": material.status,
            "location": material.location,
            "quality_grade": material.quality_grade,
            "created_at": material.created_at,
            "updated_at": material.updated_at
        })
    
    df = pd.DataFrame(data)
    
    if format.lower() == "excel":
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Raw Materials')
        output.seek(0)
        
        return {
            "filename": f"raw_materials_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx",
            "content": output.getvalue().hex(),
            "content_type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
    else:
        csv_content = df.to_csv(index=False)
        return {
            "filename": f"raw_materials_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
            "content": csv_content,
            "content_type": "text/csv"
        }

@router.get("/advanced-search")
def advanced_inventory_search(
    search_term: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    supplier: Optional[str] = None,
    min_quantity: Optional[float] = None,
    max_quantity: Optional[float] = None,
    min_cost: Optional[float] = None,
    max_cost: Optional[float] = None,
    expiry_within_days: Optional[int] = None,
    sort_by: Optional[str] = "name",
    sort_order: Optional[str] = "asc",
    page: int = 1,
    page_size: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Advanced search and filtering for inventory items"""
    
    # Build query for raw materials
    rm_query = db.query(RawMaterial)
    fp_query = db.query(FinishedProduct)
    
    # Apply filters
    if search_term:
        rm_query = rm_query.filter(
            or_(
                RawMaterial.name.ilike(f"%{search_term}%"),
                RawMaterial.supplier.ilike(f"%{search_term}%"),
                RawMaterial.batch_number.ilike(f"%{search_term}%")
            )
        )
        fp_query = fp_query.filter(
            or_(
                FinishedProduct.name.ilike(f"%{search_term}%"),
                FinishedProduct.sku.ilike(f"%{search_term}%"),
                FinishedProduct.category.ilike(f"%{search_term}%")
            )
        )
    
    if status:
        rm_query = rm_query.filter(RawMaterial.status == status)
        fp_query = fp_query.filter(FinishedProduct.status == status)
    
    if supplier:
        rm_query = rm_query.filter(RawMaterial.supplier.ilike(f"%{supplier}%"))
    
    if category:
        fp_query = fp_query.filter(FinishedProduct.category.ilike(f"%{category}%"))
    
    if min_quantity is not None:
        rm_query = rm_query.filter(RawMaterial.quantity >= min_quantity)
        fp_query = fp_query.filter(FinishedProduct.quantity >= min_quantity)
    
    if max_quantity is not None:
        rm_query = rm_query.filter(RawMaterial.quantity <= max_quantity)
        fp_query = fp_query.filter(FinishedProduct.quantity <= max_quantity)
    
    if min_cost is not None:
        rm_query = rm_query.filter(RawMaterial.cost_per_unit >= min_cost)
        fp_query = fp_query.filter(FinishedProduct.cost_price >= min_cost)
    
    if max_cost is not None:
        rm_query = rm_query.filter(RawMaterial.cost_per_unit <= max_cost)
        fp_query = fp_query.filter(FinishedProduct.cost_price <= max_cost)
    
    if expiry_within_days is not None:
        expiry_date = date.today() + timedelta(days=expiry_within_days)
        rm_query = rm_query.filter(RawMaterial.expiry_date <= expiry_date)
        fp_query = fp_query.filter(FinishedProduct.expiry_date <= expiry_date)
    
    # Apply sorting
    if sort_by and hasattr(RawMaterial, sort_by):
        if sort_order == "desc":
            rm_query = rm_query.order_by(getattr(RawMaterial, sort_by).desc())
        else:
            rm_query = rm_query.order_by(getattr(RawMaterial, sort_by))
    
    if sort_by and hasattr(FinishedProduct, sort_by):
        if sort_order == "desc":
            fp_query = fp_query.order_by(getattr(FinishedProduct, sort_by).desc())
        else:
            fp_query = fp_query.order_by(getattr(FinishedProduct, sort_by))
    
    # Get total counts
    rm_total = rm_query.count()
    fp_total = fp_query.count()
    
    # Apply pagination
    offset = (page - 1) * page_size
    raw_materials = rm_query.offset(offset).limit(page_size).all()
    finished_products = fp_query.offset(offset).limit(page_size).all()
    
    # Calculate aggregations
    rm_value = db.query(func.sum(RawMaterial.quantity * RawMaterial.cost_per_unit)).scalar() or 0
    fp_value = db.query(func.sum(FinishedProduct.quantity * FinishedProduct.cost_price)).scalar() or 0
    
    return {
        "raw_materials": {
            "items": raw_materials,
            "total_count": rm_total,
            "total_value": rm_value
        },
        "finished_products": {
            "items": finished_products,
            "total_count": fp_total,
            "total_value": fp_value
        },
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_items": rm_total + fp_total,
            "total_pages": ((rm_total + fp_total) + page_size - 1) // page_size
        },
        "aggregations": {
            "total_inventory_value": rm_value + fp_value,
            "low_stock_count": db.query(RawMaterial).filter(RawMaterial.status == 'low-stock').count() + 
                              db.query(FinishedProduct).filter(FinishedProduct.status == 'low-stock').count(),
            "expired_count": db.query(RawMaterial).filter(RawMaterial.status == 'expired').count() + 
                           db.query(FinishedProduct).filter(FinishedProduct.status == 'expired').count()
        }
    }

@router.get("/inventory-optimization")
def get_inventory_optimization(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get inventory optimization recommendations"""
    
    # Get inventory data
    raw_materials = db.query(RawMaterial).all()
    finished_products = db.query(FinishedProduct).all()
    
    # Get production and waste data for analysis
    productions = db.query(Production).filter(
        Production.status == "completed"
    ).all()
    
    waste_records = db.query(WasteRecord).filter(
        WasteRecord.date >= date.today() - timedelta(days=90)
    ).all()
    
    recommendations = []
    
    # Analyze raw materials
    for material in raw_materials:
        # Calculate usage rate
        material_usage = sum(
            sum(rm['actual_quantity'] for rm in p.raw_materials_used if rm['material_id'] == material.id)
            for p in productions
        )
        
        # Calculate waste rate
        material_waste = sum(
            w.waste_quantity for w in waste_records 
            if w.item_id == material.id and w.item_type == 'raw-material'
        )
        
        # Stock level analysis
        if material.quantity > material.max_stock_level:
            recommendations.append({
                "type": "overstock",
                "item_type": "raw_material",
                "item_name": material.name,
                "current_stock": material.quantity,
                "recommended_stock": material.max_stock_level,
                "excess_stock": material.quantity - material.max_stock_level,
                "tied_up_capital": (material.quantity - material.max_stock_level) * material.cost_per_unit,
                "priority": "medium",
                "action": "Reduce ordering or increase production"
            })
        
        elif material.quantity <= material.reorder_level:
            recommendations.append({
                "type": "reorder",
                "item_type": "raw_material",
                "item_name": material.name,
                "current_stock": material.quantity,
                "reorder_level": material.reorder_level,
                "recommended_order": material.max_stock_level - material.quantity,
                "urgency": "high" if material.quantity == 0 else "medium",
                "action": "Place purchase order immediately"
            })
        
        # High waste items
        if material_waste > material_usage * 0.1:  # More than 10% waste
            recommendations.append({
                "type": "high_waste",
                "item_type": "raw_material",
                "item_name": material.name,
                "waste_quantity": material_waste,
                "usage_quantity": material_usage,
                "waste_percentage": (material_waste / material_usage * 100) if material_usage > 0 else 0,
                "waste_value": material_waste * material.cost_per_unit,
                "priority": "high",
                "action": "Review handling and storage procedures"
            })
    
    # Analyze finished products
    for product in finished_products:
        # Calculate demand vs stock
        if hasattr(product, 'demand_forecast') and product.demand_forecast:
            if product.quantity > product.demand_forecast * 2:  # More than 2x demand
                recommendations.append({
                    "type": "overproduction",
                    "item_type": "finished_product",
                    "item_name": product.name,
                    "current_stock": product.quantity,
                    "demand_forecast": product.demand_forecast,
                    "excess_stock": product.quantity - product.demand_forecast,
                    "tied_up_capital": (product.quantity - product.demand_forecast) * product.cost_price,
                    "priority": "medium",
                    "action": "Reduce production or increase marketing"
                })
        
        # Low stock finished products
        if product.status == 'low-stock':
            recommendations.append({
                "type": "low_stock",
                "item_type": "finished_product",
                "item_name": product.name,
                "current_stock": product.quantity,
                "priority": "high",
                "action": "Schedule production run"
            })
    
    # Calculate potential savings
    total_tied_capital = sum(
        r.get("tied_up_capital", 0) for r in recommendations 
        if r["type"] in ["overstock", "overproduction"]
    )
    
    total_waste_value = sum(
        r.get("waste_value", 0) for r in recommendations 
        if r["type"] == "high_waste"
    )
    
    return {
        "recommendations": recommendations,
        "summary": {
            "total_recommendations": len(recommendations),
            "high_priority": len([r for r in recommendations if r.get("priority") == "high"]),
            "medium_priority": len([r for r in recommendations if r.get("priority") == "medium"]),
            "potential_capital_release": total_tied_capital,
            "potential_waste_reduction": total_waste_value,
            "total_potential_savings": total_tied_capital + total_waste_value
        },
        "inventory_health": {
            "total_raw_materials": len(raw_materials),
            "total_finished_products": len(finished_products),
            "low_stock_items": len([r for r in recommendations if r["type"] in ["reorder", "low_stock"]]),
            "overstock_items": len([r for r in recommendations if r["type"] in ["overstock", "overproduction"]]),
            "high_waste_items": len([r for r in recommendations if r["type"] == "high_waste"])
        }
    }