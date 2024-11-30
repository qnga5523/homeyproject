import React, { useEffect, useState } from "react";
import {
  DatePicker,
  message,
  Typography,
  Divider,
  Statistic,
  Alert,
  Button,
} from "antd";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../Services/firebase";
import moment from "moment";
import { getAuth } from "firebase/auth";
import { PDFDownloadLink } from "@react-pdf/renderer";
import {
  FilePdfOutlined,
  HomeOutlined,
  AuditOutlined,
  CopyrightOutlined,
} from "@ant-design/icons";
import MonthlyServiceFeeChart from "../../../components/common/Chart/MonthlyServiceChart";
import InvoiceDocument from "../../../components/common/Invoice/InvoiceDocument";

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
    <div className="flex flex-col lg:flex-row gap-8 p-6 max-w-7xl mx-auto bg-gray-50 rounded-lg shadow-md">
      {/* Left Section */}
      <div className="w-full lg:w-2/5 bg-white rounded-lg shadow-md p-6">
        <Title level={4} className="text-blue-600 mb-4">
          Service Fee Invoice
        </Title>
        <DatePicker
          picker="month"
          value={selectedMonth}
          onChange={(date) => setSelectedMonth(date)}
          className="w-full mb-6"
        />
        {fees ? (
          <>
            <Divider orientation="left">
              <AuditOutlined /> Invoice Details
            </Divider>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Statistic
                title="Room"
                value={fees.room || "N/A"}
                prefix={<HomeOutlined />}
                className="text-center"
              />
              <Statistic
                title="Building"
                value={fees.building || "N/A"}
                prefix={<CopyrightOutlined />}
                className="text-center"
              />
            </div>
            <Divider orientation="center">Service Fees</Divider>
      <div className="space-y-2 text-center text-sm">
              <Text strong>Area Fee:   </Text>
              <Text>{USDollar.format(fees.totalarea || 0)}</Text>
              <br />
              <Text strong>Water Fee:   </Text>
              <Text>{USDollar.format(fees.totalwater || 0)}</Text>
              <br />
              <Text strong>Parking Fee:   </Text>
              <Text>{USDollar.format(fees.totalParking || 0)}</Text>
            </div>
            <Divider />
            <Title level={4} className="text-blue-500 text-center ">
              Total Amount: {USDollar.format(fees.totalmoney || 0)}
            </Title>
            <Divider />
            <div className="text-center">
              <Text type="secondary">Thank you for your payment!</Text>
            </div>
            <div className="mt-4 flex justify-center">
              <PDFDownloadLink
                document={<InvoiceDocument user={fees} />}
                fileName={`Invoice_${selectedMonth.format("MMMM")}_${selectedYear}.pdf`}
              >
                {({ loading }) =>
                  loading ? (
                    "Loading document..."
                  ) : (
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
      </div>
      <div className="w-full lg:w-3/5 bg-white rounded-lg shadow-md p-6">
        <Title level={4} className="text-blue-600 mb-4">
          Monthly Service Fee Overview
        </Title>
        <MonthlyServiceFeeChart />
      </div>
    </div>
  );
}
