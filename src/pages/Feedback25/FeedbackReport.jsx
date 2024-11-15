import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { DatePicker, Spin, Card, Typography, List } from 'antd';
import { db } from '../../Services/firebase';
import { doc, getDoc } from "firebase/firestore";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import moment from 'moment';

ChartJS.register(ArcElement, Tooltip, Legend);

const { Title, Text } = Typography;

export default function FeedbackReport({ showAnswers = true , showDatePicker = true}) {
  const [chartData, setChartData] = useState(null);
  const [feedbackCount, setFeedbackCount] = useState(0);
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
      const satisfactionData = Object.values(data.satisfaction);
      const chartLabels = ["1 - Very dissatisfied", "2 - Dissatisfied", "3 - Neutral", "4 - Satisfied"];
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

      setFeedbackCount(data.feedbackCount || 0);
      setOpenFeedback({
        improvementSuggestions: data.improvementSuggestions,
        usefulFeatures: data.usefulFeatures
      });
    } else {
      setChartData(null);
      setFeedbackCount(0);
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
    <div>

      {showDatePicker && (
        <div className="flex justify-center mb-6">
          <DatePicker 
            picker="month" 
            onChange={handleDateChange} 
            value={selectedDate} 
            format="MMMM YYYY"
          />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center">
          <Spin size="large" />
        </div>
      ) : (
        <Card className="text-center" style={{ padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: "100%", maxWidth: "400px" }}>
            {chartData ? (
              <Pie style={{ height: "280px" }} data={chartData} options={{ maintainAspectRatio: false }} />
            ) : (
              <Text>No data available for the selected month.</Text>
            )}
          </div>
        </Card>
      )}

    
      {showAnswers && (
        <>
          <Card title="Improvement Suggestions" className="mb-8">
            <List
              dataSource={openFeedback.improvementSuggestions.slice(0, 3)}
              renderItem={(item) => (
                <List.Item>
                  <Text>{item}</Text>
                </List.Item>
              )}
            />
          </Card>

          <Card title="Useful Features">
            <List
              dataSource={openFeedback.usefulFeatures.slice(0, 3)}
              renderItem={(item) => (
                <List.Item>
                  <Text>{item}</Text>
                </List.Item>
              )}
            />
          </Card>
        </>
      )}
    </div>
  );
}
