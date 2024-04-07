import React, { useState, useEffect } from 'react';
import { Box, Button,FormControl, InputLabel, Select, MenuItem, useTheme } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import Header from '../../components/Header';
import { db } from '../../firebase.config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import { tokens } from '../../theme';

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

  const handleDownload = () => {
    console.log('Download or print the report');
  };

  const initialSummaryStructure = {
    totalPatients: 0,
    totalLabTests: 0,
    totalOngoingTreatments: 0,
    totalTreatmentOutcomes: {
      'Not Evaluated': 0,
      'Cured/Treatment Completed': 0,
      'Treatment Failed': 0,
      'Died': 0,
      'Lost to Follow up': 0
    },
  };
  
  const fetchAndProcessData = async (selectedTimePeriod) => {
    const casesSnapshot = await getDocs(collection(db, 'cases'));
    let summary = {};
  
    // Define the lab test types we want to count
    const labTestTypes = ['igra', 'mtbrif', 'xray', 'tst', 'dst'];
  
    for (const caseDoc of casesSnapshot.docs) {
      const caseData = caseDoc.data();
      const caseStartDate = new Date(caseData.startDate);
      let key;
      let readableDate;
  
      // Your switch statement for generating the key and readableDate
      switch (selectedTimePeriod) {
        case 'monthly':
          readableDate = caseStartDate.toLocaleString('default', { month: 'long', year: 'numeric' });
          key = `${caseStartDate.getMonth() + 1}-${caseStartDate.getFullYear()}`;
          break;
        case 'quarterly':
          const quarter = Math.floor((caseStartDate.getMonth() / 3)) + 1;
          readableDate = `Q${quarter} - ${caseStartDate.getFullYear()}`;
          key = `Q${quarter}-${caseStartDate.getFullYear()}`;
          break;
        case 'yearly':
          readableDate = caseStartDate.getFullYear().toString();
          key = caseStartDate.getFullYear().toString();
          break;
        default:
          readableDate = caseStartDate.toLocaleString('default', { month: 'long', year: 'numeric' });
          key = `${caseStartDate.getMonth() + 1}-${caseStartDate.getFullYear()}`;
      }
  
      // Initialize the summary object for the new key if it doesn't exist
      if (!summary[key]) {
        summary[key] = {
          id: key,
          timePeriod: readableDate,
          ...initialSummaryStructure
        };
      }
  
      // This loop will iterate over each treatment plan related to the current case
      const treatmentPlansQuery = query(collection(db, 'treatmentPlan'), where('caseNumber', '==', caseData.caseNumber));
      const treatmentPlansSnapshot = await getDocs(treatmentPlansQuery);
  
      treatmentPlansSnapshot.forEach((treatmentDoc) => {
        const treatmentData = treatmentDoc.data();
        // Increment the patient count for this specific time period based on treatment start date
        summary[key].totalPatients++;
  
        // Count ongoing treatments and categorize outcomes
        if (treatmentData.status === 'Ongoing') {
          summary[key].totalOngoingTreatments++;
        }
  
        const outcome = treatmentData.outcome || 'Not Evaluated';
        summary[key].totalTreatmentOutcomes[outcome]++;
      });
  
      // Now, handle the lab test count
      for (const testType of labTestTypes) {
        const labTestSnapshot = await getDocs(query(collection(db, testType), where('caseNumber', '==', caseData.caseNumber)));
        summary[key].totalLabTests += labTestSnapshot.size;
      }
    }
  
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
            DOWNLOAD REPORTS
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
