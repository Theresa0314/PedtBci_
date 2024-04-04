import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, InputAdornment, useTheme, } from '@mui/material';
import { DataGrid } from "@mui/x-data-grid";
import Header from "../../components/Header";
import { db } from '../../firebase.config';
import { collection, getDocs } from 'firebase/firestore';
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import { tokens } from '../../theme'; 



const PatientsTable = () => {
  const [patients, setPatients] = useState([]);
  const [searchText, setSearchText] = useState("");


  const theme = useTheme();
  const colors = tokens(theme.palette.mode);


  const handleDownload = () => {
    // Implement download or print functionality
    console.log('Download or print the report');
  };
  
  const isValidDate = (date) => {
    return date instanceof Date && !isNaN(date.getTime());
  };
      const allOutcomes = ["Not Evaluated", "Cured/Treatment Completed", "Treatment Failed", "Died", "Lost to Follow up"];

  const fetchAndProcessData = async () => {
    const periodData = {};


  
     // Initialize all outcomes for each potential period with 0
  const initializeOutcomes = allOutcomes.reduce((acc, outcome) => ({ ...acc, [outcome]: 0 }), {});


    // Fetch and count lab tests
    const testTypes = ['xray', 'mtbrif', 'tst', 'igra', 'dst'];
    for (let type of testTypes) {
      const snapshot = await getDocs(collection(db, type));
      snapshot.forEach((doc) => {
        const data = doc.data();
        const testDate = new Date(data.testDate);
        if (isValidDate(testDate)) {
          const period = `${testDate.toLocaleString('default', { month: 'long' })} ${testDate.getFullYear()}`;
          if (!periodData[period]) {
            periodData[period] = {
              id: period,
              timePeriod: period,
              totalLabTests: 0,
              ongoingTreatmentPlans: 0,
              treatmentOutcomes: allOutcomes.reduce((acc, outcome) => ({ ...acc, [outcome]: 0 }), {}),
            };
          }
          periodData[period].totalLabTests++;
        }
      });
    }
  
    // Fetch and count ongoing treatment plans and outcomes
    const treatmentPlanSnapshot = await getDocs(collection(db, 'treatmentPlan'));
    treatmentPlanSnapshot.forEach((doc) => {
      const data = doc.data();
      const startDate = new Date(data.startDateTP);
      const endDate = data.endDateTP ? new Date(data.endDateTP) : null;
      const outcome = data.outcome || 'Not Evaluated';
      const period = isValidDate(startDate) ? `${startDate.toLocaleString('default', { month: 'long' })} ${startDate.getFullYear()}` : 'Invalid Date';
  
      if (!periodData[period]) {
        periodData[period] = {
          id: period,
          timePeriod: period,
          totalLabTests: 0,
          ongoingTreatmentPlans: 0,
          treatmentOutcomes: { ...initializeOutcomes },
        };
      }
  
      // Count ongoing treatment plans only if they are within the current date and have 'Ongoing' status
      if (data.status === "Ongoing" && (!endDate || endDate > new Date())) {
        periodData[period].ongoingTreatmentPlans++;
      }
  
      // Increment the count for this outcome
      periodData[period].treatmentOutcomes[outcome]++;
    });
  
    // Convert the periodData object into an array and sort it by timePeriod
    const sortedData = Object.values(periodData).sort((a, b) => new Date(a.timePeriod) - new Date(b.timePeriod));
    setPatients(sortedData);
  };
  

useEffect(() => {
 fetchAndProcessData();
}, []);


  const getFilteredRows = () => {
    return searchText
      ? patients.filter((row) => row.fullName.toLowerCase().includes(searchText.toLowerCase()))
      : patients;
  };



  const columns = [
    { field: 'timePeriod', headerName: 'Time Period (Monthly)', width: 200 },
    { field: 'totalLabTests', headerName: 'Total Lab Tests', width: 150 },
    { field: 'ongoingTreatmentPlans', headerName: 'Ongoing Treatment Plans', 
        width: 250,  valueGetter: (params) => params.row.ongoingTreatmentPlans ?? 0 },
{
  field: 'treatmentOutcomes',
  headerName: 'Treatment Outcomes',
  width: 550,
  valueGetter: (params) => {
    const outcomes = params.row.treatmentOutcomes;
    const outcomeStrings = allOutcomes
      .map(outcome => `${outcome}: ${outcomes[outcome]}`)
      .join(', ');

    return outcomeStrings.length > 0 ? outcomeStrings : 'None';
  },
},

  ];

  return (
    <Box m="20px">
      <Header title="Report Generation" subtitle="Summary report" />

            <Box
            sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                p: 2
            }}
            >
            <Button
                onClick={handleDownload}
                sx={{
                backgroundColor: colors.blueAccent[700],
                color: colors.grey[100],
                fontSize: "14px",
                fontWeight: "bold",
                padding: "10px 20px",
                }}
            >
                <DownloadOutlinedIcon sx={{ mr: "10px" }} />
                DOWNLOAD REPORTS
            </Button>
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
          rows={getFilteredRows()}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
        />
      </Box>
    </Box>
  );
};

export default PatientsTable;
