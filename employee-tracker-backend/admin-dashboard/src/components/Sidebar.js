import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/Logo.png';
import './Sidebar.css';

const Sidebar = ({ onLogout }) => (
  <aside className="sidebar">
    <div className="logo-container">
      <img src={Logo} alt="Logo" className="logo" />
    </div>
    <ul className="menu">
      <li><Link to="/dashboard/orders">Orders</Link></li>
      <li><Link to="/dashboard/order-history">Order History</Link></li>
      <li><Link to="/dashboard/order-calendar">Order Calendar</Link></li>
      <li><Link to="/dashboard/supplier-order-form">Supplier Orders</Link></li>
      <li><Link to="/dashboard/mirror-run">Mirror Run</Link></li>
      <li><Link to="/dashboard/location-map">Locations</Link></li>
      <li><Link to="/dashboard/measurements">Measurements</Link></li>

      {/* Submenu for Invoices */}
      <li className="menu-item-with-submenu">
        <span>Invoices</span>
        <ul className="submenu">
          <li><Link to="/dashboard/invoices">View Invoices</Link></li>
          <li><Link to="/dashboard/create-invoice">Create Invoice</Link></li>
        </ul>
      </li>

      {/* Submenu for Estimates */}
      <li className="menu-item-with-submenu">
        <span>Estimates</span>
        <ul className="submenu">
          <li><Link to="/dashboard/create-estimate">Create Estimate</Link></li>
          <li><Link to="/dashboard/estimates-list">Estimate List</Link></li>
        </ul>
      </li>

      <li><Link to="/dashboard/kanban-board">Kanban Board</Link></li>
      <li><Link to="/dashboard/warranty-list">Warranty List</Link></li>
      <li><Link to="/dashboard/epo-tracker">EPO Tracker</Link></li>
      <li><Link to="/dashboard/supplier-order-form">Supplier Order Form</Link></li>
      <li><Link to="/dashboard/order-form">Create New Order</Link></li>

      <li><button onClick={onLogout}>Log Out</button></li>
    </ul>
  </aside>
);

export default Sidebar;