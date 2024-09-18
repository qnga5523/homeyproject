import React, { useState } from "react";
import { Layout, Menu } from "antd";

import {
  InsertRowAboveOutlined,
  IdcardOutlined,
  SettingOutlined,
  CarryOutOutlined,
  FundViewOutlined,
  FileTextOutlined,
  BellOutlined,
  CloudServerOutlined,
  PieChartOutlined,
  TruckOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Sider } = Layout;

const items = [
  {
    key: "1",
    icon: <InsertRowAboveOutlined />,
    label: <Link to="/event">Event</Link>,
  },
  {
    key: "2",
    icon: <IdcardOutlined />,
    label: "Profile",
  },
  {
    key: "3",
    icon: <BellOutlined />,
    label: "Notifications",
  },
  {
    key: "4",
    label: "Book Services",
    icon: <CarryOutOutlined />,
  },
  {
    key: "5",
    label: "Service Fee",
    icon: <FundViewOutlined />,
  },
  {
    key: "6",
    label: "Bills",
    icon: <FileTextOutlined />,
  },
  {
    key: "7",
    label: "Data Statistics",
    icon: <CloudServerOutlined />,
    children: [
      { key: "13", label: "Chart", icon: <PieChartOutlined /> },
      { key: "14", label: "Table", icon: <InsertRowAboveOutlined /> },
    ],
  },
  {
    key: "8",
    icon: <TruckOutlined />,
    label: "Public Transportation",
  },

  {
    key: "9",
    icon: <SettingOutlined />,
    label: "Setting",
  },
];

export default function SiderOwner() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      width={240}
      style={{
        background: "#fca5a5",
        height: "100vh",
      }}
    >
      <Menu
        mode="inline"
        theme="light"
        defaultSelectedKeys={["1"]}
        items={items}
        style={{ height: "100%" }}
      />
    </Sider>
  );
}
