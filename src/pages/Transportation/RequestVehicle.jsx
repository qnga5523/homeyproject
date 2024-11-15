import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../Services/firebase";
import { Button, message, Table, Image, Modal,Card, Typography  } from "antd";
import { sendNotification } from "../Notification/NotificationService";
const { Title } = Typography;
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
      await updateDoc(requestDocRef, { status });
      message.success(`Vehicle registration ${status.toLowerCase()} successfully!`);
      setRequests(requests.filter((request) => request.id !== record.id));

      await sendNotification(
        record.userId, 
        'user', 
        `Your vehicle registration has been ${status.toLowerCase()} by the admin.`, 
        record.id 
      );

    
      await sendNotification(
        null, 
        'admin', 
        `Vehicle registration request for ${record.userId} has been ${status.toLowerCase()}.`,
        record.id 
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
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            type="primary"
            onClick={() => confirmAction(record, "approved")}
            loading={actionLoading[record.id]}
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
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
    <Card
      style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", borderRadius: "8px" }}
    >
      <Title level={3} style={{ textAlign: "center", marginBottom: "20px" }}>
        Vehicle Registration Requests
      </Title>
      <Table
        columns={columns}
        dataSource={requests}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        bordered
      />
    </Card>
  </div>
  );
}
