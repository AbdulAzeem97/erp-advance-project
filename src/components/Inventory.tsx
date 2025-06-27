import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Plus, Search, Filter, Package, AlertTriangle } from 'lucide-react';

const Inventory: React.FC = () => {
  const { rawMaterials, finishedProducts, addRawMaterial, addFinishedProduct } = useERP();
  const [activeTab, setActiveTab] = useState<'raw' | 'finished'>('raw');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const [newItem, setNewItem] = useState({
    name: '',
    supplier: '',
    quantity: 0,
    unit: '',
    costPerUnit: 0,
    reorderLevel: 0,
    expiryDate: '',
    batchNumber: '',
    sku: '',
    sellingPrice: 0,
    category: ''
  });

  const filteredRawMaterials = rawMaterials.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFinishedProducts = finishedProducts.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddItem = () => {
    if (activeTab === 'raw') {
      const rawMaterial = {
        id: Date.now().toString(),
        name: newItem.name,
        supplier: newItem.supplier,
        quantity: newItem.quantity,
        unit: newItem.unit,
        costPerUnit: newItem.costPerUnit,
        reorderLevel: newItem.reorderLevel,
        expiryDate: newItem.expiryDate,
        batchNumber: newItem.batchNumber,
        status: newItem.quantity <= newItem.reorderLevel ? 'low-stock' : 'in-stock' as 'in-stock' | 'low-stock' | 'out-of-stock'
      };
      addRawMaterial(rawMaterial);
    } else {
      const finishedProduct = {
        id: Date.now().toString(),
        name: newItem.name,
        sku: newItem.sku,
        quantity: newItem.quantity,
        unit: newItem.unit,
        costPrice: newItem.costPerUnit,
        sellingPrice: newItem.sellingPrice,
        category: newItem.category,
        expiryDate: newItem.expiryDate,
        batchNumber: newItem.batchNumber,
        status: newItem.quantity <= 50 ? 'low-stock' : 'in-stock' as 'in-stock' | 'low-stock' | 'out-of-stock'
      };
      addFinishedProduct(finishedProduct);
    }
    setNewItem({
      name: '',
      supplier: '',
      quantity: 0,
      unit: '',
      costPerUnit: 0,
      reorderLevel: 0,
      expiryDate: '',
      batchNumber: '',
      sku: '',
      sellingPrice: 0,
      category: ''
    });
    setShowAddForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'bg-green-100 text-green-800';
      case 'low-stock': return 'bg-yellow-100 text-yellow-800';
      case 'out-of-stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Item
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          <button
            onClick={() => setActiveTab('raw')}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'raw'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Raw Materials ({rawMaterials.length})
          </button>
          <button
            onClick={() => setActiveTab('finished')}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'finished'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Finished Products ({finishedProducts.length})
          </button>
        </nav>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {activeTab === 'raw' ? 'Supplier' : 'SKU'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeTab === 'raw' 
                ? filteredRawMaterials.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="h-8 w-8 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">Batch: {item.batchNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.supplier}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.quantity} {item.unit}</div>
                        {item.quantity <= item.reorderLevel && (
                          <div className="flex items-center text-yellow-600 text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Reorder Level: {item.reorderLevel}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${item.costPerUnit.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                          {item.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.expiryDate}
                      </td>
                    </tr>
                  ))
                : filteredFinishedProducts.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="h-8 w-8 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">Batch: {item.batchNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.quantity} {item.unit}</div>
                        {item.status === 'low-stock' && (
                          <div className="flex items-center text-yellow-600 text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Low Stock
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Cost: ${item.costPrice.toFixed(2)}</div>
                        <div className="text-sm text-green-600">Sell: ${item.sellingPrice.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                          {item.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.expiryDate}
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Add {activeTab === 'raw' ? 'Raw Material' : 'Finished Product'}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Item Name"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              {activeTab === 'raw' ? (
                <input
                  type="text"
                  placeholder="Supplier"
                  value={newItem.supplier}
                  onChange={(e) => setNewItem({...newItem, supplier: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="SKU"
                    value={newItem.sku}
                    onChange={(e) => setNewItem({...newItem, sku: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Category"
                    value={newItem.category}
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Selling Price"
                    value={newItem.sellingPrice}
                    onChange={(e) => setNewItem({...newItem, sellingPrice: parseFloat(e.target.value) || 0})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </>
              )}
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Quantity"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                  className="p-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Unit"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                  className="p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <input
                type="number"
                placeholder="Cost Per Unit"
                value={newItem.costPerUnit}
                onChange={(e) => setNewItem({...newItem, costPerUnit: parseFloat(e.target.value) || 0})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              {activeTab === 'raw' && (
                <input
                  type="number"
                  placeholder="Reorder Level"
                  value={newItem.reorderLevel}
                  onChange={(e) => setNewItem({...newItem, reorderLevel: parseInt(e.target.value) || 0})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              )}
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  placeholder="Expiry Date"
                  value={newItem.expiryDate}
                  onChange={(e) => setNewItem({...newItem, expiryDate: e.target.value})}
                  className="p-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Batch Number"
                  value={newItem.batchNumber}
                  onChange={(e) => setNewItem({...newItem, batchNumber: e.target.value})}
                  className="p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleAddItem}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Item
              </button>
              <button
                onClick={() => setShowAddForm(false)}
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

export default Inventory;