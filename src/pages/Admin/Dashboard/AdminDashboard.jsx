import React, { useState, useEffect } from "react";
import { Badge, Layout, Menu, message } from "antd";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { BellOutlined } from "@ant-design/icons"; // Import bell icon
import AdminAvatar from "../../../components/layout/Admin/AvatarAdmin";
import SiderAdmin from "../../../components/layout/Admin/SiderAdmin";
import { auth, db } from "../../../Services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { theme } from "antd";

const { Header, Content } = Layout;

export default function AdminDashboard() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, "Users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setAdmin(userDoc.data());
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

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          background: "#001529",
          padding: "0 20px", // Add padding for better spacing
        }}
      >
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={["1"]}
          style={{
            flex: 1,
            justifyContent: "center",
          }}
        >
          <Menu.Item key="home">
            <Link to="/">Home</Link>
          </Menu.Item>
          <Menu.Item key="about">
            <Link to="/about">About us</Link>
          </Menu.Item>
          <Menu.Item key="feature">
            <Link to="/features">Features</Link>
          </Menu.Item>
          <Menu.Item key="instruct">
            <Link to="/instruct">Instruction</Link>
          </Menu.Item>
          <Menu.Item key="contact">
            <Link to="/contact">Contact</Link>
          </Menu.Item>
        </Menu>

        {/* Notification Bell and Admin Avatar */}
        <div
          style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}
        >
          {/* Notification Bell */}
          <Badge style={{ marginRight: 20 }}>
            {" "}
            {/* Set badge count to 5 as an example */}
            <BellOutlined style={{ fontSize: "24px", color: "#fff" }} />{" "}
            {/* Bell Icon */}
          </Badge>
          {/* Admin Avatar */}
          <AdminAvatar />
        </div>
      </Header>

      <Layout>
        <SiderAdmin />

        <Layout style={{ padding: "0 24px 24px", flexGrow: 1 }}>
          <Content
            style={{
              margin: "24px 0",
              padding: 24,
              minHeight: "calc(100vh - 112px)",
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
