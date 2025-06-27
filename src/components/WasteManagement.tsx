import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Plus, Trash2, AlertTriangle, TrendingDown, Package, DollarSign } from 'lucide-react';

const WasteManagement: React.FC = () => {
  const { wasteRecords, rawMaterials, finishedProducts, addWasteRecord, getWastageAnalytics } = useERP();
  const [showWasteForm, setShowWasteForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'raw-material' | 'finished-product'>('all');

  const [newWaste, setNewWaste] = useState({
    itemId: '',
    itemName: '',
    itemType: 'raw-material' as 'raw-material' | 'finished-product',
    wasteQuantity: 0,
    wasteReason: 'expired' as 'expired' | 'damaged' | 'contaminated' | 'production-loss' | 'spillage' | 'other',
    reportedBy: '',
    disposalMethod: ''
  });

  const filteredWasteRecords = wasteRecords.filter(record => {
    if (activeTab === 'all') return true;
    return record.itemType === activeTab;
  });

  const wastageAnalytics = getWastageAnalytics();

  const handleAddWaste = () => {
    const items = newWaste.itemType === 'raw-material' ? rawMaterials : finishedProducts;
    const item = items.find(i => i.id === newWaste.itemId);
    const unitPrice = newWaste.itemType === 'raw-material' ? 
      (item as any)?.costPerUnit || 0 : 
      (item as any)?.costPrice || 0;

    const waste = {
      id: `WASTE-${String(wasteRecords.length + 1).padStart(3, '0')}`,
      itemId: newWaste.itemId,
      itemName: newWaste.itemName,
      itemType: newWaste.itemType,
      wasteQuantity: newWaste.wasteQuantity,
      wasteReason: newWaste.wasteReason,
      wasteValue: newWaste.wasteQuantity * unitPrice,
      date: new Date().toISOString().split('T')[0],
      reportedBy: newWaste.reportedBy,
      approved: false,
      disposalMethod: newWaste.disposalMethod
    };

    addWasteRecord(waste);
    setNewWaste({
      itemId: '',
      itemName: '',
      itemType: 'raw-material',
      wasteQuantity: 0,
      wasteReason: 'expired',
      reportedBy: '',
      disposalMethod: ''
    });
    setShowWasteForm(false);
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'expired': return 'bg-red-100 text-red-800';
      case 'damaged': return 'bg-orange-100 text-orange-800';
      case 'contaminated': return 'bg-purple-100 text-purple-800';
      case 'production-loss': return 'bg-yellow-100 text-yellow-800';
      case 'spillage': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalWasteQuantity = wasteRecords.reduce((sum, record) => sum + record.wasteQuantity, 0);
  const rawMaterialWaste = wasteRecords.filter(r => r.itemType === 'raw-material').reduce((sum, r) => sum + r.wasteValue, 0);
  const finishedProductWaste = wasteRecords.filter(r => r.itemType === 'finished-product').reduce((sum, r) => sum + r.wasteValue, 0);
  const pendingApprovals = wasteRecords.filter(r => !r.approved).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Waste Management</h2>
        <button
          onClick={() => setShowWasteForm(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Report Waste
        </button>
      </div>

      {/* Waste Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-red-500 p-3 rounded-lg mr-4">
              <Trash2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Waste Value</p>
              <p className="text-2xl font-bold text-red-600">PKR {(wastageAnalytics.totalWasteValue / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-orange-500 p-3 rounded-lg mr-4">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Raw Material Waste</p>
              <p className="text-2xl font-bold text-orange-600">PKR {(rawMaterialWaste / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-purple-500 p-3 rounded-lg mr-4">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Product Waste</p>
              <p className="text-2xl font-bold text-purple-600">PKR {(finishedProductWaste / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-yellow-500 p-3 rounded-lg mr-4">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingApprovals}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Waste by Reason Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Waste by Reason</h3>
        <div className="space-y-4">
          {Object.entries(wastageAnalytics.wasteByReason).map(([reason, value]) => {
            const percentage = (value / wastageAnalytics.totalWasteValue) * 100;
            return (
              <div key={reason}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{reason.replace('-', ' ')}</span>
                  <span>PKR {value.toLocaleString()} ({percentage.toFixed(1)}%)</span>
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

      {/* Waste Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-3 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Waste ({wasteRecords.length})
            </button>
            <button
              onClick={() => setActiveTab('raw-material')}
              className={`py-3 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'raw-material'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Raw Materials ({wasteRecords.filter(r => r.itemType === 'raw-material').length})
            </button>
            <button
              onClick={() => setActiveTab('finished-product')}
              className={`py-3 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'finished-product'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Finished Products ({wasteRecords.filter(r => r.itemType === 'finished-product').length})
            </button>
          </nav>
        </div>

        {/* Waste Records Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Waste ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Disposal
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredWasteRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Trash2 className="h-4 w-4 text-red-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{record.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{record.itemName}</div>
                    <div className="text-sm text-gray-500">{record.itemType.replace('-', ' ')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.wasteQuantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getReasonColor(record.wasteReason)}`}>
                      {record.wasteReason.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                    PKR {record.wasteValue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      record.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.disposalMethod}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Waste Record Modal */}
      {showWasteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Report Waste</h3>
            <div className="space-y-4">
              <select
                value={newWaste.itemType}
                onChange={(e) => setNewWaste({...newWaste, itemType: e.target.value as 'raw-material' | 'finished-product', itemId: '', itemName: ''})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="raw-material">Raw Material</option>
                <option value="finished-product">Finished Product</option>
              </select>
              
              <select
                value={newWaste.itemId}
                onChange={(e) => {
                  const items = newWaste.itemType === 'raw-material' ? rawMaterials : finishedProducts;
                  const item = items.find(i => i.id === e.target.value);
                  setNewWaste({
                    ...newWaste, 
                    itemId: e.target.value,
                    itemName: item?.name || ''
                  });
                }}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select Item</option>
                {(newWaste.itemType === 'raw-material' ? rawMaterials : finishedProducts).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              
              <input
                type="number"
                placeholder="Waste Quantity"
                value={newWaste.wasteQuantity}
                onChange={(e) => setNewWaste({...newWaste, wasteQuantity: parseFloat(e.target.value) || 0})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              
              <select
                value={newWaste.wasteReason}
                onChange={(e) => setNewWaste({...newWaste, wasteReason: e.target.value as any})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="expired">Expired</option>
                <option value="damaged">Damaged</option>
                <option value="contaminated">Contaminated</option>
                <option value="production-loss">Production Loss</option>
                <option value="spillage">Spillage</option>
                <option value="other">Other</option>
              </select>
              
              <input
                type="text"
                placeholder="Reported By"
                value={newWaste.reportedBy}
                onChange={(e) => setNewWaste({...newWaste, reportedBy: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              
              <input
                type="text"
                placeholder="Disposal Method"
                value={newWaste.disposalMethod}
                onChange={(e) => setNewWaste({...newWaste, disposalMethod: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleAddWaste}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Report Waste
              </button>
              <button
                onClick={() => setShowWasteForm(false)}
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

export default WasteManagement;