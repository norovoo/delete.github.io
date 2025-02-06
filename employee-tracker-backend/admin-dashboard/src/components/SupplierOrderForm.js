import React, { useState } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import "./SupplierOrderForm.css";

const SupplierOrderForm = () => {
  const [formData, setFormData] = useState({
    supplierName: "Aldora",
    address: "",
    date: "",
    poNumber: generatePONumber(),
    custOrdNo: "",
    customerNumber: "5027",
    shipVia: "Deliver",
    etch: "No",
    items: [
      {
        quantity: 1,
        dimensions: [
          {
            width: { whole: "", fraction: "" },
            height: { whole: "", fraction: "" },
          },
        ],
        process: "Tempered",
        color: "Clear",
        thickness: "1/8\"",
        description: "Test",
      },
    ],
  });

  function generatePONumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const random = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
    return `PO-${year}${month}${day}-${random}`;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleItemChange = (index, name, value) => {
    const items = [...formData.items];
  
    if (name.includes(".")) {
      // Handle dimensions (width and height)
      const [key, subKey] = name.split(".");
      items[index].dimensions[key][subKey] = value;
    } else {
      // Handle other fields like 'description'
      items[index][name] = value;
    }
  
    setFormData({ ...formData, items });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          quantity: 1,
          dimensions: [
            { width: { whole: "", fraction: "" }, height: { whole: "", fraction: "" } },
          ],
          process: "Tempered",
          color: "Clear",
          thickness: "1/8\"",
          description: "",
        },
      ],
    });
  };

  const removeItem = (index) => {
    const items = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items });
  };

  const generatePDF = () => {
    console.log("Form Data:", formData);
    const doc = new jsPDF({ orientation: "landscape" });

    // Set font to a formal type
    doc.setFont("times", "normal");

    // Title
    doc.setFontSize(22);
    doc.setTextColor(0, 51, 102); // Dark blue color for title
    doc.text("Supplier Order Form", 10, 10);

    // Supplier Details (2-column design) - More compact design
    const supplierDetails = [
      ["Supplier Name:", formData.supplierName, "Address:", formData.address || "N/A"],
      ["Date:", formData.date || "N/A", "PO Number:", formData.poNumber || "N/A"],
      ["Customer Number:", formData.customerNumber, "Ship Via:", formData.shipVia],
      ["ETCH:", formData.etch, "", ""],
    ];

    doc.autoTable({
      startY: 20,
      head: [],
      body: supplierDetails,
      theme: "striped",
      styles: { fontSize: 12, cellPadding: 4, font: "times", textColor: 0, lineColor: [0, 0, 0], lineWidth: 0.5 },
      columnStyles: {
        0: { fontStyle: "bold", halign: "left", fillColor: [224, 224, 224] },
        1: { halign: "left" },
        2: { fontStyle: "bold", halign: "left", fillColor: [224, 224, 224] },
        3: { halign: "left" },
      },
      margin: { top: 20, left: 10, right: 10, bottom: 10 },
    });

    // Items Table
    const itemsData = formData.items.map((item, index) => [
      index + 1,
      item.quantity,
      item.dimensions
        .map(
          (dim) =>
            `${dim.width.whole || "0"} ${dim.width.fraction || "0"} x ${dim.height.whole || "0"} ${dim.height.fraction || "0"}`
        )
        .join(" / "),
      item.process,
      item.color,
      item.thickness,
      item.description || "N/A",
    ]);

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [["#", "Quantity", "Dimensions", "Process", "Color", "Thickness", "Description"]],
      body: itemsData,
      styles: { cellPadding: 6, fontSize: 12, minCellHeight: 14, font: "times" },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
        lineWidth: 1,
        lineColor: [0, 0, 0],
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 10, left: 10, right: 10, bottom: 10 },
    });

    // Save the PDF
    doc.save("SupplierOrder.pdf");
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the form from refreshing the page

    // Prepare data to send in the request body
    const formDataToSubmit = {
      BuilderOrderID: formData.poNumber, // Assuming poNumber corresponds to BuilderOrderID
      Supplier: formData.supplierName,
      Item: formData.items[0].description, // Assuming the first item description corresponds to "Item"
      Quantity: formData.items[0].quantity, // Assuming the first item quantity corresponds to "Quantity"
    };

    try {
      // Call the Lambda function using the provided API endpoint
      const response = await fetch("https://0kyh66sxi7.execute-api.us-east-1.amazonaws.com/default/create_supplier_order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDataToSubmit), // Send the form data as JSON
      });

      if (!response.ok) {
        throw new Error("Failed to submit the order");
      }

      const result = await response.json();
      alert("Supplier order created successfully!");

      console.log(result); // You can log the result to inspect the response
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("There was an error creating the order.");
    }
  };

  return (
    <div className="form-container">
      <h2>Supplier Order Form</h2>
      <form>
        <div className="header-section">
          <div className="header-group">
            <label>Supplier Name:</label>
            <input type="text" value={formData.supplierName} readOnly />
          </div>
          <div className="header-group">
            <label>Address:</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} />
          </div>
          <div className="header-group">
            <label>Date:</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} />
          </div>
          <div className="header-group">
            <label>PO Number:</label>
            <input type="text" name="poNumber" value={formData.poNumber} onChange={handleChange} />
          </div>
          <div className="header-group">
            <label>Customer Number:</label>
            <input type="text" value={formData.customerNumber} readOnly />
          </div>
          <div className="header-group">
            <label>Ship Via:</label>
            <select name="shipVia" value={formData.shipVia} onChange={handleChange}>
              <option value="Deliver">Deliver</option>
              <option value="Pickup">Pickup</option>
            </select>
          </div>
          <div className="header-group">
            <label>ETCH:</label>
            <select name="etch" value={formData.etch} onChange={handleChange}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>

        <h3>Items</h3>
        <table className="items-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Quantity</th>
              <th>Dimensions</th>
              <th>Process</th>
              <th>Color</th>
              <th>Thickness</th>
              <th>Description</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            {formData.items.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  <input
                    type="number"
                    name="quantity"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 0, "quantity", e.target.value)}
                  />
                </td>
                <td>
                  {item.dimensions.map((dim, dimIndex) => (
                    <div key={dimIndex}>
                      <div className="dimension-inputs">
                        <input
                          type="text"
                          name={`width.${dimIndex}.whole`}
                          placeholder={`Width ${dimIndex + 1} (whole)`}
                          value={dim.width.whole}
                          onChange={(e) => handleItemChange(index, dimIndex, "width.whole", e.target.value)}
                        />
                        <input
                          type="text"
                          name={`width.${dimIndex}.fraction`}
                          placeholder={`Width ${dimIndex + 1} (fraction)`}
                          value={dim.width.fraction}
                          onChange={(e) => handleItemChange(index, dimIndex, "width.fraction", e.target.value)}
                        />
                      </div>
                      <div className="dimension-inputs">
                        <input
                          type="text"
                          name={`height.${dimIndex}.whole`}
                          placeholder={`Height ${dimIndex + 1} (whole)`}
                          value={dim.height.whole}
                          onChange={(e) => handleItemChange(index, dimIndex, "height.whole", e.target.value)}
                        />
                        <input
                          type="text"
                          name={`height.${dimIndex}.fraction`}
                          placeholder={`Height ${dimIndex + 1} (fraction)`}
                          value={dim.height.fraction}
                          onChange={(e) => handleItemChange(index, dimIndex, "height.fraction", e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </td>
                <td>
                  <select
                    name="process"
                    value={item.process}
                    onChange={(e) => handleItemChange(index, 0, "process", e.target.value)}
                  >
                    <option value="Tempered">Tempered</option>
                    <option value="Anneal(Non Tempered)">Anneal (Non Tempered)</option>
                  </select>
                </td>
                <td>
                  <select
                    name="color"
                    value={item.color}
                    onChange={(e) => handleItemChange(index, 0, "color", e.target.value)}
                  >
                    <option value="Clear">Clear</option>
                    <option value="Bronze">Bronze</option>
                    <option value="Gray">Gray</option>
                    <option value="Obsure(P62)">Obscure (P62)</option>
                  </select>
                </td>
                <td>
                  <select
                    name="thickness"
                    value={item.thickness}
                    onChange={(e) => handleItemChange(index, 0, "thickness", e.target.value)}
                  >
                    <option value="1/8&quot;">1/8"</option>
                    <option value="3/16&quot;">3/16"</option>
                    <option value="1/4&quot;">1/4"</option>
                    <option value="3/8&quot;">3/8"</option>
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                     onChange={(e) => handleItemChange(index, "description", e.target.value)}
                  />
                </td>
                <td>
                  <button type="button" onClick={() => removeItem(index)}>
                    -
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" className="add-item-button" onClick={addItem}>
          Add Item
        </button>
        <button type="button" onClick={generatePDF}>
          Generate PDF
        </button>
        <button type="button" onClick={handleSubmit}>
          Submit Order
        </button>
      </form>
    </div>
  );
};

export default SupplierOrderForm;