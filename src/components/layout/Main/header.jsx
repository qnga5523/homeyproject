import React from "react";
import { Layout, Menu } from "antd";
import { Link } from "react-router-dom";

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
        </Menu>
      </Header>
    </Layout>
  );
}
