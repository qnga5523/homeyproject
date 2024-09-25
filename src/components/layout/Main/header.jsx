import React from "react";
import { Layout, Menu } from "antd";
import { Link } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";
import { Avatar, Space } from "antd";

const { Header } = Layout;

export default function HeaderHomepage() {
  return (
    <Layout>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          background: "#001529",
        }}
      >
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={["1"]}
          style={{
            flex: 1,
            justifyContent: "center",
          }}
        >
          <Menu.Item key="home">
            <Link to="/">Home</Link>
          </Menu.Item>
          <Menu.Item key="about">
            <Link to="/about">About us</Link>
          </Menu.Item>
          <Menu.Item key="feature">
            <Link to="/features">Features</Link>
          </Menu.Item>
          <Menu.Item key="instruct">
            <Link to="/instruct">Instruction</Link>
          </Menu.Item>
          <Menu.Item key="contact">
            <Link to="/contact">Contact</Link>
          </Menu.Item>
          <Menu.Item key="signup">
            <Link to="/signup">Signup</Link>
          </Menu.Item>
          <Menu.Item key="login">
            <Link to="/login">Login</Link>
          </Menu.Item>
        </Menu>
        <Space direction="vertical" size={16}>
          <Space wrap size={16}>
            <Avatar size={64} icon={<UserOutlined />} />
          </Space>
        </Space>
      </Header>
    </Layout>
  );
}
