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

const Inventory = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

   const [rows, setRows] = useState([]);
   const drugNames = {
    'H': 'Isoniazid',
    'R': 'Rifampicin',
    'Z': 'Pyrazinamide',
    'E': 'Ethambutol'
  };

// Load data from Firebase when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, "treatmentPlan"));
      const doses = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.dosageT) {
          for (const [drug, dose] of Object.entries(data.dosageT)) {
            if (doses[drug]) {
              doses[drug] += dose;
            } else {
              doses[drug] = dose;
            }
          }
        }
      });
      const newRows = Object.entries(doses).map(([drug, dose], index) => ({ id: index, drug, name: drugNames[drug] || 'Unknown', dose }));
      setRows(newRows);
    };

    fetchData();
  }, []);

  const columns = [
    {
      field: 'drug',
      headerName: "Acronym",
      flex: 1,
    },
    {
      field: 'name',
      headerName: "Name",
      flex: 1,
    },
    {
      field: 'dose',
      headerName: "Total Dose",
      flex: 1,
      renderCell: (params) => (
        <Typography
          style={{
            color:
              params.value === "0"
                ? colors.redAccent[400]
                : colors.greenAccent[400],
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    // {
    //   field: "quantity",
    //   headerName: "Total Quantity for Intensive Phase",
    //   flex: 2,
    //   renderCell: (params) => (
    //     <Typography
    //       style={{
    //         color:
    //           params.value === "0"
    //             ? colors.redAccent[400]
    //             : colors.greenAccent[400],
    //       }}
    //     >
    //       {params.value}
    //     </Typography>
    //   ),
    // },
    // {
    //   field: "quantity",
    //   headerName: "Total Quantity for Continuation Phase",
    //   flex: 2,
    //   renderCell: (params) => (
    //     <Typography
    //       style={{
    //         color:
    //           params.value === "0"
    //             ? colors.redAccent[400]
    //             : colors.greenAccent[400],
    //       }}
    //     >
    //       {params.value}
    //     </Typography>
    //   ),
    // },
  ];

  return (
    <Box m="20px">
      <Header
        title="Clinical Inventory"
        subtitle="Managing TB drug inventory data"
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

export default Inventory;
