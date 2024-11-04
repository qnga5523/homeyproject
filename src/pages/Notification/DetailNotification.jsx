import React, { useEffect, useState } from "react";
import { List, Avatar, Typography, Badge } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { collection, getDocs, query, where, updateDoc, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../Services/firebase";

const { Text } = Typography;

export default function DetailNotification() {
  const [notifications, setNotifications] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false); // Track if the user is an admin
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRoleAndNotifications = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          // Step 1: Fetch the user's role from the "Users" collection
          const userDoc = await getDoc(doc(db, "Users", user.uid));
          let userRole = "owner"; // Default role if not found

          if (userDoc.exists()) {
            userRole = userDoc.data().role; // Extract the role from user data
            setIsAdmin(userRole === "admin"); // Set isAdmin based on role
          } else {
            console.error("User document not found.");
          }

          // Step 2: Query notifications based on the role
          const notificationsQuery = userRole === "admin"
            ? collection(db, "notifications") // Admins get all notifications
            : query(collection(db, "notifications"), where("userId", "==", user.uid)); // Owners get only their notifications

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
  }, [isAdmin]); // Re-run if `isAdmin` changes

  const handleNotificationClick = async (eventId, notificationId) => {
    if (eventId) {
      navigate(`/event/${eventId}`);
    }

    try {
      const notificationRef = doc(db, "notifications", notificationId);
      await updateDoc(notificationRef, { isRead: true });

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? { ...notification, isRead: true } : notification
        )
      );
    } catch (error) {
      console.error("Error updating notification status:", error);
    }
  };

  const unreadCount = notifications.filter((notif) => !notif.isRead).length;

  return (
    <div style={{ padding: "20px" }}>
      <Badge count={unreadCount} overflowCount={99}>
        <BellOutlined style={{ fontSize: "24px", color: "white" }} />
      </Badge>
      <h2>{isAdmin ? "All Notifications" : "Owner Notifications"}</h2>
      {notifications.length > 0 ? (
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item key={item.id} onClick={() => handleNotificationClick(item.eventId, item.id)}>
              <List.Item.Meta
                avatar={<Avatar icon={<BellOutlined />} />}
                title={<Text strong>{item.content}</Text>}
                description={`Received at: ${new Date(
                  item.createdAt.seconds * 1000
                ).toLocaleString()}`}
              />
              {!item.isRead && <Text type="danger">New</Text>}
            </List.Item>
          )}
        />
      ) : (
        <p>No notifications found</p>
      )}
    </div>
  );
}
