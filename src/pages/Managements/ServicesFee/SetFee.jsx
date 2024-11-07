import React, { useEffect, useState } from "react";
import { Table, Button, message, DatePicker, Input, Select} from "antd";
import { collection, getDocs, query, where, doc, setDoc } from "firebase/firestore";
import { db } from "../../../Services/firebase";
import moment from "moment";
import columsFee from "../../../components/layout/Colums/columsFee"; 
import { useNavigate } from "react-router-dom";


export default function SetFee() {
  const [users, setUsers] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [cleanPrice, setCleanPrice] = useState(0);
  const [waterPrice, setWaterPrice] = useState(0);
  const [parkingPrices, setParkingPrices] = useState({});
  const [selectedDate, setSelectedDate] = useState(moment());
  const [searchRoom, setSearchRoom] = useState("");
  const navigate = useNavigate();
 
  const fetchBuildings = async () => {
    try {
      const buildingsSnapshot = await getDocs(collection(db, "buildings"));
      const fetchedBuildings = buildingsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setBuildings(fetchedBuildings);
    } catch (error) {
      message.error("Error loading buildings: " + error.message);
    }
  };
  useEffect(() => {
    fetchBuildings(); 
  }, []);


  const fetchUsersAndPrices = async () => {
    if (!selectedBuilding) return;
    console.log("fetchUsersAndPrices called for building:", selectedBuilding);

    const usersSnapshot = await getDocs(
      query(collection(db, "Users"), where("building", "==", selectedBuilding))
    );
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
          email: userData.email, 
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
  const handleBuildingChange = (value) => {
    setSelectedBuilding(value);
    fetchUsersAndPrices();
  };

  const handleRoomSearch = (e) => {
    setSearchRoom(e.target.value.toLowerCase());
  };

  const filteredUsers = users.filter((user) =>
    user.room.toLowerCase().includes(searchRoom)
  );
  console.log("Filtered users for table:", filteredUsers);
  const handleSave = async () => {
    try {
      const month = selectedDate.format("MMMM");
      const year = selectedDate.year();
      const day = selectedDate.date();
      const buildingName = selectedBuilding;
      const savedUsers = [];
  
      for (const user of users) {
        const userDocRef = doc(
          db,
          "Fees",
          `${month}_${year}`, 
          "Buildings",
          buildingName, 
          "Users",
          user.id 
        );
  
        const dataToSave = {
          username: user.username,
          email: user.email,
          room: user.room,
          building: user.building,
          area: user.area,
          carCount: user.carCount?? 0,
          motorcycleCount: user.motorcycleCount?? 0,
          electricBicycleCount: user.electricBicycleCount?? 0,
          bicycleCount: user.bicycleCount?? 0,
          CSC: user.CSC?? 0,
          CSD: user.CSD?? 0,
          priceservice: user.priceservice?? 0,
          totalarea: user.totalarea?? 0,
          priceswater: user.priceswater?? 0,
          totalconsume: user.totalconsume?? 0,
          totalwater: user.totalwater?? 0,
          pricesCar: user.pricesCar?? 0,
          pricesMotorcycle: user.pricesMotorcycle?? 0,
          pricesElectric: user.pricesElectric?? 0,
          pricesBicycle: user.pricesBicycle?? 0,
          totalParking: user.totalParking?? 0,
          totalmoney: user.totalmoney?? 0,
          totalCar: user.totalCar?? 0,
          totalBicycle: user.totalBicycle?? 0,
          totalMotorbike: user.totalMotorbike?? 0,
          totalElectric: user.totalElectric?? 0,
          day,
          month,
          year,
        };
  
        await setDoc(userDocRef, dataToSave);
        savedUsers.push({ ...dataToSave, id: user.id });
      }
  
      message.success(`Data successfully saved for the month: ${month} ${year}`);
      navigate("/admin/invoice-review", { state: { users: savedUsers } });
    } catch (error) {
      message.error("Error saving data: " + error.message);
    }
  };
  
  
  const columns = columsFee(handleFieldChange); 
  return (
    <div>
      <DatePicker
        value={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        style={{ marginBottom: 16 }}
      />
      <Select
        style={{ width: 200, marginBottom: 16 }}
        placeholder="Select Building"
        onChange={handleBuildingChange}
        options={buildings.map((building) => ({
          value: building.name,
          label: building.name,
        }))}
      />
      <Button
        type="primary"
        onClick={fetchUsersAndPrices}
        style={{ marginBottom: 16 }}
        disabled={!selectedBuilding}
      >
        Load Building
      </Button>
      <Input
        placeholder="Search by Room"
        value={searchRoom}
        onChange={handleRoomSearch}
        style={{ width: 200, marginBottom: 16, marginLeft: 8 }}
      />
      <Button type="primary" onClick={handleSave} style={{ marginBottom: 16 }}>
        Save Data
      </Button>
      <Table
        columns={columns}
        dataSource={filteredUsers}
        bordered
        size="middle"
        rowKey="id"
      />
    </div>

  );
}