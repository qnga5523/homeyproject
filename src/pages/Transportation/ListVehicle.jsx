import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../Services/firebase";
import { Table, Button, Modal, message, Card ,Typography} from "antd";
const { Title } = Typography;
export default function ListVehicle() {
  const [groupedVehicles, setGroupedVehicles] = useState([]);
  const [selectedUserVehicles, setSelectedUserVehicles] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchApprovedVehicles = async () => {
      setLoading(true);
      const q = query(
        collection(db, "Vehicle"),
        where("status", "==", "approved")
      );

      try {
        const querySnapshot = await getDocs(q);
        const approvedVehicles = querySnapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }));

        const grouped = approvedVehicles.reduce((acc, vehicle) => {
          const userId = vehicle.userId;
          const vehicleType = vehicle.vehicleType;

          if (!acc[userId]) {
            acc[userId] = {
              userId,
              Username: vehicle.Username || "Unknown",
              email: vehicle.email || "N/A",
              Phone: vehicle.Phone || "N/A",
              room: vehicle.room || "N/A",
              building: vehicle.building || "N/A",
              totalVehicles: 0,
              carCount: 0,
              motorcycleCount: 0,
              electricBicycleCount: 0,
              bicycleCount: 0,
              vehicles: [],
            };
          }

          acc[userId].totalVehicles += 1;
          if (vehicleType === "car") acc[userId].carCount += 1;
          else if (vehicleType === "motorbike") acc[userId].motorcycleCount += 1;
          else if (vehicleType === "electric_bicycle") acc[userId].electricBicycleCount += 1;
          else if (vehicleType === "bicycle") acc[userId].bicycleCount += 1;

          acc[userId].vehicles.push(vehicle);
          return acc;
        }, {});

        setGroupedVehicles(Object.values(grouped));
      } catch (error) {
        message.error("Failed to fetch vehicle data");
        console.error("Error fetching vehicle data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedVehicles();
  }, []);

  const showUserVehicles = (userVehicles) => {
    setSelectedUserVehicles(userVehicles);
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: "Username",
      dataIndex: "Username",
      key: "Username",
    },
    {
      title: "Apartment",
      dataIndex: "room",
      key: "room",
    },
    {
      title: "Building",
      dataIndex: "building",
      key: "building",
    },
    {
      title: "Total Vehicles",
      dataIndex: "totalVehicles",
      key: "totalVehicles",
    },
    {
      title: "Cars",
      dataIndex: "carCount",
      key: "carCount",
    },
    {
      title: "Motorcycles",
      dataIndex: "motorcycleCount",
      key: "motorcycleCount",
    },
    {
      title: "Electric Bicycles",
      dataIndex: "electricBicycleCount",
      key: "electricBicycleCount",
    },
    {
      title: "Bicycles",
      dataIndex: "bicycleCount",
      key: "bicycleCount",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button onClick={() => showUserVehicles(record.vehicles)}>
          View Details
        </Button>
      ),
    },
  ];

  const detailColumns = [
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
      render: (text) =>
        text ? <img src={text} alt="vehicle" style={{ width: 100 }} /> : "N/A",
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Card
        style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", borderRadius: "8px" }}
      >
        <Title level={3} style={{ textAlign: "center", marginBottom: "20px" }}>
          Vehicle List by User
        </Title>
        <Table
          columns={columns}
          dataSource={groupedVehicles}
          loading={loading}
          rowKey="userId"
          pagination={{ pageSize: 5 }}
          bordered
          style={{ marginBottom: "20px" }}
        />
      </Card>

      <Modal
        title="User Vehicle Details"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
        centered
      >
        <Table
          columns={detailColumns}
          dataSource={selectedUserVehicles}
          rowKey="id"
          pagination={false}
          bordered
        />
      </Modal>
    </div>
  );
}
