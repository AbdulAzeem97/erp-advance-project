from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.crm import Lead, Activity, Opportunity, LeadStatus, LeadSource
from app.models.invoice import Invoice, Payment, Quotation
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/leads")
def get_leads(
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    assigned_to: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Lead)
    
    if status:
        query = query.filter(Lead.status == status)
    if assigned_to:
        query = query.filter(Lead.assigned_to == assigned_to)
    
    leads = query.offset(skip).limit(limit).all()
    return leads

@router.post("/leads")
def create_lead(
    lead_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lead = Lead(**lead_data)
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead

@router.put("/leads/{lead_id}")
def update_lead(
    lead_id: int,
    lead_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    for field, value in lead_data.items():
        setattr(lead, field, value)
    
    db.commit()
    db.refresh(lead)
    return lead

@router.get("/activities")
def get_activities(
    lead_id: int = None,
    customer_id: int = None,
    activity_type: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Activity)
    
    if lead_id:
        query = query.filter(Activity.lead_id == lead_id)
    if customer_id:
        query = query.filter(Activity.customer_id == customer_id)
    if activity_type:
        query = query.filter(Activity.activity_type == activity_type)
    
    activities = query.order_by(Activity.date.desc()).all()
    return activities

@router.post("/activities")
def create_activity(
    activity_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    activity_data['created_by'] = current_user.id
    activity = Activity(**activity_data)
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity

@router.get("/opportunities")
def get_opportunities(
    skip: int = 0,
    limit: int = 100,
    stage: str = None,
    assigned_to: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Opportunity)
    
    if stage:
        query = query.filter(Opportunity.stage == stage)
    if assigned_to:
        query = query.filter(Opportunity.assigned_to == assigned_to)
    
    opportunities = query.offset(skip).limit(limit).all()
    return opportunities

@router.post("/opportunities")
def create_opportunity(
    opportunity_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    opportunity = Opportunity(**opportunity_data)
    db.add(opportunity)
    db.commit()
    db.refresh(opportunity)
    return opportunity

@router.get("/invoices")
def get_invoices(
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    customer_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Invoice)
    
    if status:
        query = query.filter(Invoice.status == status)
    if customer_id:
        query = query.filter(Invoice.customer_id == customer_id)
    
    invoices = query.offset(skip).limit(limit).all()
    return invoices

@router.post("/invoices")
def create_invoice(
    invoice_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Generate invoice number
    last_invoice = db.query(Invoice).order_by(Invoice.id.desc()).first()
    next_number = (last_invoice.id + 1) if last_invoice else 1
    invoice_number = f"INV-{datetime.now().year}-{next_number:04d}"
    
    invoice_data['invoice_number'] = invoice_number
    invoice_data['created_by'] = current_user.id
    invoice_data['balance_due'] = invoice_data['total_amount']
    
    invoice = Invoice(**invoice_data)
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice

@router.post("/payments")
def create_payment(
    payment_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Generate payment number
    last_payment = db.query(Payment).order_by(Payment.id.desc()).first()
    next_number = (last_payment.id + 1) if last_payment else 1
    payment_number = f"PAY-{datetime.now().year}-{next_number:04d}"
    
    payment_data['payment_number'] = payment_number
    payment_data['created_by'] = current_user.id
    
    payment = Payment(**payment_data)
    db.add(payment)
    
    # Update invoice balance
    invoice = db.query(Invoice).filter(Invoice.id == payment_data['invoice_id']).first()
    if invoice:
        invoice.paid_amount += payment_data['amount']
        invoice.balance_due = invoice.total_amount - invoice.paid_amount
        if invoice.balance_due <= 0:
            invoice.status = "paid"
    
    db.commit()
    db.refresh(payment)
    return payment

@router.get("/quotations")
def get_quotations(
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    customer_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Quotation)
    
    if status:
        query = query.filter(Quotation.status == status)
    if customer_id:
        query = query.filter(Quotation.customer_id == customer_id)
    
    quotations = query.offset(skip).limit(limit).all()
    return quotations

@router.post("/quotations")
def create_quotation(
    quotation_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Generate quotation number
    last_quotation = db.query(Quotation).order_by(Quotation.id.desc()).first()
    next_number = (last_quotation.id + 1) if last_quotation else 1
    quotation_number = f"QUO-{datetime.now().year}-{next_number:04d}"
    
    quotation_data['quotation_number'] = quotation_number
    quotation_data['created_by'] = current_user.id
    
    quotation = Quotation(**quotation_data)
    db.add(quotation)
    db.commit()
    db.refresh(quotation)
    return quotation

@router.get("/dashboard")
def get_crm_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Lead metrics
    total_leads = db.query(Lead).count()
    new_leads = db.query(Lead).filter(Lead.status == LeadStatus.NEW).count()
    qualified_leads = db.query(Lead).filter(Lead.status == LeadStatus.QUALIFIED).count()
    
    # Opportunity metrics
    total_opportunities = db.query(Opportunity).count()
    total_opportunity_value = db.query(func.sum(Opportunity.value)).scalar() or 0
    
    # Invoice metrics
    total_invoices = db.query(Invoice).count()
    pending_invoices = db.query(Invoice).filter(Invoice.status.in_(["sent", "overdue"])).count()
    total_revenue = db.query(func.sum(Invoice.total_amount)).filter(Invoice.status == "paid").scalar() or 0
    
    # Recent activities
    recent_activities = db.query(Activity).order_by(Activity.date.desc()).limit(10).all()
    
    return {
        "leads": {
            "total": total_leads,
            "new": new_leads,
            "qualified": qualified_leads,
            "conversion_rate": (qualified_leads / total_leads * 100) if total_leads > 0 else 0
        },
        "opportunities": {
            "total": total_opportunities,
            "total_value": total_opportunity_value
        },
        "invoices": {
            "total": total_invoices,
            "pending": pending_invoices,
            "total_revenue": total_revenue
        },
        "recent_activities": recent_activities
    }