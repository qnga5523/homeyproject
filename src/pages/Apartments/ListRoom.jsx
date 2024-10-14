import React, { useState, useEffect } from "react";
import { Table, Select } from "antd";
import { db } from "../../Services/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function ShowRooms() {
  const [roomsData, setRoomsData] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState("all");

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    const buildingCollection = collection(db, "buildings");
    const usersCollection = collection(db, "Users");

    // Fetch all buildings
    const buildingSnapshot = await getDocs(buildingCollection);
    const buildingList = buildingSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Fetch all users (for room assignment)
    const usersSnapshot = await getDocs(usersCollection);
    const usersList = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Merge room data with building and user data
    const mergedRoomData = [];
    buildingList.forEach((building) => {
      if (building.rooms && building.rooms.length > 0) {
        building.rooms.forEach((room) => {
          const user = usersList.find(
            (user) =>
              user.room === room.roomNumber && user.building === building.name
          );
          mergedRoomData.push({
            roomNumber: room.roomNumber,
            buildingName: building.name,
            username: user ? user.Username : "No User",
            area: room.area || "N/A",
            numberOfRooms: room.numberOfRooms || "N/A",
            roomType: room.roomType || "N/A",
            assets: room.assets ? room.assets.join(", ") : "N/A",
          });
        });
      }
    });

    setBuildings(buildingList);
    setRoomsData(mergedRoomData);
    setFilteredRooms(mergedRoomData); // Initially, show all rooms
  };

  const handleBuildingChange = (value) => {
    setSelectedBuilding(value);
    if (value === "all") {
      setFilteredRooms(roomsData); // Show all rooms if "All" is selected
    } else {
      const filtered = roomsData.filter((room) => room.buildingName === value);
      setFilteredRooms(filtered); // Filter rooms by the selected building
    }
  };

  const columns = [
    {
      title: "Room Number",
      dataIndex: "roomNumber",
      key: "roomNumber",
      width: 150,
    },
    {
      title: "Building Name",
      dataIndex: "buildingName",
      key: "buildingName",
      width: 150,
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      width: 150,
    },
    {
      title: "Area (m²)", // Diện tích
      dataIndex: "area",
      key: "area",
      width: 100,
    },
    {
      title: "Number of Rooms", // Số phòng
      dataIndex: "numberOfRooms",
      key: "numberOfRooms",
      width: 150,
    },
    {
      title: "Room Type", // Loại phòng
      dataIndex: "roomType",
      key: "roomType",
      width: 150,
    },
    {
      title: "Assets", // Tài sản
      dataIndex: "assets",
      key: "assets",
      width: 250,
    },
  ];

  return (
    <div>
      <h2>Rooms by Building</h2>

      <Select
        value={selectedBuilding}
        onChange={handleBuildingChange}
        style={{ width: 300, marginBottom: 20 }}
      >
        <Select.Option value="all">All Buildings</Select.Option>
        {buildings.map((building) => (
          <Select.Option key={building.id} value={building.name}>
            {building.name}
          </Select.Option>
        ))}
      </Select>

      <Table
        dataSource={filteredRooms.map((room, index) => ({
          key: index,
          ...room,
        }))}
        columns={columns}
        pagination={false}
      />
    </div>
  );
}
