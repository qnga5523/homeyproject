import React, { useState, useEffect } from "react";
import { Form, Input, Button, Upload, message, Image } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { auth, db, storage } from "../../Services/firebase";
import { doc, updateDoc } from "firebase/firestore";
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
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-lg max-w-lg mx-auto">
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Profile Photo">
          <div className="flex flex-col sm:flex-row items-center sm:space-x-4">
            {currentAvatar ? (
              <Image
                width={80}
                height={80}
                src={currentAvatar}
                alt="Avatar"
                style={{ borderRadius: "50%", objectFit: "cover" }}
                className="mb-2 sm:mb-0"
              />
            ) : (
              <div
                style={{
                  fontSize: "32px",
                  color: "#d9d9d9",
                  borderRadius: "50%",
                  width: "80px",
                  height: "80px",
                  backgroundColor: "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UploadOutlined />
              </div>
            )}
            <Upload
              listType="picture"
              accept="image/*"
              beforeUpload={() => false}
              onChange={handleChange}
              fileList={fileList}
              className="w-full sm:w-auto"
            >
              <Button icon={<UploadOutlined />} type="primary" shape="round" className="mt-2 sm:mt-0">
                Upload New Avatar
              </Button>
            </Upload>
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
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-4">
            <Button type="primary" htmlType="submit" shape="round" className="w-full sm:w-auto">
              Save
            </Button>
            <Button onClick={() => setIsEditing(false)} shape="round" className="w-full sm:w-auto" style={{ backgroundColor: "#f5f5f5" }}>
              Cancel
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
}
