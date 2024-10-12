import React, { useEffect, useState } from "react";
import { Table, Button, message, DatePicker } from "antd";
import { collection, getDocs, query, where, doc, setDoc } from "firebase/firestore";
import { db } from "../../../Services/firebase";
import moment from "moment";
import columsFee from "../../../components/layout/Colums/columsFee"; 

export default function SetFee() {
  const [users, setUsers] = useState([]);
  const [cleanPrice, setCleanPrice] = useState(0);
  const [waterPrice, setWaterPrice] = useState(0);
  const [parkingPrices, setParkingPrices] = useState({});
  const [isNewData, setIsNewData] = useState(false); 
  const [selectedDate, setSelectedDate] = useState(moment());

  const fetchUsersAndPrices = async () => {
    // Fetch user data
    const usersSnapshot = await getDocs(collection(db, "Users"));
    const fetchedUsers = [];

    const roomsSnapshot = await getDocs(collection(db, "rooms"));

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      if (userData.role === "owner") {
        // Find room information
        const roomDoc = roomsSnapshot.docs.find(
          (doc) => doc.data().roomNumber === userData.room
        );
        const roomData = roomDoc ? roomDoc.data() : {};

        // Push user data
        fetchedUsers.push({
          id: userDoc.id,
          username: userData.Username,
          room: userData.room,
          building: userData.building,
          area: roomData.area || 0, // Default to 0
          totalVehicles: 0,
          carCount: 0,
          motorcycleCount: 0,
          electricBicycleCount: 0,
          bicycleCount: 0,
          CSC: 0,
          CSD: 0,
        });
      }
    }

    // Fetch and group vehicle data by userId
    const vehicleQuery = query(
      collection(db, "Vehicle"),
      where("status", "==", "approved")
    );
    const vehicleSnapshot = await getDocs(vehicleQuery);
    const approvedVehicles = [];

    vehicleSnapshot.forEach((doc) => {
      approvedVehicles.push({ ...doc.data(), id: doc.id });
    });

    const groupedVehicles = approvedVehicles.reduce((acc, vehicle) => {
      const userId = vehicle.userId;
      const vehicleType = vehicle.vehicleType;

      if (!acc[userId]) {
        acc[userId] = {
          totalVehicles: 0,
          carCount: 0,
          motorcycleCount: 0,
          electricBicycleCount: 0,
          bicycleCount: 0,
        };
      }

      acc[userId].totalVehicles += 1;
      if (vehicleType === "car") acc[userId].carCount += 1;
      else if (vehicleType === "motorbike") acc[userId].motorcycleCount += 1;
      else if (vehicleType === "electric_bicycle")
        acc[userId].electricBicycleCount += 1;
      else if (vehicleType === "bicycle") acc[userId].bicycleCount += 1;

      return acc;
    }, {});

    // Merge vehicle data with user data
    const mergedUsers = fetchedUsers.map((user) => ({
      ...user,
      ...groupedVehicles[user.id],
    }));

    // Fetch additional price data
    const [cleanPricesSnapshot, waterPricesSnapshot, parkingPricesSnapshot] =
      await Promise.all([
        getDocs(collection(db, "cleanPrices")),
        getDocs(collection(db, "waterPrices")),
        getDocs(collection(db, "parkingPrices")),
      ]);

    // Get clean price
    const cleanPriceData = cleanPricesSnapshot.docs.map((doc) => doc.data());
    const defaultCleanPrice = cleanPriceData.find((price) => price.default);
    setCleanPrice(defaultCleanPrice?.price || 0);

    // Get water price
    const waterPriceData = waterPricesSnapshot.docs.map((doc) => doc.data());
    const defaultWaterPrice = waterPriceData.find((price) => price.default);
    setWaterPrice(defaultWaterPrice?.price || 0);

    // Get parking prices
    const parkingPricesData = {};
    parkingPricesSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.vehicleType && data.price) {
        parkingPricesData[data.vehicleType] = data.price;
      }
    });
    setParkingPrices(parkingPricesData);

    const updatedUsers = mergedUsers.map((user) => {
      // Calculate total area service fee

      const totalAreaFee = user.area * (defaultCleanPrice?.price || 0);

      // Calculate parking fees for each vehicle type
      const totalCar = user.carCount * (parkingPricesData.Car || 0);
      const totalMotorbike =
        user.motorcycleCount * (parkingPricesData.Motorcycle || 0);

      const totalElectric =
        user.electricBicycleCount * (parkingPricesData.Electric || 0);
      const totalBicycle =
        user.bicycleCount * (parkingPricesData.Bicycle || 0);

      const totalParking =
        totalCar + totalMotorbike + totalElectric + totalBicycle;

      return {
        ...user,
        priceservice: defaultCleanPrice?.price || 0, // Assign the clean price
        totalarea: totalAreaFee, // Calculate total service fee immediately
        priceswater: defaultWaterPrice?.price || 0, // Water price
        ...Object.keys(parkingPricesData).reduce((acc, type) => {
          acc[`prices${type}`] = parkingPricesData[type];
          return acc;
        }, {}),

        totalcar: totalCar,
        totalmotorbike: totalMotorbike,
        totalelectric: totalElectric,
        totalbicycle: totalBicycle,
        totalParking,
        totalmoney: totalAreaFee + totalParking,
      };
    });

    setUsers(updatedUsers);
  };

  useEffect(() => {
    fetchUsersAndPrices();
  }, []);

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

  const handleSave = async () => {
    try {
      const month = selectedDate.format("MMMM");
      const year = selectedDate.year();
      const day = selectedDate.date();

      for (const user of users) {
        const userDocRef = doc(db, "Fees", `${month}_${year}`, "Users", user.id);
        const dataToSave = {
          username: user.username,
          room: user.room,
          building: user.building,
          area: user.area,
          carCount: user.carCount,
          motorcycleCount: user.motorcycleCount,
          electricBicycleCount: user.electricBicycleCount,
          bicycleCount: user.bicycleCount,
          CSC: user.CSC,
          CSD: user.CSD,
          priceservice: user.priceservice,
          totalarea: user.totalarea,
          priceswater: user.priceswater,
          totalconsume: user.totalconsume,
          totalwater: user.totalwater,
          pricesCar: user.pricesCar,
          pricesMotorcycle: user.pricesMotorcycle,
          pricesElectric: user.pricesElectric,
          pricesBicycle: user.pricesBicycle,
          totalParking: user.totalParking,
          totalmoney: user.totalmoney,
          day,
          month,
          year,
        };
        await setDoc(userDocRef, dataToSave);
      }

      message.success(`Data successfully saved for the month: ${month} ${year}`);
    } catch (error) {
      message.error("Error saving data: " + error.message);
    }
  };

  const columns = columsFee(handleFieldChange); 

  return (
    <div>
  <DatePicker
    value={selectedDate}
    onChange={(date) => setSelectedDate(date)} // Update selected date
    style={{ marginBottom: 16 }}
  />
  <Button
    type="primary"
    onClick={fetchUsersAndPrices}
    style={{ marginBottom: 16 }}
  >
    Load New Data
  </Button>

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
    <p>No data available. Click "Load New Data" to add new fees.</p>
  )}
</div>

  );
}
