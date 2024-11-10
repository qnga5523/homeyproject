import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, message, Upload, Progress, Table } from "antd";
import { collection, doc, setDoc, getDocs, where, query, getDoc } from "firebase/firestore";
import { db, auth, storage } from "../../Services/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

export default function VehicleRegister() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [vehicles, setVehicles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApprovedVehicles = async () => {
      setLoading(true);

      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert("Please log in to view approved vehicles.");
        navigate("/login");
        setLoading(false);
        return;
      }

      const userId = currentUser.uid;
      const q = query(
        collection(db, "Vehicle"),
        where("userId", "==", userId),
        where("status", "==", "approved")
      );

      const querySnapshot = await getDocs(q);
      const approvedVehicles = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      setVehicles(approvedVehicles);
      setLoading(false);
    };

    fetchApprovedVehicles();
  }, [navigate]);

  const handleImageUpload = (file) => {
    setImageFile(file);
  };

  const handleSubmit = async (values) => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      message.error("You are not logged in!");
      return;
    }

    const userId = currentUser.uid;
    const requestDocRef = doc(collection(db, "Vehicle"));

    try {
      const userDoc = await getDoc(doc(db, "Users", userId));
      if (!userDoc.exists()) {
        message.error("User information not found.");
        return;
      }

      const { Username, room, building } = userDoc.data();

      const vehicleData = {
        userId,
        vehicleType: values.vehicleType,
        licensePlate: values.licensePlate,
        description: values.description || "",
        status: "pending",
        Username,
        room,
        building,
      };

      setLoading(true);

      if (imageFile) {
        const storageRef = ref(storage, `vehicle_images/${userId}/${imageFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error("Image upload error:", error);
            message.error("Image upload failed. Please try again.");
            setLoading(false);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            vehicleData.imageUrl = downloadURL;

            await setDoc(requestDocRef, vehicleData);
            message.success("Vehicle registration successful, pending approval!");
            form.resetFields();
            setImageFile(null);
            setUploadProgress(0);
          }
        );
      } else {
        await setDoc(requestDocRef, vehicleData);
        message.success("Vehicle registration successful, pending approval!");
        form.resetFields();
      }
    } catch (error) {
      console.error("Error saving document:", error);
      message.error("Vehicle registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const beforeImageUpload = (file) => {
    const isImageValid = file.type === "image/jpeg" || file.type === "image/png";
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isImageValid) {
      message.error("Only JPEG/PNG files are supported!");
    }
    if (!isLt2M) {
      message.error("Image must be smaller than 2MB!");
    }
    return isImageValid && isLt2M;
  };

  const columns = [
    {
      title: "Vehicle Type",
      dataIndex: "vehicleType",
      key: "vehicleType",
    },
    {
      title: "License Plate",
      dataIndex: "licensePlate",
      key: "licensePlate",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Image",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (text) =>
        text ? <img src={text} alt="vehicle" style={{ width: 100 }} /> : "N/A",
    },
    {
      title: "Username",
      dataIndex: "Username",
      key: "Username",
    },
    {
      title: "Room",
      dataIndex: "room",
      key: "room",
    },
    {
      title: "Building",
      dataIndex: "building",
      key: "building",
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2>Vehicle Registration</h2>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Select Vehicle Type"
          name="vehicleType"
          rules={[{ required: true, message: "Please select vehicle type!" }]}
        >
          <Select placeholder="Select vehicle type">
            <Option value="motorbike">Motorbike</Option>
            <Option value="car">Car</Option>
            <Option value="bicycle">Bicycle</Option>
            <Option value="electric_bicycle">Electric Bicycle</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="License Plate"
          name="licensePlate"
          rules={[
            { required: true, message: "Please enter the license plate!" },
            { min: 5, message: "License plate must be at least 5 characters long!" },
          ]}
        >
          <Input placeholder="Enter license plate" />
        </Form.Item>

        <Form.Item label="Additional Description" name="description">
          <Input.TextArea placeholder="Enter description (if any)" />
        </Form.Item>

        <Form.Item label="Vehicle Image" name="vehicleImage">
          <Upload
            beforeUpload={beforeImageUpload}
            showUploadList={false}
            customRequest={({ file }) => handleImageUpload(file)}
          >
            <Button icon={<UploadOutlined />}>Select Image</Button>
          </Upload>
          {imageFile && <p>Selected: {imageFile.name}</p>}
          {uploadProgress > 0 && <Progress percent={Math.round(uploadProgress)} />}
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Register
          </Button>
        </Form.Item>
      </Form>

      <h2>Approved Vehicles</h2>
      <Table
        columns={columns}
        dataSource={vehicles}
        loading={loading}
        rowKey="id"
        pagination={false}
      />
    </div>
  );
}
