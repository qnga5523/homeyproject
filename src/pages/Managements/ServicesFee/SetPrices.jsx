import React, { useState, useEffect } from "react";
import { Table, Button, Form, InputNumber, message } from "antd";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../../Services/firebase";
import moment from "moment"; // Thêm moment.js để định dạng thời gian

export default function SetPrices() {
  const [form] = Form.useForm();
  const [serviceData, setServiceData] = useState([]);
  const [waterData, setWaterData] = useState([]);
  const [parkingData, setParkingData] = useState([]);

  // Load dữ liệu từ Firestore khi component được render
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "prices"));
        const pricesData = querySnapshot.docs.map((doc) => doc.data());

        // Kiểm tra nếu có dữ liệu trong Firestore
        if (pricesData.length > 0) {
          setServiceData(pricesData[0].serviceData);
          setWaterData(pricesData[0].waterData);
          setParkingData(pricesData[0].parkingData);
        }
      } catch (error) {
        console.error("Error fetching prices data: ", error);
        message.error("Failed to fetch prices data");
      }
    };

    fetchData();
  }, []); // Chạy khi component lần đầu render

  const columns = [
    {
      title: "Service Type",
      dataIndex: "feeType",
      key: "feeType",
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
    },
    {
      title: "Price (VNĐ)",
      dataIndex: "price",
      key: "price",
      render: (_, record) => (
        <Form.Item name={`price-${record.key}`} initialValue={record.price}>
          <InputNumber
            min={0}
            formatter={(value) => `${value} VNĐ`}
            parser={(value) => value.replace(" VNĐ", "")}
          />
        </Form.Item>
      ),
    },
    {
      title: "Last Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (updatedAt) =>
        updatedAt ? moment(updatedAt).format("DD/MM/YYYY HH:mm:ss") : "No data", // Hiển thị thời gian theo định dạng
    },
  ];

  const onFinish = async (values) => {
    try {
      const pricesCollectionRef = collection(db, "prices");

      const updatedServiceData = serviceData.map((item) => ({
        ...item,
        price: values[`price-${item.key}`],
        updatedAt: new Date().toISOString(), // Cập nhật thời gian khi thay đổi giá
      }));

      const updatedWaterData = waterData.map((item) => ({
        ...item,
        price: values[`price-${item.key}`],
        updatedAt: new Date().toISOString(),
      }));

      const updatedParkingData = parkingData.map((item) => ({
        ...item,
        price: values[`price-${item.key}`],
        updatedAt: new Date().toISOString(),
      }));

      // Lưu dữ liệu vào Firestore
      await addDoc(pricesCollectionRef, {
        serviceData: updatedServiceData,
        waterData: updatedWaterData,
        parkingData: updatedParkingData,
      });

      message.success("Prices submitted successfully!");
    } catch (error) {
      console.error("Error submitting prices: ", error);
      message.error("Failed to submit prices");
    }
  };

  return (
    <Form form={form} onFinish={onFinish}>
      {/* Bảng Phí Dịch Vụ */}
      <h3>Phí Dịch Vụ</h3>
      <Table dataSource={serviceData} columns={columns} pagination={false} />

      {/* Bảng Tiền Nước */}
      <h3>Tiền Nước</h3>
      <Table dataSource={waterData} columns={columns} pagination={false} />

      {/* Bảng Tiền Gửi Xe */}
      <h3>Tiền Gửi Xe</h3>
      <Table dataSource={parkingData} columns={columns} pagination={false} />

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit Prices
        </Button>
      </Form.Item>
    </Form>
  );
}
