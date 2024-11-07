import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { List, Card, DatePicker, Spin } from 'antd';
import { db } from '../../Services/firebase';
import { doc, getDoc } from "firebase/firestore";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import moment from 'moment';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function FeedbackReport() {
  const [chartData, setChartData] = useState(null);
  const [openFeedback, setOpenFeedback] = useState({
    improvementSuggestions: [],
    usefulFeatures: [],
  });
  const [selectedDate, setSelectedDate] = useState(moment());
  const [loading, setLoading] = useState(false);

  const fetchData = async (date) => {
    setLoading(true);
    const month = date.format("MMMM");
    const year = date.format("YYYY");
    const documentId = `${month}-${year}`;

    const summaryRef = doc(db, "feedback_summary", documentId);
    const summaryDoc = await getDoc(summaryRef);

    if (summaryDoc.exists()) {
      const data = summaryDoc.data();

      // Chuẩn bị dữ liệu cho biểu đồ
      const satisfactionData = Object.values(data.satisfaction);
      const chartLabels = ["1 - Rất không hài lòng", "2 - Không hài lòng", "3 - Bình thường", "4 - Hài lòng"];
      setChartData({
        labels: chartLabels,
        datasets: [
          {
            label: "Satisfaction Levels",
            data: satisfactionData,
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
          }
        ]
      });

      // Lưu các phản hồi mở vào state
      setOpenFeedback({
        improvementSuggestions: data.improvementSuggestions,
        usefulFeatures: data.usefulFeatures
      });
    } else {
      // Nếu không có dữ liệu cho tháng đã chọn
      setChartData(null);
      setOpenFeedback({
        improvementSuggestions: [],
        usefulFeatures: []
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Feedback Summary</h1>

      {/* Date Picker để chọn tháng và năm */}
      <div className="flex justify-center mb-6">
        <DatePicker 
          picker="month" 
          onChange={handleDateChange} 
          value={selectedDate} 
          format="MMMM YYYY"
        />
      </div>

      {loading ? (
        <div className="flex justify-center">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Biểu đồ hình tròn */}
          {chartData ? (
            <div className="mb-8 flex justify-center">
              <div style={{ width: "50%", maxWidth: "300px", margin: "0 auto" }}>
                <h2 className="text-2xl font-semibold mb-4 text-center">Overall Satisfaction</h2>
                <Pie data={chartData} />
              </div>
            </div>
          ) : (
            <p className="text-center text-lg">No feedback data available for the selected month.</p>
          )}

          {/* Danh sách câu trả lời mở */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Improvement Suggestions</h2>
            <List
              bordered
              dataSource={openFeedback.improvementSuggestions}
              renderItem={(item) => (
                <List.Item>
                  <Card>{item}</Card>
                </List.Item>
              )}
            />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Useful Features</h2>
            <List
              bordered
              dataSource={openFeedback.usefulFeatures}
              renderItem={(item) => (
                <List.Item>
                  <Card>{item}</Card>
                </List.Item>
              )}
            />
          </div>
        </>
      )}
    </div>
  );
}
