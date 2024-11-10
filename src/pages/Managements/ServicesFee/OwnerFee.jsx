import React, { useEffect, useState } from "react";
import { DatePicker, message, Typography, Divider } from "antd";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../Services/firebase";
import moment from "moment";
import { getAuth } from "firebase/auth";

const { Title, Text } = Typography;

export default function OwnerInvoice() {
  const [fees, setFees] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(moment().subtract(1, "months"));
  const [selectedYear, setSelectedYear] = useState(moment().year());
  const [buildingId, setBuildingId] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(0.000043); // Exchange rate as of a certain date
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const fetchUserBuilding = async () => {
    try {
      if (!currentUser) {
        message.error("User not authenticated");
        return;
      }

      const userDocRef = doc(db, "Users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setBuildingId(userData.building); 
        fetchFees(userData.building); 
      } else {
        message.warning("User data not found.");
      }
    } catch (error) {
      message.error("Error fetching user building: " + error.message);
    }
  };

  const fetchFees = async (building) => {
    if (!currentUser || !building) {
      message.error("User or building information is missing.");
      return;
    }
  
    try {
      const month = selectedMonth.format("MMMM");
      const year = selectedYear;

      const userFeeDocRef = doc(
        db,
        "Fees",
        `${month}_${year}`,
        "Buildings",
        building,
        "Users",
        currentUser.uid
      );

      const userFeeDoc = await getDoc(userFeeDocRef);

      if (!userFeeDoc.exists()) {
        message.warning("No data found for this month and year.");
        setFees(null);
        return;
      }

      const userFeeData = { id: userFeeDoc.id, ...userFeeDoc.data() };
      setFees(userFeeData);
    } catch (error) {
      message.error("Error loading fees: " + error.message);
    }
  };

  const convertToUSD = (amountInVND) => (amountInVND * exchangeRate).toFixed(2);

  useEffect(() => {
    fetchUserBuilding();
  }, []);

  useEffect(() => {
    if (buildingId) {
      fetchFees(buildingId);
    }
  }, [selectedMonth, selectedYear, buildingId]);

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto", border: "1px solid #ddd", borderRadius: "8px" }}>
      <DatePicker
        picker="month"
        value={selectedMonth}
        onChange={(date) => setSelectedMonth(date)}
        style={{ marginBottom: 16, display: "block" }}
      />
      
      {fees ? (
        <div>
          <Title level={3} style={{ textAlign: "center" }}>Service Fee Invoice</Title>
          <Text strong>Invoice Date:</Text> <Text>{selectedMonth.format("MMMM")} {selectedYear}</Text>
          <Divider />
          
          <Text strong>Room:</Text> <Text>{fees.room || "N/A"}</Text><br />
          <Text strong>Building:</Text> <Text>{fees.building || "N/A"}</Text>
          <Divider />
          
          <Text strong>Service Breakdown</Text>
          <div style={{ marginLeft: "20px" }}>
            <Text>Area Fee:</Text> <Text>{convertToUSD(fees.totalarea || 0)} USD</Text><br />
            <Text>Water Fee:</Text> <Text>{convertToUSD(fees.totalwater || 0)} USD</Text><br />
            <Text>Parking Fee:</Text> <Text>{convertToUSD(fees.totalParking || 0)} USD</Text><br />
          </div>
          <Divider />
          
          <Text strong>Total Amount Due:</Text> <Text>{convertToUSD(fees.totalmoney || 0)} USD</Text>
          <Divider />

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Text type="secondary">Thank you for your payment!</Text>
          </div>
        </div>
      ) : (
        <Text>No data available for the selected month and year.</Text>
      )}
    </div>
  );
}
