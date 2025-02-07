import React, { useState, useEffect } from 'react';
import './App.css'; 
import Dashboard from './components/Dashboard';
import Orders from './components/Orders';
import Schedule from './components/Schedule';
import Measurements from './components/Measurements';
import Login from './components/Login';
import ScheduleList from './components/ScheduleList';
import Invoice from './components/Invoices'; 
import EpoTracker from './components/EpoTracker'; // New Menu
import WarrantyTracking from './components/WarrantyTracker'; // New Menu
import KanbanBoard from './components/KanbanBoard'
import Register from './components/Register';
import SupplierOrderForm from './components/SupplierOrderForm';
import Profile from './components/Profile';
import ForgotPassword from './components/ForgotPassword';
import LocationMap from './components/LocationMap';
import ItemList from './components/ItemList';
import OrderCalendar from './components/OrderCalendar';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import CreateInvoice from './components/CreateInvoice';
import Estimates from './components/Estimates';
import EstimatesList from './components/EstimatesList';
import ParentComponent from './components/ParentComponent';
import OrderForm from './components/OrderForm';
import WarrantyList from './components/WarrantyList';
import MirrorRuns from './components/MirrorRun';
import OrderHistory from './components/OrderHistory';


const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [token, setToken] = useState(null);  
  const [username, setUsername] = useState('');  

  useEffect(() => {
    const mockToken = 'mocked_token';
    const mockUsername = 'Test User';

    setIsAuthenticated(true);
    setToken(mockToken);
    setUsername(mockUsername);

    localStorage.setItem('authToken', mockToken);
    localStorage.setItem('username', mockUsername);
  }, []); 

  const handleLoginSuccess = (token, username) => {
    setIsAuthenticated(true);
    setToken(token);
    setUsername(username);
    localStorage.setItem('authToken', token);
    localStorage.setItem('username', username);
  };

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
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          }
        />
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
        <Route
          path="/dashboard"
          element={
            isAuthenticated && token ? (
              <Dashboard token={token} username={username} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        
        <Route
          path="/dashboard/orders"
          element={
            isAuthenticated && token ? (
              <Orders token={token} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard/order-history"
          element={
            isAuthenticated && token ? (
              <OrderHistory token={token} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
         <Route
          path="/dashboard/mirror-run"
          element={
            isAuthenticated && token ? (
              <MirrorRuns token={token} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard/schedule"
          element={
            isAuthenticated && token ? (
              <ScheduleList />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard/location-map"
          element={
            isAuthenticated && token ? (
              <LocationMap />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard/measurements"
          element={
            isAuthenticated && token ? (
              <Measurements token={token} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard/invoices"
          element={
            isAuthenticated && token ? (
              <Invoice token={token} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        {/* <Route
          path="/dashboard/kanban-board"
          element={
            isAuthenticated && token ? (
              <KanbanBoard token={token} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        /> */}
        <Route
          path="/dashboard/kanban-board"
          element={
            isAuthenticated && token ? (
              <ParentComponent token={token} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        {/* New Menus */}
        <Route
          path="/dashboard/epo-tracker"
          element={
            isAuthenticated && token ? (
              <EpoTracker token={token} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard/warranty-tracking"
          element={
            isAuthenticated && token ? (
              <WarrantyTracking token={token} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard/warranty-list"
          element={
            isAuthenticated && token ? (
              <WarrantyList token={token} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard/profile"
          element={
            isAuthenticated && token ? (
              <Profile token={token} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard/item-list"
          element={
            isAuthenticated && token ? (
              <ItemList token={token} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard/order-calendar"
          element={
            isAuthenticated && token ? (
              <OrderCalendar token={token} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/dashboard/create-invoice"
          element={
            isAuthenticated && token ? (
              <CreateInvoice token={token} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard/supplier-order-form"
          element={
            isAuthenticated && token ? (
              <SupplierOrderForm token={token} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
         <Route
          path="/dashboard/create-estimate"
          element={
            isAuthenticated && token ? (
              <Estimates token={token} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard/order-form"
          element={
            isAuthenticated && token ? (
              <OrderForm token={token} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard/estimates-list"
          element={
            isAuthenticated && token ? (
              <EstimatesList token={token} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;