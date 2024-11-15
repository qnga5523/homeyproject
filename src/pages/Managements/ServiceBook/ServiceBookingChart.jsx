import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../Services/firebase';
import moment from 'moment';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card } from 'antd';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function ServiceBookingChart() {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const fetchMonthlyBookings = async () => {
      const bookingsRef = collection(db, 'serviceBookings');
      const querySnapshot = await getDocs(bookingsRef);

      const monthlyCounts = {};

      querySnapshot.forEach((doc) => {
        const booking = doc.data();
        if (booking.createdAt && booking.serviceType) {
          const monthYear = moment(booking.createdAt.toDate()).format('YYYY-MM');
          if (!monthlyCounts[monthYear]) {
            monthlyCounts[monthYear] = {
              cleaning: 0,
              security: 0,
              managementservice: 0,
              infrastructureservice: 0,
              recreationalservice: 0,
            };
          }
          monthlyCounts[monthYear][booking.serviceType] += 1;
        }
      });

      const sortedMonths = Object.keys(monthlyCounts).sort((a, b) => moment(a).diff(moment(b)));
      const datasets = [
        {
          label: 'Cleaning Services',
          backgroundColor: '#36A2EB',
          data: sortedMonths.map((month) => monthlyCounts[month].cleaning),
        },
        {
          label: 'Security Services',
          backgroundColor: '#4BC0C0',
          data: sortedMonths.map((month) => monthlyCounts[month].security),
        },
        {
          label: 'Management Services',
          backgroundColor: '#FFCE56',
          data: sortedMonths.map((month) => monthlyCounts[month].managementservice),
        },
        {
          label: 'Infrastructure Services',
          backgroundColor: '#FF6384',
          data: sortedMonths.map((month) => monthlyCounts[month].infrastructureservice),
        },
        {
          label: 'Recreational Services',
          backgroundColor: '#9966FF',
          data: sortedMonths.map((month) => monthlyCounts[month].recreationalservice),
        },
      ];

      setChartData({
        labels: sortedMonths,
        datasets: datasets,
      });
    };

    fetchMonthlyBookings();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: { enabled: true },
    },
    scales: {
      x: { 
        stacked: false, 
        title: { display: true, text: 'Month-Year' } 
      },
      y: { 
        stacked: false, 
        title: { display: true, text: 'Bookings' }, 
        beginAtZero: true 
      },
    },
  };

  return ( 
    <Card className="text-center" style={{ padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <div style={{ width: "100%", maxWidth: "400px" }}>
       <Bar style={{ height: "280px" }} data={chartData} options={{ maintainAspectRatio: false }} />     
    </div>
  </Card>
  );
}
