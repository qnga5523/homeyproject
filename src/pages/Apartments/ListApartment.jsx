import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, Popconfirm, message, Space, Row, Col} from "antd";
import { db } from "../../Services/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
const { Option } = Select;

export default function ListApartment() {
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  const [form] = Form.useForm();
  const [addForm] = Form.useForm();

  useEffect(() => {
    fetchBuildings();
    fetchRooms(); 
  }, []);

  const fetchBuildings = async () => {
    try {
      const buildingsCollection = collection(db, "buildings");
      const buildingSnapshot = await getDocs(buildingsCollection);
      const buildingList = buildingSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBuildings(buildingList);
    } catch (error) {
      console.error("Error fetching buildings:", error);
    }
  };

  const fetchRooms = async (buildingId = null) => {
    try {
      const roomsCollection = collection(db, "rooms");
      const roomSnapshot = await getDocs(roomsCollection);
      const roomList = roomSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      if (buildingId) {
        const filtered = roomList.filter((room) => room.buildingId === buildingId);
        setFilteredRooms(filtered);
      } else {
        setFilteredRooms(roomList);
      }

      setRooms(roomList);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };


  const showDetail = (room) => {
    setSelectedRoom(room);
    setIsModalVisible(true);
    form.setFieldsValue(room);
  };


  const handleOk = async () => {
    const updatedRoom = form.getFieldsValue();
    try {
      await updateDoc(doc(db, "rooms", selectedRoom.id), updatedRoom);
      fetchRooms(selectedBuildingId);
      setIsModalVisible(false);
      setSelectedRoom(null); 
      message.success("Room updated successfully!");
    } catch (error) {
      console.error("Error updating room:", error);
      message.error("Failed to update room.");
    }
  };


  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedRoom(null); 
  };

  const handleBuildingChange = (value) => {
    setSelectedBuildingId(value);
    if (value) {
      fetchRooms(value); 
    } else {
      setFilteredRooms(rooms);
    }
    setSelectedRoom(null);
  };

  const handleAddRoom = async (values) => {
    if (!selectedBuildingId) {
      message.error("Please select a building first.");
      return;
    }
    try {
      await addDoc(collection(db, "rooms"), {
        roomNumber: values.roomNumber,
        roomType: values.roomType,
        area: Number(values.area),
        buildingId: selectedBuildingId,
      });
      addForm.resetFields();
      fetchRooms(selectedBuildingId);
      message.success("Room added successfully!");
    } catch (error) {
      console.error("Error adding room:", error);
      message.error("Failed to add room.");
    }
  };

  const handleDeleteRoom = async (id) => {
    try {
      await deleteDoc(doc(db, "rooms", id));
      fetchRooms(selectedBuildingId);
      message.success("Room deleted successfully!");
    } catch (error) {
      console.error("Error deleting room:", error);
      message.error("Failed to delete room.");
    }
  };


  const columns = [
    {
      title: "Room Number",
      dataIndex: "roomNumber",
      key: "roomNumber",
      render: (text, record) => (
        <Button type="link" onClick={() => showDetail(record)}>
          {text}
        </Button>
      ),
      sorter: (a, b) => parseInt(a.roomNumber, 10) - parseInt(b.roomNumber, 10),
    },
    {
      title: "Room Type",
      dataIndex: "roomType",
      key: "roomType",
    },
    {
      title: "Area (sqm)",
      dataIndex: "area",
      key: "area",
      sorter: (a, b) => a.area - b.area,
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space>
          <EditOutlined
            style={{ color: "blue", cursor: "pointer", fontSize: "20px" }} 
            onClick={() => showDetail(record)}
          />
          <Popconfirm
            title="Are you sure to delete this room?"
            onConfirm={() => handleDeleteRoom(record.id)}
          >
            <DeleteOutlined
              style={{ color: "red", cursor: "pointer", fontSize: "20px" }} 
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <Select
        placeholder="Select a Building"
        style={{ width: "100%", marginBottom: "20px" }}
        onChange={handleBuildingChange}
        allowClear
      >
        <Option value={null}>All Buildings</Option>
        {buildings.map((building) => (
          <Option key={building.id} value={building.id}>
            {building.name}
          </Option>
        ))}
      </Select>

      <Form
        form={addForm}
        layout="vertical"
        onFinish={handleAddRoom}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Room" name="roomNumber" rules={[{ required: true, message: "Please input room number!" }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Type" name="roomType" rules={[{ required: true, message: "Please input room type!" }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Area(sqm)" name="area" rules={[{ required: true, message: "Please input area!" }]}>
              <Input type="number" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: "100%", marginTop: "10px" }}>
            Add Room
          </Button>
        </Form.Item>
      </Form>
      <Table
        dataSource={filteredRooms.map((room) => ({
          key: room.id,
          ...room,
        }))}
        columns={columns}
        pagination={false}
      />
      <Modal
        title="Room Details"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Room" name="roomNumber">
            <Input />
          </Form.Item>
          <Form.Item label="Type" name="roomType">
            <Input />
          </Form.Item>
          <Form.Item label="Area (sqm)" name="area">
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
