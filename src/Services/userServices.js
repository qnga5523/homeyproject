import { doc, getDoc, setDoc } from "firebase/firestore";
import React from "react";
import { db } from "./firebase";
import axios from "axios";
export const userServices = async (userId) => {
  // Cập nhật trạng thái phê duyệt
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
        Authorization: "key=YOUR_SERVER_KEY",
        "Content-Type": "application/json",
      },
    });
    console.log("Notification sent!");
  } catch (error) {
    console.error("Error sending notification", error);
  }
};
