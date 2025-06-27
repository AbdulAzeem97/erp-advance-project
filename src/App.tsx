import React from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ERPProvider } from './context/ERPContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainApp from './components/MainApp';

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <ERPProvider>
          <MainApp />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </ERPProvider>
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;