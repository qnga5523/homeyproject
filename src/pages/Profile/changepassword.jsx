import React from "react";
import { Button, Form, Input, message } from "antd";
import { auth } from "../../Services/firebase";
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";

export default function ChangePassword() {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    const { currentPassword, newPassword, confirmPassword } = values;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return message.error("Please fill in all fields.");
    }

    if (newPassword !== confirmPassword) {
      return message.error("New passwords do not match.");
    }

    const user = auth.currentUser;

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      message.success("Password has been successfully updated. Please log in again.");
    } catch (error) {
      console.error(error);
      if (error.code === "auth/wrong-password") {
        message.error("The current password you entered is incorrect.");
      } else {
        message.error("An error occurred while updating the password. Please try again.");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-center">
        Change Password
      </h2>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Current Password"
          name="currentPassword"
          rules={[{ required: true, message: "Please input your current password!" }]}
        >
          <Input.Password placeholder="Enter current password" />
        </Form.Item>

        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[
            { required: true, message: "Please input your new password!" },
            { min: 6, message: "Password must be at least 6 characters long." },
          ]}
        >
          <Input.Password placeholder="Enter new password" />
        </Form.Item>

        <Form.Item
          label="Confirm New Password"
          name="confirmPassword"
          rules={[
            { required: true, message: "Please confirm your new password!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match!"));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Confirm new password" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md"
          >
            Change Password
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
