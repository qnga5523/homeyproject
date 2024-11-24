import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Badge,
  Dropdown,
  message,
  Spin,
  Row,
  Col,
  Card,
  Button,
  Typography,
  Input,
} from "antd";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  BellOutlined,
  InsertRowAboveOutlined,
  IdcardOutlined,
  CarryOutOutlined,
  FundViewOutlined,
  FileTextOutlined,
  CloudServerOutlined,
  TruckOutlined,
  TeamOutlined,
  DollarOutlined,
  BankOutlined,
  ApartmentOutlined,
  SolutionOutlined,
  SnippetsOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DeploymentUnitOutlined,
  HeartOutlined,
  FormatPainterOutlined,
  GoldOutlined,
  AimOutlined,
} from "@ant-design/icons";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  addDoc,
  onSnapshot,
  limit
} from "firebase/firestore";
import logo from "../../assets/img/logo/logo.jpg";
import AdminAvatar from "../../components/layout/Admin/AvatarAdmin";
import AvatarOwner from "../../components/layout/Owner/AvatarOwner";
import { auth, db } from "../../Services/firebase";
import NotificationsMenu from "../../components/common/notificationsMenu";
import FeedbackReport from "../Feedback25/FeedbackReport";
import ServicePriceCharts from "../Managements/Prices/ServicePriceCharts";
import ServiceBookingChart from "../Managements/ServiceBook/ServiceBookingChart";
import MonthlyServiceFeeChart from "../Managements/ServicesFee/MonthlyServiceChart"
import TotalFee from "../../components/layout/Colums/TotalFee";
import ContactSupport from "../../components/common/ContactSupport";


