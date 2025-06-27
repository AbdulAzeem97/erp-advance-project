import React from 'react';
import { useERP } from '../context/ERPContext';
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
  Zap
} from 'lucide-react';

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
  const nearExpiryItems = [...rawMaterials, ...finishedProducts].filter(item => 
    item.status === 'near-expiry' || item.status === 'expired'
  ).length;
  
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netProfit = totalIncome - totalExpenses;
  
  const pendingOrders = purchaseOrders.filter(po => po.status === 'pending' || po.status === 'confirmed').length;
  const activeProductions = productions.filter(p => p.status === 'in-progress').length;
  const completedProductions = productions.filter(p => p.status === 'completed').length;
  
  const totalSalesValue = salesOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalCustomers = customers.length;
  
  const wastageAnalytics = getWastageAnalytics();
  const productionEfficiency = getProductionEfficiency();
  const profitabilityAnalysis = getProfitabilityAnalysis();
  const inventoryTurnover = getInventoryTurnover();
  
  const criticalAlerts = alerts.filter(alert => !alert.acknowledged && alert.severity === 'critical').length;
  const highAlerts = alerts.filter(alert => !alert.acknowledged && alert.severity === 'high').length;

  const stats = [
    {
      name: 'Raw Materials',
      value: totalRawMaterials,
      icon: Package,
      color: 'bg-blue-500',
      change: '+2.5%',
      subtext: `PKR ${rawMaterials.reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0).toLocaleString()}`
    },
    {
      name: 'Finished Products',
      value: totalFinishedProducts,
      icon: ShoppingBag,
      color: 'bg-green-500',
      change: '+5.2%',
      subtext: `PKR ${finishedProducts.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0).toLocaleString()}`
    },
    {
      name: 'Total Income',
      value: `PKR ${(totalIncome / 1000).toFixed(0)}K`,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      change: '+12.3%',
      subtext: 'This month'
    },
    {
      name: 'Net Profit',
      value: `PKR ${(netProfit / 1000).toFixed(0)}K`,
      icon: DollarSign,
      color: 'bg-purple-500',
      change: netProfit >= 0 ? '+18.7%' : '-5.2%',
      subtext: `Margin: ${profitabilityAnalysis.profitMargin.toFixed(1)}%`
    },
    {
      name: 'Production Efficiency',
      value: `${productionEfficiency.efficiency.toFixed(1)}%`,
      icon: Factory,
      color: 'bg-indigo-500',
      change: productionEfficiency.efficiency >= 90 ? 'Excellent' : 'Good',
      subtext: `Avg Yield: ${productionEfficiency.averageYield.toFixed(1)}%`
    },
    {
      name: 'Waste Value',
      value: `PKR ${(wastageAnalytics.totalWasteValue / 1000).toFixed(0)}K`,
      icon: Trash2,
      color: 'bg-red-500',
      change: 'Monitor',
      subtext: 'This month'
    },
    {
      name: 'Active Customers',
      value: totalCustomers,
      icon: Users,
      color: 'bg-cyan-500',
      change: '+8.1%',
      subtext: `Sales: PKR ${(totalSalesValue / 1000).toFixed(0)}K`
    },
    {
      name: 'Critical Alerts',
      value: criticalAlerts + highAlerts,
      icon: AlertTriangle,
      color: criticalAlerts > 0 ? 'bg-red-500' : 'bg-yellow-500',
      change: 'Action needed',
      subtext: `${criticalAlerts} Critical, ${highAlerts} High`
    }
  ];

  const recentTransactions = transactions.slice(-5).reverse();
  const recentOrders = purchaseOrders.slice(-3).reverse();
  const recentProductions = productions.slice(-3).reverse();

  return (
    <div className="space-y-8">
      {/* Critical Alerts Banner */}
      {criticalAlerts > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-400 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Critical Alerts Require Immediate Attention</h3>
              <p className="text-red-700">
                {criticalAlerts} critical alert{criticalAlerts > 1 ? 's' : ''} detected. Please review immediately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg mr-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className={`text-sm ${
                      stat.change.includes('+') ? 'text-green-600' : 
                      stat.change.includes('-') ? 'text-red-600' : 
                      'text-yellow-600'
                    }`}>
                      {stat.change}
                    </p>
                    <p className="text-xs text-gray-500">{stat.subtext}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-blue-500" />
            Inventory Health
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Stock Status</span>
              <span className={`font-semibold ${lowStockItems === 0 ? 'text-green-600' : 'text-red-600'}`}>
                {lowStockItems === 0 ? 'Healthy' : `${lowStockItems} Issues`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Expiry Status</span>
              <span className={`font-semibold ${nearExpiryItems === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                {nearExpiryItems === 0 ? 'Good' : `${nearExpiryItems} Near Expiry`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Turnover Ratio</span>
              <span className="font-semibold text-blue-600">
                {inventoryTurnover.turnoverRatio.toFixed(2)}x
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-green-500" />
            Production Metrics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Productions</span>
              <span className="font-semibold text-blue-600">{activeProductions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed This Month</span>
              <span className="font-semibold text-green-600">{completedProductions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Yield</span>
              <span className={`font-semibold ${
                productionEfficiency.averageYield >= 95 ? 'text-green-600' : 
                productionEfficiency.averageYield >= 85 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {productionEfficiency.averageYield.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-purple-500" />
            Quality & Waste
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Waste This Month</span>
              <span className="font-semibold text-red-600">
                PKR {(wastageAnalytics.totalWasteValue / 1000).toFixed(0)}K
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Quality Issues</span>
              <span className="font-semibold text-green-600">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Compliance</span>
              <span className="font-semibold text-green-600">100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="px-6 py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-500">{transaction.date}</p>
                  <p className="text-xs text-gray-400">{transaction.category}</p>
                </div>
                <div className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'income' ? '+' : '-'}PKR {transaction.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Purchase Orders */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Purchase Orders</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
            {recentOrders.map((order) => (
              <div key={order.id} className="px-6 py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{order.id}</p>
                    <p className="text-sm text-gray-500">{order.supplier}</p>
                    <p className="text-sm text-gray-500">{order.orderDate}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      PKR {order.finalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Productions */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Productions</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
            {recentProductions.map((production) => (
              <div key={production.id} className="px-6 py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{production.productName}</p>
                    <p className="text-sm text-gray-500">Batch: {production.batchNumber}</p>
                    <p className="text-sm text-gray-500">{production.endDate}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      production.status === 'completed' ? 'bg-green-100 text-green-800' :
                      production.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      production.status === 'planned' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {production.status}
                    </span>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {production.actualQuantity}/{production.plannedQuantity}
                    </p>
                    <p className="text-xs text-gray-500">
                      Yield: {production.yieldPercentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stock Alerts */}
      {(lowStockItems > 0 || nearExpiryItems > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">Inventory Alerts</h3>
              <div className="text-yellow-700 mt-1">
                {lowStockItems > 0 && (
                  <p>{lowStockItems} item{lowStockItems > 1 ? 's' : ''} running low on stock.</p>
                )}
                {nearExpiryItems > 0 && (
                  <p>{nearExpiryItems} item{nearExpiryItems > 1 ? 's' : ''} near expiry or expired.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;