import React, { useState } from "react";
import { Button, Form, Input, message } from "antd";
import { auth } from "../../Services/firebase";
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (values) => {
    const { currentPassword, newPassword, confirmPassword } = values;
    console.log("Form submitted");

    if (!currentPassword || !newPassword || !confirmPassword) {
      return message.error("Please fill in all fields.");
    }

    if (newPassword !== confirmPassword) {
      return message.error("New passwords do not match.");
    }

    const user = auth.currentUser;

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      message.success(
        "Mật khẩu đã được cập nhật thành công. Vui lòng đăng nhập lại."
      );
    } catch (error) {
      console.error(error);
      if (error.code === "auth/wrong-password") {
        message.error("Mật khẩu hiện tại không đúng.");
      } else {
        message.error(
          "Đã xảy ra lỗi khi cập nhật mật khẩu. Vui lòng thử lại sau."
        );
      }
    }
  };

  return (
    <div className="change-password-container">
      <h2>Change Password</h2>
      <Form onFinish={handleSubmit}>
        <Form.Item
          label="Current Password"
          name="currentPassword"
          rules={[
            { required: true, message: "Please input your current password!" },
          ]}
        >
          <Input.Password
            onChange={(e) => setOldPassword(e.target.value)}
            value={oldPassword}
          />
        </Form.Item>
        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[
            { required: true, message: "Please input your new password!" },
            { min: 6, message: "Password must be at least 6 characters long." },
          ]}
        >
          <Input.Password
            onChange={(e) => setNewPassword(e.target.value)}
            value={newPassword}
          />
        </Form.Item>
        <Form.Item
          label="Confirm New Password"
          name="confirmPassword"
          rules={[
            { required: true, message: "Please confirm your new password!" },
          ]}
        >
          <Input.Password
            onChange={(e) => setConfirmPassword(e.target.value)}
            value={confirmPassword}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Change Password
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
