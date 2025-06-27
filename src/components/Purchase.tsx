import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Plus, Search, FileText, Calendar } from 'lucide-react';

const Purchase: React.FC = () => {
  const { purchaseOrders, suppliers, addPurchaseOrder, addSupplier } = useERP();
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [newOrder, setNewOrder] = useState({
    supplier: '',
    expectedDelivery: '',
    items: [{ itemName: '', quantity: 0, unitPrice: 0 }]
  });

  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contact: '',
    email: '',
    address: '',
    paymentTerms: 'Net 30'
  });

  const filteredOrders = purchaseOrders.filter(order =>
    order.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddOrder = () => {
    const totalAmount = newOrder.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const order = {
      id: `PO-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      supplier: newOrder.supplier,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDelivery: newOrder.expectedDelivery,
      status: 'pending' as const,
      items: newOrder.items.map((item, index) => ({
        itemId: (index + 1).toString(),
        itemName: item.itemName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice
      })),
      totalAmount
    };
    addPurchaseOrder(order);
    setNewOrder({
      supplier: '',
      expectedDelivery: '',
      items: [{ itemName: '', quantity: 0, unitPrice: 0 }]
    });
    setShowOrderForm(false);
  };

  const handleAddSupplier = () => {
    const supplier = {
      id: (suppliers.length + 1).toString(),
      name: newSupplier.name,
      contact: newSupplier.contact,
      email: newSupplier.email,
      address: newSupplier.address,
      paymentTerms: newSupplier.paymentTerms,
      rating: 0
    };
    addSupplier(supplier);
    setNewSupplier({
      name: '',
      contact: '',
      email: '',
      address: '',
      paymentTerms: 'Net 30'
    });
    setShowSupplierForm(false);
  };

  const addOrderItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { itemName: '', quantity: 0, unitPrice: 0 }]
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Purchase Management</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setShowSupplierForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Supplier
          </button>
          <button
            onClick={() => setShowOrderForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Purchase Order
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search purchase orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full max-w-md border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Purchase Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expected Delivery
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{order.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.supplier}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 mr-1" />
                      {order.orderDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.expectedDelivery}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
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

      {/* Suppliers List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Suppliers</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900">{supplier.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{supplier.contact}</p>
              <p className="text-sm text-gray-600">{supplier.email}</p>
              <p className="text-sm text-gray-600 mt-2">{supplier.address}</p>
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {supplier.paymentTerms}
                </span>
                <div className="flex items-center">
                  <span className="text-yellow-400">★</span>
                  <span className="text-sm text-gray-600 ml-1">{supplier.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Purchase Order Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">New Purchase Order</h3>
            <div className="space-y-4">
              <select
                value={newOrder.supplier}
                onChange={(e) => setNewOrder({...newOrder, supplier: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.name}>
                    {supplier.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={newOrder.expectedDelivery}
                onChange={(e) => setNewOrder({...newOrder, expectedDelivery: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium mb-3">Order Items</h4>
                {newOrder.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4 mb-3">
                    <input
                      type="text"
                      placeholder="Item Name"
                      value={item.itemName}
                      onChange={(e) => updateOrderItem(index, 'itemName', e.target.value)}
                      className="p-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="p-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Unit Price"
                      value={item.unitPrice}
                      onChange={(e) => updateOrderItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                ))}
                <button
                  onClick={addOrderItem}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  + Add Item
                </button>
              </div>
              
              <div className="text-right">
                <p className="text-lg font-semibold">
                  Total: ${newOrder.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleAddOrder}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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

      {/* Add Supplier Modal */}
      {showSupplierForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Supplier</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Supplier Name"
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Contact Number"
                value={newSupplier.contact}
                onChange={(e) => setNewSupplier({...newSupplier, contact: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              <input
                type="email"
                placeholder="Email"
                value={newSupplier.email}
                onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              <textarea
                placeholder="Address"
                value={newSupplier.address}
                onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
                rows={3}
              />
              <select
                value={newSupplier.paymentTerms}
                onChange={(e) => setNewSupplier({...newSupplier, paymentTerms: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="Net 30">Net 30</option>
                <option value="Net 15">Net 15</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
              </select>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleAddSupplier}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Supplier
              </button>
              <button
                onClick={() => setShowSupplierForm(false)}
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

export default Purchase;