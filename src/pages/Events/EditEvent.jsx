import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";

import {
  Form,
  Input,
  Button,
  DatePicker,
  InputNumber,
  Radio,
  Upload,
  message,
} from "antd";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { PlusOutlined } from "@ant-design/icons";
import moment from "moment";
import { db, storage } from "../../Services/firebase";
const { RangePicker } = DatePicker;

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventDoc = doc(db, "events", id);
        const eventSnapshot = await getDoc(eventDoc);

        if (eventSnapshot.exists()) {
          const eventData = eventSnapshot.data();
          setEvent(eventData);

          // Initialize form with fetched data, converting dates to moment objects
          form.setFieldsValue({
            ...eventData,
            postDate: eventData.postDate
              ? moment(eventData.postDate.toDate())
              : null,
            deadline: eventData.deadline
              ? eventData.deadline.map((date) => moment(date.toDate()))
              : null,
          });
        } else {
          message.error("Event not found");
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
        message.error("Error fetching event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, form]);

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

    const eventRef = doc(db, "events", id);

    const uploadImage = async (file) => {
      const storageRef = ref(storage, `events/${file.name}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    };

    try {
      let imageUrl = event.imageUrl;
      if (upload && upload.length > 0) {
        const file = upload[0].originFileObj;
        imageUrl = await uploadImage(file);
      }

      const updatedData = {
        title: title || event.title,
        goal: goal || event.goal,
        mode: mode || event.mode,
        postDate: formattedPostDate || event.postDate,
        deadline: formattedDeadline || event.deadline,
        content: content || event.content,
        number: number !== undefined ? number : event.number, // Ensure it's not undefined
        apart: apart !== undefined ? apart : event.apart, // Ensure it's not undefined
        imageUrl: imageUrl || event.imageUrl,
      };

      await updateDoc(eventRef, updatedData);

      message.success("Event updated successfully");
      navigate(`/event/${id}`);
    } catch (error) {
      console.error("Error updating event: ", error);
      message.error("Failed to update event");
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      style={{ maxWidth: 600, margin: "auto" }}
    >
      <Form.Item
        label="Title"
        name="title"
        rules={[{ required: true, message: "Please input the title!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Goal"
        name="goal"
        rules={[{ required: true, message: "Please input the goal!" }]}
      >
        <Input.TextArea rows={4} />
      </Form.Item>

      <Form.Item label="Mode" name="mode">
        <Radio.Group>
          <Radio value="public">Public</Radio>
          <Radio value="private">Private</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        label="Number of Participants"
        name="number"
        rules={[{ required: true, message: "Please input the number!" }]}
      >
        <InputNumber />
      </Form.Item>

      <Form.Item
        label="Content"
        name="content"
        rules={[{ required: true, message: "Please input the content!" }]}
      >
        <Input.TextArea rows={7} />
      </Form.Item>

      <Form.Item
        label="Upload Image"
        valuePropName="fileList"
        name="upload"
        getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
      >
        <Upload listType="picture-card" maxCount={1}>
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
          </div>
        </Upload>
      </Form.Item>

      <Form.Item label="Post Date" name="postDate">
        <DatePicker />
      </Form.Item>

      <Form.Item label="Deadline" name="deadline">
        <RangePicker />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Save Changes
        </Button>
      </Form.Item>
    </Form>
  );
}
