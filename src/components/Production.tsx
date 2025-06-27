import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Plus, Factory, Clock, CheckCircle, AlertCircle, TrendingUp, Package } from 'lucide-react';

const Production: React.FC = () => {
  const { productions, finishedProducts, rawMaterials, addProduction } = useERP();
  const [showProductionForm, setShowProductionForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'planned'>('active');

  const [newProduction, setNewProduction] = useState({
    productId: '',
    productName: '',
    plannedQuantity: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    rawMaterialsUsed: [{ materialId: '', materialName: '', plannedQuantity: 0 }],
    laborCost: 0,
    overheadCost: 0,
    supervisor: ''
  });

  const filteredProductions = productions.filter(production => {
    switch (activeTab) {
      case 'active': return production.status === 'in-progress';
      case 'completed': return production.status === 'completed';
      case 'planned': return production.status === 'planned';
      default: return true;
    }
  });

  const handleAddProduction = () => {
    const totalMaterialCost = newProduction.rawMaterialsUsed.reduce((sum, material) => {
      const rawMaterial = rawMaterials.find(rm => rm.id === material.materialId);
      return sum + (rawMaterial ? rawMaterial.costPerUnit * material.plannedQuantity : 0);
    }, 0);

    const production = {
      id: `PROD-${String(productions.length + 1).padStart(3, '0')}`,
      productId: newProduction.productId,
      productName: newProduction.productName,
      batchNumber: `${newProduction.productName.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}-${String(productions.length + 1).padStart(3, '0')}`,
      plannedQuantity: newProduction.plannedQuantity,
      actualQuantity: 0,
      startDate: newProduction.startDate,
      endDate: newProduction.endDate,
      status: 'planned' as const,
      rawMaterialsUsed: newProduction.rawMaterialsUsed.map(material => ({
        ...material,
        actualQuantity: 0,
        wastage: 0
      })),
      laborCost: newProduction.laborCost,
      overheadCost: newProduction.overheadCost,
      totalCost: totalMaterialCost + newProduction.laborCost + newProduction.overheadCost,
      yieldPercentage: 0,
      qualityGrade: 'A' as const,
      supervisor: newProduction.supervisor
    };

    addProduction(production);
    setNewProduction({
      productId: '',
      productName: '',
      plannedQuantity: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      rawMaterialsUsed: [{ materialId: '', materialName: '', plannedQuantity: 0 }],
      laborCost: 0,
      overheadCost: 0,
      supervisor: ''
    });
    setShowProductionForm(false);
  };

  const addRawMaterial = () => {
    setNewProduction({
      ...newProduction,
      rawMaterialsUsed: [...newProduction.rawMaterialsUsed, { materialId: '', materialName: '', plannedQuantity: 0 }]
    });
  };

  const updateRawMaterial = (index: number, field: string, value: any) => {
    const updatedMaterials = newProduction.rawMaterialsUsed.map((material, i) => 
      i === index ? { ...material, [field]: value } : material
    );
    setNewProduction({ ...newProduction, rawMaterialsUsed: updatedMaterials });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress': return <Clock className="h-5 w-5 text-blue-500" />;
      case 'planned': return <Factory className="h-5 w-5 text-yellow-500" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPlannedQuantity = productions.reduce((sum, prod) => sum + prod.plannedQuantity, 0);
  const totalActualQuantity = productions.reduce((sum, prod) => sum + prod.actualQuantity, 0);
  const averageYield = productions.length > 0 ? 
    productions.reduce((sum, prod) => sum + prod.yieldPercentage, 0) / productions.length : 0;
  const totalProductionCost = productions.reduce((sum, prod) => sum + prod.totalCost, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Production Management</h2>
        <button
          onClick={() => setShowProductionForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Plan Production
        </button>
      </div>

      {/* Production Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 p-3 rounded-lg mr-4">
              <Factory className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Productions</p>
              <p className="text-2xl font-bold text-gray-900">{productions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-green-500 p-3 rounded-lg mr-4">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Average Yield</p>
              <p className="text-2xl font-bold text-green-600">{averageYield.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-purple-500 p-3 rounded-lg mr-4">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Units Produced</p>
              <p className="text-2xl font-bold text-purple-600">{totalActualQuantity.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-orange-500 p-3 rounded-lg mr-4">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Production Cost</p>
              <p className="text-2xl font-bold text-orange-600">PKR {(totalProductionCost / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </div>
      </div>

      {/* Production Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('active')}
              className={`py-3 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'active'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Active Productions ({productions.filter(p => p.status === 'in-progress').length})
            </button>
            <button
              onClick={() => setActiveTab('planned')}
              className={`py-3 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'planned'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Planned ({productions.filter(p => p.status === 'planned').length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`py-3 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'completed'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Completed ({productions.filter(p => p.status === 'completed').length})
            </button>
          </nav>
        </div>

        {/* Productions Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Production
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Yield
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProductions.map((production) => (
                <tr key={production.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(production.status)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{production.id}</div>
                        <div className="text-sm text-gray-500">Batch: {production.batchNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{production.productName}</div>
                    <div className="text-sm text-gray-500">Supervisor: {production.supervisor}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {production.actualQuantity > 0 ? 
                        `${production.actualQuantity}/${production.plannedQuantity}` : 
                        production.plannedQuantity
                      }
                    </div>
                    <div className="text-sm text-gray-500">
                      Grade: {production.qualityGrade}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Start: {production.startDate}</div>
                    <div className="text-sm text-gray-500">End: {production.endDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(production.status)}`}>
                      {production.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      production.yieldPercentage >= 95 ? 'text-green-600' : 
                      production.yieldPercentage >= 85 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {production.yieldPercentage > 0 ? `${production.yieldPercentage.toFixed(1)}%` : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    PKR {production.totalCost.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Production Modal */}
      {showProductionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Plan New Production</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <select
                  value={newProduction.productId}
                  onChange={(e) => {
                    const product = finishedProducts.find(p => p.id === e.target.value);
                    setNewProduction({
                      ...newProduction, 
                      productId: e.target.value,
                      productName: product?.name || ''
                    });
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Product</option>
                  {finishedProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                
                <input
                  type="number"
                  placeholder="Planned Quantity"
                  value={newProduction.plannedQuantity}
                  onChange={(e) => setNewProduction({...newProduction, plannedQuantity: parseInt(e.target.value) || 0})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    value={newProduction.startDate}
                    onChange={(e) => setNewProduction({...newProduction, startDate: e.target.value})}
                    className="p-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="date"
                    value={newProduction.endDate}
                    onChange={(e) => setNewProduction({...newProduction, endDate: e.target.value})}
                    className="p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <input
                  type="text"
                  placeholder="Supervisor"
                  value={newProduction.supervisor}
                  onChange={(e) => setNewProduction({...newProduction, supervisor: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Labor Cost (PKR)"
                    value={newProduction.laborCost}
                    onChange={(e) => setNewProduction({...newProduction, laborCost: parseFloat(e.target.value) || 0})}
                    className="p-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Overhead Cost (PKR)"
                    value={newProduction.overheadCost}
                    onChange={(e) => setNewProduction({...newProduction, overheadCost: parseFloat(e.target.value) || 0})}
                    className="p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Raw Materials Required</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {newProduction.rawMaterialsUsed.map((material, index) => (
                    <div key={index} className="grid grid-cols-2 gap-2">
                      <select
                        value={material.materialId}
                        onChange={(e) => {
                          const rawMaterial = rawMaterials.find(rm => rm.id === e.target.value);
                          updateRawMaterial(index, 'materialId', e.target.value);
                          updateRawMaterial(index, 'materialName', rawMaterial?.name || '');
                        }}
                        className="p-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="">Select Material</option>
                        {rawMaterials.map((rm) => (
                          <option key={rm.id} value={rm.id}>
                            {rm.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={material.plannedQuantity}
                        onChange={(e) => updateRawMaterial(index, 'plannedQuantity', parseFloat(e.target.value) || 0)}
                        className="p-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={addRawMaterial}
                  className="mt-3 text-blue-600 hover:text-blue-700 text-sm"
                >
                  + Add Material
                </button>
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleAddProduction}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Plan Production
              </button>
              <button
                onClick={() => setShowProductionForm(false)}
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

export default Production;