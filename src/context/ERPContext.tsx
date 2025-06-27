import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  RawMaterial, 
  FinishedProduct, 
  PurchaseOrder, 
  Transaction, 
  Supplier,
  Production,
  QualityControl,
  WasteRecord,
  Customer,
  SalesOrder,
  Alert
} from '../types';

interface ERPContextType {
  // Existing data
  rawMaterials: RawMaterial[];
  finishedProducts: FinishedProduct[];
  purchaseOrders: PurchaseOrder[];
  transactions: Transaction[];
  suppliers: Supplier[];
  
  // New data
  productions: Production[];
  qualityControls: QualityControl[];
  wasteRecords: WasteRecord[];
  customers: Customer[];
  salesOrders: SalesOrder[];
  alerts: Alert[];
  
  // Existing functions
  addRawMaterial: (material: RawMaterial) => void;
  addFinishedProduct: (product: FinishedProduct) => void;
  addPurchaseOrder: (order: PurchaseOrder) => void;
  addTransaction: (transaction: Transaction) => void;
  addSupplier: (supplier: Supplier) => void;
  updateStock: (type: 'raw' | 'finished', id: string, quantity: number) => void;
  
  // New functions
  addProduction: (production: Production) => void;
  addQualityControl: (qc: QualityControl) => void;
  addWasteRecord: (waste: WasteRecord) => void;
  addCustomer: (customer: Customer) => void;
  addSalesOrder: (order: SalesOrder) => void;
  acknowledgeAlert: (alertId: string) => void;
  generateAlerts: () => void;
  
  // Analytics functions
  getWastageAnalytics: () => any;
  getProductionEfficiency: () => any;
  getProfitabilityAnalysis: () => any;
  getInventoryTurnover: () => any;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export const useERP = () => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
};

