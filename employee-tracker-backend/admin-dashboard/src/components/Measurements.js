import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Measurements.css';

// API Gateway Base URL
const API_BASE_URL = 'https://55lzg7aqe3.execute-api.us-east-1.amazonaws.com/Prod';

const Measurements = () => {
  const [measurements, setMeasurements] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMeasurement, setNewMeasurement] = useState({ plan: '', details: '' });
  const [editingMeasurement, setEditingMeasurement] = useState(null);

  // Fetch measurements from the API
  const fetchMeasurements = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/retrieveMeasurement`);
      setMeasurements(response.data); // Populate measurements from the backend
    } catch (error) {
      console.error('Error fetching measurements:', error);
    }
  };

  // Add a new measurement
  const handleAdd = async () => {
    try {
      const payload = {
        Plan: newMeasurement.plan, // Backend expects 'Plan'
        Details: newMeasurement.details, // Backend expects 'Details'
      };

      await axios.post(`${API_BASE_URL}/createMeasurement`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      setNewMeasurement({ plan: '', details: '' });
      fetchMeasurements(); // Refresh the list
    } catch (error) {
      console.error('Error adding measurement:', error);
    }
  };

  // Update an existing measurement
  const handleUpdate = async () => {
    try {
      const payload = {
        Plan: editingMeasurement.Plan, // Use capitalized 'Plan'
        Details: editingMeasurement.Details, // Use capitalized 'Details'
      };

      await axios.put(`${API_BASE_URL}/updateMeasurement`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      setEditingMeasurement(null);
      fetchMeasurements(); // Refresh the list
    } catch (error) {
      console.error('Error updating measurement:', error);
    }
  };

  // Delete a measurement
  const handleDelete = async (plan) => {
    try {
      await axios.delete(`${API_BASE_URL}/deleteMeasurement`, {
        data: { Plan: plan },
        headers: { 'Content-Type': 'application/json' },
      });

      fetchMeasurements(); // Refresh the list
    } catch (error) {
      console.error('Error deleting measurement:', error);
    }
  };

  useEffect(() => {
    fetchMeasurements();
  }, []);

  const handleSearch = (e) => setSearchQuery(e.target.value);

  const filteredMeasurements = measurements.filter((m) =>
    m.Plan?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="measurements-container">
      <h2>Measurements</h2>

      {/* Search bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by Plan Number"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      {/* Add measurement */}
      <div className="add-measurement">
        <div className="input-group">
          <input
            type="text"
            placeholder="Plan Number"
            value={newMeasurement.plan}
            onChange={(e) => setNewMeasurement({ ...newMeasurement, plan: e.target.value })}
          />
          <input
            type="text"
            placeholder="Measurement Details"
            value={newMeasurement.details}
            onChange={(e) => setNewMeasurement({ ...newMeasurement, details: e.target.value })}
          />
        </div>
        <button onClick={handleAdd} className="add-btn">Add Measurement</button>
      </div>

      {/* Measurement table */}
      <table className="measurements-table">
        <thead>
          <tr>
            <th>Plan</th>
            <th>Details</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredMeasurements.map((m) => (
            <tr key={m.Plan}>
              <td>{m.Plan}</td>
              <td>{m.Details}</td>
              <td>
                <button className="edit-btn" onClick={() => setEditingMeasurement(m)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(m.Plan)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit modal */}
      {editingMeasurement && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h3>Edit Measurement</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
              <div className="form-group">
                <label>Plan Number</label>
                <input
                  type="text"
                  value={editingMeasurement.Plan}
                  onChange={(e) =>
                    setEditingMeasurement({ ...editingMeasurement, Plan: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Measurement Details</label>
                <input
                  type="text"
                  value={editingMeasurement.Details}
                  onChange={(e) =>
                    setEditingMeasurement({ ...editingMeasurement, Details: e.target.value })
                  }
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="update-btn">Update</button>
                <button type="button" onClick={() => setEditingMeasurement(null)} className="cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Measurements;