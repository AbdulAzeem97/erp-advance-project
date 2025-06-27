import React from 'react';
import { useERP } from '../context/ERPContext';
import { AlertTriangle, CheckCircle, Clock, Package, Calendar, Trash2 } from 'lucide-react';

const Alerts: React.FC = () => {
  const { alerts, acknowledgeAlert } = useERP();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low-stock': return <Package className="h-5 w-5" />;
      case 'expiry': return <Calendar className="h-5 w-5" />;
      case 'overstock': return <Package className="h-5 w-5" />;
      case 'quality': return <CheckCircle className="h-5 w-5" />;
      case 'financial': return <AlertTriangle className="h-5 w-5" />;
      case 'production': return <Clock className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-800';
      case 'high': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);
  const acknowledgedAlerts = alerts.filter(alert => alert.acknowledged);
  const criticalAlerts = unacknowledgedAlerts.filter(alert => alert.severity === 'critical');
  const highAlerts = unacknowledgedAlerts.filter(alert => alert.severity === 'high');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">System Alerts</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {unacknowledgedAlerts.length} unacknowledged alerts
          </div>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-red-500 p-3 rounded-lg mr-4">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-red-600">{criticalAlerts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-orange-500 p-3 rounded-lg mr-4">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-orange-600">{highAlerts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-yellow-500 p-3 rounded-lg mr-4">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{unacknowledgedAlerts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-green-500 p-3 rounded-lg mr-4">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{acknowledgedAlerts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alerts Section */}
      {criticalAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Critical Alerts Requiring Immediate Action
          </h3>
          <div className="space-y-3">
            {criticalAlerts.map((alert) => (
              <div key={alert.id} className="bg-white border border-red-300 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start">
                    <div className="text-red-600 mr-3 mt-1">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-800">{alert.title}</h4>
                      <p className="text-red-700 mt-1">{alert.message}</p>
                      <p className="text-red-600 text-sm mt-2">Date: {alert.date}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Alerts */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Alerts</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {unacknowledgedAlerts.map((alert) => (
            <div key={alert.id} className={`p-6 ${getAlertColor(alert.severity)}`}>
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <div className="mr-4 mt-1">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h4 className="font-semibold mr-3">{alert.title}</h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityBadgeColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800`}>
                        {alert.type.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="mb-2">{alert.message}</p>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{alert.date}</span>
                      {alert.actionRequired && (
                        <span className="ml-4 text-red-600 font-medium">Action Required</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Acknowledge
                </button>
              </div>
            </div>
          ))}

          {acknowledgedAlerts.length > 0 && (
            <>
              <div className="px-6 py-4 bg-gray-50">
                <h4 className="font-medium text-gray-700">Acknowledged Alerts</h4>
              </div>
              {acknowledgedAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="p-6 bg-gray-50 opacity-75">
                  <div className="flex items-start">
                    <div className="text-gray-400 mr-4 mt-1">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h4 className="font-semibold text-gray-600 mr-3">{alert.title}</h4>
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Acknowledged
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{alert.message}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{alert.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {alerts.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">All Clear!</h3>
          <p className="text-green-700">No alerts at this time. Your system is running smoothly.</p>
        </div>
      )}
    </div>
  );
};

export default Alerts;