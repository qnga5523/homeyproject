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
  HeartOutlined,
  FormatPainterOutlined,
  GoldOutlined,
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
    key: "4",
    label: "Data Catalog",
    icon: <DatabaseOutlined />,
    children: [
      {
        key: "5",
        icon: <ContainerOutlined />,
        label: "Service Pricing",
        children: [
          {
            key: "6",
            icon: <HeartOutlined />,
            label: <Link to="/admin/water">Prices Water</Link>,
          },
          {
            key: "7",
            icon: <FormatPainterOutlined />,
            label: <Link to="/admin/clean">Prices Clean</Link>,
          },
          {
            key: "8",
            icon: <GoldOutlined />,
            label: <Link to="/admin/parking">Prices Parking</Link>,
          },
        ],
      },
      {
        key: "9",
        icon: <ApartmentOutlined />,
        label: <Link to="/admin/listapart">Apartment/Room</Link>,
      },
      {
        key: "10",
        icon: <BankOutlined />,
        label: <Link to="/admin/add">Building</Link>,
      },
    ],
  },
  {
    key: "11",
    label: "Security Management",
    icon: <SafetyOutlined />,
    children: [
      {
        key: "12",
        icon: <SolutionOutlined />,
        label: <Link to="/feedback">Feedback</Link>,
      },
      {
        key: "13",
        icon: <CarryOutOutlined />,
        label: <Link to="/book-event">Book Event</Link>,
      },
    ],
  },
  {
    key: "14",
    label: "Finance",
    icon: <DollarOutlined />,
    children: [
      {
        key: "15",
        icon: <FundViewOutlined />,
        label: <Link to="/admin/setFee">Service Fee</Link>,
      },
      {
        key: "16",
        icon: <FileTextOutlined />,
        label: <Link to="/bills">Bills</Link>,
      },
      {
        key: "17",
        icon: <BellOutlined />,
        label: <Link to="/notifications">Notifications</Link>,
      },
      {
        key: "18",
        label: "Data Statistics",
        icon: <CloudServerOutlined />,
        children: [
          {
            key: "19",
            label: <Link to="/chart">Chart</Link>,
            icon: <PieChartOutlined />,
          },
          {
            key: "20",
            label: <Link to="/table">Table</Link>,
            icon: <InsertRowAboveOutlined />,
          },
        ],
      },
    ],
  },
  {
    key: "21",
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
