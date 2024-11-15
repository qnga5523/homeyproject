import { collection, doc, getDocs, updateDoc, addDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../Services/firebase";
import { Button, message, Table, Image, Modal } from "antd";
import { sendNotification } from "../Notification/NotificationService";
export default function RequestVehicle() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    const fetchVehicleRequests = async () => {
      setLoading(true);
      const requestsSnapshot = await getDocs(collection(db, "Vehicle"));

      const fetchedRequests = [];
      requestsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === "pending") {
          fetchedRequests.push({ ...data, id: doc.id });
        }
      });

      setRequests(fetchedRequests);
      setLoading(false);
    };

    fetchVehicleRequests();
  }, []);

  const handleAction = async (record, status) => {
    const requestDocRef = doc(db, "Vehicle", record.id);
    setActionLoading({ ...actionLoading, [record.id]: true });

    try {
      // Update the vehicle request status in Firestore
      await updateDoc(requestDocRef, { status });
      message.success(`Vehicle registration ${status.toLowerCase()} successfully!`);
      setRequests(requests.filter((request) => request.id !== record.id));

      // Send notification to the user
      await sendNotification(
        record.userId, // userId of the vehicle request submitter
        'user', // Role of the recipient
        `Your vehicle registration has been ${status.toLowerCase()} by the admin.`, // Notification message
        record.id // ID of the related vehicle request
      );

      // Send notification to the admin
      await sendNotification(
        null, // No specific userId for admin notifications
        'admin', // Role of the recipient
        `Vehicle registration request for ${record.userId} has been ${status.toLowerCase()}.`, // Notification message
        record.id // ID of the related vehicle request
      );

    } catch (error) {
      message.error(`Failed to ${status.toLowerCase()} vehicle registration.`);
      console.error("Error updating vehicle status:", error);
    } finally {
      setActionLoading({ ...actionLoading, [record.id]: false });
    }
  };

  const confirmAction = (record, actionType) => {
    Modal.confirm({
      title: `Are you sure you want to ${actionType} this request?`,
      onOk: () => handleAction(record, actionType),
      okText: "Yes",
      cancelText: "No",
    });
  };
  const columns = [
    {
      title: "Username",
      dataIndex: "Username",
      key: "Username",
    },
    {
      title: "Room",
      dataIndex: "room",
      key: "room",
    },
    {
      title: "Building",
      dataIndex: "building",
      key: "building",
    },
    {
      title: "Vehicle Type",
      dataIndex: "vehicleType",
      key: "vehicleType",
    },
    {
      title: "License Plate",
      dataIndex: "licensePlate",
      key: "licensePlate",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Image",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (url) =>
        url ? (
          <Image src={url} alt="Vehicle" width={100} height={60} />
        ) : (
          "No image"
        ),
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <>
          <Button
            type="primary"
            onClick={() => confirmAction(record, "approved")}
            loading={actionLoading[record.id]}
            style={{ marginRight: 8 }}
          >
            Approve
          </Button>
          <Button
            type="danger"
            onClick={() => confirmAction(record, "rejected")}
            loading={actionLoading[record.id]}
          >
            Reject
          </Button>
        </>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={requests}
      loading={loading}
      rowKey="id"
      pagination={{ pageSize: 5 }}
    />
  );
}
