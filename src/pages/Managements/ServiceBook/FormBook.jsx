import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button, Upload, DatePicker, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db } from '../../../Services/firebase';
import { sendNotification } from './NotificationService';

const { Option } = Select;
const { TextArea } = Input;

const storage = getStorage(); 

export default function AddBookingForm() {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [serviceType, setServiceType] = useState(null);
  const [fileList, setFileList] = useState([]);
  

  const handleAddBooking = async (values) => {
    if (!auth.currentUser) {
      message.error("You need to be logged in to upload files.");
      return;
    }
    try {
      const userId = auth.currentUser.uid; 
      console.log("User ID during booking creation:", userId); 

      let imageUrls = [];
      if (fileList.length > 0) {
        const uploadPromises = fileList.map(async (file) => {
          const fileToUpload = file.originFileObj || file;
  
          if (!(fileToUpload instanceof File)) {
            throw new Error("Invalid file type");
          }
          const storageRef = ref(storage, `serviceBookings/${fileToUpload.name}`);
          const snapshot = await uploadBytes(storageRef, fileToUpload);
          return getDownloadURL(snapshot.ref);
        });
        imageUrls = await Promise.all(uploadPromises);
      }
 
      const bookingData = {
        userId, 
        residentName: values.residentName,
        serviceType: values.serviceType,
        itemName: values.itemName || null,
        cause: values.cause || null,
        notes: values.notes || null,
        field: values.field || null,
        startTime: values.startTime ? values.startTime.toDate() : null, 
        endTime: values.endTime ? values.endTime.toDate() : null,      
        transportTime: values.transportTime ? values.transportTime.toDate() : null, 
        participants: values.participants || null,
        images: imageUrls,
        status: 'Pending',
        createdAt: serverTimestamp(),
      };
      const bookingRef = await addDoc(collection(db, 'serviceBookings'), bookingData);
  
      await sendNotification('admin', 'admin', `New booking request from ${values.residentName}`, bookingRef.id);
  
      message.success('Booking added successfully!');
      form.resetFields();
      setModalVisible(false);
      setServiceType(null); 
      setFileList([]); 
    } catch (error) {
      message.error('Failed to add booking');
      console.error("Booking error:", error);
    }
  };
  

  const handleServiceTypeChange = (value) => {
    setServiceType(value);
    form.resetFields(); 
    form.setFieldsValue({ serviceType: value }); 
  };

  

  return (
    <>
      <Button type="primary" onClick={() => setModalVisible(true)} style={{ marginBottom: 16 }}>
        Add New Booking
      </Button>

      <Modal
        title="Add New Booking"
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setServiceType(null);
          setFileList([]); 
        }}
        onOk={() => form.submit()}
        okText="Submit"
        cancelText="Cancel"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddBooking}
          initialValues={{ serviceType: null }}
        >
          <Form.Item
            label="Resident Name"
            name="residentName"
            rules={[{ required: true, message: 'Please enter resident name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Service Type"
            name="serviceType"
            rules={[{ required: true, message: 'Please select service type' }]}
          >
            <Select onChange={handleServiceTypeChange}>
              <Option value="repair">Sửa chữa đồ dùng</Option>
              <Option value="sports">Đăng kí thể thao</Option>
              <Option value="transport">Vận chuyển đồ dùng</Option>
            </Select>
          </Form.Item>

          {/* Sub-form for "Sửa chữa đồ dùng" */}
          {serviceType === 'repair' && (
            <>
              <Form.Item label="Item Name" name="itemName" rules={[{ required: true, message: 'Please enter item name' }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Cause" name="cause">
                <Input />
              </Form.Item>
              <Form.Item label="Notes" name="notes">
                <TextArea rows={2} />
              </Form.Item>
              <Form.Item label="Images" name="images">
                <Upload
                  listType="picture"
                  fileList={fileList}
                  onChange={({ fileList }) => setFileList(fileList)}
                  beforeUpload={() => false}
                >
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              </Form.Item>
            </>
          )}

          {/* Sub-form for "Đăng kí thể thao" */}
          {serviceType === 'sports' && (
            <>
              <Form.Item label="Field" name="field" rules={[{ required: true, message: 'Please enter the field name' }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Start Time" name="startTime" rules={[{ required: true, message: 'Please select start time' }]}>
                <DatePicker showTime />
              </Form.Item>
              <Form.Item label="End Time" name="endTime" rules={[{ required: true, message: 'Please select end time' }]}>
                <DatePicker showTime />
              </Form.Item>
              <Form.Item label="Participants" name="participants" rules={[{ required: true, message: 'Please enter the number of participants' }]}>
                <Input type="number" min={1} />
              </Form.Item>
              <Form.Item label="Notes" name="notes">
                <TextArea rows={2} />
              </Form.Item>
            </>
          )}

          {/* Sub-form for "Vận chuyển đồ dùng" */}
          {serviceType === 'transport' && (
            <>
              <Form.Item label="Item Name" name="itemName" rules={[{ required: true, message: 'Please enter item name' }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Notes" name="notes">
                <TextArea rows={2} />
              </Form.Item>
              <Form.Item label="Transport Time" name="transportTime" rules={[{ required: true, message: 'Please select transport time' }]}>
                <DatePicker showTime />
              </Form.Item>
              <Form.Item label="Images" name="images">
                <Upload
                  listType="picture"
                  fileList={fileList}
                  onChange={({ fileList }) => setFileList(fileList)}
                  beforeUpload={() => false}
                >
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </>
  );
}
