import React from 'react';
import { useERP } from '../../context/ERPContext';
import { 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  DollarSign,
  Factory,
  Shield,
  Trash2,
  Users,
  Target,
  Zap,
  Calendar,
  Clock,
  Award,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const { 
    rawMaterials, 
    finishedProducts, 
    transactions, 
    purchaseOrders,
    productions,
    salesOrders,
    wasteRecords,
    customers,
    alerts,
    getWastageAnalytics,
    getProductionEfficiency,
    getProfitabilityAnalysis,
    getInventoryTurnover
  } = useERP();

  const totalRawMaterials = rawMaterials.length;
  const totalFinishedProducts = finishedProducts.length;
  const lowStockItems = [...rawMaterials, ...finishedProducts].filter(item => 
    item.status === 'low-stock' || item.status === 'out-of-stock'
  ).length;
  
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netProfit = totalIncome - totalExpenses;
  
  const activeProductions = productions.filter(p => p.status === 'in-progress').length;
  const totalSalesValue = salesOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalCustomers = customers.length;
  
  const wastageAnalytics = getWastageAnalytics();
  const productionEfficiency = getProductionEfficiency();
  const profitabilityAnalysis = getProfitabilityAnalysis();
  
  const criticalAlerts = alerts.filter(alert => !alert.acknowledged && alert.severity === 'critical').length;

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: `PKR ${(totalIncome / 1000).toFixed(0)}K`,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    },
    {
      title: 'Net Profit',
      value: `PKR ${(netProfit / 1000).toFixed(0)}K`,
      change: netProfit >= 0 ? '+8.2%' : '-3.1%',
      trend: netProfit >= 0 ? 'up' : 'down',
      icon: TrendingUp,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Active Orders',
      value: salesOrders.filter(o => o.status === 'pending' || o.status === 'confirmed').length,
      change: '+15.3%',
      trend: 'up',
      icon: ShoppingBag,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Production Efficiency',
      value: `${productionEfficiency.efficiency.toFixed(1)}%`,
      change: productionEfficiency.efficiency >= 90 ? 'Excellent' : 'Good',
      trend: 'up',
      icon: Factory,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600'
    },
    {
      title: 'Inventory Value',
      value: `PKR ${((rawMaterials.reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0) + finishedProducts.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0)) / 1000).toFixed(0)}K`,
      change: '+5.7%',
      trend: 'up',
      icon: Package,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      title: 'Customer Satisfaction',
      value: '94.2%',
      change: '+2.1%',
      trend: 'up',
      icon: Award,
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600'
    }
  ];

  const quickStats = [
    { label: 'Raw Materials', value: totalRawMaterials, icon: Package, color: 'text-blue-600' },
    { label: 'Finished Products', value: totalFinishedProducts, icon: ShoppingBag, color: 'text-green-600' },
    { label: 'Active Customers', value: totalCustomers, icon: Users, color: 'text-purple-600' },
    { label: 'Low Stock Items', value: lowStockItems, icon: AlertTriangle, color: 'text-red-600' }
  ];

  return (
    <div className="space-y-8">
      {/* Critical Alerts Banner */}
      {criticalAlerts > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-xl shadow-lg"
        >
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 mr-3" />
            <div>
              <h3 className="text-lg font-semibold">Critical Alerts Require Immediate Attention</h3>
              <p>{criticalAlerts} critical alert{criticalAlerts > 1 ? 's' : ''} detected. Please review immediately.</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-2xl shadow-xl">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome to NutraPharma ERP</h1>
            <p className="text-blue-100">Your complete business management solution</p>
          </div>
          <div className="text-right">
            <p className="text-blue-100">Today</p>
            <p className="text-xl font-semibold">{new Date().toLocaleDateString('en-PK')}</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${kpi.bgColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{kpi.title}</p>
                  <p className={`text-3xl font-bold ${kpi.textColor} mt-2`}>{kpi.value}</p>
                  <div className="flex items-center mt-2">
                    {kpi.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
                <div className={`${kpi.color} p-4 rounded-xl`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center">
                <Icon className={`h-8 w-8 ${stat.color} mr-3`} />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-blue-500" />
            Inventory Health
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Stock Status</span>
              <span className={`font-semibold px-3 py-1 rounded-full text-sm ${lowStockItems === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {lowStockItems === 0 ? 'Healthy' : `${lowStockItems} Issues`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Turnover Ratio</span>
              <span className="font-semibold text-blue-600">
                {getInventoryTurnover().turnoverRatio.toFixed(2)}x
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(getInventoryTurnover().turnoverRatio * 20, 100)}%` }}
              ></div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-green-500" />
            Production Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Productions</span>
              <span className="font-semibold text-blue-600">{activeProductions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Efficiency Rate</span>
              <span className={`font-semibold ${
                productionEfficiency.efficiency >= 90 ? 'text-green-600' : 
                productionEfficiency.efficiency >= 75 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {productionEfficiency.efficiency.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  productionEfficiency.efficiency >= 90 ? 'bg-green-600' : 
                  productionEfficiency.efficiency >= 75 ? 'bg-yellow-600' : 'bg-red-600'
                }`}
                style={{ width: `${productionEfficiency.efficiency}%` }}
              ></div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-purple-500" />
            Quality & Compliance
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Quality Score</span>
              <span className="font-semibold text-green-600">98.5%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Compliance Rate</span>
              <span className="font-semibold text-green-600">100%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full w-[98.5%] transition-all duration-500"></div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              Recent Activity
            </h3>
          </div>
          <div className="p-6 space-y-4 max-h-80 overflow-y-auto">
            {transactions.slice(-5).reverse().map((transaction, index) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg mr-3 ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {transaction.type === 'income' ? 
                      <TrendingUp className="h-4 w-4 text-green-600" /> : 
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    }
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">{transaction.date}</p>
                  </div>
                </div>
                <span className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'income' ? '+' : '-'}PKR {transaction.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
              Sales Trend
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May'].map((month, index) => {
                const value = Math.random() * 100;
                return (
                  <div key={month} className="flex items-center justify-between">
                    <span className="text-gray-600 w-12">{month}</span>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${value}%` }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        ></motion.div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-16 text-right">
                      PKR {(value * 10).toFixed(0)}K
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;