import React from "react";
import { Row, Col, Card } from 'antd';
import { Input, Button } from "antd";
import { Layout } from "antd";
import HeaderMain from "../../components/common/HeaderMain";

const { Content } = Layout;
function AppContact() {
  return (
    <Layout>
    <HeaderMain/>
    <Content style={{ padding: "0 16px", marginTop: "16px" }}>
    <Content>
<div className="container mx-auto py-16">
  <div className="grid grid-cols-2 gap-12"> 
    
   
    <div className="flex flex-col justify-center">
      <h1 className="text-5xl font-extrabold text-gray-900 mb-8"> 
        We’re changing the way people connect.
      </h1>
      <p className="text-xl text-gray-700 mb-8 leading-relaxed"> 
        Cupidatat minim id magna ipsum sint dolor qui. Sunt sit in quis cupidatat mollit aute velit. Et labore commodo nulla aliqua proident mollit ullamco exercitation tempor.
      </p>
      <div className="flex space-x-6"> 
        <Button type="primary" size="large" className="bg-blue-600 text-white rounded-lg px-6 py-3 font-semibold">
          Get started
        </Button>
        <Button type="link" size="large" className="text-blue-600 font-semibold">
          Read more →
        </Button>
      </div>
    </div>
    
  </div>
</div>
</Content>
    <div className="bg-gray-50 py-16">

      <div className="container mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold">Contact Us</h1>
      </div>

      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card hoverable className="text-center p-6 bg-white shadow-lg rounded-lg">
          <h3 className="text-xl font-bold">+ (654) 6455 654</h3>
          <p className="mt-2 text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
          <Button type="link">Learn More</Button>
        </Card>
        <Card hoverable className="text-center p-6 bg-white shadow-lg rounded-lg">
          <h3 className="text-xl font-bold">mail@txtils.com</h3>
          <p className="mt-2 text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
          <Button type="link">Learn More</Button>
        </Card>
        <Card hoverable className="text-center p-6 bg-white shadow-lg rounded-lg">
          <h3 className="text-xl font-bold">London Eye, UK</h3>
          <p className="mt-2 text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
          <Button type="link">Learn More</Button>
        </Card>
      </div>

      <div className="container mx-auto text-center mt-16 flex justify-center">
        <div className="text-center w-full max-w-xl bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold mb-4">Get In Touch</h2>
          <p className="text-lg mb-8 text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>

          <div className="grid grid-cols-1 gap-6">
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Input placeholder="Email" size="large" className="rounded-md p-2 border-gray-300 focus:border-blue-500" />
              </Col>
              <Col xs={24}>
                <Input placeholder="Phone" size="large" className="rounded-md p-2 border-gray-300 focus:border-blue-500" />
              </Col>
              <Col xs={24}>
                <Input placeholder="Name" size="large" className="rounded-md p-2 border-gray-300 focus:border-blue-500" />
              </Col>
              <Col xs={24}>
                <Input.TextArea placeholder="Message" rows={4} size="large" className="rounded-md p-2 border-gray-300 focus:border-blue-500" />
              </Col>
              <Col xs={24}>
                <Button type="primary" size="large" className="w-full rounded-md shadow-md">
                  Submit
                </Button>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </div>
    </Content>
    </Layout>
  );
}

export default AppContact;
