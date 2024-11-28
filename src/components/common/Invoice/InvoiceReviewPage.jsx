import React, { useState } from "react";
import { Button, Table, message } from "antd";
import { pdf } from "@react-pdf/renderer";
import { useNavigate, useLocation } from "react-router-dom";
import InvoiceDocument from "./InvoiceDocument"; 
import sendInvoiceEmail from "./sendInvoiceEmail";

const InvoiceReviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { users } = location.state || {};
  const [selectedUser, setSelectedUser] = useState(null);
  const handleSendEmail = async (user) => {
    if (!user.email) {
      message.error("User email is missing. Cannot send email.");
      return;
    }
    await sendInvoiceEmail(user);
    message.success(`Invoice sent to ${user.username}`);
  };
  const handleSelectUser = async (user) => {
    setSelectedUser(user);
     const blob = await pdf(<InvoiceDocument user={user} />).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };
  const columns = [
    { title: "Username", dataIndex: "username", key: "username" },
    { title: "Room", dataIndex: "room", key: "room" },
    { title: "Total Fee", dataIndex: "totalmoney", key: "totalmoney", render: (text) => `${text} VND` },
    {
      title: "Actions",
      key: "actions",
      render: (_, user) => (
        <>
          <Button type="primary" onClick={() => handleSelectUser(user)} style={{ marginRight: "8px" }}>
            Preview
          </Button>
          <Button type="primary" onClick={() => handleSendEmail(user)}>
            Send Email
          </Button>
        </>
      ),
    },
  ];
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Invoice Management</h2>
      <div style={styles.content}>
        <div style={styles.tableContainer}>
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            pagination={{ pageSize: 5 }}
          />
        </div>
      </div>

      <Button
        type="primary"
        onClick={() => navigate("/")}
        style={{ marginTop: "20px" }}
      >
        Back to Dashboard
      </Button>
    </div>
  );
};
const styles = {
  container: { padding: "20px" },
  title: { fontSize: "24px", textAlign: "center", marginBottom: "20px" },
  content: { display: "flex", gap: "20px" },
  tableContainer: { flex: 1 },
};
export default InvoiceReviewPage;
