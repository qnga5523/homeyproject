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
import { Table, Button, Form, Input, DatePicker } from "antd";
import moment from "moment";
export default function PricesWater() {
  const [form] = Form.useForm();
  const [prices, setPrices] = useState([]);
  const [editingPrice, setEditingPrice] = useState(null);  // State cho biết giá nào đang được chỉnh sửa

  // Fetch data from Firestore
  useEffect(() => {
    const fetchPrices = async () => {
      const pricesCollection = collection(db, "waterPrices");
      const priceSnapshot = await getDocs(pricesCollection);
      const priceList = priceSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          date: data.date && typeof data.date.toDate === 'function' ? data.date.toDate() : data.date, // Chuyển đổi nếu là Timestamp
        };
      });
      setPrices(priceList);
    };

    fetchPrices();
  }, []);

  const onFinish = async (values) => {
    // Convert Moment to JS Date if necessary
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
  
    // Fetch updated data
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
  
      // Nếu bản ghi hiện tại là default và người dùng tắt default, nó sẽ về trạng thái "Paused".
      if (price.id === id && price.default) {
        await updateDoc(priceDoc, { default: false });
      } 
      // Nếu bản ghi hiện tại không phải là default, đặt nó về trạng thái "Paused".
      else if (price.id === id) {
        await updateDoc(priceDoc, { default: true });
      } else {
        await updateDoc(priceDoc, { default: false });
      }
    });
  
    await Promise.all(updatedPrices);
  
    // Cập nhật lại danh sách giá sau khi chỉnh sửa
    const pricesCollection = collection(db, "waterPrices");
    const priceSnapshot = await getDocs(pricesCollection);
    const priceList = priceSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    setPrices(priceList);
  };
  
  const handleEditPrice = (record) => {
    setEditingPrice(record);  // Lưu bản ghi đang chỉnh sửa
  
    form.setFieldsValue({
      volume: record.volume,
      price: record.price,
      date: record.date ? moment(record.date) : null,  // Kiểm tra trước khi chuyển thành moment
    });
  };

  // Delete price
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
      render: (text) => `${text} m³`, // Hiển thị giá trị kèm đơn vị m³
    },
    { title: "Price ($)", dataIndex: "price", key: "price" , render: (text) => USDollar.format(text),},
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => date ? moment(date).format("YYYY-MM-DD HH:mm:ss") : 'No Date', // Định dạng ngày tháng nếu có
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
      </Form>
      <Table dataSource={prices} columns={columns} rowKey="id" />
    </>
  );
}