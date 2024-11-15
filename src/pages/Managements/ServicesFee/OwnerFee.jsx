import React, { useEffect, useState } from "react";
import {
  DatePicker,
  message,
  Typography,
  Divider,
  Col,
  Row,
  Button,
  Card,
  Statistic,
  Space,
  Alert
} from "antd";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../Services/firebase";
import moment from "moment";
import { getAuth } from "firebase/auth";
import MonthlyServiceFeeChart from "./MonthlyServiceChart";
import InvoiceDocument from "../../../components/layout/Colums/InvoiceDocument";
import { PDFDownloadLink } from "@react-pdf/renderer";
import {
  FilePdfOutlined,
  HomeOutlined,
  AuditOutlined,
  CopyrightOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function OwnerInvoice() {
  const [fees, setFees] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(moment().subtract(1, "months"));
  const [selectedYear, setSelectedYear] = useState(moment().year());
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
        fetchFees(userData.building);
      } else {
        message.warning("User data not found.");
      }
    } catch (error) {
      message.error("Error fetching user building: " + error.message);
    }
  };

  const fetchFees = async (building) => {
    if (!currentUser || !building) {
      message.error("User or building information is missing.");
      return;
    }

    try {
      const month = selectedMonth.format("MMMM");
      const year = selectedYear;

      const userFeeDocRef = doc(
        db,
        "Fees",
        `${month}_${year}`,
        "Buildings",
        building,
        "Users",
        currentUser.uid
      );

      const userFeeDoc = await getDoc(userFeeDocRef);

      if (!userFeeDoc.exists()) {
        message.warning("No data found for this month and year.");
        setFees(null);
        return;
      }

      const userFeeData = { id: userFeeDoc.id, ...userFeeDoc.data() };
      setFees(userFeeData);
    } catch (error) {
      message.error("Error loading fees: " + error.message);
    }
  };

  useEffect(() => {
    fetchUserBuilding();
  }, []);

  useEffect(() => {
    if (buildingId) {
      fetchFees(buildingId);
    }
  }, [selectedMonth, selectedYear, buildingId]);

  const USDollar = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  });

  return (
    <Row gutter={16} style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      <Col xs={24} md={12}>
        <Card bordered={false} style={{ borderRadius: "8px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Title level={4} style={{ color: "#0073e6" }}>Service Fee Invoice</Title>
            <DatePicker
              picker="month"
              value={selectedMonth}
              onChange={(date) => setSelectedMonth(date)}
              style={{ marginBottom: 16, display: "block", width: "100%" }}
            />
            {fees ? (
              <>
                <Divider orientation="left"> <AuditOutlined />Invoice Details</Divider>
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={12}>
                    <Statistic
                      title="Room"
                      value={fees.room || "N/A"}
                      prefix={<HomeOutlined />}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Building"
                      value={fees.building || "N/A"}
                      prefix={<CopyrightOutlined />}
                    />
                  </Col>
                </Row>
                <Divider orientation="left">Service Fees</Divider>
                <Space direction="vertical" size="small" style={{ lineHeight: "2.0" }}>
                  <Text strong>Area Fee: </Text>
                  <Text>{USDollar.format(fees.totalarea || 0)}</Text>
                  <Text strong>Water Fee: </Text>
                  <Text>{USDollar.format(fees.totalwater || 0)}</Text>
                  <Text strong>Parking Fee: </Text>
                  <Text>{USDollar.format(fees.totalParking || 0)}</Text>
                </Space>
                <Divider />
                <Title level={4} style={{ color: "#1890ff" }}>
                  Total Amount: {USDollar.format(fees.totalmoney || 0)}
                </Title>
                <Divider />
                <div style={{ textAlign: "center", marginTop: "10px" }}>
                  <Text type="secondary">Thank you for your payment!</Text>
                </div>
                <div style={{ marginTop: 10, textAlign: "center" }}>
                  <PDFDownloadLink
                    document={<InvoiceDocument user={fees} />}
                    fileName={`Invoice_${selectedMonth.format("MMMM")}_${selectedYear}.pdf`}
                  >
                    {({ loading }) =>
                      loading ? "Loading document..." : (
                        <Button type="primary" icon={<FilePdfOutlined />}>
                          Download Invoice PDF
                        </Button>
                      )
                    }
                  </PDFDownloadLink>
                </div>
              </>
            ) : (
              <Alert
                message="No data available for the selected month and year."
                type="warning"
                showIcon
              />
            )}
          </Space>
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card
          title="Monthly Service Fee Overview"
          bordered={false}
          style={{ borderRadius: "8px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
        >
          <MonthlyServiceFeeChart />
        </Card>
      </Col>
    </Row>
  );
}
