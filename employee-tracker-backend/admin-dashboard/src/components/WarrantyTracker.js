import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx"; // Import XLSX for parsing Excel files
import "./WarrantyTracker.css"; // Import the updated CSS

const WarrantyTracker = () => {
  const [file, setFile] = useState(null);
  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [excelFile, setExcelFile] = useState(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleOrderIdChange = (e) => setOrderId(e.target.value);
  const handleExcelFileChange = (e) => setExcelFile(e.target.files[0]);

  const handleFileUpload = async () => {
    if (!file || !orderId) {
      setErrorMessage("Please provide both the file and the order ID.");
      return;
    }
    setStatus("");
    setErrorMessage("");
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("pdfFile", file);
      formData.append("order_id", orderId);
      const response = await axios.post(
        "http://localhost:3000/api/upload-pdf",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data && response.data.data) {
        setStatus("File parsed successfully.");
        setParsedData(response.data.data);
      } else {
        setErrorMessage("Failed to parse the file.");
      }
    } catch (error) {
      setErrorMessage("An error occurred while processing the file.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleExcelUpload = async () => {
    if (!excelFile) {
      setErrorMessage("Please select an Excel file.");
      return;
    }
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const jsonData = XLSX.utils.sheet_to_json(
          workbook.Sheets[workbook.SheetNames[0]]
        );
        const response = await axios.post(
          "http://localhost:3000/api/upload-excel",
          { records: jsonData },
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        setStatus(response.data.success ? "Excel data uploaded successfully." : "Failed to upload Excel data.");
      };
      reader.readAsBinaryString(excelFile);
    } catch (error) {
      setErrorMessage("Failed to process the Excel file.");
    }
  };

  return (
    <div className="warranty-tracker">
      <h2>Upload and Parse Warranty File</h2>
      <div className="form-group">
        <label>Order ID:</label>
        <input
          type="text"
          placeholder="Enter Order ID"
          value={orderId}
          onChange={handleOrderIdChange}
        />
      </div>
      <div className="form-group">
        <label>Upload PDF:</label>
        <input type="file" onChange={handleFileChange} />
      </div>
      <div className="button-group">
        <button onClick={handleFileUpload} disabled={isUploading}>
          {isUploading ? "Uploading..." : "Upload and Parse Warranty"}
        </button>
      </div>

      <h2>Upload Warranty Records from Excel</h2>
      <div className="form-group">
        <label>Upload Excel File:</label>
        <input type="file" accept=".xlsx, .xls" onChange={handleExcelFileChange} />
      </div>
      <div className="button-group">
        <button onClick={handleExcelUpload}>Upload Excel Records</button>
      </div>

      {status && <div className="status-message success">{status}</div>}
      {errorMessage && <div className="status-message error">{errorMessage}</div>}

      {parsedData && (
        <table className="warranty-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(parsedData).map(([key, value]) => (
              <tr key={key}>
                <td>{key}</td>
                <td>{value || "Not Available"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default WarrantyTracker;