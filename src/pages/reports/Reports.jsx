import React, { useState, useEffect } from 'react';
import { Box, Button,FormControl, InputLabel, Select, MenuItem, useTheme } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import Header from '../../components/Header';
import { db } from '../../firebase.config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import { tokens } from '../../theme';
import PatientDownload from './PatientDownload';
import { pdf } from '@react-pdf/renderer';

const SummaryTable = () => {
  const [reportData, setReportData] = useState([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [timePeriod, setTimePeriod] = useState('monthly');

  const handleTimePeriodChange = (event) => {
    setTimePeriod(event.target.value);
    // Call a function to refetch or reprocess the data based on the new time period
    fetchAndProcessData(event.target.value);
  };

  function calculateAge(birthdate) {
    const birthday = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const m = today.getMonth() - birthday.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
      age--;
    }
    return age;
  }
  
  const fetchDataForReport = async () => {
    const reportData = [];
    const casesSnapshot = await getDocs(collection(db, 'cases'));
  
    for (const caseDoc of casesSnapshot.docs) {
      const caseData = caseDoc.data();
      const startDate = caseData.startDate ? new Date(caseData.startDate).toLocaleDateString() : 'No date';
      
      const patientInfoRef = collection(db, 'patientsinfo');
      const patientInfoQuery = query(patientInfoRef, where('caseNumber', '==', caseData.caseNumber));
      const patientInfoSnapshot = await getDocs(patientInfoQuery);
      
      const patientInfoData = patientInfoSnapshot.docs[0]?.data();
      
      if (patientInfoData) {
        // Calculate age using the birthdate
        const age = patientInfoData.birthdate ? calculateAge(patientInfoData.birthdate) : 'No age';
        let totalLabTests = 0;
  
        // Aggregate the lab tests from different collections
        const labTestTypes = ['igra', 'mtbrif', 'xray', 'tst', 'dst'];
        for (const testType of labTestTypes) {
          const labTestSnapshot = await getDocs(query(collection(db, testType), where('caseNumber', '==', caseData.caseNumber)));
          totalLabTests += labTestSnapshot.size; // Sum up the lab tests
        }
        let ongoingTreatment = 0;
        let treatmentOutcomes = {
          'Not Evaluated': 0,
          'Cured/Treatment Completed': 0,
          'Treatment Failed': 0,
          'Died': 0,
          'Lost to Follow up': 0,
        };
      
        // Fetch and count treatment outcomes and ongoing treatments
        const treatmentPlansSnapshot = await getDocs(query(
          collection(db, 'treatmentPlan'),
          where('caseNumber', '==', caseData.caseNumber)
        ));
      
        treatmentPlansSnapshot.forEach((doc) => {
          const treatmentPlan = doc.data();
          const outcome = treatmentPlan.outcome || 'Not Evaluated';
          treatmentOutcomes[outcome] = (treatmentOutcomes[outcome] || 0) + 1;
      
          if (treatmentPlan.status === 'Ongoing') {
            ongoingTreatment++;
          }
        });
        reportData.push({
          date: startDate,
          age: age,
          gender: patientInfoData.gender,
          totalLabTests: totalLabTests,
          ongoingTreatment: ongoingTreatment,
          treatmentOutcome: treatmentOutcomes,
        });
      } else {
        console.log('No patient info found for caseNumber:', caseData.caseNumber);
      }
    }
    
    // Sort by date after all data has been pushed
    reportData.sort((a, b) => new Date(a.date) - new Date(b.date));
  
    return reportData;
  };
  
  
  
  // Then use this function when triggering the PDF download
  const handleDownload = async () => {
    try {
      const data = await fetchDataForReport();
      console.log(data); // Check the data
      const blob = await pdf(<PatientDownload reportData={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'total-patient-report.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading the report:", error);
    }
  };
  
// Helper function to generate a key based on the selected time period and a date
function generatePeriodKey(date, selectedTimePeriod) {
  switch (selectedTimePeriod) {
    case 'monthly':
      return `${date.getMonth() + 1}-${date.getFullYear()}`;
    case 'quarterly':
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `Q${quarter}-${date.getFullYear()}`;
    case 'yearly':
      return date.getFullYear().toString();
    default:
      return `${date.getMonth() + 1}-${date.getFullYear()}`;
  }
}

// Helper function to get a readable date string
function getReadableDate(date, selectedTimePeriod) {
  switch (selectedTimePeriod) {
    case 'monthly':
      return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    case 'quarterly':
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `Q${quarter} ${date.getFullYear()}`;
    case 'yearly':
      return date.getFullYear().toString();
    default:
      return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  }
}

const fetchAndProcessData = async (selectedTimePeriod) => {
  let summary = {};
  const countedPatients = {};
  const countedLabTests = {}
  const treatmentPlansSnapshot = await getDocs(collection(db, 'treatmentPlan'));
  // Function to ensure we count each lab test only once per period
  const addLabTestToSummary = (labTestDate, caseNumber) => {
    const periodKey = generatePeriodKey(labTestDate, selectedTimePeriod);
    if (!countedLabTests[caseNumber]) {
      countedLabTests[caseNumber] = {};
    }
    if (countedLabTests[caseNumber][periodKey]) {
      return; // This lab test has already been counted for this period
    }
    countedLabTests[caseNumber][periodKey] = true;
    if (!summary[periodKey]) {
      summary[periodKey] = {
        id: periodKey,
        timePeriod: getReadableDate(labTestDate, selectedTimePeriod),
        totalPatients: 0, 
        totalLabTests: 0,
        totalOngoingTreatments: 0, 
        totalTreatmentOutcomes: {
          'Not Evaluated': 0,
          'Cured/Treatment Completed': 0,
          'Treatment Failed': 0,
          'Died': 0,
          'Lost to Follow up': 0,
        },
      };
    }
    summary[periodKey].totalLabTests++;
  };

  // Process lab tests
  const labTestTypes = ['igra', 'mtbrif', 'xray', 'tst', 'dst'];
  for (const testType of labTestTypes) {
    const labTestsSnapshot = await getDocs(collection(db, testType));
    labTestsSnapshot.forEach((doc) => {
      const labTestData = doc.data();
      const labTestDate = labTestData.testDate ? new Date(labTestData.testDate) : null;
      if (labTestDate) {
        addLabTestToSummary(labTestDate, labTestData.caseNumber);
      }
    });
  }
  // Process each treatment plan
  treatmentPlansSnapshot.forEach((doc) => {
    const treatmentData = doc.data();
    // Ensure there is a start date to count the treatment plan
    if (!treatmentData.startDateTP) {
      return; // Skip this treatment plan as it has no start date
    }
    
    const treatmentStartDate = new Date(treatmentData.startDateTP);
    const periodKey = generatePeriodKey(treatmentStartDate, selectedTimePeriod);

    // Mark the patient as counted for this period to avoid double counting
    if (!countedPatients[treatmentData.caseNumber]) {
      countedPatients[treatmentData.caseNumber] = {};
    }
    if (countedPatients[treatmentData.caseNumber][periodKey]) {
      return; // This patient has already been counted for this period
    }
    countedPatients[treatmentData.caseNumber][periodKey] = true;

    // Initialize the summary object for this period if it doesn't exist
    if (!summary[periodKey]) {
      summary[periodKey] = {
        id: periodKey,
        timePeriod: getReadableDate(treatmentStartDate, selectedTimePeriod),
        totalPatients: 0,
        totalLabTests: 0,
        totalOngoingTreatments: 0,
        totalTreatmentOutcomes: {
          'Not Evaluated': 0,
          'Cured/Treatment Completed': 0,
          'Treatment Failed': 0,
          'Died': 0,
          'Lost to Follow up': 0,
        },
      };
    }

    // Increment the patient count for this period
    summary[periodKey].totalPatients++;

    // Update the counts for ongoing treatments and outcomes
    if (treatmentData.status === 'Ongoing') {
      summary[periodKey].totalOngoingTreatments++;
    }
    const outcome = treatmentData.outcome || 'Not Evaluated';
    summary[periodKey].totalTreatmentOutcomes[outcome] = (summary[periodKey].totalTreatmentOutcomes[outcome] || 0) + 1;
  });

  // Include logic for lab tests if necessary, ensuring each lab test is counted once per period based on its own date

  // Convert the summary object into an array for the DataGrid
  setReportData(Object.values(summary).map((item, index) => ({ ...item, id: index })));
};

useEffect(() => {
  fetchAndProcessData(timePeriod);
}, [timePeriod]);

  
  const columns = [
    { field: 'timePeriod', headerName: 'Time Period', width: 100 },
    { field: 'totalPatients', headerName: 'Total Patients', width: 150 },
    { field: 'totalLabTests', headerName: 'Total Lab Tests', width: 150 },
    { field: 'totalOngoingTreatments', headerName: 'Total Ongoing Treatments', width: 200 },
    {
      field: 'totalTreatmentOutcomes',
      headerName: 'Total Treatment Outcomes',
      width: 550,
      valueGetter: (params) => {
        // Transform the outcomes object into a string representation
        const outcomes = params.row.totalTreatmentOutcomes;
        return Object.entries(outcomes)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
      },
    }
    
  ];

  return (
    <Box m="20px">
      <Header title="Report Generation" subtitle="Summary Report" />
      {/* Container for filters and actions */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 2,
        }}
      >
        {/* Container for the time period select */}
        <Box sx={{ minWidth: 120 }}>
          <FormControl fullWidth>
            <InputLabel id="time-period-label">Time Period</InputLabel>
            <Select
              labelId="time-period-label"
              id="time-period-select"
              value={timePeriod}
              label="Time Period"
              onChange={handleTimePeriodChange}
            >
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="quarterly">Quarterly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Container for the download button */}
        <Box>
          <Button
            onClick={handleDownload}
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: '14px',
              fontWeight: 'bold',
              padding: '10px 20px',
            }}
          >
            <DownloadOutlinedIcon sx={{ mr: '10px' }} />
            DOWNLOAD FULL REPORT
          </Button>
        </Box>

      </Box>

      <Box sx={{
        width: "100%",
        height: "35vh",
        overflow: "auto",
        "& .MuiDataGrid-root": {
          border: `1px solid ${colors.primary[700]}`,
          color: colors.grey[100],
          backgroundColor: colors.primary[400],
        },
        "& .MuiDataGrid-columnHeaders": {
          backgroundColor: colors.blueAccent[700],
          color: colors.grey[100],
        },
        "& .MuiDataGrid-cell": {
          borderBottom: `1px solid ${colors.primary[700]}`,
        },
        "& .MuiDataGrid-footerContainer": {
          borderTop: `1px solid ${colors.primary[700]}`,
          backgroundColor: colors.blueAccent[700],
          color: colors.grey[100],
        },
        "& .MuiCheckbox-root": {
          color: colors.greenAccent[200],
        },
        "& .MuiDataGrid-toolbarContainer": {
          color: colors.grey[100],
        },
      }}>



        <DataGrid
          rows={reportData}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
        />
      </Box>
    </Box>
  );
};

export default SummaryTable;
