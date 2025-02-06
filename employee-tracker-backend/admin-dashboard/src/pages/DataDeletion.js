import React from "react";

const DataDeletion = () => {
  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h1>Data Deletion Request</h1>
      <p>If you want to delete your data, please follow these steps:</p>

      <h2>1. Contact Us</h2>
      <p>Email: <a href="mailto:support@classicglassandmirror.com">support@classicglassandmirror.com</a></p>

      <h2>2. Required Information</h2>
      <ul>
        <li>Your full name</li>
        <li>Email associated with your account</li>
        <li>Reason for data deletion (optional)</li>
      </ul>

      <h2>3. Facebook Data Deletion</h2>
      <p><a href="https://www.facebook.com/help/delete_account" target="_blank">Manage your Facebook data</a></p>
    </div>
  );
};

export default DataDeletion;