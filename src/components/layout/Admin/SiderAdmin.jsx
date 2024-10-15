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
    icon: <InsertRowAboveOutlined style={{ fontSize: "20px" }} /> ,
    label: <Link to="/event">Event</Link>,
  },
  {
    key: "2",
    icon: <IdcardOutlined style={{ fontSize: "20px" }} />,
    label: <Link to="/admin/requestAccount">Request Accounts</Link>,
  },
  {
    key: "3",
    icon: <TeamOutlined style={{ fontSize: "20px" }} />,
    label: <Link to="/admin/managementAccount">Management Customers</Link>,
  },
  {
    key: "4",
    label: "Data Catalog",
    icon: <DatabaseOutlined  style={{ fontSize: "20px" }}/>,
    children: [
      {
        key: "5",
        icon: <ContainerOutlined  style={{ fontSize: "20px" }}/>,
        label: "Service Pricing",
        children: [
          {
            key: "6",
            icon: <HeartOutlined style={{ fontSize: "20px" }} />,
            label: <Link to="/admin/water">Prices Water</Link>,
          },
          {
            key: "7",
            icon: <FormatPainterOutlined style={{ fontSize: "20px" }}/>,
            label: <Link to="/admin/clean">Prices Clean</Link>,
          },
          {
            key: "8",
            icon: <GoldOutlined style={{ fontSize: "20px" }} />,
            label: <Link to="/admin/parking">Prices Parking</Link>,
          },
        ],
      },
      {
        key: "9",
        icon: <ApartmentOutlined style={{ fontSize: "20px" }}/>,
        label: <Link to="/admin/listapart">Apartment/Room</Link>,
      },
      {
        key: "10",
        icon: <BankOutlined style={{ fontSize: "20px" }} />,
        label: <Link to="/admin/add">Building</Link>,
      },
    ],
  },
  {
    key: "11",
    label: "Security Management",
    icon: <SafetyOutlined style={{ fontSize: "20px" }}/>,
    children: [
      {
        key: "12",
        icon: <SolutionOutlined style={{ fontSize: "20px" }} />,
        label: <Link to="/feedback">Feedback</Link>,
      },
      {
        key: "13",
        icon: <CarryOutOutlined style={{ fontSize: "20px" }} />,
        label: <Link to="/book-event">Book Event</Link>,
      },
    ],
  },
  {
    key: "14",
    label: "Finance",
    icon: <DollarOutlined style={{ fontSize: "20px" }}/>,
    children: [
      {
        key: "15",
        icon: <FundViewOutlined style={{ fontSize: "20px" }} />,
        label: <Link to="/admin/setFee">Service Fee</Link>,
      },
      {
        key: "16",
        icon: <FileTextOutlined style={{ fontSize: "20px" }}/>,
        label: <Link to="/bills">Bills</Link>,
      },
      {
        key: "17",
        icon: <BellOutlined style={{ fontSize: "20px" }}/>,
        label: <Link to="/notifications">Notifications</Link>,
      },
      {
        key: "18",
        label: "Data Statistics",
        icon: <CloudServerOutlined style={{ fontSize: "20px" }}/>,
        children: [
          {
            key: "19",
            label: <Link to="/chart">Chart</Link>,
            icon: <PieChartOutlined style={{ fontSize: "20px" }}/>,
          },
          {
            key: "20",
            label: <Link to="/table">Table</Link>,
            icon: <InsertRowAboveOutlined style={{ fontSize: "20px" }}/>,
          },
        ],
      },
    ],
  },
  {
    key: "21",
    icon: <SettingOutlined style={{ fontSize: "20px" }}/>,
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
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Menu
        mode="inline"
        defaultSelectedKeys={["1"]}
        items={items}
        style={{    
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between", 
          paddingBottom: "50px", }} 
      />
    </Sider>
  );
}
