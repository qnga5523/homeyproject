import React, { useEffect, useState } from "react";
import { Layout, Menu, Badge, Dropdown } from "antd";
import { Link } from "react-router-dom";
import { BellOutlined } from "@ant-design/icons";
import AvatarOwner from "../layout/Owner/AvatarOwner";
import logo from "../../assets/img/logo/logo.jpg"; 
import AdminAvatar from "../layout/Admin/AvatarAdmin";
import { auth, db } from "../../Services/firebase";
import { doc, getDoc } from "firebase/firestore";
import NotificationsMenu from "./notificationsMenu";

const { Header } = Layout;

export default function HeaderMain() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchUserRole = async () => {
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          setIsAuthenticated(true);
          const userDocRef = doc(db, "Users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          }
        } else {
          setIsAuthenticated(false);
        }
      });
    };

    fetchUserRole();
  }, []);
  const logoPath = userRole === "admin" ? "/admin" : userRole === "owner" ? "/owner" : "/";


  return (
    <Layout>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          background: "#11354d",
        }}
      >
        <div style={{ marginRight: "18px" }}>
          <Link to={logoPath}>
            <img
              src={logo}
              alt="Logo"
              style={{ height: "50px", width: "auto" }} 
            />
          </Link>
        </div>
        <Menu
          theme=""
          mode="horizontal"
          defaultSelectedKeys={["1"]}
          style={{
            flex: 1,
            justifyContent: "center",
          }}
        >
          <Menu.Item key="home">
            <Link className="text-slate-100 no-underline hover:underline" to="/">Home</Link>
          </Menu.Item>
          <Menu.Item key="about">
            <Link className="text-slate-100 no-underline hover:underline" to="/about">About us</Link>
          </Menu.Item>
          <Menu.Item key="feature">
            <Link className="text-slate-100 no-underline hover:underline" to="/features">Features</Link>
          </Menu.Item>
          <Menu.Item key="instruct">
            <Link className="text-slate-100 no-underline hover:underline" to="/instruct">Instruction</Link>
          </Menu.Item>
          <Menu.Item key="contact">
            <Link  className="text-slate-100 no-underline hover:underline" to="/contact">Contact</Link>
          </Menu.Item>
        </Menu>
        <div style={{ display: "flex", alignItems: "center", marginLeft: "auto" }}>
          {isAuthenticated ? (
            <>
              <Dropdown
            overlay={<NotificationsMenu notifications={notifications} />}
            trigger={["click"]}
          >
            <Badge
              count={unreadCount}
              overflowCount={10}
              style={{ marginRight: "20px" }}
            >
              <BellOutlined
                className="pr-4"
                style={{ fontSize: "24px", color: "white" }}
              />
            </Badge>
          </Dropdown>
              {userRole === "admin" ? <AdminAvatar /> : <AvatarOwner />}
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-100 mr-4">Login</Link>
              <Link to="/signup" className="text-slate-100">Register</Link>
            </>
          )}
        </div>
      </Header>
    </Layout>
  );
}
