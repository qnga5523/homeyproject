import React, { useState, useEffect } from "react";
import { Avatar, Dropdown, Menu, Button, message } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../../Services/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function AvatarOwner() {
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, "Users", user.uid); // Ensure correct collection path
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setOwner(userDoc.data());
          } else {
            message.error("");
          }
        } else {
          message.error("");
        }
      } catch (error) {
        message.error("Failed to fetch user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerData();
  }, []);

  const handleMenuClick = ({ key }) => {
    if (key === "profile") {
      navigate("/owner/profile");
    } else if (key === "logout") {
      auth
        .signOut()
        .then(() => {
          navigate("/login");
        })
        .catch((error) => {
          message.error("Logout failed.");
        });
    }
  };

  const menuItems = [
    {
      key: "profile",
      icon: <ProfileOutlined />,
      label: "Profile",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      danger: true,
      label: "Logout",
    },
  ];

  const menu = <Menu onClick={handleMenuClick} items={menuItems} />;

  return (
    <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
      <Button shape="circle" size="large" style={{ border: "none" }}>
        {loading ? (
          <UserOutlined style={{ fontSize: "24px" }} />
        ) : (
          <Avatar
            src={owner?.avatarUrl || null}
            icon={!owner?.avatarUrl && <UserOutlined />}
            size={40}
          >
            {!owner?.avatarUrl && owner?.Username
              ? owner.Username.charAt(0).toUpperCase()
              : ""}
          </Avatar>
        )}
      </Button>
    </Dropdown>
  );
}
