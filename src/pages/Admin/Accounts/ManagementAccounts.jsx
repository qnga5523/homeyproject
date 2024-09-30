import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  Popconfirm,
  message,
  Modal,
  Descriptions,
  Spin,
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
import { Content } from "antd/es/layout/layout";


export default function ManagementAccount() {
  const [users, setUsers] = useState([]);
  const [buildings, setBuildings] = useState({});
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [roomDetails, setRoomDetails] = useState(null);
  const [loadingRoom, setLoadingRoom] = useState(false);

  useEffect(() => {
    fetchBuildings();
    fetchUsers();
  }, []);

  // Fetch all buildings and create a mapping from name to ID
  const fetchBuildings = async () => {
    try {
      const buildingSnapshot = await getDocs(collection(db, "buildings"));
      const buildingMap = {};
      buildingSnapshot.forEach((doc) => {
        const data = doc.data();
        buildingMap[data.name] = doc.id;
      });
      setBuildings(buildingMap);
    } catch (error) {
      console.error("Error fetching buildings: ", error);
      message.error("Failed to fetch buildings.");
    }
  };

  // Fetch all users with role 'owner'
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "Users"));
      const usersList = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.role === "owner") {
          usersList.push({ ...data, id: doc.id });
        }
      });
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users: ", error);
      message.error("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  // Handle user deletion
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

  // Fetch and display room details
  const handleViewDetail = async (user) => {
    const { building, room } = user;

    if (!building || !room) {
      message.error("Building or Room information is missing.");
      return;
    }

    const buildingId = buildings[building];

    if (!buildingId) {
      message.error("Building not found.");
      return;
    }

    setLoadingRoom(true);
    setIsModalVisible(true);

    try {
      // Query to find the room with the specific roomNumber and buildingId
      const roomsRef = collection(db, "rooms");
      const q = query(
        roomsRef,
        where("buildingId", "==", buildingId),
        where("roomNumber", "==", room),
        limit(1) // Assuming room numbers are unique within a building
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

  // Helper function to get building name from ID
  const buildingNameFromId = (id) => {
    const entry = Object.entries(buildings).find(
      ([name, buildingId]) => buildingId === id
    );
    return entry ? entry[0] : "Unknown Building";
  };

  // Define table columns
  const columns = [
    {
      title: "Username",
      dataIndex: "Username",
      key: "Username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone Number",
      dataIndex: "Phone",
      key: "Phone",
    },
    {
      title: "Apartment",
      dataIndex: "room", // Corrected to lowercase
      key: "room",
      render: (text, record) => (
        <Button type="link" onClick={() => handleViewDetail(record)}>
          {text}
        </Button>
      ),
    },
    {
      title: "Building",
      dataIndex: "building",
      key: "building",
    },
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
    
    <div>
      <h2>Manage Accounts</h2>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        bordered
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* Modal for displaying room details */}
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
            <Descriptions.Item label="Building">
              {buildingNameFromId(roomDetails.buildingId)}
            </Descriptions.Item>
            {/* Add more fields as necessary */}
          </Descriptions>
        ) : (
          <p>No details available for this room.</p>
        )}
      </Modal>
    </div>
   
  );
}
