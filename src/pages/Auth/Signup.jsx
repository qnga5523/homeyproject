import React, { useEffect, useState } from "react";
import { Button, Form, Input, Select } from "antd";
import { auth, db } from "../../Services/firebase";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { toast } from "react-toastify";
import {
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  getDoc,
} from "firebase/firestore";
import backgroundImg from "../../assets/img/logo/bg.jpg";

export default function Signup() {
  const [form] = Form.useForm();
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState("");

  useEffect(() => {
    const fetchBuildings = async () => {
      const buildingsSnapshot = await getDocs(collection(db, "buildings"));
      const buildingList = buildingsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBuildings(buildingList);
    };
    fetchBuildings();
  }, []);

  const onBuildingChange = async (value) => {
    setSelectedBuilding(value);

    const selectedBuilding = buildings.find(
      (building) => building.id === value
    );

    if (selectedBuilding) {
      const roomsQuery = query(
        collection(db, "rooms"),
        where("buildingId", "==", selectedBuilding.id)
      );

      const roomsSnapshot = await getDocs(roomsQuery);
      const roomList = roomsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRooms(roomList);
    } else {
      setRooms([]);
    }
  };

  const onFinish = async (values) => {
    const { email, password, phone, name, room, building } = values;
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (user) {
        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
          Username: name,
          Phone: phone,
          room: room,
          building: building,
          role: "owner",
          approved: false,
        });
      }
      toast.success("User Registered Successfully!!", {
        position: "top-center",
      });
    } catch (error) {
      toast.error(error.message, {
        position: "bottom-center",
      });
    }
  };
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

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

  const { Option } = Select;
  const prefixSelector = (
    <Form.Item name="prefix" noStyle>
      <Select
        style={{
          width: 70,
        }}
      >
        <Option value=""></Option>
        <Option value="86">+86</Option>
        <Option value="87">+84</Option>
      </Select>
    </Form.Item>
  );

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
            Create Account
          </h2>

          <Form
            form={form}
            name="register"
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
              <Input placeholder="Email" className="rounded-full py-2 " />
            </Form.Item>
            <Form.Item
              name="name"
              rules={[
                {
                  required: true,
                  message: "Please input your name!",
                  whitespace: true,
                },
              ]}
            >
              <Input placeholder="Username" className="rounded-full py-2" />
            </Form.Item>
            <Form.Item
              name="phone"
              rules={[
                {
                  required: true,
                  message: "Please input your phone number!",
                },
              ]}
            >
              <Input
                addonBefore={prefixSelector}
                placeholder="Phone Number"
                className="rounded-full py-2"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your Password!" },
              ]}
            >
              <Input.Password
                placeholder="Password"
                className="rounded-full py-2"
              />
            </Form.Item>
            <Form.Item
              name="confirm"
              dependencies={["password"]}
              hasFeedback
              rules={[
                { required: true, message: "Please confirm your password!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(
                        "The two passwords that you entered do not match!"
                      )
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="Confirm Password"
                className="rounded-full py-2"
              />
            </Form.Item>

            {/* Select Building */}
            <Form.Item
              name="building"
              rules={[{ required: true, message: "Please select a building!" }]}
            >
              <Select
                placeholder="Select Building"
                onChange={onBuildingChange}
                className="rounded-full"
              >
                {buildings.map((building) => (
                  <Select.Option key={building.id} value={building.id}>
                    {building.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="room"
              rules={[{ required: true, message: "Please select a room!" }]}
            >
              <Select
                placeholder="Select Room"
                disabled={!selectedBuilding}
                className="rounded-full"
              >
                {rooms.length > 0 ? (
                  rooms.map((room) => (
                    <Select.Option key={room.id} value={room.id}>
                      {room.roomNumber || "Room Number Not Available"}
                    </Select.Option>
                  ))
                ) : (
                  <Select.Option disabled>No available rooms</Select.Option>
                )}
              </Select>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full bg-sky-700 hover:bg-sky-400 text-white font-semibold rounded-full py-2"
                style={{ transition: "background-color 0.3s ease" }}
              >
                Register
              </Button>

              <Button
                onClick={handleGoogleSignIn}
                className="bg-blue-50 hover:bg-blue-50 text-blue-500 font-semibold rounded-full transition duration-300 ease-in-out mt-4"
                block
              >
                Sign in with Google
              </Button>

              <div className="mt-6 text-sm text-sky-50 ">
                Already have an account?{" "}
                <a href="/login" className="text-cyan-100 hover: font-medium">
                  Login
                </a>
              </div>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}
