import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { Button, Table, Space, message } from "antd";
import { db } from "../../../Services/firebase";
import emailjs from "emailjs-com"
import { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_USER_ID } from "../Email/EmailReactApi";
export default function RequestAccount() {
  const [owners, setOwners] = useState([]);

  useEffect(() => {
    const fetchOwners = async () => {
      const querySnapshot = await getDocs(collection(db, "Users"));
      const ownerData = [];
      querySnapshot.forEach((doc) => {
        if (doc.data().role === "owner" && !doc.data().approved) {
          ownerData.push({ ...doc.data(), id: doc.id });
        }
      });
      setOwners(ownerData);
    };

    fetchOwners();
  }, []);

  const handleApprove = async (id, email) => {
    try {
      await updateDoc(doc(db, "Users", id), { approved: true });
      message.success("Account approved successfully!");
      emailjs
        .send(
          EMAILJS_SERVICE_ID,   
          EMAILJS_TEMPLATE_ID,  
          { to_email: email },  
          EMAILJS_USER_ID       
        )
        .then(
          (response) => {
            console.log("Email sent successfully:", response.status, response.text);
            message.success("Notification email sent to user!");
          },
          (error) => {
            console.error("Failed to send email:", error);
            message.error("Failed to send notification email.");
          }
        );
  
      setOwners(owners.filter((owner) => owner.id !== id));
    } catch (error) {
      console.error("Error approving account:", error);
      message.error("Failed to approve account.");
    }
  };

  const handleReject = async (id) => {
    await deleteDoc(doc(db, "Users", id));
    message.error("Account rejected and deleted.");
    setOwners(owners.filter((owner) => owner.id !== id));
  };

  const columns = [
    { title: "Email", dataIndex: "userEmail", key: "userEmail" },

    { title: "User Name", dataIndex: "Username", key: "Username" },
    {
      title: "Apartment",
      dataIndex: "room",
      key: "room",
    },
    { title: "Building", dataIndex: "building", key: "building" },
    {
      title: "Approved",
      dataIndex: "approved",
      key: "approved",
      render: (approved) => (approved ? "Yes" : "No"),
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
         <Button type="primary" onClick={() => handleApprove(record.id, record.email)}>
            Approve
          </Button>
          <Button danger onClick={() => handleReject(record.id)}>
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  return <Table dataSource={owners} columns={columns} rowKey="id" />;
}
