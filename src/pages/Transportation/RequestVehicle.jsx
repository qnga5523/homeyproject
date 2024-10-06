import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../Services/firebase";
import { Button, message, Table } from "antd";

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

      message.success("Phương tiện đã được phê duyệt!");
      setRequests(requests.filter((request) => request.id !== record.id));
    } catch (error) {
      console.error("Error approving request: ", error);
      message.error("Lỗi khi phê duyệt phương tiện.");
    }
  };

  const columns = [
    {
      title: "Loại phương tiện",
      dataIndex: "vehicleType",
      key: "vehicleType",
    },
    {
      title: "Biển số",
      dataIndex: "licensePlate",
      key: "licensePlate",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Hành động",
      key: "action",
      render: (text, record) => (
        <Button type="primary" onClick={() => approveRequest(record)}>
          Phê duyệt
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
