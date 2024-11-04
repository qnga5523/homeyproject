import React from "react";
import { Layout, Menu, Badge } from "antd";
import { Link } from "react-router-dom";
import { BellOutlined } from "@ant-design/icons";
import AvatarOwner from "../layout/Owner/AvatarOwner";
import logo from "../../assets/img/logo/logo.jpg"; 

const { Header } = Layout;

export default function HeaderMain() {
  return (
    <Layout>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          background: "#082f49",
        }}
      >
      
        <div style={{ marginRight: "18px" }}>
          <Link to="/">
            <img
              src={logo}
              alt="Logo"
              style={{ height: "50px", width: "auto" }} 
            />
          </Link>
        </div>

      
        <Menu
          theme=""
          mode="horizontal"
          defaultSelectedKeys={["1"]}
          style={{
            flex: 1,
            justifyContent: "center",
          }}
          
        >
          <Menu.Item key="home">
            <Link className="text-slate-100 no-underline hover:underline" to="/">Home</Link>
          </Menu.Item>
          <Menu.Item key="about">
            <Link className="text-slate-100 no-underline hover:underline" to="/about">About us</Link>
          </Menu.Item>
          <Menu.Item key="feature">
            <Link className="text-slate-100 no-underline hover:underline" to="/features">Features</Link>
          </Menu.Item>
          <Menu.Item key="instruct">
            <Link className="text-slate-100 no-underline hover:underline" to="/instruct">Instruction</Link>
          </Menu.Item>
          <Menu.Item key="contact">
            <Link  className="text-slate-100 no-underline hover:underline" to="/contact">Contact</Link>
          </Menu.Item>
        </Menu>

      
        <div style={{ display: "flex", alignItems: "center", marginLeft: "auto" }}>
          <Badge overflowCount={10} style={{ marginRight: "20px" }}>
            <BellOutlined  className="pr-4"style={{ fontSize: "24px", color: "white" }} />
          </Badge>

      
          <AvatarOwner />
        </div>
      </Header>
    </Layout>
  );
}
