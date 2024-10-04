import React, { useState } from "react";
import { Form, Input, Button, Select, message, Upload } from "antd";
import { auth, storage } from "firebase-admin";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../../Services/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { UploadOutlined } from "@ant-design/icons";
const { Option } = Select;
export default function VehicleShow() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [vehicleType, setVehicleType] = useState(null);
  const [imageFile, setImageFile] = useState(null); // State to store the selected image file

  const handleImageUpload = (file) => {
    setImageFile(file); // Store the selected image file
  };

  const handleSubmit = async (values) => {
    const currentUser = auth.currentUser; // Get the current logged-in user

    if (!currentUser) {
      message.error("Bạn chưa đăng nhập!");
      return;
    }

    const userId = currentUser.uid; // Get the user ID (uid)
    const requestDocRef = doc(collection(db, "VehicleRequests")); // Reference to the new vehicle request document

    const vehicleData = {
      userId, // Store the user ID for admin to know which user submitted the request
      vehicleType: values.vehicleType,
      licensePlate: values.licensePlate,
      description: values.description || "", // Optional description
      status: "pending", // Initial status is 'pending'
    };

    setLoading(true);

    // If an image file is selected, upload it to Firebase Storage
    if (imageFile) {
      const storageRef = ref(
        storage,
        `vehicle_images/${userId}/${imageFile.name}`
      ); // Create a storage reference
      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Handle progress (optional)
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          console.error("Image upload error:", error);
          message.error("Tải lên hình ảnh thất bại. Vui lòng thử lại.");
          setLoading(false);
        },
        async () => {
          // Upload completed successfully, get the download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // Add the image URL to vehicle data
          vehicleData.imageUrl = downloadURL;

          // Now save the vehicle request to Firestore
          await setDoc(requestDocRef, vehicleData);

          message.success("Đăng ký xe thành công, đang chờ phê duyệt!");
          form.resetFields(); // Reset the form fields
          setImageFile(null); // Clear the selected image
          setLoading(false);
        }
      );
    } else {
      // If no image is selected, just save the vehicle request without an image URL
      try {
        await setDoc(requestDocRef, vehicleData); // Save the request to Firestore

        message.success("Đăng ký xe thành công, đang chờ phê duyệt!");
        form.resetFields(); // Reset the form fields
        setLoading(false);
      } catch (error) {
        console.error("Error submitting request: ", error);
        message.error("Đăng ký xe thất bại. Vui lòng thử lại.");
        setLoading(false);
      }
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

      <Form.Item
        label="Hình ảnh xe"
        name="vehicleImage"
        valuePropName="file"
        getValueFromEvent={(e) => e.file}
        rules={[{ required: false }]}
      >
        <Upload
          beforeUpload={(file) => {
            handleImageUpload(file); // Handle the file selection
            return false; // Prevent automatic upload
          }}
          showUploadList={false} // Disable the default upload list UI
        >
          <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
        </Upload>
        {imageFile && <p>Đã chọn: {imageFile.name}</p>}{" "}
        {/* Show selected image file */}
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Đăng ký
        </Button>
      </Form.Item>
    </Form>
  );
}
