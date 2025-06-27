import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Store as StoreIcon, Package, AlertTriangle, Search, Filter } from 'lucide-react';

const Store: React.FC = () => {
  const { rawMaterials, finishedProducts, updateStock } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'low-stock' | 'in-stock'>('all');
  const [showStockUpdate, setShowStockUpdate] = useState<{type: 'raw' | 'finished', id: string, name: string} | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState(0);

  const allItems = [
    ...rawMaterials.map(item => ({...item, type: 'raw' as const})),
    ...finishedProducts.map(item => ({...item, type: 'finished' as const}))
  ];

  const filteredItems = allItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || item.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleStockUpdate = () => {
    if (showStockUpdate) {
      updateStock(showStockUpdate.type, showStockUpdate.id, stockAdjustment);
      setShowStockUpdate(null);
      setStockAdjustment(0);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'bg-green-100 text-green-800';
      case 'low-stock': return 'bg-yellow-100 text-yellow-800';
      case 'out-of-stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalItems = allItems.length;
  const lowStockItems = allItems.filter(item => item.status === 'low-stock').length;
  const outOfStockItems = allItems.filter(item => item.status === 'out-of-stock').length;
  const totalValue = allItems.reduce((sum, item) => {
    const price = 'costPerUnit' in item ? item.costPerUnit : item.costPrice;
    return sum + (item.quantity * price);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Store Management</h2>
      </div>

      {/* Store Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 p-3 rounded-lg mr-4">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-yellow-500 p-3 rounded-lg mr-4">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">{lowStockItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-red-500 p-3 rounded-lg mr-4">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{outOfStockItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-green-500 p-3 rounded-lg mr-4">
              <StoreIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-green-600">${totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search store inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeFilter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('in-stock')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeFilter === 'in-stock' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            In Stock
          </button>
          <button
            onClick={() => setActiveFilter('low-stock')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeFilter === 'low-stock' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Low Stock
          </button>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={`${item.type}-${item.id}`} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500">
                  {item.type === 'raw' 
                    ? `Supplier: ${'supplier' in item ? item.supplier : 'N/A'}` 
                    : `SKU: ${'sku' in item ? item.sku : 'N/A'}`
                  }
                </p>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                {item.status.replace('-', ' ')}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Current Stock:</span>
                <span className="text-sm font-medium">{item.quantity} {item.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  {item.type === 'raw' ? 'Cost Price:' : 'Cost Price:'}
                </span>
                <span className="text-sm font-medium">
                  ${'costPerUnit' in item ? item.costPerUnit.toFixed(2) : item.costPrice.toFixed(2)}
                </span>
              </div>
              {'sellingPrice' in item && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Selling Price:</span>
                  <span className="text-sm font-medium text-green-600">${item.sellingPrice.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Batch:</span>
                <span className="text-sm font-medium">{item.batchNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Expiry:</span>
                <span className="text-sm font-medium">{item.expiryDate}</span>
              </div>
            </div>

            {item.status === 'low-stock' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                  <span className="text-sm text-yellow-800">
                    {item.type === 'raw' && 'reorderLevel' in item 
                      ? `Below reorder level (${item.reorderLevel})`
                      : 'Low stock alert'
                    }
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowStockUpdate({
                type: item.type,
                id: item.id,
                name: item.name
              })}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Adjust Stock
            </button>
          </div>
        ))}
      </div>

      {/* Stock Update Modal */}
      {showStockUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Adjust Stock - {showStockUpdate.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Adjustment (positive to add, negative to subtract)
                </label>
                <input
                  type="number"
                  value={stockAdjustment}
                  onChange={(e) => setStockAdjustment(parseInt(e.target.value) || 0)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter adjustment amount"
                />
              </div>
              <div className="text-sm text-gray-600">
                {stockAdjustment > 0 && (
                  <p>✓ Adding {stockAdjustment} units to stock</p>
                )}
                {stockAdjustment < 0 && (
                  <p>⚠ Removing {Math.abs(stockAdjustment)} units from stock</p>
                )}
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleStockUpdate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Stock
              </button>
              <button
                onClick={() => {
                  setShowStockUpdate(null);
                  setStockAdjustment(0);
                }}
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

export default Store;