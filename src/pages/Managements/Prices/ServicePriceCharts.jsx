import React, { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import moment from 'moment';
import { Spin, Row, Col, Card, Typography } from 'antd';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../Services/firebase';
import { DollarOutlined, CarOutlined, ContainerOutlined } from '@ant-design/icons';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const { Title: AntTitle } = Typography;

export default function ServicePriceCharts() {
  const [pricesData, setPricesData] = useState({ cleaning: [], parking: [], water: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const cleaningPrices = await getServicePrices('cleanPrices');
        const parkingPrices = await getServicePrices('parkingPrices');
        const waterPrices = await getServicePrices('waterPrices');

        setPricesData({
          cleaning: cleaningPrices,
          parking: parkingPrices,
          water: waterPrices,
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    };

    fetchPrices();
  }, []);

  const getServicePrices = async (collectionName) => {
    const pricesCollection = collection(db, collectionName);
    const priceSnapshot = await getDocs(pricesCollection);
    return priceSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        date: data.date.toDate(),
        price: data.price,
        vehicleType: data.vehicleType || null,
      };
    });
  };

  const dates = Array.from(new Set([
    ...pricesData.cleaning.map(p => moment(p.date).format('YYYY-MM-DD')),
    ...pricesData.parking.map(p => moment(p.date).format('YYYY-MM-DD')),
    ...pricesData.water.map(p => moment(p.date).format('YYYY-MM-DD')),
  ])).sort();

  const getPriceOnDate = (data, date, vehicleType = null) => {
    const entry = vehicleType
      ? data.find(d => moment(d.date).format('YYYY-MM-DD') === date && d.vehicleType === vehicleType)
      : data.find(d => moment(d.date).format('YYYY-MM-DD') === date);
    return entry ? entry.price : 0;
  };

  const barChartData = {
    labels: dates,
    datasets: [
      {
        label: 'Cleaning Price',
        data: dates.map(date => getPriceOnDate(pricesData.cleaning, date)),
        backgroundColor: '#4BC0C0',
        maxBarThickness: 20,
      },
      {
        label: 'Water Price',
        data: dates.map(date => getPriceOnDate(pricesData.water, date)),
        backgroundColor: '#36A2EB',
        maxBarThickness: 20,
      },
    ],
  };

  const lineChartData = {
    labels: dates,
    datasets: [
      {
        label: 'Parking - Car',
        data: dates.map(date => getPriceOnDate(pricesData.parking, date, 'Car')),
        borderColor: '#FF6384',
        borderWidth: 2,
        pointRadius: 3,
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Parking - Electric',
        data: dates.map(date => getPriceOnDate(pricesData.parking, date, 'Electric')),
        borderColor: '#FFCE56',
        borderWidth: 2,
        pointRadius: 3,
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Parking - Motorcycle',
        data: dates.map(date => getPriceOnDate(pricesData.parking, date, 'Motorcycle')),
        borderColor: '#36A2EB',
        borderWidth: 2,
        pointRadius: 3,
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Parking - Bicycle',
        data: dates.map(date => getPriceOnDate(pricesData.parking, date, 'Bicycle')),
        borderColor: '#4BC0C0',
        borderWidth: 2,
        pointRadius: 3,
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        suggestedMin: 0,
        suggestedMax: 100,
        title: {
          display: true,
          text: 'Price (in USD)',
        },
        ticks: {
          stepSize: 10,
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw} USD`,
        },
      },
    },
  };

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
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <ContainerOutlined style={{ color: '#4BC0C0', marginRight: '8px' }} />
                  <AntTitle level={4} style={{ margin: 0, color: '#4BC0C0' }}>Cleaning and Water Price Comparison</AntTitle>
                </div>
              }
              bordered={false}
              style={{
                borderRadius: '10px',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div style={{ height: 300, padding: '10px' }}>
                <Bar data={barChartData} options={chartOptions} />
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CarOutlined style={{ color: '#FF6384', marginRight: '8px' }} />
                  <AntTitle level={4} style={{ margin: 0, color: '#FF6384' }}>Parking Price Comparison by Vehicle Type</AntTitle>
                </div>
              }
              bordered={false}
              style={{
                borderRadius: '10px',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div style={{ height: 300, padding: '10px' }}>
                <Line data={lineChartData} options={chartOptions} />
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
