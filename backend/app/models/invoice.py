from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, Enum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import enum

class InvoiceStatus(str, enum.Enum):
    DRAFT = "draft"
    SENT = "sent"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"

class PaymentTerms(str, enum.Enum):
    NET_15 = "net_15"
    NET_30 = "net_30"
    NET_45 = "net_45"
    NET_60 = "net_60"
    CASH_ON_DELIVERY = "cash_on_delivery"
    ADVANCE_PAYMENT = "advance_payment"

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    sales_order_id = Column(Integer, ForeignKey("sales_orders.id"))
    issue_date = Column(DateTime, server_default=func.now())
    due_date = Column(DateTime, nullable=False)
    payment_terms = Column(Enum(PaymentTerms), default=PaymentTerms.NET_30)
    status = Column(Enum(InvoiceStatus), default=InvoiceStatus.DRAFT)
    
    # Line items stored as JSON
    items = Column(JSON, nullable=False)
    
    # Financial calculations
    subtotal = Column(Float, nullable=False)
    discount_amount = Column(Float, default=0)
    tax_rate = Column(Float, default=18.0)  # GST rate
    tax_amount = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    
    # Payment tracking
    paid_amount = Column(Float, default=0)
    balance_due = Column(Float, nullable=False)
    
    # Additional fields
    notes = Column(Text)
    terms_conditions = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    customer = relationship("Customer")
    sales_order = relationship("SalesOrder")
    creator = relationship("User")
    payments = relationship("Payment", back_populates="invoice")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    payment_number = Column(String, unique=True, nullable=False)
    invoice_id = Column(Integer, ForeignKey("invoices.id"))
    customer_id = Column(Integer, ForeignKey("customers.id"))
    amount = Column(Float, nullable=False)
    payment_date = Column(DateTime, nullable=False)
    payment_method = Column(String, nullable=False)  # cash, bank, cheque, online
    reference_number = Column(String)
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, server_default=func.now())
    
    invoice = relationship("Invoice", back_populates="payments")
    customer = relationship("Customer")
    creator = relationship("User")

class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(Integer, primary_key=True, index=True)
    quotation_number = Column(String, unique=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    lead_id = Column(Integer, ForeignKey("leads.id"))
    issue_date = Column(DateTime, server_default=func.now())
    valid_until = Column(DateTime, nullable=False)
    status = Column(String, default="pending")  # pending, accepted, rejected, expired
    
    # Line items stored as JSON
    items = Column(JSON, nullable=False)
    
    # Financial calculations
    subtotal = Column(Float, nullable=False)
    discount_amount = Column(Float, default=0)
    tax_rate = Column(Float, default=18.0)
    tax_amount = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    
    notes = Column(Text)
    terms_conditions = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    customer = relationship("Customer")
    lead = relationship("Lead")
    creator = relationship("User")