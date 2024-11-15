import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../Services/firebase';
import { Table, Tag, Button, Modal, Input, message, DatePicker, Form, Typography, Space } from 'antd';

const { TextArea } = Input;
const { Title } = Typography;

export default function ReqBook() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responseModalVisible, setResponseModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [proposedTimes, setProposedTimes] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'serviceBookings'));
        const bookingsList = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          userId: doc.data().userId || null,
        }));
        setBookings(bookingsList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenResponseModal = (booking) => {
    setSelectedBooking(booking);
    setAdminResponse(booking.adminResponse || '');
    setProposedTimes(booking.proposedTimes || []);
    setResponseModalVisible(true);
  };

  const handleOpenDetailsModal = (booking) => {
    setSelectedBooking(booking);
    setDetailsModalVisible(true);
  };

  const handleSendResponse = async (status) => {
    if (!selectedBooking || !selectedBooking.userId) {
      message.error("User ID is missing for the selected booking.");
      return;
    }

    try {
      const bookingRef = doc(db, 'serviceBookings', selectedBooking.id);
      await updateDoc(bookingRef, {
        adminResponse: adminResponse,
        responseStatus: status,
        proposedTimes: proposedTimes,
      });
      
      message.success(`Booking ${status.toLowerCase()} successfully!`);
      setResponseModalVisible(false);
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === selectedBooking.id
            ? { ...booking, adminResponse, responseStatus: status, proposedTimes }
            : booking
        )
      );
      await addDoc(collection(db, 'notifications'), {
        userId: selectedBooking.userId,
        role: 'user',
        content: `Your booking request has been ${status.toLowerCase()} by the admin.`,
        bookingId: selectedBooking.id,
        isRead: false,
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'notifications'), {
        userId: null,
        role: 'admin',
        content: `Booking request from ${selectedBooking.residentName} has been ${status.toLowerCase()}.`,
        bookingId: selectedBooking.id,
        isRead: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      message.error(`Failed to ${status.toLowerCase()} booking.`);
      console.error("Error updating response:", error);
    }
  };

  const handleAddProposedTime = (time) => {
    setProposedTimes([...proposedTimes, time]);
  };

  const handleRemoveProposedTime = (index) => {
    setProposedTimes(proposedTimes.filter((_, i) => i !== index));
  };

  const columns = [
    {
      title: 'Resident Name',
      dataIndex: 'residentName',
      key: 'residentName',
      render: (text, record) => (
        <Button type="link" onClick={() => handleOpenDetailsModal(record)}>
          {text}
        </Button>
      ),
    },
    {
      title: 'Room',
      dataIndex: 'room',
      key: 'room',
    },
    {
      title: 'Building',
      dataIndex: 'building',
      key: 'building',
    },
    {
      title: 'Service Type',
      dataIndex: 'serviceType',
      key: 'serviceType',
      render: (serviceType) => {
        let color;
        switch (serviceType) {
          case 'cleaning':
            color = 'volcano';
            break;
          case 'security':
            color = 'green';
            break;
          case 'managementservice':
            color = 'blue';
            break;
          case 'infrastructureservice':
            color = 'yellow';
            break;
          default:
            color = 'grey';
        }
        return <Tag color={color}>{serviceType.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'responseStatus',
      key: 'responseStatus',
      render: (status) => (
        <Tag color={status === 'Approved' ? 'green' : status === 'Rejected' ? 'red' : 'grey'}>
          {status ? status.toUpperCase() : 'PENDING'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type="primary" onClick={() => handleOpenResponseModal(record)}>
          Respond
        </Button>
      ),
    },
  ];

  const renderBookingDetails = () => {
    if (!selectedBooking) return null;
    return (
      <div>
        <p><strong>Resident Name:</strong> {selectedBooking.residentName}</p>
        <p><strong>Room:</strong> {selectedBooking.room}</p>
        <p><strong>Building:</strong> {selectedBooking.building}</p>
      </div>
    );
  };

  return (
    <div style={{ textAlign: "center" }}>
      <Title level={2} style={{ marginBottom: "20px" }}>Booking Management</Title>
      <Table
        columns={columns}
        dataSource={bookings}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        style={{ marginBottom: "30px", justifyContent: "center" }}
      />

      <Modal
        title="Booking Details"
        visible={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Close
          </Button>,
        ]}
      >
        {renderBookingDetails()}
      </Modal>
      <Modal
        title="Respond to Booking"
        visible={responseModalVisible}
        onCancel={() => setResponseModalVisible(false)}
        footer={null}
      >
        <Form layout="vertical">
          <Form.Item label="Admin Response">
            <TextArea
              rows={4}
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              placeholder="Write your response here..."
            />
          </Form.Item>

          <Form.Item label="Proposed Times">
            <DatePicker
              showTime
              onChange={(date) => handleAddProposedTime(date ? date.toISOString() : '')}
            />
            <ul>
              {proposedTimes.map((time, index) => (
                <li key={index}>
                  {new Date(time).toLocaleString()}
                  <Button type="link" onClick={() => handleRemoveProposedTime(index)}>
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          </Form.Item>

          <Space style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
            <Button type="primary" onClick={() => handleSendResponse("Approved")}>
              Approve
            </Button>
            <Button type="danger" onClick={() => handleSendResponse("Rejected")}>
              Reject
            </Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
