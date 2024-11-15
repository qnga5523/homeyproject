import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../../Services/firebase';
import { Table, Tag, Button, Modal, Typography } from 'antd';

const { Title } = Typography;

export default function UserBookings() {
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!auth.currentUser) return;
      try {
        const userId = auth.currentUser.uid;
        const bookingsQuery = query(
          collection(db, 'serviceBookings'),
          where('userId', '==', userId)
        );
        const querySnapshot = await getDocs(bookingsQuery);
        const bookingsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUserBookings(bookingsList);
      } catch (error) {
        console.error('Error fetching user bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBookings();
  }, []);

  const columns = [
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
        <Tag color={status === 'Responded' ? 'green' : 'red'}>
          {status ? status.toUpperCase() : 'PENDING'}
        </Tag>
      ),
    },
    {
      title: 'Admin Response',
      dataIndex: 'adminResponse',
      key: 'adminResponse',
      render: (response) => response || 'No response yet',
    },
    {
      title: 'Proposed Times',
      dataIndex: 'proposedTimes',
      key: 'proposedTimes',
      render: (times) =>
        times && times.length > 0
          ? times.map((time, index) => (
              <div key={index}>{new Date(time).toLocaleString()}</div>
            ))
          : 'No times proposed',
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (timestamp) =>
        timestamp ? new Date(timestamp.seconds * 1000).toLocaleString() : 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type="link" onClick={() => handleViewDetails(record)}>
          View Details
        </Button>
      ),
    },
  ];

  const handleViewDetails = (record) => {
    setSelectedBooking(record);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedBooking(null);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: 'auto' }}>
      <Title level={3} style={{ textAlign: 'center', marginBottom: '20px' }}>Your Bookings</Title>
      <Table
        columns={columns}
        dataSource={userBookings}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        bordered
        style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px' }}
      />
      
      {/* Booking Details Modal */}
      <Modal
        title="Booking Details"
        visible={modalVisible}
        onCancel={handleModalClose}
        footer={<Button onClick={handleModalClose}>Close</Button>}
      >
        {selectedBooking && (
          <div>
            <p><strong>Service Type:</strong> {selectedBooking.serviceType.toUpperCase()}</p>
            <p><strong>Status:</strong> {selectedBooking.responseStatus || 'Pending'}</p>
            <p><strong>Admin Response:</strong> {selectedBooking.adminResponse || 'No response yet'}</p>
            <p><strong>Proposed Times:</strong></p>
            <ul>
              {selectedBooking.proposedTimes && selectedBooking.proposedTimes.length > 0 ? (
                selectedBooking.proposedTimes.map((time, index) => (
                  <li key={index}>{new Date(time).toLocaleString()}</li>
                ))
              ) : (
                <p>No proposed times</p>
              )}
            </ul>
            <p><strong>Date:</strong> {selectedBooking.createdAt ? new Date(selectedBooking.createdAt.seconds * 1000).toLocaleString() : 'N/A'}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
