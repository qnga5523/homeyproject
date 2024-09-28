import React from "react";
import { Layout, Row, Col } from "antd";
import { Button, Typography, Input } from "antd";
import backgroundImage from "../../assets/img/home/picture.jpg";
const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;
export default function Feature() {
  return (
    <Layout>
      <Header className="bg-blue-500 text-white">Zillow Home Loans</Header>
      <Content className="py-16 bg-white">
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 bg-green-500 rounded-full"></div>
              <h3 className="text-xl font-bold mt-4">Competitive rates</h3>
              <p className="text-gray-500">
                Strong rates, no hidden fees, and total transparency to keep you
                informed and up to date.
              </p>
            </div>
          </Col>
          <Col span={8}>
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 bg-yellow-500 rounded-full"></div>
              <h3 className="text-xl font-bold mt-4">
                Low down payment options
              </h3>
              <p className="text-gray-500">
                We offer a variety of loan options to meet your needs and help
                make home ownership more affordable.
              </p>
            </div>
          </Col>
          <Col span={8}>
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 bg-purple-500 rounded-full"></div>
              <h3 className="text-xl font-bold mt-4">
                Top-rated loan officers
              </h3>
              <p className="text-gray-500">
                With a 4.8-star average rating, our loan officers provide
                step-by-step guidance and expertise in first-time home buying.
              </p>
            </div>
          </Col>
        </Row>
      </Content>
      <Content className="p-4">
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <div className="flex flex-col items-center justify-center h-full p-4">
              <Title level={2} className="text-center">
                Discover Your New Home
              </Title>
              <Paragraph className="text-center mt-2">
                Helping 100 million renters find their perfect fit.
              </Paragraph>
              <div className="flex items-center mt-4">
                <Input placeholder="Chicago, IL" className="w-full" />
                <Button type="primary" className="ml-2">
                  Search
                </Button>
              </div>
            </div>
          </Col>
          <Col span={12}>
            <img
              src=" "
              alt="Cityscape"
              className="w-full h-full object-cover"
            />
          </Col>
        </Row>
      </Content>
      <Footer className="bg-gray-100 text-gray-700 py-4">
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Paragraph className="text-center">Menu</Paragraph>
          </Col>
          <Col span={6}>
            <Paragraph className="text-center">Manage Rentals</Paragraph>
          </Col>
          <Col span={6}>
            <Paragraph className="text-center">Sign Up / Sign In</Paragraph>
          </Col>
          <Col span={6}>
            <Paragraph className="text-center">Add a Property</Paragraph>
          </Col>
        </Row>
      </Footer>
    </Layout>
  );
}
