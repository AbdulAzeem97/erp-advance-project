from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.invoice import Invoice, Payment
from app.models.sales import SalesOrder
from app.models.inventory import RawMaterial, FinishedProduct
from app.models.employee import Employee, Payroll
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from io import BytesIO
import os
from datetime import datetime, date
import tempfile

router = APIRouter()

def create_invoice_pdf(invoice_data: dict, customer_data: dict, company_data: dict):
    """Generate PDF invoice"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []
    
    # Company header
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        textColor=colors.HexColor('#2563eb')
    )
    
    story.append(Paragraph(company_data['name'], title_style))
    story.append(Paragraph(company_data['address'], styles['Normal']))
    story.append(Paragraph(f"Phone: {company_data['phone']} | Email: {company_data['email']}", styles['Normal']))
    story.append(Spacer(1, 20))
    
    # Invoice header
    invoice_title = ParagraphStyle(
        'InvoiceTitle',
        parent=styles['Heading2'],
        fontSize=18,
        textColor=colors.HexColor('#dc2626')
    )
    story.append(Paragraph("INVOICE", invoice_title))
    story.append(Spacer(1, 20))
    
    # Invoice details table
    invoice_details = [
        ['Invoice Number:', invoice_data['invoice_number']],
        ['Date:', invoice_data['issue_date']],
        ['Due Date:', invoice_data['due_date']],
        ['Payment Terms:', invoice_data['payment_terms']]
    ]
    
    details_table = Table(invoice_details, colWidths=[2*inch, 3*inch])
    details_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
    ]))
    story.append(details_table)
    story.append(Spacer(1, 20))
    
    # Customer details
    story.append(Paragraph("Bill To:", styles['Heading3']))
    story.append(Paragraph(customer_data['name'], styles['Normal']))
    story.append(Paragraph(customer_data['address'], styles['Normal']))
    story.append(Paragraph(f"{customer_data['city']}", styles['Normal']))
    story.append(Spacer(1, 20))
    
    # Items table
    items_data = [['Description', 'Quantity', 'Unit Price', 'Total']]
    for item in invoice_data['items']:
        items_data.append([
            item['description'],
            str(item['quantity']),
            f"PKR {item['unit_price']:,.2f}",
            f"PKR {item['total']:,.2f}"
        ])
    
    items_table = Table(items_data, colWidths=[3*inch, 1*inch, 1.5*inch, 1.5*inch])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f3f4f6')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    story.append(items_table)
    story.append(Spacer(1, 20))
    
    # Totals
    totals_data = [
        ['Subtotal:', f"PKR {invoice_data['subtotal']:,.2f}"],
        ['Discount:', f"PKR {invoice_data['discount_amount']:,.2f}"],
        ['Tax (18% GST):', f"PKR {invoice_data['tax_amount']:,.2f}"],
        ['Total Amount:', f"PKR {invoice_data['total_amount']:,.2f}"]
    ]
    
    totals_table = Table(totals_data, colWidths=[4*inch, 2*inch])
    totals_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, -1), (-1, -1), 12),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#f3f4f6')),
    ]))
    story.append(totals_table)
    story.append(Spacer(1, 30))
    
    # Terms and conditions
    if invoice_data.get('terms_conditions'):
        story.append(Paragraph("Terms & Conditions:", styles['Heading3']))
        story.append(Paragraph(invoice_data['terms_conditions'], styles['Normal']))
    
    doc.build(story)
    buffer.seek(0)
    return buffer

@router.get("/invoice/{invoice_id}/pdf")
def generate_invoice_pdf(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Company data
    company_data = {
        'name': 'NutraPharma ERP',
        'address': 'Industrial Area, Karachi, Pakistan',
        'phone': '+92-21-34567890',
        'email': 'info@nutrapharma.com'
    }
    
    # Customer data
    customer_data = {
        'name': invoice.customer.name,
        'address': invoice.customer.address,
        'city': invoice.customer.city
    }
    
    # Invoice data
    invoice_data = {
        'invoice_number': invoice.invoice_number,
        'issue_date': invoice.issue_date.strftime('%Y-%m-%d'),
        'due_date': invoice.due_date.strftime('%Y-%m-%d'),
        'payment_terms': invoice.payment_terms.value,
        'items': invoice.items,
        'subtotal': invoice.subtotal,
        'discount_amount': invoice.discount_amount,
        'tax_amount': invoice.tax_amount,
        'total_amount': invoice.total_amount,
        'terms_conditions': invoice.terms_conditions
    }
    
    pdf_buffer = create_invoice_pdf(invoice_data, customer_data, company_data)
    
    # Save to temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
        tmp_file.write(pdf_buffer.getvalue())
        tmp_file_path = tmp_file.name
    
    return FileResponse(
        tmp_file_path,
        media_type='application/pdf',
        filename=f"invoice_{invoice.invoice_number}.pdf"
    )

@router.get("/sales-report")
def generate_sales_report(
    start_date: date,
    end_date: date,
    format: str = "json",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Sales data
    sales_orders = db.query(SalesOrder).filter(
        SalesOrder.order_date >= start_date,
        SalesOrder.order_date <= end_date
    ).all()
    
    total_sales = sum(order.total_amount for order in sales_orders)
    total_orders = len(sales_orders)
    
    # Monthly breakdown
    monthly_sales = db.query(
        extract('month', SalesOrder.order_date).label('month'),
        func.sum(SalesOrder.total_amount).label('total')
    ).filter(
        SalesOrder.order_date >= start_date,
        SalesOrder.order_date <= end_date
    ).group_by(extract('month', SalesOrder.order_date)).all()
    
    # Customer breakdown
    customer_sales = db.query(
        SalesOrder.customer_name,
        func.sum(SalesOrder.total_amount).label('total'),
        func.count(SalesOrder.id).label('orders')
    ).filter(
        SalesOrder.order_date >= start_date,
        SalesOrder.order_date <= end_date
    ).group_by(SalesOrder.customer_name).all()
    
    report_data = {
        "period": f"{start_date} to {end_date}",
        "summary": {
            "total_sales": total_sales,
            "total_orders": total_orders,
            "average_order_value": total_sales / total_orders if total_orders > 0 else 0
        },
        "monthly_breakdown": [
            {"month": month, "total": float(total)} for month, total in monthly_sales
        ],
        "customer_breakdown": [
            {
                "customer": customer,
                "total_sales": float(total),
                "total_orders": orders,
                "average_order": float(total) / orders if orders > 0 else 0
            }
            for customer, total, orders in customer_sales
        ]
    }
    
    if format == "pdf":
        # Generate PDF report
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        story = []
        
        # Title
        story.append(Paragraph("Sales Report", styles['Title']))
        story.append(Paragraph(f"Period: {start_date} to {end_date}", styles['Normal']))
        story.append(Spacer(1, 20))
        
        # Summary
        story.append(Paragraph("Summary", styles['Heading2']))
        summary_data = [
            ['Total Sales:', f"PKR {total_sales:,.2f}"],
            ['Total Orders:', str(total_orders)],
            ['Average Order Value:', f"PKR {report_data['summary']['average_order_value']:,.2f}"]
        ]
        summary_table = Table(summary_data)
        summary_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ]))
        story.append(summary_table)
        story.append(Spacer(1, 20))
        
        # Customer breakdown
        story.append(Paragraph("Top Customers", styles['Heading2']))
        customer_data = [['Customer', 'Total Sales', 'Orders', 'Avg Order']]
        for customer in report_data['customer_breakdown'][:10]:  # Top 10
            customer_data.append([
                customer['customer'],
                f"PKR {customer['total_sales']:,.2f}",
                str(customer['total_orders']),
                f"PKR {customer['average_order']:,.2f}"
            ])
        
        customer_table = Table(customer_data)
        customer_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(customer_table)
        
        doc.build(story)
        buffer.seek(0)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            tmp_file.write(buffer.getvalue())
            tmp_file_path = tmp_file.name
        
        return FileResponse(
            tmp_file_path,
            media_type='application/pdf',
            filename=f"sales_report_{start_date}_{end_date}.pdf"
        )
    
    return report_data

@router.get("/inventory-report")
def generate_inventory_report(
    format: str = "json",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Raw materials
    raw_materials = db.query(RawMaterial).all()
    raw_material_value = sum(rm.quantity * rm.cost_per_unit for rm in raw_materials)
    
    # Finished products
    finished_products = db.query(FinishedProduct).all()
    finished_product_value = sum(fp.quantity * fp.cost_price for fp in finished_products)
    
    # Low stock items
    low_stock_raw = [rm for rm in raw_materials if rm.quantity <= rm.reorder_level]
    low_stock_finished = [fp for fp in finished_products if fp.status == 'low-stock']
    
    report_data = {
        "summary": {
            "total_raw_materials": len(raw_materials),
            "raw_material_value": raw_material_value,
            "total_finished_products": len(finished_products),
            "finished_product_value": finished_product_value,
            "total_inventory_value": raw_material_value + finished_product_value,
            "low_stock_items": len(low_stock_raw) + len(low_stock_finished)
        },
        "low_stock_alerts": {
            "raw_materials": [
                {
                    "name": rm.name,
                    "current_stock": rm.quantity,
                    "reorder_level": rm.reorder_level,
                    "supplier": rm.supplier
                } for rm in low_stock_raw
            ],
            "finished_products": [
                {
                    "name": fp.name,
                    "current_stock": fp.quantity,
                    "sku": fp.sku
                } for fp in low_stock_finished
            ]
        }
    }
    
    return report_data

@router.get("/financial-report")
def generate_financial_report(
    start_date: date,
    end_date: date,
    format: str = "json",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Revenue from invoices
    paid_invoices = db.query(Invoice).filter(
        Invoice.status == "paid",
        Invoice.issue_date >= start_date,
        Invoice.issue_date <= end_date
    ).all()
    
    total_revenue = sum(invoice.total_amount for invoice in paid_invoices)
    total_tax_collected = sum(invoice.tax_amount for invoice in paid_invoices)
    
    # Payroll expenses
    payroll_expenses = db.query(func.sum(Payroll.net_salary)).filter(
        Payroll.year == start_date.year,
        Payroll.month >= start_date.month,
        Payroll.month <= end_date.month
    ).scalar() or 0
    
    report_data = {
        "period": f"{start_date} to {end_date}",
        "revenue": {
            "total_revenue": total_revenue,
            "total_invoices": len(paid_invoices),
            "tax_collected": total_tax_collected
        },
        "expenses": {
            "payroll": payroll_expenses
        },
        "profit": {
            "gross_profit": total_revenue - payroll_expenses,
            "profit_margin": ((total_revenue - payroll_expenses) / total_revenue * 100) if total_revenue > 0 else 0
        }
    }
    
    return report_data