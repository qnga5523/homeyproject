import React, { useState, useEffect } from "react";
import { Avatar, Dropdown, Menu, Button, message } from "antd";
import { UserOutlined, EditOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../../Services/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function AdminAvatar() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const adminRef = doc(db, "Users", user.uid);  // Fetch admin data
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
      navigate("/admin/profile");  // Redirect to admin profile
    } else if (key === "logout") {
      auth.signOut().then(() => {
        navigate("/login");
      });
    }
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="adminprofile" icon={<EditOutlined />}>
        Profile
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} danger>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
      <Button shape="circle" size="large" style={{ border: "none" }}>
        {loading ? (
          <UserOutlined style={{ fontSize: "24px" }} />
        ) : (
          <Avatar
            src={admin?.avatarUrl || null}
            icon={<UserOutlined />}
            size={40}
          />
        )}
      </Button>
    </Dropdown>
  );
}
