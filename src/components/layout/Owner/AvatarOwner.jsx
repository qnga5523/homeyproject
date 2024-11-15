import React, { useState, useEffect } from "react";
import { Avatar, Dropdown, Menu, Button, message, Card, Typography } from "antd";
import { UserOutlined, LogoutOutlined, ProfileOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../../Services/firebase";
import { doc, getDoc } from "firebase/firestore";

const { Text } = Typography;

export default function AvatarOwner() {
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, "Users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setOwner(userDoc.data());
          } else {
            message.error("User data not found");
          }
        } else {
          message.error("User not authenticated");
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
    if (key === "ownerpassword") {
      navigate("/owner/changepassword");
    } else if (key === "logout") {
      auth.signOut().then(() => navigate("/login")).catch(() => message.error("Logout failed."));
    }
  };

  const userCard = (
    <Card bordered={false} style={{ width: 250 }}>
      <Card.Meta
        avatar={<Avatar src={owner?.avatarUrl || null} icon={!owner?.avatarUrl && <UserOutlined />} />}
        title={<Text strong>{owner?.Username}</Text>}
        description={
          <>
            <Text type="secondary">Owner</Text>
            <br />
            {/* <Text type="secondary">{owner?.email}</Text> */}
          </>
        }
      />
      <Menu onClick={handleMenuClick} style={{ marginTop: 8 }}>
        <Menu.Item key="ownerpassword" icon={<ProfileOutlined />}>
          Change Password
        </Menu.Item>
        <Menu.Item key="logout" icon={<LogoutOutlined />} danger>
          Logout
        </Menu.Item>
      </Menu>
    </Card>
  );

  return (
    <Dropdown overlay={userCard} trigger={["click"]} placement="bottomRight">
      <Button shape="circle" size="large" style={{ border: "none" }}>
        {loading ? (
          <UserOutlined style={{ fontSize: "24px" }} />
        ) : (
          <Avatar
          style={{ marginRight: "40px" }}
            src={owner?.avatarUrl || null}
            icon={!owner?.avatarUrl && <UserOutlined />}
            size={40}
          >
          </Avatar>
        )}
      </Button>
    </Dropdown>
  );
}
