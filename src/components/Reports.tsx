import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { BarChart3, PieChart, TrendingUp, Download, Calendar } from 'lucide-react';

const Reports: React.FC = () => {
  const { transactions, rawMaterials, finishedProducts, purchaseOrders } = useERP();
  const [selectedReport, setSelectedReport] = useState('financial');

  // Financial calculations
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0';

  // Inventory calculations
  const totalRawMaterialValue = rawMaterials.reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0);
  const totalFinishedProductValue = finishedProducts.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
  const lowStockItems = [...rawMaterials, ...finishedProducts].filter(item => item.status === 'low-stock').length;

  // Purchase calculations
  const totalPurchaseValue = purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0);
  const pendingOrders = purchaseOrders.filter(po => po.status === 'pending' || po.status === 'confirmed').length;

  // Income by category
  const incomeByCategory = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  // Expense by category
  const expenseByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const reportTypes = [
    { id: 'financial', name: 'Financial Report', icon: TrendingUp },
    { id: 'inventory', name: 'Inventory Report', icon: BarChart3 },
    { id: 'purchase', name: 'Purchase Report', icon: PieChart },
  ];

  const renderFinancialReport = () => (
    <div className="space-y-6">
      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-sm font-medium text-green-800 mb-2">Total Income</h3>
          <p className="text-2xl font-bold text-green-900">${totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-6">
          <h3 className="text-sm font-medium text-red-800 mb-2">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-900">${totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Net Profit</h3>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-900' : 'text-red-900'}`}>
            ${netProfit.toLocaleString()}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-6">
          <h3 className="text-sm font-medium text-purple-800 mb-2">Profit Margin</h3>
          <p className="text-2xl font-bold text-purple-900">{profitMargin}%</p>
        </div>
      </div>

      {/* Income vs Expenses Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Income by Category</h3>
          <div className="space-y-3">
            {Object.entries(incomeByCategory).map(([category, amount]) => {
              const percentage = (amount / totalIncome) * 100;
              return (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{category}</span>
                    <span>${amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Expenses by Category</h3>
          <div className="space-y-3">
            {Object.entries(expenseByCategory).map(([category, amount]) => {
              const percentage = (amount / totalExpenses) * 100;
              return (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{category}</span>
                    <span>${amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.slice(-10).reverse().map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.category}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderInventoryReport = () => (
    <div className="space-y-6">
      {/* Inventory Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Raw Materials</h3>
          <p className="text-2xl font-bold text-blue-900">{rawMaterials.length}</p>
          <p className="text-sm text-blue-600">${totalRawMaterialValue.toLocaleString()} value</p>
        </div>
        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-sm font-medium text-green-800 mb-2">Finished Products</h3>
          <p className="text-2xl font-bold text-green-900">{finishedProducts.length}</p>
          <p className="text-sm text-green-600">${totalFinishedProductValue.toLocaleString()} value</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-6">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Low Stock Items</h3>
          <p className="text-2xl font-bold text-yellow-900">{lowStockItems}</p>
          <p className="text-sm text-yellow-600">Need attention</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-6">
          <h3 className="text-sm font-medium text-purple-800 mb-2">Total Inventory Value</h3>
          <p className="text-2xl font-bold text-purple-900">
            ${(totalRawMaterialValue + totalFinishedProductValue).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Stock Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Raw Materials Stock Status</h3>
          <div className="space-y-3">
            {rawMaterials.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    item.status === 'in-stock' ? 'bg-green-100 text-green-800' :
                    item.status === 'low-stock' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.status.replace('-', ' ')}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{item.quantity} {item.unit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Finished Products Stock Status</h3>
          <div className="space-y-3">
            {finishedProducts.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    item.status === 'in-stock' ? 'bg-green-100 text-green-800' :
                    item.status === 'low-stock' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.status.replace('-', ' ')}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{item.quantity} {item.unit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPurchaseReport = () => (
    <div className="space-y-6">
      {/* Purchase Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Total Orders</h3>
          <p className="text-2xl font-bold text-blue-900">{purchaseOrders.length}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-6">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Pending Orders</h3>
          <p className="text-2xl font-bold text-yellow-900">{pendingOrders}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-sm font-medium text-green-800 mb-2">Total Purchase Value</h3>
          <p className="text-2xl font-bold text-green-900">${totalPurchaseValue.toLocaleString()}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-6">
          <h3 className="text-sm font-medium text-purple-800 mb-2">Active Suppliers</h3>
          <p className="text-2xl font-bold text-purple-900">
            {[...new Set(purchaseOrders.map(po => po.supplier))].length}
          </p>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Purchase Orders Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {purchaseOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.supplier}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.orderDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'confirmed' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${order.totalAmount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <div className="flex gap-4">
          <button className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="flex items-center px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              return (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={`py-3 px-6 border-b-2 font-medium text-sm flex items-center ${
                    selectedReport === report.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {report.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Report Content */}
      <div>
        {selectedReport === 'financial' && renderFinancialReport()}
        {selectedReport === 'inventory' && renderInventoryReport()}
        {selectedReport === 'purchase' && renderPurchaseReport()}
      </div>
    </div>
  );
};

export default Reports;