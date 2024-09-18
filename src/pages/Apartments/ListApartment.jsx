import React, { useEffect, useState } from "react";
import { doc, collection, getDocs } from "firebase/firestore";
import { db } from "../../Services/firebase";
import { Table, Select } from "antd";
import moment from "moment";

const ListApartment = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState("");

  useEffect(() => {
    // Fetch user data
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "Users"));
      const users = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.role === "owner") {
          users.push({
            ...data,
            id: doc.id,
          });
        }
      });
      setUsers(users);
    };

    // Fetch room data
    const fetchRooms = async () => {
      const buildings = ["CT1/D22", "CT2/D22", "CT3/D22"]; // Add all building names here
      const allRooms = [];

      for (const building of buildings) {
        const roomRef = collection(
          db,
          `apartments/${building.replace("/", "-")}/rooms`
        );
        const querySnapshot = await getDocs(roomRef);
        querySnapshot.forEach((doc) => {
          allRooms.push({ key: doc.id, ...doc.data(), building });
        });
      }

      // Map users to their rooms
      const roomsWithUsernames = allRooms.map((room) => {
        const user = users.find(
          (user) => user.building === room.building && user.room === room.room
        );
        return {
          ...room,
          Username: user ? user.Username : "N/A",
        };
      });

      setRooms(roomsWithUsernames);
      setFilteredRooms(roomsWithUsernames);
    };

    fetchUsers();
    fetchRooms();
  }, []);

  useEffect(() => {
    // Filter data based on selected building
    if (selectedBuilding) {
      const filtered = rooms.filter(
        (room) => room.building === selectedBuilding
      );
      setFilteredRooms(filtered);
    } else {
      setFilteredRooms(rooms);
    }
  }, [selectedBuilding, rooms]);

  const handleBuildingChange = (value) => {
    setSelectedBuilding(value);
  };

  const columns = [
    {
      title: "Building",
      dataIndex: "building",
      key: "building",
    },
    {
      title: "Room",
      dataIndex: "room",
      key: "room",
    },
    {
      title: "Acreage",
      dataIndex: "acreage",
      key: "acreage",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Asset",
      dataIndex: "asset",
      key: "asset",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Datetime",
      dataIndex: "datetime",
      key: "datetime",
      render: (text) => (text ? moment(text).format("MM/DD/YYYY HH:mm") : ""),
    },
    {
      title: "Username",
      dataIndex: "Username",
      key: "Username",
    },
  ];

  return (
    <>
      <Select
        placeholder="Select a building"
        style={{ width: 200, marginBottom: 16, marginTop: 16, marginLeft: 16 }}
        value={selectedBuilding}
        onChange={handleBuildingChange}
        options={[
          { value: "CT1/D22", label: "CT1/D22" },
          { value: "CT2/D22", label: "CT2/D22" },
          { value: "CT3/D22", label: "CT3/D22" },
        ]}
      />
      <Table dataSource={filteredRooms} columns={columns} pagination={false} />
    </>
  );
};

export default ListApartment;
