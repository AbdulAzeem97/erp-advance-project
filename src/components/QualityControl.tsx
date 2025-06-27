import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Plus, Shield, CheckCircle, XCircle, AlertTriangle, FileText } from 'lucide-react';

const QualityControl: React.FC = () => {
  const { qualityControls, rawMaterials, finishedProducts, productions, addQualityControl } = useERP();
  const [showQCForm, setShowQCForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'approved' | 'rejected' | 'pending'>('all');

  const [newQC, setNewQC] = useState({
    batchNumber: '',
    productType: 'finished-product' as 'raw-material' | 'finished-product',
    itemId: '',
    itemName: '',
    testResults: [{ parameter: '', expectedValue: '', actualValue: '', status: 'pass' as 'pass' | 'fail' }],
    inspector: '',
    remarks: ''
  });

  const filteredQCs = qualityControls.filter(qc => {
    switch (activeTab) {
      case 'approved': return qc.overallStatus === 'approved';
      case 'rejected': return qc.overallStatus === 'rejected';
      case 'pending': return qc.overallStatus === 'conditional';
      default: return true;
    }
  });

  const handleAddQC = () => {
    const overallStatus = newQC.testResults.every(test => test.status === 'pass') ? 'approved' : 
                         newQC.testResults.some(test => test.status === 'fail') ? 'rejected' : 'conditional';

    const qc = {
      id: `QC-${String(qualityControls.length + 1).padStart(3, '0')}`,
      batchNumber: newQC.batchNumber,
      productType: newQC.productType,
      itemId: newQC.itemId,
      itemName: newQC.itemName,
      testDate: new Date().toISOString().split('T')[0],
      testResults: newQC.testResults,
      overallStatus: overallStatus as 'approved' | 'rejected' | 'conditional',
      inspector: newQC.inspector,
      remarks: newQC.remarks
    };

    addQualityControl(qc);
    setNewQC({
      batchNumber: '',
      productType: 'finished-product',
      itemId: '',
      itemName: '',
      testResults: [{ parameter: '', expectedValue: '', actualValue: '', status: 'pass' }],
      inspector: '',
      remarks: ''
    });
    setShowQCForm(false);
  };

  const addTestResult = () => {
    setNewQC({
      ...newQC,
      testResults: [...newQC.testResults, { parameter: '', expectedValue: '', actualValue: '', status: 'pass' }]
    });
  };

  const updateTestResult = (index: number, field: string, value: any) => {
    const updatedResults = newQC.testResults.map((result, i) => 
      i === index ? { ...result, [field]: value } : result
    );
    setNewQC({ ...newQC, testResults: updatedResults });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'conditional': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default: return <Shield className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'conditional': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const approvedCount = qualityControls.filter(qc => qc.overallStatus === 'approved').length;
  const rejectedCount = qualityControls.filter(qc => qc.overallStatus === 'rejected').length;
  const pendingCount = qualityControls.filter(qc => qc.overallStatus === 'conditional').length;
  const passRate = qualityControls.length > 0 ? (approvedCount / qualityControls.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quality Control</h2>
        <button
          onClick={() => setShowQCForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          New QC Test
        </button>
      </div>

      {/* QC Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 p-3 rounded-lg mr-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tests</p>
              <p className="text-2xl font-bold text-gray-900">{qualityControls.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-green-500 p-3 rounded-lg mr-4">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-red-500 p-3 rounded-lg mr-4">
              <XCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-purple-500 p-3 rounded-lg mr-4">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pass Rate</p>
              <p className="text-2xl font-bold text-purple-600">{passRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* QC Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-3 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Tests ({qualityControls.length})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`py-3 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'approved'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Approved ({approvedCount})
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`py-3 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'rejected'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Rejected ({rejectedCount})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-3 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending ({pendingCount})
            </button>
          </nav>
        </div>

        {/* QC Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  QC ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inspector
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Results
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredQCs.map((qc) => (
                <tr key={qc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(qc.overallStatus)}
                      <span className="ml-2 text-sm font-medium text-gray-900">{qc.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{qc.itemName}</div>
                    <div className="text-sm text-gray-500">{qc.productType.replace('-', ' ')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {qc.batchNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {qc.testDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(qc.overallStatus)}`}>
                      {qc.overallStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {qc.inspector}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {qc.testResults.filter(test => test.status === 'pass').length}/{qc.testResults.length} Passed
                    </div>
                    {qc.remarks && (
                      <div className="text-xs text-gray-500 truncate max-w-xs">
                        {qc.remarks}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add QC Test Modal */}
      {showQCForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">New Quality Control Test</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <select
                  value={newQC.productType}
                  onChange={(e) => setNewQC({...newQC, productType: e.target.value as 'raw-material' | 'finished-product'})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="finished-product">Finished Product</option>
                  <option value="raw-material">Raw Material</option>
                </select>
                
                <select
                  value={newQC.itemId}
                  onChange={(e) => {
                    const items = newQC.productType === 'raw-material' ? rawMaterials : finishedProducts;
                    const item = items.find(i => i.id === e.target.value);
                    setNewQC({
                      ...newQC, 
                      itemId: e.target.value,
                      itemName: item?.name || ''
                    });
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Item</option>
                  {(newQC.productType === 'raw-material' ? rawMaterials : finishedProducts).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                
                <input
                  type="text"
                  placeholder="Batch Number"
                  value={newQC.batchNumber}
                  onChange={(e) => setNewQC({...newQC, batchNumber: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                
                <input
                  type="text"
                  placeholder="Inspector Name"
                  value={newQC.inspector}
                  onChange={(e) => setNewQC({...newQC, inspector: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                
                <textarea
                  placeholder="Remarks (optional)"
                  value={newQC.remarks}
                  onChange={(e) => setNewQC({...newQC, remarks: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Test Results</h4>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {newQC.testResults.map((result, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="grid grid-cols-1 gap-2">
                        <input
                          type="text"
                          placeholder="Parameter (e.g., Assay, pH, Moisture)"
                          value={result.parameter}
                          onChange={(e) => updateTestResult(index, 'parameter', e.target.value)}
                          className="p-2 border border-gray-300 rounded text-sm"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Expected Value"
                            value={result.expectedValue}
                            onChange={(e) => updateTestResult(index, 'expectedValue', e.target.value)}
                            className="p-2 border border-gray-300 rounded text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Actual Value"
                            value={result.actualValue}
                            onChange={(e) => updateTestResult(index, 'actualValue', e.target.value)}
                            className="p-2 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <select
                          value={result.status}
                          onChange={(e) => updateTestResult(index, 'status', e.target.value)}
                          className="p-2 border border-gray-300 rounded text-sm"
                        >
                          <option value="pass">Pass</option>
                          <option value="fail">Fail</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addTestResult}
                  className="mt-3 text-blue-600 hover:text-blue-700 text-sm"
                >
                  + Add Test Parameter
                </button>
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleAddQC}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit QC Test
              </button>
              <button
                onClick={() => setShowQCForm(false)}
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

export default QualityControl;