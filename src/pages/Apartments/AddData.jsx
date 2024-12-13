import React, { useState, useEffect } from "react";
import { Form, Input, Button, Table, Popconfirm, Row, Col, Card, Typography, Divider } from "antd";
import { db } from "../../Services/firebase";
import { collection, addDoc, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { DeleteOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

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
    // Check for duplicate building names
    const duplicate = buildings.some((building) => building.name === buildingName.trim());
  if (duplicate) {
    alert("Building name already exists. Please choose a different name.");
    return;
  }
   // Generate room numbers based on the number of floors and rooms per floor
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
           // update existing building in Firestore
        const buildingRef = doc(db, "buildings", currentBuildingId);
        await updateDoc(buildingRef, {
          name: buildingName.trim(),
          floors: floors,
          roomsPerFloor: roomsPerFloor,
          rooms: rooms,
        });
        alert("Building updated successfully!");
      } else {
        //update new
        await addDoc(collection(db, "buildings"), {
          name: buildingName.trim(),
          floors: floors,
          roomsPerFloor: roomsPerFloor,
          rooms: rooms,
        });
        alert("Building added successfully!");
      }
      fetchBuildings();
      resetForm();
    } catch (error) {
      console.error("Error saving building: ", error);
    }
  };

  const resetForm = () => {
    setBuildingName("");
    setFloors(0);
    setRoomsPerFloor(0);
    setCurrentBuildingId(null);
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

  // const handleEdit = (id) => {
  //   const building = buildings.find((b) => b.id === id);
  //   if (building) {
  //     setBuildingName(building.name);
  //     setFloors(building.floors);
  //     setRoomsPerFloor(building.roomsPerFloor);
  //     setCurrentBuildingId(id);
  //   }
  // };

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
          {/* <EditOutlined
            style={{ fontSize: "18px", color: "#1890ff", cursor: "pointer", marginRight: 16 }}
            onClick={() => handleEdit(record.id)}
          /> */}
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
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <Card
        style={{
          marginBottom: "30px",
          borderRadius: "10px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
      >
        <Title level={3} style={{ textAlign: "center", marginBottom: "20px" }}>
          Manage Buildings
        </Title>
        <Divider />
        <Form layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label={<Text strong>Building Name</Text>}
                required
                tooltip="Enter the name of the building"
              >
                <Input
                  placeholder="Building Name"
                  value={buildingName}
                  onChange={(e) => setBuildingName(e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={<Text strong>Number of Floors</Text>}
                required
                tooltip="Enter the total number of floors"
              >
                <Input
                  type="number"
                  placeholder="Floors"
                  value={floors}
                  onChange={(e) => setFloors(Number(e.target.value))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={<Text strong>Rooms per Floor</Text>}
                required
                tooltip="Enter the number of rooms on each floor"
              >
                <Input
                  type="number"
                  placeholder="Rooms per Floor"
                  value={roomsPerFloor}
                  onChange={(e) => setRoomsPerFloor(Number(e.target.value))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                width: "100%",
                borderRadius: "5px",
                backgroundColor: currentBuildingId ? "#1890ff" : "#52c41a",
              }}
            >
              {currentBuildingId ? "Update Building" : "Add Building"}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card
        style={{
          borderRadius: "10px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
      >
        <Title level={4} style={{ textAlign: "center", marginBottom: "20px" }}>
           Buildings
        </Title>
        <Table
          dataSource={buildings.map((building) => ({
            key: building.id,
            ...building,
          }))}
          columns={columns}
          pagination={false}
          bordered
        />
      </Card>
    </div>
  );
}
