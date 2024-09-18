import React, { useState } from "react";
import { Layout, Menu } from "antd";

import {
  InsertRowAboveOutlined,
  IdcardOutlined,
  TeamOutlined,
  DatabaseOutlined,
  SafetyOutlined,
  DollarOutlined,
  SettingOutlined,
  BankOutlined,
  ApartmentOutlined,
  SolutionOutlined,
  CarryOutOutlined,
  FundViewOutlined,
  FileTextOutlined,
  BellOutlined,
  CloudServerOutlined,
  PieChartOutlined,
  ContainerOutlined,
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
    label: "Management Accounts",
  },
  {
    key: "3",
    icon: <TeamOutlined />,
    label: "Customers",
  },
  {
    key: "sub1",
    label: "Data Catalog",
    icon: <DatabaseOutlined />,
    children: [
      { key: "4", icon: <ContainerOutlined />, label: "Service Pricing" },
      { key: "5", icon: <ApartmentOutlined />, label: "Apartment/Room" },
      { key: "6", icon: <BankOutlined />, label: "Building" },
    ],
  },
  {
    key: "sub2",
    label: "Security Management",
    icon: <SafetyOutlined />,
    children: [
      { key: "7", icon: <SolutionOutlined />, label: "Feedback" },
      { key: "8", icon: <CarryOutOutlined />, label: "Book Event" },
    ],
  },
  {
    key: "sub3",
    label: "Finance",
    icon: <DollarOutlined />,
    children: [
      { key: "9", icon: <FundViewOutlined />, label: "Service Fee" },
      { key: "10", icon: <FileTextOutlined />, label: "Bills" },
      { key: "11", icon: <BellOutlined />, label: "Notifications" },
      {
        key: "12",
        label: "Data Statistics",
        icon: <CloudServerOutlined />,
        children: [
          { key: "13", label: "Chart", icon: <PieChartOutlined /> },
          { key: "14", label: "Table", icon: <InsertRowAboveOutlined /> },
        ],
      },
    ],
  },
  {
    key: "15",
    icon: <SettingOutlined />,
    label: "Setting",
  },
];

export default function SiderAdmin() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      width={240}
      style={{
        background: "#fca5a5",
        height: "100vh", // Đảm bảo chiều cao bằng toàn bộ trang
      }}
    >
      <Menu
        mode="inline"
        defaultSelectedKeys={["1"]}
        items={items}
        style={{ height: "100%" }} // Đảm bảo menu chiếm toàn bộ chiều cao của sider
      />
    </Sider>
  );
}
