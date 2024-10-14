import React from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input } from "antd";
import { auth, db } from "../../Services/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { toast } from "react-toastify";
import { doc, getDoc } from "firebase/firestore";
import picture from "../../assets/img/logo/03.jpg";
export default function Login() {
  const onFinish = async (values) => {
    const { email, password } = values;
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Fetch user details from Firestore
      const userDoc = await getDoc(doc(db, "Users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === "admin") {
          window.location.href = "/admin";
        } else if (userData.role === "owner" && userData.approved) {
          window.location.href = "/owner";
        } else {
          toast.error("Your account is not approved yet.", {
            position: "top-center",
          });
          await auth.signOut();
        }
      }
    } catch (error) {
      console.log(error.message);
      toast.error(error.message, { position: "bottom-center" });
    }
  };

  return (
    <div className="flex w-screen min-h-screen bg-sky-600">
      <div
        className="w-1/2 flex items-center justify-center bg-cover bg-no-repeat bg-center  shadow-2xl"
        style={{
          backgroundImage: `url(${picture})`,
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
        }}
      ></div>

      <div className="flex w-1/2 items-center justify-center bg-white/50 backdrop-blur-sm p-8">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-6 text-center">
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
              name="email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Email" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your Password!" },
              ]}
            >
              <Input
                prefix={<LockOutlined />}
                type="password"
                placeholder="Password"
              />
            </Form.Item>

            <Form.Item>
              <div className="flex justify-between items-center">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>
                <a href="/password">Forgot password</a>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                className="bg-indigo-500 rounded-full"
                block
                type="primary"
                htmlType="submit"
              >
                Sign In
              </Button>
              <div className="mt-4">
                <a href="/signup">Register</a>
              </div>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}
