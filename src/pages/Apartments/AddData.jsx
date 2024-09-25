import React, { useState, useEffect } from "react";
import { Form, Input, Button, Table, Popconfirm } from "antd";
import { db } from "../../Services/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

export default function ManageBuildings() {
  const [buildingName, setBuildingName] = useState("");
  const [floors, setFloors] = useState(0);
  const [roomsPerFloor, setRoomsPerFloor] = useState(0);
  const [buildings, setBuildings] = useState([]);
  const [currentBuildingId, setCurrentBuildingId] = useState(null); // ID của tòa nhà đang chỉnh sửa

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    const buildingCollection = collection(db, "buildings");
    const buildingSnapshot = await getDocs(buildingCollection);
    const buildingList = buildingSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setBuildings(buildingList);
  };

  const handleSubmit = async () => {
    const rooms = [];
    for (let i = 1; i <= floors; i++) {
      for (let j = 1; j <= roomsPerFloor; j++) {
        rooms.push({
          roomNumber: `${i}${j < 10 ? "0" + j : j}`,
        });
      }
    }

    try {
      if (currentBuildingId) {
        // Cập nhật tòa nhà hiện tại
        const buildingRef = doc(db, "buildings", currentBuildingId);
        await updateDoc(buildingRef, {
          name: buildingName,
          floors: floors,
          roomsPerFloor: roomsPerFloor,
          rooms: rooms,
        });
        alert("Building updated successfully!");
      } else {
        // Thêm tòa nhà mới
        await addDoc(collection(db, "buildings"), {
          name: buildingName,
          floors: floors,
          roomsPerFloor: roomsPerFloor,
          rooms: rooms,
        });
        alert("Building added successfully!");
      }
      fetchBuildings(); // Refresh building list
      // Reset form fields
      setBuildingName("");
      setFloors(0);
      setRoomsPerFloor(0);
      setCurrentBuildingId(null); // Reset ID sau khi thêm hoặc cập nhật
    } catch (error) {
      console.error("Error saving building: ", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "buildings", id));
      alert("Building deleted successfully!");
      fetchBuildings(); // Refresh building list
    } catch (error) {
      console.error("Error deleting building: ", error);
    }
  };

  const columns = [
    {
      title: "Building Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Floors",
      dataIndex: "floors",
      key: "floors",
    },
    {
      title: "Rooms per Floor",
      dataIndex: "roomsPerFloor",
      key: "roomsPerFloor",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <span>
          <Button onClick={() => handleEdit(record.id)}>Edit</Button>
          <Popconfirm
            title="Are you sure to delete this building?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link">Delete</Button>
          </Popconfirm>
        </span>
      ),
    },
  ];

  const handleEdit = (id) => {
    const building = buildings.find((b) => b.id === id);
    if (building) {
      setBuildingName(building.name);
      setFloors(building.floors);
      setRoomsPerFloor(building.roomsPerFloor);
      setCurrentBuildingId(id); // Lưu ID của tòa nhà đang chỉnh sửa
    }
  };

  return (
    <div>
      <Form layout="vertical" onFinish={handleSubmit}>
        <Form.Item label="Building Name">
          <Input
            value={buildingName}
            onChange={(e) => setBuildingName(e.target.value)}
          />
        </Form.Item>
        <Form.Item label="Number of Floors">
          <Input
            type="number"
            value={floors}
            onChange={(e) => setFloors(Number(e.target.value))}
          />
        </Form.Item>
        <Form.Item label="Rooms per Floor">
          <Input
            type="number"
            value={roomsPerFloor}
            onChange={(e) => setRoomsPerFloor(Number(e.target.value))}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            {currentBuildingId ? "Update Building" : "Add Building"}
          </Button>
        </Form.Item>
      </Form>

      <Table
        dataSource={buildings.map((building) => ({
          key: building.id,
          ...building,
        }))}
        columns={columns}
        pagination={false}
      />
    </div>
  );
}
