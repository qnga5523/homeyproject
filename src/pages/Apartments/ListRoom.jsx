import React, { useEffect, useState } from "react";
import { Table, Select, Typography } from "antd";
import { db } from "../../Services/firebase";
import { collection, getDocs } from "firebase/firestore";

const { Title } = Typography;

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
    const roomsCollection = collection(db, "rooms");

    const buildingSnapshot = await getDocs(buildingCollection);
    const buildingList = buildingSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const usersSnapshot = await getDocs(usersCollection);
    const usersList = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const roomsSnapshot = await getDocs(roomsCollection);
    const roomList = roomsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const mergedRoomData = roomList.map((room) => {
      const building = buildingList.find(
        (building) => building.id === room.buildingId
      );
      const user = usersList.find(
        (user) =>
          user.room === room.roomNumber && user.building === building?.name
      );

      return {
        roomNumber: room.roomNumber,
        buildingName: building ? building.name : "",
        username: user ? user.Username : "",
        area: room.area ?? "",
        roomType: room.roomType ?? "",
      };
    });

    setBuildings(buildingList);
    setRoomsData(mergedRoomData);
    setFilteredRooms(mergedRoomData);
  };

  const handleBuildingChange = (value) => {
    setSelectedBuilding(value);
    if (value === "all") {
      setFilteredRooms(roomsData);
    } else {
      const filtered = roomsData.filter((room) => room.buildingName === value);
      setFilteredRooms(filtered);
    }
  };

  const columns = [
    {
      title: "Room",
      dataIndex: "roomNumber",
      key: "roomNumber",
      width: 150,
      sorter: (a, b) => parseInt(a.roomNumber) - parseInt(b.roomNumber),
    },
    {
      title: "Building",
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
      title: "Area (m²)",
      dataIndex: "area",
      key: "area",
      width: 100,
      sorter: (a, b) => parseFloat(a.area) - parseFloat(b.area),
    },
    {
      title: "Type",
      dataIndex: "roomType",
      key: "roomType",
      width: 150,
    },
  ];

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
      <Title
        level={2}
        style={{
          textAlign: "center",
          fontWeight: "bold",
          marginBottom: "20px",
        }}
      >
        Management Buildings
      </Title>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <Select
          value={selectedBuilding}
          onChange={handleBuildingChange}
          style={{ width: "300px" }}
        >
          <Select.Option value="all">All Buildings</Select.Option>
          {buildings.map((building) => (
            <Select.Option key={building.id} value={building.name}>
              {building.name}
            </Select.Option>
          ))}
        </Select>
      </div>

      <Table
        dataSource={filteredRooms.map((room, index) => ({
          key: index,
          ...room,
        }))}
        columns={columns}
        pagination={false}
        bordered
      />
    </div>
  );
}
