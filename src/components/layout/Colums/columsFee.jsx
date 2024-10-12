import React from "react";
import { InputNumber } from "antd";

export default function columsFee(handleFieldChange) {
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

  return columns;
}
