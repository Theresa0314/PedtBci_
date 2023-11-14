import React, { useState, useEffect } from 'react';
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from '../../theme';
import Header from "../../components/Header";
import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, useTheme, Button, TextField, InputAdornment } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { db } from '../../firebase.config';
import { collection, getDocs } from "firebase/firestore";

const ReferralInfo = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate(); 
  const [referrals, setReferrals] = useState([]);

  const handleAddNewReferral = () => {
    navigate("/referralform");
  };


  // New state for search text
  const [searchText, setSearchText] = useState('');

  // Function to handle the search input change
  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Make sure to target the correct collection name here
        const querySnapshot = await getDocs(collection(db, "referralform"));
        let data = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        // Sort by dateAdded in ascending order if necessary
        data.sort((a, b) => {
          const dateA = new Date(a.dateAdded);
          const dateB = new Date(b.dateAdded);
          return dateA - dateB;
        });
        setReferrals(data);
      } catch (error) {
        console.error("Error fetching referral data: ", error);
      }
    };
  
    fetchData();
  }, []);
  

  const columns = [
    {
      field: 'caseNumber',
      headerName: 'Case Number',
      flex: 1,
    },
    {
      field: 'referringFacilityName',
      headerName: 'Referring Facility/Unit',
      flex: 1,
    },
    {
      field: 'caseStatus',
      headerName: 'Case Status',
      flex: 1,
      renderCell: (params) => {
        // Here you can add more logic to handle different statuses
        let color;
        switch (params.value) {
          case 'Closed':
            color = 'red';
            break;
          case 'Active':
            color = 'green';
            break;
          case 'Pending':
            color = 'orange';
            break;
          default:
            color = 'grey';
        }
        return (
          <Typography style={{ color: color }}>
            {params.value}
          </Typography>
        );
      }
    },
    
    {
      field: 'dateReferred',
      headerName: 'Date Referred',
      flex: 1,
      valueFormatter: (params) => {
        const valueFormatted = new Date(params.value).toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });
        return valueFormatted;
      },
    },
   {
        field: 'action',
        headerName: 'Action',
        flex: 1,
        renderCell: (params) => (
          <Box display="flex" justifyContent="center">
           <Link to={`/referralinfo/${params.id}`} style={{ textDecoration: 'none' }}>
            <Button
              variant="contained"
              style={{
                backgroundColor: colors.greenAccent[600],
                color: colors.grey[100],
              }}
            >
              More Details
            </Button>
            </Link>
          </Box>
        ),
      },
  ];
  

  return (
    <Box m="20px">
    <Header title="Referral Information" subtitle="Managing referral data" />
    <Box sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center', // Align items vertically
      p: 2,
    }}>
      <TextField 
        placeholder="Search Patients" 
        variant="outlined" 
        value={searchText} 
        onChange={handleSearchChange}
        sx={{ width: 550, backgroundColor: colors.blueAccent[700] , marginLeft: theme.spacing(-2) }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      <Button
        variant="contained"
       onClick={handleAddNewReferral}
        style={{ 
          backgroundColor: colors.greenAccent[600],
          color: colors.grey[100],
          height: '50px',
        }}
      >
        Add New Referral 
      </Button>
    </Box>
      <Box sx={{
        height: 400,
        width: '100%',
        '& .MuiDataGrid-root': {
          border: `1px solid ${colors.primary[700]}`,
          color: colors.grey[100],
          backgroundColor: colors.primary[400],
        },
        '& .MuiDataGrid-columnHeaders': {
          backgroundColor: colors.blueAccent[700],
          color: colors.grey[100],
        },
        '& .MuiDataGrid-cell': {
          borderBottom: `1px solid ${colors.primary[700]}`,
        },
        '& .MuiDataGrid-footerContainer': {
          borderTop: `1px solid ${colors.primary[700]}`,
          backgroundColor: colors.blueAccent[700],
          color: colors.grey[100],
        },
      }}>
        <DataGrid
          rows={referrals}
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

export default ReferralInfo;
