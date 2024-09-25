import React from "react";
import { Layout, Col, Divider, Row } from "antd";
import image5 from "../../assets/img/home/ap5.jpg";
import image2 from "../../assets/img/home/ap2.jpg";
import image3 from "../../assets/img/home/ap3.jpg";
import image4 from "../../assets/img/home/ap4.jpg";
import HeaderHomepage from "../../components/layout/Main/header";
import { Footer } from "../../components/common/Footer";
import "../../assets/styles/home.css";
const { Content } = Layout;

const DemoBox = ({ src, alt }) => (
  <div className="image-box">
    <img src={src} alt={alt} className="image" />
  </div>
);

export default function Homepage() {
  return (
    <Layout>
      <HeaderHomepage />
      <Content style={{ padding: "0 50px", marginTop: "24px" }}>
        <Divider orientation="left">Homey</Divider>
        <Row justify="space-around" align="middle" gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6} lg={6}>
            <DemoBox src={image5} alt="Image 1" />
          </Col>
          <Col xs={24} sm={12} md={6} lg={6}>
            <DemoBox src={image2} alt="Image 2" />
          </Col>
          <Col xs={24} sm={12} md={6} lg={6}>
            <DemoBox src={image3} alt="Image 3" />
          </Col>
          <Col xs={24} sm={12} md={6} lg={6}>
            <DemoBox src={image4} alt="Image 4" />
          </Col>
        </Row>
      </Content>
      <Footer />
    </Layout>
  );
}
