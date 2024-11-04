import React from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input } from "antd";
import { auth, db } from "../../Services/firebase";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { toast } from "react-toastify";
import { doc, getDoc, setDoc } from "firebase/firestore";
import backgroundImg from "../../assets/img/logo/bg.jpg";

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
      let errorMessage = "";
      switch (error.code) {
        case "auth/wrong-password":
          errorMessage =
            "The password you entered is incorrect. Please try again.";
          break;
        case "auth/user-not-found":
          errorMessage =
            "No user found with this email. Please register or try again.";
          break;
        case "auth/invalid-email":
          errorMessage =
            "The email address you entered is not valid. Please check and try again.";
          break;
        default:
          errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  };
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

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
      } else {
        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
          role: "owner",
          approved: false,
        });
        toast.success("Account created successfully. Waiting for approval.");
      }
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      toast.error("Google sign-in failed. Please try again.");
    }
  };

  return (
    <div
      className="flex w-screen min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImg})` }}
    >
      <div className="flex w-full items-center justify-center p-6">
        <div className="w-full max-w-lg shadow-md rounded-lg p-8">
          <div className="flex justify-center mb-4">
            <div className="bg-slate-600 rounded-full w-20 h-20 flex items-center justify-center text-white">
              <i className="fas fa-user text-3xl"></i>
            </div>
          </div>
          <h2 className="text-center text-2xl font-semibold text-gray-900 mb-6">
            LOG IN
          </h2>
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
              <Input
                prefix={<UserOutlined />}
                placeholder="Email"
                className="rounded-full py-2 "
              />
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
                className="rounded-full py-2 "
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
                className="bg-sky-700 hover:bg-sky-600 text-white font-semibold rounded-full transition duration-300 ease-in-out"
                block
                type="primary"
                htmlType="submit"
              >
                Submit
              </Button>
              <Button
                onClick={handleGoogleSignIn}
                className="bg-slate-500 hover:bg-slate-500 text-white font-semibold rounded-full transition duration-300 ease-in-out mt-4"
                block
              >
                Sign in with Google
              </Button>
              <div className="mt-4 text-center">
                <a
                  href="/signup"
                  className="text-gray-900 hover:text-gray-500 font-medium transition duration-300 ease-in-out"
                >
                  Register
                </a>
              </div>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}
