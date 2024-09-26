import React from "react";
import {  Row, Col, Card } from 'antd';
import {  Input, Button } from "antd";


function AppContact() {
  return (
    <div className="bg-gray-50 py-16">
      {/* Contact Us Header */}
      <div className="container mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold">Contact Us</h1>
      </div>

      {/* Contact Cards */}
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card hoverable className="text-center p-6 bg-white">
          <h3 className="text-xl font-bold">+ (654) 6455 654</h3>
          <p className="mt-2">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
          <Button type="link">Learn More</Button>
        </Card>
        <Card hoverable className="text-center p-6 bg-white">
          <h3 className="text-xl font-bold">mail@txtils.com</h3>
          <p className="mt-2">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
          <Button type="link">Learn More</Button>
        </Card>
        <Card hoverable className="text-center p-6 bg-white">
          <h3 className="text-xl font-bold">London Eye, UK</h3>
          <p className="mt-2">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
          <Button type="link">Learn More</Button>
        </Card>
      </div>

      {/* Get In Touch Section */}
      <div className="container mx-auto text-center mt-16">
        <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>
        <p className="text-lg mb-8">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>

        {/* Contact Form */}
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Input placeholder="Email" size="large" />
            </Col>
            <Col xs={24}>
              <Input placeholder="Phone" size="large" />
            </Col>
            <Col xs={24}>
              <Input placeholder="Name" size="large" />
            </Col>
            <Col xs={24}>
              <Input.TextArea placeholder="Message" rows={4} size="large" />
            </Col>
            <Col xs={24}>
              <Button type="primary" size="large" className="w-full">
                Submit
              </Button>
            </Col>
          </Row>
        </div>
      </div>
      </div>

  
)
}

export default AppContact;
