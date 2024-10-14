import React, { useEffect, useState } from "react";
import { Button, Form, Input, Select } from "antd";
import { auth, db } from "../../Services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { toast } from "react-toastify";
import {
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
} from "firebase/firestore";
import picture from "../../assets/img/logo/03.jpg";
import { getMessaging, getToken } from "firebase/messaging";

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
        const messaging = getMessaging(); // Initialize Firebase Messaging
        const token = await getToken(messaging, {
          vapidKey: "YOUR_VAPID_KEY_HERE", // Replace with your VAPID key
        });

        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
          Username: name,
          Phone: phone,
          room: room,
          building: building,
          role: "owner",
          approved: false,
          notificationToken: token,
        });
      }
      console.log("User Registered Successfully!!");
      toast.success("User Registered Successfully!!", {
        position: "top-center",
      });
    } catch (error) {
      console.log(error.message);
      toast.error(error.message, {
        position: "bottom-center",
      });
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
    <div className="flex w-screen min-h-screen bg-sky-600">
      <div
        className="w-1/2 flex items-center justify-center bg-cover bg-no-repeat bg-center shadow-2xl"
        style={{
          backgroundImage: `url(${picture})`,
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
        }}
      ></div>

      <div className="flex w-1/2 items-center justify-center bg-white/50 backdrop-blur-sm p-8">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-6 text-center">
          <div>
            <h4 className="text-lg font-bold mb-4">Sign up to your account</h4>
          </div>

          <Form
            className="register-form"
            form={form}
            name="register"
            initialValues={{ remember: true }}
            onFinish={onFinish}
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="name"
              label="UserName"
              tooltip="What do you want others to call you?"
              rules={[
                {
                  required: true,
                  message: "Please input your nickname!",
                  whitespace: true,
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="phone"
              label=" Number Phone"
              rules={[
                {
                  required: true,
                  message: "Please input your phone number!",
                },
              ]}
            >
              <Input
                addonBefore={prefixSelector}
                style={{
                  width: "100%",
                }}
              />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please input your Password!" },
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="confirm"
              label="Confirm Password"
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
              <Input.Password />
            </Form.Item>

            {/* Select Building */}
            <Form.Item
              label="Choose Building"
              name="building"
              rules={[{ required: true, message: "Please select a building!" }]}
            >
              <Select
                placeholder="Select a building"
                onChange={onBuildingChange}
              >
                {buildings.map((building) => (
                  <Select.Option key={building.id} value={building.id}>
                    {building.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Choose Room"
              name="room"
              rules={[{ required: true, message: "Please select a room!" }]}
            >
              <Select placeholder="Select a room" disabled={!selectedBuilding}>
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
              <Button type="primary" htmlType="submit">
                Register
              </Button>
              or <a href="/login"> Login</a>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}
