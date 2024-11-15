import React, { useState, useEffect } from "react";
import { Button, Typography, Input, Form, Image, message } from "antd";
import { auth, db } from "../../Services/firebase";
import { collection, doc, getDoc, query, where, getDocs } from "firebase/firestore";
import EditProfile from "./edit";
import ChangePassword from "./changepassword";

const { Title, Text } = Typography;

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const profileData = docSnap.data();
          setProfile(profileData);
          fetchRoomInfo(profileData.building, profileData.room);
        } else {
          message.error("User data not found");
        }
      }
    };

    fetchProfile();
  }, []);

  const fetchRoomInfo = async (buildingName, roomNumber) => {
    if (buildingName && roomNumber) {
      try {
        const buildingsCollection = collection(db, "buildings");
        const buildingQuery = query(buildingsCollection, where("name", "==", buildingName));
        const buildingSnapshot = await getDocs(buildingQuery);

        if (buildingSnapshot.empty) {
          message.error("Building not found.");
          return;
        }

        const buildingId = buildingSnapshot.docs[0].id;
        const roomsCollection = collection(db, "rooms");
        const roomQuery = query(
          roomsCollection,
          where("buildingId", "==", buildingId),
          where("roomNumber", "==", roomNumber)
        );

        const roomSnapshot = await getDocs(roomQuery);

        if (!roomSnapshot.empty) {
          setRoomInfo(roomSnapshot.docs[0].data());
        } else {
          message.error("Room information not found.");
        }
      } catch (error) {
        console.error("Error fetching room information:", error);
        message.error("An error occurred while fetching room information.");
      }
    }
  };

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
    <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8">
      {isEditing ? (
        <EditProfile profile={profile} onProfileUpdate={handleProfileUpdate} setIsEditing={setIsEditing} />
      ) : isChangePassword ? (
        <ChangePassword setIsChangePassword={setIsChangePassword} />
      ) : (
        profile && (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg max-w-lg mx-auto">
            <Title level={4} className="text-center sm:text-left">Personal Information</Title>
            <div className="mb-4 flex flex-col items-center sm:flex-row sm:items-start sm:space-x-4">
              <Text>Photo</Text>
              <div className="flex items-center space-x-4">
                {profile.avatarUrl ? (
                  <Image
                    width={100}
                    height={100}
                    src={profile.avatarUrl}
                    alt="Avatar"
                    style={{ borderRadius: "50%" }}
                  />
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
                <Input value={profile.Phone || ""} disabled />
              </Form.Item>
              <Form.Item label="Apartment">
                <Input value={profile.room || ""} disabled />
              </Form.Item>
              <Form.Item label="Building">
                <Input value={profile.building || ""} disabled />
              </Form.Item>
              <Form.Item label="Household members">
                <Input value={profile.members || ""} disabled />
              </Form.Item>
              {roomInfo && (
                <>
                  <Title level={5} style={{ marginTop: "1rem" }}>Room Information</Title>
                  <Form.Item label="Room Type">
                    <Input value={roomInfo.roomType || "N/A"} disabled />
                  </Form.Item>
                  <Form.Item label="Area (sqm)">
                    <Input value={roomInfo.area || "N/A"} disabled />
                  </Form.Item>
                  <Form.Item label="Assets">
                    <Input value={roomInfo.assets ? roomInfo.assets.join(", ") : "N/A"} disabled />
                  </Form.Item>
                </>
              )}
              <div className="flex flex-col sm:flex-row sm:space-x-4 mt-4">
                <Button type="primary" onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
                  Edit Profile
                </Button>
                <Button onClick={() => setIsChangePassword(true)} className="w-full sm:w-auto mt-2 sm:mt-0">
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
