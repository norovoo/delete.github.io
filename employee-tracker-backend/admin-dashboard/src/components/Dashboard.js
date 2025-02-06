import React from 'react';
import Sidebar from './Sidebar';
import TopBanner from './TopBanner';
import './Dashboard.css';
import MonthlyOrdersChart from './MonthlyOrdersChart';
import UrgentOrdersChart from './UrgentOrdersChart'; // Import the urgent chart

const Dashboard = ({ username, onLogout }) => {
  return (
    <div className="dashboard-container">
      <Sidebar onLogout={onLogout} />
      <main className="main-content">
        <TopBanner username={username} />
        <section>
          <h2>Dashboard Overview</h2>

          {/* Monthly Orders Chart */}
          <div className="chart-section">
            <h3>Monthly Orders</h3>
            <MonthlyOrdersChart />
          </div>

          {/* Urgent Orders Chart */}
          <div className="chart-section">
            <h3>Urgent Orders</h3>
            <UrgentOrdersChart />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;