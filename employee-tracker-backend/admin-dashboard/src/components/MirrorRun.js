import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MirrorRun.css';

const API_URL = 'https://mitys1989h.execute-api.us-east-1.amazonaws.com/default/MirrorRun'; // Replace with your API Gateway endpoint

const MirrorRuns = () => {
  const [mirrorRuns, setMirrorRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMirrorRuns();
  }, []);

  const fetchMirrorRuns = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(API_URL, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setMirrorRuns(response.data.suggested_runs || []);
    } catch (err) {
      setError('Error fetching mirror runs: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mirror-runs-container">
      <h2>Suggested Mirror Runs</h2>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : mirrorRuns.length === 0 ? (
        <div>No mirror runs available.</div>
      ) : (
        <table className="mirror-runs-table">
          <thead>
            <tr>
              <th>Run Date</th>
              <th>Orders</th>
              <th>Total Mirrors</th>
            </tr>
          </thead>
          <tbody>
            {mirrorRuns.map((run, index) => (
              <tr key={index}>
                <td>{run.run_date}</td>
                <td>
                  <ul>
                    {run.orders.map((order) => (
                      <li key={order.OrderID}>
                        Lot: {order.Lot}, Order ID: {order.OrderID}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>{run.total_mirrors}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MirrorRuns;