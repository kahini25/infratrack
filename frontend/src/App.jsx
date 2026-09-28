import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AssetList from './pages/AssetList';
import AssetNew from './pages/AssetNew';
import AssetDetail from './pages/AssetDetail';
import MaintenanceList from './pages/MaintenanceList';
import Login from './pages/Login';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Layout component to hide Navbar on login page
const AppLayout = () => {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {!isLogin && <Navbar />}
      <main className={`flex-1 ${!isLogin ? 'max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6' : ''}`}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/assets" element={<ProtectedRoute><AssetList /></ProtectedRoute>} />
          <Route path="/assets/new" element={<ProtectedRoute><AssetNew /></ProtectedRoute>} />
          <Route path="/assets/:id" element={<ProtectedRoute><AssetDetail /></ProtectedRoute>} />
          <Route path="/maintenance" element={<ProtectedRoute><MaintenanceList /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}
