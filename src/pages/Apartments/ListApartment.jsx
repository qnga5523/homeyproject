import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, Popconfirm, message } from "antd";
import { db } from "../../Services/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";

const { Option } = Select;

export default function ListApartment() {
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]); // New state to store filtered rooms
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  const [form] = Form.useForm();
  const [addForm] = Form.useForm();

  useEffect(() => {
    fetchBuildings();
    fetchRooms(); // Fetch all rooms initially
  }, []);

  // Fetch all buildings
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

  // Fetch all rooms initially and when a building is selected
  const fetchRooms = async (buildingId = null) => {
    try {
      const roomsCollection = collection(db, "rooms");
      const roomSnapshot = await getDocs(roomsCollection);
      const roomList = roomSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // If a building is selected, filter by buildingId; otherwise show all rooms
      if (buildingId) {
        const filtered = roomList.filter((room) => room.buildingId === buildingId);
        setFilteredRooms(filtered);
      } else {
        setFilteredRooms(roomList); // Show all rooms initially
      }

      setRooms(roomList);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  // Show room details in modal
  const showDetail = (room) => {
    setSelectedRoom(room);
    setIsModalVisible(true);
    form.setFieldsValue(room);
  };

  // Handle room update
  const handleOk = async () => {
    const updatedRoom = form.getFieldsValue();
    try {
      await updateDoc(doc(db, "rooms", selectedRoom.id), updatedRoom);
      fetchRooms(selectedBuildingId);
      setIsModalVisible(false);
      setSelectedRoom(null); // Clear after close
      message.success("Room updated successfully!");
    } catch (error) {
      console.error("Error updating room:", error);
      message.error("Failed to update room.");
    }
  };

  // Close modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedRoom(null); // Clear selection on close
  };

  // Handle building selection and filter rooms by building
  const handleBuildingChange = (value) => {
    setSelectedBuildingId(value);
    if (value) {
      fetchRooms(value); // Fetch rooms for the selected building
    } else {
      setFilteredRooms(rooms); // Show all rooms if no building is selected
    }
    setSelectedRoom(null);
  };

  // Handle room addition
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

  // Handle room deletion
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

  // Define table columns
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
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <span>
          <Button onClick={() => showDetail(record)}>Edit</Button>
          <Popconfirm
            title="Are you sure to delete this room?"
            onConfirm={() => handleDeleteRoom(record.id)}
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </span>
      ),
    },
  ];

  return (
    <div>
      <Select
        placeholder="Select a Building"
        style={{ width: 200, marginBottom: 20 }}
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
        style={{ marginBottom: 20 }}
      >
        <Form.Item
          label="Room Number"
          name="roomNumber"
          rules={[{ required: true, message: "Please input room number!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Room Type"
          name="roomType"
          rules={[{ required: true, message: "Please input room type!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Area (sqm)"
          name="area"
          rules={[{ required: true, message: "Please input area!" }]}
        >
          <Input type="number" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
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

      {/* Modal for editing room */}
      <Modal
        title="Room Details"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Room Number" name="roomNumber">
            <Input />
          </Form.Item>
          <Form.Item label="Room Type" name="roomType">
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
