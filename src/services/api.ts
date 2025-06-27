import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          
          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);
          
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      } else {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Inventory API
export const inventoryAPI = {
  getRawMaterials: async () => {
    const response = await api.get('/inventory/raw-materials');
    return response.data;
  },
  
  createRawMaterial: async (data: any) => {
    const response = await api.post('/inventory/raw-materials', data);
    return response.data;
  },
  
  updateRawMaterial: async (id: number, data: any) => {
    const response = await api.put(`/inventory/raw-materials/${id}`, data);
    return response.data;
  },
  
  getFinishedProducts: async () => {
    const response = await api.get('/inventory/finished-products');
    return response.data;
  },
  
  createFinishedProduct: async (data: any) => {
    const response = await api.post('/inventory/finished-products', data);
    return response.data;
  },
  
  updateStock: async (productId: number, quantityChange: number) => {
    const response = await api.put(`/inventory/finished-products/${productId}/stock`, {
      quantity_change: quantityChange,
    });
    return response.data;
  },

  // Bulk operations
  bulkImportRawMaterials: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/inventory-advanced/bulk-import/raw-materials', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  exportRawMaterials: async (format: 'csv' | 'excel' = 'csv') => {
    const response = await api.get(`/inventory-advanced/export/raw-materials?format=${format}`);
    return response.data;
  },

  advancedSearch: async (params: any) => {
    const response = await api.get('/inventory-advanced/advanced-search', { params });
    return response.data;
  },

  getInventoryOptimization: async () => {
    const response = await api.get('/inventory-advanced/inventory-optimization');
    return response.data;
  },
};

// Factory Analytics API
export const factoryAPI = {
  getCostAnalysis: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await api.get(`/factory-analytics/cost-analysis?${params}`);
    return response.data;
  },

  getWasteOptimization: async () => {
    const response = await api.get('/factory-analytics/waste-optimization');
    return response.data;
  },

  getProfitOptimization: async () => {
    const response = await api.get('/factory-analytics/profit-optimization');
    return response.data;
  },

  getEfficiencyMetrics: async () => {
    const response = await api.get('/factory-analytics/efficiency-metrics');
    return response.data;
  },

  createCostReductionPlan: async (targetReductionPercentage: number) => {
    const response = await api.post('/factory-analytics/cost-reduction-plan', {
      target_reduction_percentage: targetReductionPercentage,
    });
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  getDashboard: async () => {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  },
  
  getWasteAnalytics: async () => {
    const response = await api.get('/analytics/waste-analytics');
    return response.data;
  },
  
  getProductionEfficiency: async () => {
    const response = await api.get('/analytics/production-efficiency');
    return response.data;
  },
};

// HRM API
export const hrmAPI = {
  getEmployees: async (params?: any) => {
    const response = await api.get('/hrm/employees', { params });
    return response.data;
  },

  createEmployee: async (data: any) => {
    const response = await api.post('/hrm/employees', data);
    return response.data;
  },

  getAttendance: async (params?: any) => {
    const response = await api.get('/hrm/attendance', { params });
    return response.data;
  },

  markAttendance: async (data: any) => {
    const response = await api.post('/hrm/attendance', data);
    return response.data;
  },

  getLeaves: async (params?: any) => {
    const response = await api.get('/hrm/leaves', { params });
    return response.data;
  },

  applyLeave: async (data: any) => {
    const response = await api.post('/hrm/leaves', data);
    return response.data;
  },

  approveLeave: async (leaveId: number, approved: boolean) => {
    const response = await api.put(`/hrm/leaves/${leaveId}/approve`, { approved });
    return response.data;
  },

  getPayroll: async (params?: any) => {
    const response = await api.get('/hrm/payroll', { params });
    return response.data;
  },

  generatePayroll: async (month: number, year: number) => {
    const response = await api.post('/hrm/payroll/generate', { month, year });
    return response.data;
  },

  getDashboard: async () => {
    const response = await api.get('/hrm/dashboard');
    return response.data;
  },
};

// CRM API
export const crmAPI = {
  getLeads: async (params?: any) => {
    const response = await api.get('/crm/leads', { params });
    return response.data;
  },

  createLead: async (data: any) => {
    const response = await api.post('/crm/leads', data);
    return response.data;
  },

  updateLead: async (leadId: number, data: any) => {
    const response = await api.put(`/crm/leads/${leadId}`, data);
    return response.data;
  },

  getActivities: async (params?: any) => {
    const response = await api.get('/crm/activities', { params });
    return response.data;
  },

  createActivity: async (data: any) => {
    const response = await api.post('/crm/activities', data);
    return response.data;
  },

  getOpportunities: async (params?: any) => {
    const response = await api.get('/crm/opportunities', { params });
    return response.data;
  },

  createOpportunity: async (data: any) => {
    const response = await api.post('/crm/opportunities', data);
    return response.data;
  },

  getInvoices: async (params?: any) => {
    const response = await api.get('/crm/invoices', { params });
    return response.data;
  },

  createInvoice: async (data: any) => {
    const response = await api.post('/crm/invoices', data);
    return response.data;
  },

  createPayment: async (data: any) => {
    const response = await api.post('/crm/payments', data);
    return response.data;
  },

  getQuotations: async (params?: any) => {
    const response = await api.get('/crm/quotations', { params });
    return response.data;
  },

  createQuotation: async (data: any) => {
    const response = await api.post('/crm/quotations', data);
    return response.data;
  },

  getDashboard: async () => {
    const response = await api.get('/crm/dashboard');
    return response.data;
  },
};

// Reports API
export const reportsAPI = {
  generateInvoicePDF: async (invoiceId: number) => {
    const response = await api.get(`/reports/invoice/${invoiceId}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  generateSalesReport: async (startDate: string, endDate: string, format: 'json' | 'pdf' = 'json') => {
    const response = await api.get('/reports/sales-report', {
      params: { start_date: startDate, end_date: endDate, format },
      responseType: format === 'pdf' ? 'blob' : 'json',
    });
    return response.data;
  },

  generateInventoryReport: async (format: 'json' | 'pdf' = 'json') => {
    const response = await api.get('/reports/inventory-report', {
      params: { format },
      responseType: format === 'pdf' ? 'blob' : 'json',
    });
    return response.data;
  },

  generateFinancialReport: async (startDate: string, endDate: string, format: 'json' | 'pdf' = 'json') => {
    const response = await api.get('/reports/financial-report', {
      params: { start_date: startDate, end_date: endDate, format },
      responseType: format === 'pdf' ? 'blob' : 'json',
    });
    return response.data;
  },
};

export default api;