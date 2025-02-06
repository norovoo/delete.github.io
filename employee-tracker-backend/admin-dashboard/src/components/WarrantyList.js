import React, { useState, useEffect } from "react";
import axios from "axios";
import "./WarrantyTracker.css";

const WarrantyPage = () => {
  const [warranties, setWarranties] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [noteInput, setNoteInput] = useState("");
  const [file, setFile] = useState(null); // Track uploaded file
  const [status, setStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectionData, setSelectionData] = useState({}); // Track Mirror/Shower selections

  // Fetch warranties from the API
  const fetchWarranties = async () => {
    try {
      const response = await axios.get(
        "https://o0smmris0h.execute-api.us-east-1.amazonaws.com/default/retrieveWarranty"
      );
      const warranties = response.data || [];

      // Initialize selectionData from retrieved data
      const initialSelectionData = {};
      warranties.forEach((warranty) => {
        if (warranty.mirror_or_shower) {
          initialSelectionData[warranty.warranty_id] = warranty.mirror_or_shower;
        }
      });

      setSelectionData(initialSelectionData);
      setWarranties(warranties);
    } catch (error) {
      console.error("Error fetching warranties:", error);
      setErrorMessage("Failed to fetch warranties.");
    }
  };

  // Handle Excel file upload
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setErrorMessage("Please select a file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64File = event.target.result.split(",")[1];

      try {
        const response = await axios.post(
          "https://rx2qrnqcj5.execute-api.us-east-1.amazonaws.com/default/WarranyInsertExcel",
          { file: base64File },
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        setStatus(response.data.message || "Excel uploaded successfully!");
        fetchWarranties(); // Refresh the table after upload
      } catch (error) {
        console.error("Error uploading Excel:", error);
        setErrorMessage("Failed to upload Excel file.");
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Mirror/Shower selection
  const saveSelection = async (warrantyId) => {
    const selection = selectionData[warrantyId];
    if (!selection) {
      setErrorMessage("Please select Mirror or Shower.");
      return;
    }

    try {
      const response = await axios.post(
        "https://ds6bqgkw08.execute-api.us-east-1.amazonaws.com/default/addWarrantyNote", // Replace with the correct save endpoint
        {
          warranty_id: warrantyId,
          mirror_or_shower: selection, // Pass selection value
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setStatus(response.data.message || "Selection saved successfully.");
      fetchWarranties(); // Refresh the data
    } catch (error) {
      console.error("Error saving selection:", error);
      setErrorMessage("Failed to save selection.");
    }
  };

  // Add a new note to a warranty
  const addNote = async (warrantyId) => {
    if (!noteInput.trim()) {
      setErrorMessage("Note cannot be empty.");
      return;
    }

    try {
      const response = await axios.post(
        "https://ds6bqgkw08.execute-api.us-east-1.amazonaws.com/default/addWarrantyNote",
        {
          warranty_id: warrantyId,
          note: noteInput,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setStatus(response.data.message || "Note added successfully.");
      setNoteInput("");
      fetchWarranties(); // Refresh the table
    } catch (error) {
      console.error("Error adding note:", error);
      setErrorMessage("Failed to add note.");
    }
  };

  useEffect(() => {
    fetchWarranties();
  }, []);

  return (
    <div className="warranty-page">
      <header className="warranty-header">
        <h2>Warranty Management</h2>
        <div className="upload-buttons">
          <label className="upload-btn">
            Upload Excel
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleExcelUpload}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </header>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search warranties..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <table className="warranty-table">
        <thead>
          <tr>
            <th>Age (Days)</th>
            <th>Initiation Date</th>
            <th>Status</th>
            <th>Work Order Number</th>
            <th>Assigned To Contractor Company</th>
            <th>Customer Requested Date</th>
            <th>Assigned To</th>
            <th>Community</th>
            <th>Homesite Address</th>
            <th>Lot Number</th>
            <th>Mirror/Shower</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {warranties.map((warranty, index) => (
            <React.Fragment key={index}>
              <tr>
                <td>{warranty["Age (Days)"] || "N/A"}</td>
                <td>{warranty["Initiation Date"] || "N/A"}</td>
                <td>{warranty.Status || "N/A"}</td>
                <td>{warranty["Work Order Number"] || "N/A"}</td>
                <td>{warranty["Assigned To Contractor Company"] || "N/A"}</td>
                <td>{warranty["Customer Requested Date"] || "N/A"}</td>
                <td>{warranty["Assigned To"] || "N/A"}</td>
                <td>{warranty.Community || "N/A"}</td>
                <td>{warranty["Homesite Address"] || "N/A"}</td>
                <td>{warranty["Lot Number"] || "N/A"}</td>
                <td>
                  <select
                    value={selectionData[warranty.warranty_id] || ""}
                    onChange={(e) =>
                      setSelectionData({
                        ...selectionData,
                        [warranty.warranty_id]: e.target.value,
                      })
                    }
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="Mirror">Mirror</option>
                    <option value="Shower">Shower</option>
                  </select>
                </td>
                <td>
                  <button
                    onClick={() => saveSelection(warranty.warranty_id)}
                    className="action-btn"
                  >
                    Save
                  </button>
                  <button
                    onClick={() =>
                      setExpandedRow(
                        expandedRow === warranty.warranty_id ? null : warranty.warranty_id
                      )
                    }
                    className="action-btn"
                  >
                    Add/View Notes
                  </button>
                </td>
              </tr>
              {expandedRow === warranty.warranty_id && (
                <tr className="notes-row">
                  <td colSpan={12}>
                    <div>
                      <h4>Notes</h4>
                      <div className="notes-history">
                        {warranty.notes && warranty.notes.length > 0 ? (
                          <ul>
                            {warranty.notes.map((note, idx) => (
                              <li key={idx}>{note}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>No notes available.</p>
                        )}
                      </div>
                      <textarea
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                        placeholder="Enter your note here"
                      />
                      <button onClick={() => addNote(warranty.warranty_id)}>
                        Add Note
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {status && <div className="status-message success">{status}</div>}
      {errorMessage && <div className="status-message error">{errorMessage}</div>}
    </div>
  );
};

export default WarrantyPage;