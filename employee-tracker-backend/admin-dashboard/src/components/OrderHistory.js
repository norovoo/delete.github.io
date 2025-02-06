import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CiSearch } from "react-icons/ci";
import { FaEye, FaClipboardList, FaEdit } from "react-icons/fa"; // Import icons
import "./Orders.css";


// API Endpoints
const API_URL = "https://mrcl2iho7f.execute-api.us-east-1.amazonaws.com/default/getCompletedOrderList";
const ACTIVITY_API_URL = "https://ixb0g8dhp5.execute-api.us-east-1.amazonaws.com/default/retrieveActivities";

const OrderHistory = () => {
    const [searchParams, setSearchParams] = useState({
      lot: "",
      startDate: "",
      endDate: "",
    });
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [nextToken, setNextToken] = useState(null);
    const [viewedMeasurementId, setViewedMeasurementId] = useState(null);
    const [viewedActivityId, setViewedActivityId] = useState(null);
    const [activityData, setActivityData] = useState({});
  
    const navigate = useNavigate();
  
    useEffect(() => {
      fetchOrders();
    }, []);
  
    const fetchOrders = async (isNextPage = false) => {
      setLoading(true);
      setError("");
  
      try {
        const encodedNextToken = nextToken ? encodeURIComponent(nextToken) : null;
        const url = isNextPage && encodedNextToken
          ? `${API_URL}?nextToken=${encodedNextToken}`
          : API_URL;
  
        const response = await axios.get(url);
        const data = response.data;
  
        console.log("✅ Full API Response:", data);
  
        if (data.completedOrders) {
          const newOrders = isNextPage
            ? [...orders, ...data.completedOrders]
            : data.completedOrders;
  
          setOrders(newOrders);
          setFilteredOrders(newOrders); // Initialize `filteredOrders` to match `orders`
        } else {
          console.warn("⚠️ Unexpected API response format:", data);
        }
  
        setNextToken(data.nextToken || null);
      } catch (err) {
        setError("Error fetching completed orders: " + (err.response?.data?.error || err.message));
        console.error("❌ Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchActivityData = async (orderId) => {
        try {
          const response = await axios.get(`${ACTIVITY_API_URL}?OrderID=${orderId}`);
          const data = response.data;
          console.log("✅ Activity Response:", data);
          setActivityData((prev) => ({
            ...prev,
            [orderId]: data.activities || [],
          }));
        } catch (err) {
          console.error("❌ Error fetching activity:", err);
          setActivityData((prev) => ({
            ...prev,
            [orderId]: [],
          }));
        }
      };

      const renderViewActivity = (orderId) => {
        const activities = activityData[orderId] || [];
      
        return (
          <div className="activity-popup">
            <h3>Activity History</h3>
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <p>
                    <strong>Timestamp:</strong> {new Date(activity.Timestamp).toLocaleString()}
                  </p>
                  <p>
                    <strong>User:</strong> {activity.User}
                  </p>
                  <p>
                    <strong>Activity Type:</strong> {activity.ActivityType}
                  </p>
                  <p>
                    <strong>Old Value:</strong> {activity.OldValue}
                  </p>
                  <p>
                    <strong>New Value:</strong> {activity.NewValue}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ textAlign: "center", color: "#333" }}>No activity history available.</p>
            )}
          </div>
        );
      };
    
    const handleSearch = () => {
      const { lot, startDate, endDate } = searchParams;
  
      const filtered = orders.filter((order) => {
        const matchesLot = lot
          ? order.Lot?.toLowerCase()?.includes(lot.toLowerCase())
          : true;
        const matchesStartDate = startDate
          ? new Date(order.StartDate) >= new Date(startDate)
          : true;
        const matchesEndDate = endDate
          ? new Date(order.EndDate) <= new Date(endDate)
          : true;
  
        return matchesLot && matchesStartDate && matchesEndDate;
      });
  
      setFilteredOrders(filtered);
      setCurrentPage(1);
    };
  
    const handleNextPage = async () => {
      if (!nextToken) return;
      await fetchOrders(true);
    };
  
    const totalPages = Math.ceil(
      (filteredOrders.length > 0 ? filteredOrders.length : orders.length) / ordersPerPage
    );
  
    const displayedOrders = (filteredOrders.length > 0 ? filteredOrders : orders).slice(
      (currentPage - 1) * ordersPerPage,
      currentPage * ordersPerPage
    );
  
    return (
      <div className="orders-container">
        <h2>Completed Orders</h2>
  
        <div className="search-bar">
          <label>
            Lot #
            <input
              type="text"
              name="lot"
              value={searchParams.lot}
              onChange={(e) => setSearchParams({ ...searchParams, lot: e.target.value })}
              placeholder="Enter Lot #"
            />
          </label>
          <label>
            Start Date
            <input
              type="date"
              name="startDate"
              value={searchParams.startDate}
              onChange={(e) => setSearchParams({ ...searchParams, startDate: e.target.value })}
            />
          </label>
          <label>
            End Date
            <input
              type="date"
              name="endDate"
              value={searchParams.endDate}
              onChange={(e) => setSearchParams({ ...searchParams, endDate: e.target.value })}
            />
          </label>
          
          <CiSearch onClick={handleSearch} className="search-button"/>
          
        </div>
        {loading && <p className="loading-message">⏳ Loading orders...</p>}
  
        {/* Orders Table */}
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Lot</th>
              <th>Address</th>
              <th>Plan</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Measured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedOrders.map((order) => (
              <tr key={order.OrderID}>
                <td>{order.OrderID}</td>
                <td>{order.Lot}</td>
                <td>{order.Address}</td>
                <td>{order.Plan}</td>
                <td>{order.StartDate}</td>
                <td>{order.EndDate}</td>
                <td>{order.Measurement ? "Measured" : "Not Measured"}</td>
                <td className="icon-actions">
                  <FaEye
                    className="icon"
                    title={order.Measurement ? "View Measurement" : "No Measurement Available"}
                    onClick={() =>
                      order.Measurement &&
                      setViewedMeasurementId(viewedMeasurementId === order.OrderID ? null : order.OrderID)
                    }
                    style={{ color: order.Measurement ? "blue" : "gray" }}
                  />
                  {viewedMeasurementId === order.OrderID && renderViewMeasurement(order)}
  
                  <FaClipboardList
                    className="icon"
                    title="View Activity"
                    onClick={() => {
                        if (viewedActivityId === order.OrderID) {
                        setViewedActivityId(null);
                        } else {
                        fetchActivityData(order.OrderID);
                        setViewedActivityId(order.OrderID);
                        }
                    }}
                    style={{ color: "green" }}
                    />
                    {viewedActivityId === order.OrderID && renderViewActivity(order.OrderID)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
  
        {/* Pagination */}
        <div className="pagination">
          <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
            Previous
          </button>
          <button onClick={handleNextPage} disabled={!nextToken}>
            Next
          </button>
        </div>
      </div>
    );
  };
  
  export default OrderHistory;