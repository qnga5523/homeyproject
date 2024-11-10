import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../Services/firebase";
import { Table, Button, Modal } from "antd";

export default function ListVehicle({ setVehicleCounts }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [groupedVehicles, setGroupedVehicles] = useState([]);
  const [selectedUserVehicles, setSelectedUserVehicles] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchApprovedVehicles = async () => {
      setLoading(true);
      const q = query(
        collection(db, "Vehicle"),
        where("status", "==", "approved") 
      );

      const querySnapshot = await getDocs(q);
      const approvedVehicles = [];

      querySnapshot.forEach((doc) => {
        approvedVehicles.push({ ...doc.data(), id: doc.id });
      });
      const vehicleCounts = {
        total: 0,
        carCount: 0,
        motorcycleCount: 0,
        electricBicycleCount: 0,
        bicycleCount: 0,
      };
      const grouped = approvedVehicles.reduce((acc, vehicle) => {
        const userId = vehicle.userId;
        const vehicleType = vehicle.vehicleType;
        vehicleCounts.total += 1;
        if (vehicleType === "car") vehicleCounts.carCount += 1;
        else if (vehicleType === "motorbike") vehicleCounts.motorcycleCount += 1;
        else if (vehicleType === "electric_bicycle") vehicleCounts.electricBicycleCount += 1;
        else if (vehicleType === "bicycle") vehicleCounts.bicycleCount += 1;

        if (!acc[userId]) {
          acc[userId] = {
            userId,
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
        else if (vehicleType === "electric_bicycle")
          acc[userId].electricBicycleCount += 1;
        else if (vehicleType === "bicycle") acc[userId].bicycleCount += 1;

        acc[userId].vehicles.push(vehicle);
        return acc;
      }, {});


      setGroupedVehicles(Object.values(grouped));
      setVehicles(approvedVehicles);
      setVehicleCounts(vehicleCounts);
      setLoading(false);
    };

    fetchApprovedVehicles();
  }, [setVehicleCounts]);


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
    <>
      <Table
        columns={columns}
        dataSource={groupedVehicles}
        loading={loading}
        rowKey="userId"
        pagination={false}
      />
  
      <Modal
        title="User Vehicle Details"
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
