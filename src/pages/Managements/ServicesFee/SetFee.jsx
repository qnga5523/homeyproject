import React, { useEffect, useState } from "react";
import { Table, Button, DatePicker, message } from "antd";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import { db } from "../../../Services/firebase";
import moment from "moment";
import columsFee from "../../../components/layout/Colums/columsFee"; // Assuming this component returns the columns structure

export default function SetFee() {
  const [users, setUsers] = useState([]);
  const [cleanPrice, setCleanPrice] = useState(0);
  const [waterPrice, setWaterPrice] = useState(0);
  const [parkingPrices, setParkingPrices] = useState({});
  const [selectedDate, setSelectedDate] = useState(moment()); // For selecting the month and year
  const [isNewData, setIsNewData] = useState(false); // Track if we are creating new data for a month

  // Fetch available months (documents) from Firebase
  useEffect(() => {
    const fetchPrices = async () => {
      // Fetch clean prices, water prices, and parking prices
      const [cleanPricesSnapshot, waterPricesSnapshot, parkingPricesSnapshot] =
        await Promise.all([
          getDocs(collection(db, "cleanPrices")),
          getDocs(collection(db, "waterPrices")),
          getDocs(collection(db, "parkingPrices")),
        ]);

      const cleanPriceData = cleanPricesSnapshot.docs.map((doc) => doc.data());
      const defaultCleanPrice = cleanPriceData.find((price) => price.default);
      setCleanPrice(defaultCleanPrice?.price || 0);

      const waterPriceData = waterPricesSnapshot.docs.map((doc) => doc.data());
      const defaultWaterPrice = waterPriceData.find((price) => price.default);
      setWaterPrice(defaultWaterPrice?.price || 0);

      const parkingPricesData = {};
      parkingPricesSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.vehicleType && data.price) {
          parkingPricesData[data.vehicleType] = data.price;
        }
      });
      setParkingPrices(parkingPricesData);
    };

    fetchPrices();
  }, []);

  // Fetch users, vehicle data, and prices for a selected month and year
  const fetchUsersAndPrices = async (month, year) => {
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

      // If there are no users for the selected month/year, pre-populate users from the "Users" collection
      if (fetchedUsers.length === 0) {
        setIsNewData(true);
        const usersSnapshot = await getDocs(collection(db, "Users"));
        const prePopulatedUsers = [];

        usersSnapshot.forEach((userDoc) => {
          const userData = userDoc.data();
          if (userData.role === "owner") {
            prePopulatedUsers.push({
              id: userDoc.id,
              username: userData.Username,
              room: userData.room,
              building: userData.building,
              area: userData.area || 0,
              totalVehicles: 0,
              carCount: 0,
              motorcycleCount: 0,
              electricBicycleCount: 0,
              bicycleCount: 0,
              priceservice: cleanPrice,
              priceswater: waterPrice,
              pricesCar: parkingPrices.Car || 0,
              totalParking: 0,
              totalmoney: 0,
              CSC: 0, // Leave CSC blank for input
              CSD: 0, // Leave CSD blank for input
            });
          }
        });
        setUsers(prePopulatedUsers);
      } else {
        setIsNewData(false); // If data exists, no need for new data
        setUsers(fetchedUsers);
      }
    } catch (error) {
      message.error("Error fetching data for the selected month and year.");
    }
  };

  // Handle field changes for recalculating fees (specifically for `CSC` and `CSD`)
  const handleFieldChange = (value, record, field) => {
    const updatedUsers = users.map((user) => {
      if (user.id === record.id) {
        const newData = { ...user, [field]: value };

        // Recalculate service fee
        const totalService = newData.area * (newData.priceservice || 0);
        const CSC = newData.CSC ?? 0;
        const CSD = newData.CSD ?? 0;

        // Recalculate water consumption and fee
        const totalConsume = CSC - CSD || 0;
        const totalWater = (totalConsume || 0) * (newData.priceswater || 0);

        // Recalculate parking fees for all vehicle types
        const totalCar = newData.carCount * (parkingPrices.Car || 0);
        const totalMotorbike =
          newData.motorcycleCount * (parkingPrices.Motorcycle || 0);
        const totalElectric =
          newData.electricBicycleCount * (parkingPrices.Electric || 0);
        const totalBicycle =
          newData.bicycleCount * (parkingPrices.Bicycle || 0);

        const totalParking =
          totalCar + totalMotorbike + totalElectric + totalBicycle;

        // Calculate total money
        const totalMoney =
          (totalService || 0) + (totalWater || 0) + (totalParking || 0);

        return {
          ...newData,
          totalarea: totalService,
          totalconsume: totalConsume,
          totalwater: totalWater || 0,
          totalparking: totalParking,
          totalmoney: totalMoney,
        };
      }
      return user;
    });

    setUsers(updatedUsers);
  };

  // Handle saving data to Firebase
  const handleSave = async () => {
    try {
      const month = selectedDate.format("MMMM");
      const year = selectedDate.year();

      // Save each user's fee data under Fees/{month_year}/{userId}
      for (const user of users) {
        const userDocRef = doc(
          db,
          "Fees",
          `${month}_${year}`,
          "Users",
          user.id
        );

        // Prepare the data to be saved
        const dataToSave = {
          username: user.username,
          room: user.room,
          building: user.building,
          area: user.area,
          totalVehicles: user.totalVehicles,
          carCount: user.carCount,
          motorcycleCount: user.motorcycleCount,
          CSC: user.CSC,
          CSD: user.CSD,
          priceservice: user.priceservice,
          totalarea: user.totalarea,
          priceswater: user.priceswater,
          totalconsume: user.totalconsume,
          totalwater: user.totalwater,
          pricesCar: user.pricesCar,
          totalcar: user.totalcar,
          totalmotorbike: user.totalmotorbike,
          totalParking: user.totalParking,
          totalmoney: user.totalmoney,
          month,
          year,
        };

        // Save the user fee data
        await setDoc(userDocRef, dataToSave);
      }

      message.success(
        `Data successfully saved for the month: ${month} ${year}`
      );
    } catch (error) {
      message.error("Error saving data: " + error.message);
    }
  };

  const columns = columsFee(handleFieldChange); // Import columns structure

  return (
    <div>
      <DatePicker
        picker="month"
        value={selectedDate}
        onChange={(date) => {
          setSelectedDate(date);
          const month = date.format("MMMM");
          const year = date.year();
          fetchUsersAndPrices(month, year); // Fetch the data for the selected month and year
        }}
      />

      <Button type="primary" onClick={handleSave} style={{ marginBottom: 16 }}>
        Save Fees Data
      </Button>

      {users.length > 0 ? (
        <Table
          columns={columns}
          dataSource={users}
          bordered
          size="middle"
          rowKey="id"
        />
      ) : (
        <p>No data for the selected month and year. Add new data to save.</p>
      )}
    </div>
  );
}
