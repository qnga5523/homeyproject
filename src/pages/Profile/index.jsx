import React, { useState, useEffect } from "react";
import { Button, Typography, Input, Form, Upload, Image, message } from "antd";
import { auth, db } from "../../Services/firebase";
import { doc, getDoc } from "firebase/firestore";
import EditProfile from "./edit";
import ChangePassword from "./changepassword";
import { UploadOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangePassword, setIsChangePassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          message.error("User data not found");
        }
      }
    };

    fetchProfile();
  }, []);

  const handleProfileUpdate = async () => {
    const user = auth.currentUser;
    if (user) {
      const docRef = doc(db, "Users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data());
        message.success("Profile updated successfully");
      }
    }
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto p-8">
      {isEditing ? (
        <EditProfile profile={profile} onProfileUpdate={handleProfileUpdate} setIsEditing={setIsEditing} />
      ) : isChangePassword ? (
        <ChangePassword setIsChangePassword={setIsChangePassword} />
      ) : (
        profile && (
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl mx-auto">
             <Title level={4}>Personal Information</Title>
             <div className="mb-4">
                <Text>Photo</Text>
                <div className="flex items-center space-x-4">
                  {profile.avatarUrl ? (
                    <Image width={100} height={100} src={profile.avatarUrl} alt="Avatar" style={{ borderRadius: "50%" }} />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                      <span>No Image</span>
                    </div>
                  )}
                </div>
              </div>
            <Form layout="vertical">
              <Form.Item label="Username">
                <Input value={profile.Username} disabled />
              </Form.Item>
              
              <Form.Item label="Email">
                <Input value={profile.email || ""} disabled />
              </Form.Item>
              <Form.Item label="Phone">
                <Input value={profile.Phone || ""} disabled/>
              </Form.Item>
              <Form.Item label="Apartment">
                <Input value={profile.room || ""} disabled/>
              </Form.Item>
              <Form.Item label="Buiding">
                <Input value={profile.building || ""} disabled/>
              </Form.Item>
              <Form.Item label="Household members">
                <Input value={profile.members || ""} disabled/>
              </Form.Item>
              <div className="flex space-x-4 mt-4">
                <Button type="primary" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
                <Button onClick={() => setIsChangePassword(true)}>
                  Change Password
                </Button>
              </div>
            </Form>
          </div>
        )
      )}
    </div>
  );
}
