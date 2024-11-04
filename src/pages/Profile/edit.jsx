import React, { useState, useEffect } from "react";
import { Form, Input, Button, Upload, message, Image } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { auth, db, storage } from "../../Services/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function EditProfile({ profile, onProfileUpdate, setIsEditing }) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [currentAvatar, setCurrentAvatar] = useState(profile.avatarUrl || "");

  useEffect(() => {
    form.setFieldsValue({
      ...profile,
      members: profile.members ? profile.members.join(", ") : "", 
    });
  }, [form, profile]);

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
        const membersArray = values.members
        ? values.members.split(",").map((member) => member.trim())
        : [];

        const userRef = doc(db, "Users", user.uid);
        await updateDoc(userRef, {
          ...values,
          avatarUrl: avatarUrl,
          members: membersArray,
        });

        message.success("Profile updated successfully");
        onProfileUpdate();
      }
    } catch (error) {
      message.error("Failed to update profile");
      console.error("Error updating profile:", error);
    }
  };

  const handleChange = ({ fileList }) => {
    setFileList(fileList);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-lg mx-auto">
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Profile Photo">
          <div className="flex items-center">
            {currentAvatar ? (
              <Image width={100} height={100} src={currentAvatar} alt="Avatar" style={{ borderRadius: "50%" }} />
            ) : (
              <div
                style={{
                  fontSize: "100px",
                  color: "#d9d9d9",
                  borderRadius: "50%",
                  width: "100px",
                  height: "100px",
                  backgroundColor: "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UploadOutlined />
              </div>
            )}
            <div className="ml-4">
              <Upload
                listType="picture"
                accept="image/*"
                beforeUpload={() => false}
                onChange={handleChange}
                fileList={fileList}
              >
                <Button icon={<UploadOutlined />} type="primary" shape="round">
                  Upload New Avatar
                </Button>
              </Upload>
            </div>
          </div>
        </Form.Item>
        <Form.Item label="Username" name="Username" rules={[{ required: true, message: "Please enter your username" }]}>
          <Input placeholder="Enter your username" />
        </Form.Item>
        <Form.Item label="Email" name="email" rules={[{ required: true, message: "Please enter your email" }]}>
          <Input type="email" placeholder="Enter your email" />
        </Form.Item>
        <Form.Item label="Phone Number" name="Phone" rules={[{ required: true, message: "Please enter your phone number" }]}>
          <Input placeholder="Enter your phone number" />
        </Form.Item>
        <Form.Item label="Apartment" name="room" rules={[{ required: true, message: "Please enter your room number" }]}>
          <Input placeholder="Enter your apartment room number" />
        </Form.Item>
        <Form.Item label="Building" name="building" rules={[{ required: true, message: "Please enter your building" }]}>
          <Input placeholder="Enter your building name" />
        </Form.Item>
        <Form.Item
          label="Members"
          name="members"
          tooltip="Enter members separated by commas (e.g., John, Jane, Doe)"
        >
          <Input placeholder="Enter members (e.g., John, Jane, Doe)" />
        </Form.Item>
        <Form.Item>
          <div className="flex justify-end space-x-4">
            <Button type="primary" htmlType="submit" shape="round">
              Save
            </Button>
            <Button onClick={() => setIsEditing(false)} shape="round" style={{ backgroundColor: "#f5f5f5" }}>
              Cancel
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
}
