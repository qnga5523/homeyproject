import React from "react";
import HeaderMain from "../../../components/common/HeaderMain";
import SiderOwner from "../../../components/layout/Owner/SiderOwner";
import { Layout, theme } from "antd";

const { Content } = Layout;
export default function OwnersDashboard() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <HeaderMain />
      <Layout>
        <SiderOwner />

        <Layout style={{ padding: "0 24px 24px", flexGrow: 1 }}>
          {" "}
          <Content
            style={{
              margin: "24px 0",
              padding: 24,
              minHeight: "calc(100vh - 112px)",
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          ></Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
