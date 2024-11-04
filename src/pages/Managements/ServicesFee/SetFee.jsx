import React, { useEffect, useState } from "react";
import { Table, Button, message, DatePicker, Modal} from "antd";
import { collection, getDocs, query, where, doc, setDoc } from "firebase/firestore";
import { db } from "../../../Services/firebase";
import moment from "moment";
import columsFee from "../../../components/layout/Colums/columsFee"; 
import { useNavigate } from "react-router-dom";


export default function SetFee() {
  const [users, setUsers] = useState([]);
  const [cleanPrice, setCleanPrice] = useState(0);
  const [waterPrice, setWaterPrice] = useState(0);
  const [parkingPrices, setParkingPrices] = useState({});
  const [selectedDate, setSelectedDate] = useState(moment());
  const [isDataSaved, setIsDataSaved] = useState(false);
  const navigate = useNavigate();

  const fetchUsersAndPrices = async () => {
    const usersSnapshot = await getDocs(collection(db, "Users"));
    const fetchedUsers = [];
    const roomsSnapshot = await getDocs(collection(db, "rooms"));

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      if (userData.role === "owner") {
        const roomDoc = roomsSnapshot.docs.find(
          (doc) => doc.data().roomNumber === userData.room
        );
        const roomData = roomDoc ? roomDoc.data() : {};
        fetchedUsers.push({
          id: userDoc.id,
          username: userData.Username,
          room: userData.room,
          building: userData.building,
          area: roomData.area || 0, 
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

    const mergedUsers = fetchedUsers.map((user) => ({
      ...user,
      ...groupedVehicles[user.id],
    }));
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

    const updatedUsers = mergedUsers.map((user) => {
      const totalAreaFee = user.area * (defaultCleanPrice?.price || 0);
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
        priceservice: defaultCleanPrice?.price || 0, 
        totalarea: totalAreaFee, 
        priceswater: defaultWaterPrice?.price || 0,
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
    setIsDataSaved(false);
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
      setIsDataSaved(true);
    } catch (error) {
      message.error("Error saving data: " + error.message);
    }
  };
  // Hàm lấy danh sách các tháng, năm đã lưu trong Firestore
  const fetchAvailableDates = async () => {
    try {
      const feesCollection = collection(db, "Fees");
      const feesSnapshot = await getDocs(feesCollection);
      const dates = [];

      feesSnapshot.forEach((doc) => {
        const [month, year] = doc.id.split("_");
        dates.push({ month, year });
      });

      setAvailableDates(dates);
    } catch (error) {
      message.error("Error fetching available dates.");
    }
  };

  // Hàm lấy dữ liệu lịch sử từ Firestore
  const fetchHistoryData = async (month, year) => {
    try {
      const usersCollection = collection(db, "Fees", `${month}_${year}`, "Users");
      const usersSnapshot = await getDocs(usersCollection);
      const fetchedUsers = [];

      usersSnapshot.forEach((doc) => {
        fetchedUsers.push(doc.data());
      });

      if (fetchedUsers.length > 0) {
        setUsers(fetchedUsers);
        setIsDataSaved(true); // Đặt trạng thái là đã lưu
      } else {
        message.warning("No data available for the selected month and year.");
        setUsers([]);
        setIsDataSaved(false);
      }
    } catch (error) {
      message.error("Error fetching data for the selected month and year.");
    }
  };

  useEffect(() => {
    fetchAvailableDates(); // Lấy các tháng năm có dữ liệu khi component được tải
  }, []);
  
  const handleReviewInvoice = () => {
    if (!isDataSaved) {
      message.warning("Please save the data before reviewing the invoice.");
      return;
    }

    const simpleUsers = users.map(user => ({
      ...user,
      selectedDate: selectedDate ? selectedDate.format("YYYY-MM-DD") : "", 
    }));

    navigate("/admin/invoice-review", { state: { users: simpleUsers } });
  };
  
  const columns = columsFee(handleFieldChange); 

  return (
    <div>
  <DatePicker
    value={selectedDate}
    onChange={(date) => setSelectedDate(date)} 
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
  <Button
  type="primary"
  onClick={handleReviewInvoice}
  style={{ marginBottom: 16 }}
  disabled={!isDataSaved} 
>
  Review Invoice
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
