import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Send, 
  Plus, 
  Trash2, 
  Calculator,
  User,
  Building,
  Calendar,
  DollarSign
} from 'lucide-react';
import jsPDF from 'jspdf';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  notes: string;
  termsConditions: string;
}

const InvoiceGenerator: React.FC = () => {
  const [invoice, setInvoice] = useState<Invoice>({
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerName: '',
    customerEmail: '',
    customerAddress: '',
    items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }],
    subtotal: 0,
    discountAmount: 0,
    taxRate: 18,
    taxAmount: 0,
    totalAmount: 0,
    notes: '',
    termsConditions: 'Payment is due within 30 days of invoice date. Late payments may incur additional charges.'
  });

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (id: string) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const calculateTotals = () => {
    const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
    const taxableAmount = subtotal - invoice.discountAmount;
    const taxAmount = (taxableAmount * invoice.taxRate) / 100;
    const totalAmount = taxableAmount + taxAmount;

    setInvoice(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      totalAmount
    }));
  };

  React.useEffect(() => {
    calculateTotals();
  }, [invoice.items, invoice.discountAmount, invoice.taxRate]);

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Company header
    doc.setFontSize(24);
    doc.setTextColor(37, 99, 235); // Blue color
    doc.text('NutraPharma ERP', 20, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Industrial Area, Karachi, Pakistan', 20, 40);
    doc.text('Phone: +92-21-34567890 | Email: info@nutrapharma.com', 20, 45);
    
    // Invoice title
    doc.setFontSize(20);
    doc.setTextColor(220, 38, 38); // Red color
    doc.text('INVOICE', 150, 30);
    
    // Invoice details
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 150, 40);
    doc.text(`Date: ${invoice.issueDate}`, 150, 45);
    doc.text(`Due Date: ${invoice.dueDate}`, 150, 50);
    
    // Customer details
    doc.setFontSize(12);
    doc.text('Bill To:', 20, 70);
    doc.setFontSize(10);
    doc.text(invoice.customerName, 20, 80);
    doc.text(invoice.customerEmail, 20, 85);
    doc.text(invoice.customerAddress, 20, 90);
    
    // Items table
    let yPosition = 110;
    doc.setFontSize(10);
    
    // Table headers
    doc.setFillColor(243, 244, 246);
    doc.rect(20, yPosition, 170, 10, 'F');
    doc.text('Description', 25, yPosition + 7);
    doc.text('Qty', 120, yPosition + 7);
    doc.text('Unit Price', 140, yPosition + 7);
    doc.text('Total', 170, yPosition + 7);
    
    yPosition += 15;
    
    // Table rows
    invoice.items.forEach(item => {
      doc.text(item.description, 25, yPosition);
      doc.text(item.quantity.toString(), 120, yPosition);
      doc.text(`PKR ${item.unitPrice.toFixed(2)}`, 140, yPosition);
      doc.text(`PKR ${item.total.toFixed(2)}`, 170, yPosition);
      yPosition += 10;
    });
    
    // Totals
    yPosition += 10;
    doc.text(`Subtotal: PKR ${invoice.subtotal.toFixed(2)}`, 140, yPosition);
    yPosition += 10;
    doc.text(`Discount: PKR ${invoice.discountAmount.toFixed(2)}`, 140, yPosition);
    yPosition += 10;
    doc.text(`Tax (${invoice.taxRate}%): PKR ${invoice.taxAmount.toFixed(2)}`, 140, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text(`Total: PKR ${invoice.totalAmount.toFixed(2)}`, 140, yPosition);
    
    // Terms and conditions
    if (invoice.termsConditions) {
      yPosition += 20;
      doc.setFontSize(10);
      doc.text('Terms & Conditions:', 20, yPosition);
      yPosition += 10;
      const splitText = doc.splitTextToSize(invoice.termsConditions, 170);
      doc.text(splitText, 20, yPosition);
    }
    
    doc.save(`${invoice.invoiceNumber}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Invoice Generator</h2>
          <p className="text-gray-600 mt-1">Create professional invoices with PDF export</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={generatePDF}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center shadow-lg"
          >
            <Download className="h-5 w-5 mr-2" />
            Download PDF
          </button>
          <button className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 flex items-center shadow-lg">
            <Send className="h-5 w-5 mr-2" />
            Send Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-500" />
              Invoice Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                <input
                  type="text"
                  value={invoice.invoiceNumber}
                  onChange={(e) => setInvoice(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                <input
                  type="date"
                  value={invoice.issueDate}
                  onChange={(e) => setInvoice(prev => ({ ...prev, issueDate: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={invoice.dueDate}
                  onChange={(e) => setInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </motion.div>

          {/* Customer Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-green-500" />
              Customer Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={invoice.customerName}
                  onChange={(e) => setInvoice(prev => ({ ...prev, customerName: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={invoice.customerEmail}
                  onChange={(e) => setInvoice(prev => ({ ...prev, customerEmail: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="customer@email.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={invoice.customerAddress}
                  onChange={(e) => setInvoice(prev => ({ ...prev, customerAddress: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Customer address"
                />
              </div>
            </div>
          </motion.div>

          {/* Invoice Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-purple-500" />
                Invoice Items
              </h3>
              <button
                onClick={addItem}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {invoice.items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 items-center p-4 bg-gray-50 rounded-lg">
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Item description"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Qty"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Price"
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="p-2 bg-gray-100 rounded text-center font-medium">
                      PKR {item.total.toFixed(2)}
                    </div>
                  </div>
                  <div className="col-span-1">
                    {invoice.items.length > 1 && (
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Additional Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={invoice.notes}
                  onChange={(e) => setInvoice(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Additional notes or comments"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                <textarea
                  value={invoice.termsConditions}
                  onChange={(e) => setInvoice(prev => ({ ...prev, termsConditions: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Invoice Summary */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 sticky top-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-500" />
              Invoice Summary
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">PKR {invoice.subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Discount:</span>
                <input
                  type="number"
                  value={invoice.discountAmount}
                  onChange={(e) => setInvoice(prev => ({ ...prev, discountAmount: parseFloat(e.target.value) || 0 }))}
                  className="w-24 p-1 border border-gray-300 rounded text-right"
                  placeholder="0"
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tax Rate (%):</span>
                <input
                  type="number"
                  value={invoice.taxRate}
                  onChange={(e) => setInvoice(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                  className="w-24 p-1 border border-gray-300 rounded text-right"
                />
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Tax Amount:</span>
                <span className="font-medium">PKR {invoice.taxAmount.toFixed(2)}</span>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-green-600">PKR {invoice.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={generatePDF}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </button>
              <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
                <Send className="h-4 w-4 mr-2" />
                Send to Customer
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;