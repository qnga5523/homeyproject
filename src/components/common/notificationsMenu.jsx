import React, { useEffect, useState } from "react";
import { List, Avatar, Empty, Button } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../Services/firebase";

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
    if (userRole === "admin") {
      navigate("/notifications/admin");
    } else {
      navigate("/notifications/owner");
    }
  };

  const handleMarkAllAsRead = () => {
    notifications.forEach(async (item) => {
      await updateDoc(doc(db, "notifications", item.id), { isRead: true });
    });
  };
  return (
    <div style={{ maxWidth: '350px', padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
      {notifications.length === 0 ? (
        <Empty description="No notifications" />
      ) : (
        <>
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item key={item.id} style={{ padding: '10px 0' }}>
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={<BellOutlined />} 
                      style={{ backgroundColor: '#f0f0f0', padding: '8px' }}
                    />
                  }
                  title={<span style={{ fontWeight: 'bold', color: '#333' }}>{item.content}</span>}
                  description={
                    <span style={{ color: '#888', fontSize: '12px' }}>
                      Received at: {new Date(item.createdAt.seconds * 1000).toLocaleString()}
                    </span>
                  }
                />
              </List.Item>
            )}
          />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '10px', borderTop: '1px solid #f0f0f0' }}>
            <Button type="text" onClick={handleViewAll}>View All</Button>
            <Button type="text" onClick={handleMarkAllAsRead}>Mark All as Read</Button>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsMenu;
