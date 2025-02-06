import React, { useState } from 'react';
import AddItemForm from './AddItemForm'; // Import the AddItemForm component
import './ItemList.css'; // Import the CSS for styling

const ItemList = () => {
  const [items, setItems] = useState([
    { id: 1, category: 'Glass', partNumber: '123', description: 'SolarCool Bronze Glass' },
    { id: 2, category: 'Mirror', partNumber: '456', description: 'Mirror - Silver' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddItemForm, setShowAddItemForm] = useState(false);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowAddItemForm(true);
  };

  const handleAddNewItem = () => {
    setSelectedItem(null);
    setShowAddItemForm(true);
  };

  const handleDelete = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSaveItem = (itemData) => {
    if (selectedItem) {
      // Update existing item
      setItems(items.map(item => (item.id === selectedItem.id ? { ...item, ...itemData } : item)));
    } else {
      // Add new item
      setItems([...items, { id: items.length + 1, ...itemData }]);
    }
    setShowAddItemForm(false);
  };

  const handleCloseModal = () => {
    setShowAddItemForm(false);
  };

  const filteredItems = items.filter(item =>
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="item-list-container">
      {/* Search Section */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search by Category or Description"
          value={searchQuery}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      {/* Item List */}
      <div className="item-list">
        <table className="item-table">
          <thead>
            <tr>
              <th>Select</th>
              <th>Category</th>
              <th>Part # / Size</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <tr key={item.id}>
                  <td><input type="checkbox" /></td>
                  <td>{item.category}</td>
                  <td>{item.partNumber}</td>
                  <td>{item.description}</td>
                  <td>
                    <button className="action-button" onClick={() => handleEdit(item)}>Edit</button>
                    <button className="action-button" onClick={() => handleDelete(item.id)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-items">No items found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add New Item Button */}
      <button className="add-item-button" onClick={handleAddNewItem}>+ Add New Item</button>

      {/* Add/Edit Item Form Modal */}
      {showAddItemForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* Close Button */}
            <button className="modal-close-btn" onClick={handleCloseModal}>X</button>
            <AddItemForm item={selectedItem} onSave={handleSaveItem} onClose={handleCloseModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemList;