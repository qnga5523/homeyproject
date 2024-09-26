import React, { useState, useEffect } from "react";
import { Button, Typography, Image } from "antd";
import { auth, db } from "../../Services/firebase";
import { doc, getDoc } from "firebase/firestore";
import EditProfile from "./edit";
import ChangePassword from "./changepassword";

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
    <div>
      {isEditing ? (
        <EditProfile
          onProfileUpdate={handleProfileUpdate}
          setIsEditing={setIsEditing}
        />
      ) : isChangePassword ? (
        <ChangePassword setIsChangePassword={setIsChangePassword} />
      ) : (
        profile && (
          <div>
            <Title level={2}>{profile.Username}</Title>
            <Text>Email: {profile.email}</Text>
            <br />
            <Text>Phone: {profile.Phone}</Text>
            <br />
            <Text>Room: {profile.room}</Text>
            <br />
            <Text>Building: {profile.building}</Text>
            <br />
            {profile.avatarUrl && (
              <Image
                width={100}
                height={100}
                src={profile.avatarUrl}
                alt="Avatar"
              />
            )}
            <br />
            <Button type="primary" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
            <Button type="primary" onClick={() => setIsChangePassword(true)}>
              Change Password
            </Button>

          </div>
        )
      )}
    </div>
  );
}
