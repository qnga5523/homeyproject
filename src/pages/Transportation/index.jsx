import React from "react";
import { Form, Input, Button, Select } from "antd";
const { Option } = Select;
export default function VehicleRegistrationForm() {
  const onFinish = (values) => {
    console.log("Form values: ", values);
  };

  return (
    <Form name="vehicle_registration" layout="vertical" onFinish={onFinish}>
      <Form.Item
        label="Choice vehicle "
        name="vehicleType"
        rules={[{ required: true, message: "Please select vehicle type!" }]}
      >
        <Select placeholder="Select vehicle type">
          <Option value="motorbike">Motorbike</Option>
          <Option value="car">Car</Option>
          <Option value="bicycle">Bicycle</Option>
          <Option value="electric_bicycle">
            Electric motorbikes/Electric bicycles
          </Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="License Plate"
        name="licensePlate"
        rules={[{ required: true, message: "Llease input" }]}
      >
        <Input placeholder="License Plate" />
      </Form.Item>

      <Form.Item label="More description" name="description">
        <Input.TextArea placeholder="More description" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Sign up
        </Button>
      </Form.Item>
    </Form>
  );
}
