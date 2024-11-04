import React, { useState, useEffect } from "react";
import { Avatar, Dropdown, Card, Menu, Button, message, Typography } from "antd";
import { UserOutlined, EditOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../../Services/firebase";
import { doc, getDoc } from "firebase/firestore";

const { Text } = Typography;

export default function AdminAvatar() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const adminRef = doc(db, "Users", user.uid);
          const adminSnap = await getDoc(adminRef);
          if (adminSnap.exists()) {
            setAdmin(adminSnap.data());
          } else {
            message.error("Admin data not found");
          }
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
        message.error("Error fetching admin data");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleMenuClick = ({ key }) => {
    if (key === "adminprofile") {
      navigate("/admin/profile");
    } else if (key === "logout") {
      auth.signOut().then(() => {
        navigate("/login");
      }).catch(() => message.error("Logout failed."));
    }
  };


  const userCard = (
    <Card bordered={false} style={{ width: 250 }}>
      <Card.Meta
        avatar={<Avatar src={admin?.avatarUrl || null} icon={!admin?.avatarUrl && <UserOutlined />} />}
        title={<Text strong>{admin?.Username}</Text>}
        description={
          <>
            <Text type="secondary">Admin</Text>
            <br />
            <Text type="secondary">{admin?.email}</Text>
          </>
        }
      />
      <Menu onClick={handleMenuClick} style={{ marginTop: 8 }}>
        <Menu.Item key="adminprofile" icon={<EditOutlined />}>
          Profile
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
            src={admin?.avatarUrl || null}
            icon={!admin?.avatarUrl && <UserOutlined />}
            size={40}
          >
            {!admin?.avatarUrl && admin?.Username ? admin.Username.charAt(0).toUpperCase() : ""}
          </Avatar>
        )}
      </Button>
    </Dropdown>
  );
}
