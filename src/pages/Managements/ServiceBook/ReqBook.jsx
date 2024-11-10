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
  const [proposedTimes, setProposedTimes] = useState([]);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
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
    setProposedTimes(booking.proposedTimes || []);
    setResponseModalVisible(true);
  };
  const handleOpenDetailsModal = (booking) => {
    setSelectedBooking(booking);
    setDetailsModalVisible(true);
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
        proposedTimes: proposedTimes,
      });
      message.success('Response sent successfully!');
      setResponseModalVisible(false);
  
      // Update booking in state
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === selectedBooking.id
            ? { ...booking, adminResponse, responseStatus: 'Responded', proposedTimes }
            : booking
        )
      );
  
      // Create notification for user
      await addDoc(collection(db, 'notifications'), {
        userId: selectedBooking.userId, 
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
              color='yellow';
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
  const renderBookingDetails = () => {
    if (!selectedBooking) return null;
    return (
      <div>
        <p><strong>Resident Name:</strong> {selectedBooking.residentName}</p>
        <p><strong>Room:</strong> {selectedBooking.room}</p>
        <p><strong>Building:</strong> {selectedBooking.building}</p>
        <p><strong>Service Type:</strong> {selectedBooking.serviceType.toUpperCase()}</p>
        <p><strong>Status:</strong> {selectedBooking.status || 'Pending'}</p>
        {selectedBooking.serviceType === 'cleaning' && (
          <>
            <p><strong>Service Name:</strong> {selectedBooking.itemName}</p>
            <p><strong>Special Requirements:</strong> {selectedBooking.cause || 'N/A'}</p>
            <p><strong>Contact Information:</strong> {selectedBooking.notes || 'N/A'}</p>
            <p><strong>Start Time:</strong> {selectedBooking.startTime ? 
  (selectedBooking.startTime.toDate ? selectedBooking.startTime.toDate().toLocaleString() : new Date(selectedBooking.startTime).toLocaleString()) 
  : 'N/A'}
</p>
<p><strong>End Time:</strong> {selectedBooking.endTime ? 
  (selectedBooking.endTime.toDate ? selectedBooking.endTime.toDate().toLocaleString() : new Date(selectedBooking.endTime).toLocaleString()) 
  : 'N/A'}
</p>


          </>
        )}
        
        {selectedBooking.serviceType === 'security' && (
          <>
            <p><strong>Service Name:</strong> {selectedBooking.field}</p>
            <p><strong>Duration (Hours):</strong> {selectedBooking.duration}</p>
            <p><strong>Contact Information:</strong> {selectedBooking.contact || 'N/A'}</p>
            <p><strong>Special Instructions:</strong> {selectedBooking.notes || 'N/A'}</p>
          </>
        )}
  
        {selectedBooking.serviceType === 'managementservice' && (
          <>
            <p><strong>Service Name:</strong> {selectedBooking.itemName}</p>
            <p><strong>Details of Request:</strong> {selectedBooking.notes || 'N/A'}</p>
            <p><strong>Preferred Schedule:</strong> {selectedBooking.PreferredSchedule ? 
  (selectedBooking.PreferredSchedule.toDate ? selectedBooking.PreferredSchedule.toDate().toLocaleString() : new Date(selectedBooking.PreferredSchedule).toLocaleString()) 
  : 'N/A'}
</p>
            <p><strong>Contact Information:</strong> {selectedBooking.contact || 'N/A'}</p>
            <p><strong>Images:</strong> {selectedBooking.images && selectedBooking.images.length > 0 ? selectedBooking.images.map((url, index) => (
          <img key={index} src={url} alt="booking" style={{ width: '100px', marginRight: '5px' }} />
        )) : 'N/A'}</p>
            
          </>
        )}
  
        {selectedBooking.serviceType === 'infrastructureservice' && (
          <>
            <p><strong>Service Name:</strong> {selectedBooking.itemName}</p>
            <p><strong>Issue Description:</strong> {selectedBooking.notes || 'N/A'}</p>
            <p><strong>Preferred Schedule:</strong> {selectedBooking.PreferredSchedule ? 
  (selectedBooking.PreferredSchedule.toDate ? selectedBooking.PreferredSchedule.toDate().toLocaleString() : new Date(selectedBooking.PreferredSchedule).toLocaleString()) 
  : 'N/A'}
</p> <p><strong>Contact Information:</strong> {selectedBooking.contact || 'N/A'}</p>
            <p><strong>Images:</strong> {selectedBooking.images && selectedBooking.images.length > 0 ? selectedBooking.images.map((url, index) => (
          <img key={index} src={url} alt="booking" style={{ width: '100px', marginRight: '5px' }} />
        )) : 'N/A'}</p>
          </>
        )}
  
        {selectedBooking.serviceType === 'recreationalservice' && (
          <>
            <p><strong>Service Name:</strong> {selectedBooking.itemName}</p>
            <p><strong>Special Requirements:</strong> {selectedBooking.cause || 'N/A'}</p>
            <p><strong>Booking Details:</strong> {selectedBooking.BookingDetails ? 
  (selectedBooking.BookingDetails.toDate ? selectedBooking.BookingDetails.toDate().toLocaleString() : new Date(selectedBooking.BookingDetails).toLocaleString()) 
  : 'N/A'}
</p>

            <p><strong>Participants:</strong> {selectedBooking.participants || 'N/A'}</p>
            <p><strong>Contact Information:</strong> {selectedBooking.contact || 'N/A'}</p>
          </>
        )}
  
        <p><strong>Payment Method:</strong> {selectedBooking.paymentMethod || 'N/A'}</p>
        <p><strong>Images:</strong> {selectedBooking.images && selectedBooking.images.length > 0 ? selectedBooking.images.map((url, index) => (
          <img key={index} src={url} alt="booking" style={{ width: '100px', marginRight: '5px' }} />
        )) : 'N/A'}</p>
      </div>
    );
  };

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
