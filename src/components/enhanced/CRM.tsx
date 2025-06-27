import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  TrendingUp,
  DollarSign,
  Target,
  Activity,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

interface Lead {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  estimatedValue: number;
  probability: number;
  assignedTo: string;
  nextFollowUp: string;
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  totalPurchases: number;
  lastOrderDate: string;
  status: 'active' | 'inactive';
  customerType: 'pharmacy' | 'hospital' | 'distributor' | 'retailer';
}

const CRM: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'leads' | 'customers' | 'activities'>('leads');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data
  const leads: Lead[] = [
    {
      id: '1',
      companyName: 'HealthCare Plus',
      contactPerson: 'Dr. Ahmed Khan',
      email: 'ahmed@healthcareplus.com',
      phone: '+92-42-35678901',
      source: 'website',
      status: 'qualified',
      estimatedValue: 500000,
      probability: 75,
      assignedTo: 'Salman Ahmed',
      nextFollowUp: '2024-02-15',
      createdAt: '2024-01-20'
    },
    {
      id: '2',
      companyName: 'Metro Pharmacy Chain',
      contactPerson: 'Fatima Ali',
      email: 'fatima@metro.com',
      phone: '+92-21-34567890',
      source: 'referral',
      status: 'proposal',
      estimatedValue: 750000,
      probability: 60,
      assignedTo: 'Sara Khan',
      nextFollowUp: '2024-02-12',
      createdAt: '2024-01-18'
    }
  ];

  const customers: Customer[] = [
    {
      id: '1',
      name: 'Health Plus Pharmacy',
      email: 'orders@healthplus.com',
      phone: '+92-42-35678901',
      company: 'Health Plus Pharmacy',
      address: 'Main Boulevard, Gulberg',
      city: 'Lahore',
      totalPurchases: 2500000,
      lastOrderDate: '2024-01-30',
      status: 'active',
      customerType: 'pharmacy'
    },
    {
      id: '2',
      name: 'City Hospital',
      email: 'procurement@cityhospital.com',
      phone: '+92-21-34567890',
      company: 'City Hospital',
      address: 'Clifton Block 5',
      city: 'Karachi',
      totalPurchases: 1800000,
      lastOrderDate: '2024-01-28',
      status: 'active',
      customerType: 'hospital'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'proposal': return 'bg-purple-100 text-purple-800';
      case 'negotiation': return 'bg-orange-100 text-orange-800';
      case 'closed_won': return 'bg-emerald-100 text-emerald-800';
      case 'closed_lost': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case 'pharmacy': return 'bg-blue-100 text-blue-800';
      case 'hospital': return 'bg-green-100 text-green-800';
      case 'distributor': return 'bg-purple-100 text-purple-800';
      case 'retailer': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter(lead => lead.status === 'qualified').length;
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(customer => customer.status === 'active').length;
  const totalPipelineValue = leads.reduce((sum, lead) => sum + lead.estimatedValue, 0);
  const totalCustomerValue = customers.reduce((sum, customer) => sum + customer.totalPurchases, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Customer Relationship Management</h2>
          <p className="text-gray-600 mt-1">Manage leads, customers, and relationships</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add {activeTab === 'leads' ? 'Lead' : 'Customer'}
        </button>
      </div>

      {/* CRM Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Leads</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{totalLeads}</p>
              <p className="text-blue-600 text-sm mt-1">+12% this month</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-xl">
              <Target className="h-8 w-8 text-white" />
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
              <p className="text-green-600 text-sm font-medium">Qualified Leads</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{qualifiedLeads}</p>
              <p className="text-green-600 text-sm mt-1">{((qualifiedLeads / totalLeads) * 100).toFixed(1)}% conversion</p>
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
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Active Customers</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">{activeCustomers}</p>
              <p className="text-purple-600 text-sm mt-1">98% retention rate</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-xl">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Pipeline Value</p>
              <p className="text-3xl font-bold text-orange-900 mt-2">PKR {(totalPipelineValue / 1000).toFixed(0)}K</p>
              <p className="text-orange-600 text-sm mt-1">+25% growth</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-xl">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('leads')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'leads'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Leads ({totalLeads})
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'customers'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Customers ({totalCustomers})
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'activities'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Activities
            </button>
          </nav>
        </div>

        {/* Search and Filter */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'leads' && (
            <div className="space-y-4">
              {leads.map((lead, index) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{lead.companyName}</h3>
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                          {lead.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          {lead.contactPerson}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          {lead.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          {lead.phone}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          Next: {lead.nextFollowUp}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-sm">
                            <span className="text-gray-600">Value: </span>
                            <span className="font-semibold text-green-600">PKR {lead.estimatedValue.toLocaleString()}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Probability: </span>
                            <span className="font-semibold text-blue-600">{lead.probability}%</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Assigned: </span>
                            <span className="font-semibold">{lead.assignedTo}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{lead.probability}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${lead.probability}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customers.map((customer, index) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCustomerTypeColor(customer.customerType)}`}>
                        {customer.customerType}
                      </span>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                      {customer.status}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {customer.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {customer.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {customer.city}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Total Purchases</p>
                        <p className="font-semibold text-green-600">
                          PKR {customer.totalPurchases.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Last Order</p>
                        <p className="font-semibold">{customer.lastOrderDate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-4">
                    <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors">
                      <Activity className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Activities Yet</h3>
              <p className="text-gray-600">Start tracking customer interactions and activities.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CRM;