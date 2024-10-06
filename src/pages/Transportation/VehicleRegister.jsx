import React, { useState } from "react";
import { Form, Input, Button, Select, message, Upload, Progress } from "antd";
import { collection, doc, setDoc } from "firebase/firestore";
import { db, auth, storage } from "../../Services/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { UploadOutlined } from "@ant-design/icons";

const { Option } = Select;

export default function VehicleRegister() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageUpload = (file) => {
    setImageFile(file);
  };

  const handleSubmit = async (values) => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      message.error("Bạn chưa đăng nhập!");
      return;
    }

    const userId = currentUser.uid;
    const requestDocRef = doc(collection(db, "Vehicle"));

    const vehicleData = {
      userId,
      vehicleType: values.vehicleType,
      licensePlate: values.licensePlate,
      description: values.description || "",
      status: "pending",
    };

    setLoading(true);

    if (imageFile) {
      const storageRef = ref(
        storage,
        `vehicle_images/${userId}/${imageFile.name}`
      );
      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Image upload error:", error);
          message.error("Tải lên hình ảnh thất bại. Vui lòng thử lại.");
          setLoading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          vehicleData.imageUrl = downloadURL;

          try {
            await setDoc(requestDocRef, vehicleData);
            message.success("Đăng ký xe thành công, đang chờ phê duyệt!");
            form.resetFields();
            setImageFile(null);
            setUploadProgress(0);
          } catch (error) {
            console.error("Error saving document:", error);
            message.error("Đăng ký xe thất bại. Vui lòng thử lại.");
          } finally {
            setLoading(false);
          }
        }
      );
    } else {
      try {
        await setDoc(requestDocRef, vehicleData);
        message.success("Đăng ký xe thành công, đang chờ phê duyệt!");
        form.resetFields();
      } catch (error) {
        console.error("Error saving document:", error);
        message.error("Đăng ký xe thất bại. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    }
  };

  const beforeImageUpload = (file) => {
    const isImageValid =
      file.type === "image/jpeg" || file.type === "image/png";
    const isLt2M = file.size / 1024 / 1024 < 2;

    if (!isImageValid) {
      message.error("Chỉ hỗ trợ tệp JPEG/PNG!");
    }

    if (!isLt2M) {
      message.error("Hình ảnh phải nhỏ hơn 2MB!");
    }

    return isImageValid && isLt2M;
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item
        label="Chọn loại phương tiện"
        name="vehicleType"
        rules={[{ required: true, message: "Vui lòng chọn loại phương tiện!" }]}
      >
        <Select placeholder="Chọn loại phương tiện">
          <Option value="motorbike">Xe máy</Option>
          <Option value="car">Ô tô</Option>
          <Option value="bicycle">Xe đạp</Option>
          <Option value="electric_bicycle">Xe đạp điện</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Biển số xe"
        name="licensePlate"
        rules={[
          { required: true, message: "Vui lòng nhập biển số xe!" },
          { min: 5, message: "Biển số phải có ít nhất 5 ký tự!" },
        ]}
      >
        <Input placeholder="Nhập biển số xe" />
      </Form.Item>

      <Form.Item label="Mô tả thêm" name="description">
        <Input.TextArea placeholder="Nhập mô tả (nếu có)" />
      </Form.Item>

      <Form.Item label="Hình ảnh xe" name="vehicleImage">
        <Upload
          beforeUpload={beforeImageUpload}
          showUploadList={false}
          customRequest={({ file }) => handleImageUpload(file)}
        >
          <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
        </Upload>
        {imageFile && <p>Đã chọn: {imageFile.name}</p>}
        {uploadProgress > 0 && (
          <Progress percent={Math.round(uploadProgress)} />
        )}
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Đăng ký
        </Button>
      </Form.Item>
    </Form>
  );
}
