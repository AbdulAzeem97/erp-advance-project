import React from 'react';
import { useERP } from '../context/ERPContext';
import { Truck, Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const Supply: React.FC = () => {
  const { purchaseOrders, finishedProducts, suppliers } = useERP();

  const pendingShipments = purchaseOrders.filter(po => po.status === 'shipped' || po.status === 'confirmed');
  const deliveredShipments = purchaseOrders.filter(po => po.status === 'delivered');
  const lowStockProducts = finishedProducts.filter(product => product.status === 'low-stock');

  const supplyChainMetrics = {
    totalOrders: purchaseOrders.length,
    pendingDeliveries: pendingShipments.length,
    onTimeDeliveries: deliveredShipments.length,
    supplierCount: suppliers.length,
    averageLeadTime: '7 days', // This would be calculated from actual data
    fulfillmentRate: '94%' // This would be calculated from actual data
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'shipped': return <Truck className="h-5 w-5 text-blue-500" />;
      case 'confirmed': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'pending': return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default: return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Supply Chain Management</h2>
      </div>

      {/* Supply Chain Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-xl font-bold">{supplyChainMetrics.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-xl font-bold">{supplyChainMetrics.pendingDeliveries}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Delivered</p>
              <p className="text-xl font-bold">{supplyChainMetrics.onTimeDeliveries}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <Truck className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Suppliers</p>
              <p className="text-xl font-bold">{supplyChainMetrics.supplierCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div>
            <p className="text-sm text-gray-600">Avg Lead Time</p>
            <p className="text-xl font-bold">{supplyChainMetrics.averageLeadTime}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div>
            <p className="text-sm text-gray-600">Fulfillment Rate</p>
            <p className="text-xl font-bold text-green-600">{supplyChainMetrics.fulfillmentRate}</p>
          </div>
        </div>
      </div>

      {/* Active Shipments */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Active Shipments</h3>
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expected Delivery
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingShipments.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(order.status)}
                      <span className="ml-2 text-sm font-medium text-gray-900">{order.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.supplier}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.expectedDelivery}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${order.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          order.status === 'shipped' ? 'bg-blue-600 w-3/4' : 
                          order.status === 'confirmed' ? 'bg-yellow-600 w-1/2' : 
                          'bg-gray-400 w-1/4'
                        }`}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                      {order.status === 'shipped' ? '75%' : 
                       order.status === 'confirmed' ? '50%' : '25%'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supply Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
              Supply Alerts
            </h3>
          </div>
          <div className="p-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Products Requiring Replenishment</h4>
              <div className="space-y-2">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex justify-between items-center">
                    <span className="text-yellow-700">{product.name}</span>
                    <span className="text-sm text-yellow-600">
                      {product.quantity} {product.unit} remaining
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Performance */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Supplier Performance</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map((supplier) => {
              const supplierOrders = purchaseOrders.filter(po => po.supplier === supplier.name);
              const deliveredOrders = supplierOrders.filter(po => po.status === 'delivered');
              const onTimeRate = supplierOrders.length > 0 ? 
                Math.round((deliveredOrders.length / supplierOrders.length) * 100) : 0;

              return (
                <div key={supplier.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-gray-900">{supplier.name}</h4>
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm text-gray-600 ml-1">{supplier.rating}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Orders:</span>
                      <span className="font-medium">{supplierOrders.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivered:</span>
                      <span className="font-medium">{deliveredOrders.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">On-Time Rate:</span>
                      <span className={`font-medium ${onTimeRate >= 90 ? 'text-green-600' : onTimeRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {onTimeRate}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Terms:</span>
                      <span className="font-medium">{supplier.paymentTerms}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          onTimeRate >= 90 ? 'bg-green-600' : 
                          onTimeRate >= 70 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${onTimeRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Supply;