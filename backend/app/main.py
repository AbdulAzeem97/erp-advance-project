from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import auth, inventory, analytics, hrm, crm, reports
from app.api.v1 import factory_analytics, inventory_advanced
from app.db.database import engine
from app.models import (
    user, inventory as inv_models, supplier, purchase, production, 
    sales, finance, quality, waste, alerts, employee, crm as crm_models, invoice
)

# Create tables
user.Base.metadata.create_all(bind=engine)
inv_models.Base.metadata.create_all(bind=engine)
supplier.Base.metadata.create_all(bind=engine)
purchase.Base.metadata.create_all(bind=engine)
production.Base.metadata.create_all(bind=engine)
sales.Base.metadata.create_all(bind=engine)
finance.Base.metadata.create_all(bind=engine)
quality.Base.metadata.create_all(bind=engine)
waste.Base.metadata.create_all(bind=engine)
alerts.Base.metadata.create_all(bind=engine)
employee.Base.metadata.create_all(bind=engine)
crm_models.Base.metadata.create_all(bind=engine)
invoice.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(inventory.router, prefix=f"{settings.API_V1_STR}/inventory", tags=["inventory"])
app.include_router(inventory_advanced.router, prefix=f"{settings.API_V1_STR}/inventory-advanced", tags=["inventory-advanced"])
app.include_router(factory_analytics.router, prefix=f"{settings.API_V1_STR}/factory-analytics", tags=["factory-analytics"])
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["analytics"])
app.include_router(hrm.router, prefix=f"{settings.API_V1_STR}/hrm", tags=["hrm"])
app.include_router(crm.router, prefix=f"{settings.API_V1_STR}/crm", tags=["crm"])
app.include_router(reports.router, prefix=f"{settings.API_V1_STR}/reports", tags=["reports"])

@app.get("/")
def read_root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": settings.VERSION}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)