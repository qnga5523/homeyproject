import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { db } from '../../../Services/firebase';
import { Table, message, Card, Typography, Row, Col } from "antd";
const { Title } = Typography;
export default function TableBuilding() {
  const [ownerCounts, setOwnerCounts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOwnerCounts();
  }, []);

  const fetchOwnerCounts = async () => {
    setLoading(true);
    try {
      const usersQuery = query(
        collection(db, "Users"),
        where("role", "==", "owner"),
        where("approved", "==", true)
      );
      const querySnapshot = await getDocs(usersQuery);
      const countsByBuilding = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const building = data.building;
        if (building) {
          countsByBuilding[building] = (countsByBuilding[building] || 0) + 1;
        }
      });
      const totalOwners = querySnapshot.size;

      const formattedCounts = Object.entries(countsByBuilding).map(
        ([building, count]) => ({
          building,
          count,
          percentage: ((count / totalOwners) * 100).toFixed(2) + "%" 
        })
      );


      setOwnerCounts(formattedCounts);
    } catch (error) {
      message.error("Failed to fetch owner counts: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Building",
      dataIndex: "building",
      key: "building",
      width: "50%",
    },
    {
      title: "Owner Count",
      dataIndex: "count",
      key: "count",
      width: "50%", 
    },
    {
      title: "Percentage",
      dataIndex: "percentage",
      key: "percentage",
      width: "50%", 
    },
  ];

  return (
    <Row justify="center" style={{ padding: "30px" }}>
    <Col span={24}>
      <Card
        bordered={false}
        style={{
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          padding: "20px",
        }}
      >
        
        <Table
          columns={columns}
          dataSource={ownerCounts}
          rowKey="building"
          loading={loading}
          pagination={{ pageSize: 5 }}
          bordered
          style={{ marginTop: "20px" }}
          scroll={{ x: "100%" }} 
        />
      </Card>
    </Col>
  </Row>
  );
}