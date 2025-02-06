import React, { useState } from 'react';
import axios from 'axios';
import './CreateInvoice.css';

const CreateInvoice = () => {
  const [customerId, setCustomerId] = useState('');
  const [itemId, setItemId] = useState('');
  const [amount, setAmount] = useState('');
  const [txnDate, setTxnDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const [showCreateCustomerModal, setShowCreateCustomerModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [customerData, setCustomerData] = useState({
    givenName: '',
    familyName: '',
    email: '',
    phone: '',
  });
  const [customerStatus, setCustomerStatus] = useState('');
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [items, setItems] = useState([]);
  const [itemData, setItemData] = useState({ name: '', description: '', price: '' });
  const [itemStatus, setItemStatus] = useState('');

  // Submit Invoice
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerId || !itemId || !amount || !txnDate || !dueDate) {
      setStatus('All fields are required.');
      return;
    }

    const invoiceData = { customerId, itemId, amount: parseFloat(amount), txnDate, dueDate };
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:3002/api/quickbooks/create-invoice', // Backend API for creating an invoice
        invoiceData,
        { headers: { 'Content-Type': 'application/json' } }
      );
      console.log(response.data);
      const paymentLink = response.data.paymentLink;  // Extract payment link
      const invoiceId = response.data.invoiceId;     // Extract invoice ID
      const customerEmail = 'classicglass71@gmail.com';  // Assuming this is returned by the API

      // Now call the backend to send the email
      await axios.post(
        'http://localhost:3002/api/quickbooks/send-invoice-email', // New endpoint for sending the invoice email
        { customerEmail, paymentLink, invoiceId },
        { headers: { 'Content-Type': 'application/json' } }
      );

      setStatus(`Invoice created successfully! Payment Link: ${paymentLink}`);
    } catch (error) {
      console.error('Error creating invoice:', error.response?.data || error.message);
      setStatus('Failed to create invoice. Check logs for details.');
    } finally {
      setLoading(false);
    }
  };

  // Create Customer
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!customerData.email || !customerData.familyName || !customerData.email || !customerData.phone) {
      setCustomerStatus('All fields are required.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:3002/api/quickbooks/create-customer',
        {
          GivenName: customerData.givenName,
          FamilyName: customerData.familyName,
          PrimaryEmailAddr: { Address: customerData.email },
          PrimaryPhone: { FreeFormNumber: customerData.phone },
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setCustomerId(response.data.Id);
      setCustomerStatus(`Customer created successfully! ID: ${response.data.Id}`);
      setShowCreateCustomerModal(false);
    } catch (error) {
      console.error('Error creating customer:', error.response?.data || error.message);
      setCustomerStatus('Failed to create customer. Check logs for details.');
    } finally {
      setLoading(false);
    }
  };

  // Search Items
  const handleSearchItems = async () => {
    if (!itemSearchTerm.trim()) {
      setItemStatus('Please enter a search term.');
      return;
    }
    setLoading(true);
    setItemStatus(''); // Clear any previous status
    try {
      const response = await axios.get(
        `http://localhost:3002/api/quickbooks/search-items?query=${itemSearchTerm}`,
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (response.data.items && response.data.items.length > 0) {
        setItems(response.data.items); // Populate items from the response
        setItemStatus(`Found ${response.data.items.length} items.`);
      } else {
        setItems([]);
        setItemStatus('No items found.');
      }
    } catch (error) {
      console.error('Error searching items:', error.response?.data || error.message);
      setItems([]);
      setItemStatus('Failed to search items. Check logs for details.');
    } finally {
      setLoading(false);
    }
  };

  // Create Item
  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!itemData.name || !itemData.price) {
      setItemStatus('Name and price are required.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:3002/api/quickbooks/create-item',
        {
          Name: itemData.name,
          Description: itemData.description,
          UnitPrice: parseFloat(itemData.price),
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setItemId(response.data.Id);
      setItemStatus(`Item created successfully! ID: ${response.data.Id}`);
      setShowItemModal(false);
    } catch (error) {
      console.error('Error creating item:', error.response?.data || error.message);
      setItemStatus('Failed to create item. Check logs for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-invoice-container">
      <div className="create-invoice-header">
        <h2 className="create-invoice-title">Create QuickBooks Invoice</h2>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setShowCreateCustomerModal(true);
          }}
          className="create-customer-link"
        >
          + Create New Customer
        </a>
      </div>
      <form onSubmit={handleSubmit} className="invoice-form">
        <div>
          <label>Customer ID:</label>
          <input
            type="text"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            placeholder="Enter Customer ID"
            className="form-input"
            required
          />
        </div>
        <div>
          <label>Item ID:</label>
          <input
            type="text"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            placeholder="Enter Item ID"
            className="form-input"
            required
          />
          <button
            type="button"
            onClick={() => setShowItemModal(true)}
            className="small-button"
          >
            Search/Create
          </button>
        </div>
        <div>
          <label>Amount:</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter Invoice Amount"
            className="form-input"
            required
          />
        </div>
        <div>
          <label>Transaction Date:</label>
          <input
            type="date"
            value={txnDate}
            onChange={(e) => setTxnDate(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <div>
          <label>Due Date:</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <button type="submit" className="form-button" disabled={loading}>
          {loading ? 'Creating Invoice...' : 'Create Invoice'}
        </button>
      </form>
      {status && <p>{status}</p>}

      {/* Modals */}
      {/* Create Customer Modal */}
      {showCreateCustomerModal && (
        <>
          <div className="modal">
            <h3>Create New Customer</h3>
            <form onSubmit={handleCreateCustomer}>
              <div>
                <label>First Name:</label>
                <input
                  type="text"
                  value={customerData.givenName}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, givenName: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>Last Name:</label>
                <input
                  type="text"
                  value={customerData.familyName}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, familyName: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>Email:</label>
                <input
                  type="email"
                  value={customerData.email}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>Phone:</label>
                <input
                  type="tel"
                  value={customerData.phone}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, phone: e.target.value })
                  }
                  required
                />
              </div>
              <button type="submit">Create Customer</button>
            </form>
            {customerStatus && <p>{customerStatus}</p>}
            <button
              onClick={() => setShowCreateCustomerModal(false)}
              className="close-modal-button"
            >
              Close
            </button>
          </div>
        </>
      )}

      {/* Create Item Modal */}
      {showItemModal && (
        <>
          <div className="modal">
            <h3>Create New Item</h3>
            <form onSubmit={handleCreateItem}>
              <div>
                <label>Item Name:</label>
                <input
                  type="text"
                  value={itemData.name}
                  onChange={(e) =>
                    setItemData({ ...itemData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>Description:</label>
                <textarea
                  value={itemData.description}
                  onChange={(e) =>
                    setItemData({ ...itemData, description: e.target.value })
                  }
                ></textarea>
              </div>
              <div>
                <label>Price:</label>
                <input
                  type="number"
                  value={itemData.price}
                  onChange={(e) =>
                    setItemData({ ...itemData, price: e.target.value })
                  }
                  required
                />
              </div>
              <button type="submit">Create Item</button>
            </form>
            {itemStatus && <p>{itemStatus}</p>}
            <button
              onClick={() => setShowItemModal(false)}
              className="close-modal-button"
            >
              Close
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CreateInvoice;