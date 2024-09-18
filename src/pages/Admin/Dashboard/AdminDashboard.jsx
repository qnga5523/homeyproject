import React, { useState, useEffect } from "react";
import SiderAdmin from "../../../components/layout/Admin/SiderAdmin";
import { Layout, Menu, message, theme } from "antd";
import { Link, Outlet, useNavigate } from "react-router-dom";
import AdminAvatar from "../../../components/layout/Admin/AvatarAdmin";
import { auth, db } from "../../../Services/firebase";
import { doc, getDoc } from "firebase/firestore";
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
          const userDocRef = doc(db, "Users", user.uid); // Ensure correct collection path
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
            <Link to={admin?.role === "admin" ? "/admin" : "/"}>Home</Link>
          </Menu.Item>
          <Menu.Item key="about">About us</Menu.Item>
          <Menu.Item key="feature">Features</Menu.Item>
          <Menu.Item key="instruct">Instruction</Menu.Item>
          <Menu.Item key="contact">Contact</Menu.Item>
        </Menu>
        <div style={{ marginLeft: "auto" }}>
          <AdminAvatar />
        </div>
      </Header>

      <Layout>
        <SiderAdmin />

        <Layout style={{ padding: "0 24px 24px", flexGrow: 1 }}>
          {" "}
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