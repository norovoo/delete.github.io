import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EstimatesList.css';

const EstimatesList = () => {
  const [estimates, setEstimates] = useState([]);
  const [filteredEstimates, setFilteredEstimates] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('Last 12 months');
  const [startPosition, setStartPosition] = useState(1); // Pagination starting position
  const [maxResults, setMaxResults] = useState(10); // Records per page
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch estimates from the server
  const fetchEstimates = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        `http://localhost:3002/api/quickbooks/list-estimates?startPosition=${startPosition}&maxResults=${maxResults}`,
        {
          headers: {
            Authorization: `Bearer YOUR_ACCESS_TOKEN`, // Replace with your actual token
            'Content-Type': 'application/json',
          },
        }
      );
      const { Estimate = [] } = response.data || {};
      setEstimates(Estimate);
      setFilteredEstimates(Estimate); // Set the initial filtered list
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch estimates');
    } finally {
      setLoading(false);
    }
  };

  // Filter the estimates based on status and date
  const applyFilters = () => {
    let filtered = [...estimates];

    // Filter by status
    if (statusFilter !== 'All') {
      filtered = filtered.filter((estimate) => estimate.TxnStatus === statusFilter);
    }

    // Filter by date range
    if (dateFilter === 'Last 12 months') {
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
      filtered = filtered.filter((estimate) => new Date(estimate.TxnDate) >= twelveMonthsAgo);
    } else if (dateFilter === 'Last 6 months') {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      filtered = filtered.filter((estimate) => new Date(estimate.TxnDate) >= sixMonthsAgo);
    } else if (dateFilter === 'Last 30 days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter((estimate) => new Date(estimate.TxnDate) >= thirtyDaysAgo);
    }

    setFilteredEstimates(filtered);
  };

  // Fetch estimates on component mount
  useEffect(() => {
    fetchEstimates();
  }, []);

  // Apply filters whenever the filters are updated
  useEffect(() => {
    applyFilters();
  }, [statusFilter, dateFilter]);

  // Handle Edit Link Click
  const handleEdit = (estimateId) => {
    console.log('Edit clicked for estimate ID:', estimateId);
    // Add functionality to edit the estimate
  };

  // Handle Delete Link Click
  const handleDelete = async (estimateId) => {
    if (window.confirm('Are you sure you want to delete this estimate?')) {
      try {
        await axios.delete(`http://localhost:3002/api/quickbooks/delete-estimate/${estimateId}`, {
          headers: {
            Authorization: `Bearer YOUR_ACCESS_TOKEN`,
          },
        });
        alert('Estimate deleted successfully!');
        fetchEstimates(); // Refresh the list after deletion
      } catch (err) {
        console.error('Error deleting estimate:', err.response?.data || err.message);
        alert('Failed to delete estimate.');
      }
    }
  };

  return (
    <div className="estimate-container">
      <h1>Estimates</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {/* Search Section */}
          <div className="search-section">
            <div className="filter">
              <label>Status:</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className="filter">
              <label>Date:</label>
              <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                <option value="Last 12 months">Last 12 months</option>
                <option value="Last 6 months">Last 6 months</option>
                <option value="Last 30 days">Last 30 days</option>
              </select>
            </div>
          </div>

          {/* Estimate List */}
          <table border="1" className="estimate-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>No.</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th> {/* New column for Edit/Delete links */}
              </tr>
            </thead>
            <tbody>
              {filteredEstimates.length > 0 ? (
                filteredEstimates.map((estimate) => (
                  <tr key={estimate.Id}>
                    <td>{estimate.TxnDate}</td>
                    <td>{estimate.DocNumber}</td>
                    <td>{estimate.CustomerRef?.name || 'N/A'}</td>
                    <td>${estimate.TotalAmt?.toFixed(2) || '0.00'}</td>
                    <td>{estimate.TxnStatus || 'N/A'}</td>
                    <td>
                      {/* Edit and Delete Links */}
                      <a href="#" onClick={() => handleEdit(estimate.Id)}>
                        Edit
                      </a>{' '}
                      |{' '}
                      <a href="#" onClick={() => handleDelete(estimate.Id)} style={{ color: 'red' }}>
                        Delete
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>
                    No estimates available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EstimatesList;