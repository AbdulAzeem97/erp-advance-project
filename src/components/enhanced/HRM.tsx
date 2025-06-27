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
  Edit
} from 'lucide-react';

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
}

interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'present' | 'absent' | 'late' | 'half_day';
  overtimeHours: number;
}

interface Leave {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
}

const HRM: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'employees' | 'attendance' | 'leaves' | 'payroll'>('employees');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data
  const employees: Employee[] = [
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
      manager: 'CEO'
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
      manager: 'Ahmad Ali'
    },
    {
      id: '3',
      employeeId: 'EMP003',
      firstName: 'Salman',
      lastName: 'Ahmed',
      email: 'salman.ahmed@nutrapharma.com',
      phone: '+92-300-3456789',
      department: 'Sales',
      designation: 'Sales Executive',
      salary: 55000,
      hireDate: '2023-05-10',
      status: 'active',
      manager: 'Sales Manager'
    }
  ];

  const attendance: Attendance[] = [
    {
      id: '1',
      employeeId: 'EMP001',
      employeeName: 'Ahmad Ali',
      date: '2024-02-01',
      checkIn: '08:30',
      checkOut: '17:30',
      status: 'present',
      overtimeHours: 1
    },
    {
      id: '2',
      employeeId: 'EMP002',
      employeeName: 'Fatima Khan',
      date: '2024-02-01',
      checkIn: '09:00',
      checkOut: '18:00',
      status: 'present',
      overtimeHours: 0
    },
    {
      id: '3',
      employeeId: 'EMP003',
      employeeName: 'Salman Ahmed',
      date: '2024-02-01',
      checkIn: '09:15',
      checkOut: '17:45',
      status: 'late',
      overtimeHours: 0
    }
  ];

  const leaves: Leave[] = [
    {
      id: '1',
      employeeId: 'EMP002',
      employeeName: 'Fatima Khan',
      leaveType: 'Annual',
      startDate: '2024-02-15',
      endDate: '2024-02-17',
      days: 3,
      reason: 'Family vacation',
      status: 'pending',
      appliedDate: '2024-02-01'
    },
    {
      id: '2',
      employeeId: 'EMP003',
      employeeName: 'Salman Ahmed',
      leaveType: 'Sick',
      startDate: '2024-01-28',
      endDate: '2024-01-29',
      days: 2,
      reason: 'Flu symptoms',
      status: 'approved',
      appliedDate: '2024-01-27'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'present': case 'approved': return 'bg-green-100 text-green-800';
      case 'inactive': case 'absent': case 'rejected': return 'bg-red-100 text-red-800';
      case 'on_leave': case 'late': case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'half_day': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case 'Production': return 'bg-blue-100 text-blue-800';
      case 'Quality': return 'bg-green-100 text-green-800';
      case 'Sales': return 'bg-purple-100 text-purple-800';
      case 'Finance': return 'bg-yellow-100 text-yellow-800';
      case 'HR': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.status === 'active').length;
  const presentToday = attendance.filter(att => att.status === 'present').length;
  const pendingLeaves = leaves.filter(leave => leave.status === 'pending').length;
  const attendanceRate = (presentToday / totalEmployees) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Human Resource Management</h2>
          <p className="text-gray-600 mt-1">Manage employees, attendance, and payroll</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 flex items-center shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Employee
        </button>
      </div>

      {/* HRM Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Employees</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{totalEmployees}</p>
              <p className="text-blue-600 text-sm mt-1">{activeEmployees} active</p>
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
              <p className="text-green-600 text-sm font-medium">Attendance Rate</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{attendanceRate.toFixed(1)}%</p>
              <p className="text-green-600 text-sm mt-1">{presentToday}/{totalEmployees} present</p>
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
              <p className="text-yellow-600 text-sm font-medium">Pending Leaves</p>
              <p className="text-3xl font-bold text-yellow-900 mt-2">{pendingLeaves}</p>
              <p className="text-yellow-600 text-sm mt-1">Require approval</p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-xl">
              <Calendar className="h-8 w-8 text-white" />
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
              <p className="text-purple-600 text-sm font-medium">Monthly Payroll</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">PKR {(employees.reduce((sum, emp) => sum + emp.salary, 0) / 1000).toFixed(0)}K</p>
              <p className="text-purple-600 text-sm mt-1">This month</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-xl">
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
              onClick={() => setActiveTab('employees')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'employees'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Employees ({totalEmployees})
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'attendance'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Attendance
            </button>
            <button
              onClick={() => setActiveTab('leaves')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'leaves'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Leaves ({pendingLeaves})
            </button>
            <button
              onClick={() => setActiveTab('payroll')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'payroll'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Payroll
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
            <div className="flex gap-2">
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'employees' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {employees.map((employee, index) => (
                <motion.div
                  key={employee.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {employee.firstName} {employee.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{employee.employeeId}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee.status)}`}>
                      {employee.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Department:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDepartmentColor(employee.department)}`}>
                        {employee.department}
                      </span>
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
                      <span className="text-sm text-gray-600">Hire Date:</span>
                      <span className="text-sm">{employee.hireDate}</span>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check Out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Overtime
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendance.map((record, index) => (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{record.employeeName}</div>
                        <div className="text-sm text-gray-500">{record.employeeId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.checkIn}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.checkOut}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.overtimeHours}h
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'leaves' && (
            <div className="space-y-4">
              {leaves.map((leave, index) => (
                <motion.div
                  key={leave.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{leave.employeeName}</h3>
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(leave.status)}`}>
                          {leave.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <span className="text-sm text-gray-600">Leave Type:</span>
                          <p className="font-medium">{leave.leaveType}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Duration:</span>
                          <p className="font-medium">{leave.days} days</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Start Date:</span>
                          <p className="font-medium">{leave.startDate}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">End Date:</span>
                          <p className="font-medium">{leave.endDate}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <span className="text-sm text-gray-600">Reason:</span>
                        <p className="text-gray-900">{leave.reason}</p>
                      </div>

                      {leave.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </button>
                          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center">
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'payroll' && (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Payroll Management</h3>
              <p className="text-gray-600 mb-6">Generate and manage employee payroll.</p>
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                Generate Payroll
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HRM;