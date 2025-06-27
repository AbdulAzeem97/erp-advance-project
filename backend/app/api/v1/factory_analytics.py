from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.production import Production
from app.models.inventory import RawMaterial, FinishedProduct
from app.models.waste import WasteRecord
from app.models.finance import Transaction
from datetime import datetime, date, timedelta
from typing import Optional

router = APIRouter()

@router.get("/cost-analysis")
def get_cost_analysis(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Advanced cost analysis for factory operations"""
    
    if not start_date:
        start_date = date.today() - timedelta(days=30)
    if not end_date:
        end_date = date.today()
    
    # Production costs
    productions = db.query(Production).filter(
        Production.start_date >= start_date,
        Production.end_date <= end_date,
        Production.status == "completed"
    ).all()
    
    total_production_cost = sum(p.total_cost for p in productions)
    total_labor_cost = sum(p.labor_cost for p in productions)
    total_overhead_cost = sum(p.overhead_cost for p in productions)
    total_material_cost = total_production_cost - total_labor_cost - total_overhead_cost
    
    # Waste costs
    waste_records = db.query(WasteRecord).filter(
        WasteRecord.date >= start_date,
        WasteRecord.date <= end_date
    ).all()
    
    total_waste_cost = sum(w.waste_value for w in waste_records)
    waste_by_reason = {}
    for waste in waste_records:
        waste_by_reason[waste.waste_reason] = waste_by_reason.get(waste.waste_reason, 0) + waste.waste_value
    
    # Cost per unit analysis
    total_units_produced = sum(p.actual_quantity for p in productions)
    cost_per_unit = total_production_cost / total_units_produced if total_units_produced > 0 else 0
    
    # Efficiency metrics
    planned_vs_actual = sum(p.planned_quantity for p in productions)
    efficiency_ratio = (total_units_produced / planned_vs_actual * 100) if planned_vs_actual > 0 else 0
    
    # Cost breakdown percentages
    cost_breakdown = {
        "material_cost": (total_material_cost / total_production_cost * 100) if total_production_cost > 0 else 0,
        "labor_cost": (total_labor_cost / total_production_cost * 100) if total_production_cost > 0 else 0,
        "overhead_cost": (total_overhead_cost / total_production_cost * 100) if total_production_cost > 0 else 0,
        "waste_cost": (total_waste_cost / total_production_cost * 100) if total_production_cost > 0 else 0
    }
    
    return {
        "period": f"{start_date} to {end_date}",
        "total_production_cost": total_production_cost,
        "total_material_cost": total_material_cost,
        "total_labor_cost": total_labor_cost,
        "total_overhead_cost": total_overhead_cost,
        "total_waste_cost": total_waste_cost,
        "cost_per_unit": cost_per_unit,
        "efficiency_ratio": efficiency_ratio,
        "cost_breakdown": cost_breakdown,
        "waste_by_reason": waste_by_reason,
        "units_produced": total_units_produced,
        "productions_count": len(productions)
    }

@router.get("/waste-optimization")
def get_waste_optimization(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Waste optimization recommendations"""
    
    # Get waste data for last 3 months
    three_months_ago = date.today() - timedelta(days=90)
    waste_records = db.query(WasteRecord).filter(
        WasteRecord.date >= three_months_ago
    ).all()
    
    # Analyze waste patterns
    waste_by_item = {}
    waste_by_reason = {}
    waste_trends = {}
    
    for waste in waste_records:
        # By item
        if waste.item_name not in waste_by_item:
            waste_by_item[waste.item_name] = {
                "total_value": 0,
                "total_quantity": 0,
                "occurrences": 0,
                "main_reason": waste.waste_reason
            }
        waste_by_item[waste.item_name]["total_value"] += waste.waste_value
        waste_by_item[waste.item_name]["total_quantity"] += waste.waste_quantity
        waste_by_item[waste.item_name]["occurrences"] += 1
        
        # By reason
        waste_by_reason[waste.waste_reason] = waste_by_reason.get(waste.waste_reason, 0) + waste.waste_value
        
        # Monthly trends
        month_key = waste.date[:7]  # YYYY-MM
        waste_trends[month_key] = waste_trends.get(month_key, 0) + waste.waste_value
    
    # Generate recommendations
    recommendations = []
    
    # High waste items
    sorted_waste_items = sorted(waste_by_item.items(), key=lambda x: x[1]["total_value"], reverse=True)
    for item_name, data in sorted_waste_items[:5]:
        if data["total_value"] > 10000:  # PKR 10,000 threshold
            recommendations.append({
                "type": "high_waste_item",
                "priority": "high",
                "item": item_name,
                "issue": f"High waste value: PKR {data['total_value']:,.2f}",
                "recommendation": f"Review {data['main_reason']} processes for {item_name}",
                "potential_savings": data["total_value"] * 0.3  # 30% reduction potential
            })
    
    # Waste reason analysis
    if "expired" in waste_by_reason and waste_by_reason["expired"] > 20000:
        recommendations.append({
            "type": "expiry_management",
            "priority": "high",
            "issue": f"High expiry waste: PKR {waste_by_reason['expired']:,.2f}",
            "recommendation": "Implement FIFO inventory management and better demand forecasting",
            "potential_savings": waste_by_reason["expired"] * 0.5
        })
    
    if "production-loss" in waste_by_reason and waste_by_reason["production-loss"] > 15000:
        recommendations.append({
            "type": "production_efficiency",
            "priority": "medium",
            "issue": f"High production loss: PKR {waste_by_reason['production-loss']:,.2f}",
            "recommendation": "Review production processes and equipment maintenance",
            "potential_savings": waste_by_reason["production-loss"] * 0.4
        })
    
    total_potential_savings = sum(r["potential_savings"] for r in recommendations)
    
    return {
        "waste_summary": {
            "total_waste_value": sum(waste_by_reason.values()),
            "waste_by_item": dict(sorted_waste_items[:10]),
            "waste_by_reason": waste_by_reason,
            "monthly_trends": waste_trends
        },
        "recommendations": recommendations,
        "total_potential_savings": total_potential_savings,
        "roi_analysis": {
            "current_monthly_waste": sum(waste_by_reason.values()) / 3,  # 3 months average
            "potential_monthly_savings": total_potential_savings / 3,
            "annual_savings_potential": total_potential_savings * 4
        }
    }

@router.get("/profit-optimization")
def get_profit_optimization(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Profit optimization analysis and recommendations"""
    
    # Get production and sales data
    productions = db.query(Production).filter(
        Production.status == "completed"
    ).all()
    
    finished_products = db.query(FinishedProduct).all()
    
    # Calculate profit margins by product
    product_profitability = {}
    
    for product in finished_products:
        # Find related productions
        product_productions = [p for p in productions if p.product_id == product.id]
        
        if product_productions:
            avg_production_cost = sum(p.total_cost for p in product_productions) / len(product_productions)
            avg_units_produced = sum(p.actual_quantity for p in product_productions) / len(product_productions)
            cost_per_unit = avg_production_cost / avg_units_produced if avg_units_produced > 0 else 0
            
            profit_per_unit = product.selling_price - cost_per_unit
            profit_margin = (profit_per_unit / product.selling_price * 100) if product.selling_price > 0 else 0
            
            product_profitability[product.name] = {
                "cost_per_unit": cost_per_unit,
                "selling_price": product.selling_price,
                "profit_per_unit": profit_per_unit,
                "profit_margin": profit_margin,
                "current_stock": product.quantity,
                "potential_revenue": product.quantity * product.selling_price,
                "potential_profit": product.quantity * profit_per_unit
            }
    
    # Generate optimization recommendations
    optimization_recommendations = []
    
    # Low margin products
    low_margin_products = {k: v for k, v in product_profitability.items() if v["profit_margin"] < 20}
    for product_name, data in low_margin_products.items():
        optimization_recommendations.append({
            "type": "low_margin_product",
            "priority": "high",
            "product": product_name,
            "current_margin": data["profit_margin"],
            "issue": f"Low profit margin: {data['profit_margin']:.1f}%",
            "recommendations": [
                "Review and optimize production costs",
                "Consider price adjustment",
                "Improve production efficiency",
                "Negotiate better raw material prices"
            ],
            "potential_impact": data["potential_revenue"] * 0.1  # 10% improvement
        })
    
    # High margin products to scale
    high_margin_products = {k: v for k, v in product_profitability.items() if v["profit_margin"] > 40}
    for product_name, data in high_margin_products.items():
        optimization_recommendations.append({
            "type": "scale_high_margin",
            "priority": "medium",
            "product": product_name,
            "current_margin": data["profit_margin"],
            "opportunity": f"High margin product: {data['profit_margin']:.1f}%",
            "recommendations": [
                "Increase production capacity",
                "Expand market reach",
                "Optimize inventory levels",
                "Consider product line extensions"
            ],
            "potential_impact": data["potential_profit"] * 1.5  # 50% scale up
        })
    
    # Cost reduction opportunities
    total_production_cost = sum(p.total_cost for p in productions)
    avg_labor_percentage = sum(p.labor_cost / p.total_cost for p in productions if p.total_cost > 0) / len(productions) * 100
    avg_overhead_percentage = sum(p.overhead_cost / p.total_cost for p in productions if p.total_cost > 0) / len(productions) * 100
    
    if avg_labor_percentage > 30:
        optimization_recommendations.append({
            "type": "labor_cost_optimization",
            "priority": "medium",
            "issue": f"High labor cost percentage: {avg_labor_percentage:.1f}%",
            "recommendations": [
                "Implement automation where possible",
                "Optimize workforce scheduling",
                "Provide efficiency training",
                "Review overtime policies"
            ],
            "potential_impact": total_production_cost * 0.05  # 5% reduction
        })
    
    if avg_overhead_percentage > 25:
        optimization_recommendations.append({
            "type": "overhead_cost_optimization",
            "priority": "medium",
            "issue": f"High overhead cost percentage: {avg_overhead_percentage:.1f}%",
            "recommendations": [
                "Review utility usage and efficiency",
                "Optimize facility utilization",
                "Renegotiate service contracts",
                "Implement energy-saving measures"
            ],
            "potential_impact": total_production_cost * 0.03  # 3% reduction
        })
    
    return {
        "product_profitability": product_profitability,
        "optimization_recommendations": optimization_recommendations,
        "summary_metrics": {
            "total_potential_revenue": sum(p["potential_revenue"] for p in product_profitability.values()),
            "total_potential_profit": sum(p["potential_profit"] for p in product_profitability.values()),
            "average_profit_margin": sum(p["profit_margin"] for p in product_profitability.values()) / len(product_profitability) if product_profitability else 0,
            "total_optimization_impact": sum(r["potential_impact"] for r in optimization_recommendations)
        },
        "cost_structure": {
            "avg_labor_percentage": avg_labor_percentage,
            "avg_overhead_percentage": avg_overhead_percentage,
            "total_production_cost": total_production_cost
        }
    }

@router.get("/efficiency-metrics")
def get_efficiency_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Calculate comprehensive efficiency metrics"""
    
    # Overall Equipment Effectiveness (OEE)
    productions = db.query(Production).filter(
        Production.status == "completed"
    ).all()
    
    if not productions:
        return {"error": "No completed productions found"}
    
    # Availability (planned vs actual production time)
    total_planned_time = len(productions) * 8  # Assuming 8 hours per production
    total_actual_time = sum(
        (datetime.strptime(p.end_date, '%Y-%m-%d') - datetime.strptime(p.start_date, '%Y-%m-%d')).days * 8
        for p in productions
    )
    availability = (total_actual_time / total_planned_time * 100) if total_planned_time > 0 else 0
    
    # Performance (actual vs planned output)
    total_planned_output = sum(p.planned_quantity for p in productions)
    total_actual_output = sum(p.actual_quantity for p in productions)
    performance = (total_actual_output / total_planned_output * 100) if total_planned_output > 0 else 0
    
    # Quality (good units vs total units)
    total_quality_grade_a = sum(p.actual_quantity for p in productions if p.quality_grade == 'A')
    quality = (total_quality_grade_a / total_actual_output * 100) if total_actual_output > 0 else 0
    
    # Overall Equipment Effectiveness
    oee = (availability * performance * quality) / 10000  # Divide by 10000 because we're multiplying percentages
    
    # Resource utilization
    raw_materials = db.query(RawMaterial).all()
    total_raw_material_value = sum(rm.quantity * rm.cost_per_unit for rm in raw_materials)
    
    # Calculate inventory turnover
    total_material_used = sum(
        sum(rm['actual_quantity'] * rm.get('unit_cost', 0) for rm in p.raw_materials_used)
        for p in productions
    )
    inventory_turnover = (total_material_used / total_raw_material_value) if total_raw_material_value > 0 else 0
    
    # Energy efficiency (mock calculation - would need actual energy data)
    energy_efficiency = 85.5  # Placeholder
    
    # Labor productivity
    total_labor_hours = sum(
        (datetime.strptime(p.end_date, '%Y-%m-%d') - datetime.strptime(p.start_date, '%Y-%m-%d')).days * 8
        for p in productions
    )
    labor_productivity = total_actual_output / total_labor_hours if total_labor_hours > 0 else 0
    
    return {
        "oee_metrics": {
            "availability": availability,
            "performance": performance,
            "quality": quality,
            "overall_oee": oee
        },
        "efficiency_metrics": {
            "inventory_turnover": inventory_turnover,
            "energy_efficiency": energy_efficiency,
            "labor_productivity": labor_productivity,
            "capacity_utilization": performance  # Using performance as proxy
        },
        "benchmarks": {
            "world_class_oee": 85,
            "good_oee": 60,
            "current_oee": oee,
            "improvement_potential": max(0, 85 - oee)
        },
        "recommendations": [
            {
                "metric": "OEE",
                "current": oee,
                "target": 85,
                "actions": [
                    "Implement preventive maintenance",
                    "Reduce changeover times",
                    "Improve quality processes",
                    "Optimize production scheduling"
                ]
            },
            {
                "metric": "Inventory Turnover",
                "current": inventory_turnover,
                "target": 12,  # Monthly turnover
                "actions": [
                    "Implement just-in-time inventory",
                    "Improve demand forecasting",
                    "Optimize supplier relationships",
                    "Reduce safety stock levels"
                ]
            }
        ]
    }

@router.post("/cost-reduction-plan")
def create_cost_reduction_plan(
    target_reduction_percentage: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a comprehensive cost reduction plan"""
    
    # Get current cost structure
    productions = db.query(Production).filter(
        Production.status == "completed"
    ).all()
    
    total_cost = sum(p.total_cost for p in productions)
    total_labor_cost = sum(p.labor_cost for p in productions)
    total_overhead_cost = sum(p.overhead_cost for p in productions)
    total_material_cost = total_cost - total_labor_cost - total_overhead_cost
    
    target_reduction_amount = total_cost * (target_reduction_percentage / 100)
    
    # Create reduction plan
    reduction_plan = {
        "target_reduction": {
            "percentage": target_reduction_percentage,
            "amount": target_reduction_amount
        },
        "current_costs": {
            "total_cost": total_cost,
            "material_cost": total_material_cost,
            "labor_cost": total_labor_cost,
            "overhead_cost": total_overhead_cost
        },
        "reduction_strategies": []
    }
    
    # Material cost reduction (40% of target)
    material_reduction = target_reduction_amount * 0.4
    reduction_plan["reduction_strategies"].append({
        "category": "Material Costs",
        "target_reduction": material_reduction,
        "percentage_of_total": (material_reduction / total_material_cost * 100) if total_material_cost > 0 else 0,
        "actions": [
            {
                "action": "Negotiate better supplier prices",
                "potential_savings": material_reduction * 0.3,
                "timeline": "3 months",
                "difficulty": "Medium"
            },
            {
                "action": "Implement bulk purchasing",
                "potential_savings": material_reduction * 0.2,
                "timeline": "2 months",
                "difficulty": "Low"
            },
            {
                "action": "Find alternative suppliers",
                "potential_savings": material_reduction * 0.3,
                "timeline": "6 months",
                "difficulty": "High"
            },
            {
                "action": "Reduce material waste",
                "potential_savings": material_reduction * 0.2,
                "timeline": "4 months",
                "difficulty": "Medium"
            }
        ]
    })
    
    # Labor cost reduction (30% of target)
    labor_reduction = target_reduction_amount * 0.3
    reduction_plan["reduction_strategies"].append({
        "category": "Labor Costs",
        "target_reduction": labor_reduction,
        "percentage_of_total": (labor_reduction / total_labor_cost * 100) if total_labor_cost > 0 else 0,
        "actions": [
            {
                "action": "Optimize workforce scheduling",
                "potential_savings": labor_reduction * 0.3,
                "timeline": "2 months",
                "difficulty": "Medium"
            },
            {
                "action": "Implement automation",
                "potential_savings": labor_reduction * 0.4,
                "timeline": "12 months",
                "difficulty": "High"
            },
            {
                "action": "Improve training and efficiency",
                "potential_savings": labor_reduction * 0.2,
                "timeline": "6 months",
                "difficulty": "Medium"
            },
            {
                "action": "Reduce overtime costs",
                "potential_savings": labor_reduction * 0.1,
                "timeline": "1 month",
                "difficulty": "Low"
            }
        ]
    })
    
    # Overhead cost reduction (30% of target)
    overhead_reduction = target_reduction_amount * 0.3
    reduction_plan["reduction_strategies"].append({
        "category": "Overhead Costs",
        "target_reduction": overhead_reduction,
        "percentage_of_total": (overhead_reduction / total_overhead_cost * 100) if total_overhead_cost > 0 else 0,
        "actions": [
            {
                "action": "Reduce energy consumption",
                "potential_savings": overhead_reduction * 0.4,
                "timeline": "6 months",
                "difficulty": "Medium"
            },
            {
                "action": "Optimize facility utilization",
                "potential_savings": overhead_reduction * 0.3,
                "timeline": "4 months",
                "difficulty": "Medium"
            },
            {
                "action": "Renegotiate service contracts",
                "potential_savings": overhead_reduction * 0.2,
                "timeline": "3 months",
                "difficulty": "Low"
            },
            {
                "action": "Implement preventive maintenance",
                "potential_savings": overhead_reduction * 0.1,
                "timeline": "8 months",
                "difficulty": "Medium"
            }
        ]
    })
    
    # Implementation timeline
    reduction_plan["implementation_timeline"] = {
        "phase_1": {
            "duration": "1-3 months",
            "focus": "Quick wins and low-hanging fruit",
            "expected_savings": target_reduction_amount * 0.2
        },
        "phase_2": {
            "duration": "4-6 months",
            "focus": "Process improvements and negotiations",
            "expected_savings": target_reduction_amount * 0.4
        },
        "phase_3": {
            "duration": "7-12 months",
            "focus": "Strategic changes and automation",
            "expected_savings": target_reduction_amount * 0.4
        }
    }
    
    # ROI calculation
    implementation_cost = target_reduction_amount * 0.15  # 15% of savings as implementation cost
    annual_savings = target_reduction_amount * 4  # Quarterly to annual
    roi = ((annual_savings - implementation_cost) / implementation_cost * 100) if implementation_cost > 0 else 0
    
    reduction_plan["roi_analysis"] = {
        "implementation_cost": implementation_cost,
        "annual_savings": annual_savings,
        "roi_percentage": roi,
        "payback_period_months": (implementation_cost / (annual_savings / 12)) if annual_savings > 0 else 0
    }
    
    return reduction_plan