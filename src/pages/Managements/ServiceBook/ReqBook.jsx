import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../Services/firebase';
import { Table, Tag, Button, Modal, Input, message, DatePicker, Form } from 'antd';

const { TextArea } = Input;

export default function ReqBook() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responseModalVisible, setResponseModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [additionalRequests, setAdditionalRequests] = useState('');
  const [proposedTimes, setProposedTimes] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'serviceBookings'));
        const bookingsList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log("Fetched booking data:", data); 
          return { ...data, id: doc.id, userId: data.userId || null };
        });
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
    setAdditionalRequests(booking.additionalRequests || '');
    setProposedTimes(booking.proposedTimes || []);
    setResponseModalVisible(true);
  };

  const handleAddProposedTime = (time) => {
    setProposedTimes([...proposedTimes, time]);
  };

  const handleRemoveProposedTime = (index) => {
    setProposedTimes(proposedTimes.filter((_, i) => i !== index));
  };

  const handleSendResponse = async () => {
    if (!selectedBooking || !selectedBooking.userId) {
      message.error("User ID is missing for the selected booking.");
      return;
    }
  
    try {
      const bookingRef = doc(db, 'serviceBookings', selectedBooking.id);
      await updateDoc(bookingRef, {
        adminResponse: adminResponse,
        responseStatus: 'Responded',
        additionalRequests: additionalRequests,
        proposedTimes: proposedTimes,
      });
      message.success('Response sent successfully!');
      setResponseModalVisible(false);
  
      // Update booking in state
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === selectedBooking.id
            ? { ...booking, adminResponse, responseStatus: 'Responded', additionalRequests, proposedTimes }
            : booking
        )
      );
  
      // Create notification for user
      await addDoc(collection(db, 'notifications'), {
        userId: selectedBooking.userId, // Use userId from booking
        role: 'user',
        content: `Your booking request has been responded to by the admin. Status: Responded.`,
        bookingId: selectedBooking.id,
        isRead: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      message.error('Failed to send response.');
      console.error("Error sending response:", error);
    }
  };
  
  

  const columns = [
    {
      title: 'Resident Name',
      dataIndex: 'residentName',
      key: 'residentName',
    },
    {
      title: 'Service Type',
      dataIndex: 'serviceType',
      key: 'serviceType',
      render: (serviceType) => {
        let color;
        switch (serviceType) {
          case 'repair':
            color = 'volcano';
            break;
          case 'sports':
            color = 'green';
            break;
          case 'transport':
            color = 'blue';
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
        <Tag color={status === 'Responded' ? 'green' : 'red'}>
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

  return (
    <div>
      <h2>Booked Services</h2>
      <Table
        columns={columns}
        dataSource={bookings}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />

      {/* Modal for Admin Response */}
      <Modal
        title="Respond to Booking"
        visible={responseModalVisible}
        onCancel={() => setResponseModalVisible(false)}
        onOk={handleSendResponse}
        okText="Send Response"
        cancelText="Cancel"
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

          <Form.Item label="Additional Requests">
            <TextArea
              rows={2}
              value={additionalRequests}
              onChange={(e) => setAdditionalRequests(e.target.value)}
              placeholder="Add any additional requests here..."
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
        </Form>
      </Modal>
    </div>
  );
}
