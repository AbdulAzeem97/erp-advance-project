import React, { useState } from 'react';
import { 
  Package, 
  ShoppingCart, 
  Store, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Truck, 
  BarChart3,
  Menu,
  X,
  Home,
  Factory,
  Shield,
  Trash2,
  Users,
  FileText,
  Bell,
  Settings
} from 'lucide-react';
import { useERP } from '../context/ERPContext';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { alerts } = useERP();
  
  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);
  const criticalAlerts = unacknowledgedAlerts.filter(alert => alert.severity === 'critical');

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'inventory', name: 'Inventory', icon: Package },
    { id: 'purchase', name: 'Purchase', icon: ShoppingCart },
    { id: 'production', name: 'Production', icon: Factory },
    { id: 'quality', name: 'Quality Control', icon: Shield },
    { id: 'store', name: 'Store', icon: Store },
    { id: 'sales', name: 'Sales', icon: TrendingUp },
    { id: 'customers', name: 'Customers', icon: Users },
    { id: 'income', name: 'Income', icon: TrendingUp },
    { id: 'expense', name: 'Expense', icon: TrendingDown },
    { id: 'finance', name: 'Finance', icon: DollarSign },
    { id: 'waste', name: 'Waste Management', icon: Trash2 },
    { id: 'supply', name: 'Supply Chain', icon: Truck },
    { id: 'reports', name: 'Reports', icon: BarChart3 },
    { id: 'alerts', name: 'Alerts', icon: Bell },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white p-2 rounded-md shadow-md relative"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          {criticalAlerts.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {criticalAlerts.length}
            </span>
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex items-center justify-center h-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <Package className="h-8 w-8 mr-2" />
          <div className="text-center">
            <h1 className="text-lg font-bold">NutraPharma ERP</h1>
            <p className="text-xs opacity-90">Pakistan</p>
          </div>
        </div>
        
        <nav className="mt-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasAlerts = item.id === 'alerts' && unacknowledgedAlerts.length > 0;
            const hasCriticalAlerts = item.id === 'alerts' && criticalAlerts.length > 0;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center px-6 py-3 text-left hover:bg-blue-50 transition-colors relative
                  ${currentPage === item.id ? 'bg-blue-50 border-r-4 border-blue-600 text-blue-600' : 'text-gray-700'}
                `}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
                {hasAlerts && (
                  <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                    hasCriticalAlerts ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'
                  }`}>
                    {unacknowledgedAlerts.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="lg:hidden w-8"></div>
              <h2 className="text-2xl font-semibold text-gray-900 capitalize">
                {currentPage === 'dashboard' ? 'Dashboard' : currentPage.replace('-', ' ')}
              </h2>
              <div className="flex items-center space-x-4">
                {unacknowledgedAlerts.length > 0 && (
                  <button
                    onClick={() => onPageChange('alerts')}
                    className="relative p-2 text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {unacknowledgedAlerts.length}
                    </span>
                  </button>
                )}
                <div className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-PK')}
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;