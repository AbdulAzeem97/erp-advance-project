import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Settings,
  LogOut,
  User,
  Building,
  Calendar,
  CreditCard,
  UserCheck,
  Target,
  Activity,
  Zap
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { useAuth } from '../../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { alerts } = useERP();
  const { user, logout } = useAuth();
  
  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);
  const criticalAlerts = unacknowledgedAlerts.filter(alert => alert.severity === 'critical');

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Home, category: 'main' },
    { id: 'crm', name: 'CRM', icon: Target, category: 'sales' },
    { id: 'customers', name: 'Customers', icon: Users, category: 'sales' },
    { id: 'leads', name: 'Leads', icon: Activity, category: 'sales' },
    { id: 'sales', name: 'Sales Orders', icon: TrendingUp, category: 'sales' },
    { id: 'invoices', name: 'Invoices', icon: FileText, category: 'finance' },
    { id: 'inventory', name: 'Inventory', icon: Package, category: 'operations' },
    { id: 'store', name: 'Store', icon: Store, category: 'operations' },
    { id: 'purchase', name: 'Purchase', icon: ShoppingCart, category: 'operations' },
    { id: 'production', name: 'Production', icon: Factory, category: 'operations' },
    { id: 'quality', name: 'Quality Control', icon: Shield, category: 'operations' },
    { id: 'waste', name: 'Waste Management', icon: Trash2, category: 'operations' },
    { id: 'supply', name: 'Supply Chain', icon: Truck, category: 'operations' },
    { id: 'factory-analytics', name: 'Factory Analytics', icon: Zap, category: 'analytics' },
    { id: 'hrm', name: 'Human Resources', icon: UserCheck, category: 'hr' },
    { id: 'finance', name: 'Finance', icon: DollarSign, category: 'finance' },
    { id: 'reports', name: 'Reports', icon: BarChart3, category: 'analytics' },
    { id: 'alerts', name: 'Alerts', icon: Bell, category: 'main' },
  ];

  const categories = {
    main: { name: 'Main', color: 'text-blue-600' },
    sales: { name: 'Sales & CRM', color: 'text-green-600' },
    operations: { name: 'Operations', color: 'text-purple-600' },
    hr: { name: 'Human Resources', color: 'text-orange-600' },
    finance: { name: 'Finance', color: 'text-yellow-600' },
    analytics: { name: 'Analytics', color: 'text-red-600' }
  };

  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white p-3 rounded-xl shadow-lg relative"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          {criticalAlerts.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              {criticalAlerts.length}
            </span>
          )}
        </motion.button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: sidebarOpen || window.innerWidth >= 1024 ? 0 : -300 }}
          exit={{ x: -300 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`
            fixed inset-y-0 left-0 z-40 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 lg:static lg:inset-0
          `}
        >
          {/* Logo */}
          <div className="flex items-center justify-center h-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white">
            <Package className="h-10 w-10 mr-3" />
            <div className="text-center">
              <h1 className="text-xl font-bold">NutraPharma ERP</h1>
              <p className="text-xs opacity-90">Complete Business Solution</p>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="mt-6 max-h-[calc(100vh-8rem)] overflow-y-auto px-4">
            {Object.entries(groupedMenuItems).map(([category, items]) => (
              <div key={category} className="mb-6">
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 px-3 ${categories[category as keyof typeof categories].color}`}>
                  {categories[category as keyof typeof categories].name}
                </h3>
                <div className="space-y-1">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const hasAlerts = item.id === 'alerts' && unacknowledgedAlerts.length > 0;
                    const hasCriticalAlerts = item.id === 'alerts' && criticalAlerts.length > 0;
                    
                    return (
                      <motion.button
                        key={item.id}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          onPageChange(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`
                          w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 relative group
                          ${currentPage === item.id 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                            : 'text-gray-700 hover:bg-gray-100'
                          }
                        `}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        <span className="font-medium">{item.name}</span>
                        {hasAlerts && (
                          <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                            hasCriticalAlerts ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'
                          }`}>
                            {unacknowledgedAlerts.length}
                          </span>
                        )}
                        {currentPage === item.id && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full"
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </motion.div>
      </AnimatePresence>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="lg:hidden w-8"></div>
              
              {/* Page Title */}
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-2xl font-bold text-gray-900 capitalize">
                  {currentPage === 'dashboard' ? 'Dashboard' : 
                   currentPage === 'crm' ? 'Customer Relationship Management' :
                   currentPage === 'hrm' ? 'Human Resource Management' :
                   currentPage === 'factory-analytics' ? 'Factory Analytics & Optimization' :
                   currentPage.replace('-', ' ')}
                </h2>
              </div>
              
              {/* Header Actions */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                {unacknowledgedAlerts.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onPageChange('alerts')}
                    className="relative p-2 text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <Bell className="h-6 w-6" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unacknowledgedAlerts.length}
                    </span>
                  </motion.button>
                )}

                {/* User Menu */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-900">{user?.full_name || 'Admin User'}</p>
                      <p className="text-xs text-gray-500">{user?.role || 'Administrator'}</p>
                    </div>
                  </motion.button>

                  {/* User Dropdown */}
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                      >
                        <div className="px-4 py-2 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          Profile
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </button>
                        <div className="border-t border-gray-200 mt-2 pt-2">
                          <button 
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Current Date */}
                <div className="hidden md:flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date().toLocaleDateString('en-PK', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;