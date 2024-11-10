import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../Services/firebase";
import { Button, message, Table, Image } from "antd";

export default function RequestVehicle() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const approveRequest = async (record) => {
    const requestDocRef = doc(db, "Vehicle", record.id);

    try {
      await updateDoc(requestDocRef, {
        status: "approved",
      });

      message.success("Vehicle approved!");
      setRequests(requests.filter((request) => request.id !== record.id));
    } catch (error) {
      console.error("Error approving request: ", error);
      message.error("Error approving vehicle.");
    }
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
        <Button type="primary" onClick={() => approveRequest(record)}>
          Approve
        </Button>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={requests}
      loading={loading}
      rowKey="id"
      pagination={false}
    />
  );
}
