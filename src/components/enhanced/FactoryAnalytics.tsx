import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Factory, 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react';
import { factoryAPI } from '../../services/api';
import toast from 'react-hot-toast';

const FactoryAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cost' | 'waste' | 'profit' | 'efficiency'>('cost');
  const [costAnalysis, setCostAnalysis] = useState<any>(null);
  const [wasteOptimization, setWasteOptimization] = useState<any>(null);
  const [profitOptimization, setProfitOptimization] = useState<any>(null);
  const [efficiencyMetrics, setEfficiencyMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [costData, wasteData, profitData, efficiencyData] = await Promise.all([
        factoryAPI.getCostAnalysis(dateRange.startDate, dateRange.endDate),
        factoryAPI.getWasteOptimization(),
        factoryAPI.getProfitOptimization(),
        factoryAPI.getEfficiencyMetrics()
      ]);

      setCostAnalysis(costData);
      setWasteOptimization(wasteData);
      setProfitOptimization(profitData);
      setEfficiencyMetrics(efficiencyData);
    } catch (error) {
      toast.error('Failed to load factory analytics data');
    } finally {
      setLoading(false);
    }
  };

  const createCostReductionPlan = async () => {
    try {
      const plan = await factoryAPI.createCostReductionPlan(15); // 15% reduction target
      toast.success('Cost reduction plan created successfully');
      // Handle plan display
    } catch (error) {
      toast.error('Failed to create cost reduction plan');
    }
  };

  const renderCostAnalysis = () => (
    <div className="space-y-6">
      {/* Cost Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Total Production Cost</p>
              <p className="text-3xl font-bold text-red-900 mt-2">
                PKR {costAnalysis?.total_production_cost?.toLocaleString() || '0'}
              </p>
              <p className="text-red-600 text-sm mt-1">
                PKR {costAnalysis?.cost_per_unit?.toFixed(2) || '0'} per unit
              </p>
            </div>
            <div className="bg-red-500 p-3 rounded-xl">
              <Factory className="h-8 w-8 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Material Cost</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                PKR {costAnalysis?.total_material_cost?.toLocaleString() || '0'}
              </p>
              <p className="text-blue-600 text-sm mt-1">
                {costAnalysis?.cost_breakdown?.material_cost?.toFixed(1) || '0'}% of total
              </p>
            </div>
            <div className="bg-blue-500 p-3 rounded-xl">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Labor Cost</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                PKR {costAnalysis?.total_labor_cost?.toLocaleString() || '0'}
              </p>
              <p className="text-green-600 text-sm mt-1">
                {costAnalysis?.cost_breakdown?.labor_cost?.toFixed(1) || '0'}% of total
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-xl">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Efficiency</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">
                {costAnalysis?.efficiency_ratio?.toFixed(1) || '0'}%
              </p>
              <p className="text-purple-600 text-sm mt-1">
                {costAnalysis?.units_produced || '0'} units produced
              </p>
            </div>
            <div className="bg-purple-500 p-3 rounded-xl">
              <Target className="h-8 w-8 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Cost Breakdown Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {costAnalysis?.cost_breakdown && Object.entries(costAnalysis.cost_breakdown).map(([key, value]) => {
              const percentage = value as number;
              const colors = {
                material_cost: 'bg-blue-600',
                labor_cost: 'bg-green-600',
                overhead_cost: 'bg-yellow-600',
                waste_cost: 'bg-red-600'
              };
              
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{key.replace('_', ' ')}</span>
                    <span>{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${colors[key as keyof typeof colors] || 'bg-gray-600'}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-3">Cost Optimization Opportunities</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Material Cost Reduction:</span>
                <span className="text-green-600 font-medium">5-10%</span>
              </div>
              <div className="flex justify-between">
                <span>Labor Efficiency:</span>
                <span className="text-green-600 font-medium">3-7%</span>
              </div>
              <div className="flex justify-between">
                <span>Waste Reduction:</span>
                <span className="text-green-600 font-medium">15-25%</span>
              </div>
              <div className="flex justify-between">
                <span>Overhead Optimization:</span>
                <span className="text-green-600 font-medium">2-5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={createCostReductionPlan}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center shadow-lg"
        >
          <Settings className="h-5 w-5 mr-2" />
          Create Cost Reduction Plan
        </button>
        <button className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 flex items-center shadow-lg">
          <Download className="h-5 w-5 mr-2" />
          Export Report
        </button>
      </div>
    </div>
  );

  const renderWasteOptimization = () => (
    <div className="space-y-6">
      {/* Waste Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Total Waste Value</p>
              <p className="text-3xl font-bold text-red-900 mt-2">
                PKR {wasteOptimization?.waste_summary?.total_waste_value?.toLocaleString() || '0'}
              </p>
              <p className="text-red-600 text-sm mt-1">Last 3 months</p>
            </div>
            <div className="bg-red-500 p-3 rounded-xl">
              <TrendingDown className="h-8 w-8 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Potential Savings</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                PKR {wasteOptimization?.total_potential_savings?.toLocaleString() || '0'}
              </p>
              <p className="text-green-600 text-sm mt-1">Annual potential</p>
            </div>
            <div className="bg-green-500 p-3 rounded-xl">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">ROI Potential</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                {wasteOptimization?.roi_analysis?.annual_savings_potential ? 
                  `${((wasteOptimization.roi_analysis.annual_savings_potential / wasteOptimization.waste_summary.total_waste_value) * 100).toFixed(0)}%` : 
                  '0%'
                }
              </p>
              <p className="text-blue-600 text-sm mt-1">Return on investment</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-xl">
              <Target className="h-8 w-8 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Waste Recommendations */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Waste Optimization Recommendations</h3>
        <div className="space-y-4">
          {wasteOptimization?.recommendations?.map((rec: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border-l-4 ${
                rec.priority === 'high' ? 'border-red-500 bg-red-50' :
                rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                'border-blue-500 bg-blue-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    {rec.priority === 'high' ? 
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-2" /> :
                      <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                    }
                    <h4 className="font-medium text-gray-900">{rec.type.replace('_', ' ').toUpperCase()}</h4>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{rec.issue || rec.opportunity}</p>
                  <p className="text-gray-600 text-sm">{rec.recommendation}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm text-gray-500">Potential Savings</p>
                  <p className="font-semibold text-green-600">
                    PKR {rec.potential_savings?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProfitOptimization = () => (
    <div className="space-y-6">
      {/* Profit Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Total Revenue Potential</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                PKR {profitOptimization?.summary_metrics?.total_potential_revenue?.toLocaleString() || '0'}
              </p>
              <p className="text-green-600 text-sm mt-1">Current inventory</p>
            </div>
            <div className="bg-green-500 p-3 rounded-xl">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Profit Potential</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                PKR {profitOptimization?.summary_metrics?.total_potential_profit?.toLocaleString() || '0'}
              </p>
              <p className="text-blue-600 text-sm mt-1">Current inventory</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-xl">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Average Margin</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">
                {profitOptimization?.summary_metrics?.average_profit_margin?.toFixed(1) || '0'}%
              </p>
              <p className="text-purple-600 text-sm mt-1">Across all products</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-xl">
              <Target className="h-8 w-8 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Product Profitability */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Profitability Analysis</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost/Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Selling Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit/Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Margin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Potential Profit</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {profitOptimization?.product_profitability && Object.entries(profitOptimization.product_profitability).map(([product, data]: [string, any]) => (
                <tr key={product} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    PKR {data.cost_per_unit?.toFixed(2) || '0'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    PKR {data.selling_price?.toFixed(2) || '0'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    PKR {data.profit_per_unit?.toFixed(2) || '0'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      data.profit_margin > 40 ? 'bg-green-100 text-green-800' :
                      data.profit_margin > 20 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {data.profit_margin?.toFixed(1) || '0'}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {data.current_stock || '0'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    PKR {data.potential_profit?.toLocaleString() || '0'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderEfficiencyMetrics = () => (
    <div className="space-y-6">
      {/* OEE Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Overall OEE</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                {efficiencyMetrics?.oee_metrics?.overall_oee?.toFixed(1) || '0'}%
              </p>
              <p className="text-blue-600 text-sm mt-1">
                Target: {efficiencyMetrics?.benchmarks?.world_class_oee || '85'}%
              </p>
            </div>
            <div className="bg-blue-500 p-3 rounded-xl">
              <Zap className="h-8 w-8 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Availability</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                {efficiencyMetrics?.oee_metrics?.availability?.toFixed(1) || '0'}%
              </p>
              <p className="text-green-600 text-sm mt-1">Equipment uptime</p>
            </div>
            <div className="bg-green-500 p-3 rounded-xl">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Performance</p>
              <p className="text-3xl font-bold text-yellow-900 mt-2">
                {efficiencyMetrics?.oee_metrics?.performance?.toFixed(1) || '0'}%
              </p>
              <p className="text-yellow-600 text-sm mt-1">Speed efficiency</p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-xl">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Quality</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">
                {efficiencyMetrics?.oee_metrics?.quality?.toFixed(1) || '0'}%
              </p>
              <p className="text-purple-600 text-sm mt-1">First pass yield</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-xl">
              <Target className="h-8 w-8 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Efficiency Recommendations */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Efficiency Improvement Recommendations</h3>
        <div className="space-y-4">
          {efficiencyMetrics?.recommendations?.map((rec: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-gray-900">{rec.metric}</h4>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Current: {rec.current?.toFixed(1)}%</p>
                  <p className="text-sm text-green-600">Target: {rec.target}%</p>
                </div>
              </div>
              <div className="space-y-2">
                {rec.actions?.map((action: string, actionIndex: number) => (
                  <div key={actionIndex} className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    {action}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading factory analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Factory Analytics & Optimization</h2>
          <p className="text-gray-600 mt-1">Advanced cost analysis, waste optimization, and profit maximization</p>
        </div>
        <div className="flex space-x-3">
          <div className="flex space-x-2">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <button
            onClick={loadData}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center shadow-lg"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            {[
              { id: 'cost', label: 'Cost Analysis', icon: DollarSign },
              { id: 'waste', label: 'Waste Optimization', icon: TrendingDown },
              { id: 'profit', label: 'Profit Optimization', icon: TrendingUp },
              { id: 'efficiency', label: 'Efficiency Metrics', icon: Zap }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'cost' && renderCostAnalysis()}
          {activeTab === 'waste' && renderWasteOptimization()}
          {activeTab === 'profit' && renderProfitOptimization()}
          {activeTab === 'efficiency' && renderEfficiencyMetrics()}
        </div>
      </div>
    </div>
  );
};

export default FactoryAnalytics;