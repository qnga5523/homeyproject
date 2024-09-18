import React, { useState, useEffect } from "react";
import { Form, Input, Button, Upload, message, Image } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { auth, db, storage } from "../../Services/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function EditProfile({ onProfileUpdate, setIsEditing }) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [currentAvatar, setCurrentAvatar] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          form.setFieldsValue(data);
          setCurrentAvatar(data.avatarUrl || "");
        }
      }
    };

    fetchUserData();
  }, [form]);

  const handleUpload = async (file) => {
    const user = auth.currentUser;
    const storageRef = ref(storage, `avatars/${user.uid}/${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const onFinish = async (values) => {
    try {
      const user = auth.currentUser;
      if (user) {
        let avatarUrl = currentAvatar;
        if (fileList.length > 0) {
          const file = fileList[0].originFileObj;
          avatarUrl = await handleUpload(file);
        }

        const userRef = doc(db, "Users", user.uid);
        await updateDoc(userRef, {
          Username: values.Username || user.Username,
          email: values.email || user.email,
          Phone: values.Phone || user.Phone,
          room: values.room || user.room,
          building: values.building || user.building,
          avatarUrl: avatarUrl || currentAvatar,
        });

        message.success("Profile updated successfully");

        // Gọi hàm này để tải lại profile trong component `Profile`
        onProfileUpdate();
        setIsEditing(false); // Đóng form edit
      }
    } catch (error) {
      message.error("Failed to update profile");
      console.error("Error updating profile:", error);
    }
  };

  const handleChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Profile Photo">
          {currentAvatar ? (
            <Image
              width={100}
              height={100}
              src={currentAvatar}
              alt="Avatar"
              style={{ borderRadius: "50%" }}
            />
          ) : (
            <div style={{ fontSize: "100px", color: "#d9d9d9" }}>
              <UploadOutlined />
            </div>
          )}
          <Upload
            listType="picture"
            accept="image/*"
            beforeUpload={() => false}
            onChange={handleChange}
            fileList={fileList}
            style={{ marginTop: "10px" }}
          >
            <Button icon={<UploadOutlined />}>Upload New Avatar</Button>
          </Upload>
        </Form.Item>
        <Form.Item
          label="Username"
          name="Username"
          rules={[{ required: true, message: "Please enter your username" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: "Please enter your email" }]}
        >
          <Input type="email" />
        </Form.Item>
        <Form.Item
          label="Phone Number"
          name="Phone"
          rules={[
            { required: true, message: "Please enter your phone number" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Apartment"
          name="room"
          rules={[{ required: true, message: "Please enter your room number" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Building"
          name="building"
          rules={[{ required: true, message: "Please enter your building" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Save
          </Button>
          <Button onClick={handleCancel} style={{ marginLeft: "10px" }}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
