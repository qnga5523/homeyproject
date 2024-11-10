import React, { useEffect, useState } from "react";
import { List, Avatar, Typography, Badge } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { collection, getDocs, query, where, updateDoc, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../Services/firebase";

const { Text } = Typography;

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

          const notificationsQuery = userRole === "admin"
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
      if (userRole === "admin" || userRole === "owner") {
        const rolePath = userRole === "admin" ? "admin" : "owner";
 
        if (eventId) {
          navigate(`/${rolePath}/event/${eventId}`);
        }
      } else {
        alert("You do not have permission to view this event.");
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
    <div style={{ padding: "20px" }}>
      <Badge count={unreadCount} overflowCount={99}>
        <BellOutlined style={{ fontSize: "24px", color: "white" }} />
      </Badge>
      <h2>{isAdmin ? "All Notifications" : " Notifications"}</h2>
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
