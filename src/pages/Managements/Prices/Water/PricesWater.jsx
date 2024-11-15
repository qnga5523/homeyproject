import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../../../Services/firebase";
import { Table, Button, Form, Input, DatePicker, Tooltip, Typography,Space  } from "antd";
import { EditOutlined, DeleteOutlined, CheckCircleOutlined, PauseCircleOutlined } from "@ant-design/icons";
import moment from "moment";

const { Title } = Typography;

export default function PricesWater() {
  const [form] = Form.useForm();
  const [prices, setPrices] = useState([]);
  const [editingPrice, setEditingPrice] = useState(null);  


  useEffect(() => {
    const fetchPrices = async () => {
      const pricesCollection = collection(db, "waterPrices");
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

    fetchPrices();
  }, []);

  const onFinish = async (values) => {

    const processedValues = {
      ...values,
      date: values.date ? values.date.toDate() : null,
    };
  
    if (editingPrice) {
      const priceDoc = doc(db, "waterPrices", editingPrice.id);
      await updateDoc(priceDoc, processedValues);
      setEditingPrice(null);
    } else {
      await addDoc(collection(db, "waterPrices"), processedValues);
    }
  
    form.resetFields();
  

    const pricesCollection = collection(db, "waterPrices");
    const priceSnapshot = await getDocs(pricesCollection);
    const priceList = priceSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    setPrices(priceList);
  };
  
  const setDefaultPrice = async (id) => {
    const updatedPrices = prices.map(async (price) => {
      const priceDoc = doc(db, "waterPrices", price.id);
  

      if (price.id === id && price.default) {
        await updateDoc(priceDoc, { default: false });
      } 
    
      else if (price.id === id) {
        await updateDoc(priceDoc, { default: true });
      } else {
        await updateDoc(priceDoc, { default: false });
      }
    });
  
    await Promise.all(updatedPrices);

    const pricesCollection = collection(db, "waterPrices");
    const priceSnapshot = await getDocs(pricesCollection);
    const priceList = priceSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    setPrices(priceList);
  };
  
  const handleEditPrice = (record) => {
    setEditingPrice(record);  
  
    form.setFieldsValue({
      volume: record.volume,
      price: record.price,
      date: record.date ? moment(record.date) : null,
    });
  };

  const deletePrice = async (id) => {
    const priceDoc = doc(db, "waterPrices", id);
    await deleteDoc(priceDoc);
    setPrices(prices.filter((price) => price.id !== id));
  };
  const USDollar = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  });


  const columns = [
    {
      title: "M³",
      dataIndex: "volume",
      key: "volume",
      render: (text) => `${text} m³`, 
    },
    { title: "Price ($)", dataIndex: "price", key: "price" , render: (text) => USDollar.format(text),},
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => date ? moment(date).format("YYYY-MM-DD HH:mm:ss") : 'No Date', 
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
          <Tooltip title="Edit">
            <Button icon={<EditOutlined />} onClick={() => handleEditPrice(record)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button danger icon={<DeleteOutlined />} onClick={() => deletePrice(record.id)} />
          </Tooltip>
        </Space>
      ),
    }
  ];

  return (
    <div style={{ textAlign: "center" }}>
      <Title level={2} style={{ marginBottom: "20px" }}>Water Price Management</Title>
      <Form
        form={form}
        layout="inline"
        onFinish={onFinish}
        style={{ marginBottom: "30px", justifyContent: "center" }}
      >
        <Space size="large">
          <Form.Item
            name="volume"
            rules={[{ required: true, message: "Please input volume!" }]}
          >
            <Input placeholder="M³" />
          </Form.Item>
          <Form.Item
            name="price"
            rules={[{ required: true, message: "Please input price!" }]}
          >
            <Input placeholder="Price" />
          </Form.Item>
          <Form.Item
            name="date"
            rules={[{ required: true, message: "Please select date!" }]}
          >
            <DatePicker showTime />
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