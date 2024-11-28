import React, { useEffect, useState } from "react";
import { Table, Button, Form, Input, DatePicker, Select ,Tooltip, Typography,Space } from "antd";
import moment from "moment";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { EditOutlined, DeleteOutlined, CheckCircleOutlined, PauseCircleOutlined } from "@ant-design/icons";
import { db } from "../../../../Services/firebase";

const { Option } = Select;
const { Title } = Typography;
export default function PricesParking() {
  const [form] = Form.useForm();
  const [prices, setPrices] = useState([]);

  const fetchPrices = async () => {
    const pricesCollection = collection(db, "parkingPrices");
    const priceSnapshot = await getDocs(pricesCollection);
    const priceList = priceSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        date: data.date && typeof data.date.toDate === 'function' ? data.date.toDate() : data.date,
      };
    });
    setPrices(priceList);
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const onFinish = async (values) => {
    const processedValues = {
      ...values,
      date: new Date(),
    }; 
      await addDoc(collection(db, "parkingPrices"), processedValues);

    form.resetFields();
    fetchPrices();
  };

  const setDefaultPrice = async (id) => {
    const updatedPrices = prices.map(async (price) => {
      const priceDoc = doc(db, "parkingPrices", price.id);  
      if (price.id === id) {
        if (price.default) {
          await updateDoc(priceDoc, { default: false });
        } else {
          await updateDoc(priceDoc, { default: true });
  
          const otherPrices = prices.filter(p => p.vehicleType === price.vehicleType && p.id !== id);
          await Promise.all(otherPrices.map(otherPrice => {
            const otherPriceDoc = doc(db, "parkingPrices", otherPrice.id);
            return updateDoc(otherPriceDoc, { default: false });
          }));
        }
      }
    });
  
    await Promise.all(updatedPrices);  
    fetchPrices(); 
  };
  

  const deletePrice = async (id) => {
    const priceDoc = doc(db, "parkingPrices", id);
    await deleteDoc(priceDoc);
    setPrices(prices.filter((price) => price.id !== id));
  };

  const columns = [
    { title: "Vehicle Type", dataIndex: "vehicleType", key: "vehicleType" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    { title: "Price ($)", dataIndex: "price", key: "price" },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => (date ? moment(date).format("YYYY-MM-DD HH:mm:ss") : "No Date"),
    },
    {
      title: "Status",
      dataIndex: "default",
      key: "default",
      render: (_, record) => (
        <div>
          {record.default ? (
            <CheckCircleOutlined style={{ color: "green" }} />
          ) : (
            <PauseCircleOutlined style={{ color: "gray" }} />
          )}
          <Button type="link" onClick={() => setDefaultPrice(record.id)}>
            {record.default ? "" : "Default"}
          </Button>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Delete">
            <Button danger icon={<DeleteOutlined />} onClick={() => deletePrice(record.id)} />
          </Tooltip>
        </Space>
      ),
    }
  ];

  return (
    <div style={{ textAlign: "center" }}>
    <Title level={2} style={{ marginBottom: "20px" }}>Parking Price Management</Title>
    <Form
      form={form}
      layout="inline"
      onFinish={onFinish}
      style={{ marginBottom: "30px", justifyContent: "center" }}
    >
      <Space size="large">
        <Form.Item name="vehicleType" rules={[{ required: true, message: "Please select vehicle type!" }]}>
          <Select placeholder="Select Vehicle Type">
            <Option value="Car">Car</Option>
            <Option value="Electric">Electric motorbikes/Electric bicycles</Option>
            <Option value="Motorcycle">Motorcycle</Option>
            <Option value="Bicycle">Bicycle</Option>
          </Select>
        </Form.Item>
        <Form.Item name="quantity" rules={[{ required: true, message: "Please input quantity!" }]}>
          <Input placeholder="Quantity" type="number" />
        </Form.Item>
        <Form.Item name="price" rules={[{ required: true, message: "Please input price!" }]}>
          <Input placeholder="Price" type="number" />
        </Form.Item>
        <Form.Item name="date">
            <Input
              disabled
              value={moment().format("YYYY-MM-DD HH:mm:ss")} 
            />
          </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
        </Space>
      </Form>
      <Table dataSource={prices} columns={columns} rowKey="id" />
      </div>
  );
}