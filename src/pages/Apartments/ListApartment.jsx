import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, Popconfirm } from "antd";
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
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  const [form] = Form.useForm();
  const [addForm] = Form.useForm();

  // Fetch buildings on component mount
  useEffect(() => {
    fetchBuildings();
  }, []);

  // Fetch rooms when building is selected
  useEffect(() => {
    if (selectedBuildingId) {
      fetchRooms(selectedBuildingId);
    } else {
      setRooms([]);
    }
  }, [selectedBuildingId]);

  // Fetch all buildings from Firestore
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

  // Fetch rooms of selected building from Firestore
  const fetchRooms = async (buildingId) => {
    try {
      const roomsCollection = collection(db, "rooms");
      const roomSnapshot = await getDocs(roomsCollection);
      const roomList = roomSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((room) => room.buildingId === buildingId); // Filter rooms by buildingId

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
    } catch (error) {
      console.error("Error updating room:", error);
    }
  };

  // Close modal
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Handle building selection
  const handleBuildingChange = (value) => {
    setSelectedBuildingId(value);
    setRooms([]);
    setSelectedRoom(null);
  };

  // Handle room addition
  const handleAddRoom = async (values) => {
    if (!selectedBuildingId) {
      alert("Please select a building first.");
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
    } catch (error) {
      console.error("Error adding room:", error);
    }
  };

  // Handle room deletion
  const handleDeleteRoom = async (id) => {
    try {
      await deleteDoc(doc(db, "rooms", id));
      fetchRooms(selectedBuildingId);
    } catch (error) {
      console.error("Error deleting room:", error);
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
            <Button type="link">Delete</Button>
          </Popconfirm>
        </span>
      ),
    },
  ];

  return (
    <div>
      {/* Select Building */}
      <Select
        placeholder="Select a Building"
        style={{ width: 200, marginBottom: 20 }}
        onChange={handleBuildingChange}
        allowClear
      >
        {buildings.map((building) => (
          <Option key={building.id} value={building.id}>
            {building.name}
          </Option>
        ))}
      </Select>

      {selectedBuildingId && (
        <div>
          {/* Form to add room */}
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

          {/* Table displaying rooms */}
          <Table
            dataSource={rooms.map((room) => ({
              key: room.id,
              ...room,
            }))}
            columns={columns}
            pagination={false}
          />
        </div>
      )}

      {/* Modal for editing room */}
      <Modal
        title="Room Details"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Room Number" name="roomNumber">
            <Input disabled />
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
