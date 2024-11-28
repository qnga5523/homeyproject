import React, { useState } from "react";
import { Button, Tooltip, Modal, Typography, Divider, Row, Col } from "antd";
import { QuestionCircleOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined, SmileOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const ContactSupport = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();
  const showModal = () => {
    setIsModalVisible(true);
  };
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const handleGoToServiceBook = () => {
    navigate("/owner/book");
    setIsModalVisible(false);
  };
  return (
    <>
      <Tooltip title="Contact Support" >
        <Button
          shape="circle"
          icon={<QuestionCircleOutlined />}
          onClick={showModal}
        />
      </Tooltip>

      <Modal
        title={
          <div style={{ textAlign: "center" }}>
            <SmileOutlined style={{ fontSize: 24, color: "#1890ff" }} />
            <Typography.Title level={4} style={{ margin: 0 }}>
              Contact Support
            </Typography.Title>
          </div>
        }
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <Typography.Text>
            If you have any questions or need assistance, feel free to contact us. Our team is here to help!
          </Typography.Text>
        </div>
        <Divider />
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Typography.Title level={5}>
              <MailOutlined style={{ color: "#1890ff" }} /> Email
            </Typography.Title>
            <Typography.Text> HomeyNest@apartmentmanagement.com</Typography.Text>
          </Col>
          <Col span={24}>
            <Typography.Title level={5}>
              <PhoneOutlined style={{ color: "#1890ff" }} /> Hotline
            </Typography.Title>
            <Typography.Text>+84 123 456 789</Typography.Text>
          </Col>
          <Col span={24}>
            <Typography.Title level={5}>
              <PhoneOutlined style={{ color: "#1890ff" }} /> Customer Support
            </Typography.Title>
            <Typography.Text>+84 987 654 321</Typography.Text>
          </Col>
          <Col span={24}>
            <Typography.Title level={5}>
              <EnvironmentOutlined style={{ color: "#1890ff" }} /> Address
            </Typography.Title>
            <Typography.Text>123 Nguyen Trai, Thanh Xuan, Hanoi, Vietnam</Typography.Text>
          </Col>
        </Row>
        <Divider />
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Button type="primary" onClick={handleGoToServiceBook}>
            ServiceBook
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default ContactSupport;
