from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, Enum, ForeignKey, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import enum

class EmployeeStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    TERMINATED = "terminated"
    ON_LEAVE = "on_leave"

class Department(str, enum.Enum):
    PRODUCTION = "production"
    QUALITY = "quality"
    SALES = "sales"
    FINANCE = "finance"
    HR = "hr"
    IT = "it"
    ADMIN = "admin"

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String)
    cnic = Column(String, unique=True, nullable=False)
    address = Column(Text)
    city = Column(String)
    department = Column(Enum(Department), nullable=False)
    designation = Column(String, nullable=False)
    hire_date = Column(Date, nullable=False)
    salary = Column(Float, nullable=False)
    status = Column(Enum(EmployeeStatus), default=EmployeeStatus.ACTIVE)
    manager_id = Column(Integer, ForeignKey("employees.id"))
    emergency_contact = Column(String)
    emergency_phone = Column(String)
    bank_account = Column(String)
    tax_number = Column(String)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    manager = relationship("Employee", remote_side=[id])
    subordinates = relationship("Employee", back_populates="manager")
    attendances = relationship("Attendance", back_populates="employee")
    leaves = relationship("Leave", foreign_keys="[Leave.employee_id]", back_populates="employee")
    payrolls = relationship("Payroll", back_populates="employee")

class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    date = Column(Date, nullable=False)
    check_in = Column(DateTime)
    check_out = Column(DateTime)
    break_time = Column(Integer, default=0)  # in minutes
    overtime_hours = Column(Float, default=0)
    status = Column(String, default="present")  # present, absent, late, half_day
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    employee = relationship("Employee", back_populates="attendances")

class Leave(Base):
    __tablename__ = "leaves"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    leave_type = Column(String, nullable=False)  # annual, sick, casual, maternity
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    days = Column(Integer, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String, default="pending")  # pending, approved, rejected
    approved_by = Column(Integer, ForeignKey("employees.id"))
    applied_date = Column(DateTime, server_default=func.now())

    employee = relationship("Employee", foreign_keys=[employee_id], back_populates="leaves")
    approver = relationship("Employee", foreign_keys=[approved_by], backref="approved_leaves")

class Payroll(Base):
    __tablename__ = "payrolls"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    basic_salary = Column(Float, nullable=False)
    allowances = Column(Float, default=0)
    overtime_amount = Column(Float, default=0)
    deductions = Column(Float, default=0)
    tax_deduction = Column(Float, default=0)
    net_salary = Column(Float, nullable=False)
    status = Column(String, default="pending")  # pending, processed, paid
    processed_date = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())

    employee = relationship("Employee", back_populates="payrolls")
