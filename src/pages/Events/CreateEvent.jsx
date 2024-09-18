import React, { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import {
  Button,
  Radio,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import { auth, db, storage } from "../../Services/firebase";
const { RangePicker } = DatePicker;
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
      mode,
      postDate,
      deadline,
      content,
      number,
      apart,
      upload,
    } = values;

    const formattedPostDate = postDate ? postDate.toDate() : null;
    const formattedDeadline = deadline
      ? deadline.map((date) => date.toDate())
      : null;

    const eventsCollectionRef = collection(db, "events");
    const uploadImage = async (file) => {
      const storageRef = ref(storage, `events/${file.name}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    };

    // Create the event with image upload
    const createEvent = async () => {
      try {
        let imageUrl = null;
        if (upload && upload.length > 0) {
          const file = upload[0].originFileObj;
          imageUrl = await uploadImage(file);
        }

        await addDoc(eventsCollectionRef, {
          title,
          goal,
          mode,
          postDate: formattedPostDate,
          deadline: formattedDeadline,
          content,
          number,
          apart,
          imageUrl,
          author: {
            name: auth.currentUser.displayName,
            id: auth.currentUser.uid,
          },
        });

        message.success("Event created successfully");
      } catch (error) {
        console.error("Error creating event: ", error);
        message.error("Failed to create event");
      }
    };

    await createEvent();
  };

  return (
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
      <Form.Item label="Choose mode?" name="mode">
        <Radio.Group>
          <Radio value="public"> Public </Radio>
          <Radio value="private"> Private </Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item
        label="Choose Apartment"
        name="apart"
        rules={[
          {
            required: true,
            message: "Please input!",
          },
        ]}
      >
        <Select placeholder="Select an apartment">
          {/* Example options - replace with your dynamic data if needed */}
          <Select.Option value="apartment1">Apartment 1</Select.Option>
          <Select.Option value="apartment2">Apartment 2</Select.Option>
          <Select.Option value="apartment3">Apartment 3</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item label="Requirement" name="req">
        <Select>
          <Select.Option value="demo">Mandatory participation</Select.Option>
          <Select.Option value="demo">Voluntary participation</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Title"
        name="title"
        rules={[
          {
            required: true,
            message: "Please input!",
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Number of Participants"
        name="number"
        rules={[
          {
            required: true,
            message: "Please input!",
          },
        ]}
      >
        <InputNumber
          style={{
            width: "30%",
          }}
        />
      </Form.Item>

      <Form.Item
        label="Goal"
        name="goal"
        rules={[
          {
            required: true,
            message: "Please input!",
          },
        ]}
      >
        <Input.TextArea rows={4} />
      </Form.Item>

      <Form.Item
        label="Content"
        name="content"
        rules={[
          {
            required: true,
            message: "Please input!",
          },
        ]}
      >
        <Input.TextArea rows={7} />
      </Form.Item>
      <Form.Item label="Google Form">
        <TextArea rows={2} />
      </Form.Item>

      <Form.Item
        label="Upload Image"
        valuePropName="fileList"
        name="upload"
        getValueFromEvent={normFile}
      >
        <Upload listType="picture-card" maxCount={1}>
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
          </div>
        </Upload>
      </Form.Item>

      <Form.Item
        label="Post Date"
        name="postDate"
        rules={[
          {
            required: true,
            message: "Please input!",
          },
        ]}
      >
        <DatePicker />
      </Form.Item>

      <Form.Item
        label="Deadline"
        name="deadline"
        rules={[
          {
            required: true,
            message: "Please input!",
          },
        ]}
      >
        <RangePicker />
      </Form.Item>

      <Form.Item
        wrapperCol={{
          offset: 6,
          span: 16,
        }}
      >
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}
