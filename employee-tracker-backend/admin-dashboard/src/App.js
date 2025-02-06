import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Orders from './components/Orders';
import ScheduleList from './components/ScheduleList';
import Measurements from './components/Measurements';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import LocationMap from './components/LocationMap';
import OrderHistory from './components/OrderHistory';
import MirrorRuns from './components/MirrorRun';
import Invoice from './components/Invoices';
import PrivacyPolicy from "./pages/PrivacyPolicy";
import DataDeletion from "./pages/DataDeletion";
import KanbanBoard from './components/KanbanBoard';
import Profile from './components/Profile';
import EpoTracker from './components/EpoTracker';
import WarrantyTracking from './components/WarrantyTracker';
import ItemList from './components/ItemList';
import OrderCalendar from './components/OrderCalendar';
import CreateInvoice from './components/CreateInvoice';
import Estimates from './components/Estimates';
import EstimatesList from './components/EstimatesList';
import OrderForm from './components/OrderForm';
import WarrantyList from './components/WarrantyList';
import SupplierOrderForm from './components/SupplierOrderForm';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState('');

  // Check authentication status on page load
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUsername = localStorage.getItem('username');

    if (savedToken) {
      setIsAuthenticated(true);
      setToken(savedToken);
      setUsername(savedUsername || 'User');
    }
  }, []);

  // Handle login success
  const handleLoginSuccess = (token, username) => {
    setIsAuthenticated(true);
    setToken(token);
    setUsername(username);
    localStorage.setItem('authToken', token);
    localStorage.setItem('username', username);
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setToken(null);
    setUsername('');
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
  };

  return (
    <Router>
      <Routes>
        {/* Default route: Redirect to login if not authenticated */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          }
        />

        {/* Public Routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={handleLoginSuccess} />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
          }
        />
        <Route
          path="/forgot-password"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPassword />
          }
        />

        {/* Protected Routes (Only if logged in) */}
        {isAuthenticated && (
          <>
            <Route path="/dashboard" element={<Dashboard token={token} username={username} onLogout={handleLogout} />} />
            <Route path="/dashboard/orders" element={<Orders token={token} />} />
            <Route path="/dashboard/order-history" element={<OrderHistory token={token} />} />
            <Route path="/dashboard/mirror-run" element={<MirrorRuns token={token} />} />
            <Route path="/dashboard/schedule" element={<ScheduleList />} />
            <Route path="/dashboard/location-map" element={<LocationMap />} />
            <Route path="/dashboard/measurements" element={<Measurements token={token} />} />
            <Route path="/dashboard/invoices" element={<Invoice token={token} />} />
            <Route path="/dashboard/kanban-board" element={<KanbanBoard token={token} />} />
            <Route path="/dashboard/epo-tracker" element={<EpoTracker token={token} />} />
            <Route path="/dashboard/warranty-tracking" element={<WarrantyTracking token={token} />} />
            <Route path="/dashboard/warranty-list" element={<WarrantyList token={token} />} />
            <Route path="/dashboard/profile" element={<Profile token={token} />} />
            <Route path="/dashboard/item-list" element={<ItemList token={token} />} />
            <Route path="/dashboard/order-calendar" element={<OrderCalendar token={token} />} />
            <Route path="/dashboard/create-invoice" element={<CreateInvoice token={token} />} />
            <Route path="/dashboard/create-estimate" element={<Estimates token={token} />} />
            <Route path="/dashboard/order-form" element={<OrderForm token={token} />} />
            <Route path="/dashboard/estimates-list" element={<EstimatesList token={token} />} />
            <Route path="/dashboard/supplier-order-form" element={<SupplierOrderForm token={token} />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/data-deletion" element={<DataDeletion />} />  
          </>
        )}

        {/* If no route matches, redirect to dashboard or login */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Router>
  );
};

export default App;