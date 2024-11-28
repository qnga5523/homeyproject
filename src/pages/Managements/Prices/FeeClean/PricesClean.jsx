import React, { useEffect, useState } from "react";
import { Table, Button, Form, Input, DatePicker, Tooltip, Typography,Space  } from "antd";
import { EditOutlined, DeleteOutlined, CheckCircleOutlined, PauseCircleOutlined } from "@ant-design/icons";
import moment from "moment";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../../../Services/firebase";
const { Title } = Typography;
export default function PricesClean() {
  const [form] = Form.useForm();
  const [prices, setPrices] = useState([]);
  useEffect(() => {
    const fetchPrices = async () => {
      const pricesCollection = collection(db, "cleanPrices");
      const priceSnapshot = await getDocs(pricesCollection);
      const priceList = priceSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          date: doc.data().date && typeof doc.data().date.toDate === "function"
          ? doc.data().date.toDate()
          : doc.data().date,
        };
      });
      setPrices(priceList);
    };

    fetchPrices();
  }, []);

  const onFinish = async (values) => {

    const processedValues = {
      ...values,
      date: new Date(),
    };   
      await addDoc(collection(db, "cleanPrices"), processedValues);
  
    form.resetFields();
  
    const pricesCollection = collection(db, "cleanPrices");
    const priceSnapshot = await getDocs(pricesCollection);
    const priceList = priceSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    setPrices(priceList);
  };
  
  const setDefaultPrice = async (id) => {
    const updatedPrices = prices.map(async (price) => {
      const priceDoc = doc(db, "cleanPrices", price.id);

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
  

    const pricesCollection = collection(db, "cleanPrices");
    const priceSnapshot = await getDocs(pricesCollection);
    const priceList = priceSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    setPrices(priceList);
  };


  const deletePrice = async (id) => {
    const priceDoc = doc(db, "cleanPrices", id);
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
      title: "M²",
      dataIndex: "area",
      key: "area",
      render: (text) => `${text} M²`, 
    },
    { title: "Price ($)", dataIndex: "price", key: "price" , render: (text) => USDollar.format(text),},
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
      <Title level={2} style={{ marginBottom: "20px" }}>Service Price Management</Title>
      <Form
        form={form}
        layout="inline"
        onFinish={onFinish}
        style={{ marginBottom: "30px", justifyContent: "center" }}
      >
        <Space size="large">
        <Form.Item
          name="area"
          rules={[{ required: true, message: "Please input area!" }]}
        >
          <Input placeholder="M²" />
        </Form.Item>
        <Form.Item
          name="price"
          rules={[{ required: true, message: "Please input price!" }]}
        >
          <Input placeholder="Price" />
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

