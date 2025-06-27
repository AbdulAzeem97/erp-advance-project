from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, Enum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import enum

# Order status
class SalesOrderStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

# ✅ Payment status (was missing)
class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    PARTIALLY_PAID = "partially_paid"
    OVERDUE = "overdue"

# Customer model
class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    contact = Column(String)
    email = Column(String)
    address = Column(Text)
    city = Column(String)
    customer_type = Column(String)  # pharmacy, hospital, distributor, retailer
    credit_limit = Column(Float, default=0)
    outstanding_amount = Column(Float, default=0)
    total_purchases = Column(Float, default=0)
    last_order_date = Column(DateTime)
    payment_terms = Column(String)
    discount = Column(Float, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    sales_orders = relationship("SalesOrder", back_populates="customer")

# Sales Order model
class SalesOrder(Base):
    __tablename__ = "sales_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String, unique=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    order_date = Column(DateTime, server_default=func.now())
    delivery_date = Column(DateTime)
    status = Column(Enum(SalesOrderStatus), default=SalesOrderStatus.PENDING)
    items = Column(JSON)  # Store order items as JSON
    subtotal = Column(Float, nullable=False)
    discount_amount = Column(Float, default=0)
    tax_amount = Column(Float, default=0)
    total_amount = Column(Float, nullable=False)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)  # ✅ Now defined
    sales_person = Column(String)
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"))

    customer = relationship("Customer", back_populates="sales_orders")
    creator = relationship("User")
