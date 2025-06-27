import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Plus, Users, Search, MapPin, Phone, Mail, CreditCard } from 'lucide-react';

const Customers: React.FC = () => {
  const { customers, addCustomer } = useERP();
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'retailer' | 'distributor' | 'pharmacy' | 'hospital'>('all');

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    contact: '',
    email: '',
    address: '',
    city: '',
    customerType: 'pharmacy' as 'retailer' | 'distributor' | 'pharmacy' | 'hospital',
    creditLimit: 0,
    paymentTerms: 'Net 15',
    discount: 0
  });

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.contact.includes(searchTerm) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || customer.customerType === filterType;
    return matchesSearch && matchesType;
  });

  const handleAddCustomer = () => {
    const customer = {
      id: (customers.length + 1).toString(),
      name: newCustomer.name,
      contact: newCustomer.contact,
      email: newCustomer.email,
      address: newCustomer.address,
      city: newCustomer.city,
      customerType: newCustomer.customerType,
      creditLimit: newCustomer.creditLimit,
      outstandingAmount: 0,
      totalPurchases: 0,
      lastOrderDate: '',
      paymentTerms: newCustomer.paymentTerms,
      discount: newCustomer.discount
    };

    addCustomer(customer);
    setNewCustomer({
      name: '',
      contact: '',
      email: '',
      address: '',
      city: '',
      customerType: 'pharmacy',
      creditLimit: 0,
      paymentTerms: 'Net 15',
      discount: 0
    });
    setShowCustomerForm(false);
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

  const totalCustomers = customers.length;
  const totalCreditLimit = customers.reduce((sum, customer) => sum + customer.creditLimit, 0);
  const totalOutstanding = customers.reduce((sum, customer) => sum + customer.outstandingAmount, 0);
  const totalPurchases = customers.reduce((sum, customer) => sum + customer.totalPurchases, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
        <button
          onClick={() => setShowCustomerForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Customer
        </button>
      </div>

      {/* Customer Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 p-3 rounded-lg mr-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-blue-600">{totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-green-500 p-3 rounded-lg mr-4">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Credit Limit</p>
              <p className="text-2xl font-bold text-green-600">PKR {(totalCreditLimit / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-red-500 p-3 rounded-lg mr-4">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Outstanding</p>
              <p className="text-2xl font-bold text-red-600">PKR {(totalOutstanding / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-purple-500 p-3 rounded-lg mr-4">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Purchases</p>
              <p className="text-2xl font-bold text-purple-600">PKR {(totalPurchases / 1000).toFixed(0)}K</p>
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
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Types</option>
          <option value="pharmacy">Pharmacy</option>
          <option value="hospital">Hospital</option>
          <option value="distributor">Distributor</option>
          <option value="retailer">Retailer</option>
        </select>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCustomerTypeColor(customer.customerType)}`}>
                  {customer.customerType}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Credit Limit</p>
                <p className="font-semibold text-green-600">PKR {customer.creditLimit.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                {customer.contact}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                {customer.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {customer.city}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Outstanding</p>
                  <p className={`font-semibold ${customer.outstandingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    PKR {customer.outstandingAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Total Purchases</p>
                  <p className="font-semibold text-blue-600">
                    PKR {customer.totalPurchases.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Payment Terms</p>
                  <p className="font-semibold">{customer.paymentTerms}</p>
                </div>
                <div>
                  <p className="text-gray-500">Discount</p>
                  <p className="font-semibold text-purple-600">{customer.discount}%</p>
                </div>
              </div>
            </div>

            {customer.lastOrderDate && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500">Last Order: {customer.lastOrderDate}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Customer Modal */}
      {showCustomerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add New Customer</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Customer Name"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              
              <select
                value={newCustomer.customerType}
                onChange={(e) => setNewCustomer({...newCustomer, customerType: e.target.value as any})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="pharmacy">Pharmacy</option>
                <option value="hospital">Hospital</option>
                <option value="distributor">Distributor</option>
                <option value="retailer">Retailer</option>
              </select>
              
              <input
                type="text"
                placeholder="Contact Number"
                value={newCustomer.contact}
                onChange={(e) => setNewCustomer({...newCustomer, contact: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              
              <input
                type="email"
                placeholder="Email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              
              <textarea
                placeholder="Address"
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
                rows={2}
              />
              
              <input
                type="text"
                placeholder="City"
                value={newCustomer.city}
                onChange={(e) => setNewCustomer({...newCustomer, city: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Credit Limit (PKR)"
                  value={newCustomer.creditLimit}
                  onChange={(e) => setNewCustomer({...newCustomer, creditLimit: parseFloat(e.target.value) || 0})}
                  className="p-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Discount %"
                  value={newCustomer.discount}
                  onChange={(e) => setNewCustomer({...newCustomer, discount: parseFloat(e.target.value) || 0})}
                  className="p-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <select
                value={newCustomer.paymentTerms}
                onChange={(e) => setNewCustomer({...newCustomer, paymentTerms: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
                <option value="Advance Payment">Advance Payment</option>
              </select>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleAddCustomer}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Customer
              </button>
              <button
                onClick={() => setShowCustomerForm(false)}
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

export default Customers;