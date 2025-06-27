from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.api.deps import get_db, get_current_user, get_current_admin_user
from app.models.user import User
from app.models.employee import Employee, Attendance, Leave, Payroll, Department, EmployeeStatus
from datetime import datetime, date
import calendar

router = APIRouter()

@router.get("/employees")
def get_employees(
    skip: int = 0,
    limit: int = 100,
    department: str = None,
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Employee)
    
    if department:
        query = query.filter(Employee.department == department)
    if status:
        query = query.filter(Employee.status == status)
    
    employees = query.offset(skip).limit(limit).all()
    return employees

@router.post("/employees")
def create_employee(
    employee_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    # Generate employee ID
    last_employee = db.query(Employee).order_by(Employee.id.desc()).first()
    next_id = (last_employee.id + 1) if last_employee else 1
    employee_id = f"EMP{next_id:04d}"
    
    employee = Employee(
        employee_id=employee_id,
        **employee_data
    )
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee

@router.get("/attendance")
def get_attendance(
    employee_id: int = None,
    date_from: date = None,
    date_to: date = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Attendance)
    
    if employee_id:
        query = query.filter(Attendance.employee_id == employee_id)
    if date_from:
        query = query.filter(Attendance.date >= date_from)
    if date_to:
        query = query.filter(Attendance.date <= date_to)
    
    attendance = query.all()
    return attendance

@router.post("/attendance")
def mark_attendance(
    attendance_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    attendance = Attendance(**attendance_data)
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    return attendance

@router.get("/leaves")
def get_leaves(
    employee_id: int = None,
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Leave)
    
    if employee_id:
        query = query.filter(Leave.employee_id == employee_id)
    if status:
        query = query.filter(Leave.status == status)
    
    leaves = query.all()
    return leaves

@router.post("/leaves")
def apply_leave(
    leave_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    leave = Leave(**leave_data)
    db.add(leave)
    db.commit()
    db.refresh(leave)
    return leave

@router.put("/leaves/{leave_id}/approve")
def approve_leave(
    leave_id: int,
    approved: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    leave = db.query(Leave).filter(Leave.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")
    
    leave.status = "approved" if approved else "rejected"
    leave.approved_by = current_user.id
    db.commit()
    return leave

@router.get("/payroll")
def get_payroll(
    employee_id: int = None,
    month: int = None,
    year: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    query = db.query(Payroll)
    
    if employee_id:
        query = query.filter(Payroll.employee_id == employee_id)
    if month:
        query = query.filter(Payroll.month == month)
    if year:
        query = query.filter(Payroll.year == year)
    
    payroll = query.all()
    return payroll

@router.post("/payroll/generate")
def generate_payroll(
    month: int,
    year: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    # Get all active employees
    employees = db.query(Employee).filter(Employee.status == EmployeeStatus.ACTIVE).all()
    
    payroll_records = []
    for employee in employees:
        # Calculate working days and attendance
        days_in_month = calendar.monthrange(year, month)[1]
        attendance_count = db.query(Attendance).filter(
            Attendance.employee_id == employee.id,
            extract('month', Attendance.date) == month,
            extract('year', Attendance.date) == year,
            Attendance.status == 'present'
        ).count()
        
        # Calculate overtime
        overtime_hours = db.query(func.sum(Attendance.overtime_hours)).filter(
            Attendance.employee_id == employee.id,
            extract('month', Attendance.date) == month,
            extract('year', Attendance.date) == year
        ).scalar() or 0
        
        # Calculate salary components
        daily_salary = employee.salary / days_in_month
        earned_salary = daily_salary * attendance_count
        overtime_rate = (employee.salary / (days_in_month * 8)) * 1.5  # 1.5x for overtime
        overtime_amount = overtime_hours * overtime_rate
        
        # Calculate deductions
        tax_deduction = earned_salary * 0.05 if earned_salary > 50000 else 0  # 5% tax if > 50k
        
        net_salary = earned_salary + overtime_amount - tax_deduction
        
        payroll = Payroll(
            employee_id=employee.id,
            month=month,
            year=year,
            basic_salary=employee.salary,
            overtime_amount=overtime_amount,
            tax_deduction=tax_deduction,
            net_salary=net_salary
        )
        
        db.add(payroll)
        payroll_records.append(payroll)
    
    db.commit()
    return {"message": f"Payroll generated for {len(payroll_records)} employees", "records": payroll_records}

@router.get("/dashboard")
def get_hrm_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_employees = db.query(Employee).filter(Employee.status == EmployeeStatus.ACTIVE).count()
    
    # Attendance today
    today = date.today()
    present_today = db.query(Attendance).filter(
        Attendance.date == today,
        Attendance.status == 'present'
    ).count()
    
    # Pending leaves
    pending_leaves = db.query(Leave).filter(Leave.status == 'pending').count()
    
    # Department wise count
    dept_counts = db.query(
        Employee.department,
        func.count(Employee.id).label('count')
    ).filter(Employee.status == EmployeeStatus.ACTIVE).group_by(Employee.department).all()
    
    return {
        "total_employees": total_employees,
        "present_today": present_today,
        "attendance_rate": (present_today / total_employees * 100) if total_employees > 0 else 0,
        "pending_leaves": pending_leaves,
        "department_counts": [{"department": dept, "count": count} for dept, count in dept_counts]
    }