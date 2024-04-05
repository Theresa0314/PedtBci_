import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, InputAdornment, useTheme, } from '@mui/material';
import { DataGrid } from "@mui/x-data-grid";
import Header from "../../components/Header";
import { db } from '../../firebase.config';
import {
  doc,
  collection,
  getDoc,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import { tokens } from '../../theme'; 
import { differenceInYears } from 'date-fns'; 


const PatientsTable = () => {
  const [patients, setPatients] = useState([]);
  const [searchText, setSearchText] = useState("");

  // Make sure `allOutcomes` is defined at the top level of your component
  const allOutcomes = ["Not Evaluated", "Cured/Treatment Completed", "Treatment Failed", "Died", "Lost to Follow up"];
  const initializeOutcomes = () => {
    return allOutcomes.reduce((acc, outcome) => {
      acc[outcome] = 0;
      return acc;
    }, {});
  };


  const theme = useTheme();
  const colors = tokens(theme.palette.mode);


  const handleDownload = () => {
    // Implement download or print functionality
    console.log('Download or print the report');
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

  
  
const fetchAndProcessData = async () => {
  const patientSnapshot = await getDocs(collection(db, 'patientsinfo'));
  const patientData = [];

  for (const patientDoc of patientSnapshot.docs) {
    const patient = patientDoc.data();
    const patientRecord = {
      id: patientDoc.id,
      age: patient.birthdate ? calculateAge(patient.birthdate) : 'Unknown', 
      gender: patient.gender || 'Unknown',
      totalLabTests: 0,
      ongoingTreatmentPlans: 0,
      treatmentOutcomes: initializeOutcomes(),
    };

    // Aggregate the lab tests from different collections
    const labTestTypes = ['igra', 'mtbrif', 'xray', 'tst', 'dst'];
    for (const testType of labTestTypes) {
      const labTestSnapshot = await getDocs(query(collection(db, testType), where('caseNumber', '==', patient.caseNumber)));
      patientRecord.totalLabTests += labTestSnapshot.size; // Sum up the lab tests
    }

    // Fetch and count treatment outcomes
    const treatmentPlansSnapshot = await getDocs(query(
      collection(db, 'treatmentPlan'),
      where('caseNumber', '==', patient.caseNumber)
    ));

    treatmentPlansSnapshot.forEach((doc) => {
      const treatmentPlan = doc.data();
      const outcome = treatmentPlan.outcome || 'Not Evaluated';
      patientRecord.treatmentOutcomes[outcome]++;
    });

    patientRecord.ongoingTreatmentPlans = treatmentPlansSnapshot.docs.filter(doc => doc.data().status === 'Ongoing').length;

    patientData.push(patientRecord);
  }

  setPatients(patientData);
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
    { field: 'age', headerName: 'Age', width: 100 },
    { field: 'gender', headerName: 'Gender', width: 100 },
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
