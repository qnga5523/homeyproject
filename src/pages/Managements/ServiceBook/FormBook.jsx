import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React, { useState } from 'react'
import { db } from '../../../Services/firebase';
import { Form, Input, Button, Select, message } from 'antd';


export default function FormBook() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'serviceBookings'), {
        ...values,
        status: 'Pending',
        createdAt: serverTimestamp(),
      });
      message.success('Service booking submitted successfully!');
    } catch (error) {
      message.error('Failed to submit service booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form layout="vertical" onFinish={onFinish} className="max-w-lg mx-auto p-4">
    <Form.Item label="Resident Name" name="residentName" rules={[{ required: true }]}>
      <Input />
    </Form.Item>
    <Form.Item label="Issue Type" name="issueType" rules={[{ required: true }]}>
      <Select>
        <Select.Option value="Maintenance">Maintenance</Select.Option>
        <Select.Option value="Activity">Activity</Select.Option>
      </Select>
    </Form.Item>
    <Form.Item label="Description" name="description" rules={[{ required: true }]}>
      <Input.TextArea rows={4} />
    </Form.Item>
    <Form.Item>
      <Button type="primary" htmlType="submit" loading={loading}>
        Submit
      </Button>
    </Form.Item>
  </Form>
);
};
