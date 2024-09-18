import Link from "antd/es/typography/Link";
import React, { useState } from "react";

import { Button, Form, Input, message } from "antd";
import background from "../../assets/img/logo/background.jpg";

import logoicon from "../../assets/img/logo/iconlogo.png";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../Services/firebase";

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
      className="flex w-screen min-h-screen"
      style={{
        backgroundImage: `url(${background})`,
      }}
    >
      <div
        className="w-1/2 flex items-center justify-center bg-cover bg-no-repeat bg-center"
        style={{
          backgroundImage: `url(${logoicon})`,
        }}
      ></div>

      <div className="flex w-1/2 items-center justify-center bg-white/50 backdrop-blur-sm p-8">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-6 text-center">
          {/* name page */}
          <div>
            <h4 className="text-lg font-bold mb-4">Sign in to your account</h4>
          </div>

          {/* form */}
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
              <Input placeholder="Enter your email" />
            </Form.Item>

            <Form.Item>
              <Button
                loading={loading}
                block
                type="primary"
                htmlType="submit"
                className="login-form-button basis-full bg-black rounded-full text-white font-bold text-lg w-full pt-2 pb-2 h-fit"
                style={{ boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)" }}
              >
                Verify
              </Button>
            </Form.Item>

            <Form.Item>
              <div>
                <h4 className="font-bold">Already have an account?</h4>
                <Link
                  to="/login "
                  className="text-[#d33d57] underline underline-offset-2"
                >
                  Sign In
                </Link>
              </div>

              <div>
                <h4 className="font-bold mt-3">Don't have an account?</h4>
                <Link
                  to="/signup"
                  className="text-[#d33d57] underline underline-offset-2"
                >
                  Sign up
                </Link>
              </div>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}
