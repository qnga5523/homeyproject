import React from "react";
import { Layout, Card } from "antd";

const { Header, Content, Footer } = Layout;
export default function Aboutus() {






  return (
    <Layout>
      {/* Hero Section */}
      <Header className="bg-white shadow-md relative">
        <div className="relative overflow-hidden">
          <img
            src="https://via.placeholder.com/1920x600" // Replace with your actual image
            alt="Hero"
            className="w-full h-96 object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <h1 className="text-white text-5xl font-bold">Creating Quality Stone Products</h1>
          </div>
        </div>
      </Header>

      {/* About Content Section */}
      <Content className="py-16 bg-white">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl font-bold mb-6">About Our Company</h2>
          <p className="text-lg text-gray-700 mb-8">
            At our company, we are passionate about designing and creating top-quality stone products. 
            Our commitment to excellence is reflected in every project we undertake.
          </p>
        </div>

        {/* Product Range Section */}
        <div className="container mx-auto grid grid-cols-2 gap-8 mt-16">
          <div>
            <img
              src="https://via.placeholder.com/600x400" // Replace with your image
              alt="Product Range"
              className="rounded-lg shadow-lg"
            />
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="text-3xl font-bold mb-4">Product Range</h3>
            <p className="text-lg text-gray-600">
              We offer a wide range of high-quality stone products designed to meet various design preferences. 
              Our products are tailored for both residential and commercial applications.
            </p>
            <a href="/products" className="text-blue-500 hover:underline mt-4">
              View Our Range
            </a>
          </div>
        </div>
      </Content>

      {/* Portfolio Section */}
      <Content className="py-16 bg-gray-50">
        <div className="container mx-auto grid grid-cols-2 gap-8">
          <div className="flex flex-col justify-center">
            <h3 className="text-3xl font-bold mb-4">Our Portfolio</h3>
            <p className="text-lg text-gray-600">
              Our portfolio showcases some of our finest work, displaying our attention to detail and commitment to quality.
            </p>
            <a href="/portfolio" className="text-blue-500 hover:underline mt-4">
              View Our Portfolio
            </a>
          </div>
          <div>
            <img
              src="https://via.placeholder.com/600x400" // Replace with your image
              alt="Portfolio"
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </Content>

      {/* Final CTA */}
      <Content className="py-16 bg-white text-center">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold mb-4">Let’s Start Your Project</h2>
          <p className="text-lg text-gray-600">
            Thank you for choosing us to bring your design vision to life.
          </p>
        </div>
      </Content>

      {/* Footer */}
      <Footer className="bg-white text-center py-8">
        <p className="text-gray-600">© 2024 Your Company Name. All rights reserved.</p>
      </Footer>
    </Layout>
  );
}

