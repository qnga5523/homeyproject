import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { Table, Space, message, Input, Select } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { db } from "../../../Services/firebase";
import emailjs from "emailjs-com"
import { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_USER_ID } from "../Email/EmailReactApi";
import { Typography } from "antd";
const { Option } = Select;
const { Title } = Typography;
export default function RequestAccount() {
  const [owners, setOwners] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [buildings, setBuildings] = useState([]);
  useEffect(() => {
    const fetchOwners = async () => {
      const querySnapshot = await getDocs(collection(db, "Users"));
      const ownerData = [];
      querySnapshot.forEach((doc) => {
        if (doc.data().role === "owner" && !doc.data().approved) {
          ownerData.push({ ...doc.data(), id: doc.id });
        }
      });
      setOwners(ownerData);
      setFilteredOwners(ownerData);
    };
    const fetchBuildings = async () => {
      const buildingSnapshot = await getDocs(collection(db, "buildings"));
      const buildingList = [];
      buildingSnapshot.forEach((doc) => {
        const data = doc.data();
        buildingList.push({ id: doc.id, name: data.name });
      });
      setBuildings(buildingList);
    };

    fetchOwners();
    fetchBuildings();
  }, []);

  const handleApprove = async (id, email) => {
    try {
      await updateDoc(doc(db, "Users", id), { approved: true });
      message.success("Account approved successfully!");
      emailjs
        .send(
          EMAILJS_SERVICE_ID,   
          EMAILJS_TEMPLATE_ID,  
          { to_email: email },  
          EMAILJS_USER_ID       
        )
        .then(
          (response) => {
            console.log("Email sent successfully:", response.status, response.text);
            message.success("Notification email sent to user!");
          },
          (error) => {
            console.error("Failed to send email:", error);
            message.error("Failed to send notification email.");
          }
        );
  
      setOwners(owners.filter((owner) => owner.id !== id));
    } catch (error) {
      console.error("Error approving account:", error);
      message.error("Failed to approve account.");
    }
  };

  const handleReject = async (id) => {
    await deleteDoc(doc(db, "Users", id));
    message.error("Account rejected and deleted.");
    setOwners(owners.filter((owner) => owner.id !== id));
  };
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleBuildingChange = (value) => {
    setSelectedBuilding(value);
  };
  useEffect(() => {
    const filteredData = owners.filter((owner) => {
      const matchesNameOrRoom =
        (owner.Username?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (owner.room?.toString() || "").includes(searchTerm);
      const matchesBuilding = !selectedBuilding || owner.building === selectedBuilding;
      return matchesNameOrRoom && matchesBuilding;
    });
    setFilteredOwners(filteredData);
  }, [searchTerm, selectedBuilding, owners]);

  const columns = [
    { title: "Email", dataIndex: "email", key: "email" },

    { title: "User Name", dataIndex: "Username", key: "Username" },
    {
      title: "Apartment",
      dataIndex: "room",
      key: "room",
    },
    { title: "Building", dataIndex: "building", key: "building" },
    {
      title: "Approved",
      dataIndex: "approved",
      key: "approved",
      render: (approved) => (approved ? "Yes" : "No"),
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <CheckCircleOutlined
            style={{ color: "green", fontSize: "20px", cursor: "pointer" }}
            onClick={() => handleApprove(record.id, record.email)}
          />
          <CloseCircleOutlined
            style={{ color: "red", fontSize: "20px", cursor: "pointer" }}
            onClick={() => handleReject(record.id)}
          />
        </Space>
      ),
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
        Request Account for Owner
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
      <Table dataSource={filteredOwners} columns={columns} rowKey="id" />
    </div>
  );
  
}
