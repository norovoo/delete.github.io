import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash, FaPlusCircle } from "react-icons/fa"; // Import icons
import "./UpdateOrder.css";

const UPDATE_ORDER_URL = "https://f8coh3qhy6.execute-api.us-east-1.amazonaws.com/default/updateOrder";

const UpdateOrderModal = ({ order, onClose, onUpdate }) => {
  // Initialize state with order details
  const [updatedOrder, setUpdatedOrder] = useState({
    ...order,
    generalOrderStatus: order.generalOrderStatus || "Created",
    supplierOrderStatus: order.supplierOrderStatus || "Pending",
    installationStatus: order.installationStatus || "Not ready to Install",
    OrderItems: order.OrderItems || [],
  });

  useEffect(() => {
    console.log("Updated Order State:", updatedOrder);
  }, [updatedOrder]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setUpdatedOrder((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle order items input change
  const handleOrderItemChange = (index, field, value) => {
    const updatedItems = [...updatedOrder.OrderItems];
    updatedItems[index][field] = value;
    setUpdatedOrder((prev) => ({
      ...prev,
      OrderItems: updatedItems,
    }));
  };

  // Add a new order item
  const addOrderItem = () => {
    const updatedItems = [...updatedOrder.OrderItems, { description: "", type: "shower" }];
    setUpdatedOrder((prev) => ({
      ...prev,
      OrderItems: updatedItems,
    }));
  };

  // Remove an order item
  const removeOrderItem = (index) => {
    const updatedItems = [...updatedOrder.OrderItems];
    updatedItems.splice(index, 1);
    setUpdatedOrder((prev) => ({
      ...prev,
      OrderItems: updatedItems,
    }));
  };

  // Handle order update submission
  const handleUpdateOrder = async () => {
    try {
      const response = await axios.post(UPDATE_ORDER_URL, {
        OrderID: order.OrderID,
        fields: updatedOrder,
      });
      if (response.status === 200) {
        alert("Order updated successfully!");
        onUpdate();
        onClose();
      }
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update the order. Please try again.");
    }
  };

  // Field labels mapping
  const fieldLabels = {
    generalOrderStatus: "General Order Status",
    supplierOrderStatus: "Supplier Order Status",
    installationStatus: "Installation Status",
    installationNotes: "Order Note",
    measurementStatus: "Measurement Status",
    StartDate: "Start Date",
    EndDate: "End Date",
    Lot: "Lot",
    Neighborhood: "Neighborhood",
    Address: "Address",
    Plan: "Plan",
    UpdatedDateTime: "Last Updated",
    OrderItems: "Order Items",
  };

  return (
    <div className="update-order-modal">
      <div className="modal-content">
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        <h2>Update Order</h2>
        <div className="fields-container">
          {Object.keys(updatedOrder)
            .filter((key) => key !== "OrderID" && key !== "CreatedDateTime") // Removed `orderStatus`
            .map((key) => (
              <div className="field" key={key}>
                <label>{fieldLabels[key] || key}</label>

                {/* General Order Status */}
                {key === "generalOrderStatus" ? (
                  <select
                    value={updatedOrder[key]}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                  >
                    <option value="Created">Created</option>
                    <option value="Measured">Measured</option>
                    <option value="Ready to Install">Ready to Install</option>
                    <option value="Installed">Installed</option>
                    <option value="Completed">Completed</option>
                  </select>
                ) : 

                /* Supplier Order Status */
                key === "supplierOrderStatus" ? (
                  <select
                    value={updatedOrder[key]}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Ordered">Ordered</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                ) : 

                /* Installation Status */
                key === "installationStatus" ? (
                  <select
                    value={updatedOrder[key]}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                  >
                    <option value="Not ready to Install">Not ready to Install</option>
                    <option value="Measured">Measured</option>
                    <option value="Ready to Install">Ready to Install</option>
                    <option value="Installed">Installed</option>
                  </select>
                ) : 

                /* Last Updated Field (Read-Only) */
                key === "UpdatedDateTime" ? (
                  <input
                    type="text"
                    value={updatedOrder[key] || ""}
                    readOnly
                    disabled
                  />
                ) : 

                /* Order Items */
                key === "OrderItems" ? (
                  <div className="order-items-container">
                    {updatedOrder.OrderItems.length > 0 ? (
                      updatedOrder.OrderItems.map((item, index) => (
                        <div key={index} className="order-item">
                          <div className="order-item-row">
                            <div className="order-item-fields">
                              <label>Description:</label>
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) =>
                                  handleOrderItemChange(index, "description", e.target.value)
                                }
                              />
                            </div>
                            <div className="order-item-fields">
                              <label>Type:</label>
                              <select
                                value={item.type}
                                onChange={(e) =>
                                  handleOrderItemChange(index, "type", e.target.value)
                                }
                              >
                                <option value="shower">Shower</option>
                                <option value="mirror">Mirror</option>
                              </select>
                            </div>
                            <FaTrash
                              className="remove-icon"
                              onClick={() => removeOrderItem(index)}
                              title="Remove Item"
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No Order Items available.</p>
                    )}
                    <FaPlusCircle
                      className="add-icon"
                      onClick={addOrderItem}
                      title="Add New Order Item"
                    />
                  </div>
                ) : (
                  /* All other fields as text inputs */
                  <input
                    type="text"
                    value={updatedOrder[key] || ""}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                  />
                )}
              </div>
            ))}
        </div>
        <div className="modal-actions">
          <button onClick={handleUpdateOrder}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default UpdateOrderModal;