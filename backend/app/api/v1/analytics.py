from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.inventory import RawMaterial, FinishedProduct
from app.models.production import Production
from app.models.waste import WasteRecord
from app.models.finance import Transaction
from app.models.sales import SalesOrder

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Inventory metrics
    total_raw_materials = db.query(func.count(RawMaterial.id)).scalar()
    total_finished_products = db.query(func.count(FinishedProduct.id)).scalar()
    low_stock_items = db.query(func.count(RawMaterial.id)).filter(
        RawMaterial.status == "low-stock"
    ).scalar()
    
    # Financial metrics
    total_income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.type == "income"
    ).scalar() or 0
    total_expenses = db.query(func.sum(Transaction.amount)).filter(
        Transaction.type == "expense"
    ).scalar() or 0
    
    # Production metrics
    active_productions = db.query(func.count(Production.id)).filter(
        Production.status == "in-progress"
    ).scalar()
    completed_productions = db.query(func.count(Production.id)).filter(
        Production.status == "completed"
    ).scalar()
    
    # Waste metrics
    total_waste_value = db.query(func.sum(WasteRecord.waste_value)).scalar() or 0
    
    # Sales metrics
    total_sales = db.query(func.sum(SalesOrder.total_amount)).scalar() or 0
    pending_orders = db.query(func.count(SalesOrder.id)).filter(
        SalesOrder.status.in_(["pending", "confirmed"])
    ).scalar()
    
    return {
        "inventory": {
            "total_raw_materials": total_raw_materials,
            "total_finished_products": total_finished_products,
            "low_stock_items": low_stock_items,
        },
        "financial": {
            "total_income": total_income,
            "total_expenses": total_expenses,
            "net_profit": total_income - total_expenses,
        },
        "production": {
            "active_productions": active_productions,
            "completed_productions": completed_productions,
        },
        "waste": {
            "total_waste_value": total_waste_value,
        },
        "sales": {
            "total_sales": total_sales,
            "pending_orders": pending_orders,
        }
    }

@router.get("/waste-analytics")
def get_waste_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Waste by reason
    waste_by_reason = db.query(
        WasteRecord.waste_reason,
        func.sum(WasteRecord.waste_value).label("total_value")
    ).group_by(WasteRecord.waste_reason).all()
    
    # Monthly waste trend
    monthly_waste = db.query(
        func.date_trunc('month', WasteRecord.date).label('month'),
        func.sum(WasteRecord.waste_value).label('total_value')
    ).group_by(func.date_trunc('month', WasteRecord.date)).all()
    
    return {
        "waste_by_reason": [
            {"reason": reason, "value": float(value)} 
            for reason, value in waste_by_reason
        ],
        "monthly_trend": [
            {"month": month.isoformat(), "value": float(value)}
            for month, value in monthly_waste
        ]
    }

@router.get("/production-efficiency")
def get_production_efficiency(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Overall efficiency
    productions = db.query(Production).filter(
        Production.status == "completed"
    ).all()
    
    if not productions:
        return {"efficiency": 0, "average_yield": 0}
    
    total_planned = sum(p.planned_quantity for p in productions)
    total_actual = sum(p.actual_quantity for p in productions)
    average_yield = sum(p.yield_percentage for p in productions) / len(productions)
    
    efficiency = (total_actual / total_planned * 100) if total_planned > 0 else 0
    
    return {
        "efficiency": efficiency,
        "average_yield": average_yield,
        "total_productions": len(productions)
    }