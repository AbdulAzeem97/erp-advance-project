import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Plus, TrendingUp, Package, Users, DollarSign, FileText } from 'lucide-react';

const Sales: React.FC = () => {
  const { salesOrders, customers, finishedProducts, addSalesOrder } = useERP();
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'delivered'>('all');

  const [newOrder, setNewOrder] = useState({
    customerId: '',
    customerName: '',
    deliveryDate: '',
    items: [{ productId: '', productName: '', quantity: 0, unitPrice: 0, discount: 0 }],
    salesPerson: ''
  });

  const filteredOrders = salesOrders.filter(order => {
    switch (activeTab) {
      case 'pending': return order.status === 'pending' || order.status === 'confirmed';
      case 'delivered': return order.status === 'delivered';
      default: return true;
    }
  });

  const handleAddOrder = () => {
    const subtotal = newOrder.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const discountAmount = newOrder.items.reduce((sum, item) => sum + ((item.quantity * item.unitPrice * item.discount) / 100), 0);
    const taxAmount = (subtotal - discountAmount) * 0.18; // 18% GST
    const totalAmount = subtotal - discountAmount + taxAmount;

    const order = {
      id: `SO-${String(salesOrders.length + 1).padStart(3, '0')}`,
      customerId: newOrder.customerId,
      customerName: newOrder.customerName,
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: newOrder.deliveryDate,
      status: 'pending' as const,
      items: newOrder.items.map(item => ({
        ...item,
        total: (item.quantity * item.unitPrice) - ((item.quantity * item.unitPrice * item.discount) / 100)
      })),
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      paymentStatus: 'pending' as const,
      salesPerson: newOrder.salesPerson
    };

    addSalesOrder(order);
    setNewOrder({
      customerId: '',
      customerName: '',
      deliveryDate: '',
      items: [{ productId: '', productName: '', quantity: 0, unitPrice: 0, discount: 0 }],
      salesPerson: ''
    });
    setShowOrderForm(false);
  };

  const addOrderItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { productId: '', productName: '', quantity: 0, unitPrice: 0, discount: 0 }]
    });
  };

  const updateOrderItem = (index: number, field: string, value: any) => {
    const updatedItems = newOrder.items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setNewOrder({ ...newOrder, items: updatedItems });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalSalesValue = salesOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingOrders = salesOrders.filter(order => order.status === 'pending' || order.status === 'confirmed').length;
  const deliveredOrders = salesOrders.filter(order => order.status === 'delivered').length;
  const averageOrderValue = salesOrders.length > 0 ? totalSalesValue / salesOrders.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Sales Management</h2>
        <button
          onClick={() => setShowOrderForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Sales Order
        </button>
      </div>

      {/* Sales Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-green-500 p-3 rounded-lg mr-4">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-green-600">PKR {(totalSalesValue / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 p-3 rounded-lg mr-4">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-blue-600">{salesOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-yellow-500 p-3 rounded-lg mr-4">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-purple-500 p-3 rounded-lg mr-4">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-purple-600">PKR {averageOrderValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-3 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Orders ({salesOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-3 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending ({pendingOrders})
            </button>
            <button
              onClick={() => setActiveTab('delivered')}
              className={`py-3 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'delivered'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Delivered ({deliveredOrders})
            </button>
          </nav>
        </div>

        {/* Sales Orders Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{order.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                    <div className="text-sm text-gray-500">Sales: {order.salesPerson}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.orderDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.deliveryDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    PKR {order.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                      order.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Sales Order Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">New Sales Order</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <select
                  value={newOrder.customerId}
                  onChange={(e) => {
                    const customer = customers.find(c => c.id === e.target.value);
                    setNewOrder({
                      ...newOrder, 
                      customerId: e.target.value,
                      customerName: customer?.name || ''
                    });
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
                
                <input
                  type="date"
                  value={newOrder.deliveryDate}
                  onChange={(e) => setNewOrder({...newOrder, deliveryDate: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                
                <input
                  type="text"
                  placeholder="Sales Person"
                  value={newOrder.salesPerson}
                  onChange={(e) => setNewOrder({...newOrder, salesPerson: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Order Items</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {newOrder.items.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="grid grid-cols-1 gap-2">
                        <select
                          value={item.productId}
                          onChange={(e) => {
                            const product = finishedProducts.find(p => p.id === e.target.value);
                            updateOrderItem(index, 'productId', e.target.value);
                            updateOrderItem(index, 'productName', product?.name || '');
                            updateOrderItem(index, 'unitPrice', product?.sellingPrice || 0);
                          }}
                          className="p-2 border border-gray-300 rounded text-sm"
                        >
                          <option value="">Select Product</option>
                          {finishedProducts.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} - PKR {product.sellingPrice}
                            </option>
                          ))}
                        </select>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            className="p-2 border border-gray-300 rounded text-sm"
                          />
                          <input
                            type="number"
                            placeholder="Price"
                            value={item.unitPrice}
                            onChange={(e) => updateOrderItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="p-2 border border-gray-300 rounded text-sm"
                          />
                          <input
                            type="number"
                            placeholder="Disc %"
                            value={item.discount}
                            onChange={(e) => updateOrderItem(index, 'discount', parseFloat(e.target.value) || 0)}
                            className="p-2 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addOrderItem}
                  className="mt-3 text-green-600 hover:text-green-700 text-sm"
                >
                  + Add Item
                </button>
                
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>PKR {newOrder.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>PKR {newOrder.items.reduce((sum, item) => sum + ((item.quantity * item.unitPrice * item.discount) / 100), 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (18%):</span>
                      <span>PKR {((newOrder.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) - newOrder.items.reduce((sum, item) => sum + ((item.quantity * item.unitPrice * item.discount) / 100), 0)) * 0.18).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <span>Total:</span>
                      <span>PKR {(newOrder.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) - newOrder.items.reduce((sum, item) => sum + ((item.quantity * item.unitPrice * item.discount) / 100), 0) + ((newOrder.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) - newOrder.items.reduce((sum, item) => sum + ((item.quantity * item.unitPrice * item.discount) / 100), 0)) * 0.18)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleAddOrder}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Create Order
              </button>
              <button
                onClick={() => setShowOrderForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;