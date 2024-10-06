import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../Services/firebase";
import { Table, Button, Modal } from "antd";

export default function ListVehicle() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [groupedVehicles, setGroupedVehicles] = useState([]);
  const [selectedUserVehicles, setSelectedUserVehicles] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchApprovedVehicles = async () => {
      setLoading(true);

      // Query the Vehicle collection for all approved vehicles
      const q = query(
        collection(db, "Vehicle"),
        where("status", "==", "approved") // Only fetch approved vehicles
      );

      const querySnapshot = await getDocs(q);
      const approvedVehicles = [];

      querySnapshot.forEach((doc) => {
        approvedVehicles.push({ ...doc.data(), id: doc.id });
      });

      // Group vehicles by userId and count the total vehicles for each user
      const grouped = approvedVehicles.reduce((acc, vehicle) => {
        const userId = vehicle.userId;
        const vehicleType = vehicle.vehicleType;

        if (!acc[userId]) {
          acc[userId] = {
            userId,
            totalVehicles: 0,
            carCount: 0,
            motorcycleCount: 0,
            electricBicycleCount: 0, // Renamed this for electric bicycles
            bicycleCount: 0,
            vehicles: [],
          };
        }

        acc[userId].totalVehicles += 1;

        // Count each type of vehicle
        if (vehicleType === "car") acc[userId].carCount += 1;
        else if (vehicleType === "motorbike") acc[userId].motorcycleCount += 1;
        else if (vehicleType === "electric_bicycle")
          acc[userId].electricBicycleCount += 1;
        else if (vehicleType === "bicycle") acc[userId].bicycleCount += 1;

        acc[userId].vehicles.push(vehicle);
        return acc;
      }, {});

      // Convert the grouped object into an array
      setGroupedVehicles(Object.values(grouped));
      setVehicles(approvedVehicles);
      setLoading(false);
    };

    fetchApprovedVehicles();
  }, []);

  // Function to open modal and show detailed vehicles of a specific user
  const showUserVehicles = (userVehicles) => {
    setSelectedUserVehicles(userVehicles);
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: "User ID",
      dataIndex: "userId",
      key: "userId",
    },
    {
      title: "Tổng số phương tiện",
      dataIndex: "totalVehicles",
      key: "totalVehicles",
    },
    {
      title: "Số xe ô tô",
      dataIndex: "carCount",
      key: "carCount",
    },
    {
      title: "Số xe máy",
      dataIndex: "motorcycleCount",
      key: "motorcycleCount",
    },
    {
      title: "Số xe đạp điện",
      dataIndex: "electricBicycleCount",
      key: "electricBicycleCount",
    },
    {
      title: "Số xe đạp",
      dataIndex: "bicycleCount",
      key: "bicycleCount",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button onClick={() => showUserVehicles(record.vehicles)}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

  const detailColumns = [
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
      title: "Hình ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (text) =>
        text ? <img src={text} alt="vehicle" style={{ width: 100 }} /> : "N/A",
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={groupedVehicles}
        loading={loading}
        rowKey="userId"
        pagination={false}
      />

      <Modal
        title="Chi tiết phương tiện của người dùng"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Table
          columns={detailColumns}
          dataSource={selectedUserVehicles}
          rowKey="id"
          pagination={false}
        />
      </Modal>
    </>
  );
}
