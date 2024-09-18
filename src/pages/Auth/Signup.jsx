import React from "react";
import { Button, Checkbox, Form, Input, Select } from "antd";
import { auth, db } from "../../Services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { toast } from "react-toastify";
import { doc, setDoc } from "firebase/firestore";
import background from "../../assets/img/logo/background.jpg";

import logoicon from "../../assets/img/logo/iconlogo.png";
export default function Signup() {
  const [form] = Form.useForm();
  const onFinish = async (values) => {
    const { email, password, phone, name, room, building } = values;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      console.log(user);
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

  const tailFormItemLayout = {
    wrapperCol: {
      xs: {
        span: 24,
        offset: 0,
      },
      sm: {
        span: 16,
        offset: 8,
      },
    },
  };

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
            <h4 className="text-lg font-bold mb-4">Sign up to your account</h4>
          </div>

          {/* form */}
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
              tooltip="Please input your email!"
              rules={[{ required: true, message: "Please input your email!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Password"
              tooltip="Please input your Password!"
              name="password"
              rules={[
                { required: true, message: "Please input your Password!" },
              ]}
            >
              <Input type="password" placeholder="Password" />
            </Form.Item>

            <Form.Item
              name="confirm"
              label="Confirm Password"
              dependencies={["password"]}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please confirm your password!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(
                        "The new password that you entered do not match!"
                      )
                    );
                  },
                }),
              ]}
            >
              <Input.Password />
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
              label="Choose Building"
              name="building"
              rules={[
                {
                  required: true,
                  message: "Please input!",
                },
              ]}
            >
              <Select placeholder="Select an apartment">
                <Select.Option value="CT1/D22">CT1/D22</Select.Option>
                <Select.Option value="CT2/D22">CT2/D22</Select.Option>
                <Select.Option value="CT3/D22">CT3/D22</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="room"
              label="Apartment"
              tooltip="Please input!"
              rules={[
                {
                  required: true,
                  message: "Please input!",
                  whitespace: true,
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="agreement"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(new Error("Should accept agreement")),
                },
              ]}
              {...tailFormItemLayout}
            >
              <Checkbox>
                I have read the <a href="/">agreement</a>
              </Checkbox>
            </Form.Item>
            <Form.Item {...tailFormItemLayout}>
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
