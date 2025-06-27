from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, Enum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import enum

class LeadStatus(str, enum.Enum):
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    PROPOSAL = "proposal"
    NEGOTIATION = "negotiation"
    CLOSED_WON = "closed_won"
    CLOSED_LOST = "closed_lost"

class LeadSource(str, enum.Enum):
    WEBSITE = "website"
    REFERRAL = "referral"
    COLD_CALL = "cold_call"
    EMAIL = "email"
    SOCIAL_MEDIA = "social_media"
    TRADE_SHOW = "trade_show"
    ADVERTISEMENT = "advertisement"

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, nullable=False)
    contact_person = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String)
    address = Column(Text)
    city = Column(String)
    industry = Column(String)
    source = Column(Enum(LeadSource), nullable=False)
    status = Column(Enum(LeadStatus), default=LeadStatus.NEW)
    estimated_value = Column(Float, default=0)
    probability = Column(Integer, default=0)  # 0-100%
    assigned_to = Column(Integer, ForeignKey("employees.id"))
    notes = Column(Text)
    next_follow_up = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    assigned_employee = relationship("Employee")
    activities = relationship("Activity", back_populates="lead")

class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"))
    customer_id = Column(Integer, ForeignKey("customers.id"))
    activity_type = Column(String, nullable=False)  # call, email, meeting, note
    subject = Column(String, nullable=False)
    description = Column(Text)
    date = Column(DateTime, nullable=False)
    duration = Column(Integer)  # in minutes
    outcome = Column(String)
    next_action = Column(String)
    created_by = Column(Integer, ForeignKey("employees.id"))
    created_at = Column(DateTime, server_default=func.now())
    
    lead = relationship("Lead", back_populates="activities")
    customer = relationship("Customer")
    creator = relationship("Employee")

class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    lead_id = Column(Integer, ForeignKey("leads.id"))
    value = Column(Float, nullable=False)
    probability = Column(Integer, default=0)  # 0-100%
    stage = Column(String, nullable=False)
    expected_close_date = Column(DateTime)
    description = Column(Text)
    assigned_to = Column(Integer, ForeignKey("employees.id"))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    customer = relationship("Customer")
    lead = relationship("Lead")
    assigned_employee = relationship("Employee")