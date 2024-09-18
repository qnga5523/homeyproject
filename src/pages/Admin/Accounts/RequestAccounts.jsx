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

  const handleApprove = async (id) => {
    await updateDoc(doc(db, "Users", id), { approved: true });
    message.success("Account approved successfully!");
    setOwners(owners.filter((owner) => owner.id !== id));
  };

  const handleReject = async (id) => {
    await deleteDoc(doc(db, "Users", id));
    message.error("Account rejected and deleted.");
    setOwners(owners.filter((owner) => owner.id !== id));
  };

  const columns = [
    { title: "Email", dataIndex: "email", key: "email" },
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
          <Button type="primary" onClick={() => handleApprove(record.id)}>
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
