# NutraPharma ERP System

A comprehensive Enterprise Resource Planning (ERP) system specifically designed for nutraceutical and pharmaceutical companies in Pakistan.

## 🚀 Features

### Core Modules
- **Inventory Management** - Raw materials and finished products tracking
- **Production Planning** - Complete production lifecycle management
- **Quality Control** - Comprehensive testing and approval workflows
- **Sales & Customer Management** - Order processing and CRM
- **Purchase Management** - Supplier management and procurement
- **Financial Management** - Income, expenses, and profitability tracking
- **Waste Management** - Loss detection and waste control
- **Supply Chain** - End-to-end supply chain visibility
- **Analytics & Reporting** - Real-time dashboards and insights

### Advanced Features
- **Multi-user Authentication** - Role-based access control
- **Real-time Alerts** - Critical notifications and warnings
- **Production Efficiency Tracking** - Yield optimization
- **Batch Tracking** - Complete traceability
- **Expiry Management** - Proactive expiry alerts
- **Loss Detection** - Automated waste and loss identification
- **Pakistani Compliance** - GST, NTN, STRN support
- **PKR Currency** - Local currency throughout

## 🛠 Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Robust relational database
- **SQLAlchemy** - Python ORM
- **Redis** - Caching and session management
- **Alembic** - Database migrations
- **JWT Authentication** - Secure token-based auth

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client
- **React Query** - Data fetching and caching
- **Lucide React** - Beautiful icons

## 📋 Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nutra-pharma-erp
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Create admin user**
   ```bash
   docker-compose exec backend python create_admin.py
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Manual Setup

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database and other configurations
   ```

5. **Setup database**
   ```bash
   # Create PostgreSQL database
   createdb nutra_pharma_erp
   
   # Run migrations
   alembic upgrade head
   ```

6. **Create admin user**
   ```bash
   python create_admin.py
   ```

7. **Start the backend server**
   ```bash
   python run.py
   ```

#### Frontend Setup

1. **Navigate to project root**
   ```bash
   cd ..
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## 👤 Default Login Credentials

- **Username:** admin
- **Password:** admin123

⚠️ **Important:** Change the default password after first login!

## 📊 Key Features

### Dashboard Analytics
- Real-time KPIs and metrics
- Production efficiency tracking
- Financial performance indicators
- Inventory health monitoring
- Waste analytics
- Alert management

### Inventory Management
- Raw material tracking with reorder levels
- Finished product management
- Batch and expiry tracking
- Stock status automation
- Location management
- Quality grade tracking

### Production Control
- Production planning and scheduling
- Batch manufacturing tracking
- Yield percentage monitoring
- Raw material consumption tracking
- Quality control integration
- Cost tracking (labor, overhead, materials)

### Quality Assurance
- Parameter-based testing
- Pass/fail tracking
- Inspector assignment
- Batch approval workflows
- Quality grade assignment
- Compliance reporting

### Financial Management
- Income and expense tracking
- Automatic GST calculations (18%)
- Profit margin analysis
- Payment terms management
- Credit limit monitoring
- Financial reporting

### Waste Management
- Waste reason categorization
- Value-based waste tracking
- Approval workflows
- Disposal method tracking
- Waste analytics and trends
- Loss prevention insights

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/nutra_pharma_erp

# Security
SECRET_KEY=your-super-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Redis
REDIS_URL=redis://localhost:6379

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## 📈 API Documentation

The API documentation is automatically generated and available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Token refresh mechanism
- CORS protection
- Input validation and sanitization

## 🌟 Production Deployment

### Backend Deployment

1. **Set production environment variables**
2. **Use a production WSGI server** (Gunicorn recommended)
3. **Setup SSL/TLS certificates**
4. **Configure reverse proxy** (Nginx recommended)
5. **Setup database backups**
6. **Configure monitoring and logging**

### Frontend Deployment

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Serve static files** with a web server (Nginx, Apache, or CDN)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the configuration guide

## 🔄 Updates and Maintenance

- Regular security updates
- Feature enhancements
- Bug fixes
- Performance optimizations
- Database migrations

---

**Built with ❤️ for the Pakistani pharmaceutical industry**