import React, { useEffect, useState } from "react";
import { Table, Button, DatePicker, message } from "antd";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import { db } from "../../../Services/firebase";
import moment from "moment";
import columsFee from "../../../components/layout/Colums/columsFee"; 

export default function SetFee() {
  const [users, setUsers] = useState([]);
  const [cleanPrice, setCleanPrice] = useState(0);
  const [waterPrice, setWaterPrice] = useState(0);
  const [parkingPrices, setParkingPrices] = useState({});
  const [selectedDate, setSelectedDate] = useState(moment()); 
  const [isNewData, setIsNewData] = useState(false); 

  useEffect(() => {
    const fetchPrices = async () => {    
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
              CSC: 0, 
              CSD: 0, 
            });
          }
        });
        setUsers(prePopulatedUsers);
      } else {
        setIsNewData(false); 
        setUsers(fetchedUsers);
      }
    } catch (error) {
      message.error("Error fetching data for the selected month and year.");
    }
  };

  const handleFieldChange = (value, record, field) => {
    const updatedUsers = users.map((user) => {
      if (user.id === record.id) {
        const newData = { ...user, [field]: value };

 
        const totalService = newData.area * (newData.priceservice || 0);
        const CSC = newData.CSC ?? 0;
        const CSD = newData.CSD ?? 0;

     
        const totalConsume = CSC - CSD || 0;
        const totalWater = (totalConsume || 0) * (newData.priceswater || 0);

      
        const totalCar = newData.carCount * (parkingPrices.Car || 0);
        const totalMotorbike =
          newData.motorcycleCount * (parkingPrices.Motorcycle || 0);
        const totalElectric =
          newData.electricBicycleCount * (parkingPrices.Electric || 0);
        const totalBicycle =
          newData.bicycleCount * (parkingPrices.Bicycle || 0);

        const totalParking =
          totalCar + totalMotorbike + totalElectric + totalBicycle;

       
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

      for (const user of users) {
        const userDocRef = doc(
          db,
          "Fees",
          `${month}_${year}`,
          "Users",
          user.id
        );    
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
        await setDoc(userDocRef, dataToSave);
      }

      message.success(
        `Data successfully saved for the month: ${month} ${year}`
      );
    } catch (error) {
      message.error("Error saving data: " + error.message);
    }
  };

  const columns = columsFee(handleFieldChange); 

  return (
    <div>
      <DatePicker
        picker="month"
        value={selectedDate}
        onChange={(date) => {
          setSelectedDate(date);
          const month = date.format("MMMM");
          const year = date.year();
          fetchUsersAndPrices(month, year); 
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
