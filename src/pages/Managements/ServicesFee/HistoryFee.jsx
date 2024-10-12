import React, {useState} from 'react'
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../Services/firebase";
import moment from "moment";
import { Table, DatePicker, message } from "antd";
import columsFee from "../../../components/layout/Colums/columsFee"; 
export default function HistoryFee() {
  const [users, setUsers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment());

  const fetchHistoryData = async (month, year) => {
    try {
      const usersCollection = collection(
        db,
        "Fees",
        `${month}_${year}`,
        "Users"
      );
      const usersSnapshot = await getDocs(usersCollection);
      const fetchedUsers = [];

      usersSnapshot.forEach((doc) => {
        fetchedUsers.push(doc.data());
      });

      if (fetchedUsers.length > 0) {
        setUsers(fetchedUsers);
      } else {
        message.warning("No data available for the selected month and year.");
        setUsers([]);
      }
    } catch (error) {
      message.error("Error fetching data for the selected month and year.");
    }
  };
  const columns = columsFee(); 

  return (
    <div>
      <DatePicker
        picker="month"
        value={selectedDate}
        onChange={(date) => {
          setSelectedDate(date);
          const month = date.format("MMMM");
          const year = date.year();
          fetchHistoryData(month, year); 
        }}
      />

      {users.length > 0 ? (
        <Table
          dataSource={users}
          columns={columns}
          />
      ) : (
        <p>...</p>
      )}
    </div>
  );
}
