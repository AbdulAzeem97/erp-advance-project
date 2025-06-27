import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  Clock, 
  DollarSign, 
  Award,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Upload,
  FileText,
  Calculator
} from 'lucide-react';
import BulkOperations from '../advanced/BulkOperations';
import AdvancedSearch from '../advanced/AdvancedSearch';

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  salary: number;
  hireDate: string;
  status: 'active' | 'inactive' | 'on_leave';
  manager: string;
  address: string;
  cnic: string;
  emergencyContact: string;
  emergencyPhone: string;
  bankAccount: string;
  performanceRating: number;
  lastPromotion?: string;
  benefits: {
    medical: boolean;
    transport: boolean;
    bonus: number;
  };
}

interface Payroll {
  id: string;
  employeeId: string;
  employeeName: string;
  month: number;
  year: number;
  basicSalary: number;
  allowances: number;
  overtimeAmount: number;
  deductions: number;
  taxDeduction: number;
  netSalary: number;
  status: 'pending' | 'processed' | 'paid';
  processedDate?: string;
}

const AdvancedHRM: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'employees' | 'attendance' | 'leaves' | 'payroll' | 'performance'>('employees');
  const [showAddForm, setShowAddForm] = useState(false);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  // Sample enhanced employee data
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      employeeId: 'EMP001',
      firstName: 'Ahmad',
      lastName: 'Ali',
      email: 'ahmad.ali@nutrapharma.com',
      phone: '+92-300-1234567',
      department: 'Production',
      designation: 'Production Manager',
      salary: 85000,
      hireDate: '2023-01-15',
      status: 'active',
      manager: 'CEO',
      address: 'Block A, Gulberg, Lahore',
      cnic: '35202-1234567-1',
      emergencyContact: 'Fatima Ali',
      emergencyPhone: '+92-300-7654321',
      bankAccount: '1234567890',
      performanceRating: 4.5,
      lastPromotion: '2023-12-01',
      benefits: {
        medical: true,
        transport: true,
        bonus: 10000
      }
    },
    {
      id: '2',
      employeeId: 'EMP002',
      firstName: 'Fatima',
      lastName: 'Khan',
      email: 'fatima.khan@nutrapharma.com',
      phone: '+92-300-2345678',
      department: 'Quality',
      designation: 'QC Analyst',
      salary: 65000,
      hireDate: '2023-03-20',
      status: 'active',
      manager: 'Ahmad Ali',
      address: 'DHA Phase 5, Karachi',
      cnic: '42101-9876543-2',
      emergencyContact: 'Ali Khan',
      emergencyPhone: '+92-300-8765432',
      bankAccount: '0987654321',
      performanceRating: 4.2,
      benefits: {
        medical: true,
        transport: false,
        bonus: 7500
      }
    }
  ]);

  const [payrollData, setPayrollData] = useState<Payroll[]>([
    {
      id: '1',
      employeeId: 'EMP001',
      employeeName: 'Ahmad Ali',
      month: 1,
      year: 2024,
      basicSalary: 85000,
      allowances: 12750,
      overtimeAmount: 5000,
      deductions: 2000,
      taxDeduction: 8500,
      netSalary: 92250,
      status: 'paid',
      processedDate: '2024-01-31'
    },
    {
      id: '2',
      employeeId: 'EMP002',
      employeeName: 'Fatima Khan',
      month: 1,
      year: 2024,
      basicSalary: 65000,
      allowances: 9750,
      overtimeAmount: 3000,
      deductions: 1500,
      taxDeduction: 6500,
      netSalary: 69750,
      status: 'paid',
      processedDate: '2024-01-31'
    }
  ]);

  const searchFields = ['firstName', 'lastName', 'email', 'employeeId', 'department', 'designation'];
  
  const filterFields = [
    { key: 'department', label: 'Department', type: 'select' as const, options: [
      { value: 'Production', label: 'Production' },
      { value: 'Quality', label: 'Quality' },
      { value: 'Sales', label: 'Sales' },
      { value: 'Finance', label: 'Finance' },
      { value: 'HR', label: 'HR' }
    ]},
    { key: 'status', label: 'Status', type: 'select' as const, options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'on_leave', label: 'On Leave' }
    ]},
    { key: 'salary', label: 'Salary', type: 'number' as const },
    { key: 'hireDate', label: 'Hire Date', type: 'date' as const },
    { key: 'performanceRating', label: 'Performance Rating', type: 'number' as const }
  ];

  const sortFields = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'hireDate', label: 'Hire Date' },
    { key: 'salary', label: 'Salary' },
    { key: 'performanceRating', label: 'Performance Rating' }
  ];

  const handleBulkImport = (importedData: any[]) => {
    const newEmployees = importedData.map((data, index) => ({
      id: (employees.length + index + 1).toString(),
      employeeId: data.employeeId || `EMP${String(employees.length + index + 1).padStart(3, '0')}`,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      department: data.department,
      designation: data.designation,
      salary: parseFloat(data.salary) || 0,
      hireDate: data.hireDate,
      status: 'active' as const,
      manager: data.manager || '',
      address: data.address || '',
      cnic: data.cnic || '',
      emergencyContact: data.emergencyContact || '',
      emergencyPhone: data.emergencyPhone || '',
      bankAccount: data.bankAccount || '',
      performanceRating: parseFloat(data.performanceRating) || 3.0,
      benefits: {
        medical: data.medical === 'true' || data.medical === true,
        transport: data.transport === 'true' || data.transport === true,
        bonus: parseFloat(data.bonus) || 0
      }
    }));

    setEmployees(prev => [...prev, ...newEmployees]);
  };

  const handleBulkExport = () => {
    return employees.map(emp => ({
      employeeId: emp.employeeId,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone,
      department: emp.department,
      designation: emp.designation,
      salary: emp.salary,
      hireDate: emp.hireDate,
      status: emp.status,
      manager: emp.manager,
      address: emp.address,
      cnic: emp.cnic,
      emergencyContact: emp.emergencyContact,
      emergencyPhone: emp.emergencyPhone,
      bankAccount: emp.bankAccount,
      performanceRating: emp.performanceRating,
      medical: emp.benefits.medical,
      transport: emp.benefits.transport,
      bonus: emp.benefits.bonus
    }));
  };

  const generatePayroll = (month: number, year: number) => {
    const newPayroll = employees
      .filter(emp => emp.status === 'active')
      .map(emp => {
        const allowances = emp.salary * 0.15; // 15% allowances
        const overtimeAmount = Math.random() * 10000; // Random overtime
        const deductions = emp.salary * 0.02; // 2% deductions
        const taxDeduction = emp.salary * 0.10; // 10% tax
        const netSalary = emp.salary + allowances + overtimeAmount - deductions - taxDeduction;

        return {
          id: `${emp.id}-${month}-${year}`,
          employeeId: emp.employeeId,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          month,
          year,
          basicSalary: emp.salary,
          allowances,
          overtimeAmount,
          deductions,
          taxDeduction,
          netSalary,
          status: 'pending' as const
        };
      });

    setPayrollData(prev => [...prev.filter(p => !(p.month === month && p.year === year)), ...newPayroll]);
  };

  const calculateHRMetrics = () => {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.status === 'active').length;
    const totalPayroll = payrollData
      .filter(p => p.month === new Date().getMonth() + 1 && p.year === new Date().getFullYear())
      .reduce((sum, p) => sum + p.netSalary, 0);
    const avgPerformance = employees.reduce((sum, emp) => sum + emp.performanceRating, 0) / employees.length;
    const departmentCounts = employees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEmployees,
      activeEmployees,
      totalPayroll,
      avgPerformance,
      departmentCounts,
      retentionRate: 95.5, // Mock data
      turnoverRate: 4.5 // Mock data
    };
  };

  const metrics = calculateHRMetrics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Advanced Human Resource Management</h2>
          <p className="text-gray-600 mt-1">Complete HR solution with advanced analytics and automation</p>
        </div>
        <div className="flex space-x-3">
          <BulkOperations
            type="employees"
            onImport={handleBulkImport}
            onExport={handleBulkExport}
            templateData={{}}
          />
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 flex items-center shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Enhanced Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Employees</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{metrics.totalEmployees}</p>
              <p className="text-blue-600 text-sm mt-1">{metrics.activeEmployees} active</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-xl">
              <Users className="h-8 w-8 text-white" />
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
              <p className="text-green-600 text-sm font-medium">Monthly Payroll</p>
              <p className="text-3xl font-bold text-green-900 mt-2">PKR {(metrics.totalPayroll / 1000).toFixed(0)}K</p>
              <p className="text-green-600 text-sm mt-1">+5.2% from last month</p>
            </div>
            <div className="bg-green-500 p-3 rounded-xl">
              <DollarSign className="h-8 w-8 text-white" />
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
              <p className="text-purple-600 text-sm font-medium">Avg Performance</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">{metrics.avgPerformance.toFixed(1)}/5</p>
              <p className="text-purple-600 text-sm mt-1">Excellent rating</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-xl">
              <Award className="h-8 w-8 text-white" />
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
              <p className="text-orange-600 text-sm font-medium">Retention Rate</p>
              <p className="text-3xl font-bold text-orange-900 mt-2">{metrics.retentionRate}%</p>
              <p className="text-orange-600 text-sm mt-1">Industry leading</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-xl">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Advanced Search */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <AdvancedSearch
          data={employees}
          onFilter={setFilteredEmployees}
          searchFields={searchFields}
          filterFields={filterFields}
          sortFields={sortFields}
          placeholder="Search employees by name, ID, department..."
        />
      </div>

      {/* Enhanced Tabs */}
      <div className="bg-white rounded-2xl shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            {[
              { id: 'employees', label: 'Employees', count: metrics.totalEmployees },
              { id: 'attendance', label: 'Attendance', count: null },
              { id: 'leaves', label: 'Leaves', count: null },
              { id: 'payroll', label: 'Payroll', count: payrollData.length },
              { id: 'performance', label: 'Performance', count: null }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'employees' && (
            <div className="space-y-6">
              {/* Bulk Actions */}
              {selectedEmployees.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-800 font-medium">
                      {selectedEmployees.length} employee(s) selected
                    </span>
                    <div className="flex space-x-2">
                      <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                        Bulk Edit
                      </button>
                      <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                        Bulk Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Employee Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(filteredEmployees.length > 0 ? filteredEmployees : employees).map((employee, index) => (
                  <motion.div
                    key={employee.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(employee.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEmployees(prev => [...prev, employee.id]);
                            } else {
                              setSelectedEmployees(prev => prev.filter(id => id !== employee.id));
                            }
                          }}
                          className="mr-3 h-4 w-4 text-blue-600 rounded"
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {employee.firstName} {employee.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">{employee.employeeId}</p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        employee.status === 'active' ? 'bg-green-100 text-green-800' :
                        employee.status === 'inactive' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {employee.status}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Department:</span>
                        <span className="text-sm font-medium">{employee.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Designation:</span>
                        <span className="text-sm font-medium">{employee.designation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Salary:</span>
                        <span className="text-sm font-semibold text-green-600">PKR {employee.salary.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Performance:</span>
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-1">{employee.performanceRating}</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`text-xs ${
                                  star <= employee.performanceRating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Hire Date:</span>
                        <span className="text-sm">{employee.hireDate}</span>
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="border-t pt-3 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Benefits:</span>
                        <div className="flex space-x-1">
                          {employee.benefits.medical && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Medical</span>
                          )}
                          {employee.benefits.transport && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Transport</span>
                          )}
                          {employee.benefits.bonus > 0 && (
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">Bonus</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors">
                        <Calculator className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payroll' && (
            <div className="space-y-6">
              {/* Payroll Actions */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Payroll Management</h3>
                <div className="flex space-x-3">
                  <button
                    onClick={() => generatePayroll(new Date().getMonth() + 1, new Date().getFullYear())}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    Generate Payroll
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Export Payroll
                  </button>
                </div>
              </div>

              {/* Payroll Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800">Total Payroll</h4>
                  <p className="text-2xl font-bold text-blue-900">
                    PKR {payrollData.reduce((sum, p) => sum + p.netSalary, 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-800">Processed</h4>
                  <p className="text-2xl font-bold text-green-900">
                    {payrollData.filter(p => p.status === 'processed' || p.status === 'paid').length}
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800">Pending</h4>
                  <p className="text-2xl font-bold text-yellow-900">
                    {payrollData.filter(p => p.status === 'pending').length}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-purple-800">Avg Salary</h4>
                  <p className="text-2xl font-bold text-purple-900">
                    PKR {(payrollData.reduce((sum, p) => sum + p.netSalary, 0) / payrollData.length).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Payroll Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Basic Salary</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allowances</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deductions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Salary</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payrollData.map((payroll) => (
                      <tr key={payroll.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{payroll.employeeName}</div>
                          <div className="text-sm text-gray-500">{payroll.employeeId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payroll.month}/{payroll.year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          PKR {payroll.basicSalary.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                          +PKR {payroll.allowances.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          -PKR {(payroll.deductions + payroll.taxDeduction).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          PKR {payroll.netSalary.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            payroll.status === 'paid' ? 'bg-green-100 text-green-800' :
                            payroll.status === 'processed' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {payroll.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">View</button>
                            <button className="text-green-600 hover:text-green-900">Edit</button>
                            <button className="text-purple-600 hover:text-purple-900">Print</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Other tabs content would go here */}
          {activeTab === 'attendance' && (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Attendance Management</h3>
              <p className="text-gray-600">Advanced attendance tracking with biometric integration.</p>
            </div>
          )}

          {activeTab === 'leaves' && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Leave Management</h3>
              <p className="text-gray-600">Comprehensive leave tracking and approval workflows.</p>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="text-center py-12">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Performance Management</h3>
              <p className="text-gray-600">Employee performance tracking and review system.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedHRM;