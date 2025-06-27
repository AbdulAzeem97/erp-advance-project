import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  BarChart3,
  PieChart,
  Users,
  Package,
  DollarSign,
  Clock,
  Filter,
  RefreshCw
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from 'date-fns';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface ReportConfig {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  category: 'financial' | 'operational' | 'hr' | 'inventory';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

interface AdvancedReportsProps {
  data: {
    employees: any[];
    transactions: any[];
    inventory: any[];
    customers: any[];
    sales: any[];
    production: any[];
    waste: any[];
  };
}

const AdvancedReports: React.FC<AdvancedReportsProps> = ({ data }) => {
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });
  const [reportFormat, setReportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [isGenerating, setIsGenerating] = useState(false);

  const reportConfigs: ReportConfig[] = [
    {
      id: 'financial-summary',
      title: 'Financial Summary Report',
      description: 'Complete financial overview with P&L, cash flow, and key metrics',
      icon: DollarSign,
      color: 'green',
      category: 'financial',
      frequency: 'monthly'
    },
    {
      id: 'salary-expense',
      title: 'Salary & Expense Report',
      description: 'Detailed breakdown of salary payments and operational expenses',
      icon: Users,
      color: 'blue',
      category: 'hr',
      frequency: 'monthly'
    },
    {
      id: 'ledger-report',
      title: 'General Ledger Report',
      description: 'Complete transaction ledger with account balances',
      icon: FileText,
      color: 'purple',
      category: 'financial',
      frequency: 'monthly'
    },
    {
      id: 'inventory-valuation',
      title: 'Inventory Valuation Report',
      description: 'Stock levels, valuations, and movement analysis',
      icon: Package,
      color: 'orange',
      category: 'inventory',
      frequency: 'monthly'
    },
    {
      id: 'sales-performance',
      title: 'Sales Performance Report',
      description: 'Sales trends, customer analysis, and revenue breakdown',
      icon: TrendingUp,
      color: 'indigo',
      category: 'operational',
      frequency: 'monthly'
    },
    {
      id: 'production-efficiency',
      title: 'Production Efficiency Report',
      description: 'Manufacturing metrics, yield analysis, and waste tracking',
      icon: BarChart3,
      color: 'red',
      category: 'operational',
      frequency: 'monthly'
    },
    {
      id: 'employee-performance',
      title: 'Employee Performance Report',
      description: 'Attendance, productivity, and HR metrics',
      icon: Users,
      color: 'cyan',
      category: 'hr',
      frequency: 'monthly'
    },
    {
      id: 'customer-analysis',
      title: 'Customer Analysis Report',
      description: 'Customer behavior, retention, and profitability analysis',
      icon: Users,
      color: 'pink',
      category: 'operational',
      frequency: 'quarterly'
    }
  ];

  const quickDateRanges = [
    { label: 'This Month', start: startOfMonth(new Date()), end: endOfMonth(new Date()) },
    { label: 'Last Month', start: startOfMonth(subMonths(new Date(), 1)), end: endOfMonth(subMonths(new Date(), 1)) },
    { label: 'This Year', start: startOfYear(new Date()), end: endOfYear(new Date()) },
    { label: 'Last 3 Months', start: startOfMonth(subMonths(new Date(), 2)), end: endOfMonth(new Date()) },
    { label: 'Last 6 Months', start: startOfMonth(subMonths(new Date(), 5)), end: endOfMonth(new Date()) }
  ];

  const generateFinancialSummary = () => {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    
    const filteredTransactions = data.transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const salaryExpenses = data.employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
    
    return {
      period: `${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`,
      totalIncome: income,
      totalExpenses: expenses,
      salaryExpenses,
      netProfit: income - expenses,
      profitMargin: income > 0 ? ((income - expenses) / income * 100) : 0,
      transactions: filteredTransactions,
      expensesByCategory: filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {} as Record<string, number>)
    };
  };

  const generateSalaryExpenseReport = () => {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    
    const salaryData = data.employees.map(emp => ({
      ...emp,
      monthlySalary: emp.salary || 0,
      benefits: emp.salary * 0.15, // 15% benefits
      totalCost: emp.salary * 1.15
    }));

    const expenseTransactions = data.transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return t.type === 'expense' && transactionDate >= startDate && transactionDate <= endDate;
    });

    return {
      period: `${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`,
      employees: salaryData,
      totalSalaries: salaryData.reduce((sum, emp) => sum + emp.monthlySalary, 0),
      totalBenefits: salaryData.reduce((sum, emp) => sum + emp.benefits, 0),
      totalPayrollCost: salaryData.reduce((sum, emp) => sum + emp.totalCost, 0),
      operationalExpenses: expenseTransactions,
      totalOperationalExpenses: expenseTransactions.reduce((sum, t) => sum + t.amount, 0),
      departmentWiseCosts: salaryData.reduce((acc, emp) => {
        acc[emp.department] = (acc[emp.department] || 0) + emp.totalCost;
        return acc;
      }, {} as Record<string, number>)
    };
  };

  const generateLedgerReport = () => {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    
    const filteredTransactions = data.transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningBalance = 0;
    const ledgerEntries = filteredTransactions.map(t => {
      runningBalance += t.type === 'income' ? t.amount : -t.amount;
      return {
        ...t,
        runningBalance
      };
    });

    return {
      period: `${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`,
      entries: ledgerEntries,
      openingBalance: 0,
      closingBalance: runningBalance,
      totalDebits: filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
      totalCredits: filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    };
  };

  const generateInventoryReport = () => {
    const totalValue = data.inventory.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
    const lowStockItems = data.inventory.filter(item => item.status === 'low-stock');
    const expiredItems = data.inventory.filter(item => item.status === 'expired');
    
    return {
      period: format(new Date(), 'MMM dd, yyyy'),
      totalItems: data.inventory.length,
      totalValue,
      lowStockItems: lowStockItems.length,
      expiredItems: expiredItems.length,
      inventory: data.inventory,
      categoryBreakdown: data.inventory.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + (item.quantity * item.costPrice);
        return acc;
      }, {} as Record<string, number>)
    };
  };

  const generatePDFReport = (reportData: any, reportType: string) => {
    const doc = new jsPDF();
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text('NutraPharma ERP', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(reportConfigs.find(r => r.id === reportType)?.title || 'Report', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Period: ${reportData.period}`, 20, yPosition);
    yPosition += 15;

    // Report-specific content
    switch (reportType) {
      case 'financial-summary':
        doc.setFontSize(12);
        doc.text('Financial Summary', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.text(`Total Income: PKR ${reportData.totalIncome.toLocaleString()}`, 20, yPosition);
        yPosition += 5;
        doc.text(`Total Expenses: PKR ${reportData.totalExpenses.toLocaleString()}`, 20, yPosition);
        yPosition += 5;
        doc.text(`Net Profit: PKR ${reportData.netProfit.toLocaleString()}`, 20, yPosition);
        yPosition += 5;
        doc.text(`Profit Margin: ${reportData.profitMargin.toFixed(2)}%`, 20, yPosition);
        yPosition += 15;

        // Expenses by category
        doc.text('Expenses by Category:', 20, yPosition);
        yPosition += 10;
        Object.entries(reportData.expensesByCategory).forEach(([category, amount]) => {
          doc.text(`${category}: PKR ${(amount as number).toLocaleString()}`, 25, yPosition);
          yPosition += 5;
        });
        break;

      case 'salary-expense':
        doc.setFontSize(12);
        doc.text('Salary & Expense Summary', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.text(`Total Salaries: PKR ${reportData.totalSalaries.toLocaleString()}`, 20, yPosition);
        yPosition += 5;
        doc.text(`Total Benefits: PKR ${reportData.totalBenefits.toLocaleString()}`, 20, yPosition);
        yPosition += 5;
        doc.text(`Total Payroll Cost: PKR ${reportData.totalPayrollCost.toLocaleString()}`, 20, yPosition);
        yPosition += 5;
        doc.text(`Operational Expenses: PKR ${reportData.totalOperationalExpenses.toLocaleString()}`, 20, yPosition);
        yPosition += 15;

        // Department-wise costs
        doc.text('Department-wise Costs:', 20, yPosition);
        yPosition += 10;
        Object.entries(reportData.departmentWiseCosts).forEach(([dept, cost]) => {
          doc.text(`${dept}: PKR ${(cost as number).toLocaleString()}`, 25, yPosition);
          yPosition += 5;
        });
        break;

      case 'inventory-valuation':
        doc.setFontSize(12);
        doc.text('Inventory Summary', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.text(`Total Items: ${reportData.totalItems}`, 20, yPosition);
        yPosition += 5;
        doc.text(`Total Value: PKR ${reportData.totalValue.toLocaleString()}`, 20, yPosition);
        yPosition += 5;
        doc.text(`Low Stock Items: ${reportData.lowStockItems}`, 20, yPosition);
        yPosition += 5;
        doc.text(`Expired Items: ${reportData.expiredItems}`, 20, yPosition);
        break;
    }

    return doc;
  };

  const generateExcelReport = (reportData: any, reportType: string) => {
    const wb = XLSX.utils.book_new();
    
    switch (reportType) {
      case 'financial-summary':
        const financialSummary = [
          ['Financial Summary Report'],
          ['Period', reportData.period],
          [''],
          ['Metric', 'Amount (PKR)'],
          ['Total Income', reportData.totalIncome],
          ['Total Expenses', reportData.totalExpenses],
          ['Net Profit', reportData.netProfit],
          ['Profit Margin (%)', reportData.profitMargin.toFixed(2)],
          [''],
          ['Expenses by Category'],
          ['Category', 'Amount (PKR)'],
          ...Object.entries(reportData.expensesByCategory).map(([cat, amt]) => [cat, amt])
        ];
        
        const ws1 = XLSX.utils.aoa_to_sheet(financialSummary);
        XLSX.utils.book_append_sheet(wb, ws1, 'Financial Summary');
        
        const ws2 = XLSX.utils.json_to_sheet(reportData.transactions);
        XLSX.utils.book_append_sheet(wb, ws2, 'Transactions');
        break;

      case 'salary-expense':
        const salaryWs = XLSX.utils.json_to_sheet(reportData.employees);
        XLSX.utils.book_append_sheet(wb, salaryWs, 'Employee Salaries');
        
        const expenseWs = XLSX.utils.json_to_sheet(reportData.operationalExpenses);
        XLSX.utils.book_append_sheet(wb, expenseWs, 'Operational Expenses');
        break;

      case 'inventory-valuation':
        const inventoryWs = XLSX.utils.json_to_sheet(reportData.inventory);
        XLSX.utils.book_append_sheet(wb, inventoryWs, 'Inventory');
        break;
    }

    return wb;
  };

  const handleGenerateReport = async () => {
    if (!selectedReport) return;

    setIsGenerating(true);
    
    try {
      let reportData;
      
      switch (selectedReport) {
        case 'financial-summary':
          reportData = generateFinancialSummary();
          break;
        case 'salary-expense':
          reportData = generateSalaryExpenseReport();
          break;
        case 'ledger-report':
          reportData = generateLedgerReport();
          break;
        case 'inventory-valuation':
          reportData = generateInventoryReport();
          break;
        default:
          reportData = generateFinancialSummary();
      }

      const reportConfig = reportConfigs.find(r => r.id === selectedReport);
      const filename = `${reportConfig?.title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}`;

      if (reportFormat === 'pdf') {
        const doc = generatePDFReport(reportData, selectedReport);
        doc.save(`${filename}.pdf`);
      } else {
        const wb = generateExcelReport(reportData, selectedReport);
        XLSX.writeFile(wb, `${filename}.xlsx`);
      }

      toast.success('Report generated successfully!');
    } catch (error) {
      toast.error('Error generating report');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Advanced Reports</h2>
          <p className="text-gray-600 mt-1">Generate comprehensive business reports with detailed analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Report Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportConfigs.map((report) => {
                const Icon = report.icon;
                return (
                  <motion.div
                    key={report.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedReport === report.id
                        ? `border-${report.color}-500 bg-${report.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedReport(report.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg bg-${report.color}-100`}>
                        <Icon className={`h-5 w-5 text-${report.color}-600`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{report.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                        <div className="flex items-center mt-2 space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full bg-${report.color}-100 text-${report.color}-800`}>
                            {report.category}
                          </span>
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            {report.frequency}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-500" />
              Date Range
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {quickDateRanges.map((range) => (
                <button
                  key={range.label}
                  onClick={() => setDateRange({
                    startDate: format(range.start, 'yyyy-MM-dd'),
                    endDate: format(range.end, 'yyyy-MM-dd')
                  })}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Report Configuration */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Configuration</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Output Format</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setReportFormat('pdf')}
                    className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                      reportFormat === 'pdf'
                        ? 'bg-red-50 border-red-300 text-red-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FileText className="h-4 w-4 mx-auto mb-1" />
                    PDF
                  </button>
                  <button
                    onClick={() => setReportFormat('excel')}
                    className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                      reportFormat === 'excel'
                        ? 'bg-green-50 border-green-300 text-green-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4 mx-auto mb-1" />
                    Excel
                  </button>
                </div>
              </div>

              {selectedReport && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Selected Report</h4>
                  <p className="text-blue-700 text-sm">
                    {reportConfigs.find(r => r.id === selectedReport)?.title}
                  </p>
                  <p className="text-blue-600 text-xs mt-1">
                    Period: {format(new Date(dateRange.startDate), 'MMM dd')} - {format(new Date(dateRange.endDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}

              <button
                onClick={handleGenerateReport}
                disabled={!selectedReport || isGenerating}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Download className="h-5 w-5 mr-2" />
                )}
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedReports;