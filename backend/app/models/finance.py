from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import enum

class TransactionType(str, enum.Enum):
    INCOME = "income"
    EXPENSE = "expense"

class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    BANK = "bank"
    CHEQUE = "cheque"
    ONLINE = "online"

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_number = Column(String, unique=True, nullable=False)
    type = Column(Enum(TransactionType), nullable=False)
    category = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(Text, nullable=False)
    date = Column(DateTime, server_default=func.now())
    reference = Column(String)
    payment_method = Column(Enum(PaymentMethod), default=PaymentMethod.BANK)
    tax_amount = Column(Float, default=0)
    approved = Column(Boolean, default=False)
    approved_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"))
    
    approver = relationship("User", foreign_keys=[approved_by])
    creator = relationship("User", foreign_keys=[created_by])