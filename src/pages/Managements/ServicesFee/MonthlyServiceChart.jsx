import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, Filler } from 'chart.js';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../Services/firebase';
import { getAuth } from 'firebase/auth';
import moment from 'moment';
import { Card, Col, Row, Spin, Typography, message } from 'antd';
import { DollarOutlined, SlidersTwoTone } from '@ant-design/icons';


const { Title } = Typography;

Chart.register(Filler);

export default function MonthlyServiceFeeChart() {
  const [moneyChartData, setMoneyChartData] = useState(null);
  const [waterChartData, setWaterChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buildingId, setBuildingId] = useState(null); 
  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Fetch user's building ID
  const fetchUserBuilding = async () => {
    try {
      if (!currentUser) {
        message.error("User not authenticated");
        return;
      }
      const userDocRef = doc(db, "Users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setBuildingId(userData.building);
      } else {
        message.warning("User data not found.");
      }
    } catch (error) {
      message.error("Error fetching user building: " + error.message);
    }
  };

  // Fetch monthly fees for both money and water
  const fetchMonthlyFees = async (building) => {
    if (!currentUser || !building) return;
    const moneyData = {};
    const waterData = {};
    for (let i = 0; i < 12; i++) {
      const date = moment().subtract(i, 'months');
      const monthYear = date.format("YYYY-MM");

      try {
        const userFeeDocRef = doc(
          db,
          "Fees",
          `${date.format("MMMM")}_${date.year()}`,
          "Buildings",
          building,
          "Users",
          currentUser.uid
        );

        const userFeeDoc = await getDoc(userFeeDocRef);
        if (userFeeDoc.exists()) {
          const totalmoney = userFeeDoc.data().totalmoney || 0;
          const totalwater = userFeeDoc.data().totalwater || 0; 
          moneyData[monthYear] = totalmoney;
          waterData[monthYear] = totalwater;
        } else {
          moneyData[monthYear] = 0; 
          waterData[monthYear] = 0;
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    }

    const labels = Object.keys(moneyData).sort(); 
    const moneyValues = labels.map((month) => moneyData[month]);
    const waterValues = labels.map((month) => waterData[month]);
  
    setMoneyChartData({
      labels,
      datasets: [
        {
          label: 'Monthly Service Fees (Total Money)',
          data: moneyValues,
          borderColor: '#36A2EB',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          fill: true,
        },
      ],
    });
  
    setWaterChartData({
      labels,
      datasets: [
        {
          label: 'Monthly Water Fees (Total Water)',
          data: waterValues,
          borderColor: '#FF6384',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          fill: true,
        },
      ],
    });

    setLoading(false);
  };

  useEffect(() => {
    fetchUserBuilding();
  }, []);

  useEffect(() => {
    if (buildingId) {
      fetchMonthlyFees(buildingId);
    }
  }, [buildingId]);

  return (
    <div>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[24, 24]} style={{ padding: '20px' }}>
          <Col span={12}>
            <Card
              bordered={false}
              style={{
                borderRadius: '10px',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <DollarOutlined style={{ fontSize: '24px', color: '#36A2EB', marginRight: '8px' }} />
                <Title level={4} style={{ margin: 0, color: '#36A2EB' }}>Monthly Service Fee Comparison</Title>
              </div>
              <div style={{ height: 300 }}>
                <Line
                  data={moneyChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: { title: { display: true, text: 'Month' } },
                      y: { title: { display: true, text: 'Service Fee (USD)' }, beginAtZero: true },
                    },
                  }}
                />
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card
              bordered={false}
              style={{
                borderRadius: '10px',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <Title level={4} style={{ margin: 0, color: '#FF6384' }}>Monthly Water Fee Comparison</Title>
              </div>
              <div style={{ height: 300 }}>
                <Line
                  data={waterChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: { title: { display: true, text: 'Month' } },
                      y: { title: { display: true, text: 'Water Fee (USD)' }, beginAtZero: true },
                    },
                  }}
                />
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
