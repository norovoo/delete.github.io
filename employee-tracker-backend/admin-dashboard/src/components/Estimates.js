import React, { useState } from 'react';
import axios from 'axios';
import './Estimates.css';

const Estimates = () => {
  const [customerId, setCustomerId] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [estimateDate, setEstimateDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [tags, setTags] = useState('');
  const [lineItems, setLineItems] = useState([]);
  const [messageOnEstimate, setMessageOnEstimate] = useState('');
  const [messageOnStatement, setMessageOnStatement] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // Add new line item
  const handleAddLineItem = () => {
    setLineItems([...lineItems, { productId: '', description: '', quantity: 1, rate: 0, tax: false }]);
  };

  // Update line item field
  const handleLineItemChange = (index, field, value) => {
    const updatedLineItems = [...lineItems];
    updatedLineItems[index][field] = value;
    setLineItems(updatedLineItems);
  };

  // Create Estimate
  const handleCreateEstimate = async () => {
    if (!customerId || !lineItems.length) {
      setStatus('Please fill all required fields.');
      return;
    }
  
    // Ensure correct data types and structure
    const formattedLineItems = lineItems.map((item) => ({
      description: item.description,
      productId: item.productId,
      quantity: Number(item.quantity),
      rate: Number(item.rate),
      tax: item.tax,
    }));
  
    const payload = {
      customerId,
      customerEmail,
      billingAddress,
      estimateDate,
      expirationDate,
      tags: tags || undefined, // Remove empty string fields
      lineItems: formattedLineItems,
      messageOnEstimate,
      messageOnStatement,
    };
  
    console.log('Sending payload:', payload);
    console.log('Payload being sent:', JSON.stringify(payload, null, 2));
  
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3002/api/quickbooks/create-estimate', payload);
      setStatus('Estimate created successfully!');
    } catch (error) {
      console.error('Error creating estimate:', error.response?.data || error.message);
      setStatus('Failed to create estimate.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="estimate-container">
      <div className="estimate-header">Create Estimate</div>
      <form className="estimate-form">
        <div className="form-row">
          <div>
            <label>Customer:</label>
            <input
              type="text"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="Enter customer ID"
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="Enter customer email"
            />
          </div>
        </div>
        <div className="form-row">
          <div>
            <label>Billing Address:</label>
            <textarea
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              placeholder="Enter billing address"
            />
          </div>
        </div>
        <div className="form-row">
          <div>
            <label>Estimate Date:</label>
            <input
              type="date"
              value={estimateDate}
              onChange={(e) => setEstimateDate(e.target.value)}
            />
          </div>
          <div>
            <label>Expiration Date:</label>
            <input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label>Tags:</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Enter tags"
          />
        </div>
        <div className="line-items">
          <h3>Line Items</h3>
          {lineItems.map((item, index) => (
            <div className="line-item" key={index}>
              <input
                type="text"
                placeholder="Product/Service"
                value={item.productId}
                onChange={(e) => handleLineItemChange(index, 'productId', e.target.value)}
              />
              <input
                type="text"
                placeholder="Description"
                value={item.description}
                onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
              />
              <input
                type="number"
                placeholder="Quantity"
                value={item.quantity}
                onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
              />
              <input
                type="number"
                placeholder="Rate"
                value={item.rate}
                onChange={(e) => handleLineItemChange(index, 'rate', e.target.value)}
              />
              <label>
                Tax:
                <input
                  type="checkbox"
                  checked={item.tax}
                  onChange={(e) => handleLineItemChange(index, 'tax', e.target.checked)}
                />
              </label>
            </div>
          ))}
          <button type="button" className="add-line-item-btn" onClick={handleAddLineItem}>
            Add Line Item
          </button>
        </div>
        <div>
          <label>Message on Estimate:</label>
          <textarea
            value={messageOnEstimate}
            onChange={(e) => setMessageOnEstimate(e.target.value)}
            placeholder="Enter message displayed on estimate"
          />
        </div>
        <div>
          <label>Message on Statement:</label>
          <textarea
            value={messageOnStatement}
            onChange={(e) => setMessageOnStatement(e.target.value)}
            placeholder="Enter message displayed on statement"
          />
        </div>
        <button type="button" onClick={handleCreateEstimate} disabled={loading}>
          {loading ? 'Creating...' : 'Create Estimate'}
        </button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
};

export default Estimates;