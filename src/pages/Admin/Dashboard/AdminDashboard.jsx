import React, { useState, useEffect } from "react";
import SiderAdmin from "../../../components/layout/Admin/SiderAdmin";
import { Layout, Menu, message, theme } from "antd";
import { Link, Outlet, useNavigate } from "react-router-dom";
import AdminAvatar from "../../../components/layout/Admin/AvatarAdmin";
import { auth, db } from "../../../Services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import axios from "axios";
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

  const handleApproveUser = async (userId) => {
    // Cập nhật trạng thái phê duyệt cho người dùng
    await setDoc(doc(db, "Users", userId), { approved: true }, { merge: true });

    // Gửi thông báo cho người dùng
    const userDoc = await getDoc(doc(db, "Users", userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData.notificationToken) {
        await sendNotification(
          userData.notificationToken,
          "Account Approved",
          "Your account has been approved. You can now log in."
        );
      }
    }
  };

  const sendNotification = async (token, title, body) => {
    const message = {
      to: token,
      notification: {
        title: title,
        body: body,
      },
    };

    try {
      await axios.post("https://fcm.googleapis.com/fcm/send", message, {
        headers: {
          Authorization:
            "BOXUgkTO1YvHsnWe-MbwhGn2aKKXgvkiKLnI1BIe5u99F9qJ6Ism7PJnO9dru0w-MSUQx0hCTk6p91N6OXw9lmc",
          "Content-Type": "application/json",
        },
      });
      console.log("Notification sent!");
    } catch (error) {
      console.error("Error sending notification", error);
    }
  };

  // Render danh sách người dùng và nút phê duyệt...

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
