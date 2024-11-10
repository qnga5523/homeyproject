import React, { useEffect, useState } from "react";
import { Table, Button, Form, Input, DatePicker } from "antd";
import moment from "moment";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../../../Services/firebase";
export default function PricesClean() {
  const [form] = Form.useForm();
  const [prices, setPrices] = useState([]);
  const [editingPrice, setEditingPrice] = useState(null);  


  useEffect(() => {
    const fetchPrices = async () => {
      const pricesCollection = collection(db, "cleanPrices");
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
      const priceDoc = doc(db, "cleanPrices", editingPrice.id);
      await updateDoc(priceDoc, processedValues);
      setEditingPrice(null);
    } else {
      await addDoc(collection(db, "cleanPrices"), processedValues);
    }
  
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
  
  const handleEditPrice = (record) => {
    setEditingPrice(record);  
  
    form.setFieldsValue({
      volume: record.volume,
      price: record.price,
      date: record.date ? moment(record.date) : null,  
    });
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
      render: (date) => date ? moment(date).format("YYYY-MM-DD HH:mm:ss") : 'No Date', 
    },
    {
      title: "Status",
      dataIndex: "default",
      key: "default",
      render: (_, record) => (
        <div>
          <span>{record.default ? "Default" : "Paused"}</span>
          <Button type="link" onClick={() => setDefaultPrice(record.id)}>
            {record.default ? "Pause" : "Set Default"}
          </Button>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          <Button onClick={() => handleEditPrice(record)}>Edit</Button>
          <Button danger onClick={() => deletePrice(record.id)}>Delete</Button>
          
        </>
      ),
    }
  ];

  return (
    <>
      <Form
        form={form}
        layout="inline"
        onFinish={onFinish}
      >
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
      </Form>
      <Table dataSource={prices} columns={columns} rowKey="id" />
    </>
  );
}

