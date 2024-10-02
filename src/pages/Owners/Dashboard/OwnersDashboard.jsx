import React, { useEffect, useState } from "react";
import HeaderMain from "../../../components/common/HeaderMain";
import SiderOwner from "../../../components/layout/Owner/SiderOwner";
import { Layout, theme } from "antd";

import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../../../Services/firebase";

const { Content } = Layout;
export default function OwnersDashboard() {
  const [notifications, setNotifications] = useState([]);
  const userId = auth.currentUser?.uid; // Lấy user ID của user hiện tại

  useEffect(() => {
    if (!userId) return; // Nếu user chưa đăng nhập, không thực hiện

    // Thực hiện truy vấn để lấy thông báo của user
    const fetchNotifications = async () => {
      const q = query(
        collection(db, "Notifications"), // Lấy từ collection Notifications
        where("userId", "==", userId), // Chỉ lấy thông báo của user hiện tại
        orderBy("timestamp", "desc") // Sắp xếp theo thời gian mới nhất
      );

      const querySnapshot = await getDocs(q);
      const notificationsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setNotifications(notificationsData);
    };

    fetchNotifications();
  }, [userId]);

  const markAsRead = async (notificationId) => {
    const notificationRef = doc(db, "Notifications", notificationId);
    await updateDoc(notificationRef, {
      read: true,
    });
    // Cập nhật lại trạng thái thông báo để re-render
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  return (
    <div>
      <h1>Your Notifications</h1>
      {notifications.length === 0 ? (
        <p>No notifications found.</p>
      ) : (
        <ul>
          {notifications.map((notification) => (
            <li
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
            >
              <p>{notification.message}</p>
              <p>
                {new Date(notification.timestamp.toDate()).toLocaleString()}
              </p>
              {notification.read ? (
                <span>Status: Read</span>
              ) : (
                <span>Status: Unread</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
