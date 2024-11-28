import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
const styles = StyleSheet.create({
  page: { padding: 30 },
  section: { marginBottom: 15 },
  title: { fontSize: 20, marginBottom: 10, textAlign: "center", fontWeight: "bold", color: "#0073e6" },
  subtitle: { fontSize: 14, marginBottom: 5, fontWeight: "bold", color: "#0073e6" },
  text: { fontSize: 12 },
  table: { display: "table", width: "auto", borderStyle: "solid", borderWidth: 1, borderColor: '#bfbfbf', marginTop: 5 },
  tableRow: { flexDirection: "row" },
  tableColHeader: { width: "33.33%", borderStyle: "solid", borderWidth: 1, borderColor: '#0073e6', backgroundColor: "#e6f7ff", padding: 5, textAlign: "center" },
  tableCol: { width: "33.33%", borderStyle: "solid", borderWidth: 1, borderColor: '#bfbfbf', padding: 5, textAlign: "center" },
  tableColAlt: { width: "25%", borderStyle: "solid", borderWidth: 1, borderColor: '#bfbfbf', backgroundColor: "#f9f9f9", padding: 5, textAlign: "center" },
  tableCellHeader: { fontSize: 12, fontWeight: "bold", color: "#0073e6" },
  tableCell: { fontSize: 12 },
  paymentSection: { marginTop: 20, paddingTop: 10, borderTopWidth: 1, borderColor: '#bfbfbf' },
  paymentRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  paymentText: { fontSize: 12, fontWeight: "bold", color: "#333" },
  qrCode: { width: 80, height: 80 },
});
const InvoiceDocument = ({ user = {} }) => {
  console.log("User data inside InvoiceDocument:", user);
  const {
    username = "Username Placeholder",
    room = "Room Placeholder",
    building = "Building Placeholder",
    month="Month",
    day="Day",
    year="Year",
    area = "0",
    priceservice = "0",
    totalarea = "0",
    CSD = "0",
    CSC = "0",
    totalconsume = "0",
    priceswater = "0",
    totalwater = "0",
    carCount = "0",
    pricesCar = "0",
    totalCar = "0",
    motorcycleCount = "0",
    pricesMotorcycle = "0",
    totalMotorbike = "0",
    electricBicycleCount = "0",
    pricesElectric = "0",
    totalElectric = "0",
    bicycleCount = "0",
    pricesBicycle = "0",
    totalBicycle = "0",
    totalParking = "0",
    totalmoney = "0",
  } = user;
  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>Invoice</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.subtitle}>Customer Information</Text>
          <Text style={styles.text}>Username: {username}</Text>
          <Text style={styles.text}>Room: {room}</Text>
          <Text style={styles.text}>Building: {building}</Text>
          <Text style={styles.text}>Date: {day}/{month}/{year}</Text>         
        </View>
        <View style={styles.section}>
          <Text style={styles.subtitle}>Service Fees</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Area (m²)</Text></View>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Price</Text></View>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Total</Text></View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{area}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>${priceservice}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>${totalarea}</Text></View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Water Fees</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>CSD</Text></View>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>CSC</Text></View>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Consume</Text></View>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Price</Text></View>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Total</Text></View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{CSD}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{CSC}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{totalconsume}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>${priceswater}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>${totalwater}</Text></View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Parking Fees</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Vehicle Type</Text></View>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Amount</Text></View>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Price</Text></View>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Total</Text></View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableColAlt}><Text style={styles.tableCell}>Car</Text></View>
              <View style={styles.tableColAlt}><Text style={styles.tableCell}>{carCount}</Text></View>
              <View style={styles.tableColAlt}><Text style={styles.tableCell}>${pricesCar}</Text></View>
              <View style={styles.tableColAlt}><Text style={styles.tableCell}>${totalCar}</Text></View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableColAlt}><Text style={styles.tableCell}>Motorbike</Text></View>
              <View style={styles.tableColAlt}><Text style={styles.tableCell}>{motorcycleCount}</Text></View>
              <View style={styles.tableColAlt}><Text style={styles.tableCell}>${pricesMotorcycle}</Text></View>
              <View style={styles.tableColAlt}><Text style={styles.tableCell}>${totalMotorbike}</Text></View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableColAlt}><Text style={styles.tableCell}>Electric Bicycle</Text></View>
              <View style={styles.tableColAlt}><Text style={styles.tableCell}>{electricBicycleCount}</Text></View>
              <View style={styles.tableColAlt}><Text style={styles.tableCell}>${pricesElectric}</Text></View>
              <View style={styles.tableColAlt}><Text style={styles.tableCell}>${totalElectric}</Text></View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableColAlt}><Text style={styles.tableCell}>Bicycle</Text></View>
              <View style={styles.tableColAlt}><Text style={styles.tableCell}>{bicycleCount}</Text></View>
              <View style={styles.tableColAlt}><Text style={styles.tableCell}>${pricesBicycle}</Text></View>
              <View style={styles.tableColAlt}><Text style={styles.tableCell}>${totalBicycle}</Text></View>
            </View>
          </View>
          
        </View>
        <View style={styles.section}>
          <Text style={styles.text}>Total Parking : ${totalParking}</Text>
        </View>
       
        <View style={styles.section}>
          <Text style={styles.subtitle}>Total Fee</Text>
          <Text style={styles.text}>Total Amount Due: ${totalmoney}</Text>
        </View>

        <View style={styles.paymentSection}>
          <Text style={styles.subtitle}>Payment Information</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentText}>Bank Account: 123-456-789</Text>
            <Text style={styles.paymentText}>Bank: VietBank</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentText}>Phone: +84 123 456 789</Text>
            <Text style={styles.paymentText}>Address: 123 Nguyen Trai, Hanoi</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.text}>Thank you for your payment!</Text>
        </View>
        
      </Page>
    </Document>
  );
};

export default InvoiceDocument;
