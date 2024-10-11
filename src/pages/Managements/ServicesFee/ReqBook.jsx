import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react'
import { useEffect } from 'react';
import { db } from '../../../Services/firebase';
import { Table, Button, Input, message } from 'antd';

export default function ReqBook() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, 'serviceBookings'));
      const bookingsList = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setBookings(bookingsList);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleResponse = async (id) => {
    try {
      await updateDoc(doc(db, 'serviceBookings', id), {
        status: 'Resolved',
        adminResponse: response[id] || '',
      });
      message.success('Response sent successfully!');
    } catch (error) {
      message.error('Failed to send response.');
    }
  };

  const columns = [
    { title: 'Resident Name', dataIndex: 'residentName', key: 'residentName' },
    { title: 'Issue Type', dataIndex: 'issueType', key: 'issueType' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    {
      title: 'Admin Response',
      render: (record) => (
        <div>
          <Input.TextArea
            rows={2}
            value={response[record.id] || ''}
            onChange={(e) => setResponse({ ...response, [record.id]: e.target.value })}
          />
          <Button type="primary" onClick={() => handleResponse(record.id)}>
            Respond
          </Button>
        </div>
      ),
      key: 'adminResponse',
    },
  ];

  return <Table columns={columns} dataSource={bookings} loading={loading} rowKey="id" />;
};

