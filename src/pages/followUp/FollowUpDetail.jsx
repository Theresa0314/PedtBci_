import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { db } from "../../firebase.config";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
//import EditIcon from "@mui/icons-material/Edit";
import PageviewIcon from "@mui/icons-material/Pageview";
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

const FollowUpDetail = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [rows, setRows] = useState([]);

// Load data from Firebase when the component mounts
useEffect(() => {
  const fetchData = async () => {
    const querySnapshot = await getDocs(collection(db, 'treatmentPlan'));
    const loadedData = new Map(); // Using a Map to ensure unique keys

    querySnapshot.forEach((doc) => {
      doc.data().followUpDates.forEach((followUpDate, index) => {
        const data = doc.data();
        const date = followUpDate.date?.toDate();
        const dateString = date?.toLocaleString();

        
        // Create a composite key using the document ID and the index
        const compositeKey = `${doc.id}-${index}`;
        loadedData.set(compositeKey, {
          id: compositeKey,
          caseNumber: data.caseNumber,
          date: dateString,
          status: followUpDate.status,
        });
      });
    });
    
    setRows(Array.from(loadedData.values())); // Convert Map values to an array
  };

  fetchData();
}, []);
console.log(doc.data().followUpDates);
//Update Status
// const updateTreatmentPlan = async (compositeKey, newStatus) => {
//   const [docId] = compositeKey.split('-'); // Extract the document ID from the composite key
//   const documentRef = doc(collection(db, 'treatmentPlan'), docId);

//   // Update the status in the document
//   await updateDoc(documentRef, {
//     'followUpDates.status': newStatus, // Make sure to use the correct field path
//   });
// };

// const handleStatusChange = (compositeKey, newStatus) => {
//   updateTreatmentPlan(compositeKey, newStatus);
// };

  const columns = [
    {
      field: 'caseNumber',
      headerName: "Case Number",
      flex: 1,
    },
    {
      field: 'date',
      headerName: "Follow-Up Date",
      flex: 1,
    },
    {
      field: 'status',
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <Typography
          style={{
            color:
              params.value === "Missed"
                ? colors.redAccent[400]
                : colors.greenAccent[400],
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "action",
      headerName: "Action",
      flex: 2,
      renderCell: (params) => (



        <Box display="flex" justifyContent="center">
          <Button
            startIcon={<PageviewIcon />}
          //  onClick={() => handleViewDetails(params.id)}
            variant="contained"
            color="primary"
            style={{ marginRight: 8 }}
          >
            View
          </Button>
            <>
          {/* Completed */}
              <IconButton
             // onClick={() => handleStatusChange(params.row.id, 'Completed')}
                variant="contained"
                color="success"
                style={{ marginRight: 8 }}
              >
                 <CheckIcon />
              </IconButton>
          {/* Missed */}
              <IconButton
             // onClick={() => handleStatusChange(params.row.id, 'Missed')}
                variant="contained"
                color="error"
                style={{ marginRight: 8 }}
              >
                 <CloseIcon />
              </IconButton>
            </>
        </Box>
      ),
      width: 300,
    },
  ];

  return (
    <Box m="20px">
      <Header
        title="Follow Up List"
        subtitle="Managing Patient Follow Ups"
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
          disableSelectionOnClick
          sortingMode="client"
        />

        
      </Box>
    </Box>
  );
};

export default FollowUpDetail;
