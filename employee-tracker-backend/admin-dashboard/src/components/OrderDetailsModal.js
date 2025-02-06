import React from 'react';
import './OrderDetailsModal.css';

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null; // Don't render if no order is passed

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          ✖
        </button>
        <h2>Order Details</h2>

        <div className="order-section">
          <h3>Summary</h3>
          <p><strong>Lot:</strong> {order.Lot || 'N/A'}</p>
          <p><strong>Address:</strong> {order.Address || 'N/A'}</p>
          <p><strong>Neighborhood:</strong> {order.Neighborhood || 'N/A'}</p>
          <p><strong>Plan:</strong> {order.Plan || 'N/A'}</p>
          <p><strong>Start Date:</strong> {order.StartDate || 'N/A'}</p>
          <p><strong>End Date:</strong> {order.EndDate || 'N/A'}</p>
          <p><strong>Created Date:</strong> {new Date(order.CreatedDateTime).toLocaleString() || 'N/A'}</p>
        </div>

        <div className="order-section">
          <h3>Status</h3>
          <p><strong>General Order Status:</strong> {order.generalOrderStatus || 'N/A'}</p>
          <p><strong>Supplier Order Status:</strong> {order.supplierOrderStatus || 'N/A'}</p>
        </div>

        <div className="order-section">
          <h3>Installation Notes</h3>
          <ul>
            {order.installationNotes?.length > 0 ? (
              order.installationNotes.map((note, index) => (
                <li key={index}>
                  <p>{note.text}</p>
                  <p><strong>Date:</strong> {new Date(note.createdDate).toLocaleString() || 'N/A'}</p>
                </li>
              ))
            ) : (
              <p>No installation notes available.</p>
            )}
          </ul>
        </div>

        <div className="order-section">
          <h3>Order Items</h3>
          <ul>
            {order.OrderItems?.length > 0 ? (
              order.OrderItems.map((item, index) => (
                <li key={index}>
                  <p><strong>Type:</strong> {item.type || 'N/A'}</p>
                  <p><strong>Description:</strong> {item.description || 'N/A'}</p>
                </li>
              ))
            ) : (
              <p>No items available for this order.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;