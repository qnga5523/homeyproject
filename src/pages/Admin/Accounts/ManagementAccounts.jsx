import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  Popconfirm,
  message,
  Modal,
  Descriptions,
  Spin,
  Input,
  Select,
  Space
} from "antd";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  limit,
} from "firebase/firestore";
import { db } from "../../../Services/firebase";
import { Typography } from "antd";

const { Title } = Typography;
const { Option } = Select;

export default function ManagementAccount() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [roomDetails, setRoomDetails] = useState(null);
  const [loadingRoom, setLoadingRoom] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("");
  
  const fetchBuildings = async () => {
    try {
      const buildingSnapshot = await getDocs(collection(db, "buildings"));
      const buildingList = [];
      buildingSnapshot.forEach((doc) => {
        const data = doc.data();
        buildingList.push({ id: doc.id, name: data.name });
      });
      setBuildings(buildingList);
    } catch (error) {
      console.error("Error fetching buildings: ", error);
      message.error("Failed to fetch buildings.");
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "Users"));
      const usersList = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.role === "owner" && data.approved === true) {
          usersList.push({ ...data, id: doc.id });
        }
      });
      setUsers(usersList);
      setFilteredUsers(usersList);
    } catch (error) {
      console.error("Error fetching users: ", error);
      message.error("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchBuildings();
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    try {
      await deleteDoc(doc(db, "Users", userId));
      setUsers(users.filter((user) => user.id !== userId));
      message.success("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting user: ", error);
      message.error("Failed to delete user.");
    }
  };

  const handleViewDetail = async (user) => {
    const { building, room } = user;
    if (!building || !room) {
      message.error("Building or Room information is missing.");
      return;
    }
    const buildingId = buildings.find((b) => b.name === building)?.id;
    if (!buildingId) {
      message.error("Building not found.");
      return;
    }
    setLoadingRoom(true);
    setIsModalVisible(true);
    try {
      const roomsRef = collection(db, "rooms");
      const q = query(
        roomsRef,
        where("buildingId", "==", buildingId),
        where("roomNumber", "==", room),
        limit(1)
      );
      const roomSnapshot = await getDocs(q);
      if (roomSnapshot.empty) {
        setRoomDetails(null);
        message.warning("Room details not found.");
      } else {
        const roomData = roomSnapshot.docs[0].data();
        setRoomDetails({
          id: roomSnapshot.docs[0].id,
          ...roomData,
        });
      }
    } catch (error) {
      console.error("Error fetching room details: ", error);
      message.error("Failed to fetch room details.");
    } finally {
      setLoadingRoom(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleBuildingChange = (value) => {
    setSelectedBuilding(value);
  };

  useEffect(() => {
    const filteredData = users.filter((user) => {
      const matchesNameOrRoom =
        (user.Username?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (user.room?.toString() || "").includes(searchTerm);
      const matchesBuilding = !selectedBuilding || user.building === selectedBuilding;
      return matchesNameOrRoom && matchesBuilding;
    });
    setFilteredUsers(filteredData);
  }, [searchTerm, selectedBuilding, users]);
  

  const columns = [
    { title: "Username", dataIndex: "Username", key: "Username", sorter: (a, b) => a.Username.localeCompare(b.Username) },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone Number", dataIndex: "Phone", key: "Phone" },
    {
      title: "Apartment",
      dataIndex: "room",
      key: "room",
      render: (text, record) => (
        <Button type="link" onClick={() => handleViewDetail(record)}>
          {text}
        </Button>
      ),
    },
    { title: "Building", dataIndex: "building", key: "building" },
    {
      title: "Action",
      key: "action",
      render: (_, user) => (
        <Popconfirm
          title="Are you sure you want to delete this user?"
          onConfirm={() => handleDelete(user.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button danger>Delete</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
      <Title level={2} style={{ textAlign: "center", fontWeight: "bold", marginBottom: "20px" }}>
        Management Accounts
      </Title>
      <Space style={{ marginBottom: 16 }}>
        <Input placeholder="Search by name or room" value={searchTerm} onChange={handleSearch} />
        <Select
          placeholder="Select Building"
          value={selectedBuilding}
          onChange={handleBuildingChange}
          allowClear
          style={{ width: 200 }}
        >
          {buildings.map((building) => (
            <Option key={building.id} value={building.name}>
              {building.name}
            </Option>
          ))}
        </Select>
      </Space>
      <Table columns={columns} dataSource={filteredUsers} rowKey="id" bordered loading={loading} pagination={{ pageSize: 10 }} />
      <Modal
        title="Room Details"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
        ]}
      >
        {loadingRoom ? (
          <Spin tip="Loading..." />
        ) : roomDetails ? (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Room Number">
              {roomDetails.roomNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Room Type">
              {roomDetails.roomType}
            </Descriptions.Item>
            <Descriptions.Item label="Area (sqm)">
              {roomDetails.area}
            </Descriptions.Item>
           
          </Descriptions>
        ) : (
          <p>No details available for this room.</p>
        )}
      </Modal>
    </div>
  );
}
