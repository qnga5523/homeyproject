import React from "react";
import { Layout, Col, Divider, Row } from "antd";
import image2 from "../../assets/img/home/ap2.jpg";
import image3 from "../../assets/img/home/ap3.jpg";
import image4 from "../../assets/img/home/ap4.jpg";
import image1 from "../../assets/img/home/ap1.jpg";
import backgroundImage from "../../assets/img/home/picture.jpg";
import HeaderHomepage from "../../components/layout/Main/header";
import graph from "../../assets/img/home/graph.svg";
import hand from "../../assets/img/home/hand-money.svg";
import man from "../../assets/img/home/man-paperwork.svg";
import { Footer } from "../../components/common/Footer";
import "../../assets/styles/home.css";
import { Button, Card } from "antd";
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
      <Content style={{ padding: "0 16px", marginTop: "16px" }}>
        <Content
          className="py-44 bg-origin-padding bg-cover "
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}
        >
          <div className="container mx-auto text-center text-white">
            <h1 className="text-5xl font-bold">
              We Build Luxury Homes in Spokane
            </h1>
            <p className="text-xl mt-4">At Affordable Prices</p>
            <Button type="primary" size="large" className="mt-6">
              Let's find out more
            </Button>
          </div>
        </Content>

        <Content className="py-16 bg-white">
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 rounded-full size-6">
                  <img src={graph} alt="graph" />
                </div>
                <h3 className="text-xl font-bold mt-4">Competitive rates</h3>
                <p className="text-gray-500 text-center">
                  Strong rates, no hidden fees, and total transparency to keep
                  you informed and up to date.
                </p>
              </div>
            </Col>
            <Col span={8}>
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 rounded-full">
                  <img src={hand} alt="graph" />
                </div>
                <h3 className="text-xl font-bold mt-4">
                  Low down payment options
                </h3>
                <p className="text-gray-500 text-center">
                  We offer a variety of loan options to meet your needs and help
                  make home ownership more affordable.
                </p>
              </div>
            </Col>
            <Col span={8}>
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 rounded-full">
                  <img src={man} alt="graph" />
                </div>
                <h3 className="text-xl font-bold mt-4">
                  Top-rated loan officers
                </h3>
                <p className="text-gray-500 text-center">
                  With a 4.8-star average rating, our loan officers provide
                  step-by-step guidance and expertise in first-time home buying.
                </p>
              </div>
            </Col>
          </Row>
        </Content>

        {/* Expertise Section */}
        <Content className="py-16 bg-white">
          <div className="container mx-auto grid grid-cols-2 gap-8">
            <div>
              <h2 className="text-3xl font-bold">Our Expertise</h2>
              <p className="mt-4 text-lg">
                Architecture and building construction are essential fields that
                shape the environments where we live, work, and play. This
                comprehensive guide delves into the core aspects of
                architecture, its historical evolution, key principles, and the
                basics of building construction. Additionally, we will explore
                how architecture intersects with other disciplines like interior
                design, urban planning, and landscape architecture to create
                functional, safe, and aesthetically pleasing structures.
                Real-world examples, practical tips, and a detailed overview of
                the construction process will provide a thorough understanding
                of these interconnected fields.
              </p>
              <Button type="primary" size="large" className="mt-6">
                About us
              </Button>
            </div>
            <div>
              <Col>
                <DemoBox src={image1} alt="Image 3" />
              </Col>
            </div>
          </div>
        </Content>
        <Content className="py-16 bg-white">
          <div className="container mx-auto grid grid-cols-2 gap-8">
            {/* Images on the left */}
            <div>
              <Row justify="space-around" align="middle" gutter={[16, 16]}>
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
            </div>

            {/* Text on the right */}
            <div>
              <h2 className="text-3xl font-bold">Our Expertise</h2>
              <p className="mt-4 text-lg">
                At Luxury Homes, we strive for excellence and quality. Our team
                is dedicated to innovation, craftsmanship, and customer
                satisfaction.
              </p>
            </div>
          </div>
        </Content>

        {/* Details Section */}
        <Content className="py-16 bg-gray-100">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold">Event</h2>
            <div className="grid grid-cols-3 gap-4 mt-8">
              <Card hoverable>
                <img
                  src="https://via.placeholder.com/200x200" // Replace with your image
                  alt="Portfolio"
                />
                <h3 className="mt-2">Portfolio</h3>
              </Card>
              <Card hoverable>
                <img
                  src="https://via.placeholder.com/200x200" // Replace with your image
                  alt="Plans"
                />
                <h3 className="mt-2">Plans</h3>
              </Card>
              <Card hoverable>
                <img
                  src="https://via.placeholder.com/200x200" // Replace with your image
                  alt="Lots"
                />
                <h3 className="mt-2">Available Lots</h3>
              </Card>
            </div>
          </div>
        </Content>
        <Content>
          <Divider
            orientation="left"
            plain
            className="container mx-auto text-center"
          >
            <h2 className="text-4xl font-bold">Features</h2>
          </Divider>
          <div>
            <Col xs={24} sm={12} md={6} lg={6}>
              <DemoBox src={image1} alt="Image 1" />
            </Col>
          </div>
        </Content>
      </Content>
      <Footer />
    </Layout>
  );
}
