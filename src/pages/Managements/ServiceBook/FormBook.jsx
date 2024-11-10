import React, { useEffect, useState } from "react";
import { Form, Input, Select, Button, Upload, DatePicker, message, Table } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db } from "../../../Services/firebase";
import { sendNotification } from "./NotificationService";
const { Option } = Select;
const { TextArea } = Input;
const storage = getStorage();
export default function AddBookingForm() {
  const [form] = Form.useForm();
  const [serviceType, setServiceType] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [userData, setUserData] = useState({});
  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = doc(db, "Users", auth.currentUser.uid);
          const userSnapshot = await getDoc(userDoc);
          if (userSnapshot.exists()) {
            const data = userSnapshot.data();
            console.log("Fetched user data:", data); 
            setUserData(data);
          } else {
            console.log("User data not found");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    fetchUserData();
  }, []);
  const handleAddBooking = async (values) => {
    if (!auth.currentUser) {
      message.error("You need to be logged in to upload files.");
      return;
    }
    try {
      const userId = auth.currentUser.uid;
      const residentName = userData.Username || "Unknown User";
      const room = userData.room || "N/A";
      const building = userData.building || "N/A";
      let imageUrls = [];

      if (fileList.length > 0) {
        const uploadPromises = fileList.map(async (file) => {
          const fileToUpload = file.originFileObj || file;
          if (!(fileToUpload instanceof File))
            throw new Error("Invalid file type");
          const storageRef = ref(
            storage,
            `serviceBookings/${fileToUpload.name}`
          );
          const snapshot = await uploadBytes(storageRef, fileToUpload);
          return getDownloadURL(snapshot.ref);
        });
        imageUrls = await Promise.all(uploadPromises);
      }

      const bookingData = {
        userId,
        residentName,
        room,
        building,
        serviceType: values.serviceType,
        itemName: values.itemName || null,
        cause: values.cause || null,
        notes: values.notes || null,
        field: values.field || null,
        startTime: values.startTime ? values.startTime.toDate() : null,
        endTime: values.endTime ? values.endTime.toDate() : null,
        transportTime: values.transportTime
          ? values.transportTime.toDate()
          : null,
        participants: values.participants || null,
        images: imageUrls,
        paymentMethod: values.paymentMethod,
        status: "Pending",
        createdAt: serverTimestamp(),
        duration: values.duration || null,
        PreferredSchedule: values.PreferredSchedule ? values.PreferredSchedule.toDate() : null,
        BookingDetails: values.BookingDetails ? values.BookingDetails.toDate() : null,
        contact: values.contact ||null
      };
      const bookingRef = await addDoc(
        collection(db, "serviceBookings"),
        bookingData
      );

      await sendNotification(
        "admin",
        "admin",
        `New booking request from ${values.residentName}`,
        bookingRef.id
      );

      message.success("Booking added successfully!");
      form.resetFields();
      setServiceType(null);
      setFileList([]);
    } catch (error) {
      message.error("Failed to add booking");
      console.error("Booking error:", error);
    }
  };

  const handleServiceTypeChange = (value) => {
    setServiceType(value);
    form.resetFields();
    form.setFieldsValue({ serviceType: value });
  };
  const serviceNotes = [
    {
      key: "1",
      type: "Cleaning Services",
      description: "Cleaning rooms, floors, garbage areas, and other common areas.",
    },
    {
      key: "2",
      type: "Security Services",
      description: "24/7 security personnel, CCTV monitoring, and access control.",
    },
    {
      key: "3",
      type: "Management Services",
      description: "Maintenance of infrastructure and handling day-to-day operations.",
    },
    {
      key: "4",
      type: "Infrastructure Services",
      description: "Supply and maintenance of utilities like water and electricity.",
    },
    {
      key: "5",
      type: "Recreational Services",
      description: "Amenities like gyms, swimming pools, playgrounds, and community rooms.",
    },
  ];

  const columns = [
    {
      title: "Service Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
  ];

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ backgroundColor: "#f0f8ff", padding: "20px", borderRadius: "8px" }}>
        <h2 style={{ color: "#1e90ff" }}>Service Notes</h2>
        <Table
          columns={columns}
          dataSource={serviceNotes}
          pagination={false}
          style={{ marginBottom: "20px", backgroundColor: "white", borderRadius: "8px" }}
        />
      </div>

      <div style={{ backgroundColor: "#e6f7ff", padding: "20px", borderRadius: "8px", marginTop: "20px" }}>
        <h2 style={{ color: "#1890ff" }}>Add New Booking</h2>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddBooking}
          initialValues={{ serviceType: null }}
        >
        <Form.Item
          label="Service Type"
          name="serviceType"
         
          rules={[{ required: true, message: "Please select service type" }]}
        >
          <Select onChange={handleServiceTypeChange}  placeholder="Please choice service">
            <Option value="cleaning">Cleaning Services</Option>
            <Option value="security">Security Services</Option>
            <Option value="managementservice">Management Services</Option>
            <Option value="infrastructureservice">
              Infrastructure Services
            </Option>
            <Option value="recreationalservice">Recreational Services</Option>
          </Select>
        </Form.Item>

        {serviceType === "cleaning" && (
          <>
            <Form.Item
              label="Service Name"
              name="itemName"
               
              rules={[
                {
                  required: true,
                  message:
                    "Please enter name ",
                },
              ]}
            >
              <Input placeholder="Room cleaning, floor cleaning, garbage area cleaning, etc." />
            </Form.Item>
            <Form.Item label="Special Requirements" name="cause"
             >
              <Input placeholder="Use of specific cleaning products, allergy considerations, etc."/>
            </Form.Item>
            <Form.Item label="Contact Information" name="notes" >
              <TextArea rows={2} placeholder="Resident's name, apartment number, phone number, email."/>
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
            <Form.Item
              label="Start Time"
              name="startTime"
              rules={[{ required: true, message: "Please select start time" }]}
            >
              <DatePicker showTime />
            </Form.Item>
            <Form.Item
              label="End Time"
              name="endTime"
              rules={[{ required: true, message: "Please select end time" }]}
            >
              <DatePicker showTime />
            </Form.Item>
          </>
        )}

        {serviceType === "security" && (
          <>
            <Form.Item
              label="Field"
              name="field"             
              rules={[
                {
                  required: true,
                  message:
                    "Please enter the field name",
                },
              ]}
            >
              <Input placeholder="Surveillance, access control, patrolling, emergency response."/>
            </Form.Item>
            <Form.Item
              label="Duration"
              name="duration"
              
              rules={[
                {
                  required: true,
                  message: "Hours of service, shifts (if applicable).",
                },
              ]}
            >
              <Input type="number" placeholder="Hours of service, shifts (if applicable)." />
            </Form.Item>
            <Form.Item
              label="Contact Information"
              name="contact"           
              rules={[
                {
                  required: true,
                  message:
                    "Resident name :apartment number phone number, email",
                },
              ]}
            >
              <Input  placeholder="Resident's name, apartment number, phone number, email."/>
            </Form.Item>
            <Form.Item label="Special Instructions" name="notes" >
              <TextArea rows={2} placeholder="Specific areas to monitor, any known security concerns."/>
            </Form.Item>
          </>
        )}

        {serviceType === "managementservice" && (
          <>
            <Form.Item
              label="Service Name"
              name="itemName"
             
              rules={[
                {
                  required: true,
                  message:
                    "Please enter: Maintenance request, inspection, complaint, other.",
                },
              ]}
            >
              <Input  placeholder="Maintenance request, inspection, complaint, other."/>
            </Form.Item>
            <Form.Item
              label="Details of Request"
              name="notes"
              
              rules={[
                { message: "Description of the issue or service needed." },
              ]}
            >
              <TextArea rows={2} placeholder="Description of the issue or service needed." />
            </Form.Item>
            <Form.Item
              label="Preferred Schedule"
              name="PreferredSchedule"
             
              rules={[
                { required: true, message: "Please select Preferred Schedule" },
              ]}
            >
              <DatePicker showTime placeholder="Availability for inspections or maintenance work."/>
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
            <Form.Item
              label="Contact Information"
              name="contact"
              rules={[
                {
                  required: true,
                  message:
                    "Resident name :apartment number phone number, email",
                },
              ]}
            >
              <Input placeholder="Resident's name, apartment number, phone number, email."/>
            </Form.Item>
          </>
        )}
        <Form.Item>
          {serviceType === "infrastructureservice" && (
            <>
              <Form.Item
                label="Service Name"
                name="itemName"
                
                rules={[
                  {
                    required: true,
                    message:
                      "Please enter: Water supply, electricity, drainage system, other",
                  },
                ]}
              >
                <Input placeholder="Water supply, electricity, drainage system, other."/>
              </Form.Item>
              <Form.Item label="Issue Description" name="notes"
             >
                <TextArea rows={2}  placeholder="Detailed description of the issue or request." />
              </Form.Item>
              <Form.Item
                label="Preferred Schedule"
                name="PreferredSchedule"
                
                rules={[
                  {
                    required: true,
                    message: "Please select Preferred Schedule",
                  },
                ]}
              >
                <DatePicker showTime placeholder="Availability for maintenance or inspections."/>
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
              <Form.Item
                label="Contact Information"
                name="contact"
                
                rules={[
                  {
                    required: true,
                    message:
                      "Resident name :apartment number phone number, email",
                  },
                ]}
              >
                <Input placeholder="Resident's name, apartment number, phone number, email."/>
              </Form.Item>
            </>
          )}
          <Form.Item>
            {serviceType === "recreationalservice" && (
              <>
                <Form.Item
                  label="Service Name"
                  name="itemName"
                 
                  rules={[
                    {
                      required: true,
                      message:
                        "Please enter: Gym access, pool access, community room booking, playground usage",
                    },
                  ]}
                >
                  <Input  placeholder="Gym access, pool access, community room booking, playground usage."/>
                </Form.Item>
                <Form.Item label="Special Requirements:" name="notes"
                >
                  <TextArea rows={2} placeholder="Any specific needs or requests."/>
                </Form.Item>
                <Form.Item
                  label="Booking Details"
                  name="BookingDetails"
                 
                  rules={[
                    {
                      required: true,
                      message: "Please select Preferred Schedule",
                    },
                  ]}
                >
                  <DatePicker showTime  placeholder="Date, time, duration."/>
                </Form.Item>
                <Form.Item
                  label="Contact Information"
                  name="contact"
                 
                  rules={[
                    {
                      required: true,
                      message:
                        "Resident name :apartment number phone number, email",
                    },
                  ]}
                >
                  <Input  placeholder="Resident's name, apartment number, phone number, email."/>
                </Form.Item>
                <Form.Item label="Number of Participants:" name="participants">
                  <Input type="number"placeholder="Number of people using the service." />
                </Form.Item>
              </>
            )}
            <Form.Item
            label="Payment Method"
            name="paymentMethod"
            rules={[
              { required: true, message: "Please select a payment method" },
            ]}
          >
            <Select placeholder="Select payment method">
              <Option value="creditCard">Credit Card</Option>
              <Option value="debitCard">Debit Card</Option>
              <Option value="cash">Cash</Option>
              <Option value="onlineBanking">Online Banking</Option>
            </Select>
          </Form.Item>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form.Item>
        </Form>
      </div>
    </div>
  );
}
