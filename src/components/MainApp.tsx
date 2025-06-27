import React, { useState } from 'react';
import Layout from './enhanced/Layout';
import Dashboard from './enhanced/Dashboard';
import CRM from './enhanced/CRM';
import AdvancedHRM from './enhanced/AdvancedHRM';
import InvoiceGenerator from './enhanced/InvoiceGenerator';
import FactoryAnalytics from './enhanced/FactoryAnalytics';
import AdvancedReports from './advanced/AdvancedReports';
import Inventory from './Inventory';
import Purchase from './Purchase';
import Production from './Production';
import QualityControl from './QualityControl';
import Store from './Store';
import Sales from './Sales';
import Customers from './Customers';
import Finance from './Finance';
import WasteManagement from './WasteManagement';
import Supply from './Supply';
import Reports from './Reports';
import Alerts from './Alerts';
import { useERP } from '../context/ERPContext';

function MainApp() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { 
    rawMaterials, 
    finishedProducts, 
    transactions, 
    customers, 
    salesOrders, 
    productions, 
    wasteRecords 
  } = useERP();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'crm': return <CRM />;
      case 'hrm': return <AdvancedHRM />;
      case 'invoices': return <InvoiceGenerator />;
      case 'factory-analytics': return <FactoryAnalytics />;
      case 'reports': return (
        <AdvancedReports 
          data={{
            employees: [], // This would come from HRM context
            transactions,
            inventory: [...rawMaterials, ...finishedProducts],
            customers,
            sales: salesOrders,
            production: productions,
            waste: wasteRecords
          }}
        />
      );
      case 'inventory': return <Inventory />;
      case 'purchase': return <Purchase />;
      case 'production': return <Production />;
      case 'quality': return <QualityControl />;
      case 'store': return <Store />;
      case 'sales': return <Sales />;
      case 'customers': return <Customers />;
      case 'leads': return <CRM />;
      case 'income': return <Finance />;
      case 'expense': return <Finance />;
      case 'finance': return <Finance />;
      case 'waste': return <WasteManagement />;
      case 'supply': return <Supply />;
      case 'alerts': return <Alerts />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default MainApp;