import React, { useState } from "react";
import { Layout, Menu } from "antd";

import {
  InsertRowAboveOutlined,
  IdcardOutlined,
  CarryOutOutlined,
  FundViewOutlined,
  FileTextOutlined,
  BellOutlined,
  CloudServerOutlined,
  TruckOutlined,
  FormOutlined
} from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Sider } = Layout;

const items = [
  {
    key: "1",
    icon: <InsertRowAboveOutlined />,
    label: <Link to="/owner/event">Event</Link>,
  },
  {
    key: "2",
    icon: <IdcardOutlined />,
    label: <Link to="/owner/profile">Profile</Link>,
  },
  {
    key: "3",
    icon: <BellOutlined />,
    label: <Link to="/owner/notification">Notifications</Link>,
  },
  {
    key: "4",
     label: <Link to="/owner/book">Book Services</Link>,
    icon: <CarryOutOutlined />,
  },
  {
    key: "5",
    label: <Link to="/owner/feehistory">Service Fee</Link>,
    icon: <FundViewOutlined />,
  },
  {
    key: "6",
    label: <Link to="/owner/feedback">Feedback</Link>,
    icon: <FileTextOutlined />,
  },
  {
    key: "8",
    icon: <TruckOutlined />,
    label: <Link to="/owner/vehicleregister">Public Transportation</Link>,
  },
  {
    key: "9",
    icon: <CloudServerOutlined />,
    label: <Link to="/owner/dataStatistics">Data Statistics</Link>,   
  },
  {
    key: "10",
    icon: <FormOutlined />,
    label: <Link to="/owner/changepassword">Change Password</Link>,   
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
        background: "#f8fafc",
        height: "100vh",
      }}
    >
      <Menu
        mode="inline"
        theme="light"
        items={items}
        style={{ height: "100%" }}
      />
    </Sider>
  );
}
