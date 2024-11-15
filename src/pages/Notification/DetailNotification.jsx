import React, { useEffect, useState } from "react";
import { List, Avatar, Typography, Badge, Card, Button, Divider } from "antd";
import { BellOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { collection, getDocs, query, where, updateDoc, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../Services/firebase";

const { Text, Title } = Typography;

export default function DetailNotification() {
  const [notifications, setNotifications] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRoleAndNotifications = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "Users", user.uid));
          let userRole = "owner";

          if (userDoc.exists()) {
            userRole = userDoc.data().role;
            setIsAdmin(userRole === "admin");
          } else {
            console.error("User document not found.");
          }

          const notificationsQuery =
            userRole === "admin"
              ? collection(db, "notifications")
              : query(collection(db, "notifications"), where("userId", "==", user.uid));

          const querySnapshot = await getDocs(notificationsQuery);
          const notificationList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setNotifications(notificationList);
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      }
    };

    fetchUserRoleAndNotifications();
  }, [isAdmin]);

  const handleNotificationClick = async (eventId, notificationId) => {
    const user = auth.currentUser;

    if (!user) {
      console.error("User not authenticated");
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, "Users", user.uid));
      if (!userDoc.exists()) {
        console.error("User document not found.");
        return;
      }

      const userRole = userDoc.data().role;
      const rolePath = userRole === "admin" ? "admin" : "owner";

      if (eventId) {
        navigate(`/${rolePath}/event/${eventId}`);
      }

      const notificationRef = doc(db, "notifications", notificationId);
      await updateDoc(notificationRef, { isRead: true });

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? { ...notification, isRead: true } : notification
        )
      );
    } catch (error) {
      console.error("Error updating notification or navigating:", error);
    }
  };

  const unreadCount = notifications.filter((notif) => !notif.isRead).length;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <Card style={{ borderRadius: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
          <Badge count={unreadCount} overflowCount={99} offset={[0, 0]}>
            <BellOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
          </Badge>
          <Title level={3} style={{ marginLeft: "10px" }}>
            {isAdmin ? "All Notifications" : "Notifications"}
          </Title>
        </div>

        {notifications.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={(item) => (
              <Card
                style={{
                  marginBottom: "15px",
                  border: item.isRead ? "1px solid #f0f0f0" : "1px solid #1890ff",
                  borderRadius: "8px",
                  backgroundColor: item.isRead ? "#fafafa" : "#e6f7ff",
                }}
                hoverable
              >
                <List.Item
                  key={item.id}
                  onClick={() => handleNotificationClick(item.eventId, item.id)}
                  style={{ padding: "15px", cursor: "pointer" }}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={<BellOutlined />}
                        style={{
                          backgroundColor: item.isRead ? "#f0f0f0" : "#1890ff",
                          color: "#fff",
                        }}
                      />
                    }
                    title={<Text strong>{item.content}</Text>}
                    description={
                      <Text type="secondary">
                        Received at: {new Date(item.createdAt.seconds * 1000).toLocaleString()}
                      </Text>
                    }
                  />
                  {!item.isRead && (
                    <Badge
                      status="processing"
                      text="New"
                      style={{ color: "#1890ff", fontWeight: "bold" }}
                    />
                  )}
                  {item.isRead && (
                    <CheckCircleOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
                  )}
                </List.Item>
              </Card>
            )}
          />
        ) : (
          <Text type="secondary">No notifications found</Text>
        )}
      </Card>
    </div>
  );
}
