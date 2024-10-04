import React, { useEffect, useState } from "react";
import { Table, InputNumber } from "antd";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../../Services/firebase";

export default function SetFee() {
  const [users, setUsers] = useState([]);
  const [cleanPrice, setCleanPrice] = useState(0);
  const [waterPrice, setWaterPrice] = useState(0);
  const [parkingPrices, setParkingPrices] = useState({});

  useEffect(() => {
    const fetchUsersAndPrices = async () => {
      const usersSnapshot = await getDocs(collection(db, "Users"));
      const fetchedUsers = [];

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        if (userData.role === "owner") {
          // Fetch room information
          const roomsQuery = collection(db, "rooms");
          const roomQuerySnapshot = await getDocs(roomsQuery);
          const roomDoc = roomQuerySnapshot.docs.find(
            (doc) => doc.data().roomNumber === userData.room
          );

          const roomData = roomDoc ? roomDoc.data() : {};
          const area = roomData.area || 0; // Use area from the room or default to 0

          // Push user data with initial service calculation
          fetchedUsers.push({
            id: userDoc.id,
            username: userData.Username,
            room: userData.room,
            building: userData.building,
            area: area, // Assign area from room data
          });
        }
      }

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

      // Update users with service and parking prices and calculate totalarea
      const updatedUsers = fetchedUsers.map((user) => {
        const totalarea = user.area * (defaultCleanPrice?.price || 0); // Calculate total service area price

        return {
          ...user,
          priceservice: defaultCleanPrice?.price || 0, // Assign the clean price
          totalarea: totalarea, // Calculate total service fee immediately
          priceswater: defaultWaterPrice?.price || 0, // Water price
          ...Object.keys(parkingPricesData).reduce((acc, type) => {
            acc[`prices${type}`] = parkingPricesData[type];
            return acc;
          }, {}),
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

        // Recalculate service fee (based on acreage)
        const totalService = newData.area * newData.priceservice;

        // Recalculate water consumption and fee
        const totalConsume = newData.CSC - newData.CSD;
        const totalWater = totalConsume * newData.priceswater;

        // Recalculate parking fees for all vehicle types
        const totalCar = newData.amountcar * newData.pricesCar || 0;
        const totalMotorbike =
          newData.amountmotorbike * newData.pricesMotorcycle || 0;
        const totalElectric =
          newData.amountelectric * newData.pricesElectric || 0;
        const totalBicycle = newData.amountbicycle * newData.pricesBicycle || 0;

        // Calculate total parking fee
        const totalParking =
          totalCar + totalMotorbike + totalElectric + totalBicycle;

        // Recalculate total money
        const totalMoney = totalService + totalWater + totalParking;

        return {
          ...newData,
          totalarea: totalService,
          totalconsume: totalConsume,
          totalwater: totalWater,
          totalcar: totalCar,
          totalmotorbike: totalMotorbike,
          totalelectric: totalElectric,
          totalbicycle: totalBicycle,
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
                  value={record.CSD}
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
                  value={record.CSC}
                  onChange={(value) => handleFieldChange(value, record, "CSC")}
                />
              ),
            },
            {
              title: "Consume",
              dataIndex: "totalconsume",
              key: "totalconsume",
              width: 100,
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
              render: (text) => USDollar.format(text),
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
                  dataIndex: "amountcar",
                  key: "amountcar",
                  width: 100,
                  render: (text, record) => (
                    <InputNumber
                      value={record.amountcar}
                      onChange={(value) =>
                        handleFieldChange(
                          value,

                          record,
                          "amountcar"
                        )
                      }
                    />
                  ),
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
                  dataIndex: "amountmotorbike",
                  key: "amountmotorbike",
                  width: 100,
                  render: (text, record) => (
                    <InputNumber
                      value={record.amountmotorbike}
                      onChange={(value) =>
                        handleFieldChange(
                          value,

                          record,
                          "amountmotorbike"
                        )
                      }
                    />
                  ),
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
                  dataIndex: "amountelectric",
                  key: "amountelectric",
                  width: 100,
                  render: (text, record) => (
                    <InputNumber
                      value={record.amountelectric}
                      onChange={(value) =>
                        handleFieldChange(
                          value,

                          record,
                          "amountelectric"
                        )
                      }
                    />
                  ),
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
                  dataIndex: "amountbicycle",
                  key: "amountbicycle",
                  width: 100,
                  render: (text, record) => (
                    <InputNumber
                      value={record.amountbicycle}
                      onChange={(value) =>
                        handleFieldChange(
                          value,

                          record,
                          "amountbicycle"
                        )
                      }
                    />
                  ),
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
      title: "Total",
      dataIndex: "totalmoney",
      key: "totalmoney",
      width: 100,
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
