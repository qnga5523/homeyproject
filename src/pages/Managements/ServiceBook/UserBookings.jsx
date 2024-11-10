import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../../Services/firebase';
import { Table, Tag } from 'antd';

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
    title: 'Admin Response',
    dataIndex: 'adminResponse',
    key: 'adminResponse',
    render: (response) => response || 'No response yet',
  },
  {
    title: 'Proposed Times',
    dataIndex: 'proposedTimes',
    key: 'proposedTimes',
    render: (times) => (
      times && times.length > 0
        ? times.map((time, index) => (
            <div key={index}>
              {new Date(time).toLocaleString()}
            </div>
          ))
        : 'No times proposed'
    ),
  },
  {
    title: 'Date',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (timestamp) => new Date(timestamp?.seconds * 1000).toLocaleString(),
  },
];

export default function UserBookings() {
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!auth.currentUser) {
        return;
      }

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

  return (
    <div>
      <h2>Your Bookings</h2>
      <Table
        columns={columns}
        dataSource={userBookings}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
}
