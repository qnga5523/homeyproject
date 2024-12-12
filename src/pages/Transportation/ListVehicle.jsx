import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../Services/firebase";
import { Table, Button, Modal, message, Card, Typography, Popconfirm, Spin, Empty } from "antd";

const { Title } = Typography;

export default function ListVehicle() {
  const [groupedVehicles, setGroupedVehicles] = useState([]);
  const [selectedUserVehicles, setSelectedUserVehicles] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchApprovedVehicles();
  }, []);

  const fetchApprovedVehicles = async () => {
    setLoading(true);
    const q = query(collection(db, "Vehicle"), where("status", "==", "approved"));

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

  const showUserVehicles = (userVehicles) => {
    setSelectedUserVehicles(userVehicles);
    setIsModalVisible(true);
  };

  const deleteVehicle = async (vehicleId) => {
    try {
      await deleteDoc(doc(db, "Vehicle", vehicleId));
      message.success("Vehicle deleted successfully!");

      // Refresh the data
      const updatedVehicles = selectedUserVehicles.filter(
        (vehicle) => vehicle.id !== vehicleId
      );
      setSelectedUserVehicles(updatedVehicles);
      fetchApprovedVehicles();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      message.error("Failed to delete vehicle.");
    }
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
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => showUserVehicles(record.vehicles)}
        >
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
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Popconfirm
          title="Are you sure to delete this vehicle?"
          onConfirm={() => deleteVehicle(record.id)}
        >
          <Button danger>Delete</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <Card
        style={{
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          marginBottom: "20px",
          padding: "20px",
        }}
      >
        <Title level={3} style={{ textAlign: "center", marginBottom: "20px" }}>
          Management Vehicles
        </Title>

        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={groupedVehicles}
            loading={loading}
            rowKey="userId"
            pagination={{ pageSize: 10 }}
            bordered
            locale={{
              emptyText: (
                <Empty
                  description="No Vehicles Found"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
          />
        )}
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
          locale={{
            emptyText: (
              <Empty
                description="No Vehicles to Display"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Modal>
    </div>
  );
}