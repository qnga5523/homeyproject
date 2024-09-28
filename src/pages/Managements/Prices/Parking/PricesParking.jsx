import React, { useEffect, useState } from "react";
import { Table, Button, Form, Input, DatePicker, Select } from "antd";
import moment from "moment";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../../../Services/firebase";

const { Option } = Select;

export default function PricesParking() {
  const [form] = Form.useForm();
  const [prices, setPrices] = useState([]);
  const [editingPrice, setEditingPrice] = useState(null);

  // Fetch data from Firestore
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
      date: values.date ? values.date.toDate() : null,
    };

    if (editingPrice) {
      const priceDoc = doc(db, "parkingPrices", editingPrice.id);
      await updateDoc(priceDoc, processedValues);
      setEditingPrice(null);
    } else {
      await addDoc(collection(db, "parkingPrices"), processedValues);
    }

    form.resetFields();
    fetchPrices(); // Fetch updated data after submit
  };

  const handleEditPrice = (record) => {
    setEditingPrice(record);
    form.setFieldsValue({
      vehicleType: record.vehicleType,
      quantity: record.quantity,
      price: record.price,
      date: record.date ? moment(record.date) : null,
    });
  };
  const setDefaultPrice = async (id) => {
    const updatedPrices = prices.map(async (price) => {
      const priceDoc = doc(db, "parkingPrices", price.id); 
  
      // Chỉ thay đổi trạng thái cho bản ghi có id khớp
      if (price.id === id) {
        // Nếu bản ghi hiện tại là default, tắt nó đi
        if (price.default) {
          await updateDoc(priceDoc, { default: false });
        } else {
          // Nếu không, đặt nó thành default và tắt các bản ghi khác
          await updateDoc(priceDoc, { default: true });
  
          // Tắt trạng thái default cho tất cả các bản ghi khác cùng loại xe
          const otherPrices = prices.filter(p => p.vehicleType === price.vehicleType && p.id !== id);
          await Promise.all(otherPrices.map(otherPrice => {
            const otherPriceDoc = doc(db, "parkingPrices", otherPrice.id);
            return updateDoc(otherPriceDoc, { default: false });
          }));
        }
      }
    });
  
    await Promise.all(updatedPrices);
  
    // Cập nhật lại danh sách giá sau khi chỉnh sửa
    fetchPrices(); // Lấy lại dữ liệu mới từ Firestore
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
      <Form form={form} layout="inline" onFinish={onFinish}>
        <Form.Item name="vehicleType" rules={[{ required: true, message: "Please select vehicle type!" }]}>
          <Select placeholder="Select Vehicle Type">
            <Option value="Car">Car</Option>
            <Option value="Truck">Truck</Option>
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
        <Form.Item name="date" rules={[{ required: true, message: "Please select date!" }]}>
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