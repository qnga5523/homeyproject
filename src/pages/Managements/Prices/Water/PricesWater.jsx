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
import { Table, Button, Form, Input, DatePicker, Switch, Modal } from "antd";
export default function PricesWater() {
  const [form] = Form.useForm();
  const [prices, setPrices] = useState([]);
  const [editingPrice, setEditingPrice] = useState(null);

  // Fetch data from Firestore
  useEffect(() => {
    const fetchPrices = async () => {
      const pricesCollection = collection(db, "waterPrices");
      const priceSnapshot = await getDocs(pricesCollection);
      const priceList = priceSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setPrices(priceList);
    };

    fetchPrices();
  }, []);

  // Add or Update price
  const onFinish = async (values) => {
    // Convert Moment to JS Date
    const processedValues = {
      ...values,
      date: values.date.toDate(), // Convert Moment to JS Date
    };

    if (editingPrice) {
      const priceDoc = doc(db, "waterPrices", editingPrice.id);
      await updateDoc(priceDoc, processedValues);
      setEditingPrice(null);
    } else {
      await addDoc(collection(db, "waterPrices"), processedValues);
    }
    form.resetFields();
  };

  // Set default price
  const setDefaultPrice = async (id) => {
    const updatedPrices = prices.map(async (price) => {
      const priceDoc = doc(db, "waterPrices", price.id);
      await updateDoc(priceDoc, { default: price.id === id });
    });
    Promise.all(updatedPrices);
  };

  // Delete price
  const deletePrice = async (id) => {
    const priceDoc = doc(db, "waterPrices", id);
    await deleteDoc(priceDoc);
  };

  const columns = [
    { title: "M³", dataIndex: "volume", key: "volume" },
    { title: "Price ($)", dataIndex: "price", key: "price" },
    { title: "Date", dataIndex: "date", key: "date" },
    {
      title: "Default",
      dataIndex: "default",
      key: "default",
      render: (_, record) => (
        <Switch
          checked={record.default}
          onChange={() => setDefaultPrice(record.id)}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          <Button onClick={() => setEditingPrice(record)}>Edit</Button>
          <Button danger onClick={() => deletePrice(record.id)}>
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <>
      <Form
        form={form}
        layout="inline"
        onFinish={onFinish}
        initialValues={editingPrice}
      >
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
        <Form.Item name="default" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
      <Table dataSource={prices} columns={columns} rowKey="id" />
    </>
  );
}
