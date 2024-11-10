import React, { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import moment from 'moment';
import { Spin } from 'antd';
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
        vehicleType: data.vehicleType || null
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
      },
      {
        label: 'Water Price',
        data: dates.map(date => getPriceOnDate(pricesData.water, date)),
        backgroundColor: '#36A2EB',
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
        fill: false,
        tension: 0.3,
      },
      {
        label: 'Parking - Electric',
        data: dates.map(date => getPriceOnDate(pricesData.parking, date, 'Electric')),
        borderColor: '#FFCE56',
        fill: false,
        tension: 0.3,
      },
      {
        label: 'Parking - Motorcycle',
        data: dates.map(date => getPriceOnDate(pricesData.parking, date, 'Motorcycle')),
        borderColor: '#36A2EB',
        fill: false,
        tension: 0.3,
      },
      {
        label: 'Parking - Bicycle',
        data: dates.map(date => getPriceOnDate(pricesData.parking, date, 'Bicycle')),
        borderColor: '#4BC0C0',
        fill: false,
        tension: 0.3,
      },
    ],
  };

  return (
    <div>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '40px' }}>
            <h3>Cleaning and Water Price Comparison (Bar Chart)</h3>
            <Bar data={barChartData} options={{ responsive: true }} />
          </div>
          <div>
            <h3>Parking Price Comparison by Vehicle Type (Line Chart)</h3>
            <Line data={lineChartData} options={{ responsive: true }} />
          </div>
        </>
      )}
    </div>
  );
}
