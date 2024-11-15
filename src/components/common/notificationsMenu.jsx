import React, { useEffect, useState } from "react";
import { List, Avatar, Empty, Button, Typography, Divider } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../Services/firebase";

const { Text } = Typography;

const NotificationsMenu = ({ notifications = [] }) => {
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "Users", user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        }
      }
    };
    fetchUserRole();
  }, []);

  const handleViewAll = () => {
    navigate(userRole === "admin" ? "/notification" : "/owner/notification");
  };

  const handleMarkAllAsRead = () => {
    notifications.forEach(async (item) => {
      if (!item.isRead) {
        await updateDoc(doc(db, "notifications", item.id), { isRead: true });
      }
    });
  };

  return (
    <div
      style={{
        width: "450px",  // Adjusted width for a wider appearance
        padding: "15px",
        background: "#fff",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        overflowY: "auto",
        maxHeight: "500px",
      }}
    >
      {notifications.length === 0 ? (
        <Empty description="No notifications" />
      ) : (
        <>
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                style={{
                  padding: "12px",
                  backgroundColor: item.isRead ? "#f7f7f7" : "#e6f7ff",
                  borderRadius: "8px",
                  marginBottom: "10px",
                  border: "1px solid #d9d9d9",
                  cursor: "pointer",
                  transition: "background 0.3s ease",
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={<BellOutlined />}
                      style={{
                        backgroundColor: item.isRead ? "#d9d9d9" : "#1890ff",
                        color: "#fff",
                      }}
                    />
                  }
                  title={
                    <Text strong style={{ color: "#333", fontSize: "14px" }}>
                      {item.content || "Notification"}{" "}
                      <span style={{ color: "#888", fontWeight: "normal" }}>
                        from {item.username || "Unknown User"}
                      </span>
                    </Text>
                  }
                  description={
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Received:{" "}
                      {item.createdAt
                        ? new Date(item.createdAt.seconds * 1000).toLocaleString()
                        : "N/A"}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />

          <Divider style={{ margin: "10px 0" }} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0 10px",
            }}
          >
            <Button type="link" onClick={handleViewAll} style={{ padding: 0, fontSize: "14px" }}>
              View All
            </Button>
            <Button
              type="primary"
              onClick={handleMarkAllAsRead}
              style={{ padding: "0 15px", borderRadius: "5px", fontSize: "14px" }}
            >
              Readed All
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsMenu;
