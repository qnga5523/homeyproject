import React from "react";
import { Button } from "antd";
import { useLocation } from "react-router-dom";
import { PDFDownloadLink } from "@react-pdf/renderer";
import InvoiceDocument from "../Invoices/InvoiceDocument";
import sendInvoiceEmail from "./sendInvoiceEmail";

const InvoiceReviewPage = () => {
  const location = useLocation();
  const { users = [], selectedDate } = location.state || {};

  const handleSubmit = async () => {
    const approvedOwners = users.filter(user => user.role === "owner" && user.approved);

    for (const user of approvedOwners) {
      if (user.email) { // Kiểm tra xem user có email hay không
        await sendInvoiceEmail(user); // Gửi email cho từng user
      } else {
        console.warn(`No email found for user: ${user.username}`);
      }
    }
    alert("Invoices sent successfully to all approved owners!");
  };

  return (
    <div>
      <h2>Invoice Review for {selectedDate}</h2>
      {users.map(user => (
        <div key={user.id} style={{ marginBottom: 16 }}>
          <h3>Invoice for {user.username}</h3>
          <PDFDownloadLink
            document={<InvoiceDocument user={user} />}
            fileName={`${user.username}_invoice.pdf`}
          >
            {({ loading }) => (loading ? "Generating PDF..." : "Download Invoice")}
          </PDFDownloadLink>
        </div>
      ))}
      <Button type="primary" onClick={handleSubmit} style={{ marginTop: 20 }}>
        Submit and Send Invoices
      </Button>
    </div>
  );
};

export default InvoiceReviewPage;
