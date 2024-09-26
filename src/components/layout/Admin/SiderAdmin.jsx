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
    label: <Link to="/admin/requestAccount">Request Accounts</Link>,
  },
  {
    key: "3",
    icon: <TeamOutlined />,
    label: <Link to="/admin/managementAccount">Management Customers</Link>,
  },
  {
    key: "sub1",
    label: "Data Catalog",
    icon: <DatabaseOutlined />,
    children: [
      {
        key: "4",
        icon: <ContainerOutlined />,
        label: <Link to="/admin/setPrice">Service Pricing</Link>,
      },
      {
        key: "5",
        icon: <ApartmentOutlined />,
        label: <Link to="/admin/listapart">Apartment/Room</Link>,
      },
      {
        key: "6",
        icon: <BankOutlined />,
        label: <Link to="/admin/add">Building</Link>,
      },
    ],
  },
  {
    key: "sub2",
    label: "Security Management",
    icon: <SafetyOutlined />,
    children: [
      {
        key: "7",
        icon: <SolutionOutlined />,
        label: <Link to="/feedback">Feedback</Link>,
      },
      {
        key: "8",
        icon: <CarryOutOutlined />,
        label: <Link to="/book-event">Book Event</Link>,
      },
    ],
  },
  {
    key: "sub3",
    label: "Finance",
    icon: <DollarOutlined />,
    children: [
      {
        key: "9",
        icon: <FundViewOutlined />,
        label: <Link to="/admin/setFee">Service Fee</Link>,
      },
      {
        key: "10",
        icon: <FileTextOutlined />,
        label: <Link to="/bills">Bills</Link>,
      },
      {
        key: "11",
        icon: <BellOutlined />,
        label: <Link to="/notifications">Notifications</Link>,
      },
      {
        key: "12",
        label: "Data Statistics",
        icon: <CloudServerOutlined />,
        children: [
          {
            key: "13",
            label: <Link to="/chart">Chart</Link>,
            icon: <PieChartOutlined />,
          },
          {
            key: "14",
            label: <Link to="/table">Table</Link>,
            icon: <InsertRowAboveOutlined />,
          },
        ],
      },
    ],
  },
  {
    key: "15",
    icon: <SettingOutlined />,
    label: <Link to="/settings">Setting</Link>,
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
        background: "#f8fafc",
        height: "100vh", // Ensure the height takes up the full page
      }}
    >
      <Menu
        mode="inline"
        defaultSelectedKeys={["1"]}
        items={items}
        style={{ height: "100%" }} // Ensure the menu takes up the full height of the sider
      />
    </Sider>
  );
}
