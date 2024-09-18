import React, { useEffect, useState } from "react";
import { Table, Form, InputNumber } from "antd";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../Services/firebase";

export default function SetFee() {
  const [users, setUsers] = useState([]);
  const [prices, setPrices] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "Users"));
      const users = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.role === "owner") {
          users.push({
            ...data,
            id: doc.id,
          });
        }
      });
      setUsers(users);
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchPrices = async () => {
      const querySnapshot = await getDocs(collection(db, "prices"));
      const pricesData = querySnapshot.docs.map((doc) => doc.data());
      if (pricesData.length > 0) {
        const latestPrices = pricesData[pricesData.length - 1];
        setPrices(latestPrices);
      }
    };
    fetchPrices();
  }, []);

  // Function to recalculate totals when Acreage or Consume are changed
  const handleFieldChange = (value, key, record, field) => {
    const updatedUsers = users.map((user) => {
      if (user.id === record.id) {
        const newData = {
          ...user,
          [field]: value,
        };
        // Recalculate service fee
        const totalService = newData.Acreage * newData.pricesevices;

        // Recalculate water consumption and fee
        const totalConsume = newData.CSC - newData.CSD;
        const totalWater = totalConsume * newData.priceswater;

        // Recalculate parking fees
        const totalCar = newData.amountcar * newData.pricecar;
        const totalMotorbike = newData.amountmotorbike * newData.pricemotorbike;
        const totalElectric = newData.amountelectric * newData.pricelectric;
        const totalBicycle = newData.amountbicycle * newData.pricebicycle;
        const totalParking =
          totalCar + totalMotorbike + totalElectric + totalBicycle;

        // Recalculate total money
        const totalmoney = totalService + totalWater + totalParking;

        return {
          ...newData,
          totalacreage: totalService,
          totalconsume: totalConsume,
          totalwater: totalWater,
          totalcar: totalCar,
          totalmotorbike: totalMotorbike,
          totalelectric: totalElectric,
          totalbicycle: totalBicycle,
          totalmoney,
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
          dataIndex: "Username",
          key: "Username",
          width: 100,
          fixed: "left",
        },
        {
          title: "Room",
          dataIndex: "Room",
          key: "Room",
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
              dataIndex: "pricesevices",
              key: "pricesevices",
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
                  dataIndex: "pricecar",
                  key: "pricecar",
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
                  dataIndex: "pricemotorbike",
                  key: "pricemotorbike",
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
                  dataIndex: "pricelectric",
                  key: "pricelectric",
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
                  dataIndex: "pricebicycle",
                  key: "pricebicycle",
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

  const processedData = users.map((user) => ({
    ...user,
    pricesevices:
      prices?.serviceData.find((service) => service.feeType === "Acreage")
        ?.price || 0,
    priceswater:
      prices?.waterData.find((service) => service.feeType === "Water money")
        ?.price || 0,
    totalacreage:
      user.Acreage *
      (prices?.serviceData.find((service) => service.feeType === "Acreage")
        ?.price || 0),
    totalconsume: user.CSC - user.CSD,
    totalwater:
      (user.CSC - user.CSD) *
      (prices?.waterData.find((service) => service.feeType === "Water money")
        ?.price || 0),
    totalmoney:
      user.Acreage *
        (prices?.serviceData.find((service) => service.feeType === "Acreage")
          ?.price || 0) +
      (user.CSC - user.CSD) *
        (prices?.waterData.find((service) => service.feeType === "Water money")
          ?.price || 0),
  }));

  return prices && users.length > 0 ? (
    <Table
      columns={columns}
      dataSource={processedData}
      bordered
      size="middle"
      scroll={{
        x: "calc(700px + 50%)",
        y: 240,
      }}
    />
  ) : (
    <p>Loading prices and users...</p>
  );
}
