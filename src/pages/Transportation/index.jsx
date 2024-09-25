import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, message } from "antd";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "../../Services/firebase"; // Đảm bảo đường dẫn đúng

const { Option } = Select;

export default function VehicleRegistrationForm() {
  const [vehicleType, setVehicleType] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Fetch current user data and set it to the form
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          form.setFieldsValue(data);
        }
      }
    };
    fetchUserData();
  }, [form]);

  const handleSubmit = async (values) => {
    console.log("Form submitted with values:", values);
    const currentUser = auth.currentUser;
    if (!currentUser) {
      message.error("Người dùng chưa đăng nhập!");
      return;
    }

    setLoading(true);

    try {
      // Tạo dữ liệu phương tiện
      const vehicleData = {
        userId: currentUser.uid,
        vehicleType: values.vehicleType,
        licensePlate: values.licensePlate,
        description: values.description,
        createdAt: new Date(),
      };

      // Thêm phương tiện vào collection "vehicles"
      const docRef = await addDoc(collection(db, "vehicles"), vehicleData);
      console.log("Document written with ID: ", docRef.id);

      // Cập nhật tài liệu người dùng với chi tiết phương tiện
      const userDocRef = doc(db, "Users", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      const vehicleInfo = {
        vehicleId: docRef.id, // ID của phương tiện
        ...vehicleData, // Dữ liệu của phương tiện
      };

      if (userDocSnap.exists()) {
        // Nếu tài liệu người dùng đã tồn tại, cập nhật mảng vehicles
        const userVehicles = userDocSnap.data().vehicles || [];
        await updateDoc(userDocRef, {
          vehicles: [...userVehicles, vehicleInfo], // Cập nhật danh sách phương tiện với cả ID và dữ liệu
        });
      } else {
        // Nếu tài liệu người dùng chưa tồn tại, tạo mới
        await setDoc(userDocRef, {
          email: currentUser.email,
          vehicles: [vehicleInfo],
          createdAt: new Date(),
          // Thêm các trường khác nếu cần
        });
      }

      message.success("Đăng ký phương tiện thành công!");

      // Reset các trường nhập liệu
      form.resetFields();
    } catch (error) {
      console.error("Error adding document: ", error);
      message.error("Có lỗi xảy ra khi đăng ký phương tiện.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      name="vehicle_registration"
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Form.Item
        label="Chọn loại phương tiện"
        name="vehicleType"
        rules={[{ required: true, message: "Vui lòng chọn loại phương tiện!" }]}
      >
        <Select
          placeholder="Chọn loại phương tiện"
          onChange={(value) => setVehicleType(value)}
        >
          <Option value="motorbike">Xe máy</Option>
          <Option value="car">Ô tô</Option>
          <Option value="bicycle">Xe đạp</Option>
          <Option value="electric_bicycle">Xe đạp điện</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Biển số xe"
        name="licensePlate"
        rules={[{ required: true, message: "Vui lòng nhập biển số xe!" }]}
      >
        <Input placeholder="Nhập biển số xe" />
      </Form.Item>

      <Form.Item label="Mô tả thêm" name="description">
        <Input.TextArea placeholder="Nhập mô tả (nếu có)" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Đăng ký
        </Button>
      </Form.Item>
    </Form>
  );
}