const { Title, Paragraph } = Typography;
const { Header, Sider, Content } = Layout;
const { SubMenu } = Menu;
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
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);


  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };
  useEffect(() => {
    const fetchCounts = async () => {
      const fetchOwnerCount = async () => {
        const q = query(
          collection(db, "Users"),
          where("role", "==", "owner"),
          where("approved", "==", true)
        );
        const querySnapshot = await getDocs(q);
        setOwnerCount(querySnapshot.size);
      };

      const fetchTotalVehicleCount = async () => {
        const q = query(
          collection(db, "Vehicle"),
          where("status", "==", "approved")
        );
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
      Promise.all([
        fetchOwnerCount(),
        fetchTotalVehicleCount(),
        fetchBuildingCount(),
        fetchRoomCount(),
      ]).then(() => setLoading(false));
    };

    fetchCounts();
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
                setNotifications);
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
    const fetchEvents = async () => {
      try {
        const eventsQuery = query(collection(db, "events"), limit(3));
        const querySnapshot = await getDocs(eventsQuery);
        const eventsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events: ", error);
      }
      setLoading(false);
    };

    fetchUserRole();
    fetchEvents();
  }, [navigate]);
 
  const logoPath = userRole === "admin" ? "/" : "/owner";
  const isRootDashboard =
    location.pathname === "/owner" || location.pathname === "/";
  const menuItems = [
    {
      key: "1",
      icon: <TeamOutlined />,
      label: <Link to="/managementAccount">Management Customers</Link>,
    },
    {
      key: "2",
      icon: <SolutionOutlined />,
      label: <Link to="/requestAccount">Request Account</Link>,
    },
    {
      key: "3",
      icon: <InsertRowAboveOutlined />,
      label: <Link to="/event">Management Event</Link>,
    },
    {
      key: "4",
      label: <Link to="/ServicePriceCharts">Management Price</Link>,
      icon: <CloudServerOutlined />,
      children: [
        {
          key: "5",
          icon: <HeartOutlined />,
          label: <Link to="/water">Prices Water</Link>,
        },
        {
          key: "6",
          icon: <FormatPainterOutlined />,
          label: <Link to="/clean">Prices Clean</Link>,
        },
        {
          key: "7",
          icon: <GoldOutlined />,
          label: <Link to="/parking">Prices Parking</Link>,
        },
      ],
    },
    {
      key: "8",
      label: <Link to="/room">Management Building</Link>,
      icon: <DeploymentUnitOutlined />,
      children: [
        {
          key: "9",
          icon: <ApartmentOutlined />,
          label: <Link to="/listapart">Apartment</Link>,
        },
        {
          key: "10",
          icon: <BankOutlined />,
          label: <Link to="/add">Building</Link>,
        },
      ],
    },
    {
      key: "11",
      icon: <CarryOutOutlined />,
      label: <Link to="/requestbook">Management Booking</Link>,
    },
    {
      key: "12",
      label: "Finance",
      icon: <DollarOutlined />,
      children: [
        {
          key: "13",
          icon: <FundViewOutlined />,
          label: <Link to="/setFee">Service Fee</Link>,
        },
        {
          key: "14",
          icon: <SnippetsOutlined />,
          label: <Link to="/history">History Fee</Link>,
        },
      ],
    },
    {
      key: "15",
      icon: <SolutionOutlined />,
      label: <Link to="/feedback">Feedback</Link>,
    },
    {
      key: "16",
      icon: <AimOutlined />,
      label: <Link to="/allvehicle">Vehicle</Link>,
      children: [
        {
          key: "17",
          icon: <FundViewOutlined />,
          label: <Link to="/requestvehicle">Request Vehicle</Link>,
        },
      ],
    },
  ];

  const userMenu = [
    {
      key: "1",
      icon: <InsertRowAboveOutlined />,
      label: <Link to="/owner/event">Event</Link>,
    },
    {
      key: "2",
      icon: <IdcardOutlined />,
      label: <Link to="/owner/profile">Profile</Link>,
    },
    {
      key: "3",
      icon: <BellOutlined />,
      label: <Link to="/owner/notification">Notifications</Link>,
    },
    {
      key: "4",
      label: <Link to="/owner/book">Book Services</Link>,
      icon: <CarryOutOutlined />,
    },
    {
      key: "5",
      label: <Link to="/owner/feehistory">Service Fee</Link>,
      icon: <FundViewOutlined />,
    },
    {
      key: "6",
      label: <Link to="/owner/feedback">Feedback</Link>,
      icon: <FileTextOutlined />,
    },
    {
      key: "8",
      icon: <TruckOutlined />,
      label: <Link to="/owner/vehicleregister">Public Transportation</Link>,
    },
  ];
  const menuToDisplay = userRole === "admin" ? menuItems : userMenu;
  return (
    <Layout className="min-h-screen overflow-hidden">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="fixed top-0 left-0 h-full bg-[#11354d] z-50"
        width={250}
      >
        <div className="flex items-center justify-center my-4">
          <Link to={logoPath}>
            <img
              src={logo}
              alt="Logo"
              style={{ height: "50px", width: "auto" }}
            />
          </Link>
        
        </div>
        <Menu
          theme="dark"
          mode="vertical"
          style={{ background: "#11354d", color: "white" }}
        >
          {menuToDisplay.map((item) =>
            item.children ? (
              <SubMenu
                key={item.key}
                icon={item.icon}
                title={item.label}
                style={{ backgroundColor: "#11354d" }}
              >
                {item.children.map((child) => (
                  <Menu.Item
                    key={child.key}
                    className="text-white-300 hover:bg-blue-800"
                  >
                    {child.label}
                  </Menu.Item>
                ))}
              </SubMenu>
            ) : (
              <Menu.Item key={item.key} icon={item.icon} className="text-white">
                {item.label}
              </Menu.Item>
            )
          )}
        </Menu>
      </Sider>

      <Layout className={`ml-${collapsed ? 20 : 64}`}>
        <Header
          className="fixed top-0 right-0 h-16 flex justify-between items-center px-4 bg-white border-b border-gray-200 z-40"
          style={{
            width: `calc(100% - ${collapsed ? 80 : 250}px)`,
          }}
        >
          <div className="flex items-center">
            {React.createElement(
              collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
              {
                className: "text-xl cursor-pointer",
                onClick: toggleCollapsed,
              }
            )}
          </div>
          
        
          <div className="flex items-center space-x-4">
          <ContactSupport />
            <Dropdown
              overlay={<NotificationsMenu notifications={notifications} />}
              trigger={["click"]}
            >
              <Badge
                count={unreadCount}
                overflowCount={10}
                style={{ marginRight: "10px" }}
              >
                <BellOutlined
                  className="pr-4"
                  style={{ fontSize: "24px", color: "#11354d" }}
                />
              </Badge>
            </Dropdown>
            {userRole === "admin" ? <AdminAvatar /> : <AvatarOwner />}
          </div>
        </Header>

        <Content
          className={`pt-16`}
          style={{
            marginLeft: collapsed ? 80 : 250,
            height: "calc(100vh - 64px)",
            overflowY: "auto",
            backgroundColor: "#F6FBFE",
          }}
        >
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            {location.pathname === "/" && (
             <>
             <h2 className="text-2xl font-bold mb-6 text-center">Dashboard</h2>
             {loading ? (
               <div className="flex justify-center items-center h-64">
                 <Spin size="large" />
               </div>
             ) : (
               <Row gutter={[16, 16]} justify="space-around">
                 <Col xs={12} sm={12} md={6} lg={6}>
                   <Card
                     title="Total Owners"
                     bordered={false}
                     style={{
                       backgroundColor: '#98B4CA',
                       borderRadius: '10px',
                       color: '#fff',
                     }}
                     bodyStyle={{ padding: '20px', textAlign: 'center' }}
                   >
                     <p className="text-4xl font-semibold text-white">{ownerCount}</p>
                   </Card>
                 </Col>
                 <Col xs={12} sm={12} md={6} lg={6}>
                   <Card
                     title="Total Vehicles"
                     bordered={false}
                     style={{
                       backgroundColor: '#98B4CA',
                       borderRadius: '10px',
                       color: '#fff',
                     }}
                     bodyStyle={{ padding: '20px', textAlign: 'center' }}
                   >
                     <p className="text-4xl font-semibold text-white">{totalVehicles}</p>
                   </Card>
                 </Col>
                 <Col xs={12} sm={12} md={6} lg={6}>
                   <Card
                     title="Total Buildings"
                     bordered={false}
                     style={{
                       backgroundColor: '#98B4CA',
                       borderRadius: '10px',
                       color: '#fff',
                     }}
                     bodyStyle={{ padding: '20px', textAlign: 'center' }}
                   >
                     <p className="text-4xl font-semibold text-white">{buildingCount}</p>
                   </Card>
                 </Col>
                 <Col xs={12} sm={12} md={6} lg={6}>
                   <Card
                     title="Total Rooms"
                     bordered={false}
                     style={{
                       backgroundColor: '#98B4CA',
                       borderRadius: '10px',
                       color: '#fff',
                     }}
                     bodyStyle={{ padding: '20px', textAlign: 'center' }}
                   >
                     <p className="text-4xl font-semibold text-white">{roomCount}</p>
                   </Card>
                 </Col>
               </Row>
             )}
           </>
           
           
            )}

{isRootDashboard && userRole === "admin" && (
              <>
                <div className="p-6 max-w-6xl mx-auto">
                
                  <Row gutter={[16, 16]} className="mb-6">
                    <Col span={12}>
                      <Card
                        title="Feedback Summary - Satisfaction Levels"
                        bordered={false}
                        style={{ textAlign: "center", marginTop:"24px" }}
                      >
                        <FeedbackReport
                          showAnswers={false}
                          showDatePicker={false}
                        />
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card title="Service Booking Chart" bordered={false}
                      style={{ textAlign: "center", marginTop:"24px" }}>
                        <ServiceBookingChart />
                      </Card>
                    </Col>
                  </Row>
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Card title="Service Price Charts" bordered={false}
                      style={{ textAlign: "center", marginTop:"24px" }}>
                        <ServicePriceCharts showParking={false}/>
                      </Card>
                    </Col>
                  </Row>
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Card title="Service Price Charts" bordered={false}
                      style={{ textAlign: "center", marginTop:"24px" }}>
                        <TotalFee showTableOnly={false}/>
                      </Card>
                    </Col>
                  </Row>
                  
                </div>
              </>
            )}
            {isRootDashboard && userRole === "owner" && (
             <>
             <div className="p-4 md:p-8 max-w-full md:max-w-7xl mx-auto space-y-6 md:space-y-8">
               <div className="bg-white shadow rounded-lg p-4 md:p-6">
                 <Title level={3} className="text-center mb-4 text-lg md:text-2xl">
                   Upcoming Events
                 </Title>
                 {loading ? (
                   <div className="flex justify-center py-12">
                     <Spin size="large" />
                   </div>
                 ) : (
                   <Row gutter={[16, 16]} className="md:space-x-0">
                     {events.map((event) => (
                       <Col xs={24} sm={12} md={8} key={event.id} className="mb-4 md:mb-0">
                         <Card
                           hoverable
                           className="shadow-sm border border-gray-200 rounded-lg overflow-hidden"
                           cover={
                             <img
                               alt={event.title}
                               src={event.imageUrl}
                               className="h-40 md:h-48 w-full object-cover"
                             />
                           }
                         >
                           <Title level={5} className="text-gray-800 text-center mb-2 text-sm md:text-lg">
                             {event.title}
                           </Title>
                           <Paragraph className="text-gray-600 text-center text-xs md:text-base">
                             {event.content.slice(0, 50)}...
                           </Paragraph>
                           <Button
                             type="link"
                             href={`/owner/event/${event.id}`}
                             className="block text-center mt-2"
                             style={{ color: "#1890ff" }}
                           >
                             Read More
                           </Button>
                         </Card>
                       </Col>
                     ))}
                   </Row>
                 )}
               </div>
           
               <div className="bg-white shadow rounded-lg p-4 md:p-6">
                 <Title level={3} className="text-center mb-4 text-lg md:text-2xl">
                   Service Fee and Price Analysis
                 </Title>
                 <Row gutter={[16, 16]} className="flex flex-col md:flex-row">
                   <Col span={24} className="mb-4 md:mb-0">
                     <Card
                       title={<span className="text-base md:text-lg">Monthly Service Fee Chart</span>}
                       bordered={false}
                       className="shadow-sm rounded-lg"
                       bodyStyle={{ padding: "16px", paddingBottom: "24px" }}
                       style={{ textAlign: "center", background: "#f0f5ff" }}
                     >
                       <MonthlyServiceFeeChart />
                     </Card>
                   </Col>
                 </Row>
           
                 <Row gutter={[16, 16]} className="mt-4 md:mt-6 flex flex-col md:flex-row">
                   <Col span={24}>
                     <Card
                       title={<span className="text-base md:text-lg">Service Price Trends</span>}
                       bordered={false}
                       className="shadow-sm rounded-lg"
                       bodyStyle={{ padding: "16px", paddingBottom: "24px" }}
                       style={{ textAlign: "center", background: "#f0f5ff" }}
                     >
                       <ServicePriceCharts />
                     </Card>
                   </Col>
                 </Row>
               </div>
             </div>
           </>
            )}
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
