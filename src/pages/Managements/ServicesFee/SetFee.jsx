import React, { useEffect, useState } from "react";
import { Table, InputNumber } from "antd";
import { collection, getDocs } from "firebase/firestore";
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
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.role === "owner") {
          fetchedUsers.push({
            id: doc.id,
            username: data.Username,
            room: data.room,
            building: data.building,
            amountService: 0,
            amountWater: 0,
            amountParking: {
              Car: 0,
              Truck: 0,
              Motorcycle: 0,
              Bicycle: 0,
            }, 
          });
        }
      });

      
      const [cleanPricesSnapshot, waterPricesSnapshot, parkingPricesSnapshot] =
        await Promise.all([
          getDocs(collection(db, "cleanPrices")),
          getDocs(collection(db, "waterPrices")),
          getDocs(collection(db, "parkingPrices")),
        ]);

      // Lấy giá clean
      const cleanPriceData = cleanPricesSnapshot.docs.map((doc) => doc.data());
      const defaultCleanPrice = cleanPriceData.find((price) => price.default);
      setCleanPrice(defaultCleanPrice?.price || 0);

      // Lấy giá nước
      const waterPriceData = waterPricesSnapshot.docs.map((doc) => doc.data());
      const defaultWaterPrice = waterPriceData.find((price) => price.default);
      setWaterPrice(defaultWaterPrice?.price || 0);

      // Lấy giá đỗ xe
      const parkingPricesData = parkingPricesSnapshot.docs.reduce(
        (acc, doc) => {
          const data = doc.data();
          acc[data.vehicleType] = data.price; // Giả định rằng mỗi document có trường vehicleType và price
          return acc;
        },
        {}
      );
      setParkingPrices(parkingPricesData);

      // Cập nhật users với giá dịch vụ tương ứng
      const updatedUsers = fetchedUsers.map((user) => ({
        ...user,
        priceservice: defaultCleanPrice?.price || 0,
        priceswater: defaultWaterPrice?.price || 0,
        ...Object.keys(parkingPricesData).reduce((acc, type) => {
          acc[`prices${type}`] = parkingPricesData[type];
          return acc;
        }, {}),
      }));

      setUsers(updatedUsers);
    };

    fetchUsersAndPrices();
  }, []);

  const handleFieldChange = (value, record, field) => {
    const updatedUsers = users.map((user) => {
      if (user.id === record.id) {
        const newData = { ...user, [field]: value };
  
        // Recalculate service fee (based on acreage)
        const totalService = newData.Acreage * newData.priceservice;
  
        // Recalculate water consumption and fee
        const totalConsume = newData.CSC - newData.CSD;
        const totalWater = totalConsume * newData.priceswater;
  
        // Recalculate parking fees for all vehicle types
        const totalCar = newData.amountcar * newData.pricesCar;
        const totalMotorbike = newData.amountmotorbike * newData.pricesMotorcycle;
        const totalElectric = newData.amountelectric * newData.pricesElectric;
        const totalBicycle = newData.amountbicycle * newData.pricesBicycle;
  
        // Calculate total parking fee
        const totalParking = totalCar + totalMotorbike + totalElectric + totalBicycle;
  
        // Recalculate total money
        const totalMoney = totalService + totalWater + totalParking;
  
        return {
          ...newData,
          totalacreage: totalService,
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
              title: "Acreage",
              dataIndex: "Acreage",
              key: "Acreage",
              width: 100,
              render: (text, record) => (
                <InputNumber
                  value={record.Acreage}
                  onChange={(value) =>
                    handleFieldChange(value, "Acreage", record, "Acreage")
                  }
                />
              ),
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
              dataIndex: "totalacreage",
              key: "totalacreage",
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
                  onChange={(value) =>
                    handleFieldChange(value, "CSD", record, "CSD")
                  }
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
                  onChange={(value) =>
                    handleFieldChange(value, "CSC", record, "CSC")
                  }
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
                          "amountcar",
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
                          "amountmotorbike",
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
                          "amountelectric",
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
                          "amountbicycle",
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