export const ERPProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([
    {
      id: '1',
      name: 'Vitamin C (Ascorbic Acid)',
      supplier: 'Karachi Chemicals Ltd',
      quantity: 500,
      unit: 'kg',
      costPerUnit: 2550,
      reorderLevel: 100,
      maxStockLevel: 1000,
      expiryDate: '2025-06-30',
      batchNumber: 'VC-2024-001',
      status: 'in-stock',
      location: 'Warehouse A-1',
      lastUpdated: '2024-01-15',
      wastage: 5,
      qualityGrade: 'A'
    },
    {
      id: '2',
      name: 'Magnesium Oxide',
      supplier: 'Lahore Pharma Supplies',
      quantity: 50,
      unit: 'kg',
      costPerUnit: 1575,
      reorderLevel: 100,
      maxStockLevel: 500,
      expiryDate: '2025-08-15',
      batchNumber: 'MG-2024-002',
      status: 'low-stock',
      location: 'Warehouse A-2',
      lastUpdated: '2024-01-10',
      wastage: 2,
      qualityGrade: 'A'
    },
    {
      id: '3',
      name: 'Calcium Carbonate',
      supplier: 'Islamabad Minerals Co',
      quantity: 800,
      unit: 'kg',
      costPerUnit: 850,
      reorderLevel: 200,
      maxStockLevel: 1200,
      expiryDate: '2026-03-20',
      batchNumber: 'CC-2024-003',
      status: 'in-stock',
      location: 'Warehouse B-1',
      lastUpdated: '2024-01-12',
      wastage: 10,
      qualityGrade: 'B'
    }
  ]);

  const [finishedProducts, setFinishedProducts] = useState<FinishedProduct[]>([
    {
      id: '1',
      name: 'Vitamin C Tablets 1000mg',
      sku: 'VIT-C-1000',
      quantity: 2500,
      unit: 'bottles',
      costPrice: 850,
      sellingPrice: 1599,
      category: 'Vitamins',
      expiryDate: '2025-12-31',
      batchNumber: 'VCT-2024-001',
      status: 'in-stock',
      location: 'Finished Goods A-1',
      lastUpdated: '2024-01-14',
      productionCost: 750,
      profitMargin: 46.9,
      demandForecast: 3000,
      actualSales: 2200,
      overproduction: 300
    },
    {
      id: '2',
      name: 'Calcium Magnesium Complex',
      sku: 'CAL-MAG-500',
      quantity: 150,
      unit: 'bottles',
      costPrice: 1225,
      sellingPrice: 2299,
      category: 'Minerals',
      expiryDate: '2025-10-15',
      batchNumber: 'CMC-2024-001',
      status: 'low-stock',
      location: 'Finished Goods A-2',
      lastUpdated: '2024-01-13',
      productionCost: 1100,
      profitMargin: 46.7,
      demandForecast: 500,
      actualSales: 450,
      overproduction: 0
    }
  ]);

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: 'PO-001',
      supplier: 'Karachi Chemicals Ltd',
      orderDate: '2024-01-15',
      expectedDelivery: '2024-01-25',
      actualDelivery: '2024-01-24',
      status: 'delivered',
      items: [
        { 
          itemId: '1', 
          itemName: 'Vitamin C', 
          quantity: 200, 
          receivedQuantity: 195,
          unitPrice: 2550, 
          total: 510000,
          qualityCheck: 'passed'
        }
      ],
      totalAmount: 510000,
      discountAmount: 10000,
      taxAmount: 91800,
      finalAmount: 591800,
      paymentStatus: 'paid',
      deliveryCharges: 5000
    }
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'income',
      category: 'Product Sales',
      amount: 1500000,
      description: 'Monthly product sales - January',
      date: '2024-01-31',
      paymentMethod: 'bank',
      taxAmount: 270000,
      approved: true,
      approvedBy: 'Manager'
    },
    {
      id: '2',
      type: 'expense',
      category: 'Raw Materials',
      amount: 591800,
      description: 'Vitamin C purchase from Karachi Chemicals',
      date: '2024-01-15',
      reference: 'PO-001',
      paymentMethod: 'bank',
      taxAmount: 91800,
      approved: true,
      approvedBy: 'Manager'
    }
  ]);

  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: '1',
      name: 'Karachi Chemicals Ltd',
      contact: '+92-21-34567890',
      email: 'orders@karachichemicals.com',
      address: 'Industrial Area, SITE',
      city: 'Karachi',
      paymentTerms: 'Net 30',
      rating: 4.8,
      totalOrders: 25,
      onTimeDeliveries: 23,
      qualityScore: 4.7,
      creditLimit: 2000000,
      outstandingAmount: 0,
      ntn: '1234567-8',
      strn: '15-40-0000-123-45'
    }
  ]);

  const [productions, setProductions] = useState<Production[]>([
    {
      id: 'PROD-001',
      productId: '1',
      productName: 'Vitamin C Tablets 1000mg',
      batchNumber: 'VCT-2024-001',
      plannedQuantity: 3000,
      actualQuantity: 2800,
      startDate: '2024-01-10',
      endDate: '2024-01-14',
      status: 'completed',
      rawMaterialsUsed: [
        {
          materialId: '1',
          materialName: 'Vitamin C',
          plannedQuantity: 150,
          actualQuantity: 155,
          wastage: 5
        }
      ],
      laborCost: 50000,
      overheadCost: 30000,
      totalCost: 750000,
      yieldPercentage: 93.3,
      qualityGrade: 'A',
      supervisor: 'Ahmad Ali'
    }
  ]);

  const [qualityControls, setQualityControls] = useState<QualityControl[]>([
    {
      id: 'QC-001',
      batchNumber: 'VCT-2024-001',
      productType: 'finished-product',
      itemId: '1',
      itemName: 'Vitamin C Tablets 1000mg',
      testDate: '2024-01-14',
      testResults: [
        { parameter: 'Assay', expectedValue: '95-105%', actualValue: '98.5%', status: 'pass' },
        { parameter: 'Dissolution', expectedValue: '>80% in 30 min', actualValue: '85% in 25 min', status: 'pass' },
        { parameter: 'Hardness', expectedValue: '4-8 kp', actualValue: '6.2 kp', status: 'pass' }
      ],
      overallStatus: 'approved',
      inspector: 'Dr. Fatima Khan',
      remarks: 'All parameters within acceptable limits'
    }
  ]);

  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>([
    {
      id: 'WASTE-001',
      itemId: '1',
      itemName: 'Vitamin C',
      itemType: 'raw-material',
      wasteQuantity: 5,
      wasteReason: 'production-loss',
      wasteValue: 12750,
      date: '2024-01-14',
      reportedBy: 'Production Supervisor',
      approved: true,
      disposalMethod: 'Incineration'
    }
  ]);

  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: '1',
      name: 'Health Plus Pharmacy',
      contact: '+92-42-35678901',
      email: 'orders@healthplus.com',
      address: 'Main Boulevard, Gulberg',
      city: 'Lahore',
      customerType: 'pharmacy',
      creditLimit: 500000,
      outstandingAmount: 125000,
      totalPurchases: 2500000,
      lastOrderDate: '2024-01-30',
      paymentTerms: 'Net 15',
      discount: 5
    }
  ]);

  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([
    {
      id: 'SO-001',
      customerId: '1',
      customerName: 'Health Plus Pharmacy',
      orderDate: '2024-01-30',
      deliveryDate: '2024-02-02',
      status: 'delivered',
      items: [
        {
          productId: '1',
          productName: 'Vitamin C Tablets 1000mg',
          quantity: 100,
          unitPrice: 1599,
          discount: 5,
          total: 151905
        }
      ],
      subtotal: 159900,
      discountAmount: 7995,
      taxAmount: 27342,
      totalAmount: 179247,
      paymentStatus: 'partial',
      salesPerson: 'Salman Ahmed'
    }
  ]);

  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Generate alerts based on current data
  const generateAlerts = () => {
    const newAlerts: Alert[] = [];
    
    // Low stock alerts
    rawMaterials.forEach(material => {
      if (material.quantity <= material.reorderLevel) {
        newAlerts.push({
          id: `alert-${Date.now()}-${material.id}`,
          type: 'low-stock',
          severity: material.quantity === 0 ? 'critical' : 'high',
          title: 'Low Stock Alert',
          message: `${material.name} is running low (${material.quantity} ${material.unit} remaining)`,
          date: new Date().toISOString().split('T')[0],
          acknowledged: false,
          actionRequired: true,
          relatedId: material.id
        });
      }
    });

    // Expiry alerts
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    [...rawMaterials, ...finishedProducts].forEach(item => {
      const expiryDate = new Date(item.expiryDate);
      if (expiryDate <= thirtyDaysFromNow) {
        newAlerts.push({
          id: `alert-${Date.now()}-exp-${item.id}`,
          type: 'expiry',
          severity: expiryDate <= today ? 'critical' : 'medium',
          title: 'Expiry Alert',
          message: `${item.name} (Batch: ${item.batchNumber}) expires on ${item.expiryDate}`,
          date: new Date().toISOString().split('T')[0],
          acknowledged: false,
          actionRequired: true,
          relatedId: item.id
        });
      }
    });

    // Overproduction alerts
    finishedProducts.forEach(product => {
      if (product.overproduction > 0) {
        newAlerts.push({
          id: `alert-${Date.now()}-over-${product.id}`,
          type: 'production',
          severity: 'medium',
          title: 'Overproduction Alert',
          message: `${product.name} has overproduction of ${product.overproduction} units`,
          date: new Date().toISOString().split('T')[0],
          acknowledged: false,
          actionRequired: true,
          relatedId: product.id
        });
      }
    });

    setAlerts(prev => [...prev.filter(alert => alert.acknowledged), ...newAlerts]);
  };

  useEffect(() => {
    generateAlerts();
  }, [rawMaterials, finishedProducts]);

  // Add functions
  const addRawMaterial = (material: RawMaterial) => {
    setRawMaterials(prev => [...prev, material]);
  };

  const addFinishedProduct = (product: FinishedProduct) => {
    setFinishedProducts(prev => [...prev, product]);
  };

  const addPurchaseOrder = (order: PurchaseOrder) => {
    setPurchaseOrders(prev => [...prev, order]);
  };

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [...prev, transaction]);
  };

  const addSupplier = (supplier: Supplier) => {
    setSuppliers(prev => [...prev, supplier]);
  };

  const addProduction = (production: Production) => {
    setProductions(prev => [...prev, production]);
  };

  const addQualityControl = (qc: QualityControl) => {
    setQualityControls(prev => [...prev, qc]);
  };

  const addWasteRecord = (waste: WasteRecord) => {
    setWasteRecords(prev => [...prev, waste]);
  };

  const addCustomer = (customer: Customer) => {
    setCustomers(prev => [...prev, customer]);
  };

  const addSalesOrder = (order: SalesOrder) => {
    setSalesOrders(prev => [...prev, order]);
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const updateStock = (type: 'raw' | 'finished', id: string, quantity: number) => {
    if (type === 'raw') {
      setRawMaterials(prev => prev.map(item => 
        item.id === id 
          ? { 
              ...item, 
              quantity: Math.max(0, item.quantity + quantity),
              status: getStockStatus(item.quantity + quantity, item.reorderLevel, item.expiryDate),
              lastUpdated: new Date().toISOString().split('T')[0]
            }
          : item
      ));
    } else {
      setFinishedProducts(prev => prev.map(item => 
        item.id === id 
          ? { 
              ...item, 
              quantity: Math.max(0, item.quantity + quantity),
              status: getStockStatus(item.quantity + quantity, 50, item.expiryDate),
              lastUpdated: new Date().toISOString().split('T')[0]
            }
          : item
      ));
    }
  };

  const getStockStatus = (quantity: number, reorderLevel: number, expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysToExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (quantity === 0) return 'out-of-stock';
    if (daysToExpiry <= 0) return 'expired';
    if (daysToExpiry <= 30) return 'near-expiry';
    if (quantity <= reorderLevel) return 'low-stock';
    return 'in-stock';
  };

  // Analytics functions
  const getWastageAnalytics = () => {
    const totalWasteValue = wasteRecords.reduce((sum, record) => sum + record.wasteValue, 0);
    const wasteByReason = wasteRecords.reduce((acc, record) => {
      acc[record.wasteReason] = (acc[record.wasteReason] || 0) + record.wasteValue;
      return acc;
    }, {} as Record<string, number>);
    
    return { totalWasteValue, wasteByReason };
  };

  const getProductionEfficiency = () => {
    const totalPlanned = productions.reduce((sum, prod) => sum + prod.plannedQuantity, 0);
    const totalActual = productions.reduce((sum, prod) => sum + prod.actualQuantity, 0);
    const averageYield = productions.reduce((sum, prod) => sum + prod.yieldPercentage, 0) / productions.length;
    
    return { 
      efficiency: totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0,
      averageYield: averageYield || 0
    };
  };

  const getProfitabilityAnalysis = () => {
    const totalRevenue = salesOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalCost = productions.reduce((sum, prod) => sum + prod.totalCost, 0);
    const grossProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    
    return { totalRevenue, totalCost, grossProfit, profitMargin };
  };

  const getInventoryTurnover = () => {
    const totalInventoryValue = [
      ...rawMaterials.map(item => item.quantity * item.costPerUnit),
      ...finishedProducts.map(item => item.quantity * item.costPrice)
    ].reduce((sum, value) => sum + value, 0);
    
    const costOfGoodsSold = productions.reduce((sum, prod) => sum + prod.totalCost, 0);
    const turnoverRatio = totalInventoryValue > 0 ? costOfGoodsSold / totalInventoryValue : 0;
    
    return { totalInventoryValue, costOfGoodsSold, turnoverRatio };
  };

  return (
    <ERPContext.Provider value={{
      rawMaterials,
      finishedProducts,
      purchaseOrders,
      transactions,
      suppliers,
      productions,
      qualityControls,
      wasteRecords,
      customers,
      salesOrders,
      alerts,
      addRawMaterial,
      addFinishedProduct,
      addPurchaseOrder,
      addTransaction,
      addSupplier,
      addProduction,
      addQualityControl,
      addWasteRecord,
      addCustomer,
      addSalesOrder,
      acknowledgeAlert,
      generateAlerts,
      updateStock,
      getWastageAnalytics,
      getProductionEfficiency,
      getProfitabilityAnalysis,
      getInventoryTurnover
    }}>
      {children}
    </ERPContext.Provider>
  );
};