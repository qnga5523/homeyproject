import React, { useState, useEffect } from "react";
import { Button, Typography, Input, Form, Upload, Image } from "antd";
import { auth, db } from "../../Services/firebase";
import { doc, getDoc } from "firebase/firestore";
import EditProfile from "./edit";
import ChangePassword from "./changepassword";
import { UploadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangePassword, setIsChangePassword] = useState(false);

  const fetchProfile = async () => {
    const user = auth.currentUser;
    if (user) {
      const docRef = doc(db, "Users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      }
    }
  };

  useEffect(() => {
    fetchProfile(); // Fetch profile data when component mounts
  }, []);

  const handleProfileUpdate = () => {
    fetchProfile(); // Reload the profile data after updating
  };

  return (
    <div className="container mx-auto p-8">
      {isEditing ? (
        <EditProfile
          onProfileUpdate={handleProfileUpdate}
          setIsEditing={setIsEditing}
        />
      ) : isChangePassword ? (
        <ChangePassword setIsChangePassword={setIsChangePassword} />
      ) : (
        profile && (
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl mx-auto">
            <Title level={3}>Profile Information</Title>

            {/* Username and About Section */}
            <Form layout="vertical">
              <Form.Item label="Username">
                <Input value={profile.Username} disabled />
              </Form.Item>

              <Form.Item label="About">
                <Input.TextArea placeholder="Write a few sentences about yourself" />
              </Form.Item>

              {/* Profile and Cover Photo */}
              <div className="mb-4">
                <Text>Photo</Text>
                <div className="flex items-center space-x-4">
                  {profile.avatarUrl ? (
                    <Image
                      width={80}
                      height={80}
                      src={profile.avatarUrl}
                      alt="Avatar"
                      style={{ borderRadius: "50%" }}
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                      <span>No Image</span>
                    </div>
                  )}
                  <Upload>
                    <Button icon={<UploadOutlined />}>Change</Button>
                  </Upload>
                </div>
              </div>

              <div className="mb-4">
                <Text>Cover Photo</Text>
                <Upload.Dragger multiple={false} accept="image/*">
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                  </p>
                  <p>Upload a file or drag and drop</p>
                  <p className="ant-upload-hint">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </Upload.Dragger>
              </div>

              {/* Contact Information */}
              <Title level={4}>Personal Information</Title>

              <Form.Item label="First Name">
                <Input value={profile.firstName || ""} />
              </Form.Item>

              <Form.Item label="Last Name">
                <Input value={profile.lastName || ""} />
              </Form.Item>

              <Form.Item label="Email">
                <Input value={profile.email || ""} disabled />
              </Form.Item>

              <Form.Item label="Phone">
                <Input value={profile.phone || ""} />
              </Form.Item>

              {/* Action Buttons */}
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
