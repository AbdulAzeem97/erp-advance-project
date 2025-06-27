export interface RawMaterial {
  id: string;
  name: string;
  supplier: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  reorderLevel: number;
  maxStockLevel: number;
  expiryDate: string;
  batchNumber: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired' | 'near-expiry';
  location: string;
  lastUpdated: string;
  wastage: number;
  qualityGrade: 'A' | 'B' | 'C';
}

export interface FinishedProduct {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  category: string;
  expiryDate: string;
  batchNumber: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired' | 'near-expiry';
  location: string;
  lastUpdated: string;
  productionCost: number;
  profitMargin: number;
  demandForecast: number;
  actualSales: number;
  overproduction: number;
}

export interface PurchaseOrder {
  id: string;
  supplier: string;
  orderDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'partial';
  items: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    receivedQuantity?: number;
    unitPrice: number;
    total: number;
    qualityCheck?: 'passed' | 'failed' | 'pending';
  }>;
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  finalAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  deliveryCharges: number;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  reference?: string;
  paymentMethod: 'cash' | 'bank' | 'cheque' | 'online';
  taxAmount?: number;
  approved: boolean;
  approvedBy?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  address: string;
  city: string;
  paymentTerms: string;
  rating: number;
  totalOrders: number;
  onTimeDeliveries: number;
  qualityScore: number;
  creditLimit: number;
  outstandingAmount: number;
  ntn?: string;
  strn?: string;
}

export interface Production {
  id: string;
  productId: string;
  productName: string;
  batchNumber: string;
  plannedQuantity: number;
  actualQuantity: number;
  startDate: string;
  endDate: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  rawMaterialsUsed: Array<{
    materialId: string;
    materialName: string;
    plannedQuantity: number;
    actualQuantity: number;
    wastage: number;
  }>;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  yieldPercentage: number;
  qualityGrade: 'A' | 'B' | 'C';
  supervisor: string;
}

export interface QualityControl {
  id: string;
  batchNumber: string;
  productType: 'raw-material' | 'finished-product';
  itemId: string;
  itemName: string;
  testDate: string;
  testResults: Array<{
    parameter: string;
    expectedValue: string;
    actualValue: string;
    status: 'pass' | 'fail';
  }>;
  overallStatus: 'approved' | 'rejected' | 'conditional';
  inspector: string;
  remarks?: string;
}

export interface WasteRecord {
  id: string;
  itemId: string;
  itemName: string;
  itemType: 'raw-material' | 'finished-product';
  wasteQuantity: number;
  wasteReason: 'expired' | 'damaged' | 'contaminated' | 'production-loss' | 'spillage' | 'other';
  wasteValue: number;
  date: string;
  reportedBy: string;
  approved: boolean;
  disposalMethod: string;
}

export interface Customer {
  id: string;
  name: string;
  contact: string;
  email: string;
  address: string;
  city: string;
  customerType: 'retailer' | 'distributor' | 'pharmacy' | 'hospital';
  creditLimit: number;
  outstandingAmount: number;
  totalPurchases: number;
  lastOrderDate: string;
  paymentTerms: string;
  discount: number;
}

export interface SalesOrder {
  id: string;
  customerId: string;
  customerName: string;
  orderDate: string;
  deliveryDate: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
  }>;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  salesPerson: string;
}

export interface Alert {
  id: string;
  type: 'low-stock' | 'expiry' | 'overstock' | 'quality' | 'financial' | 'production';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  date: string;
  acknowledged: boolean;
  actionRequired: boolean;
  relatedId?: string;
}