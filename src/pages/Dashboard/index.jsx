import React, { useState, useEffect } from "react";
import { Badge, Layout, Menu, message, Dropdown, Card, Spin, Row, Col } from "antd";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { BellOutlined } from "@ant-design/icons";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import logo from "../../assets/img/logo/logo.jpg";
import { theme } from "antd";
import AdminAvatar from "../../components/layout/Admin/AvatarAdmin";
import AvatarOwner from "../../components/layout/Owner/AvatarOwner";
import SiderAdmin from "../../components/layout/Admin/SiderAdmin";
import SiderOwner from "../../components/layout/Owner/SiderOwner";
import { auth, db } from "../../Services/firebase";
import NotificationsMenu from "../../components/common/notificationsMenu";
import FeedbackReport from "../Feedback25/FeedbackReport";
import ServicePriceCharts from "../Managements/Prices/ServicePriceCharts";


const { Header, Content } = Layout;

const addNotification = async (userId, role, content) => {
  try {
    console.log("Adding notification for user:", userId, "role:", role);
    await addDoc(collection(db, "notifications"), {
      userId,
      role,
      content,
      isRead: false,
      createdAt: serverTimestamp(),
    });
    console.log("Notification added successfully");
  } catch (error) {
    console.error("Error adding notification: ", error);
  }
};

const fetchUnreadNotifications = (
  userId,
  role,
  setUnreadCount,
  setNotifications
) => {
  const q = query(
    collection(db, "notifications"),
    role === "admin"
      ? where("role", "==", "admin") 
      : where("userId", "==", userId), 
    where("isRead", "==", false)
  );
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setUnreadCount(notifications.length);
    setNotifications(notifications);
  });

  return unsubscribe;
};

export default function Dashboard() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [ownerCount, setOwnerCount] = useState(0);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [buildingCount, setBuildingCount] = useState(0);
  const [roomCount, setRoomCount] = useState(0);
  const navigate = useNavigate();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  useEffect(() => {
    // Fetch owner count
    const fetchOwnerCount = async () => {
      const q = query(collection(db, "Users"), where("role", "==", "owner"));
      const querySnapshot = await getDocs(q);
      setOwnerCount(querySnapshot.size);
    };

    const fetchTotalVehicleCount = async () => {
      const q = query(collection(db, "Vehicle"), where("status", "==", "approved"));
      const querySnapshot = await getDocs(q);
      setTotalVehicles(querySnapshot.size);
    };
    const fetchBuildingCount = async () => {
      const buildingsCollection = collection(db, "buildings");
      const buildingSnapshot = await getDocs(buildingsCollection);
      setBuildingCount(buildingSnapshot.size);
    };

    const fetchRoomCount = async () => {
      const roomsCollection = collection(db, "rooms");
      const roomSnapshot = await getDocs(roomsCollection);
      setRoomCount(roomSnapshot.size);
    };

    setLoading(true);
    Promise.all([fetchOwnerCount(), fetchTotalVehicleCount(), fetchBuildingCount(), fetchRoomCount()])
      .then(() => setLoading(false));
  }, []);
  useEffect(() => {
    const fetchUserRole = async () => {
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          try {
            const userDocRef = doc(db, "Users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              const userData = userDoc.data(); 
              const role = userData.role;
              setUserRole(role);
              setUserName(userData.name || "User");

              fetchUnreadNotifications(
                user.uid,
                role,
                setUnreadCount,
                setNotifications
              );
            } else {
              message.error("User not found or unauthorized");
              navigate("/login");
            }
          } catch (error) {
            console.error("Error fetching user role:", error);
            message.error("Error fetching user role");
          }
        } else {
          navigate("/login");
        }
        setLoading(false);
      });
    };

    fetchUserRole();
  }, [navigate]);
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
            <Link
              className="text-slate-100 no-underline hover:underline"
              to="/"
            >
              Home
            </Link>
          </Menu.Item>
          <Menu.Item key="about">
            <Link
              className="text-slate-100 no-underline hover:underline"
              to="/about"
            >
              About us
            </Link>
          </Menu.Item>
          <Menu.Item key="feature">
            <Link
              className="text-slate-100 no-underline hover:underline"
              to="/features"
            >
              Features
            </Link>
          </Menu.Item>
          <Menu.Item key="instruct">
            <Link
              className="text-slate-100 no-underline hover:underline"
              to="/instruct"
            >
              Instruction
            </Link>
          </Menu.Item>
          <Menu.Item key="contact">
            <Link
              className="text-slate-100 no-underline hover:underline"
              to="/contact"
            >
              Contact
            </Link>
          </Menu.Item>
        </Menu>

        <div
          style={{ display: "flex", alignItems: "center", marginLeft: "auto" }}
        >
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
        </div>
      </Header>

      <Layout>
        {userRole === "admin" ? <SiderAdmin /> : <SiderOwner />}

        <Layout style={{ padding: "0 24px 24px", flexGrow: 1 }}>
          <Content
            style={{
              margin: "24px 16px",
              padding: 24,
              background: colorBgContainer,
              minHeight: "280px",
              overflow: "auto",
            }}
          >
            <Outlet />
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-6">Dashboard Statistics</h2>

              {loading ? (
                <Spin size="large" />
              ) : (
                <Row gutter={16}>
                  <Col span={12}>
                    <Card title="Total Owners" bordered={false}>
                      <p className="text-4xl font-semibold text-center">{ownerCount}</p>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="Total Vehicles" bordered={false}>
                      <p className="text-4xl font-semibold text-center">{totalVehicles}</p>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="Total Buildings" bordered={false}>
                      <p className="text-4xl font-semibold text-center">{buildingCount}</p>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="Total Rooms" bordered={false}>
                      <p className="text-4xl font-semibold text-center">{roomCount}</p>
                    </Card>
                  </Col>
                </Row>
                
              )}
            </div>
            <div className="p-6 max-w-6xl mx-auto">
              <Row gutter={[16, 16]} className="mb-6">
                <Col span={24}>
                  <Card title="Service Price Charts" bordered={false}>
                    <ServicePriceCharts />
                  </Card>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card title="Feedback Summary - Satisfaction Levels" bordered={false}>
                    <FeedbackReport />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="Feedback Suggestions and Features" bordered={false}>
                    <FeedbackReport />
                  </Card>
                </Col>
              </Row>
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
