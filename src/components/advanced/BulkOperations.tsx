import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X,
  Users,
  Package,
  ShoppingCart,
  DollarSign
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';

interface BulkOperationsProps {
  type: 'employees' | 'inventory' | 'customers' | 'suppliers' | 'transactions';
  onImport: (data: any[]) => void;
  onExport: () => any[];
  templateData: any;
}

const BulkOperations: React.FC<BulkOperationsProps> = ({ 
  type, 
  onImport, 
  onExport, 
  templateData 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [importData, setImportData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const getTypeConfig = () => {
    switch (type) {
      case 'employees':
        return {
          title: 'Employee Bulk Operations',
          icon: Users,
          color: 'blue',
          template: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@company.com',
            phone: '+92-300-1234567',
            department: 'Production',
            designation: 'Manager',
            salary: 85000,
            hireDate: '2024-01-15',
            cnic: '12345-6789012-3',
            address: 'Street Address, City',
            emergencyContact: 'Jane Doe',
            emergencyPhone: '+92-300-9876543'
          }
        };
      case 'inventory':
        return {
          title: 'Inventory Bulk Operations',
          icon: Package,
          color: 'green',
          template: {
            name: 'Product Name',
            sku: 'SKU-001',
            category: 'Category',
            quantity: 100,
            unit: 'pieces',
            costPrice: 50.00,
            sellingPrice: 75.00,
            supplier: 'Supplier Name',
            reorderLevel: 20,
            expiryDate: '2025-12-31',
            batchNumber: 'BATCH-001'
          }
        };
      case 'customers':
        return {
          title: 'Customer Bulk Operations',
          icon: Users,
          color: 'purple',
          template: {
            name: 'Customer Name',
            email: 'customer@email.com',
            phone: '+92-21-1234567',
            address: 'Customer Address',
            city: 'Karachi',
            customerType: 'pharmacy',
            creditLimit: 100000,
            paymentTerms: 'Net 30',
            discount: 5
          }
        };
      case 'suppliers':
        return {
          title: 'Supplier Bulk Operations',
          icon: ShoppingCart,
          color: 'orange',
          template: {
            name: 'Supplier Name',
            email: 'supplier@email.com',
            phone: '+92-21-1234567',
            address: 'Supplier Address',
            city: 'Lahore',
            paymentTerms: 'Net 30',
            ntn: '1234567-8',
            strn: '15-40-0000-123-45'
          }
        };
      case 'transactions':
        return {
          title: 'Transaction Bulk Operations',
          icon: DollarSign,
          color: 'red',
          template: {
            type: 'income',
            category: 'Sales',
            amount: 50000,
            description: 'Transaction Description',
            date: '2024-02-01',
            paymentMethod: 'bank',
            reference: 'REF-001'
          }
        };
      default:
        return { title: 'Bulk Operations', icon: FileText, color: 'gray', template: {} };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let parsedData: any[] = [];

        if (file.name.endsWith('.csv')) {
          Papa.parse(data as string, {
            header: true,
            complete: (results) => {
              parsedData = results.data;
              processImportData(parsedData);
            },
            error: (error) => {
              toast.error(`CSV parsing error: ${error.message}`);
              setIsProcessing(false);
            }
          });
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          parsedData = XLSX.utils.sheet_to_json(worksheet);
          processImportData(parsedData);
        } else {
          toast.error('Unsupported file format. Please use CSV or Excel files.');
          setIsProcessing(false);
        }
      } catch (error) {
        toast.error('Error reading file');
        setIsProcessing(false);
      }
    };

    reader.readAsBinaryString(file);
  }, []);

  const processImportData = (data: any[]) => {
    const errors: string[] = [];
    const validData: any[] = [];

    data.forEach((row, index) => {
      const validation = validateRow(row, index + 1);
      if (validation.isValid) {
        validData.push(validation.data);
      } else {
        errors.push(...validation.errors);
      }
    });

    setImportData(validData);
    setValidationErrors(errors);
    setIsProcessing(false);

    if (errors.length === 0) {
      toast.success(`${validData.length} records ready for import`);
    } else {
      toast.warning(`${validData.length} valid records, ${errors.length} errors found`);
    }
  };

  const validateRow = (row: any, rowNumber: number) => {
    const errors: string[] = [];
    let isValid = true;

    // Type-specific validation
    switch (type) {
      case 'employees':
        if (!row.firstName) {
          errors.push(`Row ${rowNumber}: First name is required`);
          isValid = false;
        }
        if (!row.email || !isValidEmail(row.email)) {
          errors.push(`Row ${rowNumber}: Valid email is required`);
          isValid = false;
        }
        if (!row.salary || isNaN(parseFloat(row.salary))) {
          errors.push(`Row ${rowNumber}: Valid salary is required`);
          isValid = false;
        }
        break;
      case 'inventory':
        if (!row.name) {
          errors.push(`Row ${rowNumber}: Product name is required`);
          isValid = false;
        }
        if (!row.sku) {
          errors.push(`Row ${rowNumber}: SKU is required`);
          isValid = false;
        }
        if (!row.quantity || isNaN(parseFloat(row.quantity))) {
          errors.push(`Row ${rowNumber}: Valid quantity is required`);
          isValid = false;
        }
        break;
      case 'customers':
        if (!row.name) {
          errors.push(`Row ${rowNumber}: Customer name is required`);
          isValid = false;
        }
        if (!row.email || !isValidEmail(row.email)) {
          errors.push(`Row ${rowNumber}: Valid email is required`);
          isValid = false;
        }
        break;
    }

    return { isValid, data: row, errors };
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  const handleImport = () => {
    if (importData.length === 0) {
      toast.error('No valid data to import');
      return;
    }

    onImport(importData);
    toast.success(`Successfully imported ${importData.length} records`);
    setIsOpen(false);
    setImportData([]);
    setValidationErrors([]);
  };

  const handleExport = (format: 'csv' | 'xlsx') => {
    const data = onExport();
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const filename = `${type}_export_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `${filename}.csv`);
    } else {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, type);
      XLSX.writeFile(wb, `${filename}.xlsx`);
    }

    toast.success(`Exported ${data.length} records`);
  };

  const downloadTemplate = (format: 'csv' | 'xlsx') => {
    const templateArray = [config.template];
    const filename = `${type}_template`;

    if (format === 'csv') {
      const csv = Papa.unparse(templateArray);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `${filename}.csv`);
    } else {
      const ws = XLSX.utils.json_to_sheet(templateArray);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Template');
      XLSX.writeFile(wb, `${filename}.xlsx`);
    }

    toast.success('Template downloaded');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`bg-gradient-to-r from-${config.color}-600 to-${config.color}-700 text-white px-4 py-2 rounded-xl hover:from-${config.color}-700 hover:to-${config.color}-800 transition-all duration-300 flex items-center shadow-lg`}
      >
        <Upload className="h-4 w-4 mr-2" />
        Bulk Operations
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Icon className={`h-6 w-6 mr-3 text-${config.color}-600`} />
                {config.title}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Import Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Import Data</h3>
                
                {/* Template Download */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Download Template</h4>
                  <p className="text-blue-600 text-sm mb-3">
                    Download a template file to see the required format
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => downloadTemplate('csv')}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      CSV Template
                    </button>
                    <button
                      onClick={() => downloadTemplate('xlsx')}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Excel Template
                    </button>
                  </div>
                </div>

                {/* File Upload */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  {isDragActive ? (
                    <p className="text-blue-600">Drop the file here...</p>
                  ) : (
                    <div>
                      <p className="text-gray-600 mb-2">
                        Drag & drop a file here, or click to select
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports CSV and Excel files
                      </p>
                    </div>
                  )}
                </div>

                {/* Validation Results */}
                {(importData.length > 0 || validationErrors.length > 0) && (
                  <div className="space-y-3">
                    {importData.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                          <span className="text-green-800 font-medium">
                            {importData.length} valid records ready for import
                          </span>
                        </div>
                      </div>
                    )}

                    {validationErrors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                          <div>
                            <span className="text-red-800 font-medium block mb-2">
                              {validationErrors.length} validation errors:
                            </span>
                            <div className="max-h-32 overflow-y-auto">
                              {validationErrors.map((error, index) => (
                                <p key={index} className="text-red-700 text-sm">
                                  {error}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {importData.length > 0 && (
                      <button
                        onClick={handleImport}
                        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Import {importData.length} Records
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Export Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Export Data</h3>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">Export Current Data</h4>
                  <p className="text-green-600 text-sm mb-3">
                    Export all current {type} data to CSV or Excel format
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleExport('csv')}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export CSV
                    </button>
                    <button
                      onClick={() => handleExport('xlsx')}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export Excel
                    </button>
                  </div>
                </div>

                {/* Sample Data Preview */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Sample Data Format</h4>
                  <div className="bg-white border rounded p-3 text-xs overflow-x-auto">
                    <pre className="text-gray-600">
                      {JSON.stringify(config.template, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {isProcessing && (
              <div className="mt-6 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Processing file...</span>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </>
  );
};

export default BulkOperations;