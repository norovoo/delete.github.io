import React, { useState, useEffect } from 'react';
import './AddItemForm.css';

const AddItemForm = ({ item, onSave, onClose }) => {
  // State for form data
  const [supplier, setSupplier] = useState(item?.supplier || '');
  const [size, setSize] = useState(item?.size || '');
  const [type, setType] = useState(item?.type || '');
  const [unit, setUnit] = useState(item?.unit || 'Each');
  const [quantity, setQuantity] = useState(item?.quantity || 1);
  const [description, setDescription] = useState(item?.description || '');
  const [unitCost, setUnitCost] = useState(item?.unitCost || 0);
  const [priceLevel, setPriceLevel] = useState(item?.priceLevel || '');
  const [markup, setMarkup] = useState(item?.markup || 0);
  const [unitSell, setUnitSell] = useState(item?.unitSell || 0);
  const [discount, setDiscount] = useState(item?.discount || 0);
  const [totalCost, setTotalCost] = useState(item?.totalCost || 0);
  const [totalSell, setTotalSell] = useState(item?.totalSell || 0);
  const [taxable, setTaxable] = useState(item?.taxable || true);
  const [taxCode, setTaxCode] = useState(item?.taxCode || 'State Tax - State Tax (7.00%)');
  const [stateTax, setStateTax] = useState(item?.stateTax || 7);

  useEffect(() => {
    if (item) {
      // Pre-fill the form for the item to edit
      setSupplier(item.supplier);
      setSize(item.size);
      setType(item.type);
      setUnit(item.unit);
      setQuantity(item.quantity);
      setDescription(item.description);
      setUnitCost(item.unitCost);
      setPriceLevel(item.priceLevel);
      setMarkup(item.markup);
      setUnitSell(item.unitSell);
      setDiscount(item.discount);
      setTotalCost(item.totalCost);
      setTotalSell(item.totalSell);
      setTaxable(item.taxable);
      setTaxCode(item.taxCode);
      setStateTax(item.stateTax);
    }
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const itemData = {
      supplier,
      size,
      type,
      unit,
      quantity,
      description,
      unitCost,
      priceLevel,
      markup,
      unitSell,
      discount,
      totalCost,
      totalSell,
      taxable,
      taxCode,
      stateTax,
    };

    // Call the onSave callback to save the item data
    onSave(itemData);

    // Clear form or close modal
    onClose();
  };

  return (
    <div className="add-item-form">
      <h2>{item ? 'Edit Item' : 'Add New Item'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Supplier</label>
          <select value={supplier} onChange={(e) => setSupplier(e.target.value)}>
            <option>Select Supplier...</option>
            {/* Add supplier options here */}
          </select>
        </div>

        <div className="form-group">
          <label>Size / Part #</label>
          <input
            type="text"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="Size / Part #"
          />
        </div>

        <div className="form-group">
          <label>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option>Item Type...</option>
            {/* Add type options here */}
          </select>
        </div>

        <div className="form-group">
          <label>Unit</label>
          <select value={unit} onChange={(e) => setUnit(e.target.value)}>
            <option>Each</option>
            {/* Add unit options here */}
          </select>
        </div>

        <div className="form-group">
          <label>Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
          ></textarea>
        </div>

        {/* Right-side fields */}
        <div className="form-group">
          <label>Unit Cost</label>
          <input
            type="number"
            value={unitCost}
            onChange={(e) => setUnitCost(e.target.value)}
            placeholder="$0.00"
          />
        </div>

        <div className="form-group">
          <label>Price Level</label>
          <select value={priceLevel} onChange={(e) => setPriceLevel(e.target.value)}>
            <option>Select Price Level</option>
            {/* Add options here */}
          </select>
        </div>

        <div className="form-group">
          <label>Markup</label>
          <input
            type="number"
            value={markup}
            onChange={(e) => setMarkup(e.target.value)}
            placeholder="%"
          />
        </div>

        <div className="form-group">
          <label>Unit Sell</label>
          <input
            type="number"
            value={unitSell}
            onChange={(e) => setUnitSell(e.target.value)}
            placeholder="$0.00"
          />
        </div>

        <div className="form-group">
          <label>Discount</label>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            placeholder="0 %"
          />
        </div>

        <div className="form-group">
          <label>Total Cost</label>
          <input
            type="number"
            value={totalCost}
            onChange={(e) => setTotalCost(e.target.value)}
            placeholder="$0.00"
          />
        </div>

        <div className="form-group">
          <label>Total Sell</label>
          <input
            type="number"
            value={totalSell}
            onChange={(e) => setTotalSell(e.target.value)}
            placeholder="$0.00"
          />
        </div>

        <div className="form-group">
          <label>Taxable</label>
          <input
            type="checkbox"
            checked={taxable}
            onChange={(e) => setTaxable(e.target.checked)}
          />
        </div>

        <div className="form-group">
          <label>Tax Code</label>
          <select value={taxCode} onChange={(e) => setTaxCode(e.target.value)}>
            <option>State Tax - State Tax (7.00%)</option>
            {/* Add more tax codes here */}
          </select>
        </div>

        <div className="form-group">
          <label>State Tax</label>
          <input
            type="number"
            value={stateTax}
            onChange={(e) => setStateTax(e.target.value)}
            placeholder="7.00 %"
          />
        </div>

        <div className="form-actions">
          <button type="submit">{item ? 'Save Changes' : 'Add Item'}</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddItemForm;