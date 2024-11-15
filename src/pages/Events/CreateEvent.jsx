import React, { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Select,
  Upload,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

import { db, storage } from "../../Services/firebase";
import { sendNotificationToOwners } from "../Notification/NotificationService";

const normFile = (e) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};
const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 6,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 14,
    },
  },
};

export default function CreateEvent() {
  const [componentVariant, setComponentVariant] = useState("filled");
  const onFormVariantChange = ({ variant }) => {
    setComponentVariant(variant);
  };
  const onFinish = async (values) => {
    const {
      title,
      goal,
      postDate,
      content,
      req,
      upload,
    } = values;
  
    const formattedPostDate = postDate ? postDate.toDate() : null;
    const eventsCollectionRef = collection(db, "events");
  
    const uploadImage = async (file) => {
      const storageRef = ref(storage, `events/${file.name}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    };
  
  
    const createEventAndNotifyOwners = async () => {
      try {
        let imageUrl = null;
        if (upload && upload.length > 0) {
          const file = upload[0].originFileObj;
          imageUrl = await uploadImage(file);
        }
        const eventDocRef = await addDoc(eventsCollectionRef, {
          title,
          goal,        
          postDate: formattedPostDate,
          content,  
          req,      
          imageUrl,
          author: {
            name: "Admin",
          },
        });
        await sendNotificationToOwners(eventDocRef.id, title);
  
        message.success("Event created successfully and notifications sent");
      } catch (error) {
        console.error("Error creating event: ", error);
        message.error("Failed to create event and send notifications");
      }
    };
  
    await createEventAndNotifyOwners();
  };
  
  return (
      <div className="container mx-auto py-10 px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Create Event</h2>
          <Form
      {...formItemLayout}
      onValuesChange={onFormVariantChange}
      variant={componentVariant}
      style={{
        maxWidth: 600,
      }}
      initialValues={{
        variant: componentVariant,
      }}
      onFinish={onFinish}
    >
            <Form.Item label="Requirement" name="req" rules={[{ required: true, message: "Please select a requirement!" }]}>
              <Select placeholder="Select a category">
                <Select.Option value="Community Events">Community Events</Select.Option>
                <Select.Option value="Sports Activities">Sports Activities</Select.Option>
                <Select.Option value="Children's Programs">Children's Programs</Select.Option>
                <Select.Option value="Utility Services">Utility Services</Select.Option>
                <Select.Option value="Classes and Workshops">Classes and Workshops</Select.Option>
                <Select.Option value="Charity Programs">Charity Programs</Select.Option>
                <Select.Option value="Fairs and Exhibitions">Fairs and Exhibitions</Select.Option>
              </Select>
            </Form.Item>
  
            <Form.Item label="Title" name="title" rules={[{ required: true, message: "Please input title!" }]}>
              <Input placeholder="Enter event title" />
            </Form.Item>
  
            <Form.Item label="Goal" name="goal" rules={[{ required: true, message: "Please input goal!" }]}>
              <Input.TextArea rows={3} placeholder="Enter goal of the event" />
            </Form.Item>
  
            <Form.Item label="Content" name="content" rules={[{ required: true, message: "Please input content!" }]}>
              <Input.TextArea rows={5} placeholder="Describe the event" />
            </Form.Item>
  
            <Form.Item label="Upload Image" name="upload" valuePropName="fileList" getValueFromEvent={normFile}>
              <Upload listType="picture-card" maxCount={1}>
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Form.Item>
  
            <Form.Item label="Post Date" name="postDate" rules={[{ required: true, message: "Please select post date!" }]}>
              <DatePicker className="w-full" />
            </Form.Item>
  
          
            <Form.Item className="text-center">
              <Button type="primary" htmlType="submit" className="px-8 py-2">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
  
        <div className="p-6 bg-gray-100 shadow-md rounded-lg">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Event Types and Ideas</h2>
    <div className="space-y-4">
      <div className="p-4 bg-gray-50 rounded-md">
        <h3 className="text-lg font-semibold text-gray-800">Community Events</h3>
        <p className="text-sm text-gray-600">Hosting BBQ parties, summer festivals, or holiday events for residents to interact and connect.</p>
      </div>
      <div className="p-4 bg-blue-50 rounded-md">
        <h3 className="text-lg font-semibold text-blue-700">Sports Activities</h3>
        <p className="text-sm text-gray-600">Organizing running competitions, mini football tournaments, outdoor yoga sessions, or fitness classes.</p>
      </div>
      <div className="p-4 bg-white rounded-md border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Children's Programs</h3>
        <p className="text-sm text-gray-600">Craft activities, game days, or skill classes such as drawing and dancing for kids.</p>
      </div>
      <div className="p-4 bg-gray-50 rounded-md">
        <h3 className="text-lg font-semibold text-gray-800">Utility Services</h3>
        <p className="text-sm text-gray-600">Information about new amenities like the gym, swimming pool, or children's playground.</p>
      </div>
      <div className="p-4 bg-blue-50 rounded-md">
        <h3 className="text-lg font-semibold text-blue-700">Classes and Workshops</h3>
        <p className="text-sm text-gray-600">Soft skills classes, nutrition workshops, cooking classes, or safety and health seminars.</p>
      </div>
      <div className="p-4 bg-white rounded-md border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Charity Programs</h3>
        <p className="text-sm text-gray-600">Organizing donation drives, blood donation events, or environmental cleanup projects.</p>
      </div>
      <div className="p-4 bg-gray-50 rounded-md">
        <h3 className="text-lg font-semibold text-gray-800">Fairs and Exhibitions</h3>
        <p className="text-sm text-gray-600">Hosting farmers' markets, flea markets, or resident art exhibitions.</p>
      </div>
    </div>
  </div>
  
      </div>
    );
  }
  