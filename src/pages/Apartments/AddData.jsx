import React, { useState, useEffect } from "react";
import { Form, Input, Button, Table, Popconfirm, Row, Col } from "antd";
import { db } from "../../Services/firebase";
import { collection, addDoc, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

export default function ManageBuildings() {
  const [buildingName, setBuildingName] = useState("");
  const [floors, setFloors] = useState(0);
  const [roomsPerFloor, setRoomsPerFloor] = useState(0);
  const [buildings, setBuildings] = useState([]);
  const [currentBuildingId, setCurrentBuildingId] = useState(null);

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
        const buildingRef = doc(db, "buildings", currentBuildingId);
        await updateDoc(buildingRef, {
          name: buildingName,
          floors: floors,
          roomsPerFloor: roomsPerFloor,
          rooms: rooms,
        });
        alert("Building updated successfully!");
      } else {
        await addDoc(collection(db, "buildings"), {
          name: buildingName,
          floors: floors,
          roomsPerFloor: roomsPerFloor,
          rooms: rooms,
        });
        alert("Building added successfully!");
      }
      fetchBuildings();
      setBuildingName("");
      setFloors(0);
      setRoomsPerFloor(0);
      setCurrentBuildingId(null);
    } catch (error) {
      console.error("Error saving building: ", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "buildings", id));
      alert("Building deleted successfully!");
      fetchBuildings();
    } catch (error) {
      console.error("Error deleting building: ", error);
    }
  };

  const handleEdit = (id) => {
    const building = buildings.find((b) => b.id === id);
    if (building) {
      setBuildingName(building.name);
      setFloors(building.floors);
      setRoomsPerFloor(building.roomsPerFloor);
      setCurrentBuildingId(id);
    }
  };

  const columns = [
    {
      title: "Building",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Floors",
      dataIndex: "floors",
      key: "floors",
    },
    {
      title: "Rooms",
      dataIndex: "roomsPerFloor",
      key: "roomsPerFloor",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <span>
          <EditOutlined
            style={{ fontSize: "18px", color: "#1890ff", cursor: "pointer", marginRight: 16 }}
            onClick={() => handleEdit(record.id)}
          />
          <Popconfirm
            title="Are you sure to delete this building?"
            onConfirm={() => handleDelete(record.id)}
          >
            <DeleteOutlined style={{ fontSize: "18px", color: "#ff4d4f", cursor: "pointer" }} />
          </Popconfirm>
        </span>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <Form layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Building" required>
              <Input
                value={buildingName}
                onChange={(e) => setBuildingName(e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Floors" required>
              <Input
                type="number"
                value={floors}
                onChange={(e) => setFloors(Number(e.target.value))}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Rooms" required>
              <Input
                type="number"
                value={roomsPerFloor}
                onChange={(e) => setRoomsPerFloor(Number(e.target.value))}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
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
