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
import { CarOutlined, ContainerOutlined } from '@ant-design/icons';

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
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw} USD`,
        },
      },
    },
  };

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
              title={
                <div className="flex items-center">
                  <ContainerOutlined className="text-blue-500 mr-2" />
                  <AntTitle level={5} className="m-0 text-blue-500">Cleaning and Water Price Comparison</AntTitle>
                </div>
              }
              bordered={false}
              className="shadow rounded-lg"
              bodyStyle={{ padding: '16px' }}
            >
              <div className="w-full h-64 md:h-72 lg:h-80">
                <Bar data={barChartData} options={chartOptions} />
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12} className="mb-4">
            <Card
              title={
                <div className="flex items-center">
                  <CarOutlined className="text-red-500 mr-2" />
                  <AntTitle level={5} className="m-0 text-red-500">Parking Price Comparison by Vehicle Type</AntTitle>
                </div>
              }
              bordered={false}
              className="shadow rounded-lg"
              bodyStyle={{ padding: '16px' }}
            >
              <div className="w-full h-64 md:h-72 lg:h-80">
                <Line data={lineChartData} options={chartOptions} />
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
