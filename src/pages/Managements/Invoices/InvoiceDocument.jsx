import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30 },
  section: { marginBottom: 10 },
  title: { fontSize: 20, marginBottom: 10 },
  text: { fontSize: 12 },
});

const InvoiceDocument = ({ user }) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>Invoice for {user.username}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.text}>Room: {user.room}</Text>
        <Text style={styles.text}>Building: {user.building}</Text>
        <Text style={styles.text}>Area: {user.area} m²</Text>
        <Text style={styles.text}>Total Amount: {user.totalmoney} VND</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.text}>Thank you for your payment!</Text>
      </View>
    </Page>
  </Document>
);

export default InvoiceDocument;
