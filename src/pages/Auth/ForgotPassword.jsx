import Link from "antd/es/typography/Link";
import React, { useState } from "react";
import { Button, Form, Input, message } from "antd";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../Services/firebase";
import backgroundImg from "../../assets/img/logo/bg.jpg";
export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const onFinish = async (values) => {
    const { email } = values;
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      message.success("Password reset email sent! Check your inbox.");
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        message.error("No account found with this email.");
      } else if (error.code === "auth/invalid-email") {
        message.error("Invalid email address.");
      } else {
        message.error("Failed to send password reset email.");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
    className="flex w-screen min-h-screen bg-cover bg-center"
    style={{ backgroundImage: `url(${backgroundImg})`}}
  >
      <div className="flex w-full items-center justify-center p-6">
        <div className="w-full max-w-lg shadow-md rounded-lg p-8">
          <div className="flex justify-center mb-4">
            <div className="bg-slate-600 rounded-full w-20 h-20 flex items-center justify-center text-white">
              <i className="fas fa-user text-3xl"></i>
            </div>
          </div>
          <h2 className="text-center text-2xl font-semibold text-gray-900 mb-6">Forget Password</h2>
          <Form
            className="login-form"
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input placeholder="Enter your email" className="rounded-full py-2  text-gray-700 border border-gray-300"/>
            </Form.Item>
            <Form.Item>
  <Button
    loading={loading}
    block
    type="primary"
    htmlType="submit"
    className="w-80 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold shadow-lg transition duration-300 ease-in-out"
  >
    Verify
  </Button>

<div className="mt-6 text-center">
    <h4 className="font-semibold text-gray-700">Already have an account?</h4>
    <Link
      to="/login"
      className="text-blue-500 hover:text-blue-600 underline underline-offset-4 transition duration-300 ease-in-out"
    >
      Log In
    </Link>
  </div>

  <div className="mt-4 text-center">
    <h4 className="font-semibold text-gray-700">Don't have an account?</h4>
    <Link
      to="/signup"
      className="text-blue-500 hover:text-blue-600 underline underline-offset-4 transition duration-300 ease-in-out"
    >
      Register
    </Link>
  </div>
</Form.Item>

          </Form>
        </div>
      </div>
    </div>
  );
}
