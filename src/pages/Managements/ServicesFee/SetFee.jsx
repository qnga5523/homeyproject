import React, { useEffect, useState } from "react";
import { Table, InputNumber } from "antd";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../Services/firebase";

export default function SetFee() {
  const [users, setUsers] = useState([]);
  const [cleanPrice, setCleanPrice] = useState(0);
  const [waterPrice, setWaterPrice] = useState(0);
  const [parkingPrices, setParkingPrices] = useState({});

  useEffect(() => {
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

  const USDollar = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  });

  const columns = [
    {
      title: "Information",

      children: [
        {
          title: "Username",
          dataIndex: "username",
          key: "username",
          width: 100,
          fixed: "left",
        },
        {
          title: "Room",
          dataIndex: "room",
          key: "room",
          width: 100,
          fixed: "left",
        },
        {
          title: "Building",
          dataIndex: "building",
          key: "building",
          width: 100,
          fixed: "left",
        },
      ],
    },
    {
      title: "Statistics table of service fees, water fees and parking fees",
      children: [
        {
          title: "Services Fee",
          children: [
            {
              title: "Area",
              dataIndex: "area",
              key: "area",
              width: 100,
            },
            {
              title: "Price",
              dataIndex: "priceservice",
              key: "priceservice",
              width: 100,
              render: (text) => USDollar.format(text),
            },
            {
              title: "Total",
              dataIndex: "totalarea",
              key: "totalarea",
              width: 100,
              render: (text) => USDollar.format(text),
            },
          ],
        },
        {
          title: "Water money",
          children: [
            {
              title: "CSD",
              dataIndex: "CSD",
              key: "CSD",
              width: 100,
              render: (text, record) => (
                <InputNumber
                  value={record.CSD ?? 0}
                  onChange={(value) => handleFieldChange(value, record, "CSD")}
                />
              ),
            },
            {
              title: "CSC",
              dataIndex: "CSC",
              key: "CSC",
              width: 100,
              render: (text, record) => (
                <InputNumber
                  value={record.CSC ?? 0}
                  onChange={(value) => handleFieldChange(value, record, "CSC")}
                />
              ),
            },
            {
              title: "Consume",
              dataIndex: "totalconsume",
              key: "totalconsume",
              width: 100,
              render: (text) => (text !== undefined ? text : 0),
            },
            {
              title: "Price",
              dataIndex: "priceswater",
              key: "priceswater",
              width: 100,
              render: (text) => USDollar.format(text),
            },
            {
              title: "Total",
              dataIndex: "totalwater",
              key: "totalwater",
              width: 100,
              render: (text) =>
                text !== undefined ? USDollar.format(text) : "$0",
            },
          ],
        },

        {
          title: "Parking Fees",
          children: [
            {
              title: "Car",
              children: [
                {
                  title: "Amount",
                  dataIndex: "carCount",
                  key: "carCount",
                  width: 100,
                },
                {
                  title: "Price",
                  dataIndex: "pricesCar",
                  key: "pricesCar",
                  width: 100,
                  render: (text) => USDollar.format(text),
                },
                {
                  title: "Total",
                  dataIndex: "totalcar",
                  key: "totalcar",
                  width: 100,
                  render: (text) => USDollar.format(text),
                },
              ],
            },
            {
              title: "Motorbike",

              children: [
                {
                  title: "Amount",
                  dataIndex: "motorcycleCount",
                  key: "motorcycleCount",
                  width: 100,
                },
                {
                  title: "Price",
                  dataIndex: "pricesMotorcycle",
                  key: "pricesMotorcycle",
                  width: 100,
                  render: (text) => USDollar.format(text),
                },
                {
                  title: "Total",
                  dataIndex: "totalmotorbike",
                  key: "totalmotorbike",
                  width: 100,
                  render: (text) => USDollar.format(text),
                },
              ],
            },
            {
              title: "Electric motorbikes/Electric bicycles",
              children: [
                {
                  title: "Amount",
                  dataIndex: "electricBicycleCount",
                  key: "electricBicycleCount",
                  width: 100,
                },
                {
                  title: "Price",
                  dataIndex: "pricesElectric",
                  key: "pricesElectric",
                  width: 100,
                  render: (text) => USDollar.format(text),
                },
                {
                  title: "Total",
                  dataIndex: "totalelectric",
                  key: "totalelectric",
                  width: 100,
                  render: (text) => USDollar.format(text),
                },
              ],
            },
            {
              title: "Bicycle",
              children: [
                {
                  title: "Amount",
                  dataIndex: "bicycleCount",
                  key: "bicycleCount",
                  width: 100,
                },
                {
                  title: "Price",
                  dataIndex: "pricesBicycle",
                  key: "pricesBicycle",
                  width: 100,
                  render: (text) => USDollar.format(text),
                },
                {
                  title: "Total",
                  dataIndex: "totalbicycle",
                  key: "totalbicycle",
                  width: 100,
                  render: (text) => USDollar.format(text),
                },
              ],
            },
          ],
        },
      ],
    },
    {
      title: "Total Fee",
      dataIndex: "totalmoney",
      key: "totalmoney",
      width: 150,
      fixed: "right",
      render: (text) => USDollar.format(text),
    },
  ];

  return users.length > 0 ? (
    <Table
      columns={columns}
      dataSource={users}
      bordered
      size="middle"
      rowKey="id"
    />
  ) : (
    <p>Loading users and prices...</p>
  );
}
