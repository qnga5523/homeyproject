import React, { useEffect, useState } from "react";
import { Table, DatePicker, Select, Input, message, Button, Space, Typography } from "antd";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../Services/firebase";
import moment from "moment";
import columsFee from "../../../components/layout/Colums/columsFee";
import { pdf } from "@react-pdf/renderer";
import InvoiceDocument from "../../../components/common/Invoice/InvoiceDocument";
import sendInvoiceEmail from "../../../components/common/Invoice/sendInvoiceEmail";


const { Title } = Typography;

export default function HistoryFee() {
  const [users, setUsers] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedDate, setSelectedDate] = useState(moment().subtract(1, "month"));
  const [searchTerm, setSearchTerm] = useState("");

  const currentYear = moment().year();

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const buildingsSnapshot = await getDocs(collection(db, "buildings"));
        const fetchedBuildings = buildingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setBuildings(fetchedBuildings);
      } catch (error) {
        message.error("Error loading buildings: " + error.message);
      }
    };

    fetchBuildings();
  }, []);
  const fetchHistoryData = async (building, month, year, searchTerm) => {
    if (!building || !month || !year) return;
    try {
      const usersCollection = collection(
        db,
        "Fees",
        `${month}_${year}`,
        "Buildings",
        building,
        "Users"
      );
      const usersSnapshot = await getDocs(usersCollection);
      const fetchedUsers = [];
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        const userRoom = `${data.username} ${data.room}`.toLowerCase();
        if (userRoom.includes(searchTerm.toLowerCase())) {
          fetchedUsers.push(data);
        }
      });
      if (fetchedUsers.length > 0) {
        setUsers(fetchedUsers);
      } else {
        message.warning("No data available for the selected criteria.");
        setUsers([]);
      }
    } catch (error) {
      message.error("Error fetching data for the selected criteria.");
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleBuildingChange = (value) => {
    setSelectedBuilding(value);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFetchData = () => {
    const month = selectedDate.format("MMMM");
    const year = selectedDate.year();
    fetchHistoryData(selectedBuilding, month, year, searchTerm);
  };

  const handleViewPDF = async (user) => {
    try {
      const blob = await pdf(<InvoiceDocument user={user} />).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      message.error("Error generating PDF: " + error.message);
    }
  };

  const handleSendInvoice = async (user) => {
    try {
      await sendInvoiceEmail(user);
      message.success(`Invoice sent successfully to ${user.email}`);
    } catch (error) {
      message.error("Failed to send invoice: " + error.message);
    }
  };

  const disabledDate = (current) => {
    return current && current.year() > currentYear;
  };

  const columns = [
    ...columsFee(),
    {
      title: "Actions",
      key: "actions",
      render: (_, user) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleViewPDF(user)}>
            View Invoice
          </Button>
          <Button type="primary" onClick={() => handleSendInvoice(user)}>
            Send Invoice
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: "20px" }}>
        History Fee Overview
      </Title>

      <Space direction="horizontal" style={{ marginBottom: 16 }} size="middle">
        <Select
          style={{ width: 200 }}
          placeholder="Select Building"
          onChange={handleBuildingChange}
          options={buildings.map((building) => ({
            value: building.name,
            label: building.name,
          }))}
        />
        <DatePicker
          picker="month"
          value={selectedDate}
          onChange={handleDateChange}
          disabledDate={disabledDate}
        />
        <Input
          placeholder="Search by User or Room"
          value={searchTerm}
          onChange={handleSearch}
          style={{ width: 200 }}
        />
        <Button type="primary" onClick={handleFetchData}>
          Fetch Data
        </Button>
      </Space>

      {users.length > 0 ? (
        <Table
          dataSource={users}
          columns={columns}
          rowKey="id"
          bordered
          scroll={{ x: "max-content" }}
          size="middle"
        />
      ) : (
        <p>No data available. Adjust the filters to view fees.</p>
      )}
    </div>
  );
}
