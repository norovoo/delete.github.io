import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CiSearch } from "react-icons/ci";
import "./Orders.css";
import UpdateOrderModal from "./UpdateOrder";
import { FaCheckCircle, FaTimesCircle, FaEdit, FaStickyNote } from "react-icons/fa";

const API_URL = "https://xmkiupsz3a.execute-api.us-east-1.amazonaws.com/default/getNewOrderList";
const SAVE_MEASUREMENT_URL = "https://fghqoh5tw5.execute-api.us-east-1.amazonaws.com/default/saveMeasurementOrder";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchParams, setSearchParams] = useState({
    lot: "",
    startDate: "",
    endDate: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tooltipOrderId, setTooltipOrderId] = useState(null);
  const [viewedMeasurementId, setViewedMeasurementId] = useState(null);
  const [measurementType, setMeasurementType] = useState("Mirror");
  const [mirrorMeasurement, setMirrorMeasurement] = useState("");
  const [vertices, setVertices] = useState([]);
  const [noteInput, setNoteInput] = useState("");
  const [edgeMeasurements, setEdgeMeasurements] = useState([]);
  const canvasRef = useRef(null);
  const [notes, setNotes] = useState([]); 
  const [viewedNotesId, setViewedNotesId] = useState(null);
  const ctxRef = useRef(null);
  const [nextToken, setNextToken] = useState(null);
  const [editOrderId, setEditOrderId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false); // Controls the visibility of the modal
const [selectedOrder, setSelectedOrder] = useState(null); // Stores the order for which notes are being viewed

  const openNotesModal = async (order) => {
    setSelectedOrder(order); // Set the currently selected order
    await handleFetchNotes(order.OrderID); // Fetch the notes for the order
    setIsNotesModalOpen(true); // Open the modal
  };
  const closeNotesModal = () => {
    setIsNotesModalOpen(false); // Close the modal
    setSelectedOrder(null); // Reset the selected order
    setNotes([]); // Clear notes
  };

  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctxRef.current = ctx;
    }
  }, [canvasRef.current]);

  useEffect(() => {
    console.log("Current Page:", currentPage);
    console.log("Orders Per Page:", ordersPerPage);
    console.log("Filtered Orders:", filteredOrders);
    console.log("Displayed Orders:", displayedOrders);
  }, [filteredOrders, currentPage]);

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
  
      if (data.orders) {
        setOrders((prevOrders) => (isNextPage ? [...prevOrders, ...data.orders] : data.orders));
        setFilteredOrders((prevOrders) => (isNextPage ? [...prevOrders, ...data.orders] : data.orders));
      }
  
      // Update the next token for pagination
      setNextToken(data.nextToken || null);
    } catch (err) {
      setError("Error fetching orders: " + (err.response?.data?.error || err.message));
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };


  const handleNextPage = async () => {
    if (!nextToken) return; // If no nextToken, prevent the request
  
    try {
      console.log("Fetching next page with token:", nextToken); // Debugging
      const encodedNextToken = encodeURIComponent(nextToken);
      const response = await axios.get(`${API_URL}?nextToken=${encodedNextToken}`);
      const data = response.data;
  
      if (data.orders) {
        // Append new orders instead of overwriting the existing ones
        setOrders((prevOrders) => [...prevOrders, ...data.orders]);
        setFilteredOrders((prevOrders) => [...prevOrders, ...data.orders]);
      }
  
      // Update nextToken to enable further pagination
      setNextToken(data.nextToken || null);
    } catch (err) {
      console.error("Error fetching next page of orders:", err);
    }
  };

  const handleSearch = () => {
    const { lot, startDate, endDate } = searchParams;
  
    const filtered = orders.filter((order) => {
      const matchesLot = lot
        ? order.Lot?.toLowerCase()?.includes(lot.toLowerCase()) // Check if order.Lot exists
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

  const handleCanvasClick = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
  
    // Adjust for device pixel ratio
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
  
    // Get accurate coordinates
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
  
    setVertices((prev) => {
      const updatedVertices = [...prev, { x, y }];
      drawCanvas(updatedVertices, edgeMeasurements);
      return updatedVertices;
    });
  
    setEdgeMeasurements((prev) => [...prev, ""]);
  };

  const handleEdgeMeasurementChange = (index, value) => {
    const updatedMeasurements = [...edgeMeasurements];
    updatedMeasurements[index] = value;
    setEdgeMeasurements(updatedMeasurements);

    drawCanvas(vertices, updatedMeasurements); // Update the canvas with the new measurements
  };

  const drawCanvas = (vertices, measurements) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    for (let i = 0; i < vertices.length; i++) {
      const start = vertices[i];
      const end = vertices[i + 1];
      ctx.beginPath();
      ctx.arc(start.x, start.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "red";
      ctx.fill();

      if (end) {
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        ctx.font = "12px Arial";
        ctx.fillStyle = "blue";
        ctx.fillText(measurements[i] || "Enter", midX, midY - 5); // Display edge measurement
      }
    }
  };

  const saveMeasurement = async (orderId) => {
    let canvasImage = null;

    // Capture the canvas image as Base64
    if (measurementType === "Shower") {
      const canvas = canvasRef.current;
      if (canvas) {
        canvasImage = canvas.toDataURL("image/png"); // Convert canvas to Base64 string
      }
    }

    const data =
      measurementType === "Mirror"
        ? { orderId, measurementType, measurement: mirrorMeasurement }
        : { orderId, measurementType, vertices, edgeMeasurements, canvasImage };

    try {
      const response = await axios.post(SAVE_MEASUREMENT_URL, data, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 200) {
        alert("Measurement saved successfully.");
        setTooltipOrderId(null); // Close tooltip
        fetchOrders(); // Refresh orders
      } else {
        alert("Failed to save measurement.");
      }
    } catch (err) {
      console.error("Error saving measurement:", err);
      alert("Failed to save measurement.");
    }
  };

  const handleFetchNotes = async (orderID) => {
    try {
      console.log(`Fetching notes for OrderID: ${orderID}`);
      const response = await axios.get(
        `https://3ikttsurzc.execute-api.us-east-1.amazonaws.com/default/fetchOrderNotes?OrderID=${orderID}`
      );
      console.log("Response received:", response.data);
      setNotes(response.data.Notes || []); // Update state with fetched notes
    } catch (error) {
      console.error("Error fetching notes:", error.response ? error.response.data : error);
      alert("Failed to fetch notes.");
    }
  };

  const handleAddNote = async (orderID) => {
    if (!noteInput.trim()) return;
  
    try {
      console.log("Payload being sent:", {
        OrderID: orderID,
        note: { text: noteInput },
      });
      await axios.post(
        "https://hnjwrzwahb.execute-api.us-east-1.amazonaws.com/default/addNoteOrder",
        {
          OrderID: orderID,
          note: { text: noteInput },
        }
      );
  
      const newNote = {
        createdDate: new Date().toISOString(),
        text: noteInput,
      };
      setNotes((prevNotes) => [...prevNotes, newNote]); // Add the new note to the current list
      setNoteInput(""); // Clear the input field
      alert("Note added successfully!");
    } catch (error) {
      console.error("Error adding note:", error.response ? error.response.data : error);
      alert("Failed to add note.");
    }
  };

  const renderNotes = (order) => {
    if (!viewedNotesId || viewedNotesId !== order.OrderID) return null;
  
    return (
      <div className="notes-section">
        <h3>Notes History</h3>
        <ul>
          {notes.length > 0 ? (
            notes.map((note, index) => (
              <li key={index}>
                <strong>{new Date(note.createdDate).toLocaleString()}:</strong> {note.text}
              </li>
            ))
          ) : (
            <p>No notes available for this order.</p>
          )}
        </ul>
        <input
          type="text"
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)}
          placeholder="Add a note"
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={() => handleAddNote(order.OrderID)}
          style={{
            padding: "10px",
            border: "none",
            borderRadius: "5px",
            backgroundColor: "#007bff",
            color: "white",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          Add Note
        </button>
      </div>
    );
  };

  const renderViewMeasurement = (order) => {
    const { Measurement } = order;
  
    if (!Measurement) {
      return <p>No measurement data available.</p>;
    }
  
    return (
      <div className="measurement-popup">
        <p>
          <strong>Measurement Type:</strong> {Measurement.measurementType || "N/A"}
        </p>
        {Measurement.measurementType === "Shower" ? (
          <div>
            {Measurement.canvasImage ? (
              <img
                src={Measurement.canvasImage}
                alt="Measurement Diagram"
                style={{ maxWidth: "400px", maxHeight: "300px", marginTop: "10px", border: "1px solid black" }}
              />
            ) : (
              <p>No image available for this measurement.</p>
            )}
            <div>
              {Measurement.vertices?.map((vertex, index) => (
                <p key={index}>
                  <strong>Vertex {index + 1}:</strong> ({vertex.x}, {vertex.y})
                </p>
              ))}
              {Measurement.edgeMeasurements?.map((length, index) => (
                <p key={index}>
                  <strong>Edge {index + 1}:</strong> {length || "N/A"} inches
                </p>
              ))}
            </div>
          </div>
        ) : (
          <p>
            <strong>Measurement:</strong> {Measurement.measurement || "N/A"}
          </p>
        )}
      </div>
    );
  };

  const renderTooltip = (orderId) => (
    <div className="tooltip">
      <FaEdit
        className="edit-icon"
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          cursor: "pointer",
          color: "blue",
      }}
      onClick={() => setIsEditing(true)} // Enable edit mode
      title="Edit Measurement"
    />
      <label>Measurement Type:</label>
      <select value={measurementType} onChange={(e) => setMeasurementType(e.target.value)}>
        <option value="Mirror">Mirror</option>
        <option value="Shower">Shower</option>
      </select>
      {measurementType === "Mirror" ? (
        <input
          type="text"
          placeholder="Enter mirror measurement"
          value={mirrorMeasurement}
          onChange={(e) => setMirrorMeasurement(e.target.value)}
        />
      ) : (
        <div>
          <canvas
            ref={canvasRef}
            width={400}
            height={300}
            style={{ border: "1px solid black" }}
            onClick={handleCanvasClick}
          />
          <div>
            {vertices.map((_, index) => (
              index < vertices.length - 1 && (
                <div key={index}>
                  <label>Edge {index + 1} (inches):</label>
                  <input
                    type="text"
                    value={edgeMeasurements[index]}
                    onChange={(e) => handleEdgeMeasurementChange(index, e.target.value)}
                  />
                </div>
              )
            ))}
          </div>
          <button
            onClick={() => {
              ctxRef.current.clearRect(0, 0, 400, 300);
              setVertices([]);
              setEdgeMeasurements([]);
            }}
          >
            Clear
          </button>
        </div>
      )}
      <button onClick={() => saveMeasurement(orderId)}>Save</button>
      <button onClick={() => setTooltipOrderId(null)}>Cancel</button>
    </div>
  );

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  console.log(totalPages);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const displayedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  return (
    <div className="orders-container">
      <h2>Order List</h2>
      <button
        className="add-order-button"
        onClick={() => navigate("/dashboard/order-form")}
      >
        +
      </button>
      {/* Search Bar */}
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
            <th>Supplier Order Status</th>
            <th>Installation Status</th>
            <th>Order Items</th>
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
              <td>{order.supplierOrderStatus}</td>
              <td>{order.installationStatus}</td>
              <td>
                {order.OrderItems && order.OrderItems.length > 0 ? (
                  <ul>
                    {order.OrderItems.map((item, index) => (
                      <li key={index}>
                        <strong>Type:</strong> {item.type} | <strong>Description:</strong> {item.description}
                      </li>
                    ))}
                  </ul>
                ) : (
                  "No Order Items"
                )}
              </td>
              <td>
              {/* Measurement Status Icon */}
              {order.Measurement ? (
                <FaCheckCircle
                  className="measured-icon"
                  title="Measured"
                  onClick={() =>
                    setViewedMeasurementId(
                      viewedMeasurementId === order.OrderID ? null : order.OrderID
                    )
                  }
                  style={{ cursor: "pointer", color: "green", marginRight: "10px" }}
                />
              ) : (
                <FaTimesCircle
                  className="not-measured-icon"
                  title="Not Measured"
                  onClick={() => {
                    setTooltipOrderId(order.OrderID);
                    setMeasurementType("Mirror");
                    setMirrorMeasurement("");
                    setVertices([]);
                    setEdgeMeasurements([]);
                  }}
                  style={{ cursor: "pointer", color: "red", marginRight: "10px" }}
                />
              )}

              {tooltipOrderId === order.OrderID && renderTooltip(order.OrderID)}
              {viewedMeasurementId === order.OrderID && renderViewMeasurement(order)}

              {/* Update Order Icon */}
              <FaEdit
                className="update-order-icon"
                title="Update Order"
                onClick={() => setEditOrderId(order.OrderID)}
                style={{ cursor: "pointer", marginRight: "10px" }}
              />
              {editOrderId === order.OrderID && (
                <UpdateOrderModal
                  order={orders.find((o) => o.OrderID === editOrderId)}
                  onClose={() => setEditOrderId(null)}
                  onUpdate={fetchOrders} // Refresh the order list
                />
              )}

              {/* Notes Icon */}
              <FaStickyNote
                className="notes-icon"
                title={viewedNotesId === order.OrderID ? "Hide Notes" : "View Notes"}
                onClick={() => {
                  if (viewedNotesId === order.OrderID) {
                    setViewedNotesId(null); // Collapse notes section
                  } else {
                    setViewedNotesId(order.OrderID); // Expand notes section
                    handleFetchNotes(order.OrderID); // Fetch notes for this order
                  }
                }}
                style={{ cursor: "pointer", marginRight: "10px" }}
              />
              {viewedNotesId === order.OrderID && renderNotes(order)}
            </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        {/* Previous Button */}
        <button
          onClick={() => setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        {/* Page Numbers */}
        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => handlePageClick(page)}
            className={currentPage === page ? "active-page" : ""}
          >
            {page}
          </button>
        ))}

        {/* Next Button - Now Works Correctly */}
        <button onClick={handleNextPage} disabled={!nextToken}>
          Next
        </button>
      </div>
    </div>
  );
};
export default Orders;
