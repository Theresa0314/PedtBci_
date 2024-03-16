import React, { useState, useEffect } from "react";
import {
  DialogActions,
  Typography,
  TextField,
  Button,
  Box,
  InputAdornment,
  Dialog,
  DialogContent,
} from "@mui/material";
import { useTheme } from "@mui/material";
import { GridToolbar, DataGrid } from "@mui/x-data-grid";
import { tokens } from "../theme";
import Header from "../components/Header";
import { db, auth } from "../firebase.config";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  query
} from "firebase/firestore";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PageviewIcon from "@mui/icons-material/Pageview";

const TBMasterlist = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [rows, setRows] = useState([]);
  const screening = ['P', 'A', 'I', 'E'];
  const presumptiveTB = ['DS-TB', 'DR-TB'];


// Load data from Firebase when the component mounts
useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "patientsinfo"));
      const mtbrifSnapshot = await getDocs(collection(db, "mtbrif"));
      const xraySnapshot = await getDocs(collection(db, "xray"));
      const tstSnapshot = await getDocs(collection(db, "tst"));
      const diagnosisSnapshot = await getDocs(collection(db, "diagnosis"));

      const mtbrifData = mtbrifSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const xrayData = xraySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const tstData = tstSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const diagnosisData = diagnosisSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const rows = querySnapshot.docs.map((doc, index) => {
        const docData = doc.data();
        const consultDate = new Date(docData.dateAdded).toLocaleDateString();
        const dob = docData.birthdate;
        const caseNumber = docData.caseNumber;
        const age = calculateAge(dob); // Calculate age
        

        const fullAddress = combineAddress(docData.houseNameBlockStreet, doc.data().barangay, doc.data().city, doc.data().province, doc.data().parentContactNumber);
        const referringDetails = combineReferring(docData.referringFacilityName, doc.data().dotsStaffName);
        const screeningValue = screening[index % screening.length];
        const presumptiveTBValue = index % 9 === 0 ? presumptiveTB[1] : presumptiveTB[0];
        const mtbrifItem = mtbrifData.find(mtbrif => mtbrif.caseNumber === docData.caseNumber);
        const xrayItem = xrayData.find(xray => xray.caseNumber === docData.caseNumber);
        const tstItem = tstData.find(tst => tst.caseNumber === docData.caseNumber);
        const diagnosisItem = diagnosisData.find(diagnosis => diagnosis.caseNumber === docData.caseNumber);

        return {
          id: doc.id,
          ...docData,
          consultDate,
          age, 
          fullAddress,
          referringDetails,
          screening: screeningValue,
          presumptiveTB: presumptiveTBValue,
          mtbInfo: mtbrifItem ? `${mtbrifItem.testResult}, ${mtbrifItem.testDate}` : 'N/A',
          xrayInfo: xrayItem ? `${xrayItem.testResult}, ${xrayItem.testDate}` : 'N/A',
          tstInfo: tstItem ? `${tstItem.testResult}, ${tstItem.testDate}` : 'N/A',
          diagnosisDate: diagnosisItem ? `${diagnosisItem.testDate}` : 'N/A',

          diagnosisRemark: diagnosisItem ? `${diagnosisItem.remarks}` : 'N/A',
        };
      });
      setRows(rows);
    };
    fetchData();
  }, []);

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const combineAddress = (houseNameBlockStreet, barangay, city, province, contact) => {
    return `${houseNameBlockStreet}, ${barangay}, ${city}, ${province}, ${contact}`;
  };

  const combineReferring = (referringFacilityName, dotsStaffName) => {
    return `${referringFacilityName}, ${dotsStaffName}`;
  };


  const columns = [
    {
      field: 'consultDate',
      headerName: "Date of Consult",
      flex: 1,
    },
    {
      field: 'fullName',
      headerName: "Patient's Full Name",
      flex: 1,
    },
    {
      field: 'age',
      headerName: "Age",
      flex: 0.5,
    },
    {
        field: 'gender',
        headerName: "Sex",
        flex: 0.5,
    },
    {
        field: 'fullAddress',
        headerName: "Complete Address and Contact Number",
        flex: 1.5,
    },
    {
        field: 'referringDetails',
        headerName: "Name of Referring Facility/ Health worker",
        flex: 1,
    },
    {
        field: 'screening',
        headerName: "Mode of Screening",
        flex: 0.5,
    },
    {
        field: 'presumptiveTB',
        headerName: "Presumptive TB",
        flex: 0.5,
    },
    {
        field: 'mtbInfo',
        headerName: "Sputum Examination",
        flex: 0.5,
    },
    {
        field: 'xrayInfo',
        headerName: "Chest X-ray",
        flex: 0.5,
    },
    {
        field: 'tstInfo',
        headerName: "Turbelin Skin Test",
        flex: 0.5,
    },
    {
        field: 'diagnosisDate',
        headerName: "Diagnosis",
        flex: 0.5,
    },
    {
        field: 'reasonForReferral',
        headerName: "Action Taken/ Referred To and Status",
        flex: 1,
    },
    {
        field: 'diagnosisRemark',
        headerName: "Remarks",
        flex: 0.5,
    },
  ];

  return (
    <Box m="20px">
      <Header
        title="Presumptive TB Masterlist"
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
        }}
      >
    
      </Box> 
      <Box
        sx={{
          width: "100%",
          height: "70vh", // Set the height to 70% of the viewport height or adjust as needed
          overflow: "auto", // Enable scrolling if content overflows
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
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
          disableColumnResize={false}
          
        />

        
      </Box>
    </Box>
  );
};

export default TBMasterlist;
