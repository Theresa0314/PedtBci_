import React from 'react';
import { Document, Page, Text, View, StyleSheet,Image } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 10,
  },
  tableHeaderRow: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: '5 auto',
    flexDirection: 'row',
  },
  tableCol: {
    width: '10%', 
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableColWide: {
    width: '30%', 
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: 'auto',
    marginTop: 5,
    fontSize: 10,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
});

// Create Document Component
const PatientDownload = ({ reportData, chartImageUrl }) => {
  return (
    <Document>
     <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>Total Patients Report</Text>

        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Date</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Age</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Gender</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Total Lab Tests</Text>
            </View>
            <View style={styles.tableColWide}>
            <Text style={styles.tableCell}>Ongoing Treatment</Text>
          </View>
          <View style={styles.tableColWide}>
            <Text style={styles.tableCell}>Treatment Outcome</Text>
          </View>
          </View>

          {/* Table Rows */}
          {reportData.map((row, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{row.date}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{row.age}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{row.gender}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{row.totalLabTests}</Text>
              </View>
              <View style={styles.tableColWide}>
                <Text style={styles.tableCell}>{row.ongoingTreatment}</Text>
              </View>
              <View style={styles.tableColWide}>
                <Text style={styles.tableCell}>
                  {Object.entries(row.treatmentOutcome).map(([key, value]) => `${key}: ${value}`).join(', ')}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default PatientDownload;
