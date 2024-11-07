import React, { useEffect, useState } from "react";
import { Table, DatePicker, Select, Input, message, Button } from "antd";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../Services/firebase";
import moment from "moment";
import columsFee from "../../../components/layout/Colums/columsFee";

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

  const disabledDate = (current) => {
    return current && current.year() > currentYear;
  };

  const columns = columsFee();

  return (
    <div>
      <Select
        style={{ width: 200, marginRight: 8 }}
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
        style={{ marginRight: 8 }}
      />
      <Input
        placeholder="Search by User or Room"
        value={searchTerm}
        onChange={handleSearch}
        style={{ width: 200, marginRight: 8 }}
      />
      <Button type="primary" onClick={handleFetchData}>
        Fetch Data
      </Button>

      {users.length > 0 ? (
        <Table dataSource={users} columns={columns} rowKey="id" />
      ) : (
        <p>No data available. Adjust the filters to view fees.</p>
      )}
    </div>
  );
}
