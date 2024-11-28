import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart, Filler } from "chart.js";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../../Services/firebase";
import moment from "moment";
import { Card, Col, Row, Spin, Typography, Table } from "antd";
import { DollarOutlined } from "@ant-design/icons";

const { Title } = Typography;

Chart.register(Filler);

export default function TotalFee({ showTableOnly = true }) {
  const [chartData, setChartData] = useState(null);
  const [feeTableData, setFeeTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchMonthlyFeesForAllBuildings = async () => {
    const monthlyData = {};
    const tableData = [];
    for (let i = 0; i < 12; i++) {
      const date = moment().subtract(i, "months");
      const monthYear = date.format("YYYY-MM");
      const monthLabel = date.format("MMMM YYYY");
      try {
        const buildingsSnapshot = await getDocs(
          collection(db, "monthlyIncomeReports")
        );
        let totalIncomeAllBuildings = 0;
        const buildingContributions = [];
        buildingsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (doc.id.startsWith(`${date.format("MMMM")}_${date.year()}`)) {
            const income = data.totalIncome || 0;
            totalIncomeAllBuildings += income;
            buildingContributions.push({ building: data.building, income });
          }
        });
        buildingContributions.forEach((buildingData) => {
          const { building, income } = buildingData;
          const percentage = totalIncomeAllBuildings
            ? ((income / totalIncomeAllBuildings) * 100).toFixed(2)
            : 0;

          tableData.push({
            key: `${monthYear}-${building}`,
            month: monthLabel,
            building,
            totalMoney: `$${income.toFixed(2)}`,
            percentage: `${percentage}%`,
            totalIncome: `$${totalIncomeAllBuildings.toLocaleString()}`,
            isTotal: true,
          });
        });
        monthlyData[monthYear] = totalIncomeAllBuildings;
      } catch (error) {
        console.error("Error fetching building fees:", error);
      }
    }
    const labels = Object.keys(monthlyData).sort();
    const incomeValues = labels.map((month) => monthlyData[month]);
    setChartData({
      labels,
      datasets: [
        {
          label: "Total Fees (All Buildings)",
          data: incomeValues,
          borderColor: "#36A2EB",
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          fill: true,
        },
      ],
    });
    setFeeTableData(tableData);
    setLoading(false);
  };
  useEffect(() => {
    fetchMonthlyFeesForAllBuildings();
  }, []);
  const calculateRowSpan = (data, key, value, index) => {
    const firstOccurrenceIndex = data.findIndex((item) => item[key] === value);
    if (firstOccurrenceIndex === index) {
    
      return data.filter((item) => item[key] === value).length;
    }
    return 0; 
  };  
  const feeTableColumns = [
    {
      title: "Month",
      dataIndex: "month",
      key: "month",
      render: (text, record, index) => {
        const rowSpan = calculateRowSpan(feeTableData, "month", record.month, index);
        return {
          children: text,
          props: {
            rowSpan, 
          },
        };
      },
    },
    {
      title: "Total Income ($)",
      dataIndex: "totalIncome",
      key: "totalIncome",
      render: (text, record, index) => {
        const rowSpan = calculateRowSpan(feeTableData, "month", record.month, index);
        return {
          children: <strong>{text}</strong>,
          props: {
            rowSpan, 
          },
        };
      },
    },

    {
      title: "Building",
      dataIndex: "building",
      key: "building",
      render: (text, record) =>
        record.isTotal ? <>{text}</> : text,
    },
    {
      title: "Total Money($)",
      dataIndex: "totalMoney",
      key: "totalMoney",
      render: (text, record) =>
        record.isTotal ? <strong>{text}</strong> : text,
    },
    {
      title: "Contribution (%)",
      dataIndex: "percentage",
      key: "percentage",
      render: (text, record) =>
        record.isTotal ? <strong>{text}</strong> : text,
    },
  ];
  return (
    <div className="px-4 md:px-8 lg:px-12">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <div>
          {!showTableOnly && (
            <Row gutter={[16, 16]} className="w-full">
              <Col xs={24} md={24} className="mb-4">
                <Card
                  bordered={false}
                  className="shadow rounded-lg"
                  bodyStyle={{ padding: "10p  x" }}
                  style={{
                    borderRadius: "5px",
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                    maxWidth: "100%",
                  }}
                >
                  <div className="flex items-center mb-4">
                    <DollarOutlined
                      className="text-blue-500 mr-2"
                      style={{ fontSize: "28px" }}
                    />
                    <Title
                      level={5}
                      className="m-0 text-blue-500 text-center md:text-left"
                    >
                      Monthly Fee Comparison (All Buildings)
                    </Title>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "500px",
                    }}
                  >
                    <Line
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          x: {
                            title: {
                              display: true,
                              text: "Month",
                            },
                          },
                          y: {
                            title: {
                              display: true,
                              text: "Total Income (USD)",
                            },
                            beginAtZero: true,
                          },
                        },
                      }}
                    />
                  </div>
                </Card>
              </Col>
            </Row>
          )}

          <div className="mt-6">
            <Card
              bordered={false}
              className="shadow rounded-lg"
              bodyStyle={{ padding: "16px" }}
              style={{
                borderRadius: "10px",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Title level={5} className="mb-4 text-center">
                Building Fee Contribution Table
              </Title>
              <Table
                columns={feeTableColumns}
                dataSource={feeTableData}
                pagination={false}
                bordered
              />
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
