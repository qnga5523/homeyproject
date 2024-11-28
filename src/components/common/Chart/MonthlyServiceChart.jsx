import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, Filler } from 'chart.js';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../Services/firebase';
import { getAuth } from 'firebase/auth';
import moment from 'moment';
import { Card, Col, Row, Spin, Typography, message } from 'antd';
import { DollarOutlined } from '@ant-design/icons';

const { Title } = Typography;

Chart.register(Filler);

export default function MonthlyServiceFeeChart() {
  const [moneyChartData, setMoneyChartData] = useState(null);
  const [waterChartData, setWaterChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buildingId, setBuildingId] = useState(null); 
  const auth = getAuth();
  const currentUser = auth.currentUser;

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
          label: 'Monthly Service Fees',
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
          label: 'Monthly Water Fees',
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
    <div className="px-4 md:px-8 lg:px-12">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[16, 16]} className="w-full">
          <Col xs={24} md={12} className="mb-4">
            <Card
              bordered={false}
              className="shadow rounded-lg"
              bodyStyle={{ padding: '16px' }}
              style={{ borderRadius: '10px', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }}
            >
              <div className="flex items-center mb-4">
                <DollarOutlined className="text-blue-500 mr-2" style={{ fontSize: '24px' }} />
                <Title level={5} className="m-0 text-blue-500 text-center md:text-left">
                  Monthly Service Fee Comparison
                </Title>
              </div>
              <div className="w-full h-64 md:h-72 lg:h-80">
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
          <Col xs={24} md={12} className="mb-4">
            <Card
              bordered={false}
              className="shadow rounded-lg"
              bodyStyle={{ padding: '16px' }}
              style={{ borderRadius: '10px', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }}
            >
              <div className="flex items-center mb-4">
                <DollarOutlined className="text-red-500 mr-2" style={{ fontSize: '24px' }} />
                <Title level={5} className="m-0 text-red-500 text-center md:text-left">
                  Monthly Water Fee Comparison
                </Title>
              </div>
              <div className="w-full h-64 md:h-72 lg:h-80">
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
