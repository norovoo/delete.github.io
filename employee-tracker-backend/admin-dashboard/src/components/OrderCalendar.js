import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import axios from "axios";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./OrderCalendar.css";
import OrderDetailsModal from "./OrderDetailsModal";

const localizer = momentLocalizer(moment);

const OrderCalendar = () => {
  const [events, setEvents] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const LAMBDA_URL = "https://df3wuq6q7j.execute-api.us-east-1.amazonaws.com/default/getNewOrdersAll";

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(LAMBDA_URL);
      const data = response.data.orders || [];

      const formattedOrders = data.map((order) => ({
        ...order,
        endDate: new Date(order.EndDate),
      }));

      setOrders(formattedOrders);

      const calendarEvents = formattedOrders.map((order) => {
        const showerItem = order.OrderItems.find((item) => item.type === "shower");
        const showerDescription = showerItem?.description || "Mirror Only";

        return {
          title: `${order.Lot} - ${order.Neighborhood}`,
          description: `Shower: ${showerDescription}`,
          start: new Date(order.EndDate),
          end: new Date(order.EndDate),
          orderData: order,
        };
      });

      setEvents(calendarEvents);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const CustomEvent = ({ event }) => {
    const { orderData } = event;
    const lot = orderData?.Lot || "N/A";
    const neighborhood = orderData?.Neighborhood || "N/A";
    const endDate = new Date(orderData?.EndDate).toLocaleDateString() || "N/A";
    const showerType =
      orderData?.OrderItems?.find((item) => item.type === "shower")?.description || "Mirror Only";

    return (
      <div className="custom-event">
        <strong>{lot} - {neighborhood}</strong>
        <div style={{ fontSize: "0.85em" }}>
          <p>End Date: {endDate}</p>
          <p>Shower Type: {showerType}</p>
        </div>
      </div>
    );
  };

  const generateSummary = () => {
    const summary = orders.reduce((acc, order) => {
      const date = new Date(order.EndDate).toLocaleDateString();
      const showerItem = order.OrderItems.find((item) => item.type === "shower");
      const showerDescription = showerItem?.description || "Mirror Only";

      if (!acc[date]) acc[date] = [];
      acc[date].push(
        `Lot: ${order.Lot}, Neighborhood: ${order.Neighborhood}, Shower: ${showerDescription}`
      );
      return acc;
    }, {});

    return (
      <div className="printable-summary">
        {Object.entries(summary).map(([date, details]) => (
          <div key={date} className="summary-day">
            <h3>{date}</h3>
            <ul>
              {details.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  const handlePrint = () => {
    // Filter and sort events by date in ascending order
    const sortedEvents = [...events].sort((a, b) => new Date(a.start) - new Date(b.start));
  
    // Group events by date
    const groupedByDate = sortedEvents.reduce((acc, event) => {
      const date = new Date(event.start).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!acc[date]) acc[date] = [];
      acc[date].push(event);
      return acc;
    }, {});
  
    // Create HTML for the print layout
    const printContent = Object.entries(groupedByDate)
      .map(([date, events]) => {
        const dayContent = events
          .map((event) => {
            const { orderData } = event;
            console.log(orderData);
            const generalStatus = orderData.generalOrderStatus || "N/A";
            const supplierStatus = orderData.orderStatus || "N/A";
            const measurement = orderData.Measurement ? orderData.Measurement.measurement : "Not Measured";
            const notes = orderData.installationNotes && orderData.Notes.length > 0
              ? orderData.installationNotes.map((note) => `<li>${note.text} (Date: ${new Date(note.createdDate).toLocaleDateString()})</li>`).join("")
              : "<li>No Notes Available</li>";
  
            return `
              <div class="order-box">
                <strong>${event.title}</strong>
                <p><strong>End Date:</strong> ${new Date(event.start).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</p>
                <p><strong>General Order Status:</strong> ${generalStatus}</p>
                <p><strong>Supplier Order Status:</strong> ${supplierStatus}</p>
                <p><strong>Measurement:</strong> ${measurement}</p>
                <p><strong>Notes:</strong></p>
                <ul>${notes}</ul>
              </div>
            `;
          })
          .join("");
  
        return `
          <div class="day-section">
            <h3>${date}</h3>
            <div class="order-row">
              ${dayContent}
            </div>
          </div>
        `;
      })
      .join("");
  
    const printWindow = window.open("", "_blank", "width=800,height=600");
    printWindow.document.open();
    printWindow.document.write(`
      <html>
      <head>
        <title>Printable Order Summary</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: black; /* Ensure all text is black */
          }
          .day-section {
            margin-bottom: 20px;
          }
          .day-section h3 {
            margin-bottom: 10px;
            color: black; /* Ensure the date headers are black */
          }
          .order-row {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }
          .order-box {
            border: 1px solid #000; /* Black border */
            border-radius: 5px;
            padding: 10px;
            background-color: #fff; /* White background */
            color: black; /* Black text */
            min-width: 250px;
            max-width: 350px;
            text-align: left;
          }
          .order-box strong {
            font-size: 1.1em;
            color: black; /* Black title text */
          }
          .order-box p {
            margin: 5px 0;
            font-size: 0.9em;
            color: black; /* Black description text */
          }
          .order-box ul {
            padding-left: 15px;
            font-size: 0.9em;
            color: black;
          }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleSearch = () => {
    const filteredOrders = orders.filter((order) =>
      order.Lot.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.Address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.Neighborhood.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setEvents(
      filteredOrders.map((order) => {
        const showerItem = order.OrderItems.find((item) => item.type === "shower");
        const showerDescription = showerItem?.description || "Mirror Only";

        return {
          title: `${order.Lot} - ${order.Neighborhood}`,
          description: `Shower: ${showerDescription}`,
          start: new Date(order.EndDate),
          end: new Date(order.EndDate),
          orderData: order,
        };
      })
    );
  };

  const handleEventClick = (event) => {
    setSelectedOrder(event.orderData);
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="order-calendar-container">
      <header className="order-calendar-header">
        <h2>📅 Order Calendar</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search by Lot, Address, or Neighborhood..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        <button className="print-button" onClick={handlePrint}>
          🖨️ Print Summary
        </button>
      </header>

      {loading && <p className="loading-message">⏳ Loading orders...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 1800 }}
            onSelectEvent={handleEventClick}
            components={{
              event: CustomEvent,
            }}
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: "#007bff", // Blue background
                color: "#fff", // White text
                borderRadius: "5px",
                padding: "5px",
                border: "1px solid #0056b3", // Add a border for clarity
                transition: "background-color 0.3s, color 0.3s", // Smooth transitions
              },
              className: "custom-event-box", // Add a custom class
            })}
          />

          <div className="order-summary">
            <h3>Printable Order Summary</h3>
            {generateSummary()}
          </div>

          {selectedOrder && <OrderDetailsModal order={selectedOrder} onClose={closeModal} />}
        </>
      )}
    </div>
  );
};

export default OrderCalendar;